import React from 'react'
import {useSelector} from "react-redux";
import selectTimerState from "../../../../../globals/redux/selectors/timerTabSelector";
import {Circle, Heading, Paragraph, Separator, Square, View, XStack, YStack} from "tamagui";
import useTimerTabContext, {TimerTabContext} from "../context";
import {Activity, Duration, UNTITLED_ACTIVITY} from "../../../../../globals/types/main";
import SegmentsBarView from "../../../../../globals/components/duration/SegmentsBarView";

interface SelectActivityPaneProps {
    activity: Activity
    is_selected: boolean
    setToTimerActivity: (activity: Activity) => void
    duration?: Duration
}

interface SelectActivityModalProps {
    current_activity: Activity | null
    setCurrentActivity: React.Dispatch<React.SetStateAction<Activity | null>>
    setCurrentDuration: React.Dispatch<React.SetStateAction<Duration | null>>
    closeSheetModal: () => void
}

function SelectActivityPane({activity, duration, setToTimerActivity, is_selected}: SelectActivityPaneProps) {
    return (
        <YStack
            onPress={() => setToTimerActivity(activity)}
            w={'95%'}
            h={90} backgroundColor={'#f3f3f3'}
            borderRadius={5} borderWidth={2} borderColor={is_selected ? 'black' : '#f3f3f3'}
            marginVertical={5}
            paddingHorizontal={15} paddingVertical={7}>
            <XStack w={'100%'} alignItems={'center'} justifyContent={'space-between'} paddingTop={5} paddingBottom={1}>
                <Circle size={5} backgroundColor={'black'}/>
                <Paragraph textTransform={'uppercase'}>{activity.name}</Paragraph>
                <Square size={22} borderRadius={7} backgroundColor={activity.color}/>
            </XStack>
            <XStack flexGrow={1} w={'100%'} alignItems={'center'} justifyContent={'space-between'} paddingTop={1}
                    paddingBottom={5}>
                <YStack w={'80%'}>
                    <Paragraph textTransform={'uppercase'} color={'#ccc'} fontSize={10}>Default Duration</Paragraph>
                    <SegmentsBarView segments={duration?.segments ?? []} h={15} borderRadius={3}/>
                </YStack>
                <YStack alignItems={'center'} justifyContent={'center'}>
                    <Paragraph fontSize={25} height={25} lineHeight={25}>
                        {
                            duration ?
                                duration.segments.reduce((total, segment) => total + segment.duration, 0) :
                                '--'
                        }
                    </Paragraph>
                    <Paragraph fontSize={8} height={10} lineHeight={10}>
                        MINUTES
                    </Paragraph>
                </YStack>
            </XStack>
        </YStack>
    )
}

export default function SelectActivityModal({current_activity, setCurrentActivity, setCurrentDuration, closeSheetModal}: SelectActivityModalProps) {
    const {durations, activities} = useSelector(selectTimerState)
    const setTimerActivityAndCloseModal = React.useCallback((activity: Activity) => {
        setCurrentActivity(activity)
        // if the activity has a default duration, set it as the current duration
        if (activity.default_duration_id !== null) {
            setCurrentDuration(durations[activity.default_duration_id])
        }
        closeSheetModal()
    }, [setCurrentActivity, setCurrentDuration, durations, closeSheetModal])


    return (
        <YStack w={'100%'}>
            <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
                <Heading
                    fontSize={20}
                    textTransform={'uppercase'}
                    textDecorationLine={'underline'}>
                    Select Activity
                </Heading>
            </XStack>
            <YStack w={'100%'} paddingVertical={10} alignItems={'center'}>
                <SelectActivityPane
                    activity={UNTITLED_ACTIVITY}
                    is_selected={current_activity?.id === UNTITLED_ACTIVITY.id}
                    setToTimerActivity={setTimerActivityAndCloseModal}/>
                <Separator width={'90%'} marginVertical={10}/>
                {
                    Object.values(activities).map((activity) => (
                        <SelectActivityPane
                            key={activity.id}
                            activity={activity}
                            duration={activity.default_duration_id !== null ? durations[activity.default_duration_id] : undefined}
                            is_selected={current_activity?.id === activity.id}
                            setToTimerActivity={setTimerActivityAndCloseModal}/>
                    ))
                }
            </YStack>
        </YStack>
    )
}