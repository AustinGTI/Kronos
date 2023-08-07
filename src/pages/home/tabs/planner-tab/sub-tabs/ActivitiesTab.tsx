import React from 'react'
import {Circle, Paragraph, Separator, XStack, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import {Activity} from "../../../../../globals/types/main";
// import {ArrowDown, Delete, Edit, Play} from "@tamagui/lucide-icons";
import {FlatList} from "react-native";
import {ArrowDown, ChevronDown, ChevronUp, Delete, Edit, Play} from "@tamagui/lucide-icons";

interface ActivityPaneProps {
    activity: Activity
    open_activity: Activity | null
    setOpenActivity: React.Dispatch<React.SetStateAction<Activity | null>>
}

function ActivityPane({activity, open_activity, setOpenActivity}: ActivityPaneProps) {
    const handleOnClickPane = React.useCallback(() => {
        if (open_activity === activity) {
            setOpenActivity(null)
        } else {
            setOpenActivity(activity)
        }
    }, [open_activity, setOpenActivity, activity])

    const is_open = React.useMemo(() => {
        return open_activity?.id === activity.id
    }, [open_activity?.id, activity.id])
    return (
        <YStack width={'95%'} borderRadius={10} margin={'2.5%'} backgroundColor={'white'}>
            <XStack justifyContent={'space-between'} alignItems={'center'} width={'100%'} onPress={handleOnClickPane}
                    padding={20}>
                <Circle size={20} backgroundColor={activity.color}/>
                <Paragraph>{activity.name}</Paragraph>
                {is_open ? <ChevronUp size={'2$'} color={'#777'}/> : <ChevronDown size={'2$'} color={'#777'}/>}
            </XStack>
            {
                is_open && (
                    <React.Fragment>
                        <Separator width={'90%'} marginHorizontal={'5%'}/>
                        <YStack width={'100%'} backgroundColor={'transparent'} padding={10}>
                            <XStack justifyContent={'space-around'} width={'100%'} paddingVertical={5}>
                                <Paragraph>{`${activity.stats_data.total_sessions} SESSIONS`}</Paragraph>
                                <Paragraph>{`${activity.stats_data.total_time} MINUTES`}</Paragraph>
                            </XStack>
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
    )
}

export default function ActivitiesTab() {
    const activities = useSelector((state: AppState) => state.activities)

    // only one activity can be expanded at a time, the list simulates an accordion
    const [open_activity, setOpenActivity] = React.useState<Activity | null>(null)
    return (
        <FlatList
            style={{width: '100%', marginVertical: 10}}
            data={Object.values(activities)}
            renderItem={({item}) => (
                <ActivityPane activity={item} open_activity={open_activity} setOpenActivity={setOpenActivity}/>
            )}/>
    )
}