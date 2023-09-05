import React from "react";
import {Session} from "../../../../globals/types/main";

export interface CalendarTabContextProps {
    date_data: {
        active_date: Date
        setActiveDate: (date: Date) => void
    },
    modal_data: {
        modal_visible: boolean
        setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>
        session_in_modal: Session | null
        setSessionInModal: React.Dispatch<React.SetStateAction<Session | null>>
    },
    dimensions_data: {
        calendar_width: number
        calendar_height: number
    }
}

export const CalendarTabContext = React.createContext<CalendarTabContextProps>({
    date_data: {
        active_date: new Date(),
        setActiveDate: () => undefined
    },
    modal_data: {
        modal_visible: false,
        setModalVisibility: () => undefined,
        session_in_modal: null,
        setSessionInModal: () => undefined
    },
    dimensions_data: {
        calendar_width: 0,
        calendar_height: 0
    }
})