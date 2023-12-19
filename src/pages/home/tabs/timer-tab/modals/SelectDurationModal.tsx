import React from 'react'
import {CUSTOM_DURATION, Duration, Segment} from "../../../../../globals/types/main";
import {useSelector} from "react-redux";
import selectDurationState from "../../../../../globals/redux/selectors/base_selectors/durationsSelector";
import {Button, Circle, Heading, Paragraph, ScrollView, Separator, XStack, YStack} from "tamagui";
import SegmentsBarView from "../../../../../globals/components/duration/SegmentsBarView";
import {ChevronDown, ChevronUp, X} from "@tamagui/lucide-icons";
import SegmentPicker from "../../../../../globals/components/form/pickers/SegmentPicker";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";

interface SelectDurationModalProps {
    current_duration: Duration | null
    setCurrentDuration: (duration: Duration | null) => void
    closeModal: () => void
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
        // todo: add more segments validation
        setError(null)
        setToTimerDuration({
            ...CUSTOM_DURATION,
            segments: custom_segments
        })
    }, [custom_segments, setToTimerDuration, setError])

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
        <KronosContainer w={'95%'} paddingVertical={3}>
            <YStack
                w={'100%'}
                h={90}
                borderRadius={10}
                // borderWidth={2} borderColor={is_selected ? 'black' : '#f3f3f3'}
                marginVertical={5}
                paddingHorizontal={15} paddingVertical={7}>
                <XStack w={'100%'} h={'100%'}>
                    <YStack w={'80%'} h={'100%'} flexShrink={0}>
                        <XStack w={'100%'} alignItems={'center'} justifyContent={'flex-start'} paddingTop={5}
                                paddingBottom={1}>
                            <Circle backgroundColor={'$color'} size={5} marginRight={10}/>
                            <Paragraph textTransform={'uppercase'}
                                       textDecorationLine={is_selected ? 'underline' : 'none'}>{CUSTOM_DURATION.name}</Paragraph>
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
            <XStack w={'100%'} h={20} justifyContent={'center'} alignItems={'center'} paddingBottom={5}>
                <KronosButton
                    onPress={() => setSegmentPickerOpen(!segment_picker_open)}
                    icon={!segment_picker_open ? ChevronDown : ChevronUp}/>
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
        </KronosContainer>
    )


}


function SelectExistingDurationPane({duration, is_selected, setToTimerDuration}: SelectExistingDurationPaneProps) {
    return (
        <KronosContainer w={'95%'} paddingVertical={3}>
            <YStack
                onPress={() => setToTimerDuration(duration)}
                w={'100%'}
                h={90}
                borderRadius={10}
                // borderWidth={2} borderColor={is_selected ? 'black' : '#f3f3f3'}
                marginVertical={5}
                paddingHorizontal={15} paddingVertical={7}>
                <XStack w={'100%'} h={'100%'}>
                    <YStack w={'80%'} h={'100%'} flexShrink={0}>
                        <XStack w={'100%'} alignItems={'center'} justifyContent={'flex-start'} paddingTop={5}
                                paddingBottom={1}>
                            <Circle size={5} backgroundColor={'$color'} marginRight={10}/>
                            <Paragraph textTransform={'uppercase'}
                                       textDecorationLine={is_selected ? 'underline' : 'none'}>{duration.name}</Paragraph>
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
        </KronosContainer>
    )

}

export default function SelectDurationModal({
                                                current_duration,
                                                setCurrentDuration,
                                                closeModal
                                            }: SelectDurationModalProps) {
    const durations = useSelector(selectDurationState)

    const setTimerDurationAndCloseModal = React.useCallback((duration: Duration) => {
        setCurrentDuration(duration)
        closeModal()
    }, [setCurrentDuration, closeModal])

    return (
        <YStack w={'100%'} alignItems={'center'}>
            {/*<XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>*/}
            {/*    <Heading*/}
            {/*        fontSize={20}*/}
            {/*        textTransform={'uppercase'}*/}
            {/*        textDecorationLine={'underline'}>*/}
            {/*        Select Duration*/}
            {/*    </Heading>*/}
            {/*</XStack>*/}
            <XStack w={'95%'} alignItems={'center'} justifyContent={'space-between'} paddingVertical={10}>
                <KronosContainer alignItems={'center'} padding={10}>
                    <Paragraph textTransform={'uppercase'} fontSize={18}>Select Duration</Paragraph>
                </KronosContainer>
                <KronosContainer>
                    <KronosButton icon={X} onPress={closeModal}/>
                </KronosContainer>
            </XStack>
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
    )
}