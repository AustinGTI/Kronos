import React, {useMemo} from 'react'
import {Button, Circle, Paragraph, ScrollView, Separator, TamaguiElement, View, XStack, YStack} from "tamagui";
import {useDispatch, useSelector} from "react-redux";
import Animated, {useAnimatedStyle, Easing} from "react-native-reanimated";
import {AppState} from "../../../../../globals/redux/reducers";
import {Activity} from "../../../../../globals/types/main";
// import {ArrowDown, Delete, Edit, Play} from "@tamagui/lucide-icons";
import {FlatList} from "react-native";
import {ArrowUpFromDot, ArrowUpRight, Edit, Edit2, PackageOpen, Trash} from "@tamagui/lucide-icons";
import usePlannerTabContext from "../context";
import {
    deleteActivityValidation,
    updateActivityValidation
} from "../../../../../globals/redux/validators/activityValidators";
import {ValidationStatus} from "../../../../../globals/redux/types";
import {deleteActivity, updateActivity} from "../../../../../globals/redux/reducers/activitiesReducer";
import selectPlannerState from "../../../../../globals/redux/selectors/plannerTabSelector";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import ActivityForm from "../forms/ActivityForm";
import KronosAlert from "../../../../../globals/components/wrappers/KronosAlert";
import DeleteButton from "../../../../../globals/components/form/buttons/DeleteButton";
import {boolean, number} from "yup";
import {useSharedValue, withTiming} from "react-native-reanimated";
import {heightPercentageToDP} from "react-native-responsive-screen";
import selectActivityState from "../../../../../globals/redux/selectors/base_selectors/activitiesSelector";

interface ActivityPaneProps {
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
            <Paragraph fontSize={32} color={'$color'} lineHeight={40}>{value}</Paragraph>
            <Paragraph fontSize={8} textTransform={'uppercase'} color={'#aaa'} lineHeight={10}>{label}</Paragraph>
        </YStack>
    );
}

