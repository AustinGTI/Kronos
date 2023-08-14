import React from "react";
import {FormProps} from "../types/form";
import {Activity, Duration} from "../types/main";
import {ValidationStatus} from "../redux/types";
import {AppState} from "../redux/reducers";
import {AlertProps, DEFAULT_ALERT_PROPS} from "../types/alert";

export interface PlannerTabFormData {
    form_props: FormProps<Activity> | FormProps<Duration>
    setFormProps: React.Dispatch<React.SetStateAction<FormProps<Activity> | FormProps<Duration>>>
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
        alert_props: AlertProps
        setAlertProps: React.Dispatch<React.SetStateAction<AlertProps>>
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
        form_props: {
            title: '',
            initial_values: null,
            onSubmit: () => ({status: ValidationStatus.SUCCESS})
        },
        setFormProps: () => undefined
    },
    alert_data: {
        alert_props: DEFAULT_ALERT_PROPS,
        setAlertProps: () => undefined
    }
} as PlannerTabContextProps)

export default function usePlannerTabContext() {
    return React.useContext(PlannerTabContext)
}
