import React from 'react'
import {Activity, DELETED_ACTIVITY, Segment, Session} from "../../../../../globals/types/main";
import {Paragraph, ScrollView, View, XStack, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import SegmentsBarView from "../../../../../globals/components/duration/SegmentsBarView";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import useSegmentColors from "../../../../../globals/redux/hooks/useSegmentColors";

interface SessionViewModalProps {
    session: Session | null
}

interface TimeViewProps {
    time: Date | null
    time_font_size?: number
    am_pm_font_size?: number
}

interface TimeRangeViewProps {
    start_time: Date
    end_time: Date | null
    time_font_size?: number
    am_pm_font_size?: number
}

interface SegmentsViewProps {
    start_time: Date
    segments: Segment[]
}

function TimeView({time, time_font_size = 17, am_pm_font_size = 15}: TimeViewProps) {
    const [hours, minutes, am_pm] = React.useMemo(() => {
        if (!time) return [null, null, null]
        const hours = time.getHours() === 0 ? 12 : time.getHours() % 12
        const minutes = time.getMinutes()
        const am_pm = hours >= 12 ? 'PM' : 'AM'
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            am_pm
        ]
    }, [time])

    return (
        <XStack>
            {(hours && minutes && am_pm) ? (
                <React.Fragment>
                    <Paragraph fontSize={time_font_size}>{`${hours}:${minutes}`}</Paragraph>
                    <Paragraph fontSize={am_pm_font_size} paddingHorizontal={2} color={'#999'}>{am_pm}</Paragraph>
                </React.Fragment>
            ) : (
                <Paragraph fontSize={time_font_size}>Now</Paragraph>
            )}
        </XStack>
    )
}

function TimeRangeView({start_time, end_time, time_font_size, am_pm_font_size}: TimeRangeViewProps) {
    return (
        <XStack>
            <TimeView time={start_time} time_font_size={time_font_size} am_pm_font_size={am_pm_font_size}/>
            <Paragraph fontSize={10} color={'#555'} paddingHorizontal={10}>to</Paragraph>
            <TimeView time={end_time} time_font_size={time_font_size} am_pm_font_size={am_pm_font_size}/>
        </XStack>
    )
}

function SegmentsView({start_time, segments}: SegmentsViewProps) {
    const segment_colors = useSegmentColors()
    return (
        <YStack w={'100%'}>
            {segments.map((segment, index) => {
                // if this is not the first index, add the start time to the previous segment increment
                if (index > 0) {
                    start_time = new Date(start_time.getTime() + segments[index - 1].duration * 60 * 1000)
                }
                const end_time = new Date(start_time.getTime() + segment.duration * 60 * 1000)
                return (
                    <XStack key={index} padding={10} w={'100%'} justifyContent={'space-between'}
                            alignItems={'center'}>
                        <XStack alignItems={'center'} w={'30%'}>
                            <Paragraph textTransform={'uppercase'} fontSize={17}
                                       paddingHorizontal={5}>{segment.type.name}</Paragraph>
                        </XStack>
                        <XStack w={'40%'} justifyContent={'center'}>
                            <TimeRangeView start_time={start_time} end_time={end_time} time_font_size={15}
                                           am_pm_font_size={13}/>
                        </XStack>
                        <XStack justifyContent={'flex-end'} w={'30%'}>
                            <YStack alignItems={'center'}>
                                <Paragraph fontSize={20} lineHeight={20}>{Math.round(segment.duration)}</Paragraph>
                                <Paragraph fontSize={10} lineHeight={10} color={'#999'}>MINS</Paragraph>
                            </YStack>
                            <View w={30} h={30} backgroundColor={segment_colors[segment.type.color_key]} borderRadius={5}
                                  marginLeft={10}/>
                        </XStack>
                    </XStack>
                );
            })}
            <SegmentsBarView segments={segments}/>
        </YStack>
    )
}


export default function SessionViewModal({session}: SessionViewModalProps) {
    const activities = useSelector((state: AppState) => state.activities)
    const session_activity: Activity | null = React.useMemo(() => {
        if (!session) return null
        return activities[session.activity_id] ?? DELETED_ACTIVITY
    }, [activities, session])

    if (!session) return null
    return (
        <YStack w={'100%'} h={'80%'} alignItems={'center'}>
            <KronosContainer>
                <XStack alignItems={'center'} justifyContent={'center'}
                        paddingHorizontal={10}>
                    <View w={30} h={30} backgroundColor={session_activity?.color ?? '#ddd'} borderRadius={10}/>
                    <Paragraph textTransform={'uppercase'} paddingHorizontal={10}
                               fontSize={17}>{session_activity?.name ?? 'Custom Activity'}</Paragraph>
                    <View w={30} h={30} backgroundColor={session_activity?.color ?? '#ddd'} borderRadius={10}/>
                </XStack>
                <XStack alignItems={'center'} justifyContent={'center'} paddingTop={10}>
                    <TimeRangeView start_time={new Date(session.start_time)}
                                   end_time={session.end_time ? new Date(session.end_time) : null}/>
                </XStack>
            </KronosContainer>
            <KronosContainer w={'100%'} marginBottom={10}>
                <SegmentsView start_time={new Date(session.start_time)} segments={session.segments}/>
            </KronosContainer>
        </YStack>
    )
}
