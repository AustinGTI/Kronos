import React from 'react'
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import CalendarTab from "./tabs/calendar-tab";
import TimerTab from "./tabs/timer-tab";
import PlannerTab from "./tabs/planner-tab";
import {useDispatch} from "react-redux";
import {clearSessions, generateDummySessions} from "../../globals/redux/reducers/sessionsReducer";

const Tab = createBottomTabNavigator()

export default function HomePage() {
    // const dispatch = useDispatch()
    // dispatch(clearSessions())
    // // generate dummy sessions from 1st August 2023 to today
    // const start_date = new Date(2021, 7, 1)
    // dispatch(generateDummySessions({start_date}))
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