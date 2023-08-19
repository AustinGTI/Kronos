import React from 'react'
import {useSelector} from "react-redux";
import selectTimerState from "../../../../../globals/redux/selectors/timerTabSelector";
import {Heading, Paragraph, View, XStack, YStack} from "tamagui";
import useTimerTabContext from "../context";
import {Activity, Duration, UNTITLED_ACTIVITY} from "../../../../../globals/types/main";

interface SelectActivityPaneProps {
    activity: Activity
    is_selected: boolean
    setToTimerActivity: (activity: Activity) => void
    duration?: Duration
}

function SelectActivityPane({activity, duration, setToTimerActivity, is_selected}: SelectActivityPaneProps) {
    return (
        <YStack w={'100%'} onPress={() => setToTimerActivity(activity)}>
            <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
            </XStack>
            <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
                <YStack w={'100%'}>
                    <Paragraph>Default Duration</Paragraph>
                </YStack>
                <View>
                </View>
            </XStack>
        </YStack>
    )
}

export default function SelectActivityModal() {
    const {durations, activities} = useSelector(selectTimerState)
    const {
        timer_data: {
            config_data: {
                timer_activity,
                setTimerActivity
            }
        }
    } = useTimerTabContext()
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
            {
                [UNTITLED_ACTIVITY,...Object.values(activities)].map((activity) => (
                    <SelectActivityPane
                        key={activity.id}
                        activity={activity}
                        duration={activity.default_duration_id !== null ? durations[activity.default_duration_id] : undefined}
                        is_selected={timer_activity?.id === activity.id}
                        setToTimerActivity={setTimerActivity}/>
                ))
            }
        </YStack>
    )
}