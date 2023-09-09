import React from 'react'
import {Paragraph, Sheet, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {FlatList, Keyboard, ListRenderItemInfo, TouchableWithoutFeedback} from "react-native";
import {AppState} from "../../../../globals/redux/reducers";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../../globals/helpers/datetime_functions";
import DayPane from "./DayPane";
import {CalendarTabContext, CalendarTabContextProps} from "./context";
import {Session} from "../../../../globals/types/main";
import SelectActivityModal from "../timer-tab/modals/SelectActivityModal";
import SelectDurationModal from "../timer-tab/modals/SelectDurationModal";
import SessionViewModal from "./modals/SessionViewModal";
import Carousel, {CarouselRenderItem} from "react-native-reanimated-carousel";
import {CarouselRenderItemInfo} from "react-native-reanimated-carousel/lib/typescript/types";

interface Dimensions {
    width: number
    height: number
}

const INITIAL_NO_OF_DATES = 7
const EXTENSION_NO_OF_DATES = 7

export default function CalendarTab() {
    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<Dimensions>({width: 0, height: 0})

    // generate a series of date strings (dd/mm/yyyy) from the first date in sessions to today
    const [dates, setDates] = React.useState<string[]>(() => {
        const date_strings: string[] = []
        // starting from today, generate a series of dates going back in time equal to INITIAL_NO_OF_DATES
        const today = new Date()
        for (let i = 0; i < INITIAL_NO_OF_DATES; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            date_strings.push(dateToDDMMYYYY(date))
        }
        return date_strings
    })

    const [active_date, setActiveDate] = React.useState<Date>(new Date())

    const [modal_visible, setModalVisibility] = React.useState<boolean>(false)
    const [session_in_modal, setSessionInModal] = React.useState<Session | null>(null)


    const calendar_tab_context: CalendarTabContextProps = React.useMemo(() => {
        console.log('recalculating calendar tab context')
        return {
            date_data: {
                active_date, setActiveDate
            },
            modal_data: {
                setModalVisibility,
                setSessionInModal
            },
            dimensions_data: {
                calendar_width: flatlist_dimensions.width,
                calendar_height: flatlist_dimensions.height
            }
        }
    }, [active_date, flatlist_dimensions.width, flatlist_dimensions.height])

    const extendDateStrings = React.useCallback(() => {
        // this is meant to be called when the user scrolls to the top of the flatlist
        // starting from the last date in dates, generate a series of dates going back in time equal to EXTENSION_NO_OF_DATES
        const last_date = DDMMYYYYToDate(dates[dates.length - 1])
        const date_strings: string[] = [...dates]
        for (let i = 1; i <= EXTENSION_NO_OF_DATES; i++) {
            const date = new Date(last_date)
            date.setDate(last_date.getDate() - i)
            date_strings.push(dateToDDMMYYYY(date))
        }
        setDates(date_strings)
    }, [dates])

    const renderDayPane = React.useCallback(({item}: ListRenderItemInfo<string>) => {
        return (
            <DayPane date={item}/>
        )
    }, [])

    return (
        <CalendarTabContext.Provider value={calendar_tab_context}>
            <YStack onLayout={
                (event) => {
                    const {height, width} = event.nativeEvent.layout
                    setFlatlistDimensions({width, height})
                }
            } height={'100%'} ai={'center'} backgroundColor={'$background'}>
                <FlatList
                    style={{width: '100%', flexGrow: 1}}
                    data={dates}
                    inverted={true}
                    onLayout={(event) => {
                        const {height, width} = event.nativeEvent.layout
                        setFlatlistDimensions({width, height})
                    }}
                    onScroll={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.y / flatlist_dimensions.height)
                        // set the active date if it is not already the active date
                        if (dates[index] !== dateToDDMMYYYY(active_date)) {
                            setActiveDate(DDMMYYYYToDate(dates[index]))
                        }
                        // if the index is 2 or less away from the end of the list, extend the list
                        if (dates.length - index <= 2) {
                            extendDateStrings()
                        }
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
                    windowSize={2}
                    removeClippedSubviews={true}
                    renderItem={
                        renderDayPane
                    }/>
                <Sheet modal={true}
                       defaultOpen
                       open={modal_visible}
                       snapPoints={[50]}
                       animationConfig={{
                           type: "spring",
                           damping: 50,
                           stiffness: 500
                       }}
                       onOpenChange={(open: boolean) => {
                           if (!open) {
                               // wait for the sheet to close before clearing the modal element
                               setTimeout(() => {
                                   setSessionInModal(null);
                               }, 500);
                           }
                           setModalVisibility(open);
                       }}
                       dismissOnSnapToBottom
                       disableDrag>
                    <Sheet.Overlay/>
                    <Sheet.Handle/>
                    {
                        // ! There is a bug that causes the sheet frame to glitch upwards when the window frame is open for a few milliseconds
                        // ! This is a fix that sets the background color of the frame to transparent so the glitch can't be seen
                        // ! then creates a View in the sheet with max dimensions and bg white
                    }
                    <Sheet.Frame height={400} backgroundColor={"transparent"}>
                        <Sheet.Frame w={"100%"} h={"100%"} backgroundColor={"white"}>
                            <SessionViewModal session={session_in_modal}/>
                        </Sheet.Frame>
                    </Sheet.Frame>
                </Sheet>
            </YStack>
        </CalendarTabContext.Provider>
    )
}