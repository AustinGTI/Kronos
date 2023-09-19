import React from 'react'
import {Button, Paragraph, View, XStack, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../globals/redux/reducers";
import {FlatList} from "react-native";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../globals/helpers/datetime_functions";
import StackedBarChart, {StackedBarChartDataPoint, StackedBarChartKey} from "../../../globals/components/charts/StackedBarChart";
import {Day} from "../../../globals/types/main";
import {ChevronLeft, ChevronRight} from "@tamagui/lucide-icons";


interface WeeklyStackedBarChartProps {
    active_lead_date_string: string
    setActiveLeadDateString: (date: string) => void
    columns: number
}


export default function WeeklyStackedBarChart({
                                                  active_lead_date_string,
                                                  setActiveLeadDateString,
                                                  columns = 5
                                              }: WeeklyStackedBarChartProps) {
    const {activities, sessions} = useSelector((state: AppState) => ({
        activities: state.activities,
        sessions: state.sessions
    }))

    const flatlist_ref = React.useRef<FlatList<string>>(null)

    const [data, setData] = React.useState<string[]>([active_lead_date_string])
    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<{ width: number, height: number }>({
        width: 0,
        height: 0
    })

    const title_string = React.useMemo(() => {
        // get the first and last date in the interval
        const last_date = DDMMYYYYToDate(active_lead_date_string)
        const first_date = new Date(last_date)
        // since these are weeks, the columns are multiplied by 7
        first_date.setDate(first_date.getDate() - columns * 7 + 1)
        // convert first date to the monday of that week and last date to the sunday of that week
        first_date.setDate(first_date.getDate() - first_date.getDay() + 1)
        last_date.setDate(last_date.getDate() - last_date.getDay() + 7)
        // the title string will be in the format '12 Aug 2021 - 16 Aug 2021'
        return `${first_date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        })} - ${last_date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}`
    }, [active_lead_date_string, columns])

    const getPreviousLeadDateString = React.useCallback((lead_date_string: string) => {
        const date = DDMMYYYYToDate(lead_date_string)
        date.setDate(date.getDate() - 7)
        // move date to sunday of that week
        if (date.getDay() !== 0) {
            date.setDate(date.getDate() - date.getDay() + 7)
        }
        return dateToDDMMYYYY(date)
    }, [])

    const getDataFromLeadDateString = React.useCallback((lead_date_string: string) => {
        const data: StackedBarChartDataPoint[] = []
        const keys: { [key: string]: StackedBarChartKey } = {}
        // get the last day of the week within which the lead date string falls (Sun)
        const last_date = DDMMYYYYToDate(lead_date_string)
        if (last_date.getDay() !== 0) {
            last_date.setDate(last_date.getDate() - last_date.getDay() + 7)
        }
        // from current date to previous date, get the session
        let curr_lead_date_string = dateToDDMMYYYY(last_date)
        for (let i = 0; i < columns; i++) {
            // get all the days of the current week
            const days_of_the_week: Day[] = []
            for (let j = 0; j < 7; j++) {
                // if there are no sessions for the day, return a day object with an empty sessions object
                days_of_the_week.push(!sessions[curr_lead_date_string] ? {
                    date: DDMMYYYYToDate(curr_lead_date_string).toISOString(),
                    sessions: {}
                } : sessions[curr_lead_date_string])
                const date = DDMMYYYYToDate(curr_lead_date_string)
                date.setDate(date.getDate() - 1)
                curr_lead_date_string = dateToDDMMYYYY(date)
            }

            const first_date = DDMMYYYYToDate(curr_lead_date_string)
            first_date.setDate(first_date.getDate() + 1)
            // the label is the date in the format 17/09 as in the first day of the week
            const label = first_date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
            })

            const stack: Map<React.Key, number> = new Map()

            // for every day of the week, add the duration of each session to the stack indexed by activity
            days_of_the_week.forEach((day) => {
                Object.values(day.sessions).forEach((session) => {
                    const duration = session.segments.reduce((total, segment) => {
                        return total + segment.duration
                    }, 0)
                    // add each activity to the keys if it is not already there
                    if (!keys[session.activity_id]) {
                        keys[session.activity_id] = {
                            color: activities[session.activity_id].color,
                            label: activities[session.activity_id].name
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


    // on mount populate data
    React.useEffect(() => {
        updateDataOnEndReached()
    }, [updateDataOnEndReached])


    return (
        <YStack w={'100%'}>
            <XStack w={'100%'} h={40} justifyContent={'center'} alignItems={'center'}>
                <Button onPress={() => {
                    flatlist_ref.current?.scrollToIndex({
                        index: data.findIndex((date) => date === active_lead_date_string) - 1,
                    })
                }}>
                    <ChevronLeft/>
                </Button>
                <Paragraph>
                    {title_string}
                </Paragraph>
                <Button onPress={() => {
                    flatlist_ref.current?.scrollToIndex({
                        index: data.findIndex((date) => date === active_lead_date_string) + 1,
                    })
                }}>
                    <ChevronRight/>
                </Button>
            </XStack>
            <View w={'100%'} flexGrow={1}>
                <FlatList
                    data={data}
                    horizontal={true}
                    style={{width: '100%', height: '100%'}}
                    inverted={true}
                    initialNumToRender={3}
                    windowSize={2}
                    removeClippedSubviews={true}
                    decelerationRate={'fast'}
                    disableIntervalMomentum={true}
                    keyExtractor={(item) => item}
                    renderItem={
                        ({item}) => {
                            const {chart_data, chart_keys} = getDataFromLeadDateString(item)
                            return (
                                <StackedBarChart data={chart_data} keys={chart_keys}/>
                            )
                        }
                    }
                    getItemLayout={(data, index) => {
                        return {
                            length: flatlist_dimensions.height,
                            offset: flatlist_dimensions.height * index,
                            index
                        }
                    }}
                    onLayout={(event) => {
                        const {width, height} = event.nativeEvent.layout
                        setFlatlistDimensions({width, height})
                    }}
                    onScroll={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.y / flatlist_dimensions.height)
                        // set the active lead date string if it is not the same as the current one
                        if (data[index] !== active_lead_date_string) {
                            setActiveLeadDateString(data[index])
                        }
                        // if the lead date is within 2 interval of the end, update the data
                        if (index >= data.length - 2) {
                            updateDataOnEndReached()
                        }
                    }}
                />
            </View>
        </YStack>
    )
}