import React from 'react'
import {Formik, FormikHelpers, useFormikContext} from "formik";
import {Activity, EMPTY_ACTIVITY} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Paragraph, XStack, YStack} from "tamagui";
import InputContainer from "../../../../../globals/components/form/containers/InputContainer";
import DurationPicker from "../../../../../globals/components/form/pickers/DurationPicker";
import {generateFormikOnSubmit} from "../../../../../globals/helpers/form_functions";
import {FormProps} from "../../../../../globals/types/form";
import SwatchColorPicker from "../../../../../globals/components/form/pickers/SwatchColorPicker";
import SubmitButton from "../../../../../globals/components/form/buttons/SubmitButton";
import Accordion from "../../../../../globals/components/wrappers/Accordion";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";
import FormTitle from "../../../../../globals/components/form/text/FormTitle";
import {KeyboardAvoidingView} from "react-native";

function ActivityFormFields() {
    const {
        touched, errors, values,
        handleChange, handleBlur,
        setValues
    } = useFormikContext<Activity>()

    return (
        <KronosContainer alignItems={'center'} paddingHorizontal={10}>
            <Accordion>
                <InputContainer field_key={'name'} label={'Name'} error={touched['name'] ? errors['name'] : undefined}>
                    <Input onChangeText={handleChange('name')} value={values['name']} onBlur={handleBlur('name')}/>
                </InputContainer>
                <InputContainer field_key={'default_duration_id'} label={'Default Duration'}
                                error={touched['default_duration_id'] ? errors['default_duration_id'] : undefined}>
                    <DurationPicker setDuration={(duration) => setValues({...values, default_duration_id: duration.id})}
                                    accordion_id={'duration_picker'}
                                    active_duration_id={values['default_duration_id'] ?? undefined}/>
                </InputContainer>
                <InputContainer field_key={'color'} label={'Color'}
                                error={touched['color'] ? errors['color'] : undefined}>
                    <SwatchColorPicker active_color={values['color']} accordion_id={'color_picker'}
                                       setColor={(color) => setValues({...values, color})} close_on_select={false}/>
                </InputContainer>
            </Accordion>
        </KronosContainer>
    )
}

export default function ActivityForm({title, initial_values, onSubmit, submit_text, form_header}: FormProps<Activity>) {
    const [global_error, setGlobalError] = React.useState<string | undefined>(undefined)
    const formikOnSubmit = React.useCallback(generateFormikOnSubmit(onSubmit, setGlobalError), [onSubmit])


    return (
        <Formik initialValues={initial_values ?? EMPTY_ACTIVITY} onSubmit={formikOnSubmit}
                validationSchema={ActivityValidation} enableReinitialize>
            <YStack w={'100%'} paddingHorizontal={10}>
                <XStack w={'100%'} alignItems={'center'} justifyContent={'space-between'} paddingVertical={10}>
                    <FormTitle title={title}/>
                    <XStack>
                        <SubmitButton<Activity> text={submit_text}/>
                        {form_header}
                    </XStack>
                </XStack>
                {global_error && <Paragraph>{global_error}</Paragraph>}
                <KeyboardAvoidingView behavior={'padding'}>
                    <ActivityFormFields/>
                </KeyboardAvoidingView>
            </YStack>
        </Formik>
    )
}
