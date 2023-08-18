import React from 'react'
import {Formik, FormikConfig, FormikContext, FormikErrors, useFormikContext} from "formik";
import {Activity, Duration, EMPTY_DURATION, Segment} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityFormValidation";
import {Heading, Input, Label, Paragraph, XStack, YStack} from "tamagui";
import DurationFormValidation from "./DurationFormValidation";
import InputContainer from "../../../../../globals/components/form/InputContainer";
import {FormProps} from "../../../../../globals/types/form";
import {generateFormikOnSubmit, getFirstError} from "../../../../../globals/helpers/form_functions";
import SegmentPicker from "../../../../../globals/components/form/pickers/SegmentPicker";
import SubmitButton from "../../../../../globals/components/form/SubmitButton";

function DurationFormFields() {
    const {errors, values, touched, handleChange, setValues, handleBlur} = useFormikContext<Duration>()
    const [segments_touched, setSegmentsTouched] = React.useState<boolean>(false)
    const segment_error = React.useMemo(() => {
        if (!errors['segments']) {
            return undefined
        } else if (Array.isArray(errors['segments'])) {
            if (typeof errors['segments'][0] === 'string') {
                return errors['segments'][0]
            } else {
                return getFirstError(errors['segments'][0])
            }
        } else {
            if (typeof errors['segments'] === 'string') {
                return errors['segments']
            } else {
                return getFirstError(errors['segments'])
            }
        }
    }, [errors['segments']])
    return (
        <YStack alignItems={'center'} paddingHorizontal={10}>
            <InputContainer field_key={'name'} label={'Name'} error={touched['name'] ? errors['name'] : undefined}>
                <Input value={values['name']} onChangeText={handleChange('name')} onBlur={handleBlur('name')}/>
            </InputContainer>
            <InputContainer field_key={'segments'} label={'Segments'}
                            error={segments_touched ? segment_error : undefined}>
                <SegmentPicker setSegments={(segments) => setValues({...values, segments})}
                               active_segments={values['segments']} setTouched={() => setSegmentsTouched(true)}/>
            </InputContainer>
        </YStack>
    )
}

export default function DurationForm({title, initial_values, onSubmit, submit_text}: FormProps<Duration>) {
    const [global_error, setGlobalError] = React.useState<string | undefined>(undefined)
    const formikOnSubmit = React.useCallback(generateFormikOnSubmit(onSubmit, setGlobalError), [onSubmit])
    return (
        <Formik initialValues={initial_values ?? EMPTY_DURATION} onSubmit={formikOnSubmit}
                validationSchema={DurationFormValidation} enableReinitialize>
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
                <DurationFormFields/>
                <SubmitButton<Duration> text={submit_text}/>
            </React.Fragment>
        </Formik>
    )
}
