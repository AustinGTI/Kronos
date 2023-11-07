import React from "react";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {Paragraph, ScrollView, TamaguiProvider, Theme, useTheme, useThemeName, View, XStack, YStack} from "tamagui";
import config from "./tamagui.config";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useFonts} from "expo-font";
import {
    createDrawerNavigator,
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItemList
} from "@react-navigation/drawer";
import HomePage from "./src/pages/home";
import {NavigationContainer} from "@react-navigation/native";
import {Provider, useSelector} from "react-redux";
import {persistor, store} from "./src/globals/redux";
import {PersistGate} from "redux-persist/integration/react";
import StatisticsTab from "./src/pages/home/tabs/statistics-tab";
import SettingsTab from "./src/pages/home/tabs/settings-tab";
import {AppTheme} from "./src/globals/redux/reducers/settingsReducer";
import {AppState} from "./src/globals/redux/reducers"
import {SECONDARY_COLOR} from "./src/globals/types/main";
import {StatusBar} from "react-native";


const Drawer = createDrawerNavigator()

function CustomDrawerContent(props: DrawerContentComponentProps) {
    return (
        <DrawerContentScrollView {...props}>
            <YStack height={hp('98%')}>
                <XStack alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
                    <Paragraph fontSize={30} lineHeight={30}>KRONOS</Paragraph>
                </XStack>
                <DrawerItemList {...props} />
                <YStack flexGrow={1} alignItems={'center'} justifyContent={'flex-end'}>
                    <Paragraph>By Aught. 2023.</Paragraph>
                </YStack>
            </YStack>
        </DrawerContentScrollView>
    );
}

function ThemeWrapper({children}: { children: React.ReactNode }) {
    // get the theme from redux
    const theme: AppTheme = useSelector((state: AppState) => state.settings.theme)

    const active_theme: 'dark' | 'light' = React.useMemo(() => {
        switch (theme) {
            case AppTheme.DARK:
                return 'dark'
            case AppTheme.LIGHT:
                return 'light'
        }
    }, [theme]);

    return (
        <Theme name={active_theme}>
            {children}
        </Theme>
    )
}


function DrawerNestedAppScreen() {
    const {
        foreground: {val: foreground},
        background: {val: background},
        color: {val: color},
        borderColor: {val: borderColor}
    } = useTheme()

    return (
        <NavigationContainer>
            <Drawer.Navigator
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: background,
                        width: '50%',
                    },
                    // drawerItemStyle: {
                    //     backgroundColor: foreground
                    // },
                    drawerInactiveTintColor: color,
                    drawerActiveTintColor: SECONDARY_COLOR,
                    drawerType: "slide"
                }}
                drawerContent={CustomDrawerContent}
                initialRouteName={'Home'}>
                <Drawer.Screen name={'Home'} component={HomePage}/>
                <Drawer.Screen name={'Statistics'} component={StatisticsTab}/>
                <Drawer.Screen name={'Settings'} component={SettingsTab}/>
            </Drawer.Navigator>
        </NavigationContainer>
    )
}

function AppScreens() {
    const theme_name = useThemeName()
    const {background: {val: background_color}} = useTheme()
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar
                    backgroundColor={background_color}
                    barStyle={theme_name === 'dark' ? 'light-content' : 'dark-content'}/>
                <HomePage/>
            </NavigationContainer>
        </SafeAreaProvider>
    )
}


export default function App() {
    const [fonts_loaded, error] = useFonts({
        'Inter': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        'InterBold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
        'Akshar': require('./assets/fonts/Akshar/static/Akshar-Regular.ttf'),
        'Alatsi': require('./assets/fonts/Alatsi/Alatsi-Regular.ttf'),
    })

    if (!fonts_loaded) return null

    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <TamaguiProvider config={config}>
                    <ThemeWrapper>
                        {/*<DrawerNestedAppScreen/>*/}
                        <AppScreens/>
                    </ThemeWrapper>
                </TamaguiProvider>
            </PersistGate>
        </Provider>
    );
}

