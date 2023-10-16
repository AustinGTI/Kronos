import React, {useMemo} from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {AlertDialog, Button, Paragraph, ScrollView, Sheet, Square, View, XStack, YStack, Circle} from "tamagui";
import {Activity, Duration, SegmentTypes, Session} from "../../../../globals/types/main";
import {AlertProps} from "../../../../globals/types/alert";
import {TimerTabContext, TimerTabContextProps} from "./context";
import {Dimensions, Keyboard, TouchableWithoutFeedback} from "react-native";
import SelectActivityModal from "./modals/SelectActivityModal";
import SelectDurationModal from "./modals/SelectDurationModal";
import {TimerStateActionTypes, timerStateReducer} from "./timer_state";
import {useDispatch} from "react-redux";
import {endSession, incrementSessionSegment, startSession} from "../../../../globals/redux/reducers/sessionsReducer";
import {Canvas, Text, Group, Path, Skia} from "@shopify/react-native-skia";

enum TIMER_TAB_SHEET_MODAL {
    SELECT_ACTIVITY = 'SELECT_ACTIVITY',
    SELECT_DURATION = 'SELECT_DURATION',
}

function durationInSecondsToTimerString(duration: number) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

interface TimeDisplayProps {
    duration?: number // in seconds
}

function TimeDisplay({duration}: TimeDisplayProps) {
    const is_negative = React.useMemo(() => {
        return duration && duration < 0
    }, [duration])

    const [hours, minutes, seconds]: [string, string, string] = React.useMemo(() => {
        if (duration === undefined) {
            return ['--', '--', '--']
        }
        const absolute_duration = Math.abs(duration)
        const hours = Math.floor(absolute_duration / 3600).toString().padStart(2, '0')
        const minutes = Math.floor((absolute_duration % 3600) / 60).toString().padStart(2, '0')
        const seconds = Math.floor(absolute_duration % 60).toString().padStart(2, '0')
        return [hours, minutes, seconds]
    }, [duration])

    const ValueDisplay = React.useCallback(({value}: { value: string }) => {
        return (
            <XStack width={60} alignItems={'center'} justifyContent={'center'}>
                <Paragraph fontSize={25}>{value}</Paragraph>
            </XStack>
        )
    }, [])

    const Separator = React.useCallback(() => {
        return (
            <XStack width={30} alignItems={'center'} justifyContent={'center'}>
                <Paragraph fontSize={25}>:</Paragraph>
            </XStack>
        )
    }, [])

    console.log('displaying on the time display ',hours,minutes,seconds)

    return (
        <XStack alignItems={'center'} justifyContent={'center'} pt={'5%'}>
            {is_negative ? <Paragraph fontSize={15}>-</Paragraph> : null}
            <ValueDisplay value={hours}/>
            <Separator/>
            <ValueDisplay value={minutes}/>
            <Separator/>
            <ValueDisplay value={seconds}/>
        </XStack>
    )
}

