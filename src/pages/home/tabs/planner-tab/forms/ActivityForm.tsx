import React from 'react'
import {Formik, FormikContext, useFormikContext} from "formik";
import {Activity, Duration, EMPTY_ACTIVITY} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Label, Paragraph, YStack} from "tamagui";
import InputContainer from "../../../../../globals/components/form/InputContainer";
import DurationPicker from "../../../../../globals/components/form/pickers/DurationPicker";

interface ActivityFormProps {
    title?: string
    activity?: Activity
}

function ActivityFormFields() {
    const {
        touched, errors, values,
        handleChange, handleBlur,
        setValues
    } = useFormikContext<Activity>()
    return (
        <YStack>
            <InputContainer field_key={'name'} label={'Name'} error={touched['name'] ? errors['name'] : undefined}>
                <Input id={'activity_name'} componentName={'name'} value={values['name']} onChange={handleChange}
                       onBlur={handleBlur}/>
            </InputContainer>
            <InputContainer field_key={'default_duration_id'} label={'Default Duration'} error={touched['default_duration_id'] ? errors['default_duration_id'] : undefined}>
                <DurationPicker setDuration={(duration) => setValues({...values, default_duration_id: duration.id})} active_duration_id={values['default_duration_id']}/>
            </InputContainer>
        </YStack>
    )
}

export default function ActivityForm({title, activity}: ActivityFormProps) {
    return (
        <Formik initialValues={activity ?? EMPTY_ACTIVITY} onSubmit={(values) => console.log(values)}
                validationSchema={ActivityValidation}>
            <React.Fragment>
                {title && <Heading>{title}</Heading>}
                <ActivityFormFields/>
            </React.Fragment>
        </Formik>
    )
}
