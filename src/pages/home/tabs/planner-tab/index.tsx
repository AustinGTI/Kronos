import React, {createContext, useMemo} from 'react'
import {Button, Paragraph, Sheet, XGroup, XStack, YStack} from "tamagui";
import ActivitiesTab from "./sub-tabs/ActivitiesTab";
import DurationsTab from "./sub-tabs/DurationsTab";
import {PlannerTabContext, PlannerTabFormData} from "../../../../globals/contexts/PlannerTabContext";
import {Plus} from "@tamagui/lucide-icons";
import ActivityForm from "./forms/ActivityForm";
import {Activity, Duration} from "../../../../globals/types/main";
import DurationForm from "./forms/DurationForm";


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
    const [active_sub_tab, setActiveSubTab] = React.useState<SubTab>(PLANNER_SUB_TABS[0])

    const [form_data, setFormData] = React.useState<PlannerTabFormData | undefined>()

    const [modal_is_open, setModalIsOpen] = React.useState<boolean>(false)

    const planner_tab_context = useMemo(() => ({
        form_data, setFormData
    }), [form_data]);

    const onClickAddButton = React.useCallback(() => {
        setModalIsOpen(true)
        setFormData({
            initial_values: null,
            form_title: active_sub_tab.key === 'activities' ? 'Add Activity' : 'Add Duration'
        })
    }, [active_sub_tab.key])

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
            <Sheet modal={true} open={modal_is_open} onOpenChange={setModalIsOpen} dismissOnSnapToBottom>
                <Sheet.Overlay backgroundColor={'transparent'}/>
                <Sheet.Handle/>
                <Sheet.Frame>
                    {active_sub_tab.key === 'activities' ? (
                        <ActivityForm
                            title={form_data?.form_title}
                            // if initial_values are null or not an instance of type Activity, then it will not be passed to the ActivityForm component
                            activity={form_data?.initial_values ? form_data.initial_values as Activity : undefined}/>
                    ) : (
                        <DurationForm
                            title={form_data?.form_title}
                            // if initial_values are null or not an instance of type Duration, then it will not be passed to the DurationForm component
                            duration={form_data?.initial_values ? form_data.initial_values as Duration : undefined}/>
                    )}
                </Sheet.Frame>
            </Sheet>
        </PlannerTabContext.Provider>
    )
}
