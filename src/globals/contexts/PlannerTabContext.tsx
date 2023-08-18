import React from "react";
import {FormProps} from "../types/form";
import {Activity, Duration} from "../types/main";
import {ValidationStatus} from "../redux/types";
import {AppState} from "../redux/reducers";
import {AlertProps, DEFAULT_ALERT_PROPS} from "../types/alert";

export interface PlannerTabFormData {
    form_props: FormProps<Activity> | FormProps<Duration> | null
    setFormProps: React.Dispatch<React.SetStateAction<FormProps<Activity> | FormProps<Duration> | null>>
}

export interface PlannerTabContextProps {
    form_data: PlannerTabFormData
    modal_data: {
        form_modal_is_open: boolean
        setFormModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
        alert_modal_is_open: boolean
        setAlertModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    },
    alert_data: {
        alert_props: AlertProps | null
        setAlertProps: React.Dispatch<React.SetStateAction<AlertProps | null>>
    }
}

export const PlannerTabContext = React.createContext<PlannerTabContextProps>({
    modal_data: {
        form_modal_is_open: false,
        setFormModalIsOpen: () => undefined,
        alert_modal_is_open: false,
        setAlertModalIsOpen: () => undefined
    },
    form_data: {
        form_props: null,
        setFormProps: () => undefined
    },
    alert_data: {
        alert_props: null,
        setAlertProps: () => undefined
    }
} as PlannerTabContextProps)

export default function usePlannerTabContext() {
    return React.useContext(PlannerTabContext)
}
