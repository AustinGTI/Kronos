import React from 'react'
import {Button, Paragraph, YStack} from "tamagui";
import {useDispatch} from "react-redux";
import {Activity, Duration} from "../../../../globals/types/main";
import {FormProps} from "../../../../globals/types/form";
import {AlertProps} from "../../../../globals/types/alert";
import {TimerTabContext, TimerTabContextProps} from "./context";


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
                    <Button/>
                </YStack>
            </YStack>
        </TimerTabContext.Provider>
    )
}
