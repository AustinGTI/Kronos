import React from 'react'
import {StackProps, View} from "tamagui";

interface KronosContainerProps extends StackProps {
    children: React.ReactNode
}

export default function KronosContainer({children, width, height, w, h, ...stack_props}: KronosContainerProps) {
    return (
        <View padding={5} width={width} height={height} w={w} h={h}>
            <View borderRadius={10} backgroundColor={'$foreground'}
                  shadowOpacity={0.5}
                  shadowRadius={15}
                  alignItems={'center'}
                  justifyContent={'center'}
                  display={'flex'}
                  shadowColor={'$shadowColor'}
                // @ts-ignore
                  elevation={5}
                  padding={10} {...stack_props}>
                {children}
            </View>
        </View>
    );
}
