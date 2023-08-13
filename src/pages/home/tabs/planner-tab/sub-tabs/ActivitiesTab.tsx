import React, {useMemo} from 'react'
import {Button, Circle, Paragraph, Separator, XStack, YStack} from "tamagui";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import {Activity, Session} from "../../../../../globals/types/main";
// import {ArrowDown, Delete, Edit, Play} from "@tamagui/lucide-icons";
import {FlatList} from "react-native";
import {ChevronDown, ChevronUp, Delete, Edit, Play} from "@tamagui/lucide-icons";
import {PlannerTabContext} from "../../../../../globals/contexts/PlannerTabContext";
import {updateActivityValidation} from "../../../../../globals/redux/validators/activityValidators";
import {ValidationStatus} from "../../../../../globals/redux/types";
import {updateActivity} from "../../../../../globals/redux/reducers/activitiesReducer";
import {SessionsState} from "../../../../../globals/redux/reducers/sessionsReducer";
import selectPlannerState from "../../../../../globals/redux/selectors/plannerSelector";

interface ActivityPaneProps {
    app_state: AppState
    activity: Activity
    open_activity: Activity | null
    setOpenActivity: React.Dispatch<React.SetStateAction<Activity | null>>
}

interface ActivityStatProps {
    label: string
    value: number
}

export function ActivityStat({value, label}: ActivityStatProps) {
    return (
        <YStack alignItems={'center'} flexGrow={1}>
            <Paragraph fontSize={32} color={'black'} lineHeight={40}>{value}</Paragraph>
            <Paragraph fontSize={8} textTransform={'uppercase'} color={'#aaa'} lineHeight={10}>{label}</Paragraph>
        </YStack>
    );
}

function ActivityPane({app_state, activity, open_activity, setOpenActivity}: ActivityPaneProps) {
    const dispatch = useDispatch()
    const {
        modal_data: {setModalIsOpen, setAlertText},
        form_data: {setFormParams}
    } = React.useContext(PlannerTabContext)

    const handleOnClickPane = React.useCallback(() => {
        if (open_activity === activity) {
            setOpenActivity(null)
        } else {
            setOpenActivity(activity)
        }
    }, [open_activity, setOpenActivity, activity])


    const handleOnClickEditButton = React.useCallback(() => {
        setFormParams({
            title: 'Edit Activity',
            submit_text: 'Save',
            initial_values: activity,
            onSubmit: (updated_activity: Activity) => {
                const validation = updateActivityValidation(app_state, updated_activity)
                if (validation.status === ValidationStatus.ERROR) {
                    return validation
                }
                dispatch(updateActivity(updated_activity))
                // close the modal
                setModalIsOpen(false)
                // display success message
                setAlertText('Activity updated successfully')
                return validation
            }
        })
        setModalIsOpen(true)
    }, [setFormParams, activity, app_state, dispatch, setModalIsOpen, setAlertText])

    const is_open = React.useMemo(() => {
        return open_activity?.id === activity.id
    }, [open_activity?.id, activity.id])

    const [sessions, hours, minutes] = useMemo(() => {
        // convert the activity stats data into a more readable format
        const hours = Math.floor(activity.stats_data.total_time / 60)
        const minutes = activity.stats_data.total_time % 60
        return [activity.stats_data.total_sessions, hours, minutes]
    }, [activity.stats_data.total_time, activity.stats_data.total_sessions]);

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
                            <XStack justifyContent={'space-around'} width={'100%'} paddingVertical={15}>
                                <ActivityStat label={'sessions'} value={sessions}/>
                                {/*<Separator vertical borderColor={'#ccc'}/>*/}
                                {/*<ActivityStat label={'hours'} value={hours}/>*/}
                                <ActivityStat label={'minutes'} value={minutes}/>
                            </XStack>
                            <XStack justifyContent={'space-around'} width={'100%'} paddingVertical={10}>
                                <Button onPress={handleOnClickEditButton} padding={0} margin={0} height={20}>
                                    <Edit size={20} color={'#777'}/>
                                </Button>
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
    const planner_app_state = useSelector(selectPlannerState)

    // only one activity can be expanded at a time, the list simulates an accordion
    const [open_activity, setOpenActivity] = React.useState<Activity | null>(null)
    return (
        <FlatList
            style={{width: '100%', marginVertical: 10}}
            data={Object.values(planner_app_state.activities)}
            renderItem={({item}) => (
                <ActivityPane app_state={planner_app_state} activity={item} open_activity={open_activity}
                              setOpenActivity={setOpenActivity}/>
            )}/>
    )
}