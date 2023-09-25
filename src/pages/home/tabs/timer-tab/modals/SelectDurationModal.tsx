import React from 'react'
import {CUSTOM_DURATION, Duration, Segment} from "../../../../../globals/types/main";
import {useSelector} from "react-redux";
import selectDurationState from "../../../../../globals/redux/selectors/base_selectors/durationsSelector";
import {Button, Circle, Heading, Paragraph, Separator, XStack, YStack} from "tamagui";
import SegmentsBarView from "../../../../../globals/components/duration/SegmentsBarView";
import {ChevronDown, ChevronUp} from "@tamagui/lucide-icons";
import SegmentPicker from "../../../../../globals/components/form/pickers/SegmentPicker";

interface SelectDurationModalProps {
    current_duration: Duration | null
    setCurrentDuration: React.Dispatch<React.SetStateAction<Duration | null>>
    closeSheetModal: () => void
}

interface SelectExistingDurationPaneProps {
    duration: Duration
    is_selected: boolean
    setToTimerDuration: (duration: Duration) => void
}

interface SelectCustomDurationPaneProps {
    duration?: Duration
    is_selected: boolean
    setToTimerDuration: (duration: Duration) => void
}

function SelectCustomDurationPane({duration, is_selected, setToTimerDuration}: SelectCustomDurationPaneProps) {
    const [error, setError] = React.useState<string | null>(null)
    const [custom_segments, setCustomSegments] = React.useState<Segment[]>(duration?.segments ?? [])
    const [segment_picker_open, setSegmentPickerOpen] = React.useState<boolean>(false)

    const handleSetToTimerDuration = React.useCallback(() => {
        if (!custom_segments.length) {
            setError('Please add at least one segment')
            return
        }
        setError(null)
        setToTimerDuration({
            ...CUSTOM_DURATION,
            segments: custom_segments
        })
    }, [custom_segments, setToTimerDuration])

    // when an error is set, remove it after 3 seconds
    React.useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                setError(null)
            }, 3000)
            return () => clearTimeout(timeout)
        }
    }, [error])

    return (
        <React.Fragment>
            <YStack
                w={'95%'}
                h={90} backgroundColor={'#f3f3f3'}
                borderRadius={5} borderWidth={2} borderColor={is_selected ? 'black' : '#f3f3f3'}
                marginVertical={5}
                paddingHorizontal={15} paddingVertical={7}>
                <XStack w={'100%'} h={'100%'}>
                    <YStack w={'80%'} h={'100%'} flexShrink={0}>
                        <XStack w={'100%'} alignItems={'center'} justifyContent={'flex-start'} paddingTop={5}
                                paddingBottom={1}>
                            <Circle size={5} backgroundColor={'black'} marginRight={10}/>
                            <Paragraph textTransform={'uppercase'}>{CUSTOM_DURATION.name}</Paragraph>
                        </XStack>
                        <XStack alignItems={'center'} flexGrow={1}>
                            <SegmentsBarView segments={custom_segments} h={15} borderRadius={5}/>
                        </XStack>
                    </YStack>
                    <YStack alignItems={'center'} justifyContent={'center'} flexGrow={1}>
                        <Paragraph fontSize={35} height={35} lineHeight={35}>
                            {custom_segments.reduce((total, segment) => total + segment.duration, 0)}
                        </Paragraph>
                        <Paragraph fontSize={8} height={10} lineHeight={10}>
                            MINUTES
                        </Paragraph>
                    </YStack>
                </XStack>
            </YStack>
            <XStack w={'100%'} h={20} justifyContent={'center'} alignItems={'center'}>
                <Button backgroundColor={'transparent'}
                        onPress={() => setSegmentPickerOpen(!segment_picker_open)}>
                    {!segment_picker_open ?
                        <ChevronDown size={20} color={'black'}/> :
                        <ChevronUp size={20} color={'black'}/>
                    }
                </Button>
            </XStack>
            {segment_picker_open &&
                <YStack w={'85%'} alignItems={'center'}>
                    <Paragraph color={'red'} fontSize={10}>{error ?? ''}</Paragraph>
                    <SegmentPicker setSegments={setCustomSegments} active_segments={custom_segments}/>
                    <Button onPress={handleSetToTimerDuration}>
                        <Paragraph textTransform={'uppercase'}>Set Duration</Paragraph>
                    </Button>
                </YStack>
            }
        </React.Fragment>
    )


}


function SelectExistingDurationPane({duration, is_selected, setToTimerDuration}: SelectExistingDurationPaneProps) {
    return (
        <YStack
            onPress={() => setToTimerDuration(duration)}
            w={'95%'}
            h={90} backgroundColor={'#f3f3f3'}
            borderRadius={5} borderWidth={2} borderColor={is_selected ? 'black' : '#f3f3f3'}
            marginVertical={5}
            paddingHorizontal={15} paddingVertical={7}>
            <XStack w={'100%'} h={'100%'}>
                <YStack w={'80%'} h={'100%'} flexShrink={0}>
                    <XStack w={'100%'} alignItems={'center'} justifyContent={'flex-start'} paddingTop={5}
                            paddingBottom={1}>
                        <Circle size={5} backgroundColor={'black'} marginRight={10}/>
                        <Paragraph textTransform={'uppercase'}>{duration.name}</Paragraph>
                    </XStack>
                    <XStack alignItems={'center'} flexGrow={1}>
                        <SegmentsBarView segments={duration.segments} h={15} borderRadius={5}/>
                    </XStack>
                </YStack>
                <YStack alignItems={'center'} justifyContent={'center'} flexGrow={1}>
                    <Paragraph fontSize={35} height={35} lineHeight={35}>
                        {duration.segments.reduce((total, segment) => total + segment.duration, 0)}
                    </Paragraph>
                    <Paragraph fontSize={8} height={10} lineHeight={10}>
                        MINUTES
                    </Paragraph>
                </YStack>
            </XStack>
        </YStack>
    )

}

export default function SelectDurationModal({current_duration, setCurrentDuration, closeSheetModal}: SelectDurationModalProps) {
    const durations = useSelector(selectDurationState)

    const setTimerDurationAndCloseModal = React.useCallback((duration: Duration) => {
        setCurrentDuration(duration)
        closeSheetModal()
    }, [setCurrentDuration, closeSheetModal])

    return (
        <YStack w={'100%'}>
            <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
                <Heading
                    fontSize={20}
                    textTransform={'uppercase'}
                    textDecorationLine={'underline'}>
                    Select Duration
                </Heading>
            </XStack>
            <YStack w={'100%'} paddingVertical={10} alignItems={'center'}>
                <SelectCustomDurationPane is_selected={
                    current_duration?.id === CUSTOM_DURATION.id
                } setToTimerDuration={
                    setTimerDurationAndCloseModal
                }/>
                <Separator width={'90%'} marginVertical={10}/>
                {
                    Object.values(durations).map((duration) => {
                        return (
                            <SelectExistingDurationPane key={duration.id} duration={duration}
                                                        is_selected={current_duration?.id === duration.id}
                                                        setToTimerDuration={setTimerDurationAndCloseModal}/>
                        )
                    })
                }
            </YStack>
        </YStack>
    )
}