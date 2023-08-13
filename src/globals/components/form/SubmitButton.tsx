import React from 'react'
import {useFormikContext} from "formik";
import {Activity} from "../../types/main";
import {Button, Paragraph, XStack} from "tamagui";

interface SubmitButtonProps {
    text?: string
}

export default function SubmitButton({text}: SubmitButtonProps) {
    const {handleSubmit} = useFormikContext<Activity>()
    return (
        <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
            <Button onPress={() => handleSubmit()}
                    width={'60%'}>
                <Paragraph textTransform={'uppercase'}>{text ?? 'Submit'}</Paragraph>
            </Button>
        </XStack>
    );
}
