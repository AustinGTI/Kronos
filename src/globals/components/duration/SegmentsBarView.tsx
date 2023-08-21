import React from 'react'
import {Segment} from "../../types/main";
import {View, XStack} from "tamagui";

interface SegmentsBarViewProps extends React.ComponentProps<typeof XStack> {
    segments: Segment[]
}

export default function SegmentsBarView({segments, ...stack_props}: SegmentsBarViewProps) {
    const total_duration = segments.reduce((total, segment) => {
        return total + segment.duration
    }, 0)
    return (
        segments.length ?
            <XStack w={'100%'} h={20} alignItems={'center'} justifyContent={'center'} overflow={'hidden'}
                    borderRadius={10} {...stack_props}>
                {segments.map((segment, index) => {
                    const width = (segment.duration / total_duration) * 100
                    return (
                        <View key={segment.key} w={`${width.toFixed(2)}%`} h={'100%'}
                              backgroundColor={segment.type.color}/>
                    );
                })}
            </XStack> :
            <View w={'100%'} backgroundColor={'gray'} h={15} borderRadius={3}/>
    )
}
