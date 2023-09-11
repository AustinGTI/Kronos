import React from "react";
import {StatusBar} from 'expo-status-bar';
import {Text, useColorScheme} from 'react-native';
import {Paragraph, TamaguiProvider, Theme, YStack, Button, Main} from "tamagui";
import config from "./tamagui.config";
import {useFonts} from "expo-font";
import {createDrawerNavigator} from "@react-navigation/drawer";
import HomePage from "./src/pages/home";
import {NavigationContainer} from "@react-navigation/native";
import {Provider} from "react-redux";
import {persistor, store} from "./src/globals/redux";
import {PersistGate} from "redux-persist/integration/react";
import StatisticsPage from "./src/pages/statistics";
import SettingsPage from "./src/pages/settings";



const Drawer = createDrawerNavigator()


export default function App() {
    const color_scheme = useColorScheme()

    const [fonts_loaded, error] = useFonts({
        'Inter': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        'InterBold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    })

    if (!fonts_loaded) {
        return null // todo: add a splash screen or loader
    }

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <TamaguiProvider config={config}>
                    <Theme name={color_scheme === 'dark' ? 'dark' : 'light'}>
                        <NavigationContainer>
                            <Drawer.Navigator initialRouteName={'Home'}>
                                <Drawer.Screen name={'Home'} component={HomePage}/>
                                <Drawer.Screen name={'Statistics'} component={StatisticsPage}/>
                                <Drawer.Screen name={'Settings'} component={SettingsPage}/>
                            </Drawer.Navigator>
                        </NavigationContainer>
                    </Theme>
                </TamaguiProvider>
            </PersistGate>
        </Provider>
    );
}

