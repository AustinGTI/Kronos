import React from "react";

interface PlannerTabContextProps {
    modal_data: {
        modal_form: JSX.Element
        setModalForm: React.Dispatch<React.SetStateAction<JSX.Element>>
    }
}
export const PlannerTabContext = React.createContext<PlannerTabContextProps>({
    modal_data: {
        modal_form: <></>,
        setModalForm: () => {}
    }
} as PlannerTabContextProps)

export default function usePlannerTabContext() {
    return React.useContext(PlannerTabContext)
}
