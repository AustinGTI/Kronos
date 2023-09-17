import React from 'react'
import {View, XStack, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../globals/redux/reducers";
import {FlatList} from "react-native";
import {dateToDDMMYYYY, DDMMYYYYToDate} from "../../../globals/helpers/datetime_functions";
import {StackedBarChartDataPoint, StackedBarChartKey} from "../../../globals/components/charts/StackedBarChart";
import {Day} from "../../../globals/types/main";


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
        // the title string will be in the format '12 Aug 2021 - 16 Aug 2021'
        return `${first_date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short'
        })} - ${last_date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}`
    }, [active_lead_date_string, columns])

    const getPreviousLeadDateString = React.useCallback((lead_date_string: string) => {
        const date = DDMMYYYYToDate(lead_date_string)
        date.setDate(date.getDate() - columns * 7)
        return dateToDDMMYYYY(date)
    }, [columns])

    const getDataFromLeadDateString = React.useCallback((lead_date_string: string) => {
        const data: StackedBarChartDataPoint[] = []
        const keys: { [key: string]: StackedBarChartKey } = {}
        // from current date to previous date, get the session
        let curr_lead_date_string = lead_date_string
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

            // the label is the date in the format 17/09 as in the first day of the week
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
                    keys[session.activity_id] = {
                        color: activities[session.activity_id].color,
                        label: activities[session.activity_id].name
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

    return (
        <YStack w={'100%'}>
            <XStack w={'100%'} h={40} justifyContent={'center'} alignItems={'center'}>
            </XStack>
            <View w={'100%'} flexGrow={1}>
            </View>
        </YStack>
    )
}