function ActivityPane({activity, open_activity, setOpenActivity}: ActivityPaneProps) {
    const default_pane_height = React.useMemo(() => {
        return heightPercentageToDP('7%')
    }, []);

    const first_render = React.useRef<boolean>(true);

    const [dropdown_height, setDropdownHeight] = React.useState<number>(default_pane_height)

    const dropdown_wrapper_height = useSharedValue<number>(default_pane_height)

    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

    const dispatch = useDispatch()


    // Region CALLBACKS
    // ? ........................

    const handleOnClickPane = React.useCallback(() => {
        if (open_activity === activity) {
            setOpenActivity(null)
        } else {
            setOpenActivity(activity)
        }
    }, [open_activity, setOpenActivity, activity])

    const updateCurrentActivity = React.useCallback((updated_activity: Activity) => {
        const validation = updateActivityValidation(updated_activity)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(updateActivity(updated_activity))
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Success',
                description: 'Activity updated successfully',
                buttons: [],
                with_cancel_button: true
            },
        })
        return validation
    }, [dispatch, openModal]);

    const deleteCurrentActivity = React.useCallback(() => {
        // validate the crud request
        const validation = deleteActivityValidation(activity.id)
        // if validation fails, display the error description after a short delay
        if (validation.status === ValidationStatus.ERROR) {
            openModal({
                type: ModalType.ALERT,
                component: KronosAlert,
                component_props: {
                    title: 'Error',
                    description: validation.error?.message ?? '',
                    buttons: [],
                    with_cancel_button: true,
                    timeout_in_ms: 1000
                }
            })
            return
        }
        // else delete the activity
        dispatch(deleteActivity(activity.id))
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Success',
                description: 'Activity deleted successfully',
                buttons: [],
                with_cancel_button: true,
                timeout_in_ms: 2000
            },
        })
    }, [activity.id, dispatch, openModal]);


    const handleOnClickDeleteButton = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Delete Activity',
                description: 'Are you sure you want to delete this activity?',
                buttons: [
                    {
                        label: 'No',
                        onPress: (closeAlert) => {
                            closeAlert()
                        }
                    },
                    {
                        label: 'Yes',
                        onPress: deleteCurrentActivity
                    },
                ],
            }
        })
    }, [openModal, deleteCurrentActivity])

    const handleOnClickEditButton = React.useCallback(() => {
        openModal({
            type: ModalType.SHEET,
            component: ActivityForm,
            component_props: {
                title: 'Edit Activity',
                submit_text: 'Save',
                initial_values: activity,
                onSubmit: updateCurrentActivity,
                form_header: <DeleteButton onPress={handleOnClickDeleteButton}/>
            },
        })
    }, [activity, openModal, updateCurrentActivity, handleOnClickDeleteButton])

    // ? ........................
    // End ........................


    const is_open = React.useMemo(() => {
        return open_activity?.id === activity.id
    }, [open_activity?.id, activity.id])

    const [sessions, minutes] = useMemo(() => {
        return [activity.stats_data.total_sessions, activity.stats_data.total_time]
    }, [activity.stats_data.total_time, activity.stats_data.total_sessions]);

    React.useEffect(() => {
        if (first_render.current) {
            first_render.current = false;
            dropdown_wrapper_height.value = dropdown_height;
            return;
        }
        dropdown_wrapper_height.value = withTiming(dropdown_height, {duration: 200, easing: Easing.inOut(Easing.cubic)})
    }, [dropdown_height]);

    const dropdown_wrapper_styles = useAnimatedStyle(() => {
        return {
            height: dropdown_wrapper_height.value,
            width: '100%'
        }
    })

    return (
        <KronosContainer width={'100%'} paddingVertical={9}>
            <Animated.View style={dropdown_wrapper_styles}>
                <ScrollView w={'100%'} showsVerticalScrollIndicator={false}>
                    <YStack width={'100%'} onLayout={(event) => setDropdownHeight(event.nativeEvent.layout.height)}>
                        <XStack justifyContent={'space-between'} alignItems={'center'} width={'100%'}
                                onPress={handleOnClickPane}
                                padding={15} height={default_pane_height}>
                            <Circle size={20} backgroundColor={activity.color}/>
                            <Paragraph color={'$color'} textTransform={'uppercase'}
                                       fontSize={14}>{activity.name}</Paragraph>
                            {/*{is_open ? <ChevronUp size={'2$'} color={'$color'}/> : <ChevronDown size={'2$'} color={'$color'}/>}*/}
                            <XStack justifyContent={'space-between'}>
                                <KronosButton
                                    onPress={handleOnClickEditButton} icon={Edit2}/>
                                {/*<KronosButton*/}
                                {/*    onPress={handleOnClickDeleteButton} icon={Trash}/>*/}
                            </XStack>
                        </XStack>
                        {
                            is_open && (
                                <React.Fragment>
                                    <Separator width={'90%'} marginHorizontal={'5%'}/>
                                    <YStack
                                        width={'100%'} backgroundColor={'transparent'} padding={10}>
                                        <XStack justifyContent={'space-around'} width={'100%'} paddingVertical={15}>
                                            <ActivityStat label={'sessions'} value={sessions}/>
                                            {/*<Separator vertical borderColor={'#ccc'}/>*/}
                                            {/*<ActivityStat label={'hours'} value={hours}/>*/}
                                            <ActivityStat label={'minutes'} value={minutes}/>
                                        </XStack>
                                    </YStack>
                                </React.Fragment>
                            )
                        }
                    </YStack>
                </ScrollView>
            </Animated.View>
        </KronosContainer>
    )
}

export default function ActivitiesTab() {
    const activities_state = useSelector(selectActivityState)

    // only one activity can be expanded at a time, the list simulates an accordion
    const [open_activity, setOpenActivity] = React.useState<Activity | null>(null)

    const activities: Activity[] = React.useMemo(() => {
        return Object.values(activities_state)
    }, [activities_state]);

    if (!activities.length) {
        return (
            <View w={'100%'} h={'100%'}>
                <YStack paddingTop={'70%'} alignItems={'center'}>
                    <View paddingVertical={15}>
                        <PackageOpen size={50} color={'$color'}/>
                    </View>
                    <Paragraph fontSize={20} color={'$color'} paddingVertical={5}>No activities yet</Paragraph>
                    <Paragraph color={'$color'} paddingVertical={10}>Click + to add</Paragraph>
                </YStack>
            </View>
        )
    }

    return (
        <FlatList
            style={{width: '100%'}}
            data={activities}
            renderItem={({item}) => (
                <ActivityPane activity={item} open_activity={open_activity}
                              setOpenActivity={setOpenActivity}/>
            )}/>
    )
}