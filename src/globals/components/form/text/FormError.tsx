import React from 'react'
import {Paragraph, ParagraphProps, XStack, YStack} from "tamagui";

type ErrorTextProps =  ParagraphProps & {
    error?: string
}

export default function FormError({error,...paragraph_props}: ErrorTextProps) {
    if (!error) return null
    return (
        <XStack w={'100%'} paddingVertical={5} alignItems={'center'} justifyContent={'flex-start'}>
            <Paragraph color={'$error'} fontSize={11} {...paragraph_props}>{`*${error}`}</Paragraph>
        </XStack>
    );
}
