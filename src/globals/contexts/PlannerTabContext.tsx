import React from "react";
import {FormProps} from "../types/form";
import {Activity, Duration} from "../types/main";
import {ValidationStatus} from "../redux/types";
import {AppState} from "../redux/reducers";

export interface PlannerTabFormData {
    form_params: FormProps<Activity> | FormProps<Duration>
    setFormParams: React.Dispatch<React.SetStateAction<FormProps<Activity> | FormProps<Duration>>>
}

export interface PlannerTabContextProps {
    form_data: PlannerTabFormData
    modal_data: {
        modal_is_open: boolean
        setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
        setAlertText: React.Dispatch<React.SetStateAction<string | null>>
    }
}

export const PlannerTabContext = React.createContext<PlannerTabContextProps>({
    modal_data: {
        modal_is_open: false,
        setModalIsOpen: () => undefined,
        setAlertText: () => undefined
    },
    form_data: {
        form_params: {
            title: '',
            initial_values: null,
            onSubmit: () => ({status: ValidationStatus.SUCCESS})
        },
        setFormParams: () => undefined
    }
} as PlannerTabContextProps)

export default function usePlannerTabContext() {
    return React.useContext(PlannerTabContext)
}
