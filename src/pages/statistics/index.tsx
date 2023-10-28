import React, {useMemo} from 'react'
import {
    Button,
    ButtonProps,
    Grid,
    Paragraph,
    Select,
    Separator,
    Stack,
    ToggleGroup,
    XGroup,
    XStack,
    YStack
} from "tamagui";
import {StackedBarChart} from "react-native-svg-charts"
import {dateToDDMMYYYY} from "../../globals/helpers/datetime_functions";
import DailyStackedBarChart from "./bar-chart-views/daily";
import WeeklyStackedBarChart from "./bar-chart-views/weekly";
import MonthlyStackedBarChart from "./bar-chart-views/monthly";
import {useSelector} from "react-redux";
import selectPlannerState from "../../globals/redux/selectors/plannerTabSelector";
import selectStatisticsState from "../../globals/redux/selectors/statisticsPageSelector";

interface StatsCardProps {
    label: string
    value: number
}

interface ToggleItemProps extends ButtonProps {
    value: string
    active_value: string
    setValue: (value: string) => void
}

enum BarChart {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

const testChartData = [
    {
        day: 'Mon',
        work: 3,
        play: 2,
    },
    {
        day: 'Tue',
        work: 1,
        play: 4,
    },
    {
        day: 'Wed',
        work: 5,
        play: 2,
    },

    {
        day: 'Thur',
        work: 3,
        play: 2,
    },
    {
        day: 'Fri',
        work: 1,
        play: 4,
    },
    {
        day: 'Sat',
        work: 5,
        play: 2,
    },
    {
        day: 'Sun',
        work: 5,
        play: 2,
    }
]

function StatsCard({label, value}: StatsCardProps) {
    return (
        <YStack alignItems={'center'} justifyContent={'center'} w={'45%'} borderRadius={10}
                backgroundColor={'$foreground'}
                padding={10} margin={5} h={'90%'}>
            <Paragraph color={'#999'} fontSize={11} textTransform={'uppercase'}>{label}</Paragraph>
            <Paragraph fontSize={36} lineHeight={36} paddingVertical={10}>{value}</Paragraph>
        </YStack>
    )
}

function ToggleItem({value, active_value, setValue, ...props}: ToggleItemProps) {
    return (
        <Button onPress={() => setValue(value)}
                backgroundColor={value === active_value ? '#ddd' : 'transparent'}
                justifyContent={'center'} {...props}>
            <Paragraph fontSize={12} lineHeight={12} color={'#999'}>{value}</Paragraph>
        </Button>
    )
}

export default function StatisticsPage() {
    const {activities, sessions} = useSelector(selectStatisticsState)
    const [bar_chart, setBarChart] = React.useState<BarChart>(BarChart.DAILY)
    const [active_lead_date_string, setActiveLeadDateString] = React.useState<string>(dateToDDMMYYYY(new Date()))

    const hours_focused = React.useMemo(() => {
        // iterate through each session and add up the total time
        const total_minutes = Object.values(sessions).reduce((total: number, day) => {
            return total + Object.values(day.sessions).reduce((day_total: number, session) => {
                return day_total + session.segments.reduce((session_total: number, segment) => {
                    return session_total + segment.duration
                }, 0)
            }, 0)
        }, 0)

        return Math.floor(total_minutes / 60)
    }, [sessions])

    const total_sessions = React.useMemo(() => {
        return Object.values(sessions).reduce((total: number, day) => {
            return total + Object.values(day.sessions).length
        }, 0)
    }, [sessions])

    const active_days = React.useMemo(() => {
        return Object.values(sessions).reduce((total: number, day) => {
            return total + (Object.values(day.sessions).length > 0 ? 1 : 0)
        }, 0)
    }, [sessions])

    const total_activities = React.useMemo(() => {
        return Object.values(activities).length
    }, [activities])

    return (
        <YStack w={'100%'} h={'100%'} alignItems={'center'} backgroundColor={'$background'}>
            <YStack paddingVertical={5} alignItems={'center'} w={'100%'} h={'35%'}>
                <XStack w={'100%'} justifyContent={'center'} alignItems={'center'} h={'50%'}>
                    <StatsCard label={'Hours Focused'} value={hours_focused}/>
                    <StatsCard label={'Total Sessions'} value={total_sessions}/>
                </XStack>
                <XStack w={'100%'} justifyContent={'center'} alignItems={'center'} h={'50%'}>
                    <StatsCard label={'Active Days'} value={active_days}/>
                    <StatsCard label={'Activities'} value={total_activities}/>
                </XStack>
            </YStack>
            <YStack w={'93%'} padding={10} marginBottom={10} alignItems={'center'} borderRadius={10}
                    backgroundColor={'$foreground'} h={'63%'}>
                <XStack w={'100%'} paddingVertical={5} h={'13%'}>
                    <XStack>
                        <ToggleItem value={BarChart.DAILY} active_value={bar_chart}
                                    borderTopRightRadius={0} borderBottomRightRadius={0}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                        <ToggleItem value={BarChart.WEEKLY} active_value={bar_chart}
                                    borderRadius={0}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                        <ToggleItem value={BarChart.MONTHLY} active_value={bar_chart}
                                    borderTopLeftRadius={0} borderBottomLeftRadius={0}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                    </XStack>
                </XStack>
                <YStack w={'100%'} paddingVertical={10} h={'87%'}>
                    {bar_chart === BarChart.DAILY && (
                        <DailyStackedBarChart
                            activities={activities} sessions={sessions}
                            active_lead_date_string={active_lead_date_string}
                            setActiveLeadDateString={setActiveLeadDateString} columns={5}/>
                    )}
                    {bar_chart === BarChart.WEEKLY && (
                        <WeeklyStackedBarChart
                            activities={activities} sessions={sessions}
                            active_lead_date_string={active_lead_date_string}
                            setActiveLeadDateString={setActiveLeadDateString} columns={7}/>
                    )}
                    {bar_chart === BarChart.MONTHLY && (
                        <MonthlyStackedBarChart
                            activities={activities} sessions={sessions}
                            active_lead_date_string={active_lead_date_string}
                            setActiveLeadDateString={setActiveLeadDateString} columns={4}/>
                    )}
                </YStack>
            </YStack>
        </YStack>
    )
}
