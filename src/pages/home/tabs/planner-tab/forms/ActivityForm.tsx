import React from 'react'
import {Formik, FormikHelpers, useFormikContext} from "formik";
import {Activity, EMPTY_ACTIVITY} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Button, Heading, Input, Paragraph, YStack} from "tamagui";
import InputContainer from "../../../../../globals/components/form/InputContainer";
import DurationPicker from "../../../../../globals/components/form/pickers/DurationPicker";
import {generateFormikOnSubmit} from "../../../../../globals/helpers/form_functions";
import {FormProps} from "../../../../../globals/types/form";

function ActivityFormFields() {
    const {
        touched, errors, values,
        handleChange, handleBlur,
        setValues, handleSubmit
    } = useFormikContext<Activity>()
    return (
        <YStack alignItems={'center'} paddingHorizontal={10}>
            <InputContainer field_key={'name'} label={'Name'} error={touched['name'] ? errors['name'] : undefined}>
                <Input onChangeText={handleChange('name')} value={values['name']} onBlur={handleBlur('name')}/>
            </InputContainer>
            <InputContainer field_key={'default_duration_id'} label={'Default Duration'}
                            error={touched['default_duration_id'] ? errors['default_duration_id'] : undefined}>
                <DurationPicker setDuration={(duration) => setValues({...values, default_duration_id: duration.id})}
                                active_duration_id={values['default_duration_id']}/>
            </InputContainer>
            <Button onPress={() => handleSubmit()}>Submit</Button>
        </YStack>
    )
}

export default function ActivityForm({title, initial_values, onSubmit}: FormProps<Activity>) {
    const [global_error, setGlobalError] = React.useState<string | undefined>(undefined)
    const formikOnSubmit = React.useCallback(generateFormikOnSubmit(onSubmit, setGlobalError), [onSubmit])
    return (
        <Formik initialValues={initial_values ?? EMPTY_ACTIVITY} onSubmit={formikOnSubmit}
                validationSchema={ActivityValidation}>
            <React.Fragment>
                {title && <Heading>{title}</Heading>}
                {global_error && <Paragraph>{global_error}</Paragraph>}
                <ActivityFormFields/>
            </React.Fragment>
        </Formik>
    )
}
