import React from 'react'
import {FormikValues, useFormikContext} from "formik";
import {Activity} from "../../../types/main";
import {Button, Paragraph, XStack} from "tamagui";
import KronosContainer from "../../wrappers/KronosContainer";
import {Save} from "@tamagui/lucide-icons";
import KronosButton from "../../wrappers/KronosButton";

interface SubmitButtonProps {
    text?: string
}

export default function SubmitButton<Record extends FormikValues>({text}: SubmitButtonProps) {
    const {handleSubmit} = useFormikContext<Record>()

    return (
        <KronosContainer onPress={() => handleSubmit()}>
            <KronosButton label={(text ?? 'Submit').toUpperCase()} icon={Save} icon_position={'right'}/>
            {/*<XStack alignItems={'center'} justifyContent={'space-around'}>*/}
            {/*    <Paragraph textTransform={'uppercase'}>{text ?? 'Submit'}</Paragraph>*/}
            {/*    <Save size={20}/>*/}
            {/*</XStack>*/}
        </KronosContainer>
    );
}
