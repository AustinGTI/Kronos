import React from 'react'
import {AlertDialog, Button, Paragraph, ScrollView, Sheet, XStack, YStack} from "tamagui";
import {Activity, Duration, SegmentTypes, Session} from "../../../../globals/types/main";
import {AlertProps} from "../../../../globals/types/alert";
import {TimerTabContext, TimerTabContextProps} from "./context";
import {Keyboard, TouchableWithoutFeedback} from "react-native";
import SelectActivityModal from "./modals/SelectActivityModal";
import SelectDurationModal from "./modals/SelectDurationModal";
import {TimerStateActionTypes, timerStateReducer} from "./timer_state";
import {useDispatch} from "react-redux";
import {endSession, incrementSessionSegment, startSession} from "../../../../globals/redux/reducers/sessionsReducer";

enum TIMER_TAB_SHEET_MODAL {
    SELECT_ACTIVITY = 'SELECT_ACTIVITY',
    SELECT_DURATION = 'SELECT_DURATION',
}

function durationInSecondsToTimerString(duration: number) {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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
                        end_time:end_time.toISOString()
                    }))
                    setSessionId(null)
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
                            stopTimer()
                        } else {
                            updateTimerState({
                                type: TimerStateActionTypes.COMPLETE_SEGMENT,
                                payload: null
                            })
                        }
                    }
                }]
            }
            setAlertProps(alert_props)
        }
    }, [active_segment?.on_complete_alert_props.is_open])

    // ? ........................
    // End


    return (
        <TimerTabContext.Provider value={timer_tab_context}>
            <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
                <YStack w={'100%'} h={'40%'}>
                    <Paragraph>TIMER</Paragraph>
                    {timer_state &&
                        // <Paragraph>{durationInSecondsToTimerString(timer_state?.timing_state.elapsed_time)}</Paragraph>}
                        <ScrollView w={'100%'} h={100}>
                            <YStack w={'100%'} h={'100%'} ai={'center'} jc={'center'}>
                                {
                                    timer_state.segments_state.segments_remaining.reverse().map((segment, index) => {
                                        const is_active_segment = index == 0
                                        return (
                                            <XStack key={segment.key} w={'100%'} h={50} ai={'center'}
                                                    jc={'space-around'} backgroundColor={is_active_segment ? 'black' : 'gray'}>
                                                <Paragraph color={'white'}>{segment.segment_type.name}</Paragraph>
                                                <Paragraph color={'white'}>{durationInSecondsToTimerString(segment.initial_duration - segment.elapsed_duration)}</Paragraph>
                                            </XStack>
                                        )
                                    })
                                }
                            </YStack>
                        </ScrollView>}
                    <Button disabled={timer_state !== null}
                            onPress={openSelectDurationModal}>{timer_duration?.name ?? 'Select Duration'}</Button>
                </YStack>
                <Button disabled={timer_state !== null}
                        onPress={openSelectActivityModal}>{timer_activity?.name ?? 'Select Activity'}</Button>
                <XStack w={'100%'}>
                    {/* if timer_state does not exist, a play button, else if timer is running, a pause button and stop button else a resume button */}
                    {timer_state ?
                        timer_state.timing_state.is_running ?
                            <Button onPress={pauseTimer}>Pause</Button> :
                                <React.Fragment>
                                    <Button onPress={resumeTimer}>Resume</Button>
                                    <Button onPress={stopTimer}>Stop</Button>
                                </React.Fragment> : <Button onPress={startTimer}>Start</Button>
                    }
                </XStack>
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
