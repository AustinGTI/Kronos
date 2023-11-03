import React from 'react'
import {YStack} from "tamagui";
import SwatchColorPicker from "../../../../../globals/components/form/pickers/SwatchColorPicker";

interface ColorSettingProps {
    active_color: string
    setActiveColor: (color: string) => void
}

export default function ColorSetting({active_color, setActiveColor}: ColorSettingProps) {
    return (
        <YStack w={'100%'}>
            <SwatchColorPicker active_color={active_color} setColor={setActiveColor}/>
        </YStack>
    );
}
