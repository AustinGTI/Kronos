import React from 'react'
import {View, XStack, YStack} from "tamagui";

export interface StackedBarChartDataPoint {
    label: string
    stack: {
        key: React.Key // should be the name of the data value
        amount: number
    }[]
}

export interface StackedBarChartKey {
    color: string
    label: string
}

export type StackedBarChartProps = {
    data: StackedBarChartDataPoint[]
    keys: {
        [key: string]: StackedBarChartKey
    }
}

export default function StackedBarChart({data, keys}: StackedBarChartProps) {
    // this is the amount represented by the full height of the chart, the highest bar will be 90% of this height
    const max_amount = React.useMemo(() => {
        return data.reduce((max, data_point) => {
            return Math.max(max, data_point.stack.reduce((total, stack) => {
                return total + stack.amount
            }, 0))
        }, 0) * 10/9
    }, [data])
    return (
        <YStack w={'100%'}>
            <XStack w={'100%'}>
                {/* the amount labels on the left */}
                <YStack w={50}>
                </YStack>
                {/* the bars */}
                <XStack flexGrow={1}>
                </XStack>
            </XStack>
            <XStack w={'100%'}>
                <View w={50}/>
                {/* the labels on the bottom */}
                <XStack flexGrow={1}>
                </XStack>
            </XStack>
        </YStack>
    )
}