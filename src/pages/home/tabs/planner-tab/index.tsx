import React, {useMemo} from 'react'
import {AlertDialog, Button, Sheet, XGroup, XStack, YStack} from "tamagui";
import ActivitiesTab from "./sub-tabs/ActivitiesTab";
import DurationsTab from "./sub-tabs/DurationsTab";
import {
    PlannerTabContext,
    PlannerTabContextProps,
    PlannerTabFormData
} from "./context";
import {Plus} from "@tamagui/lucide-icons";
import ActivityForm from "./forms/ActivityForm";
import {Activity, Duration, Session} from "../../../../globals/types/main";
import DurationForm from "./forms/DurationForm";
import {DEFAULT_FORM_PROPS, FormProps} from "../../../../globals/types/form";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../../globals/redux/reducers";
import {createActivity} from "../../../../globals/redux/reducers/activitiesReducer";
import {createActivityValidation} from "../../../../globals/redux/validators/activityValidators";
import {ValidationResponse, ValidationStatus} from "../../../../globals/redux/types";
import {createDurationValidation} from "../../../../globals/redux/validators/durationValidators";
import {createDuration} from "../../../../globals/redux/reducers/durationsReducer";
import {Keyboard, TouchableWithoutFeedback} from "react-native";
import {SessionsState} from "../../../../globals/redux/reducers/sessionsReducer";
import {createSelector} from "@reduxjs/toolkit";
import selectPlannerState from "../../../../globals/redux/selectors/plannerTabSelector";
import {AlertProps, DEFAULT_ALERT_PROPS} from "../../../../globals/types/alert";


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

    const planner_app_state = useSelector(selectPlannerState)
    // EndRegion
    // Region : STATES
    const [active_sub_tab, setActiveSubTab] = React.useState<SubTab>(PLANNER_SUB_TABS[0])

    const [form_is_open, setFormIsOpen] = React.useState<boolean>(false)
    const [form_props, setFormProps] = React.useState<FormProps<Activity> | FormProps<Duration> | null>(null)

    const [alert_is_open, setAlertIsOpen] = React.useState<boolean>(false)
    const [alert_props, setAlertProps] = React.useState<AlertProps | null>(null)
    // EndRegion
    // Region : CALLBACKS
    const AddActivity = React.useCallback((activity: Activity) => {
        // perform validation
        const validation = createActivityValidation(planner_app_state, activity)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(createActivity(activity))
        // close the modal and clear the form
        setFormIsOpen(false)
        setFormProps(null)
        // display a success message
        setAlertProps({
            title: 'Success',
            description: 'Activity created successfully',
            buttons: [],
            with_cancel_button: true,
        })
        setAlertIsOpen(true)
        return validation
    }, [planner_app_state, dispatch])

    const AddDuration = React.useCallback((duration: Duration) => {
        // perform validation
        const validation = createDurationValidation(planner_app_state, duration)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        console.log('adding increment')
        dispatch(createDuration(duration))
        // close the modal and clear the form
        setFormIsOpen(false)
        setFormProps(null)
        // display a success message
        setAlertProps({
            title: 'Success',
            description: 'Duration created successfully',
            buttons: [],
            with_cancel_button: true,
        })
        setAlertIsOpen(true)
        return validation
    }, [planner_app_state, dispatch])

    const onClickAddButton = React.useCallback(() => {
        setFormIsOpen(true)
        if (active_sub_tab.key === 'activities') {
            setFormProps({
                initial_values: null,
                title: 'Create New Activity',
                submit_text: 'Create Activity',
                onSubmit: AddActivity
            })
        } else {
            setFormProps({
                initial_values: null,
                title: 'Create New Duration',
                submit_text: 'Create Duration',
                onSubmit: AddDuration
            })
        }
    }, [active_sub_tab.key, AddActivity, AddDuration])
    // EndRegion

    const planner_tab_context: PlannerTabContextProps = useMemo(() => ({
        form_data: {
            form_props: form_props, setFormProps: setFormProps
        },
        modal_data: {
            form_modal_is_open: form_is_open, setFormModalIsOpen: setFormIsOpen,
            alert_modal_is_open: alert_is_open, setAlertModalIsOpen: setAlertIsOpen,
        },
        alert_data: {
            alert_props, setAlertProps,
        }
    }), [form_props, form_is_open, alert_is_open, alert_props]);


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
                   open={form_is_open}
                   onOpenChange={(open: boolean) => {
                       if (!open) {
                           // wait for the sheet to close before clearing the form props
                           setTimeout(() => {
                               setFormProps(null)
                           }, 500)
                       }
                       setFormIsOpen(open)
                   }}
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
                        <Sheet.ScrollView w={'100%'} h={'100%'} backgroundColor={'white'}>
                            {form_props ? active_sub_tab.key === 'activities' ? (
                                <ActivityForm
                                    title={form_props?.title}
                                    // if initial_values are null or not an instance of type Activity, then it will not be passed to the ActivityForm component
                                    initial_values={form_props?.initial_values as Activity ?? null}
                                    submit_text={form_props?.submit_text}
                                    onSubmit={form_props.onSubmit as (activity: Activity) => ValidationResponse}/>
                            ) : (
                                <DurationForm
                                    title={form_props?.title}
                                    // if initial_values are null or not an instance of type Duration, then it will not be passed to the DurationForm component
                                    initial_values={form_props?.initial_values as Duration ?? null}
                                    submit_text={form_props?.submit_text}
                                    onSubmit={form_props.onSubmit as (duration: Duration) => ValidationResponse}/>
                            ) : null}
                        </Sheet.ScrollView>
                    </TouchableWithoutFeedback>
                </Sheet.Frame>
            </Sheet>
            <AlertDialog
                open={alert_is_open}
                onOpenChange={setAlertIsOpen}>
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
                        {alert_props && (
                            <YStack space>
                                <AlertDialog.Title w={'100%'} textAlign={'center'} textTransform={'uppercase'}
                                                   textDecorationLine={'underline'} fontSize={20}>
                                    {alert_props.title}
                                </AlertDialog.Title>
                                <AlertDialog.Description w={'100%'} textAlign={'center'}>
                                    {alert_props.description}
                                </AlertDialog.Description>

                                <XStack space="$3" justifyContent={
                                    alert_props.buttons.length + (alert_props.with_cancel_button ? 1 : 0) > 1 ? 'space-between' : 'center'
                                }>
                                    {alert_props.with_cancel_button && <AlertDialog.Cancel asChild>
                                        <Button>Close</Button>
                                    </AlertDialog.Cancel>}
                                    {alert_props.buttons.map((button, index) => (
                                        // <AlertDialog.Action key={index} asChild>
                                        <Button key={index} onPress={button.onPress}>
                                            {button.text}
                                        </Button>
                                        // </AlertDialog.Action>
                                    ))}
                                </XStack>
                            </YStack>
                        )}
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog>
        </PlannerTabContext.Provider>
    )
}
