import React from 'react'
import {Paragraph, XStack, YStack} from "tamagui";
import ThemeSetting from "./panes/ThemeSetting";
import ColorSetting from "./panes/ColorSetting";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../globals/redux/reducers";
import {AppTheme, setBreakColor, setFocusColor, setTheme} from "../../globals/redux/reducers/settingsReducer";
import DataSetting from "./panes/DataSetting";
import SwatchColorPicker from "../../globals/components/form/pickers/SwatchColorPicker";
import {string} from "yup";

interface PaneWrapperProps {
    label: string
    children: React.ReactNode
}

function PaneWrapper({label, children}: PaneWrapperProps) {
    return (
        <YStack w={'100%'} paddingHorizontal={20} paddingVertical={5}>
            <XStack w={'100%'} paddingVertical={10} borderBottomWidth={1} borderBottomColor={'#aaa'}>
                <Paragraph fontSize={15} fontWeight={'600'} color={'#555'}
                           textTransform={'uppercase'}>{label}</Paragraph>
            </XStack>
            {children}
        </YStack>
    )
}

export default function SettingsPage() {
    const {theme, focus_color, break_color} = useSelector((state: AppState) => state.settings)
    const dispatch = useDispatch()

    /**
     * this state makes it possible to enforce a rule that only one dialog can be open at a time, this conserves space in the page
     * and makes it look less cluttered
     */
    const [open_dialog, setOpenDialog] = React.useState<string | null>(null)

    return (
        <YStack w={'100%'} h={'100%'} backgroundColor={'$background'}>
            <PaneWrapper label={'Theme'}>
                <ThemeSetting active_theme={theme} setTheme={(theme: AppTheme) => dispatch(setTheme(theme))}/>
            </PaneWrapper>
            <PaneWrapper label={'Focus Color'}>
                <SwatchColorPicker active_color={focus_color}
                                   setColor={(color: string) => dispatch(setFocusColor(color))}
                                   picker_open={open_dialog === 'focus'}
                                   onPickerOpenOrClose={(open: boolean) => {
                                       if (open) {
                                           setOpenDialog('focus')
                                       }
                                   }}/>
            </PaneWrapper>
            <PaneWrapper label={'Break Color'}>
                <SwatchColorPicker active_color={break_color}
                                   picker_open={open_dialog === 'break'}
                                   onPickerOpenOrClose={(open: boolean) => {
                                       if (open) {
                                           setOpenDialog('break')
                                       }
                                   }}
                                   setColor={(color: string) => dispatch(setBreakColor(color))}/>
            </PaneWrapper>
            <PaneWrapper label={'Data'}>
                <DataSetting/>
            </PaneWrapper>
        </YStack>
    )
}
