import React from "react";
import {Session} from "../../../../globals/types/main";

export interface CalendarTabContextProps {
    date_data: {
        active_date: Date
        setActiveDate: (date: Date) => void
    },
    modal_data: {
        setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>
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
        setModalVisibility: () => undefined,
        setSessionInModal: () => undefined
    },
    dimensions_data: {
        calendar_width: 0,
        calendar_height: 0
    }
})