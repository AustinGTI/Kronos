import React from 'react'
import {Button, ButtonProps, Paragraph, StackProps, View, XStack} from "tamagui";
import type {IconProps} from '@tamagui/helpers-icon'
import {boolean} from "yup";
import {TouchableOpacity} from "react-native";


interface KronosButtonProps extends StackProps {
    icon?: React.ComponentType<IconProps>
    label?: string
    is_active?: boolean
}

export default function KronosButton({icon: Icon, label, is_active, onPress, ...props}: KronosButtonProps) {
    const [is_pressed, setIsPressed] = React.useState<boolean>(false)

    return (
        <TouchableOpacity
            onPress={(e) => {
                if (onPress) {
                    onPress(e)
                }
            }} onPressIn={() => setIsPressed(true)} onPressOut={() => setIsPressed(false)}>
            {/*<Button margin={0} padding={0} backgroundColor={'transparent'} {...props}>*/}
            <XStack alignItems={'center'} justifyContent={'center'} {...props}>
                {Icon && <Icon size={22} color={is_pressed ? '$active_color' : '$color'}/>}
                {label && (
                    <Paragraph
                        lineHeight={16} fontSize={14} margin={0}
                        padding={0} marginLeft={Icon ? 5 : 0}
                        color={is_pressed || is_active ? '$active_color' : '$color'}>
                        {label}
                    </Paragraph>
                )}
            </XStack>
        </TouchableOpacity>
    );
}
