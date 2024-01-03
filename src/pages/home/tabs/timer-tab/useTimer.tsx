import React from 'react'
import {TimerStateActionTypes, timerStateReducer} from "./timer_state";
import {Activity, Duration, SegmentTypes, Session} from "../../../../globals/types/main";
import {endSession, incrementSessionSegment, startSession} from "../../../../globals/redux/reducers/sessionsReducer";
import {incrementActivityStatsValidation} from "../../../../globals/redux/validators/activityValidators";
import {ValidationStatus} from "../../../../globals/redux/types";
import {incrementActivitySessions, incrementActivityTime} from "../../../../globals/redux/reducers/activitiesReducer";
import {useDispatch, useSelector} from "react-redux";
import timerTabSelector from "../../../../globals/redux/selectors/timerTabSelector";
import {KronosPageContext, ModalType} from "../../../../globals/components/wrappers/KronosPage";
import KronosAlert, {AlertModalProps} from "../../../../globals/components/wrappers/KronosAlert";
import {Audio} from 'expo-av'
import useTimerNotifications from "./useBackgroundTimer";
import {AppState} from "react-native";


export enum TimerStatus {
    OFF = 'OFF',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    DONE = 'DONE'
}


/**
 * a hook to hold all the obfuscated timer logic and simply return the required functions for
 * running the timer from the UI
 */
