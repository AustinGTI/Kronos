import React from 'react'
import {Paragraph, Separator, Square, XStack, YStack} from "tamagui";
import {setTheme} from "../../../../../globals/redux/reducers/settingsReducer";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import {KronosTheme} from "../../../../../../tamagui.config";
import useAppSettings from "../../../../../globals/redux/hooks/useAppSettings";

interface KronosThemePaneProps {
    theme: KronosTheme,
    only_premium: boolean,
    label: string,
}

function KronosThemePane({theme, only_premium, label}: KronosThemePaneProps) {
    const {is_premium, theme: active_theme} = useAppSettings()
    const dispatch = useAppSettings()

    const is_active_theme: boolean = active_theme === theme

    return (
        <XStack w={'100%'} paddingVertical={10}>
            <Paragraph textTransform={'uppercase'}>
                {label}
            </Paragraph>
        </XStack>
    );
}

export default function ThemeSetting() {
    return (
        <KronosContainer w={'100%'} my={10} pb={0}>
            <YStack w={'100%'} paddingVertical={10}>
                <Paragraph fontSize={20}>
                    THEMES
                </Paragraph>
                <Separator marginVertical={15}/>

            </YStack>
        </KronosContainer>
    );
}
