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


export default function TimerTab() {
    const [timer_duration, setTimerDuration] = React.useState<Duration | null>(null)
    const [timer_activity, setTimerActivity] = React.useState<Activity | null>(null)

    const [sheet_modal_is_open, setSheetModalIsOpen] = React.useState<boolean>(false)
    const [sheet_modal_element, setSheetModalElement] = React.useState<React.ReactElement | null>(null)

    const [alert_is_open, setAlertIsOpen] = React.useState<boolean>(false)
    const [alert_props, setAlertProps] = React.useState<AlertProps | null>(null)

    const timer_tab_context: TimerTabContextProps = React.useMemo(() => ({
        timer_data: {
            config_data: {
                timer_duration, setTimerDuration,
                timer_activity, setTimerActivity,
            },
        }
    }), [timer_duration, timer_activity])


    return (
        <TimerTabContext.Provider value={timer_tab_context}>
            <YStack f={1} jc={'center'} ai={'center'} backgroundColor={'$background'}>
                <YStack w={'100%'} h={'40%'}>
                    <Button>{timer_duration?.name ?? 'Select Duration'}</Button>
                </YStack>
                <Button>{timer_activity?.name ?? 'Select Activity'}</Button>
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
                        <Sheet.ScrollView w={'100%'} h={'100%'} backgroundColor={'white'}></Sheet.ScrollView>
                    </TouchableWithoutFeedback>
                </Sheet.Frame>
            </Sheet>
        </TimerTabContext.Provider>
    )
}
