import React from 'react'
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AlertDialog, Button, Circle, Heading, Paragraph, Sheet, Square, View, XStack, YStack} from "tamagui";
import {Activity, Duration, SegmentType} from "../../../../globals/types/main";
import {AlertProps} from "../../../../globals/types/alert";
import {TimerTabContext, TimerTabContextProps} from "./context";
import {Keyboard, TouchableWithoutFeedback} from "react-native";
import SelectActivityModal from "./modals/SelectActivityModal";
import SelectDurationModal from "./modals/SelectDurationModal";
import {Canvas, Group, Path, Skia} from "@shopify/react-native-skia";
import {Pause, Play, Square as SquareIcon} from "@tamagui/lucide-icons";
import useTimer, {TimerStatus} from "./useTimer";
import KronosPage from "../../../../globals/components/wrappers/KronosPage";
import SelectionControls from "./sections/SelectionControls";
import TimerControls from "./sections/TimerControls";
import HourGlassAnimation from "./sections/hourglass";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";

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

    console.log('displaying on the time display ', hours, minutes, seconds)

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


    // Region TIMER PATH

    const [main_clock_coords, pointer_coords] = React.useMemo(() => {
        const main: CircleCoords = {
            x: wp(`${85 * 0.5}%`),
            y: wp(`${85 * 0.5}%`),
            radius: wp(`${85 * 0.5 * 0.9}%`)
        }
        const pointer: CircleCoords = {
            x: wp(`${85 * 0.5}%`),
            y: hp(`${50 * 0.85 * 0.5}%`),
            radius: wp(`${85 * 0.5 * 0.6}%`)
        }
        return [main, pointer]
    }, [])

    const generateTimerPath = React.useCallback(({x, y, radius}: CircleCoords) => {
        const path = Skia.Path.Make()
        path.addCircle(x, y, radius)
        // rotate the path by -90 degrees
        const matrix = Skia.Matrix()
        matrix.translate(x, y)
        matrix.rotate((-90 * Math.PI) / 180)
        matrix.translate(-x, -y)

        path.transform(matrix)
        return path
    }, [])

    const clock = React.useMemo(() => {
        // the session visualization, if there is no session, a gray circle
        if (!timer_duration) {
            return (
                <React.Fragment>
                    <Path
                        path={generateTimerPath(main_clock_coords)}
                        style="stroke"
                        strokeWidth={30}
                        color={'gray'}
                        strokeCap="butt"
                    />
                </React.Fragment>
            )
        } else {
            // for each segment, draw a segment of the circle corresponding to its start and end time
            const total_time = timer_duration.segments.reduce((total, segment) => segment.duration + total, 0)

            const intervals = timer_duration.segments.reduce((positions, segment, index) => {
                const prev_position = index === 0 ? 0 : positions[index - 1]
                const position = prev_position + segment.duration / total_time
                positions.push(position)
                return positions
            }, [] as number[])


            return (
                <React.Fragment>
                    {
                        intervals.map((interval, index) => {
                            return (
                                <Path
                                    key={index}
                                    path={generateTimerPath(main_clock_coords)}
                                    style="stroke"
                                    strokeWidth={30}
                                    color={timer_duration.segments[index].type.color}
                                    start={(index !== 0 ? intervals[index - 1] : 0)}
                                    end={interval}
                                    strokeCap={'butt'}
                                />
                            )
                        })
                    }
                </React.Fragment>
            )
        }
    }, [timer_duration, generateTimerPath, main_clock_coords])

    const pointer = React.useMemo(() => {
        let timer_location = 0;
        if (timer_status !== TimerStatus.OFF && active_segment && timer_duration) {
            // add up all the completed segments then the proportion of the active segment that is complete
            const total_duration = timer_duration.segments.reduce((total, segment) => segment.duration + total, 0) * 60

            let elapsed_duration = completed_segments.reduce((total, segment) => total + segment.initial_duration, 0)
            elapsed_duration += Math.min(active_segment.initial_duration, active_segment.elapsed_duration)

            console.log('total increment is', total_duration, 'elapsed increment is', elapsed_duration)

            timer_location = elapsed_duration / total_duration
        }
        return (
            <Path
                path={generateTimerPath(main_clock_coords)}
                style="stroke"
                strokeWidth={10}
                color={'white'}
                start={0}
                end={timer_location > 0 ? timer_location : 0.0001} // if timer location is 0, set timer location to just above 0 to display a single dot at the top
                strokeCap="round"
            />
        )
    }, [active_segment, timer_duration, generateTimerPath, main_clock_coords])

// End


    return (
        <KronosPage>
            <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'} w={'100%'}>
                <TimeDisplay
                    segment_type={active_segment ? active_segment.segment_type : undefined}
                    duration={active_segment ? active_segment.initial_duration - active_segment.elapsed_duration : undefined}/>
                <HourGlassAnimation
                    timer_status={timer_status}
                    active_segment={active_segment}
                    completed_segments={completed_segments} remaining_segments={remaining_segments}/>
                <TimerControls
                    timer_ready={!!(timer_activity && timer_duration)} timer_status={timer_status}
                    startTimer={startTimer} stopTimer={stopTimer} pauseTimer={pauseTimer} resumeTimer={resumeTimer}/>
                <SelectionControls
                    timer_status={timer_status}
                    timer_activity={timer_activity} setTimerActivity={setTimerActivity}
                    timer_duration={timer_duration} setTimerDuration={setTimerDuration}/>
            </YStack>
        </KronosPage>
    )
}