export default function TimerTab() {
    // Region STATES
    // ? ........................

    const dispatch = useDispatch()
    const timer_interval_ref = React.useRef<number | null>(null)

    const [timer_state, updateTimerState] = React.useReducer(timerStateReducer, null)
    const [session_id, setSessionId] = React.useState<number | null>(null)

    const [timer_duration, setTimerDuration] = React.useState<Duration | null>(null)
    const [timer_activity, setTimerActivity] = React.useState<Activity | null>(null)

    const [sheet_modal_is_open, setSheetModalIsOpen] = React.useState<boolean>(false)
    const [active_sheet_modal, setSheetModalElement] = React.useState<TIMER_TAB_SHEET_MODAL | null>(null)

    const [alert_modal_is_open, setAlertModalIsOpen] = React.useState<boolean>(false)
    const [alert_props, setAlertProps] = React.useState<AlertProps | null>(null)

    // ? ........................
    // End


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
    }, [timer_duration, timer_activity, dispatch])

    const pauseTimer = React.useCallback(() => {
        if (!timer_state?.timing_state.is_running) {
            throw new Error('Cannot pause if timer is not running')
        }
        updateTimerState({
            type: TimerStateActionTypes.PAUSE_TIMER, payload: null
        })
    }, [timer_state?.timing_state.is_running])

    const resumeTimer = React.useCallback(() => {
        if (timer_state?.timing_state.is_running) {
            throw new Error('Cannot resume if timer is running')
        }
        updateTimerState({
            type: TimerStateActionTypes.RESUME_TIMER, payload: null
        })
    }, [timer_state?.timing_state.is_running])

    const stopTimer = React.useCallback(() => {
        setAlertProps({
            title: 'Session is unfinished!',
            description: 'Are you sure you want to stop the timer? This session will be recorded as incomplete, Click OK to confirm this action.',
            with_cancel_button: true,
            buttons: [{
                text: 'OK',
                onPress: () => {
                    updateTimerState({
                        type: TimerStateActionTypes.STOP_TIMER, payload: null
                    })
                    const end_time = new Date()
                    dispatch(endSession({
                        session_id: session_id!,
                        end_time: end_time.toISOString()
                    }))
                    setSessionId(null)
                    setAlertModalIsOpen(false)
                }
            }]
        })
        setAlertModalIsOpen(true)
    }, [dispatch, session_id])

    const incrementTimer = React.useCallback(() => {
        if (!session_id) {
            throw new Error('Cannot increment timer if session is not set')
        }
        if (!timer_state) {
            throw new Error('Cannot increment timer if timer state is not set')
        }
        updateTimerState({
            type: TimerStateActionTypes.INCREMENT_TIMER, payload: null
        })
        // at every 60 sec interval, increment the session as well
        if (timer_state.timing_state.elapsed_time % 60 === 0) {
            // if the timer is running, increment with the active segment
            if (timer_state.timing_state.is_running) {
                const segments_remaining = timer_state.segments_state.segments_remaining
                dispatch(incrementSessionSegment({
                    session_id: session_id!,
                    // the active segment is the last segment in the array
                    segment_type: segments_remaining[segments_remaining.length - 1].segment_type,
                }))
            } else {
                // otherwise, increment with the PAUSE segment
                dispatch(incrementSessionSegment({
                    session_id: session_id!,
                    segment_type: SegmentTypes.PAUSE,
                }))
            }
        }
        // if the active segment elapsed time, is higher than the initial time, then the segment is complete, set modal is open to true
    }, [session_id, timer_state, dispatch])

    // ? ........................
    // Region METADATA CALLBACKS
    // ? ........................

    const openSelectActivityModal = React.useCallback(() => {
        setSheetModalElement(TIMER_TAB_SHEET_MODAL.SELECT_ACTIVITY)
        setSheetModalIsOpen(true)
    }, [])

    const openSelectDurationModal = React.useCallback(() => {
        setSheetModalElement(TIMER_TAB_SHEET_MODAL.SELECT_DURATION)
        setSheetModalIsOpen(true)
    }, [])

    // ? ........................
    // End

    const active_segment = React.useMemo(() => {
        if (!timer_state) {
            return null
        } else {
            return timer_state.segments_state.segments_remaining[timer_state.segments_state.segments_remaining.length - 1]
        }
    }, [timer_state])

    const timer_tab_context: TimerTabContextProps = React.useMemo(() => ({
        timer_data: {
            config_data: {
                timer_duration, setTimerDuration,
                timer_activity, setTimerActivity,
            },
        },
        sheet_data: {
            sheet_modal_is_open, setSheetModalIsOpen,
        },
        alert_data: {
            alert_modal_is_open, setAlertModalIsOpen,
            alert_props, setAlertProps,
        }
    }), [timer_duration, timer_activity, sheet_modal_is_open, alert_modal_is_open, alert_props])


    // Region EFFECTS
    // ? ........................

    React.useEffect(() => {
        console.log('timing state is', timer_state?.timing_state)
        console.log('segments remaining are', active_segment)
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
            const alert_props: AlertProps = {
                title: active_segment.on_complete_alert_props.title,
                description: active_segment.on_complete_alert_props.description,
                with_cancel_button: false,
                // the button runs a function that closes the alert modal and completes the active segment
                buttons: [{
                    text: is_last_segment ? 'Complete Session' : 'Proceed',
                    onPress: () => {
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
                            setAlertModalIsOpen(false)
                        } else {
                            updateTimerState({
                                type: TimerStateActionTypes.COMPLETE_SEGMENT,
                                payload: null
                            })
                            setAlertModalIsOpen(false)
                        }
                    }
                }]
            }
            setAlertProps(alert_props)
            setAlertModalIsOpen(true)
        }
    }, [active_segment?.on_complete_alert_props.is_open])

    // ? ........................
    // End


    // Region TIMER PATH

    const timer_path = React.useMemo(() => {
        const path = Skia.Path.Make()
        path.addCircle(wp(`${85 * 0.5}%`), hp(`${50 * 0.85 * 0.5}%`), wp(`${85 * 0.5 * 0.8}%`))
        // rotate the path by -90 degrees
        const matrix = Skia.Matrix()
        matrix.translate(wp(`${85 * 0.5}%`), hp(`${50 * 0.85 * 0.5}%`))
        matrix.rotate((-90 * Math.PI) / 180)
        matrix.translate(-wp(`${85 * 0.5}%`), -hp(`${50 * 0.85 * 0.5}%`))

        path.transform(matrix)
        return path
    }, [])

    const clock = React.useMemo(() => {
        // the session visualization, if there is no session, a gray circle
        if (!timer_duration) {
            return (
                <Group>
                    <Path
                        path={timer_path}
                        style='stroke'
                        strokeWidth={30}
                        color={'gray'}
                        strokeCap='butt'
                    />
                </Group>
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

            console.log('intervals are', intervals)

            return (
                <Group>
                    {
                        intervals.map((interval, index) => {
                            return (
                                <Path
                                    key={index}
                                    path={timer_path}
                                    style='stroke'
                                    strokeWidth={30}
                                    color={timer_duration.segments[index].type.color}
                                    start={(index !== 0 ? intervals[index - 1] : 0)}
                                    end={interval}
                                    strokeCap={'butt'}
                                />
                            )
                        })
                    }
                </Group>
            )
        }
    }, [timer_duration, timer_path])

// End


    return (
        <TimerTabContext.Provider value={timer_tab_context}>
            <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
                <XStack py={2} w={'90%'} justifyContent={'center'} alignItems={'center'}>
                    <Circle size={10} backgroundColor={timer_activity ? timer_activity.color : 'gray'}/>
                    <Button disabled={timer_state !== null}
                            backgroundColor={'transparent'}
                            onPress={openSelectActivityModal}>
                        <Paragraph
                            color={timer_activity ? 'black' : 'gray'}
                            textTransform={'uppercase'} fontSize={18} textDecorationLine={'underline'}>
                            {timer_activity?.name ?? 'Select Activity'}
                        </Paragraph>
                    </Button>
                    <Circle size={10} backgroundColor={timer_activity ? timer_activity.color : 'gray'}/>
                </XStack>
                <XStack w={'90%'} justifyContent={'center'} py={2}>
                    <Button disabled={timer_state !== null}
                            backgroundColor={'transparent'}
                            onPress={openSelectDurationModal}>
                        <Paragraph
                            color={timer_activity ? 'black' : 'gray'}
                            textTransform={'uppercase'} fontSize={18} textDecorationLine={'underline'}>
                            {timer_duration?.name ?? 'Select Duration'}
                        </Paragraph>
                    </Button>
                </XStack>
                <YStack w={'100%'} h={hp('50%')} alignItems={'center'}>
                    <Square position={'relative'} size={'85%'}>
                        <Canvas style={{width: '100%', height: '100%'}}>
                            {clock}
                        </Canvas>
                        <YStack position={'absolute'} top={0} left={0} width={'100%'} height={'100%'}
                                alignItems={'center'} justifyContent={'space-between'}>
                            <XStack pt={'22%'} width={'100%'} alignItems={'center'}
                                    justifyContent={'center'}>
                                {
                                    active_segment &&
                                    <React.Fragment>
                                        <Circle size={5}
                                                backgroundColor={active_segment?.segment_type.color ?? 'gray'}/>
                                        <Paragraph color={'black'} px={5} fontSize={15}
                                                   textTransform={'uppercase'}>{active_segment?.segment_type.name ?? '-'}</Paragraph>
                                        <Circle size={5}
                                                backgroundColor={active_segment?.segment_type.color ?? 'gray'}/>
                                    </React.Fragment>
                                }
                            </XStack>
                            <TimeDisplay
                                duration={active_segment ? active_segment.initial_duration - active_segment.elapsed_duration : undefined}/>
                            {/* if timer_state does not exist, a play button, else if timer is running, a pause button and stop button else a resume button */}
                            <XStack pb={'25%'} alignItems={'center'} justifyContent={'center'}>
                                {timer_state ?
                                    timer_state.timing_state.is_running ?
                                        <Button backgroundColor={'transparent'} onPress={pauseTimer}>Pause</Button> :
                                        <React.Fragment>
                                            <Button backgroundColor={'transparent'}
                                                    onPress={resumeTimer}>Resume</Button>
                                            <Button backgroundColor={'transparent'} onPress={stopTimer}>Stop</Button>
                                        </React.Fragment> :
                                    <Button backgroundColor={'transparent'} onPress={startTimer}>Start</Button>
                                }
                            </XStack>
                        </YStack>
                    </Square>
                    {timer_state &&
                        <ScrollView w={'100%'} h={100}>
                            <YStack w={'100%'} h={'100%'} ai={'center'} jc={'center'}>
                                {
                                    timer_state.segments_state.segments_remaining
                                        // reverse the array so the active segment is at the top
                                        .slice().reverse()
                                        .map((segment, index) => {
                                            const is_active_segment = index == 0
                                            return (
                                                <XStack key={segment.key} w={'100%'} h={50} ai={'center'}
                                                        jc={'space-around'}
                                                        backgroundColor={is_active_segment ? 'black' : 'gray'}>
                                                    <Paragraph color={'white'}>{segment.segment_type.name}</Paragraph>
                                                    <Paragraph
                                                        color={'white'}>{durationInSecondsToTimerString(segment.initial_duration - segment.elapsed_duration)}</Paragraph>
                                                </XStack>
                                            )
                                        })
                                }
                            </YStack>
                        </ScrollView>}
                </YStack>

            </YStack>
            <Sheet modal={true}
                   open={sheet_modal_is_open}
                   onOpenChange={(open: boolean) => {
                       if (!open) {
                           // wait for the sheet to close before clearing the modal element
                           setTimeout(() => {
                               setSheetModalElement(null)
                           }, 500)
                       }
                       setSheetModalIsOpen(open)
                   }}
                   dismissOnSnapToBottom
                   disableDrag>
                <Sheet.Overlay/>
                <Sheet.Handle/>
                {
                    // ! There is a bug that causes the sheet frame to glitch upwards when the window frame is open for a few milliseconds
                    // ! This is a fix that sets the background color of the frame to transparent so the glitch can't be seen
                    // ! then creates a View in the sheet with max dimensions and bg white
                }
                <Sheet.Frame height={400} backgroundColor={'transparent'}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <Sheet.ScrollView w={'100%'} h={'100%'} backgroundColor={'white'}>
                            {
                                active_sheet_modal === TIMER_TAB_SHEET_MODAL.SELECT_ACTIVITY ?
                                    <SelectActivityModal current_activity={timer_activity}
                                                         setCurrentActivity={setTimerActivity}
                                                         setCurrentDuration={setTimerDuration}
                                                         closeSheetModal={() => setSheetModalIsOpen(false)}/> :
                                    active_sheet_modal === TIMER_TAB_SHEET_MODAL.SELECT_DURATION ?
                                        <SelectDurationModal current_duration={timer_duration}
                                                             setCurrentDuration={setTimerDuration}
                                                             closeSheetModal={() => setSheetModalIsOpen(false)}/>
                                        : null
                            }
                        </Sheet.ScrollView>
                    </TouchableWithoutFeedback>
                </Sheet.Frame>
            </Sheet>
            <AlertDialog
                open={alert_modal_is_open}
                onOpenChange={setAlertModalIsOpen}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay
                        key="overlay"
                        animation="quick"
                        opacity={0.5}
                        enterStyle={{opacity: 0}}
                        exitStyle={{opacity: 0}}
                    />
                    <AlertDialog.Content
                        bordered
                        elevate
                        key="content"
                        animation={[
                            'quick',
                            {
                                opacity: {
                                    overshootClamping: true,
                                },
                            },
                        ]}
                        enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}
                        exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}
                        x={0}
                        scale={1}
                        opacity={1}
                        y={0}
                        maxWidth={'90%'}
                    >
                        {alert_props && (
                            <YStack space>
                                <AlertDialog.Title w={'100%'} textAlign={'center'} textTransform={'uppercase'}
                                                   textDecorationLine={'underline'} fontSize={20}>
                                    {alert_props.title}
                                </AlertDialog.Title>
                                <AlertDialog.Description w={'100%'} textAlign={'center'}>
                                    {alert_props.description}
                                </AlertDialog.Description>

                                <XStack space="$3" justifyContent={
                                    alert_props.buttons.length + (alert_props.with_cancel_button ? 1 : 0) > 1 ? 'space-between' : 'center'
                                }>
                                    {alert_props.with_cancel_button && <AlertDialog.Cancel asChild>
                                        <Button>Close</Button>
                                    </AlertDialog.Cancel>}
                                    {alert_props.buttons.map((button, index) => (
                                        // <AlertDialog.Action key={index} asChild>
                                        <Button key={index} onPress={button.onPress}>
                                            {button.text}
                                        </Button>
                                        // </AlertDialog.Action>
                                    ))}
                                </XStack>
                            </YStack>
                        )}
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog>
        </TimerTabContext.Provider>
    )
}
