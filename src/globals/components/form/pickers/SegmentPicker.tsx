import React from 'react'
import {Button, Input, Paragraph, View, XStack, YStack} from "tamagui";
import {Segment, SEGMENT_TYPES, SegmentType} from "../../../types/main";
import {Plus, Trash} from "@tamagui/lucide-icons";
import CarouselInput, {CarouselItem} from "../input/CarouselInput";


interface SegmentPickerProps {
    setSegments: (segments: Segment[]) => void
    active_segments: Segment[]
}

interface InputSegmentPaneProps {
    segment: Segment
    segments: Segment[]
    setSegments: (segments: Segment[]) => void
}

interface InputSegementPaneDurationPickerProps {
    duration: number
    setDuration: (duration: number) => void
}

function InputSegmentPaneTextDurationPicker({duration, setDuration}: InputSegementPaneDurationPickerProps) {
    const [duration_hours, setDurationHours] = React.useState(Math.floor(duration / 60))
    const [duration_minutes, setDurationMinutes] = React.useState(duration % 60)

    // if duration hours or duration minutes change, update the duration
    React.useEffect(() => {
        if (duration !== duration_hours * 60 + duration_minutes) {
            setDuration(duration_hours * 60 + duration_minutes)
            console.log('duration changed to ', duration_hours * 60 + duration_minutes, 'hours', duration_hours, 'minutes', duration_minutes)
        }
    }, [duration, duration_hours, duration_minutes, setDuration])

    return (
        <XStack w={'60%'} justifyContent={'space-around'} paddingHorizontal={10} h={60}>
            <YStack h={'100%'} w={'50%'} alignItems={'center'} justifyContent={'center'}>
                <Input value={duration_hours.toString().padStart(2, '0')} onChangeText={(text) => {
                    const hours = parseInt(text)
                    if (isNaN(hours) || hours > 24 || hours < 0) {
                        setDurationHours(0)
                    } else {
                        setDurationHours(hours)
                    }
                }}/>
                <Paragraph fontSize={8} lineHeight={10} color={'#aaa'}>HOURS</Paragraph>
            </YStack>
            <YStack h={'100%'} w={'50%'} alignItems={'center'} justifyContent={'center'}>
                <Input value={duration_minutes.toString().padStart(2, '0')} onChangeText={(text) => {
                    const minutes = parseInt(text)
                    if (isNaN(minutes) || minutes > 60 || minutes < 0) {
                        setDurationMinutes(0)
                    } else {
                        setDurationMinutes(minutes)
                    }
                }}/>
                <Paragraph fontSize={8} lineHeight={10} color={'#aaa'}>MINUTES</Paragraph>
            </YStack>
        </XStack>
    )
}


function InputSegmentPaneDurationPicker({duration, setDuration}: InputSegementPaneDurationPickerProps) {
    const [duration_hours, setDurationHours] = React.useState(Math.floor(duration / 60))
    const [duration_minutes, setDurationMinutes] = React.useState(duration % 60)

    // // when the duration hours or duration minutes change, update the duration
    // React.useEffect(() => {
    //     // setDuration(duration_hours * 60 + duration_minutes)
    //     console.log('duration changed to ', duration_hours * 60 + duration_minutes, 'hours', duration_hours, 'minutes', duration_minutes)
    // }, [duration_hours, duration_minutes, setDuration])

    // Region: HOURS AND MINUTE CAROUSEL ITEMS
    const hours_carousel_items: CarouselItem[] = React.useMemo(() => {
        const items: CarouselItem[] = []
        for (let i = 0; i < 24; i++) {
            items.push({
                key: i,
                display_value: i.toString(),
                return_value: i
            })
        }
        return items
    }, [])

    const minutes_carousel_items: CarouselItem[] = React.useMemo(() => {
        const items: CarouselItem[] = []
        for (let i = 0; i < 60; i++) {
            items.push({
                key: i,
                display_value: i.toString(),
                return_value: i
            })
        }
        return items
    }, [])
    // EndRegion
    return (
        <XStack w={'60%'} justifyContent={'space-around'} paddingHorizontal={10} h={60}>
            <YStack h={'100%'} w={'50%'} alignItems={'center'} justifyContent={'center'}>
                <CarouselInput items={hours_carousel_items} initial_item={{
                    key: duration_hours,
                    display_value: duration_hours.toString(),
                    return_value: duration_hours
                }} setActiveValue={setDurationHours} orientation={'vertical'} width={30} height={40}/>
                <Paragraph fontSize={8} lineHeight={10} color={'#aaa'}>HOURS</Paragraph>
            </YStack>
            <YStack h={'100%'} w={'50%'} alignItems={'center'} justifyContent={'center'}>
                <CarouselInput items={minutes_carousel_items} initial_item={{
                    key: duration_minutes,
                    display_value: duration_minutes.toString(),
                    return_value: duration_minutes
                }} setActiveValue={setDurationMinutes} orientation={'vertical'} width={30} height={40}/>
                <Paragraph fontSize={8} lineHeight={10} color={'#aaa'}>MINUTES</Paragraph>
            </YStack>
        </XStack>
    )
}

function InputSegmentPane({segment, segments, setSegments}: InputSegmentPaneProps) {
    const onClickDeleteButton = React.useCallback(() => {
        setSegments(segments.filter((prev_segment) => prev_segment.key !== segment.key))
    }, [setSegments, segment.key])
    return (
        <XStack w={'100%'} h={60} alignItems={'center'} borderColor={'#aaa'} borderWidth={1} borderRadius={10}
                marginVertical={5}>
            <XStack h={'100%'} padding={4} w={'25%'} alignItems={'center'}>
                <View w={15} h={30} backgroundColor={segment.type.color} marginHorizontal={10} borderRadius={7}/>
                <Paragraph textTransform={'uppercase'} fontSize={14}>{segment.type.name}</Paragraph>
            </XStack>
            <InputSegmentPaneTextDurationPicker duration={segment.duration} setDuration={(duration) => {
                setSegments(segments.map((prev_segment) => {
                    if (prev_segment.key === segment.key) {
                        return {...prev_segment, duration}
                    }
                    return prev_segment
                }))
            }}/>
            <Button backgroundColor={'transparent'} padding={3} onPress={onClickDeleteButton} w={'15%'}>
                <Trash size={20}/>
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
                        <Paragraph textAlign={'center'} fontSize={12} color={'#aaa'}>
                            1. A Pomodoro Duration should start and end with a focus segment, or be only a focus
                            segment.
                        </Paragraph>
                        <Paragraph textAlign={'center'} fontSize={12} color={'#aaa'}>
                            2. A Pomodoro Duration's segments should be alternating between focus and break segments,
                            consecutive segments of the same type will be merged into one segment.
                        </Paragraph>
                        <Paragraph textAlign={'center'} fontSize={12} color={'#aaa'}>
                            3. The recommended duration for a focus segment is 25 minutes to an hour, and for a break
                            segment is 5 to 15 minutes
                            though you are free to decide what works best for you, the minimum focus segment duration is
                            5 minutes and the minimum break segment duration is 1 minute.
                        </Paragraph>
                    </YStack>
                ) : (
                    <YStack w={'100%'}>
                        {segments.map((segment) => (
                            <InputSegmentPane key={segment.key} segment={segment} segments={segments} setSegments={setSegments}/>
                        ))}
                    </YStack>
                )}
            </YStack>
        </React.Fragment>
    )
}