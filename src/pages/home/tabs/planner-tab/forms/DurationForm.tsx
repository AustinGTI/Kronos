import React from 'react'
import {Formik, FormikConfig, FormikContext, useFormikContext} from "formik";
import {Activity, Duration, EMPTY_DURATION} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Label, Paragraph, YStack} from "tamagui";
import DurationFormValidation from "./DurationFormValidation";
import InputContainer from "../../../../../globals/components/form/InputContainer";

interface DurationFormProps {
    title?: string
    // handleFormSubmit: (values: Duration) => void
    duration?: Duration
}

function DurationFormFields() {
    const {errors, values, handleChange, handleBlur} = useFormikContext<Duration>()
    return (
        <YStack>
            <InputContainer field_key={'name'} label={'Name'} error={errors['name']}>
                <Input id={'duration_name'} componentName={'name'} value={values['name']} onChange={handleChange}
                       onBlur={handleBlur}/>
            </InputContainer>
        </YStack>
    )
}

export default function DurationForm({title, duration}: DurationFormProps) {
    return (
        <Formik initialValues={duration ?? EMPTY_DURATION} onSubmit={(values) => console.log(values)}
                validationSchema={DurationFormValidation}>
            <React.Fragment>
                {title && <Heading>{title}</Heading>}
                <DurationFormFields/>
            </React.Fragment>
        </Formik>
    )
}
