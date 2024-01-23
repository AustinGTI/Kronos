import React from "react";
import {
    Paragraph,
    ScrollView,
    TamaguiProvider,
    Theme,
    ThemeName,
    useTheme,
    useThemeName,
    View,
    XStack,
    YStack
} from "tamagui";
import config, {DARK_THEMES} from "./tamagui.config";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {useFonts} from "expo-font";
import HomePage from "./src/pages/home";
import {NavigationContainer} from "@react-navigation/native";
import {Provider, useSelector} from "react-redux";
import {persistor, store} from "./src/globals/redux";
import {PersistGate} from "redux-persist/integration/react";
import {AppState} from "./src/globals/redux/reducers"
import * as SplashScreen from 'expo-splash-screen'
import {Animated, StatusBar} from "react-native";
import useAppSettings from "./src/globals/redux/hooks/useAppSettings";
import {boolean} from "yup";


function ThemeWrapper({children}: { children: React.ReactNode }) {
    // get the theme from redux
    const {theme} = useAppSettings()

    return (
        <Theme name={theme}>
            {children}
        </Theme>
    )
}


function AppScreens() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <HomePage/>
            </NavigationContainer>
        </SafeAreaProvider>
    )
}


SplashScreen.preventAutoHideAsync().then()
export default function App() {

    const splash_image_uri = require('./assets/images/kronos_splash_screen_v2.png')

    const [fonts_loaded, error] = useFonts({
        'Inter': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        'InterBold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
        'Akshar': require('./assets/fonts/Akshar/static/Akshar-Regular.ttf'),
        'Alatsi': require('./assets/fonts/Alatsi/Alatsi-Regular.ttf'),
        'Rubik': require('./assets/fonts/Rubik/static/Rubik-Medium.ttf')
    })

    const animation = React.useMemo(() => {
        return new Animated.Value(1)
    }, []);

    const [image_loaded, setImageLoaded] = React.useState<boolean>(false)
    const [splash_animation_complete, setSplashAnimationComplete] = React.useState<boolean>(false)


    const onResourcesLoaded = React.useCallback(async () => {
        try {
            await SplashScreen.hideAsync()
            // wait 1 second before showing the app
            await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (e) {
            console.warn(e)
        } finally {
            Animated.timing(animation, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true
            }).start(() => {
                setSplashAnimationComplete(true)
            })
        }
    }, [animation, setSplashAnimationComplete]);

    const onImageLoaded = React.useCallback(() => {
        setImageLoaded(true)
    }, [setImageLoaded]);

    // when the image is loaded and fonts are loaded, run onImageLoaded
    React.useEffect(() => {
        if (image_loaded && fonts_loaded) {
            onResourcesLoaded().then()
        }
    }, [image_loaded, fonts_loaded, onResourcesLoaded]);


    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <TamaguiProvider config={config}>
                    <ThemeWrapper>
                        <AppScreens/>
                        {!splash_animation_complete && (
                            <React.Fragment>
                                <Animated.View
                                    pointerEvents={'none'}
                                    style={{
                                        flex: 1,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: '#fff',
                                        opacity: animation,
                                        width: '100%',
                                        height: '100%'
                                    }}>
                                    <Animated.Image
                                        onLoadEnd={onImageLoaded}
                                        // @ts-ignore
                                        source={splash_image_uri}
                                        style={{
                                            flex: 1,
                                            padding: '5%',
                                            height: '100%',
                                            width: '100%',
                                            resizeMode: 'contain'
                                        }}
                                    />
                                </Animated.View>
                            </React.Fragment>
                        )}
                    </ThemeWrapper>
                </TamaguiProvider>
            </PersistGate>
        </Provider>
    );
}

