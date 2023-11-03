import React from 'react'
import {Paragraph, XStack, YStack} from "tamagui";
import ThemeSetting from "./panes/ThemeSetting";
import ColorSetting from "./panes/ColorSetting";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../../globals/redux/reducers";
import {AppTheme, setBreakColor, setFocusColor, setTheme} from "../../../../globals/redux/reducers/settingsReducer";
import DataSetting from "./panes/DataSetting";
import SwatchColorPicker from "../../../../globals/components/form/pickers/SwatchColorPicker";
import {string} from "yup";
import selectSettingsPageState from "../../../../globals/redux/selectors/settingsPageSelector";
import Accordion from "../../../../globals/components/wrappers/Accordion";

interface PaneWrapperProps {
    label: string
    children: React.ReactNode
}

function PaneWrapper({label, children}: PaneWrapperProps) {
    return (
        <YStack w={'100%'} paddingHorizontal={20} paddingVertical={5}>
            <XStack w={'100%'} paddingVertical={10} borderBottomWidth={1} borderBottomColor={'#aaa'}>
                <Paragraph fontSize={15} fontWeight={'600'} color={'$color'}
                           textTransform={'uppercase'}>{label}</Paragraph>
            </XStack>
            {children}
        </YStack>
    )
}

export default function SettingsTab() {
    const {theme, focus_color, break_color} = useSelector(selectSettingsPageState)
    const dispatch = useDispatch()

    return (
        <YStack w={'100%'} h={'100%'} backgroundColor={'$background'}>
            <Accordion>
                <PaneWrapper label={'Theme'}>
                    <ThemeSetting active_theme={theme} setTheme={(theme: AppTheme) => dispatch(setTheme(theme))}/>
                </PaneWrapper>
                <PaneWrapper label={'Focus Color'}>
                    <SwatchColorPicker active_color={focus_color} accordion_id={'focus_color_picker'}
                                       setColor={(color: string) => dispatch(setFocusColor(color))}/>
                </PaneWrapper>
                <PaneWrapper label={'Break Color'}>
                    <SwatchColorPicker active_color={break_color} accordion_id={'break_color_picker'}
                                       setColor={(color: string) => dispatch(setBreakColor(color))}/>
                </PaneWrapper>
                <PaneWrapper label={'Data'}>
                    <DataSetting/>
                </PaneWrapper>
            </Accordion>
        </YStack>
    )
}