export default function useTimer(timer_activity: Activity | null, timer_duration: Duration | null) {
    const dispatch = useDispatch()
    const timer_interval_ref = React.useRef<number | null>(null)

    const app_state = useSelector(timerTabSelector)
    const [timer_state, updateTimerState] = React.useReducer(timerStateReducer, null)

    const on_segment_done_sound = React.useRef<Audio.Sound | null>(null);
    const on_session_done_sound = React.useRef<Audio.Sound | null>(null);

    const active_notification_id = React.useRef<string | null>(null);

    const [session_id, setSessionId] = React.useState<number | null>(null)

    const {
        modal_props: {
            openModal
        }
    } = React.useContext(KronosPageContext)

    const {scheduleNotification, cancelNotification} = useTimerNotifications()

    // Region TIMER CALLBACKS
    // ? ........................
    const startTimer = React.useCallback(() => {
        if (!timer_duration || !timer_activity) {
            throw new Error('Cannot start timer if duration or activity is not set')
        }
        updateTimerState({
            type: TimerStateActionTypes.START_TIMER, payload: timer_duration
        })
        const start_time = new Date()
        const session: Session = {
            id: start_time.getTime(),
            activity_id: timer_activity!.id,
            duration_id: timer_duration!.id,
            start_time: start_time.toISOString(),
            is_ongoing: true,
            end_time: null,
            segments: []
        }
        setSessionId(session.id)
        dispatch(startSession(session))
        // increment the activity stats
        if (incrementActivityStatsValidation(app_state, timer_activity!.id).status === ValidationStatus.SUCCESS) {
            dispatch(incrementActivitySessions({activity_id: timer_activity!.id}))
        }
    }, [timer_duration, timer_activity, dispatch, updateTimerState, setSessionId, app_state])

    const pauseTimer = React.useCallback(() => {
        if (!timer_state?.timing_state.is_running) {
            throw new Error('Cannot pause if timer is not running')
        }
        updateTimerState({
            type: TimerStateActionTypes.PAUSE_TIMER, payload: null
        })
    }, [timer_state?.timing_state.is_running, updateTimerState])

    const resumeTimer = React.useCallback(() => {
        if (timer_state?.timing_state.is_running) {
            throw new Error('Cannot resume if timer is running')
        }
        updateTimerState({
            type: TimerStateActionTypes.RESUME_TIMER, payload: null
        })
    }, [timer_state?.timing_state.is_running, updateTimerState])

    /**
     * it is assumed that when the timer stops, the session is not yet complete as a complete session stops
     * automatically
     */
    const stopTimer = React.useCallback(() => {
        const alert_props: AlertModalProps = {
            title: 'Session is unfinished!',
            description: 'Are you sure you want to stop the timer? This session will be recorded as incomplete, Click OK to confirm this action.',
            with_cancel_button: true,
            buttons: [{
                label: 'OK',
                onPress: (closeAlert) => {
                    updateTimerState({
                        type: TimerStateActionTypes.STOP_TIMER, payload: null
                    })
                    const end_time = new Date()
                    dispatch(endSession({
                        session_id: session_id!,
                        end_time: end_time.toISOString()
                    }))
                    setSessionId(null)
                    closeAlert()
                }
            }]
        }
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: alert_props
        })
    }, [dispatch, session_id, updateTimerState, setSessionId, openModal])

    const incrementTimer = React.useCallback(() => {
        if (!session_id) {
            throw new Error('Cannot increment timer if session is not set')
        }
        if (!timer_state) {
            throw new Error('Cannot increment timer if timer state is not set')
        }
        // get the difference between the estimated time and the actual time to determine the elapsed time since the timer state update
        const time_difference = Math.round((new Date().getTime() - timer_state.timing_state.estimated_time.getTime()) / 1000)


        updateTimerState({
            type: TimerStateActionTypes.INCREMENT_TIMER, payload: time_difference
        })

        // get the amount of times 60s is crossed to determine the number of session increments needed in storage
        const session_increments = Math.floor(((timer_state.timing_state.elapsed_time % 60) + time_difference) / 60)

        // at every 60 sec interval, increment the session as well
        if (session_increments > 0) {
            // if the timer is running, increment with the active segment
            if (timer_state.timing_state.is_running) {
                const segments_remaining = timer_state.segments_state.segments_remaining
                dispatch(incrementSessionSegment({
                    session_id: session_id!,
                    // the active segment is the last segment in the array
                    segment_type: segments_remaining[segments_remaining.length - 1].segment_type,
                    increment: session_increments
                }))
                // the activity also records the session stats (number of sessions, duration)
                if (incrementActivityStatsValidation(app_state, timer_activity!.id).status === ValidationStatus.SUCCESS) {
                    dispatch(incrementActivityTime({activity_id: timer_activity!.id, increment: session_increments}))
                }
            } else {
                // otherwise, increment with the PAUSE segment
                dispatch(incrementSessionSegment({
                    session_id: session_id!,
                    segment_type: SegmentTypes.PAUSE,
                    increment: session_increments
                }))
            }
        }
        // if the active segment elapsed time, is higher than the initial time, then the segment is complete, set modal is open to true
    }, [session_id, timer_state, dispatch, updateTimerState])

    const playSoundOnSegmentDone = React.useCallback(async () => {
        const {sound} = await Audio.Sound.createAsync(require('../../../../../assets/sounds/on_segment_complete.wav'))
        if (!on_segment_done_sound.current) {
            on_segment_done_sound.current = sound
        }
        await sound.playAsync()
    }, []);

    const playSoundOnSessionDone = React.useCallback(async () => {
        const {sound} = await Audio.Sound.createAsync(require('../../../../../assets/sounds/on_session_complete.wav'))
        if (!on_session_done_sound.current) {
            on_session_done_sound.current = sound
        }
        await sound.playAsync()
    }, []);


    // Region MEMOS
    // ? ........................

    const active_segment = React.useMemo(() => {
        if (!timer_state) {
            return null
        } else {
            return timer_state.segments_state.segments_remaining[timer_state.segments_state.segments_remaining.length - 1]
        }
    }, [timer_state])

    // ? ........................
    // End ........................


    // Region EFFECTS
    // ? ........................

    // unload sounds on unmount
    React.useEffect(() => {
        return () => {
            on_segment_done_sound.current?.unloadAsync()
            on_session_done_sound.current?.unloadAsync()
        }
    }, []);

    // when app is running in the background, schedule a notification for the end of the current segment or session
    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background') {
                console.log('app is in the background')
                // check that the timer is running and that the timer state is set
                if (timer_state?.timing_state.is_running) {
                    // the notification should be scheduled for the end of the active segment which would be the current datetime + (initial_duration - elapsed_duration)
                    const end_time = new Date()
                    end_time.setSeconds(end_time.getSeconds() + (active_segment!.initial_duration - active_segment!.elapsed_duration))
                    // if the active segment is the last segment left, schedule a notification for the end of the session
                    if (timer_state.segments_state.segments_remaining.length === 1) {
                        console.log('about to set notification for session end')
                        scheduleNotification('Session is done!', '', end_time).then((id: string) => {
                            active_notification_id.current = id
                        })
                    } else {
                        // otherwise, schedule a notification for the end of the active segment
                        // if it is a focus segment, the title should be 'Time for a break!'
                        // else  'Focus time!'
                        const title = active_segment!.segment_type === SegmentTypes.FOCUS ? 'Time for a break!' : 'Focus time!'
                        console.log('about to set notification for segment end')
                        scheduleNotification(title, 'Return to the app to start the timer', end_time).then((id) => {
                            active_notification_id.current = id
                        })
                    }
                } else {
                    console.log('timer is not running, no need to schedule notification')
                }
            } else {
                console.log('app is in the foreground')
                // if the app is not in the background, cancel the notification if it is set
                if (active_notification_id.current) {
                    cancelNotification(active_notification_id.current).then(() => {
                        console.log('cancelled notification with id ', active_notification_id.current)
                        active_notification_id.current = null
                    })
                }
            }
        })

        return () => {
            subscription.remove()
        }
    }, [timer_state?.timing_state.is_running, active_segment, timer_state?.segments_state.segments_remaining.length, scheduleNotification, cancelNotification]);

    React.useEffect(() => {
        if (timer_state) {
            timer_interval_ref.current = window.setInterval(incrementTimer, 1000)
        } else {
            window.clearInterval(timer_interval_ref.current!)
            timer_interval_ref.current = null
        }
        return () => {
            window.clearInterval(timer_interval_ref.current!)
        }
    }, [timer_state, incrementTimer])

    // if the timer_state is set, set the alert props to the on_complete_alert_props of the active
    // segment
    React.useEffect(() => {
        const is_last_segment = timer_state?.segments_state.segments_remaining.length === 1

        if (active_segment?.on_complete_alert_props.is_open) {
            const alert_props: AlertModalProps = {
                title: active_segment.on_complete_alert_props.title,
                description: active_segment.on_complete_alert_props.description,
                with_cancel_button: false,
                // the button runs a function that closes the alert modal and completes the active segment
                buttons: [{
                    label: is_last_segment ? 'Ok' : 'Proceed',
                    onPress: (closeAlert) => {
                        // if this is the last segment, stop the timer else complete the segment
                        if (is_last_segment) {
                            updateTimerState({
                                type: TimerStateActionTypes.STOP_TIMER, payload: null
                            })
                            const end_time = new Date()
                            dispatch(endSession({
                                session_id: session_id!,
                                end_time: end_time.toISOString()
                            }))
                            setSessionId(null)
                            closeAlert()
                        } else {
                            updateTimerState({
                                type: TimerStateActionTypes.COMPLETE_SEGMENT,
                                payload: null
                            })
                            closeAlert()
                        }
                    }
                }]
            };
            // play a bell sound then open the modal
            (is_last_segment ? playSoundOnSessionDone() : playSoundOnSegmentDone()).then()
            openModal({
                type: ModalType.ALERT,
                component: KronosAlert,
                component_props: alert_props
            })
        }
    }, [active_segment?.on_complete_alert_props.is_open])

    // ? ........................
    // End

    // console.log('remaining segments length is', timer_state?.segments_state.segments_remaining.length, 'and active segment is', active_segment)

    return {
        timer_state: {
            timer_status: (
                !timer_state ?
                    TimerStatus.OFF :
                    timer_state.timing_state.is_running ?
                        // if the active segment is the last one left and on_complete_alert_props is open, then the timer is done
                        active_segment?.on_complete_alert_props.is_open ?
                            TimerStatus.DONE : TimerStatus.RUNNING : TimerStatus.PAUSED
            ),
            active_segment,
            completed_segments: timer_state?.segments_state.segments_completed ?? [],
            // the remaining segments are the remaining segments without the active segment which is the last segment
            remaining_segments: timer_state?.segments_state.segments_remaining.slice(0, -1) ?? [],
        },
        timer_controls: {
            startTimer, stopTimer, pauseTimer, resumeTimer
        }
    }
}
