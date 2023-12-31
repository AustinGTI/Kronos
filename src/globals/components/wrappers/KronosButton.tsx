import React from 'react'
import {Button, ButtonProps, Paragraph, ParagraphProps, StackProps, View, XStack} from "tamagui";
import type {IconProps} from '@tamagui/helpers-icon'
import {boolean} from "yup";
import {TouchableOpacity} from "react-native";


export interface KronosButtonProps extends StackProps {
    icon?: React.ComponentType<IconProps>
    icon_position?: 'left' | 'right'
    icon_props?: IconProps
    label?: string
    label_props?: ParagraphProps
    is_active?: boolean
}

export default function KronosButton({
                                         icon: Icon,
                                         label,
                                         label_props,
                                         icon_props,
                                         is_active,
                                         icon_position = 'left',
                                         onPress,
                                         width, w, height, h,
                                         disabled,
                                         ...props
                                     }: KronosButtonProps) {
    const [is_pressed, setIsPressed] = React.useState<boolean>(false)

    return (
        <TouchableOpacity
            // @ts-ignore
            style={{
                width: width || w,
                height: height || h,
            }}
            onPress={(e) => {
                if (onPress && !disabled) {
                    onPress(e)
                }
            }} disabled={disabled} onPressIn={() => setIsPressed(true)} onPressOut={() => setIsPressed(false)}>
            {/*<Button margin={0} padding={0} backgroundColor={'transparent'} {...props}>*/}
            <XStack alignItems={'center'} justifyContent={'center'} width={w || width} height={h || height} {...props}>
                {Icon && icon_position === 'left' &&
                    <Icon size={22} color={is_pressed ? '$active_color' : '$color'} {...icon_props}/>}
                {label && (
                    <Paragraph
                        lineHeight={16} fontSize={14} padding={0} margin={0}
                        marginLeft={Icon && icon_position === 'left' ? 5 : 0}
                        marginRight={Icon && icon_position === 'right' ? 5 : 0}
                        color={is_pressed || is_active ? '$active_color' : '$color'} {...label_props}>
                        {label}
                    </Paragraph>
                )}
                {Icon && icon_position === 'right' &&
                    <Icon size={22} color={is_pressed ? '$active_color' : '$color'} {...icon_props}/>}
            </XStack>
        </TouchableOpacity>
    );
}
