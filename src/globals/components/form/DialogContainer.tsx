import React from 'react'
import {Button, ScrollView, ScrollViewProps, View, XStack, YStack, YStackProps} from "tamagui";
import {X} from "@tamagui/lucide-icons";

interface DialogContainerProps extends YStackProps {
    children: React.ReactNode
    onClose?: () => void
    with_close_button?: boolean
}

export default function DialogContainer({children, onClose, with_close_button, ...stack_props}: DialogContainerProps) {
    return (
        <YStack position={'relative'} borderColor={'$color'} borderRadius={7} borderWidth={1}
                    overflow={'hidden'}
                    backgroundColor={'$foreground'} {...stack_props}>
            {onClose && with_close_button && (
                <Button position={'absolute'}
                        borderRadius={0} borderBottomRightRadius={7}
                        top={0} left={0} backgroundColor={'#fff'} h={20} w={20} padding={0} margin={0}
                        onPress={onClose}>
                    <X size={15}/>
                </Button>
            )}
            <ScrollView>
                {children}
            </ScrollView>
        </YStack>
    );
}
