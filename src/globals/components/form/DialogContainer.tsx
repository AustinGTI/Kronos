import React from 'react'
import {Button, XStack, YStack, YStackProps} from "tamagui";
import {X} from "@tamagui/lucide-icons";

interface DialogContainerProps extends YStackProps {
    children: React.ReactNode
    onClose?: () => void
}

export default function DialogContainer({children, onClose, ...stack_props}: DialogContainerProps) {
    return (
        <YStack position={'relative'} borderColor={'#bbb'} borderRadius={7} borderWidth={1} padding={10} paddingTop={20}
                overflow={'hidden'}
                backgroundColor={'#eee'} {...stack_props}>
            {onClose && (
                <Button position={'absolute'}
                        borderRadius={0} borderBottomRightRadius={7}
                        top={0} left={0} backgroundColor={'#fff'} h={20} w={20} padding={0} margin={0} onPress={onClose}>
                    <X size={15}/>
                </Button>
            )}
            {children}
        </YStack>
    );
}