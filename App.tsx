import React from "react";
import {AppState, useColorScheme} from 'react-native';
import {TamaguiProvider, Theme} from "tamagui";
import config from "./tamagui.config";
import {useFonts} from "expo-font";
import {createDrawerNavigator} from "@react-navigation/drawer";
import HomePage from "./src/pages/home";
import {NavigationContainer} from "@react-navigation/native";
import {Provider, useSelector} from "react-redux";
import {persistor, store} from "./src/globals/redux";
import {PersistGate} from "redux-persist/integration/react";
import StatisticsPage from "./src/pages/statistics";
import SettingsPage from "./src/pages/settings";
import {AppTheme} from "./src/globals/redux/reducers/settingsReducer";


const Drawer = createDrawerNavigator()

function AppScreens() {
    const color_scheme = useColorScheme()
    // get the theme from redux
    const theme: AppTheme = useSelector((state: AppState) => state.settings.theme)
    // if the theme is system, get the system theme
    const active_theme: 'dark' | 'light' = React.useMemo(() => {
        switch (theme) {
            case AppTheme.DARK:
                return 'dark'
            case AppTheme.LIGHT:
                return 'light'
            case AppTheme.SYSTEM:
                return color_scheme === 'dark' ? 'dark' : 'light'
        }
    }, [theme, color_scheme]);

    return (
        <Theme name={active_theme}>
            <NavigationContainer>
                <Drawer.Navigator initialRouteName={'Home'}>
                    <Drawer.Screen name={'Home'} component={HomePage}/>
                    <Drawer.Screen name={'Statistics'} component={StatisticsPage}/>
                    <Drawer.Screen name={'Settings'} component={SettingsPage}/>
                </Drawer.Navigator>
            </NavigationContainer>
        </Theme>
    )
}

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
                    <AppScreens/>
                </TamaguiProvider>
            </PersistGate>
        </Provider>
    );
}

