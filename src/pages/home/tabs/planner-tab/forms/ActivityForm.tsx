import React from 'react'
import {Formik, FormikHelpers, useFormikContext} from "formik";
import {Activity, EMPTY_ACTIVITY} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Paragraph, XStack, YStack} from "tamagui";
import InputContainer from "../../../../../globals/components/form/InputContainer";
import DurationPicker from "../../../../../globals/components/form/pickers/DurationPicker";
import {generateFormikOnSubmit} from "../../../../../globals/helpers/form_functions";
import {FormProps} from "../../../../../globals/types/form";
import SwatchColorPicker from "../../../../../globals/components/form/pickers/SwatchColorPicker";
import SubmitButton from "../../../../../globals/components/form/SubmitButton";

function ActivityFormFields() {
    const {
        touched, errors, values,
        handleChange, handleBlur,
        setValues
    } = useFormikContext<Activity>()

    return (
        <YStack alignItems={'center'} paddingHorizontal={10}>
            <InputContainer field_key={'name'} label={'Name'} error={touched['name'] ? errors['name'] : undefined}>
                <Input onChangeText={handleChange('name')} value={values['name']} onBlur={handleBlur('name')}/>
            </InputContainer>
            <InputContainer field_key={'default_duration_id'} label={'Default Duration'}
                            error={touched['default_duration_id'] ? errors['default_duration_id'] : undefined}>
                <DurationPicker setDuration={(duration) => setValues({...values, default_duration_id: duration.id})}
                                active_duration_id={values['default_duration_id'] ?? undefined}/>
            </InputContainer>
            <InputContainer field_key={'color'} label={'Color'} error={touched['color'] ? errors['color'] : undefined}>
                <SwatchColorPicker active_color={values['color']} setColor={(color) => setValues({...values, color})}/>
            </InputContainer>
        </YStack>
    )
}

export default function ActivityForm({title, initial_values, onSubmit, submit_text}: FormProps<Activity>) {
    const [global_error, setGlobalError] = React.useState<string | undefined>(undefined)
    const formikOnSubmit = React.useCallback(generateFormikOnSubmit(onSubmit, setGlobalError), [onSubmit])


    return (
        <Formik initialValues={initial_values ?? EMPTY_ACTIVITY} onSubmit={formikOnSubmit}
                validationSchema={ActivityValidation} enableReinitialize>
            <React.Fragment>
                <XStack w={'100%'} alignItems={'center'} justifyContent={'center'} paddingVertical={10}>
                    <Heading
                        fontSize={20}
                        textTransform={'uppercase'}
                        textDecorationLine={'underline'}>
                        {title}
                    </Heading>
                </XStack>
                {global_error && <Paragraph>{global_error}</Paragraph>}
                <ActivityFormFields/>
                <SubmitButton<Activity> text={submit_text}/>
            </React.Fragment>
        </Formik>
    )
}
