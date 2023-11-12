import React from 'react'
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import CalendarTab from "./tabs/calendar-tab";
import TimerTab from "./tabs/timer-tab";
import PlannerTab from "./tabs/planner-tab";
import {BarChart, Calendar, Clipboard, Settings, Timer} from "@tamagui/lucide-icons";
import {useTheme} from "tamagui";
import {SECONDARY_COLOR} from "../../globals/types/main";
import StatisticsTab from "./tabs/statistics-tab";
import SettingsTab from "./tabs/settings-tab";


const Tab = createBottomTabNavigator()

export default function HomePage() {
    const {background,foreground,color,borderColor} = useTheme()
    // const dispatch = useDispatch()
    // dispatch(clearSessions())
    // // generate dummy sessions from 1st September 2023 to today
    // const start_date = new Date(2021, 8, 1)
    // dispatch(generateDummySessions({start_date}))
    console.log('theme props at the moment are ',background,color,borderColor)
    return (
        <Tab.Navigator
            initialRouteName={'Timer'}
            screenOptions={{
            headerShown: false,
            tabBarLabel: () => null,
            tabBarStyle: {
                backgroundColor: foreground?.val,
            }
        }}>
            <Tab.Screen name={'Statistics'} component={StatisticsTab} options={{
                tabBarIcon: ({focused}) => (
                    <BarChart size={25} color={focused ? SECONDARY_COLOR : color?.val}/>
                )
            }}/>
            <Tab.Screen name={'Calendar'} component={CalendarTab} options={{
                tabBarIcon: ({focused}) => (
                    <Calendar size={25} color={focused ? SECONDARY_COLOR : color?.val}/>
                )
            }}/>
            <Tab.Screen name={'Timer'} component={TimerTab} options={{
                tabBarIcon: ({focused}) => (
                    <Timer size={25} color={focused ? SECONDARY_COLOR : color?.val}/>
                )
            }}/>
            <Tab.Screen name={'Planner'} component={PlannerTab} options={{
                tabBarIcon: ({focused}) => (
                    <Clipboard size={25} color={focused ? SECONDARY_COLOR : color?.val}/>
                )
            }}/>
            <Tab.Screen name={'Settings'} component={SettingsTab} options={{
                tabBarIcon: ({focused}) => (
                    <Settings size={25} color={focused ? SECONDARY_COLOR : color?.val}/>
                )
            }}/>
        </Tab.Navigator>
    )
}