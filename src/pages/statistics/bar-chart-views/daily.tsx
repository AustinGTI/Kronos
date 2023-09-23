import React from 'react'
import {Button, Paragraph, View, XStack, YStack} from "tamagui";
import {FlatList} from "react-native";
import {useSelector} from "react-redux";
import {AppState} from "../../../globals/redux/reducers";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../globals/helpers/datetime_functions";
import StackedBarChart, {
    StackedBarChartDataPoint,
    StackedBarChartKey
} from "../../../globals/components/charts/StackedBarChart";
import {Day, UNTITLED_ACTIVITY} from "../../../globals/types/main";
import {ChevronLast, ChevronLeft, ChevronRight} from "@tamagui/lucide-icons";
import {ActivitiesState} from "../../../globals/redux/reducers/activitiesReducer";
import {SessionsState} from "../../../globals/redux/reducers/sessionsReducer";

interface DailyStackedBarChartProps {
    activities: ActivitiesState
    sessions: SessionsState
    active_lead_date_string: string
    setActiveLeadDateString: (date: string) => void
    columns: number
}

export default function DailyStackedBarChart({
                                                 activities, sessions,
                                                 active_lead_date_string,
                                                 setActiveLeadDateString,
                                                 columns = 5
                                             }: DailyStackedBarChartProps) {

    const flatlist_ref = React.useRef<FlatList<string>>(null)

    const [data, setData] = React.useState<string[]>([dateToDDMMYYYY(new Date())])
    const [flatlist_dimensions, setFlatlistDimensions] = React.useState<{ width: number, height: number }>({
        width: 0,
        height: 0
    })

    const title_string = React.useMemo(() => {
        // get the first and last date in the interval
        const last_date = DDMMYYYYToDate(active_lead_date_string)
        const first_date = new Date(last_date)
        first_date.setDate(first_date.getDate() - columns + 1)
        // the title string will be in the format '12 Aug 2021 - 16 Aug 2021'
        return `${first_date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })} - ${last_date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })}`
    }, [active_lead_date_string, columns])

    const getPreviousLeadDateString = React.useCallback((lead_date_string: string) => {
        const date = DDMMYYYYToDate(lead_date_string)
        date.setDate(date.getDate() - columns)
        return dateToDDMMYYYY(date)
    }, [columns])

    const getDataFromLeadDateString = React.useCallback((lead_date_string: string) => {
        const data: StackedBarChartDataPoint[] = []
        const keys: { [key: string]: StackedBarChartKey } = {}
        // from current date to previous date, get the session
        let curr_lead_date_string = lead_date_string
        for (let i = 0; i < columns; i++) {
            // if there are no sessions for the day, return a day object with an empty sessions object
            const day: Day = !sessions[curr_lead_date_string] ? {
                date: DDMMYYYYToDate(curr_lead_date_string).toISOString(),
                sessions: {}
            } : sessions[curr_lead_date_string];

            // the label is the date in the format 17 Sept
            const label = DDMMYYYYToDate(curr_lead_date_string).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short'
            })

            const stack: Map<React.Key, number> = new Map()
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
            }, new Map())

            const data_point: StackedBarChartDataPoint = {
                label, stack
            }
            data.push(data_point)
            const date = DDMMYYYYToDate(curr_lead_date_string)
            date.setDate(date.getDate() - 1)
            curr_lead_date_string = dateToDDMMYYYY(date)
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


    // on mount and flatlist ref available, scroll to the active lead date
    React.useEffect(() => {
        flatlist_ref.current?.scrollToIndex({
            index: data.findIndex((date) => date === active_lead_date_string),
        })
    }, [flatlist_ref])

    return (
        <YStack w={'100%'} h={'90%'}>
            <XStack w={'100%'} h={40} justifyContent={'center'} alignItems={'center'}>
                <Button
                    backgroundColor={'transparent'}
                    onPress={() => {
                        flatlist_ref.current?.scrollToIndex({
                            index: data.findIndex((date) => date === active_lead_date_string) + 1,
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
                    disabled={active_lead_date_string === dateToDDMMYYYY(new Date())}
                    onPress={() => {
                        flatlist_ref.current?.scrollToIndex({
                            index: data.findIndex((date) => date === active_lead_date_string) - 1,
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
                    style={{width: '100%', height: '100%'}}
                    inverted={true}
                    initialNumToRender={3}
                    windowSize={2}
                    removeClippedSubviews={true}
                    snapToInterval={flatlist_dimensions.width}
                    decelerationRate={'fast'}
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
