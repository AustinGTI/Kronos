import React from "react";

export interface PlannerTabFormData {
    initial_values: Object | null
    form_title: string
}

interface PlannerTabContextProps {
    form_data?: PlannerTabFormData
    setFormData: React.Dispatch<React.SetStateAction<PlannerTabFormData | undefined>>
}
export const PlannerTabContext = React.createContext<PlannerTabContextProps>({
    form_data: {
        initial_values: null,
        form_title: ''
    }
} as PlannerTabContextProps)

export default function usePlannerTabContext() {
    return React.useContext(PlannerTabContext)
}
