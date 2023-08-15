import React from 'react'
import {Button, Paragraph, View, XStack, YStack} from "tamagui";
import {Segment, SEGMENT_TYPES, SegmentType} from "../../../types/main";
import {Plus, Trash} from "@tamagui/lucide-icons";


interface SegmentPickerProps {
    setSegments: React.Dispatch<React.SetStateAction<Segment[]>>
    active_segments: Segment[]
}

interface InputSegmentPaneProps {
    segment: Segment
    setSegments: React.Dispatch<React.SetStateAction<Segment[]>>
}

function InputSegmentPane({segment, setSegments}: InputSegmentPaneProps) {
    const onClickDeleteButton = React.useCallback(() => {
        setSegments((prev_segments) => prev_segments.filter((prev_segment) => prev_segment.key !== segment.key))
    }, [setSegments, segment.key])
    return (
        <XStack w={'90%'} h={60}>
            <View w={'20%'} h={'100%'} backgroundColor={segment.type.color} borderRadius={10}/>
            <Paragraph textTransform={'uppercase'}>{segment.type.name}</Paragraph>
            <YStack alignItems={'center'}>
                <Paragraph>{segment.duration}</Paragraph>
                <Paragraph>MINS</Paragraph>
            </YStack>
            <Button onPress={onClickDeleteButton}>
                <Trash size={'4$'}/>
            </Button>
        </XStack>
    )
}

export default function SegmentPicker({active_segments: segments, setSegments}: SegmentPickerProps) {
    const onClickAddButton = React.useCallback(() => {
        // add a single segment to the end of the list with type of (focus if the last segment is break or there are no segments, break if the last segment is focus)
        // 25 minutes for focus, 5 minutes for break by default
        const last_segment = segments[segments.length - 1]
        let new_segment_type: SegmentType
        let new_segment_duration: number
        if (last_segment && last_segment.type.name === SEGMENT_TYPES.FOCUS.name) {
            new_segment_type = SEGMENT_TYPES.BREAK
            new_segment_duration = 5
        } else {
            new_segment_type = SEGMENT_TYPES.FOCUS
            new_segment_duration = 25
        }
        const new_segment: Segment = {
            key: segments.length + 1,
            type: new_segment_type,
            duration: new_segment_duration
        }
        setSegments([...segments, new_segment])
    }, [segments, setSegments])

    return (
        // if there are segments, display them else display the rules for adding segments
        <React.Fragment>
            <XStack w={'100%'}>
                <Button onPress={onClickAddButton} icon={<Plus size={'4$'}/>}/>
            </XStack>
            <YStack w={'100%'}>
                {segments.length === 0 ? (
                    <YStack w={'100%'}>
                        <Paragraph>
                            1. A Pomodoro Duration should start and end with a focus segment, or be only a focus
                            segment.
                        </Paragraph>
                        <Paragraph>
                            2. A Pomodoro Duration's segments should be alternating between focus and break segments,
                            consecutive segments of the same type will be merged into one segment.
                        </Paragraph>
                        <Paragraph>
                            3. The recommended duration for a focus segment is 25 minutes to an hour, and for a break
                            segment is 5 to 15 minutes
                            though you are free to decide what works best for you, the minimum focus segment duration is
                            5 minutes and the minimum break segment duration is 1 minute.
                        </Paragraph>
                    </YStack>
                ) : (
                    <YStack w={'100%'}>
                        {segments.map((segment) => (
                            <InputSegmentPane segment={segment} setSegments={setSegments}/>
                        ))}
                    </YStack>
                )}
            </YStack>
        </React.Fragment>
    )
}