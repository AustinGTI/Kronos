import React from 'react'
import {Paragraph, XStack, YStack} from "tamagui";

interface ErrorTextProps {
    error?: string
}

export default function FormError({error}: ErrorTextProps) {
    if (!error) return null
    return (
        <YStack w={'100%'} paddingVertical={5} alignItems={'center'} justifyContent={'center'}>
            <Paragraph color={'$error'} fontSize={12} textAlign={'center'}>{`*${error}`}</Paragraph>
        </YStack>
    );
}
