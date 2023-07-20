import React from "react";
import {StatusBar} from 'expo-status-bar';
import {Text, useColorScheme} from 'react-native';
import {Paragraph, TamaguiProvider, Theme, YStack, Button, Main} from "tamagui";
import config from "./tamagui.config";
import {useFonts} from "expo-font";
import * as Font from 'expo-font';
import {createDrawerNavigator} from "@react-navigation/drawer";
import HomePage from "./src/pages/home";
import {NavigationContainer} from "@react-navigation/native";

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
        <TamaguiProvider config={config}>
            <Theme name={color_scheme === 'dark' ? 'dark' : 'light'}>
                <NavigationContainer>
                    <Drawer.Navigator initialRouteName={'Home'}>
                        <Drawer.Screen name={'Home'} component={HomePage}/>
                    </Drawer.Navigator>
                </NavigationContainer>
             </Theme>
         </TamaguiProvider>
    );
}

