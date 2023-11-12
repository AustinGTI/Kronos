import {Duration, SegmentTypes, SegmentType, Session} from "../../../../globals/types/main";
import React from "react";

/**
 * * THE FUNCTIONING OF THE TIMER
 * * .........................
 * 1. The timer is initialized with a list of segments, each with an initial increment and a segment type,
 * This list of segments is entered into the segments_remaining array and is inverted such that the first segment
 * in the array is at the end of the list and the last segment in the array is at the beginning of the list. The time_elapsed
 * is set to 0 and the is_running flag is set to false.
 *
 * 2. When the user clicks the start button, the is_running flag is set to true and the timer starts counting up both in the
 * segments_remaining array and the time_elapsed variable. In the remaining segments array, the elapsed increment of the
 * segment at the end of the list is incremented by 1. In the time_elapsed variable, the time is incremented by 1 each second.
 *
 * 3. When the user clicks the pause button, the is_running flag is set to false and the timer stops counting up.
 *
 * 4. When a segment ends, that is, its elapsed increment is more than or equal to its initial increment, its alert is displayed
 * while it keeps counting up. When the user clicks the ok button on the alert, the segment is removed from the segments_remaining
 * array and added to the segments_completed array. The next segment in the segments_remaining array is then started.
 * Pause cannot be clicked while an alert is being displayed.
 *
 * 5. When all segments have been completed, the timer stops counting up and the is_running flag is set to false. An alert is
 * displayed to the user to notify them that the timer has ended. The finished timer state is used to record the session and then
 * the timer is reset. The same flow happens when the user clicks the stop button but the alert is different.
 *
 */

interface TimerAlertProps {
    is_open: boolean,
    title: string,
    description: string,
}

export interface TimerSegment {
    key: React.Key,
    initial_duration: number, // in seconds
    elapsed_duration: number, // in seconds
    segment_type: SegmentType,
    on_complete_alert_props: TimerAlertProps
}

export interface TimerState {
    segments_state: {
        segments_completed: TimerSegment[],
        segments_remaining: TimerSegment[]
    },
    timing_state: {
        is_running: boolean,
        elapsed_time: number, // the time elapsed since the timer started in seconds
        active_time: number, // the time elapsed since the timer started in which the timer was running in seconds since the timer started in which the timer was running in secondssince the timer started in which the timer was running in secondssince the timer started in which the timer was running in seconds
        // the estimated actual time based on the elapsed time and the exact time when the session started,
        // is used to updated the session with accurate timings if the user leaves the app by comparing it to the actual time
        estimated_time: Date,

    },
    info_state: {
        on_stop_alert_props: TimerAlertProps
    }
}

export function durationToTimerState(duration: Duration): TimerState {
    const timer_segments: TimerSegment[] = duration.segments.map((segment, index) => {
        const on_complete_alert_props: TimerAlertProps = {
            is_open: false,
            title: '',
            description: ''
        }
        // if the segment is the last segment, then the user needs to be informed that the entire increment has been completed
        if (index === duration.segments.length - 1) {
            on_complete_alert_props.title = 'Pomodoro Session Completed'
            on_complete_alert_props.description = 'Congratulations, this pomodoro session has been successfully completed! Click OK to record this session.'
        } else {
            // if the segment is a focus segment, then the user needs to be informed that it is time for a break
            if (segment.type.name === SegmentTypes.FOCUS.name) {
                on_complete_alert_props.title = 'Time for a break!'
                // get the increment of the next segment (which is a break segment)
                const break_duration = duration.segments[index + 1].duration
                on_complete_alert_props.description = `Take a ${break_duration} minute break to get some rest. Click OK to start the break.`
            } else if (segment.type.name === SegmentTypes.BREAK.name) {
                // if the segment is a break segment, then the user needs to be informed that it is time to focus
                on_complete_alert_props.title = 'Break is over!'
                // get the increment of the next segment (which is a focus segment)
                const focus_duration = duration.segments[index + 1].duration
                on_complete_alert_props.description = `Time to focus again for ${focus_duration} minutes. Click OK to start focusing.`
            } else {
                throw new Error(`Invalid segment type ${segment.type.name}`)
            }
        }

        return {
            key: index,
            initial_duration: segment.duration * 60,
            elapsed_duration: 0,
            segment_type: segment.type,
            on_complete_alert_props: on_complete_alert_props
        }
    })
    return {
        segments_state: {
            segments_completed: [],
            // reverse of the timer_segments array
            segments_remaining: timer_segments.sort((a, b) => a.key > b.key ? -1 : 1)
        },
        timing_state: {
            is_running: false,
            elapsed_time: 0,
            active_time: 0,
            estimated_time: new Date()
        },
        info_state: {
            // when the timer is stopped before the entire increment is completed, the user needs to be informed that the session
            // will be recorded as incomplete
            on_stop_alert_props: {
                is_open: false,
                title: 'Session is unfinished!',
                description: 'Are you sure you want to stop the timer? This session will be recorded as incomplete, Click OK to confirm this action.'
            }
        }
    }
}

