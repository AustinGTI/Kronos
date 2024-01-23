import React from 'react'
import {Segment} from "../../types/main";
import {View, XStack} from "tamagui";
import useSegmentColors from "../../redux/hooks/useSegmentColors";

interface SegmentsBarViewProps extends React.ComponentProps<typeof XStack> {
    segments: Segment[]
}

export default function SegmentsBarView({segments, ...stack_props}: SegmentsBarViewProps) {
    const total_duration = segments.reduce((total, segment) => {
        return total + segment.duration
    }, 0)
    const segment_colors = useSegmentColors()
    return (
        segments.length ?
            <XStack w={'100%'} h={20} alignItems={'center'} justifyContent={'center'} overflow={'hidden'}
                    borderRadius={10} {...stack_props}>
                {/* if the total duration is less than 1 minute, display a gray bar */}

                {
                    total_duration < 1 ?
                        <View w={'100%'} backgroundColor={'gray'} h={'100%'}/> :
                        segments.map((segment, index) => {
                            const width = (segment.duration / total_duration) * 100
                            return (
                                // todo: fix the key issue when dummy sessions are regenerated
                                <View key={`${segment.key}-${index}`} w={`${width.toFixed(2)}%`} h={'100%'}
                                      backgroundColor={segment_colors[segment.type.color_key]}/>
                            );
                        })}
            </XStack> :
            <View w={'100%'} backgroundColor={'gray'} h={15} borderRadius={3}/>
    )
}
