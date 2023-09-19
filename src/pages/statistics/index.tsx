import React, {useMemo} from 'react'
import {Button, Grid, Paragraph, Select, Separator, Stack, ToggleGroup, XGroup, XStack, YStack} from "tamagui";
import {StackedBarChart} from "react-native-svg-charts"
import {dateToDDMMYYYY} from "../../globals/helpers/datetime_functions";
import DailyStackedBarChart from "./bar-chart-views/daily";
import WeeklyStackedBarChart from "./bar-chart-views/weekly";
import MonthlyStackedBarChart from "./bar-chart-views/monthly";

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
        <YStack alignItems={'center'} justifyContent={'center'} w={'45%'} borderRadius={10} backgroundColor={'white'}
                padding={10} margin={5}>
            <Paragraph color={'#999'} fontSize={11} textTransform={'uppercase'}>{label}</Paragraph>
            <Paragraph fontSize={36} lineHeight={36} paddingVertical={10}>{value}</Paragraph>
        </YStack>
    )
}

function ToggleItem({value, active_value, setValue}: ToggleItemProps) {
    return (
        <XGroup.Item>
            <Button onPress={() => setValue(value)}
                    backgroundColor={value === active_value ? '#ddd' : 'transparent'}
                    justifyContent={'center'}>
                <Paragraph fontSize={12} lineHeight={12} color={'#999'}>{value}</Paragraph>
            </Button>
        </XGroup.Item>
    )
}

export default function StatisticsPage() {
    const [bar_chart, setBarChart] = React.useState<BarChart>(BarChart.DAILY)
    const [active_lead_date_string, setActiveLeadDateString] = React.useState<string>(dateToDDMMYYYY(new Date()))
    return (
        <YStack w={'100%'} h={'100%'} alignItems={'center'}>
            <YStack paddingVertical={5} alignItems={'center'} w={'100%'}>
                <XStack w={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <StatsCard label={'Hours Focused'} value={0}/>
                    <StatsCard label={'Total Sessions'} value={0}/>
                </XStack>
                <XStack w={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <StatsCard label={'Active Days'} value={0}/>
                    <StatsCard label={'Activities'} value={0}/>
                </XStack>
            </YStack>
            <YStack w={'93%'} flexGrow={1} padding={10} marginBottom={10} alignItems={'center'} borderRadius={10}
                    backgroundColor={'white'}>
                <XStack w={'100%'}>
                    <XGroup>
                        <ToggleItem value={BarChart.DAILY} active_value={bar_chart}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                        <ToggleItem value={BarChart.WEEKLY} active_value={bar_chart}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                        <ToggleItem value={BarChart.MONTHLY} active_value={bar_chart}
                                    setValue={(value: string) => setBarChart(value as BarChart)}/>
                    </XGroup>
                </XStack>
                <YStack w={'100%'}>
                    {bar_chart === BarChart.DAILY && (
                        <DailyStackedBarChart active_lead_date_string={active_lead_date_string}
                                              setActiveLeadDateString={setActiveLeadDateString} columns={5}/>
                    )}
                    {bar_chart === BarChart.WEEKLY && (
                        <WeeklyStackedBarChart active_lead_date_string={active_lead_date_string}
                                               setActiveLeadDateString={setActiveLeadDateString} columns={7}/>
                    )}
                    {bar_chart === BarChart.MONTHLY && (
                        <MonthlyStackedBarChart active_lead_date_string={active_lead_date_string}
                                                setActiveLeadDateString={setActiveLeadDateString} columns={4}/>
                    )}
                </YStack>
            </YStack>
        </YStack>
    )
}
