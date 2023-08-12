import React from 'react'
import {Formik, FormikConfig, FormikContext, useFormikContext} from "formik";
import {Activity, Duration, EMPTY_DURATION} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Label, Paragraph, YStack} from "tamagui";
import DurationFormValidation from "./DurationFormValidation";
import InputContainer from "../../../../../globals/components/form/InputContainer";
import {FormProps} from "../../../../../globals/types/form";
import {generateFormikOnSubmit} from "../../../../../globals/helpers/form_functions";

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

export default function DurationForm({title, initial_values, onSubmit}: FormProps<Duration>) {
    const [global_error, setGlobalError] = React.useState<string | undefined>(undefined)
    const formikOnSubmit = React.useCallback(generateFormikOnSubmit(onSubmit, setGlobalError), [onSubmit])
    return (
        <Formik initialValues={initial_values ?? EMPTY_DURATION} onSubmit={(values) => console.log(values)}
                validationSchema={DurationFormValidation}>
            <React.Fragment>
                {title && <Heading>{title}</Heading>}
                <DurationFormFields/>
            </React.Fragment>
        </Formik>
    )
}
