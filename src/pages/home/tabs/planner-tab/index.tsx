import React, {createContext, useMemo} from 'react'
import {Button, Paragraph, Sheet, XGroup, XStack, YStack} from "tamagui";
import ActivitiesTab from "./sub-tabs/ActivitiesTab";
import DurationsTab from "./sub-tabs/DurationsTab";
import {PlannerTabContext} from "../../../../globals/contexts/PlannerTabContext";
import {Plus} from "@tamagui/lucide-icons";


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

    const [modal_is_open, setModalIsOpen] = React.useState<boolean>(false)

    const [modal_form, setModalForm] = React.useState<JSX.Element>(<Paragraph>Modal Form</Paragraph>)

    const planner_tab_context = useMemo(() => ({
        modal_data: {
            modal_form,setModalForm
        }
    }), []);

    console.log('the modal is open', modal_is_open)

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
                    <Button onPress={() => setModalIsOpen(true)} icon={<Plus size={'4$'}/>}/>
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
                    {modal_form}
                </Sheet.Frame>
            </Sheet>
        </PlannerTabContext.Provider>
    )
}
