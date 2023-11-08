import React from 'react'
import {Button, ButtonProps, Paragraph} from "tamagui";
import type {IconProps} from '@tamagui/helpers-icon'


interface KronosButtonProps extends Omit<ButtonProps, "icon"> {
    icon?: React.ComponentType<IconProps>
    label?: string
    is_active?: boolean
}

export default function KronosButton({icon: Icon, label,is_active, ...props}: KronosButtonProps) {
    return (
        <Button margin={0} padding={0} backgroundColor={'transparent'} {...props}>
            {Icon && <Icon size={22} color={is_active ? '$active_color' : '$color'}/>}
            {label && (
                <Paragraph
                    lineHeight={16} fontSize={14} margin={0}
                    padding={0} marginLeft={Icon ? 5 : 0} color={is_active ? '$active_color' : '$color'}>
                    {label}
                </Paragraph>
            )}
        </Button>
    );
}
