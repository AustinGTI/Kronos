import React from 'react'
import {Paragraph, View, XStack, YStack} from "tamagui";
import {Dimensions} from "react-native";


export interface StackedBarChartDataPoint {
    label: string
    stack: Map<React.Key, number>
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
            return Math.max(max, Array.from(data_point.stack.values()).reduce((total, amount) => {
                return total + amount
            }, 0))
        }, 0) * 10 / 9
    }, [data])

    // get the amount in 5 labels
    const x_labels = React.useMemo(() => {
        const intervals = []
        for (let i = 0; i < 5; i++) {
            intervals.push(max_amount * (i) / 5)
        }
        return intervals
    }, [max_amount])

    // calculate the interval over which the y_labels will be displayed. Only 5 labels can fit
    const y_label_interval = React.useMemo(() => {
        return Math.ceil(data.length / 5)
    }, [data.length])

    return (
        <YStack w={300} h={50} backgroundColor={'purple'}>
            <XStack w={'100%'} backgroundColor={'aqua'} flexGrow={1}>
                {/* the amount labels on the left */}
                <YStack w={50} h={'100%'} backgroundColor={'pink'}>
                    {
                        x_labels.map((amount, index) => {
                            return (
                                <XStack key={index} flexGrow={1}>
                                    <Paragraph fontSize={10} lineHeight={10}
                                               color={'#999'}>{amount.toFixed(0)}</Paragraph>
                                    <YStack w={20} h={'100%'} justifyContent={'flex-end'}>
                                        <View h={1} w={'100%'} backgroundColor={'#ddd'}/>
                                    </YStack>
                                </XStack>
                            )
                        })
                    }
                </YStack>
                {/* the bars */}
                <XStack flexGrow={1} backgroundColor={'yellow'}>
                    {data.map((data_point, index) => {
                        return (
                            <YStack key={index} flexGrow={1} h={'100%'} justifyContent={'flex-end'}>
                                {Array.from(data_point.stack.entries()).map((activity, index) => {
                                    const [key, amount] = activity as [React.Key, number]
                                    const height = (amount / max_amount) * 100
                                    return (
                                        <View key={index} w={'90%'} h={`${height.toFixed(2)}%`}
                                              {...(index === 0 ? {borderRadius: 5} : {})}
                                              backgroundColor={keys[key].color}/>
                                    )
                                })}
                            </YStack>
                        )
                    })}
                </XStack>
            </XStack>
            <XStack w={'100%'} h={50} backgroundColor={'lime'}>
                <View w={50}/>
                {/* the labels on the bottom */}
                <XStack flexGrow={1}>
                    {data.map((data_point, index) => {
                        return (
                            <YStack key={index} flexGrow={1} h={'100%'}>
                                {index % y_label_interval === 0 &&
                                    <React.Fragment>
                                        <XStack w={'100%'} h={20} justifyContent={'center'}>
                                            <View w={1} h={'100%'} backgroundColor={'#ddd'}/>
                                        </XStack>
                                        <Paragraph fontSize={10} lineHeight={10}
                                                   color={'#999'}>{data_point.label}</Paragraph>
                                    </React.Fragment>
                                }
                            </YStack>
                        )
                    })}
                </XStack>
            </XStack>
        </YStack>
    )
}