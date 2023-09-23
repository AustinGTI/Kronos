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
    width: number
    height: number
}

export default function StackedBarChart({data, keys, width, height}: StackedBarChartProps) {
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

    const boundary_size = 40

    return (
        <YStack w={width} h={height}>
            <XStack w={'100%'} height={height - boundary_size}>
                {/* the amount labels on the left */}
                <YStack w={boundary_size} h={'100%'} borderRightWidth={1} borderRightColor={'#ddd'}>
                    {
                        x_labels.sort((a, b) => b - a).map((amount, index) => {
                            return (
                                <XStack key={index} flexBasis={10} flexGrow={1} justifyContent={'flex-end'} w={'100%'}>
                                    <YStack h={'100%'} justifyContent={'flex-end'}>
                                        <Paragraph fontSize={10} lineHeight={10} translateY={3} color={'#999'}>
                                            {amount.toFixed(0)}
                                        </Paragraph>
                                    </YStack>
                                    <YStack w={10} h={'100%'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                                        <View h={1} w={7} backgroundColor={'#ddd'}/>
                                    </YStack>
                                </XStack>
                            )
                        })
                    }
                </YStack>
                {/* the bars */}
                <XStack width={width - boundary_size} zIndex={-1}>
                    {data.map((data_point, index) => {
                        return (
                            <YStack key={index} flexGrow={1} h={'100%'} justifyContent={'flex-end'}>
                                {Array.from(data_point.stack.entries())
                                    .sort((a, b) => a[1] - b[1])
                                    .map((activity, index) => {
                                        const [key, amount] = activity as [React.Key, number]
                                        const height = (amount / max_amount) * 100
                                        return (
                                            <View key={index} w={'90%'} h={`${height.toFixed(2)}%`}
                                                  {...(index === 0 ? {
                                                      borderTopRightRadius: 5,
                                                      borderTopLeftRadius: 5
                                                  } : {})}
                                                  backgroundColor={keys[key].color}/>
                                        )
                                    })}
                            </YStack>
                        )
                    })}
                </XStack>
            </XStack>
            <XStack w={'100%'} h={boundary_size}>
                <View w={boundary_size} h={boundary_size}/>
                {/* the labels on the bottom */}
                <XStack flexGrow={1}>
                    {data.map((data_point, index) => {
                        return (
                            <YStack key={index} flexBasis={1} flexGrow={1} h={'100%'} borderTopWidth={1}
                                    borderTopColor={'#ddd'}>
                                {index % y_label_interval === 0 &&
                                    <React.Fragment>
                                        <XStack w={'100%'} h={7} justifyContent={'center'} mb={3}>
                                            <View w={1} h={'100%'} backgroundColor={'#ddd'}/>
                                        </XStack>
                                        <XStack w={'100%'} justifyContent={'center'}>
                                            <Paragraph fontSize={10} lineHeight={10}
                                                       color={'#999'}>{data_point.label}</Paragraph>
                                        </XStack>
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