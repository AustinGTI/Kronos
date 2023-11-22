import {AlertDialog, Button, XStack, YStack} from "tamagui";
import React from "react";

export interface AlertButtonProps {
    label: string
    onPress: (closeAlert: () => void) => void
}

export interface AlertModalProps {
    title: string
    description: string
    buttons: AlertButtonProps[]
    with_cancel_button?: boolean
}

interface KronosAlertProps extends AlertModalProps{
    closeModal: () => void
}

export default function KronosAlert({title, description, buttons, with_cancel_button,closeModal}: KronosAlertProps) {
    return (
        <YStack space>
            <AlertDialog.Title w={'100%'} textAlign={'center'} textTransform={'uppercase'}
                               textDecorationLine={'underline'} fontSize={20}>
                {title}
            </AlertDialog.Title>
            <AlertDialog.Description w={'100%'} textAlign={'center'}>
                {description}
            </AlertDialog.Description>

            <XStack space="$3" justifyContent={
                buttons.length + (with_cancel_button ? 1 : 0) > 1 ? 'space-between' : 'center'
            }>
                {with_cancel_button && <AlertDialog.Cancel asChild>
                    <Button>Close</Button>
                </AlertDialog.Cancel>}
                {buttons.map((button, index) => (
                    // <AlertDialog.Action key={index} asChild>
                    <Button key={index} onPress={() => {
                        button.onPress(closeModal)
                    }}>
                        {button.label}
                    </Button>
                    // </AlertDialog.Action>
                ))}
            </XStack>

        </YStack>
    );
}