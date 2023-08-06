import React from 'react'
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import CalendarTab from "./tabs/calendar-tab";
import TimerTab from "./tabs/timer-tab";
import PlannerTab from "./tabs/planner-tab";

const Tab = createBottomTabNavigator()

export default function HomePage() {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
        }}>
            <Tab.Screen name={'Calendar'} component={CalendarTab} />
            <Tab.Screen name={'Timer'} component={TimerTab} />
            <Tab.Screen name={'Planner'} component={PlannerTab} />
        </Tab.Navigator>
    )
}