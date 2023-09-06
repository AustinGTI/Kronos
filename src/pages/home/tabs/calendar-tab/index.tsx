import React from 'react'
import {Paragraph, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {FlatList} from "react-native";
import {AppState} from "../../../../globals/redux/reducers";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../../globals/helpers/datetime_functions";
import DayPane from "./DayPane";
import {CalendarTabContext, CalendarTabContextProps} from "./context";
import {Session} from "../../../../globals/types/main";

interface Dimensions {
    width: number
    height: number
}

export default function CalendarTab() {
    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<Dimensions>({width: 0, height: 0})
    const [active_date, setActiveDate] = React.useState<Date>(new Date())
    const [modal_visible, setModalVisibility] = React.useState<boolean>(false)
    const [session_in_modal, setSessionInModal] = React.useState<Session | null>(null)

    const sessions = useSelector((state: AppState) => state.sessions)
    // generate a series of date strings (dd/mm/yyyy) from the first date in sessions to today
    const dates = React.useMemo(() => {
        const first_date_string = Object.keys(sessions).sort((a: string, b: string) => {
            return DDMMYYYYToDate(a).getTime() - DDMMYYYYToDate(b).getTime()
        })[0]
        const first_date = first_date_string ? DDMMYYYYToDate(first_date_string) : new Date()
        const last_date = new Date()
        const dates = []
        let current_date = first_date
        while (current_date.getTime() <= last_date.getTime()) {
            dates.push(dateToDDMMYYYY(current_date))
            current_date.setDate(current_date.getDate() + 1)
        }
        // reverse the dates so that the latest date is at the top
        return dates.slice().reverse()
    }, [sessions])

    const calendar_tab_context: CalendarTabContextProps = React.useMemo(() => {
        return {
            date_data: {
                active_date, setActiveDate
            },
            modal_data: {
                modal_visible, setModalVisibility,
                session_in_modal, setSessionInModal
            },
            dimensions_data: {
                calendar_width: flatlist_dimensions.width,
                calendar_height: flatlist_dimensions.height
            }
        }
    }, [active_date, modal_visible, session_in_modal, flatlist_dimensions.width, flatlist_dimensions.height])

    return (
        <CalendarTabContext.Provider value={calendar_tab_context}>
            <YStack height={'100%'} ai={'center'} backgroundColor={'$background'}>
                <FlatList
                    style={{width: '100%', flexGrow: 1}}
                    data={dates}
                    inverted={true}
                    onLayout={(event) => {
                        const {height,width} = event.nativeEvent.layout
                        setFlatlistDimensions({width, height})
                    }}
                    snapToInterval={flatlist_dimensions.height}
                    decelerationRate={'fast'}
                    disableIntervalMomentum={true}
                    keyExtractor={(item) => item}
                    getItemLayout={(data, index) => {
                        return {
                            length: flatlist_dimensions.height,
                            offset: flatlist_dimensions.height * index,
                            index
                        }
                    }}
                    initialNumToRender={3}
                    renderItem={
                        ({item}) => {
                            // item is a date string (dd/mm/yyyy), get the corresponding day object from sessions,
                            // if it doesn't exist, create it
                            const day = sessions[item] ?? {
                                date: DDMMYYYYToDate(item).toISOString(),
                                sessions: {}
                            }
                            return (
                                <DayPane day={day}/>
                            )
                        }
                    }/>
            </YStack>
        </CalendarTabContext.Provider>
    )
}