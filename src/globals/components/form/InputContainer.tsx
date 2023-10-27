import React from 'react'
import {Label, Paragraph, YStack, YStackProps} from "tamagui";
import FormError from "./text/FormError";

interface InputContainerProps extends YStackProps {
    field_key: string
    label: string
    children: React.ReactNode
    error?: string
}

export default function InputContainer({children, error, field_key, label, ...stack_props}: InputContainerProps) {
    return (
        <YStack width={'90%'} paddingVertical={10} {...stack_props}>
            <Paragraph textTransform={'uppercase'}>{label}</Paragraph>
            {children}
            <FormError error={error}/>
        </YStack>
    );
}
