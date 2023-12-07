import React, {useCallback, useMemo} from 'react'
import {Button, Paragraph, Separator, Stack, XStack, YStack} from "tamagui";
import {Duration, Segment} from "../../../../../globals/types/main";
import {Edit, Edit2, Trash} from "@tamagui/lucide-icons";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import {FlatList} from "react-native";
import usePlannerTabContext from "../context";
import {deleteDuration, updateDuration} from "../../../../../globals/redux/reducers/durationsReducer";
import {
    deleteDurationValidation,
    updateDurationValidation
} from "../../../../../globals/redux/validators/durationValidators";
import {ValidationStatus} from "../../../../../globals/redux/types";
import selectPlannerState from "../../../../../globals/redux/selectors/plannerTabSelector";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import KronosAlert from "../../../../../globals/components/wrappers/KronosAlert";
import DurationForm from "../forms/DurationForm";

interface DurationPaneProps {
    app_state: AppState,
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

function DurationPane({app_state, duration, open_duration, setOpenDuration}: DurationPaneProps) {
    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

    const dispatch = useDispatch()

    const handleOnClickPane = useCallback(() => {
        if (open_duration === duration) {
            setOpenDuration(null)
        } else {
            setOpenDuration(duration)
        }
    }, [open_duration, duration, setOpenDuration]);

    const updateCurrentDuration = React.useCallback((updated_duration: Duration) => {
        const validation = updateDurationValidation(app_state, updated_duration)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(updateDuration(updated_duration))
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Success',
                description: 'Duration updated successfully',
                buttons: [],
                with_cancel_button: true
            }
        })
        return validation
    }, [app_state, dispatch, openModal]);

    const deleteCurrentDuration = React.useCallback(() => {
        // validate the crud request
        const validation = deleteDurationValidation(app_state, duration.id)
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
        dispatch(deleteDuration(duration.id))
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Success',
                description: 'Duration deleted successfully',
                buttons: [],
                with_cancel_button: true,
                timeout_in_ms: 2000
            }
        })
    }, [app_state, duration.id, dispatch, openModal]);

    const handleOnClickEditButton = React.useCallback(() => {
        openModal({
            type: ModalType.SHEET,
            component: DurationForm,
            component_props: {
                title: 'Edit Duration',
                submit_text: 'Save',
                initial_values: duration,
                onSubmit: updateCurrentDuration
            }
        })
    }, [duration, openModal, updateCurrentDuration])

    const handleOnClickDeleteButton = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Delete Duration',
                description: 'Are you sure you want to delete this duration?',
                buttons: [
                    {
                        label: 'No',
                        onPress: (closeAlert) => closeAlert()
                    },
                    {
                        label: 'Yes',
                        onPress: deleteCurrentDuration
                    }
                ]
            }
        })
    }, [openModal, deleteCurrentDuration])


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
        <KronosContainer width={'100%'} padding={0}>
            <YStack width={'100%'}>
                <XStack justifyContent={'space-between'} alignItems={'center'} width={'100%'}
                        onPress={handleOnClickPane}
                        padding={15}>
                    <YStack alignItems={'center'}>
                        <Paragraph fontSize={24} color={'$color'} lineHeight={28}>{total_duration}</Paragraph>
                        <Paragraph fontSize={14} color={'$color'} lineHeight={16}>MINS</Paragraph>
                    </YStack>
                    <Paragraph textTransform={'uppercase'}>{duration.name}</Paragraph>
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
                            <YStack width={'100%'} backgroundColor={'transparent'} padding={10}>
                                <YStack width={'100%'} backgroundColor={'transparent'} paddingHorizontal={20}>
                                    <DurationSegmentTimeline duration={duration}/>
                                    {duration.segments.map((segment, idx) => (
                                        <DurationSegmentPane key={idx} segment={segment}
                                                             max_segment_duration={max_segment_duration}/>
                                    ))}
                                </YStack>
                                <XStack justifyContent={'space-around'} width={'100%'} paddingTop={10}>
                                    <Button
                                        onPress={handleOnClickEditButton} flexGrow={1} paddingVertical={5} margin={0}
                                        backgroundColor={'transparent'} borderTopRightRadius={0}
                                        borderBottomRightRadius={0}>
                                        <Edit size={20} color={'$color'}/>
                                    </Button>
                                    {/*<Play size={20} color={'$color'}/>*/}
                                    <Button
                                        onPress={handleOnClickDeleteButton} flexGrow={1} paddingVertical={5} margin={0}
                                        backgroundColor={'transparent'} borderTopLeftRadius={0} borderBottomLeftRadius={0}>
                                        <Trash size={20} color={'$color'}/>
                                    </Button>
                                </XStack>
                            </YStack>
                        </React.Fragment>
                    )
                }
            </YStack>
        </KronosContainer>
    );
}

export default function DurationsTab() {
    const planner_app_state = useSelector(selectPlannerState)

    // only one increment can be open at a time to simulate an accordion
    const [open_duration, setOpenDuration] = React.useState<Duration | null>(null)

    return (
        <FlatList
            style={{width: '100%'}}
            data={Object.values(planner_app_state.durations)}
            renderItem={({item}) => (
                <DurationPane app_state={planner_app_state} duration={item} open_duration={open_duration}
                              setOpenDuration={setOpenDuration}/>
            )}/>
    )
}
