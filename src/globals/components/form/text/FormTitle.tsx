import React from 'react'
import KronosContainer from "../../wrappers/KronosContainer";
import {Paragraph} from "tamagui";

interface FormTitleProps {
    title: string
}

export default function FormTitle({title}: FormTitleProps) {
    return (
        <KronosContainer alignItems={'center'}>
            <Paragraph textTransform={'uppercase'}>{title}</Paragraph>
        </KronosContainer>
    );
}
