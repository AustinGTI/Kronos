import {AlertDialog, Button, XStack, YStack} from "tamagui";
import React from "react";
import KronosButton from "./KronosButton";

export interface AlertButtonProps {
    label: string
    onPress: (closeAlert: () => void) => void
}

export interface AlertModalProps {
    title: string
    description: string
    buttons: AlertButtonProps[]
    timeout_in_ms?: number
    with_cancel_button?: boolean
}

interface KronosAlertProps extends AlertModalProps {
    closeModal: () => void
}

export default function KronosAlert({
                                        title,
                                        description,
                                        buttons,
                                        with_cancel_button,
                                        timeout_in_ms,
                                        closeModal
                                    }: KronosAlertProps) {
    React.useEffect(() => {
        // if the timeout_in_ms prop has been set, then close the modal after the timeout
        if (timeout_in_ms) {
            setTimeout(() => closeModal(), timeout_in_ms)
        }
    }, []);

    return (
        <YStack space>
            <AlertDialog.Title w={'100%'} textAlign={'center'} textTransform={'uppercase'}
                               textDecorationLine={'underline'} fontSize={20}>
                {title}
            </AlertDialog.Title>
            <AlertDialog.Description w={'100%'} textAlign={'center'}>
                {description}
            </AlertDialog.Description>

            <XStack paddingHorizontal={10} space="$3" justifyContent={
                buttons.length + (with_cancel_button ? 1 : 0) > 1 ? 'space-between' : 'center'
            }>
                {with_cancel_button && <AlertDialog.Cancel asChild>
                    <KronosButton padding={10} label={'Close'}/>
                </AlertDialog.Cancel>}
                {buttons.map((button, index) => (
                    // <AlertDialog.Action key={index} asChild>
                    <KronosButton
                        // borderWidth={1}
                        // borderRadius={5}
                        // borderColor={'$color'}
                        // todo: add button background color to themes
                        padding={10}
                        key={index} onPress={() => {
                        button.onPress(closeModal)
                    }} label={button.label}/>
                    // </AlertDialog.Action>
                ))}
            </XStack>

        </YStack>
    );
}
