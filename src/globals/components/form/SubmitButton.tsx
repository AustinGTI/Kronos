import React from 'react'
import {FormikValues, useFormikContext} from "formik";
import {Activity} from "../../types/main";
import {Button, Paragraph, XStack} from "tamagui";

interface SubmitButtonProps {
    text?: string
}

export default function SubmitButton<Record extends FormikValues>({text}: SubmitButtonProps) {
    const {handleSubmit} = useFormikContext<Record>()
    React.useEffect(() => {
        handleSubmit()
        console.log('submitting')
    }, [])
    return (
        <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
            <Button onPress={() => handleSubmit()}
                    width={'60%'}>
                <Paragraph textTransform={'uppercase'}>{text ?? 'Submit'}</Paragraph>
            </Button>
        </XStack>
    );
}
