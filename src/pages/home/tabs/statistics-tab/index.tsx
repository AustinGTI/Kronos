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
import {dateToDDMMYYYY} from "../../../../globals/helpers/datetime_functions";
import DailyStackedBarChart from "./bar-chart-views/daily";
import WeeklyStackedBarChart from "./bar-chart-views/weekly";
import MonthlyStackedBarChart from "./bar-chart-views/monthly";
import {useSelector} from "react-redux";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import selectStatisticsState from "../../../../globals/redux/selectors/statisticsPageSelector";
import {SECONDARY_COLOR} from "../../../../globals/types/main";
import {StatusBar} from "react-native";
import {widthPercentageToDP} from "react-native-responsive-screen";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";
import KronosPage from "../../../../globals/components/wrappers/KronosPage";
import KronosButton from "../../../../globals/components/wrappers/KronosButton";

interface StatsCardProps {
    label: string
    value: number
}

interface ToggleItemProps {
    value: string
    active_value: string
    setValue: (value: string) => void
}

enum BarChart {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}


function StatsCard({label, value}: StatsCardProps) {
    return (
        <KronosContainer w={'50%'} h={'100%'}>
            <YStack alignItems={'center'} justifyContent={'center'} w={'100%'} h={'100%'}>
                <Paragraph textTransform={'uppercase'}>{label}</Paragraph>
                <Paragraph fontSize={36} lineHeight={42} paddingVertical={10}>{value}</Paragraph>
            </YStack>
        </KronosContainer>
    )
}

function ToggleItem({value, active_value, setValue}: ToggleItemProps) {
    return (
        <KronosButton
            onPress={() => setValue(value)}
            label={value}
            is_active={value === active_value}/>
    )
}

export default function StatisticsTab() {
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
        <KronosPage>
            <YStack w={'100%'} h={'100%'} alignItems={'center'}>
                <YStack paddingVertical={5} alignItems={'center'} w={'100%'} h={'40%'}>
                    <XStack w={'100%'} justifyContent={'center'} alignItems={'center'} h={'50%'}>
                        <StatsCard label={'Hours Focused'} value={hours_focused}/>
                        <StatsCard label={'Total Sessions'} value={total_sessions}/>
                    </XStack>
                    <XStack w={'100%'} justifyContent={'center'} alignItems={'center'} h={'50%'}>
                        <StatsCard label={'Active Days'} value={active_days}/>
                        <StatsCard label={'Activities'} value={total_activities}/>
                    </XStack>
                </YStack>
                <KronosContainer w={'70%'} h={'7%'} padding={0}>
                    <XStack w={'100%'} h={'100%'} justifyContent={'space-around'}>
                        <ToggleItem value={BarChart.DAILY} active_value={bar_chart}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                        <ToggleItem value={BarChart.WEEKLY} active_value={bar_chart}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                        <ToggleItem value={BarChart.MONTHLY} active_value={bar_chart}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                    </XStack>
                </KronosContainer>
                <KronosContainer w={'100%'} h={'53%'}>
                    <YStack w={'100%'} alignItems={'center'} h={'100%'}>
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
                </KronosContainer>
            </YStack>
        </KronosPage>
    )
}
