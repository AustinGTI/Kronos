import React, {createContext} from 'react'
import {Button, Paragraph, XGroup, XStack, YStack} from "tamagui";
import {useDispatch} from "react-redux";
import ActivitiesTab from "./sub-tabs/ActivitiesTab";
import DurationsTab from "./sub-tabs/DurationsTab";
import IconProp from "@tamagui/button/types/Button";
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

    return (
        <YStack fullscreen={true} jc={'center'} ai={'center'} backgroundColor={'white'}>
            <XStack w={'100%'} justifyContent={'space-between'} padding={15}>
                <XGroup>
                    {PLANNER_SUB_TABS.map((sub_tab) => (
                        <XGroup.Item key={sub_tab.key}>
                            <Button onPress={() => setActiveSubTab(sub_tab)}>{sub_tab.name}</Button>
                        </XGroup.Item>
                    ))}
                </XGroup>
                <Button icon={<Plus size={'4$'}/>}/>
            </XStack>

            <YStack ai={'center'} jc={'center'} flex={1} backgroundColor={'#f7f7f7'} w={'95%'} margin={10} borderRadius={10}>
                {active_sub_tab.component}
            </YStack>
        </YStack>
    )
}
