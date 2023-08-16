import React from 'react'
import {Formik, FormikConfig, FormikContext, useFormikContext} from "formik";
import {Activity, Duration, EMPTY_DURATION} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Label, Paragraph, YStack} from "tamagui";
import DurationFormValidation from "./DurationFormValidation";
import InputContainer from "../../../../../globals/components/form/InputContainer";
import {FormProps} from "../../../../../globals/types/form";
import {generateFormikOnSubmit} from "../../../../../globals/helpers/form_functions";
import SegmentPicker from "../../../../../globals/components/form/pickers/SegmentPicker";

function DurationFormFields() {
    const {errors, values, handleChange, setValues, handleBlur} = useFormikContext<Duration>()
    return (
        <YStack alignItems={'center'} paddingHorizontal={10}>
            <InputContainer field_key={'name'} label={'Name'} error={errors['name']}>
                <Input id={'duration_name'} componentName={'name'} value={values['name']} onChange={handleChange}
                       onBlur={handleBlur}/>
            </InputContainer>
            <InputContainer field_key={'segments'} label={'Segments'} error={undefined}>
                <SegmentPicker setSegments={(segments) => setValues({...values, segments})}
                               active_segments={values['segments']}/>
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
