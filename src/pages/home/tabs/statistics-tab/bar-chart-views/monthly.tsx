import React from 'react'
import {FlatList} from "react-native";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../../../globals/helpers/datetime_functions";
import StackedBarChart, {
    StackedBarChartDataPoint,
    StackedBarChartKey
} from "../../../../../globals/components/charts/StackedBarChart";
import {Day, UNTITLED_ACTIVITY} from "../../../../../globals/types/main";
import {Button, Paragraph, View, XStack, YStack} from "tamagui";
import {ChevronLeft, ChevronRight} from "@tamagui/lucide-icons";
import {ActivitiesState} from "../../../../../globals/redux/reducers/activitiesReducer";
import {SessionsState} from "../../../../../globals/redux/reducers/sessionsReducer";


interface MonthlyStackedBarChartProps {
    activities: ActivitiesState
    sessions: SessionsState
    active_lead_date_string: string
    setActiveLeadDateString: (date: string) => void
    columns: number
}


export default function MonthlyStackedBarChart({
                                                   activities, sessions,
                                                   active_lead_date_string,
                                                   setActiveLeadDateString,
                                                   columns = 5
                                               }: MonthlyStackedBarChartProps) {
    const getIntervalDateFromDateString = React.useCallback((date_string: string) => {
        // get the first day of the month of the active lead date_as_iso
        const date = DDMMYYYYToDate(date_string)
        date.setDate(1)
        return dateToDDMMYYYY(date)
    }, [])

    const getPreviousLeadDateString = React.useCallback((lead_date_string: string) => {
        const date = DDMMYYYYToDate(lead_date_string)
        date.setMonth(date.getMonth() - columns)
        // move date_as_iso to the first of that month
        date.setDate(1)
        return dateToDDMMYYYY(date)
    }, [columns])

    const flatlist_ref = React.useRef<FlatList<string>>(null)

    const [data, setData] = React.useState<string[]>(() => {
        const initial_data: string[] = [getIntervalDateFromDateString(dateToDDMMYYYY(new Date()))]
        // increase data while the last date_as_iso is more than active lead date_as_iso or length of data is less than 3
        while (initial_data.length < 3) {
            initial_data.push(getPreviousLeadDateString(initial_data[initial_data.length - 1]))
        }
        return initial_data
    })

    const [active_date, setActiveDate] = React.useState<string>(getIntervalDateFromDateString(dateToDDMMYYYY(new Date())))

    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<{ width: number, height: number }>({
        width: 0,
        height: 0
    })

    const title_string = React.useMemo(() => {
        // the leading date_as_iso is within the first month
        const last_date = DDMMYYYYToDate(active_date)
        const first_date = new Date(last_date)
        // move back by the number of columns to the first of the month of the first month
        first_date.setMonth(first_date.getMonth() - columns + 1)
        first_date.setDate(1)
        // the title string will be in the format 'Aug 2021 - Aug 2021'
        return `${first_date.toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric'
        })} - ${last_date.toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric'
        })}`
    }, [active_date, columns])

    const getDataFromLeadDateString = React.useCallback((lead_date_string: string) => {
        const data: StackedBarChartDataPoint[] = []
        const keys: { [key: string]: StackedBarChartKey } = {}
        // get the last day of the month within which the lead date_as_iso string is
        const last_date = DDMMYYYYToDate(lead_date_string)
        last_date.setMonth(last_date.getMonth() + 1)
        last_date.setDate(0)
        // from the current date_as_iso, move back up to the previous month while adding the sessions to the data
        let curr_lead_date_string = dateToDDMMYYYY(last_date)
        for (let i = 0; i < columns; i++) {
            const this_month = DDMMYYYYToDate(curr_lead_date_string).getMonth()
            // get all the days of the current month
            const days_of_month: Day[] = []
            // while curr_lead_date_string is within the current month, add the sessions to the data
            while (DDMMYYYYToDate(curr_lead_date_string).getMonth() === this_month) {
                // if there are no sessions for the day, return a day object with an empty sessions object
                days_of_month.push(!sessions[curr_lead_date_string] ? {
                    date_as_iso: DDMMYYYYToDate(curr_lead_date_string).toISOString(),
                    sessions: {}
                } : sessions[curr_lead_date_string])
                const date = DDMMYYYYToDate(curr_lead_date_string)
                date.setDate(date.getDate() - 1)
                curr_lead_date_string = dateToDDMMYYYY(date)
            }

            const first_date = DDMMYYYYToDate(curr_lead_date_string)
            first_date.setDate(first_date.getDate() + 1)
            // the label is the month in the format Aug
            const label = first_date.toLocaleDateString('en-GB', {
                month: 'short'
            })

            const stack: Map<React.Key, number> = new Map()

            // for every day of the month, add the increment of each session to the stack indexed by activity
            days_of_month.forEach((day) => {
                Object.values(day.sessions).forEach((session) => {
                    const duration = session.segments.reduce((total, segment) => {
                        return total + segment.duration
                    }, 0)
                    // add each activity to the keys if it is not already there
                    if (!keys[session.activity_id]) {
                        const activity = activities[session.activity_id] ?? UNTITLED_ACTIVITY
                        keys[session.activity_id] = {
                            color: activity.color,
                            label: activity.name
                        }
                    }
                    stack.set(session.activity_id, (stack.get(session.activity_id) ?? 0) + duration)
                })
            })

            const data_point: StackedBarChartDataPoint = {
                label, stack
            }
            data.push(data_point)
        }
        return {
            chart_data: [...data].reverse(),
            chart_keys: keys
        }
    }, [columns, sessions, activities])


    const updateDataOnEndReached = React.useCallback(() => {
        setData((data) => {
            const new_data = [...data]
            // increase data by 3 intervals
            for (let i = 0; i < 3; i++) {
                new_data.push(getPreviousLeadDateString(new_data[new_data.length - 1]))
            }
            return new_data
        })
    }, [getPreviousLeadDateString, setData])


    // on mount and flatlist ref available, scroll to the active lead date_as_iso
    // React.useEffect(() => {
    //     let closest_lead_date = getIntervalDateFromDateString(active_lead_date_string)
    //     let index = -1
    //     // move 1 month at a time until the closest lead date_as_iso is reached
    //     while (true) {
    //         if (data.findIndex((date_as_iso) => date_as_iso === closest_lead_date) !== -1) {
    //             index = data.findIndex((date_as_iso) => date_as_iso === closest_lead_date)
    //             break
    //         }
    //         const date_as_iso = DDMMYYYYToDate(closest_lead_date)
    //         date_as_iso.setMonth(date_as_iso.getMonth() + 1)
    //         closest_lead_date = dateToDDMMYYYY(date_as_iso)
    //     }
    //     console.log('the data is',data)
    //     console.log('the active lead date_as_iso on mount is', active_lead_date_string)
    //     console.log('the closest lead date_as_iso is',closest_lead_date)
    //     console.log('on mount, scrolling to index', index)
    //     flatlist_ref.current?.scrollToIndex({index})
    // }, [flatlist_ref])


    return (
        <YStack w={'100%'}>
            <XStack w={'100%'} h={'20%'} justifyContent={'center'} alignItems={'center'}>
                <Button
                    backgroundColor={'transparent'}
                    onPress={() => {
                        console.log('the dates are', data)
                        console.log('the active lead date_as_iso string is', active_date, ' and converted to a leaddatestring is ', getIntervalDateFromDateString(active_date))
                        console.log('the previous index is', data.findIndex((date) => date === getIntervalDateFromDateString(active_date)) + 1)
                        flatlist_ref.current?.scrollToIndex({
                            index: data.findIndex((date) => date === getIntervalDateFromDateString(active_date)) + 1,
                            animated: true
                        })
                    }}>
                    <ChevronLeft/>
                </Button>
                <Paragraph>
                    {title_string}
                </Paragraph>
                <Button
                    backgroundColor={'transparent'}
                    disabled={getIntervalDateFromDateString(active_date) === getIntervalDateFromDateString(dateToDDMMYYYY(new Date()))}
                    onPress={() => {
                        flatlist_ref.current?.scrollToIndex({
                            index: data.findIndex((date) => date === getIntervalDateFromDateString(active_date)) - 1,
                            animated: true
                        })
                    }}>
                    <ChevronRight/>
                </Button>
            </XStack>
            <View w={'100%'} flexGrow={1}>
                <FlatList
                    ref={flatlist_ref}
                    data={data}
                    horizontal={true}
                    style={{width: '100%', height: '80%'}}
                    inverted={true}
                    initialNumToRender={3}
                    windowSize={3}
                    removeClippedSubviews={true}
                    snapToInterval={flatlist_dimensions.width}
                    decelerationRate={'fast'}
                    showsHorizontalScrollIndicator={false}
                    disableIntervalMomentum={true}
                    keyExtractor={(item) => item}
                    renderItem={
                        ({item}) => {
                            const {chart_data, chart_keys} = getDataFromLeadDateString(item)
                            return (
                                <StackedBarChart data={chart_data} keys={chart_keys} width={flatlist_dimensions.width}
                                                 height={flatlist_dimensions.height}/>
                            )
                        }
                    }
                    getItemLayout={(data, index) => {
                        return {
                            length: flatlist_dimensions.width,
                            offset: flatlist_dimensions.width * index,
                            index
                        }
                    }}
                    onLayout={(event) => {
                        const {width, height} = event.nativeEvent.layout
                        setFlatlistDimensions({width, height})
                    }}
                    onScroll={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / flatlist_dimensions.width)
                        // set the active lead date_as_iso string if it is not the same as the current one
                        if (data[index] !== active_date) {
                            setActiveDate(data[index])
                        }
                        // if the lead date_as_iso is within 2 interval of the end, update the data
                        if (index >= data.length - 2) {
                            updateDataOnEndReached()
                        }
                    }}
                />
            </View>
        </YStack>
    )
}
