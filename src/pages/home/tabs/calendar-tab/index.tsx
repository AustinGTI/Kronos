import React from 'react'
import {AlertDialog, Button, Paragraph, Sheet, XStack, YStack} from "tamagui";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useSelector} from "react-redux";
import {FlatList, Keyboard, ListRenderItemInfo, TouchableWithoutFeedback} from "react-native";
import {AppState} from "../../../../globals/redux/reducers";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../../globals/helpers/datetime_functions";
import DayPane from "./DayPane";
import {CalendarTabContext, CalendarTabContextProps} from "./context";
import {Session} from "../../../../globals/types/main";
import SessionViewModal from "./modals/SessionViewModal";
import CalendarPicker from 'react-native-calendar-picker'

interface Dimensions {
    width: number
    height: number
}

const INITIAL_NO_OF_DATES = 7
const EXTENSION_NO_OF_DATES = 7

export default function CalendarTab() {
    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<Dimensions>({width: wp('90%'), height: hp('90%')})

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

    const flatlist_ref = React.useRef<FlatList<string>>(null)
    const [active_date, setActiveDate] = React.useState<Date>(new Date())
    const [target_date_string, setTargetDateString] = React.useState<string | null>(null)

    const [modal_visible, setModalVisibility] = React.useState<boolean>(false)
    const [session_in_modal, setSessionInModal] = React.useState<Session | null>(null)

    const [date_picker_visible, setDatePickerVisibility] = React.useState<boolean>(false)


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
            date_picker_data: {
                setDatePickerVisibility
            },
            dimensions_data: {
                calendar_width: flatlist_dimensions.width,
                calendar_height: flatlist_dimensions.height
            }
        }
    }, [active_date, flatlist_dimensions.width, flatlist_dimensions.height])

    React.useEffect(() => {
        // an effect that scrolls the flatlist to the target date if it is not null
        if (!target_date_string) return
        // if the target date is not within dates, extend dates until it is
        if (!dates.includes(target_date_string)) {
            const new_dates = [...dates]
            // starting from the last date in dates, generate a series of dates until the selected date is included
            let last_date_string = dates[dates.length - 1]
            while (last_date_string !== target_date_string) {
                const date = DDMMYYYYToDate(last_date_string)
                date.setDate(date.getDate() - 1)
                last_date_string = dateToDDMMYYYY(date)
                new_dates.push(last_date_string)
            }
            setDates(new_dates)
        } else {
            // scroll to the target date and set the target date to null
            const index = dates.findIndex((date) => date === target_date_string)
            console.log('scrolling to index', index)
            flatlist_ref.current?.scrollToIndex({index, animated: true})
            setTargetDateString(null)
        }
    }, [target_date_string, dates])


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
            <YStack height={'100%'} ai={'center'} backgroundColor={'$background'}>
                <FlatList
                    ref={flatlist_ref}
                    style={{width: '100%', height: '100%'}}
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
                    // getItemLayout={(data, index) => {
                    //     return {
                    //         length: flatlist_dimensions.height,
                    //         offset: flatlist_dimensions.height * index,
                    //         index
                    //     }
                    // }}
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
                    <Sheet.Frame height={400} backgroundColor={"transparent"} borderTopWidth={2} borderColor={'$border'}>
                        <Sheet.Frame w={"100%"} h={"100%"} backgroundColor={"$background"}>
                            <SessionViewModal session={session_in_modal}/>
                        </Sheet.Frame>
                    </Sheet.Frame>
                </Sheet>
                <AlertDialog
                    open={date_picker_visible}
                    onOpenChange={setDatePickerVisibility}>
                    <AlertDialog.Portal>
                        <AlertDialog.Overlay
                            key="overlay"
                            animation="quick"
                            opacity={0.5}
                            enterStyle={{opacity: 0}}
                            exitStyle={{opacity: 0}}
                        />
                        <AlertDialog.Content
                            bordered
                            elevate
                            key="content"
                            animation={[
                                'quick',
                                {
                                    opacity: {
                                        overshootClamping: true,
                                    },
                                },
                            ]}
                            enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}
                            exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}
                            x={0}
                            scale={1}
                            opacity={1}
                            y={0}
                            maxWidth={'90%'}>
                            <YStack w={'100%'}>
                                <CalendarPicker
                                    initialDate={active_date}
                                    width={300}
                                    disabledDates={(date) => {
                                        // any date after today is disabled
                                        return date.isAfter(new Date())
                                    }}
                                    onDateChange={(date) => {
                                        // convert from moment to Date and set to active date then close the date picker
                                        setTargetDateString(dateToDDMMYYYY(date.toDate()))
                                        setDatePickerVisibility(false)
                                    }}/>
                            </YStack>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog>
            </YStack>
        </CalendarTabContext.Provider>
    )
}