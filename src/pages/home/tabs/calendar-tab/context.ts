import React from "react";
import {Session} from "../../../../globals/types/main";

export interface CalendarTabContextProps {
    date_data: {
        active_date: Date
        setActiveDate: (date: Date) => void
    },
    modal_data: {
        modal_is_open: boolean
        setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
        session_in_modal: Session | null
        setSessionInModal: React.Dispatch<React.SetStateAction<Session | null>>
    }
}

export const CalendarTabContext = React.createContext<CalendarTabContextProps>({
    date_data: {
        active_date: new Date(),
        setActiveDate: () => undefined
    },
    modal_data: {
        modal_is_open: false,
        setModalIsOpen: () => undefined,
        session_in_modal: null,
        setSessionInModal: () => undefined
    }
})