import React from "react";
import {AlertProps} from "../../../../globals/types/alert";
import {Activity, Duration} from "../../../../globals/types/main";

export interface TimerTabContextProps {
    timer_data: {
        config_data: {
            timer_duration: Duration | null
            setTimerDuration: React.Dispatch<React.SetStateAction<Duration | null>>
            timer_activity: Activity | null
            setTimerActivity: React.Dispatch<React.SetStateAction<Activity | null>>
        }
    }
    sheet_data: {
        sheet_modal_is_open: boolean
        setSheetModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
    alert_data: {
        alert_modal_is_open: boolean
        setAlertModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
        alert_props: AlertProps | null
        setAlertProps: React.Dispatch<React.SetStateAction<AlertProps | null>>
    }
}


export const TimerTabContext = React.createContext<TimerTabContextProps>({
    timer_data: {
        config_data: {
            timer_duration: null,
            setTimerDuration: () => undefined,
            timer_activity: null,
            setTimerActivity: () => undefined
        }
    },
    sheet_data: {
        sheet_modal_is_open: false,
        setSheetModalIsOpen: () => undefined
    },
    alert_data: {
        alert_modal_is_open: false,
        setAlertModalIsOpen: () => undefined,
        alert_props: null,
        setAlertProps: () => undefined
    }
} as TimerTabContextProps)

export default function useTimerTabContext() {
    return React.useContext(TimerTabContext)
}