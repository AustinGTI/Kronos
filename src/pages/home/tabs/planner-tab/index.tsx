import React, {useMemo} from 'react'
import {AlertDialog, Button, Sheet, XGroup, XStack, YStack} from "tamagui";
import ActivitiesTab from "./sub-tabs/ActivitiesTab";
import DurationsTab from "./sub-tabs/DurationsTab";
import {PlannerTabContext} from "../../../../globals/contexts/PlannerTabContext";
import {Plus} from "@tamagui/lucide-icons";
import ActivityForm from "./forms/ActivityForm";
import {Activity, Duration} from "../../../../globals/types/main";
import DurationForm from "./forms/DurationForm";
import {DEFAULT_FORM_PARAMS, FormProps} from "../../../../globals/types/form";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../../globals/redux/reducers";
import {createActivity} from "../../../../globals/redux/reducers/activitiesReducer";
import {createActivityValidation} from "../../../../globals/redux/validators/activityValidators";
import {ValidationResponse, ValidationStatus} from "../../../../globals/redux/types";
import {createDurationValidation} from "../../../../globals/redux/validators/durationValidators";
import {createDuration} from "../../../../globals/redux/reducers/durationsReducer";
import {Keyboard, TouchableWithoutFeedback} from "react-native";


interface SubTab {
    key: string
    name: string
    component: JSX.Element
}


const PLANNER_SUB_TABS: SubTab[] = [
    {
        key: 'activities',
        name: 'Activities',
        component: <ActivitiesTab/>
    },
    {
        key: 'durations',
        name: 'Durations',
        component: <DurationsTab/>
    },
]


export default function PlannerTab() {
    // Region : CONTEXTS AND STORES
    const dispatch = useDispatch()
    // ! this convoluted way of accessing the store is necessary because redux throws a warning if you access the whole store, though I do require the whole store at the moment
    const APP_STATE = useSelector(({durations, sessions, activities}: AppState) => ({durations, sessions, activities}))
    // EndRegion
    // Region : STATES
    const [active_sub_tab, setActiveSubTab] = React.useState<SubTab>(PLANNER_SUB_TABS[0])

    const [form_params, setFormParams] = React.useState<FormProps<Activity> | FormProps<Duration>>(DEFAULT_FORM_PARAMS)

    const [modal_is_open, setModalIsOpen] = React.useState<boolean>(false)

    const [alert_text, setAlertText] = React.useState<string | null>(null)
    // EndRegion
    // Region : CALLBACKS
    const AddActivity = React.useCallback((activity: Activity) => {
        // perform validation
        const validation = createActivityValidation(APP_STATE, activity)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(createActivity(activity))
        // close the modal
        setModalIsOpen(false)
        // display a success message
        setAlertText('Activity created successfully')
        return validation
    }, [APP_STATE, dispatch])

    const AddDuration = React.useCallback((duration: Duration) => {
        // perform validation
        const validation = createDurationValidation(APP_STATE, duration)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(createDuration(duration))
        // close the modal
        setModalIsOpen(false)
        // display a success message
        setAlertText('Duration created successfully')
        return validation
    }, [APP_STATE, dispatch])

    const onClickAddButton = React.useCallback(() => {
        setModalIsOpen(true)
        if (active_sub_tab.key === 'activities') {
            setFormParams({
                initial_values: null,
                title: 'Add Activity',
                onSubmit: AddActivity
            })
        } else {
            setFormParams({
                initial_values: null,
                title: 'Add Duration',
                onSubmit: AddDuration
            })
        }
    }, [active_sub_tab.key, AddActivity, AddDuration])
    // EndRegion

    const planner_tab_context = useMemo(() => ({
        form_data: {
            form_params, setFormParams
        },
        modal_data: {
            modal_is_open, setModalIsOpen
        }
    }), [form_params, modal_is_open]);


    return (
        <PlannerTabContext.Provider value={planner_tab_context}>
            <YStack fullscreen={true} jc={'center'} ai={'center'} backgroundColor={'white'}>
                <XStack w={'100%'} justifyContent={'space-between'} padding={15}>
                    <XGroup>
                        {PLANNER_SUB_TABS.map((sub_tab) => (
                            <XGroup.Item key={sub_tab.key}>
                                <Button onPress={() => setActiveSubTab(sub_tab)}>{sub_tab.name}</Button>
                            </XGroup.Item>
                        ))}
                    </XGroup>
                    <Button onPress={onClickAddButton} icon={<Plus size={'4$'}/>}/>
                </XStack>

                <YStack ai={'center'} jc={'center'} flex={1} backgroundColor={'#f7f7f7'} w={'95%'} margin={10}
                        borderRadius={10}>
                    {active_sub_tab.component}
                </YStack>
            </YStack>
            <Sheet modal={true}
                   open={modal_is_open}
                   onOpenChange={setModalIsOpen}
                   dismissOnSnapToBottom
                   disableDrag>
                <Sheet.Overlay/>
                <Sheet.Handle/>
                {
                    // ! There is a bug that causes the sheet frame to glitch upwards when the window frame is open for a few milliseconds
                    // ! This is a fix that sets the background color of the frame to transparent so the glitch can't be seen
                    // ! then creates a View in the sheet with max dimensions and bg white
                }
                <Sheet.Frame height={400} backgroundColor={'transparent'}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <YStack w={'100%'} h={'100%'} backgroundColor={'white'}>
                            {active_sub_tab.key === 'activities' ? (
                                <ActivityForm
                                    title={form_params?.title}
                                    // if initial_values are null or not an instance of type Activity, then it will not be passed to the ActivityForm component
                                    initial_values={form_params?.initial_values as Activity ?? null}
                                    onSubmit={form_params.onSubmit as (activity: Activity) => ValidationResponse}/>
                            ) : (
                                <DurationForm
                                    title={form_params?.title}
                                    // if initial_values are null or not an instance of type Duration, then it will not be passed to the DurationForm component
                                    initial_values={form_params?.initial_values as Duration ?? null}
                                    onSubmit={form_params.onSubmit as (duration: Duration) => ValidationResponse}/>
                            )}
                        </YStack>
                    </TouchableWithoutFeedback>
                </Sheet.Frame>
            </Sheet>
            <AlertDialog
                open={alert_text !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setAlertText(null)
                    }
                }}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay
                        key="overlay"
                        animation="quick"
                        opacity={0.5}
                        enterStyle={{opacity: 0}}
                        exitStyle={{opacity: 0}}
                    />
                    <AlertDialog.Content
                        bordered
                        elevate
                        key="content"
                        animation={[
                            'quick',
                            {
                                opacity: {
                                    overshootClamping: true,
                                },
                            },
                        ]}
                        enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}
                        exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}
                        x={0}
                        scale={1}
                        opacity={1}
                        y={0}
                    >
                        <YStack space>
                            <AlertDialog.Title>Success</AlertDialog.Title>
                            <AlertDialog.Description>
                                {alert_text}
                            </AlertDialog.Description>

                            <XStack space="$3" justifyContent="flex-end">
                                <AlertDialog.Cancel asChild>
                                    <Button>Okay</Button>
                                </AlertDialog.Cancel>
                            </XStack>
                        </YStack>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog>
        </PlannerTabContext.Provider>
    )
}
