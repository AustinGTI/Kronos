import React, {useCallback, useMemo} from 'react'
import {Circle, Paragraph, Separator, Sheet, Square, Stack, XStack, YStack} from "tamagui";
import {Duration, Segment, SegmentType} from "../../../../../globals/types/main";
import {ChevronDown, ChevronUp, Delete, Edit, Play} from "@tamagui/lucide-icons";
import {ActivityStat} from "./ActivitiesTab";
import {useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import {FlatList} from "react-native";
import usePlannerTabContext from "../../../../../globals/contexts/PlannerTabContext";

interface DurationPaneProps {
    duration: Duration
    open_duration: Duration | null
    setOpenDuration: React.Dispatch<React.SetStateAction<Duration | null>>
}

interface DurationSegmentPaneProps {
    segment: Segment
    max_segment_duration: number
}

interface DurationSegmentTimelineProps {
    duration: Duration
}

function DurationSegmentPane({segment, max_segment_duration}: DurationSegmentPaneProps) {
    return (
        <XStack width={'100%'} padding={10} justifyContent={'space-between'} alignItems={'center'}>
            <Paragraph fontSize={12} color={'#777'} textTransform={'uppercase'} width={'30%'}>
                {segment.type.name}
            </Paragraph>
            <Stack flexGrow={1} alignItems={'center'} justifyContent={'center'}>
                <Stack height={12} width={`${segment.duration / max_segment_duration * 80}%`}
                       backgroundColor={segment.type.color} borderRadius={4}/>
            </Stack>
            <Paragraph fontSize={12}
                       color={'#777'}
                       textTransform={'uppercase'}
                       width={'30%'}
                       textAlign={'right'}>
                {segment.duration} MINS
            </Paragraph>
        </XStack>
    );
}

function DurationSegmentTimeline({duration}: DurationSegmentTimelineProps) {
    const segment_widths = useMemo(() => {
        const total_duration = duration.segments.reduce((total, v, i) => {
            return total + v.duration
        }, 0);
        return duration.segments.map((v, i) => {
            return v.duration / total_duration * 100
        })
    }, [duration.segments]);

    return (
        <XStack width={'100%'} padding={10} justifyContent={'space-between'} alignItems={'center'}>
            {
                duration.segments.map((v, i) => {
                    return (
                        <Stack key={i} borderRadius={4} height={18} backgroundColor={v.type.color}
                               width={`${segment_widths[i] - 1}%`} paddingHorizontal={'0.5%'}/>
                    )
                })
            }
        </XStack>
    )

}

function DurationPane({duration, open_duration, setOpenDuration}: DurationPaneProps) {

    const handleOnClickPane = useCallback(() => {
        if (open_duration === duration) {
            setOpenDuration(null)
        } else {
            setOpenDuration(duration)
        }
    }, [open_duration, duration, setOpenDuration]);

    const is_open = useMemo(() => {
        return open_duration?.id === duration.id
    }, [open_duration?.id, duration.id]);

    const total_duration = useMemo(() => {
        return duration.segments.reduce((total, v, i) => {
            return total + v.duration
        }, 0)
    }, [duration.segments]);

    const max_segment_duration = useMemo(() => {
        return duration.segments.reduce((max, v, i) => {
            return Math.max(max, v.duration)
        }, 0)
    }, [duration.segments]);


    return (
        <YStack width={'95%'} borderRadius={10} margin={'2.5%'} backgroundColor={'white'}>
            <XStack justifyContent={'space-between'} alignItems={'center'} width={'100%'}
                    onPress={handleOnClickPane}
                    padding={20}>
                <YStack alignItems={'center'}>
                    <Paragraph fontSize={24} color={'black'} lineHeight={28}>{total_duration}</Paragraph>
                    <Paragraph fontSize={8} color={'#aaa'} lineHeight={10}>MINS</Paragraph>
                </YStack>
                <Paragraph>{duration.name}</Paragraph>
                {is_open ? <ChevronUp size={'2$'} color={'#777'}/> : <ChevronDown size={'2$'} color={'#777'}/>}
            </XStack>
            {
                is_open && (
                    <React.Fragment>
                        <Separator width={'90%'} marginHorizontal={'5%'}/>
                        <YStack width={'100%'} backgroundColor={'transparent'} padding={10}>
                            <YStack width={'100%'} backgroundColor={'transparent'} paddingHorizontal={20}>
                                <DurationSegmentTimeline duration={duration}/>
                                {duration.segments.map((segment, idx) => (
                                    <DurationSegmentPane key={idx} segment={segment}
                                                         max_segment_duration={max_segment_duration}/>
                                ))}
                            </YStack>
                            <XStack justifyContent={'space-around'} width={'100%'} paddingVertical={10}>
                                <Edit size={20} color={'#777'}/>
                                <Play size={20} color={'#777'}/>
                                <Delete size={20} color={'#777'}/>
                            </XStack>
                        </YStack>
                    </React.Fragment>
                )
            }
        </YStack>
    );
}

export default function DurationsTab() {
    const durations = useSelector((state: AppState) => state.durations)

    // only one duration can be open at a time to simulate an accordion
    const [open_duration, setOpenDuration] = React.useState<Duration | null>(null)

    return (
        <FlatList
            style={{width: '100%', marginVertical: 10}}
            data={Object.values(durations)}
            renderItem={({item}) => (
                <DurationPane duration={item} open_duration={open_duration} setOpenDuration={setOpenDuration}/>
            )}/>
    )
}
