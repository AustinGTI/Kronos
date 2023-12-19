import React from 'react'
import {AlertDialog, Button, Paragraph, Sheet, XStack, YStack} from "tamagui";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from "react-redux";
import {FlatList, Keyboard, ListRenderItemInfo, TouchableWithoutFeedback} from "react-native";
import {AppState} from "../../../../globals/redux/reducers";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../../globals/helpers/datetime_functions";
import DayPane from "./DayPane";
import {CalendarTabContext, CalendarTabContextProps} from "./context";
import {Day, Session} from "../../../../globals/types/main";
import SessionViewModal from "./modals/SessionViewModal";
import CalendarPicker from 'react-native-calendar-picker'
import KronosPage from "../../../../globals/components/wrappers/KronosPage";
import CalendarSideBar from "./CalendarSideBar";
import calendarTabSelector from "../../../../globals/redux/selectors/calendarTabSelector";
import {endSession} from "../../../../globals/redux/reducers/sessionsReducer";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";

interface Dimensions {
    width: number
    height: number
}

const INITIAL_NO_OF_DATES = 7
const EXTENSION_NO_OF_DATES = 7

export default function CalendarTab() {
    // Region STATES AND CONTEXTS
    // ? ........................

    const {sessions: sessions_state} = useSelector(calendarTabSelector)
    const dispatch = useDispatch()

    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<Dimensions>({
        width: 0,
        height: 0
    })
    const flatlist_ref = React.useRef<FlatList<string>>(null)
    const [active_date_as_obj, setActiveDateAsObj] = React.useState<Date>(new Date())
    const [target_date_as_dmy, setTargetDateAsDmy] = React.useState<string | null>(null)

    const [modal_visible, setModalVisibility] = React.useState<boolean>(false)
    const [session_in_modal, setSessionInModal] = React.useState<Session | null>(null)

    const [date_picker_visible, setDatePickerVisibility] = React.useState<boolean>(false)
    const [dates_as_dmy, setDatesAsDmy] = React.useState<string[]>(() => {
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

    // ? ........................
    // End ........................


    // Region CALLBACKS
    // ? ........................

    const extendDateStrings = React.useCallback(() => {
        // this is meant to be called when the user scrolls to the top of the flatlist
        // starting from the last date in dates_as_dmy, generate a series of dates going back in time equal to EXTENSION_NO_OF_DATES
        const last_date = DDMMYYYYToDate(dates_as_dmy[dates_as_dmy.length - 1])
        const date_strings: string[] = [...dates_as_dmy]
        for (let i = 1; i <= EXTENSION_NO_OF_DATES; i++) {
            const date = new Date(last_date)
            date.setDate(last_date.getDate() - i)
            date_strings.push(dateToDDMMYYYY(date))
        }
        setDatesAsDmy(date_strings)
        console.log('new date strings are', date_strings)
    }, [dates_as_dmy, setDatesAsDmy])

    const renderDayPane = React.useCallback(({item: date_as_dmy}: ListRenderItemInfo<string>) => {
        // get the day from the date_as_iso
        const day: Day = (
            // if the day is not within the sessions_store, create a new day object with date_as_iso set and sessions object empty
            !sessions_state[date_as_dmy] ? {
                date_as_iso: DDMMYYYYToDate(date_as_dmy).toISOString(),
                sessions: {}
            } : sessions_state[date_as_dmy]
        )
        return (
            <DayPane day={day}/>
        )
    }, [sessions_state])

    // ? ........................
    // End ........................


    // Region EFFECTS
    // ? ........................

    // for clean up purposes, for each session that is not today, check if it is still ongoing, if so, it is likely that the app closed before
    // it had a chance to be properly ended. use dispatch to end the session with the end time being the sum of all the
    // segment durations
    React.useEffect(() => {
        for (const day of Object.values(sessions_state)) {
            // check if the date of this day is today
            if (dateToDDMMYYYY(new Date(day.date_as_iso)) === dateToDDMMYYYY(new Date())) continue
            for (const session of Object.values(day.sessions)) {
                if (session.is_ongoing) {
                    let duration = 0
                    for (const segment of session.segments) {
                        duration += segment.duration
                    }
                    const end_time = new Date(new Date(session.start_time).getTime() + duration * 60 * 1000)
                    dispatch(endSession({
                        session_id: session.id,
                        end_time: end_time.toISOString()
                    }))
                }
            }
        }
    }, [sessions_state])

    /**
     * an effect that scrolls the flatlist to the target date if it is not set to null, used to control
     * jumping to a new date when it is selected on the calendar
     */
    React.useEffect(() => {
        if (!target_date_as_dmy) return
        // if the target date_as_iso is not within dates, extend dates until it is
        if (!dates_as_dmy.includes(target_date_as_dmy)) {
            const new_dates = [...dates_as_dmy]
            // starting from the last date in dates_as_dmy, generate a series of dates until the selected date is included
            let last_date_as_dmy = dates_as_dmy[dates_as_dmy.length - 1]
            while (last_date_as_dmy !== target_date_as_dmy) {
                const date_as_obj = DDMMYYYYToDate(last_date_as_dmy)
                date_as_obj.setDate(date_as_obj.getDate() - 1)
                last_date_as_dmy = dateToDDMMYYYY(date_as_obj)
                new_dates.push(last_date_as_dmy)
            }
            setDatesAsDmy(new_dates)
        } else {
            // scroll to the target date and set the target date to null
            const index = dates_as_dmy.findIndex((date) => date === target_date_as_dmy)
            console.log('scrolling to index', index)
            flatlist_ref.current?.scrollToIndex({index, animated: true})
            setTargetDateAsDmy(null)
        }
    }, [target_date_as_dmy, dates_as_dmy])

    // ? ........................
    // End ........................


    // Region MEMOS
    // ? ........................

    /**
     * the active day which is the Day object in the sessions state that corresponds to the current active_date or an empty
     * day if that is not available
     */
    const active_day: Day = React.useMemo(() => {
        // if the active day is recorded in sessions state, return it
        const active_date_as_dmy = dateToDDMMYYYY(active_date_as_obj)
        if (sessions_state[active_date_as_dmy]) {
            return sessions_state[active_date_as_dmy]
        } else {
            // else build a new day object with the date and blank sessions object
            return {
                date_as_iso: active_date_as_obj.toISOString(),
                sessions: {}
            } as Day
        }
    }, [active_date_as_obj, sessions_state]);

    /**
     * the required context values for the calendar page
     */
    const calendar_tab_context: CalendarTabContextProps = React.useMemo(() => {
        console.log('recalculating calendar tab context')
        return {
            date_data: {
                active_date: active_date_as_obj, setActiveDate: setActiveDateAsObj
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
    }, [active_date_as_obj, flatlist_dimensions.width, flatlist_dimensions.height, setActiveDateAsObj, setModalVisibility, setSessionInModal, setDatePickerVisibility])

    // ? ........................
    // End ........................


    return (
        <CalendarTabContext.Provider value={calendar_tab_context}>
            <KronosPage>
                <XStack w={'100%'} f={1}>
                    <CalendarSideBar day={active_day} setTargetDateAsDDMMYYYY={setTargetDateAsDmy} w={'30%'}
                                     h={'100%'}/>
                    <KronosContainer w={'70%'} h={'100%'}>
                        <YStack height={'100%'} width={'100%'} ai={'center'} backgroundColor={'$background'}>
                            <FlatList
                                ref={flatlist_ref}
                                style={{width: '100%', height: '100%'}}
                                data={dates_as_dmy}
                                inverted={true}
                                onLayout={(event) => {
                                    const {height, width} = event.nativeEvent.layout
                                    setFlatlistDimensions({width, height})
                                }}
                                onScroll={(event) => {
                                    const index = Math.round(event.nativeEvent.contentOffset.y / flatlist_dimensions.height)
                                    // set the active date_as_iso if it is not already the active date_as_iso
                                    if (dates_as_dmy[index] !== dateToDDMMYYYY(active_date_as_obj)) {
                                        setActiveDateAsObj(DDMMYYYYToDate(dates_as_dmy[index]))
                                    }
                                    // if the index is 2 or less away from the end of the list, extend the list
                                    if (dates_as_dmy.length - index <= 2) {
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
                        </YStack>
                    </KronosContainer>
                </XStack>
                {/*<Sheet modal={true}*/}
                {/*       defaultOpen*/}
                {/*       open={modal_visible}*/}
                {/*       snapPoints={[50]}*/}
                {/*       animationConfig={{*/}
                {/*           type: "spring",*/}
                {/*           damping: 50,*/}
                {/*           stiffness: 500*/}
                {/*       }}*/}
                {/*       onOpenChange={(open: boolean) => {*/}
                {/*           if (!open) {*/}
                {/*               // wait for the sheet to close before clearing the modal element*/}
                {/*               setTimeout(() => {*/}
                {/*                   setSessionInModal(null);*/}
                {/*               }, 500);*/}
                {/*           }*/}
                {/*           setModalVisibility(open);*/}
                {/*       }}*/}
                {/*       dismissOnSnapToBottom*/}
                {/*       disableDrag>*/}
                {/*    <Sheet.Overlay/>*/}
                {/*    <Sheet.Handle/>*/}
                {/*    {*/}
                {/*        // ! There is a bug that causes the sheet frame to glitch upwards when the window frame is open for a few milliseconds*/}
                {/*        // ! This is a fix that sets the background color of the frame to transparent so the glitch can't be seen*/}
                {/*        // ! then creates a View in the sheet with max dimensions and bg white*/}
                {/*    }*/}
                {/*    <Sheet.Frame height={400} backgroundColor={"transparent"} borderTopWidth={2}*/}
                {/*                 borderColor={'$border'}>*/}
                {/*        <Sheet.Frame w={"100%"} h={"100%"} backgroundColor={"$background"}>*/}
                {/*            <SessionViewModal session={session_in_modal}/>*/}
                {/*        </Sheet.Frame>*/}
                {/*    </Sheet.Frame>*/}
                {/*</Sheet>*/}
                {/*<AlertDialog*/}
                {/*    open={date_picker_visible}*/}
                {/*    onOpenChange={setDatePickerVisibility}>*/}
                {/*    <AlertDialog.Portal>*/}
                {/*        <AlertDialog.Overlay*/}
                {/*            key="overlay"*/}
                {/*            animation="quick"*/}
                {/*            opacity={0.5}*/}
                {/*            enterStyle={{opacity: 0}}*/}
                {/*            exitStyle={{opacity: 0}}*/}
                {/*        />*/}
                {/*        <AlertDialog.Content*/}
                {/*            bordered*/}
                {/*            elevate*/}
                {/*            key="content"*/}
                {/*            animation={[*/}
                {/*                'quick',*/}
                {/*                {*/}
                {/*                    opacity: {*/}
                {/*                        overshootClamping: true,*/}
                {/*                    },*/}
                {/*                },*/}
                {/*            ]}*/}
                {/*            enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}*/}
                {/*            exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}*/}
                {/*            x={0}*/}
                {/*            scale={1}*/}
                {/*            opacity={1}*/}
                {/*            y={0}*/}
                {/*            maxWidth={'90%'}>*/}
                {/*            <YStack w={'100%'}>*/}
                {/*                <CalendarPicker*/}
                {/*                    initialDate={active_date_as_obj}*/}
                {/*                    width={300}*/}
                {/*                    disabledDates={(date) => {*/}
                {/*                        // any date_as_iso after today is disabled*/}
                {/*                        return date.isAfter(new Date())*/}
                {/*                    }}*/}
                {/*                    onDateChange={(date) => {*/}
                {/*                        // convert from moment to Date and set to active date_as_iso then close the date_as_iso picker*/}
                {/*                        setTargetDateAsDmy(dateToDDMMYYYY(date.toDate()))*/}
                {/*                        setDatePickerVisibility(false)*/}
                {/*                    }}/>*/}
                {/*            </YStack>*/}
                {/*        </AlertDialog.Content>*/}
                {/*    </AlertDialog.Portal>*/}
                {/*</AlertDialog>*/}
            </KronosPage>
        </CalendarTabContext.Provider>
    )
}