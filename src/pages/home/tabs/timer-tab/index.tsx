import React from 'react'
import {AlertDialog, Button, Circle, Heading, Paragraph, Sheet, Square, View, XStack, YStack} from "tamagui";
import {Activity, Duration, SegmentType} from "../../../../globals/types/main";
import useTimer, {TimerStatus} from "./useTimer";
import KronosPage from "../../../../globals/components/wrappers/KronosPage";
import SelectionControls from "./sections/SelectionControls";
import TimerControls from "./sections/TimerControls";
import HourGlassAnimation from "./sections/hourglass";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";
import {durationToTimerState, TimerSegment} from "./timer_state";

enum TIMER_TAB_SHEET_MODAL {
    SELECT_ACTIVITY = 'SELECT_ACTIVITY',
    SELECT_DURATION = 'SELECT_DURATION',
}

function durationInSecondsToTimerString(duration: number) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

interface CircleCoords {
    x: number,
    y: number,
    radius: number
}

interface TimeDisplayProps {
    segment_type?: SegmentType
    duration?: number // in seconds
}

function TimeDisplay({duration, segment_type}: TimeDisplayProps) {
    const is_negative = React.useMemo(() => {
        return duration && duration < 0
    }, [duration])

    const [hours, minutes, seconds]: [string, string, string] = React.useMemo(() => {
        if (duration === undefined) {
            return ['00', '00', '00']
        }
        const absolute_duration = Math.abs(duration)
        const hours = Math.floor(absolute_duration / 3600).toString().padStart(2, '0')
        const minutes = Math.floor((absolute_duration % 3600) / 60).toString().padStart(2, '0')
        const seconds = Math.floor(absolute_duration % 60).toString().padStart(2, '0')
        return [hours, minutes, seconds]
    }, [duration])

    const ValueDisplay = React.useCallback(({value}: { value: string }) => {
        return (
            <XStack width={55} alignItems={'center'} justifyContent={'center'}>
                <Paragraph fontSize={40} lineHeight={45} paddingVertical={0}>{value}</Paragraph>
            </XStack>
        )
    }, [])

    const Separator = React.useCallback(() => {
        return (
            <XStack width={15} alignItems={'center'} justifyContent={'center'}>
                <Paragraph fontSize={25}>:</Paragraph>
            </XStack>
        )
    }, [])

    // console.log('displaying on the time display ', hours, minutes, seconds)

    return (
        <KronosContainer w={'90%'} paddingVertical={5}>
            <YStack w={'100%'} alignItems={'center'}>
                <XStack justifyContent={'center'} alignItems={'center'} paddingVertical={5}>
                    <Circle size={7} backgroundColor={segment_type?.color ?? '$color'}/>
                    <Paragraph
                        paddingHorizontal={5}
                        fontSize={20} color={'$color'} textTransform={'uppercase'}>
                        {segment_type?.name ?? 'NONE'}
                    </Paragraph>
                    <Circle size={7} backgroundColor={segment_type?.color ?? '$color'}/>
                </XStack>
                <XStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                    {is_negative ? <Paragraph fontSize={40} lineHeight={40} marginRight={2}>-</Paragraph> : null}
                    <ValueDisplay value={hours}/>
                    <Separator/>
                    <ValueDisplay value={minutes}/>
                    <Separator/>
                    <ValueDisplay value={seconds}/>
                </XStack>
            </YStack>
        </KronosContainer>
    )
}

/**
 * this exists so that the hooks in TimerTabContents can use the context passed down by KronosPage
 * @constructor
 */
export default function TimerTab() {
    return (
        <KronosPage>
            <TimerTabContents/>
        </KronosPage>
    )

}


function TimerTabContents() {
    // Region STATES
    // ? ........................

    const [timer_duration, setTimerDuration] = React.useState<Duration | null>(null)
    const [timer_activity, setTimerActivity] = React.useState<Activity | null>(null)

    const {
        timer_state: {timer_status, completed_segments, active_segment, remaining_segments},
        timer_controls: {startTimer, stopTimer, pauseTimer, resumeTimer}
    } = useTimer(timer_activity, timer_duration)

    // ? ........................
    // End

    // we want to display the potential hourglass of the duration before the user starts the timer if there is no timer running yet
    const hourglass_remaining_segments: TimerSegment[] = React.useMemo(() => {
        if (remaining_segments.length || active_segment) {
            return remaining_segments
        } else if (timer_duration) {
            return durationToTimerState(timer_duration).segments_state.segments_remaining
        } else {
            return []
        }
    }, [remaining_segments, timer_duration]);

    return (
        <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'} w={'100%'}>
            <TimeDisplay
                segment_type={active_segment ? active_segment.segment_type : undefined}
                duration={active_segment ? active_segment.initial_duration - active_segment.elapsed_duration : undefined}/>
            <HourGlassAnimation
                timer_status={timer_status}
                active_segment={active_segment}
                completed_segments={completed_segments}
                remaining_segments={hourglass_remaining_segments}/>
            <TimerControls
                timer_ready={!!(timer_activity && timer_duration)} timer_status={timer_status}
                startTimer={startTimer} stopTimer={stopTimer} pauseTimer={pauseTimer} resumeTimer={resumeTimer}/>
            <SelectionControls
                timer_status={timer_status}
                timer_activity={timer_activity} setTimerActivity={setTimerActivity}
                timer_duration={timer_duration} setTimerDuration={setTimerDuration}/>
        </YStack>
    )
}
