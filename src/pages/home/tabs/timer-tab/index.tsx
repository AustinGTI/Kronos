import React from 'react'
import {Button, Paragraph, Sheet, YStack} from "tamagui";
import {useDispatch} from "react-redux";
import {Activity, Duration} from "../../../../globals/types/main";
import {FormProps} from "../../../../globals/types/form";
import {AlertProps} from "../../../../globals/types/alert";
import {TimerTabContext, TimerTabContextProps} from "./context";
import {Keyboard, TouchableWithoutFeedback} from "react-native";
import ActivityForm from "../planner-tab/forms/ActivityForm";
import {ValidationResponse} from "../../../../globals/redux/types";
import DurationForm from "../planner-tab/forms/DurationForm";
import SelectActivityModal from "./modals/SelectActivityModal";
import Default_activities from "../../../../globals/redux/defaults/default_activities";
import DEFAULT_ACTIVITIES_STATE from "../../../../globals/redux/defaults/default_activities";
import SelectDurationModal from "./modals/SelectDurationModal";

enum TIMER_TAB_SHEET_MODAL {
    SELECT_ACTIVITY = 'SELECT_ACTIVITY',
    SELECT_DURATION = 'SELECT_DURATION',
}

class Timer {
    // constructor takes in a duration
    constructor(duration: Duration) {
    }


}

export default function TimerTab() {
    const [timer_duration, setTimerDuration] = React.useState<Duration | null>(null)
    const [timer_activity, setTimerActivity] = React.useState<Activity | null>(null)

    const [sheet_modal_is_open, setSheetModalIsOpen] = React.useState<boolean>(false)
    const [active_sheet_modal, setSheetModalElement] = React.useState<TIMER_TAB_SHEET_MODAL | null>(null)

    const [alert_modal_is_open, setAlertModalIsOpen] = React.useState<boolean>(false)
    const [alert_props, setAlertProps] = React.useState<AlertProps | null>(null)

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

    const openSelectActivityModal = React.useCallback(() => {
        setSheetModalElement(TIMER_TAB_SHEET_MODAL.SELECT_ACTIVITY)
        setSheetModalIsOpen(true)
    }, [])

    const openSelectDurationModal = React.useCallback(() => {
        setSheetModalElement(TIMER_TAB_SHEET_MODAL.SELECT_DURATION)
        setSheetModalIsOpen(true)
    }, [])

    return (
        <TimerTabContext.Provider value={timer_tab_context}>
            <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
                <YStack w={'100%'} h={'40%'}>
                    <Button onPress={openSelectDurationModal}>{timer_duration?.name ?? 'Select Duration'}</Button>
                </YStack>
                <Button onPress={openSelectActivityModal}>{timer_activity?.name ?? 'Select Activity'}</Button>
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
        </TimerTabContext.Provider>
    )
}
