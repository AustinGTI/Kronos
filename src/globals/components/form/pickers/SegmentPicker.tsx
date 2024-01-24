import React from 'react'
import {Button, Input, Paragraph, View, XStack, YStack} from "tamagui";
import {Segment, SegmentTypes, SegmentType} from "../../../types/main";
import {Plus, Trash} from "@tamagui/lucide-icons";
import CarouselInput, {CarouselItem} from "../input/CarouselInput";
import SegmentsBarView from "../../duration/SegmentsBarView";
import useSegmentColors, {SegmentColors} from "../../../redux/hooks/useSegmentColors";
import KronosButton from "../../wrappers/KronosButton";


interface SegmentPickerProps {
    setSegments: (segments: Segment[]) => void
    active_segments: Segment[]
    setTouched?: () => void
}

interface InputSegmentPaneProps {
    segment: Segment
    segments: Segment[]
    segment_colors: SegmentColors,
    setSegments: (segments: Segment[]) => void
}

interface InputSegmentPaneDurationPickerProps {
    duration: number
    setDuration: (duration: number) => void
}


function InputSegmentPaneTextDurationPicker({duration, setDuration}: InputSegmentPaneDurationPickerProps) {
    const [duration_hours, setDurationHours] = React.useState(Math.floor(duration / 60))
    const [duration_minutes, setDurationMinutes] = React.useState(duration % 60)


    const onEndEditing = React.useCallback(() => {
        if (duration_hours < 0) {
            setDurationHours(0)
        } else if (duration_hours > 24) {
            setDurationHours(24)
        }
        if (duration_minutes < 0) {
            setDurationMinutes(0)
        } else if (duration_minutes > 60) {
            setDurationMinutes(60)
        }
        setDuration(duration_hours * 60 + duration_minutes)
    }, [duration_minutes, duration_hours, setDuration])


    return (
        <XStack w={'60%'} justifyContent={'center'} h={60}>
            <YStack h={'100%'} w={'auto'} alignItems={'center'} justifyContent={'center'}>
                <Input
                    fontSize={20} height={40} paddingHorizontal={10} keyboardType={'numeric'}
                    value={duration_hours.toString().padStart(2, '0')}
                    onChangeText={(text) => {
                        let hours = parseInt(text)
                        if (isNaN(hours) || hours < 0) {
                            hours = 0
                        } else if (hours > 24) {
                            hours = 24
                        }
                        setDurationHours(hours)
                        setDuration(hours * 60 + duration_minutes)
                    }}/>
            </YStack>
            <XStack h={'100%'} paddingBottom={12} alignItems={'center'} justifyContent={'center'}>
                <Paragraph fontSize={20} paddingHorizontal={10}>:</Paragraph>
            </XStack>
            <YStack h={'100%'} w={'auto'} alignItems={'center'} justifyContent={'center'}>
                <Input fontSize={20} height={40} paddingHorizontal={10}
                       value={duration_minutes.toString().padStart(2, '0')} onChangeText={(text) => {
                    let minutes = parseInt(text)
                    if (isNaN(minutes) || minutes < 0) {
                        minutes = 0
                    } else if (minutes > 60) {
                        minutes = 60
                    }
                    setDurationMinutes(minutes)
                    setDuration(duration_hours * 60 + minutes)
                }}/>
            </YStack>
        </XStack>
    )
}


function InputSegmentPaneDurationPicker({duration, setDuration}: InputSegmentPaneDurationPickerProps) {
    const [duration_hours, setDurationHours] = React.useState(Math.floor(duration / 60))
    const [duration_minutes, setDurationMinutes] = React.useState(duration % 60)

    // // when the increment hours or increment minutes change, update the increment
    // React.useEffect(() => {
    //     // setDuration(duration_hours * 60 + duration_minutes)
    //     console.log('increment changed to ', duration_hours * 60 + duration_minutes, 'hours', duration_hours, 'minutes', duration_minutes)
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

function InputSegmentPane({segment, segments,segment_colors, setSegments}: InputSegmentPaneProps) {
    const onClickDeleteButton = React.useCallback(() => {
        setSegments(segments.filter((prev_segment) => prev_segment.key !== segment.key))
        console.log(segments)
    }, [setSegments, segment.key, segments])
    
    return (
        <XStack w={'100%'} h={60} alignItems={'center'} borderColor={'$border'} borderWidth={1} borderRadius={10}
                marginVertical={5} justifyContent={'space-between'}>
            <XStack h={'100%'} paddingLeft={4} w={'20%'} alignItems={'center'}>
                <View w={15} h={30} backgroundColor={segment_colors[segment.type.color_key]} marginHorizontal={10} borderRadius={7}/>
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
            <KronosButton width={'10%'} padding={4} onPress={onClickDeleteButton} icon={Trash} icon_position={'right'}/>
        </XStack>
    )
}

export default function SegmentPicker({active_segments: segments, setSegments, setTouched}: SegmentPickerProps) {
    const onClickAddButton = React.useCallback(() => {
        setTouched?.() // call the setTouched function if it exists
        // add a single segment to the end of the list with type of (focus if the last segment is break or there are no segments, break if the last segment is focus)
        // 25 minutes for focus, 5 minutes for break by default
        const last_segment = segments[segments.length - 1]
        let new_segment_type: SegmentType
        let new_segment_duration: number
        if (last_segment && last_segment.type.name === SegmentTypes.FOCUS.name) {
            new_segment_type = SegmentTypes.BREAK
            new_segment_duration = 5
        } else {
            new_segment_type = SegmentTypes.FOCUS
            new_segment_duration = 25
        }
        const new_segment: Segment = {
            key: Math.random(),
            type: new_segment_type,
            duration: new_segment_duration
        }
        setSegments([...segments, new_segment])
    }, [segments, setSegments])
    
    const segment_colors = useSegmentColors()

    return (
        // if there are segments, display them else display the rules for adding segments
        <React.Fragment>
            <XStack w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                <KronosButton
                    icon_props={{size:30}}
                    onPress={onClickAddButton}
                    icon={Plus}/>
                <YStack alignItems={'center'} height={'100%'}>
                    <Paragraph fontSize={30} lineHeight={30}
                               color={'$color'}>{(segments ?? []).reduce((total, segment) => {
                        return total + segment.duration
                    }, 0)}</Paragraph>
                    <Paragraph fontSize={8} lineHeight={10} color={'#aaa'}>MINUTES</Paragraph>
                </YStack>
            </XStack>
            <YStack w={'100%'} paddingBottom={10}>
                {segments.length === 0 ? (
                    <YStack w={'100%'} gap={10} paddingTop={10}>
                        <Paragraph textAlign={'center'} fontSize={10} color={'#aaa'}>
                            1. A Pomodoro Duration should start and end with a focus segment, or be only a focus
                            segment.
                        </Paragraph>
                        <Paragraph textAlign={'center'} fontSize={10} color={'#aaa'}>
                            2. A Pomodoro Duration should alternate between focus  and break segments
                        </Paragraph>
                        <Paragraph textAlign={'center'} fontSize={10} color={'#aaa'}>
                            3. The recommended duration for a focus segment is 25 minutes to an hour, and for a break
                            segment is 5 to 15 minutes
                        </Paragraph>
                    </YStack>
                ) : (
                    <YStack w={'100%'} paddingTop={5}>
                        {segments.map((segment) => (
                            <InputSegmentPane key={segment.key} segment={segment} segments={segments} segment_colors={segment_colors}
                                              setSegments={setSegments}/>
                        ))}
                    </YStack>
                )}
            </YStack>
        </React.Fragment>
    )
}