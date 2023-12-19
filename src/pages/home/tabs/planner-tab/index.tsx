import React, {useMemo} from 'react'
import {AlertDialog, Button, Sheet, XStack, YStack} from "tamagui";
import ActivitiesTab from "./sub-tabs/ActivitiesTab";
import DurationsTab from "./sub-tabs/DurationsTab";
import {PlannerTabContext, PlannerTabContextProps} from "./context";
import {Plus} from "@tamagui/lucide-icons";
import ActivityForm from "./forms/ActivityForm";
import {Activity, Duration} from "../../../../globals/types/main";
import DurationForm from "./forms/DurationForm";
import {FormProps} from "../../../../globals/types/form";
import {useDispatch, useSelector} from "react-redux";
import {createActivity} from "../../../../globals/redux/reducers/activitiesReducer";
import {createActivityValidation} from "../../../../globals/redux/validators/activityValidators";
import {ValidationResponse, ValidationStatus} from "../../../../globals/redux/types";
import {createDurationValidation} from "../../../../globals/redux/validators/durationValidators";
import {createDuration} from "../../../../globals/redux/reducers/durationsReducer";
import selectPlannerState from "../../../../globals/redux/selectors/plannerTabSelector";
import {AlertProps} from "../../../../globals/types/alert";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";
import KronosPage, {KronosPageContext, ModalType} from "../../../../globals/components/wrappers/KronosPage";
import KronosButton from "../../../../globals/components/wrappers/KronosButton";
import KronosAlert from "../../../../globals/components/wrappers/KronosAlert";


interface SubTab {
    key: string
    name: string
    component: JSX.Element
}


const PLANNER_SUB_TABS: SubTab[] = [
    {
        key: 'activities',
        name: 'ACTIVITIES',
        component: <ActivitiesTab/>
    },
    {
        key: 'durations',
        name: 'DURATIONS',
        component: <DurationsTab/>
    },
]

function PlannerTabContents() {
    // Region : CONTEXTS AND STORES
    const dispatch = useDispatch()

    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

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
    const addActivity = React.useCallback((activity: Activity) => {
        // perform validation
        const validation = createActivityValidation(planner_app_state, activity)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(createActivity(activity))
        // display a success description
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Success',
                description: 'Activity created successfully',
                buttons: [],
                with_cancel_button: true,
            }
        })
        return validation
    }, [planner_app_state, dispatch, openModal])

    const addDuration = React.useCallback((duration: Duration) => {
        // perform validation
        const validation = createDurationValidation(planner_app_state, duration)
        if (validation.status === ValidationStatus.ERROR) {
            return validation
        }
        dispatch(createDuration(duration))
        openModal({
            type: ModalType.ALERT,
            component: KronosAlert,
            component_props: {
                title: 'Success',
                description: 'Duration created successfully',
                buttons: [],
                with_cancel_button: true,
            }
        })
        // setAlertIsOpen(true)
        return validation
    }, [planner_app_state, dispatch, openModal])

    const onClickAddButton = React.useCallback(() => {
        if (active_sub_tab.key === 'activities') {
            openModal({
                type: ModalType.SHEET,
                component: ActivityForm,
                component_props: {
                    title: 'Create Activity',
                    submit_text: 'Add',
                    onSubmit: addActivity,
                    initial_values: null
                }
            })
        } else {
            openModal({
                type: ModalType.SHEET,
                component: DurationForm,
                component_props: {
                    title: 'Create Duration',
                    submit_text: 'Add',
                    onSubmit: addDuration,
                    initial_values: null
                }
            })
        }
    }, [active_sub_tab.key, openModal, addActivity, addDuration])
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
    }), [form_props, form_is_open, alert_is_open, alert_props, setFormProps, setFormIsOpen, setAlertIsOpen, setAlertProps]);


    return (
        <PlannerTabContext.Provider value={planner_tab_context}>
            <YStack w={'100%'} h={'100%'} jc={'center'} ai={'center'}>
                <XStack w={'100%'} h={'7%'} justifyContent={'space-between'} alignItems={'center'}>
                    <KronosContainer w={'60%'} h={'100%'} padding={0}>
                        <XStack w={'100%'} h={'100%'} justifyContent={'space-around'} alignItems={'center'}>
                            {PLANNER_SUB_TABS.map((sub_tab) => (
                                <KronosButton
                                    key={sub_tab.key}
                                    onPress={() => setActiveSubTab(sub_tab)}
                                    label={sub_tab.name}
                                    is_active={sub_tab.key === active_sub_tab.key}/>
                            ))}
                        </XStack>
                    </KronosContainer>
                    <KronosContainer w={50} h={50} padding={0} borderRadius={25}>
                        <KronosButton onPress={onClickAddButton} icon={Plus} w={'100%'} h={'100%'}/>
                    </KronosContainer>
                </XStack>
                <YStack ai={'center'} jc={'center'} h={'93%'} w={'100%'} marginTop={15}>
                    {active_sub_tab.component}
                </YStack>
            </YStack>
        </PlannerTabContext.Provider>
    )
}

export default function PlannerTab() {
    return (
        <KronosPage>
            <PlannerTabContents/>
        </KronosPage>
    )

}