export enum TimerStateActionTypes {
    START_TIMER = 'START_TIMER',
    RESUME_TIMER = 'RESUME_TIMER',
    PAUSE_TIMER = 'PAUSE_TIMER',
    INCREMENT_TIMER = 'INCREMENT_TIMER',
    COMPLETE_SEGMENT = 'COMPLETE_SEGMENT',
    STOP_TIMER = 'STOP_TIMER',
}

interface StartTimerAction {
    type: TimerStateActionTypes.START_TIMER,
    payload: Duration
}

interface ResumeTimerAction {
    type: TimerStateActionTypes.RESUME_TIMER,
    payload: null
}

interface PauseTimerAction {
    type: TimerStateActionTypes.PAUSE_TIMER,
    payload: null
}

interface IncrementTimerAction {
    type: TimerStateActionTypes.INCREMENT_TIMER,
    payload: number // amount of time to increment by in seconds
}

interface CompleteSegmentAction {
    type: TimerStateActionTypes.COMPLETE_SEGMENT,
    payload: null
}

interface StopTimerAction {
    type: TimerStateActionTypes.STOP_TIMER,
    payload: null
}

export type TimerStateActions =
    StartTimerAction
    | ResumeTimerAction
    | PauseTimerAction
    | IncrementTimerAction
    | CompleteSegmentAction
    | StopTimerAction

export function timerStateReducer(state: TimerState | null, action: TimerStateActions): TimerState | null {
    const {type, payload} = action
    // if the state is null
    if (state === null) {
        // if the action is to generate a timer state
        if (type === TimerStateActionTypes.START_TIMER) {
            const timer_state = durationToTimerState(payload)
            //set running to true
            timer_state.timing_state.is_running = true
            console.log('new timing state is', timer_state)
            return timer_state
        } else {
            throw new Error(`Invalid action ${type} for null state`)
        }
    }

    state = state as TimerState

    switch (type) {
        case TimerStateActionTypes.START_TIMER:
            throw Error('Cannot start timer that has already started')

        case TimerStateActionTypes.RESUME_TIMER:
            return {
                ...state,
                timing_state: {
                    ...state.timing_state,
                    is_running: true
                }
            }
        case TimerStateActionTypes.PAUSE_TIMER:
            return {
                ...state,
                timing_state: {
                    ...state.timing_state,
                    is_running: false
                }
            }
        case TimerStateActionTypes.INCREMENT_TIMER:
            const increment = (payload as number)
            console.log('the increment on this run of increment timer is',increment)
            const active_segment_type = state.segments_state.segments_remaining[state.segments_state.segments_remaining.length - 1].segment_type
            // if the timer is running, elapsed time,active time and the segment time should be incremented
            // if not, only the elapsed time should be incremented
            if (state.timing_state.is_running) {
                return {
                    ...state,
                    timing_state: {
                        ...state.timing_state,
                        elapsed_time: state.timing_state.elapsed_time + increment,
                        active_time: state.timing_state.active_time + (active_segment_type.persists_on_app_close ? increment : 1),
                        estimated_time: new Date(state.timing_state.estimated_time.getTime() + increment*1000)
                    },
                    segments_state: {
                        ...state.segments_state,
                        // increment the elapsed increment of the segment at the end of the list
                        segments_remaining: state.segments_state.segments_remaining.map((segment, index) => {
                            state = state as TimerState // ! without this line for some reason, the compiler will complain that state might be null though it has been casted to TimerState
                            if (index === state.segments_state.segments_remaining.length - 1) {
                                console.log('incrementing segment', segment, 'at index', index)
                                // increase the elapsed increment, if the elapsed increment is more than the initial increment, set the alert modal open state to true
                                return {
                                    ...segment,
                                    elapsed_duration: segment.elapsed_duration + (active_segment_type.persists_on_app_close ? increment : 1),
                                    on_complete_alert_props: {
                                        ...segment.on_complete_alert_props,
                                        is_open: segment.elapsed_duration + (active_segment_type.persists_on_app_close ? increment : 1) >= segment.initial_duration
                                    }
                                }
                            } else {
                                return segment
                            }
                        })
                    }
                }
            } else {
                return {
                    ...state,
                    timing_state: {
                        ...state.timing_state,
                        elapsed_time: state.timing_state.elapsed_time + increment,
                        estimated_time: new Date(state.timing_state.estimated_time.getTime() + increment*1000)
                    }
                }
            }

        case TimerStateActionTypes.COMPLETE_SEGMENT:
            // pop the last segment from the segments_remaining array and add it to the segments_completed array
            return {
                ...state,
                segments_state: {
                    ...state.segments_state,
                    segments_completed: [...state.segments_state.segments_completed, state.segments_state.segments_remaining[state.segments_state.segments_remaining.length - 1]],
                    segments_remaining: state.segments_state.segments_remaining.slice(0, state.segments_state.segments_remaining.length - 1)
                }
            }
        case TimerStateActionTypes.STOP_TIMER:
            return null

        default:
            throw new Error('Invalid action')
    }
}
