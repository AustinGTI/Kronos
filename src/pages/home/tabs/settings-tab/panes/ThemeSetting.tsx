import React from 'react'
import {Paragraph, Separator, useTheme, View, XStack, YStack} from "tamagui";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import config, {KronosTheme} from "../../../../../../tamagui.config";
import useAppSettings from "../../../../../globals/redux/hooks/useAppSettings";
import {CheckSquare, Lock, Square} from "@tamagui/lucide-icons";
import KronosButton from "../../../../../globals/components/wrappers/KronosButton";
import {Canvas, Group, LinearGradient, Path, RoundedRect, Skia, vec} from "@shopify/react-native-skia";
import {widthPercentageToDP} from "react-native-responsive-screen";
import {KronosPageContext, ModalType} from "../../../../../globals/components/wrappers/KronosPage";
import KronosAlert from "../../../../../globals/components/wrappers/KronosAlert";
import {setTheme} from "../../../../../globals/redux/reducers/settingsReducer";
import {useDispatch} from "react-redux";
import {boolean} from "yup";

interface KronosThemePaneProps {
    theme: KronosTheme,
    only_premium: boolean,
    label: string,
}

const THEME_ICON_PROPS = {
    width: widthPercentageToDP('10%'),
    height: 25,
    start_y: 10,
    end_y: 15,
    radius: 3,
    inner_padding: 2,
}

function KronosThemePane({theme, only_premium, label}: KronosThemePaneProps) {
    const {is_premium, theme: active_theme} = useAppSettings()
    const dispatch = useDispatch()
    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

    // region MEMOS
    // ? ........................

    const is_active_theme: boolean = React.useMemo(() => {
        return active_theme === theme
    }, [active_theme, theme]);

    const icon_colors: string[] = React.useMemo(() => {
        const theme_colors = config.themes[theme]
        return [theme_colors.background.val, theme_colors.active_color.val, theme_colors.color.val]
    }, [theme]);

    const i = React.useMemo(() => {
        return {
            x: THEME_ICON_PROPS.inner_padding,
            y: THEME_ICON_PROPS.inner_padding,
            width: THEME_ICON_PROPS.width - THEME_ICON_PROPS.inner_padding * 2,
            height: THEME_ICON_PROPS.height - THEME_ICON_PROPS.inner_padding * 2,
            r: THEME_ICON_PROPS.radius,
        }
    }, []);

    const [gradient_start, gradient_end] = React.useMemo(() => {
        return [vec(i.x, THEME_ICON_PROPS.start_y), vec(i.x + i.width, THEME_ICON_PROPS.end_y)]
    }, [i.x, i.width]);

    const [gradient_positions, gradient_colors] = React.useMemo(() => {
        // since we do not want gradients but instead blocks of colors, we will need to repeat the central positions
        const positions: number[] = []
        const colors: string[] = []

        let current_position = 0
        for (let i = 0; i < icon_colors.length; i++) {
            const color = icon_colors[i]
            positions.push(current_position / icon_colors.length)
            colors.push(color)
            current_position += 1
            positions.push(current_position / icon_colors.length)
            colors.push(color)
        }

        console.log('colors', colors, 'positions', positions)

        return [positions, colors]
    }, [icon_colors]);

    const border_path = React.useMemo(() => {
        const path = Skia.Path.Make()
        path.addRRect({
            rect: {x: i.x, y: i.y, width: i.width, height: i.height},
            rx: i.r,
            ry: i.r,
        })
        return path
    }, [i.x, i.y, i.width, i.height, i.r]);

    const {
        border: {val: borderColor},
    } = useTheme()

    // ? ........................
    // endregion ........................

    const onPressTheme = React.useCallback(() => {
        // if this is the active theme do nothing
        if (is_active_theme) return
        // if the user is not premium and this theme is only for premium users, display an error modal
        if (!is_premium && only_premium) {
            openModal({
                type: ModalType.ALERT,
                component: KronosAlert,
                component_props: {
                    title: 'Premium Theme',
                    description: 'This is a premium only theme. Upgrade to Kronos Premium at a one-time cost to use this theme.',
                    buttons: [],
                    with_cancel_button: true,
                }
            })
            return
        } else {
            dispatch(setTheme(theme))
            openModal({
                type: ModalType.ALERT,
                component: KronosAlert,
                component_props: {
                    title: 'Success',
                    description: 'Theme changed successfully',
                    buttons: [],
                    with_cancel_button: true,
                }
            })
        }
    }, [theme, is_premium, only_premium, openModal, dispatch, is_active_theme]);


    return (
        <XStack w={'100%'} paddingVertical={15} paddingHorizontal={5} justifyContent={'space-between'}>
            <XStack w={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                <View
                    w={THEME_ICON_PROPS.width} h={THEME_ICON_PROPS.height}
                    marginRight={5}>
                    <Canvas style={{width: '100%', height: '100%'}}>
                        <Group>
                            <RoundedRect
                                r={i.r} x={i.x} y={i.y}
                                width={i.width} height={i.height}>
                                <LinearGradient start={gradient_start} end={gradient_end} colors={gradient_colors}
                                                positions={gradient_positions}/>
                            </RoundedRect>
                            <Path path={border_path} style="stroke" color={borderColor} strokeWidth={1}/>
                        </Group>
                    </Canvas>
                </View>
                <KronosButton
                    width={'92%'}
                    label_props={{fontSize: 16}}
                    style={{
                        opacity: !is_premium && only_premium ? 0.5 : 1,
                    }}
                    onPress={onPressTheme}
                    justifyContent={'space-between'} label={label.toUpperCase()} icon={
                    (!is_premium && only_premium) ? Lock : is_active_theme ? CheckSquare : Square
                }
                    icon_position={'right'}/>
            </XStack>
        </XStack>
    );
}

export default function ThemeSetting() {
    return (
        <KronosContainer w={'100%'} my={10} pb={0}>
            <YStack w={'100%'} paddingVertical={10}>
                <Paragraph fontSize={20}>
                    THEME
                </Paragraph>
                <Separator marginVertical={15}/>
                <KronosThemePane theme={KronosTheme.POMODORO_PURPLE} only_premium={false} label={'Pomodoro Purple'}/>
                <KronosThemePane theme={KronosTheme.CHRONOGRAPH_CHERRY} only_premium={true}
                                 label={'Chronograph Cherry'}/>
                <KronosThemePane theme={KronosTheme.HOURGLASS_HAZEL} only_premium={true} label={'Hourglass Hazel'}/>
                <KronosThemePane theme={KronosTheme.TEMPORAL_TEAL} only_premium={true} label={'Temporal Teal'}/>
                <KronosThemePane theme={KronosTheme.OCLOCK_ONYX} only_premium={true} label={'Oclock Onyx'}/>
            </YStack>
        </KronosContainer>
    );
}
