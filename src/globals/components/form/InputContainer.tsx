import React from 'react'
import {Label, Paragraph, YStack} from "tamagui";

interface InputContainerProps {
    field_key: string
    label: string
    children: React.ReactNode
    error?: string
}

export default function InputContainer({children,error, field_key, label}: InputContainerProps) {
    return (
        <YStack>
            <Label textTransform={'uppercase'} htmlFor={field_key}>{label}</Label>
            {children}
            {error && <Paragraph color={'red'}>{error}</Paragraph>}
        </YStack>
    );
}
