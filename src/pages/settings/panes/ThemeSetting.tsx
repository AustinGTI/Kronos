import React from 'react'
import {Paragraph, Square, XStack, YStack} from "tamagui";
import {AppState} from "../../../globals/redux/reducers";
import {useDispatch, useSelector} from "react-redux";
import {AppTheme, setTheme} from "../../../globals/redux/reducers/settingsReducer";
import DropdownSelectPicker from "../../../globals/components/form/pickers/DropdownSelectPicker";
import {Canvas, LinearGradient, RoundedRect, vec} from "@shopify/react-native-skia";
import {string} from "yup";

interface ThemeSquareProps {
    theme: AppTheme
    size?: number
    border_radius?: number
}

function ThemeSquare({theme, size, border_radius}: ThemeSquareProps) {
    // for dark and light it displays a dark/light colored square, for system, a gradient from dark to light
    size = size || 20
    border_radius = border_radius ?? 5

    const color: string | undefined = React.useMemo(() => {
        switch (theme) {
            case AppTheme.DARK:
                return '#222'
            case AppTheme.LIGHT:
                return '#fff'
        }
    }, [theme]);

    return (
        <Square width={size} height={size} backgroundColor={color} borderRadius={border_radius} borderColor={'$border'} borderWidth={1}/>
    )
}

function SelectedThemeRenderer({item}: { item: AppTheme }) {
    return (
        <XStack flexGrow={1} paddingVertical={5} alignItems={'center'}>
            <ThemeSquare theme={item}/>
            <Paragraph marginLeft={10} fontSize={15} color={'$color'} textTransform={'uppercase'}>{item}</Paragraph>
        </XStack>
    )
}

function ItemThemeRenderer({item}: { item: AppTheme }) {
    return (
        <XStack flexGrow={1} alignItems={'center'} paddingVertical={2}>
            <Paragraph marginLeft={10} fontSize={15} color={'$color'} textTransform={'uppercase'}>{item}</Paragraph>
        </XStack>
    )
}

interface ThemeSettingProps {
    active_theme: AppTheme
    setTheme: (theme: AppTheme) => void
}

export default function ThemeSetting({active_theme, setTheme}: ThemeSettingProps) {
    return (
        <YStack w={'100%'} paddingVertical={10}>
            <DropdownSelectPicker
                items={Object.keys(AppTheme).map((key) => AppTheme[key as keyof typeof AppTheme])}
                selected_item={active_theme}
                onSelectItem={setTheme}
                accordion_id={'theme_picker'}
                SelectedItemRenderer={SelectedThemeRenderer}
                DropdownItemRenderer={ItemThemeRenderer}
            />
        </YStack>
    );
}
