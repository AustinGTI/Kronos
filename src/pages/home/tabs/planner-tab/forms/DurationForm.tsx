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
import SegmentsBarView from "../../../../../globals/components/duration/SegmentsBarView";
import FormError from "../../../../../globals/components/form/text/FormError";
import FormTitle from "../../../../../globals/components/form/text/FormTitle";
import KronosContainer from "../../../../../globals/components/wrappers/KronosContainer";

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
        <KronosContainer>
            <YStack alignItems={'center'}>
                <InputContainer field_key={'name'} label={'Name'} error={touched['name'] ? errors['name'] : undefined}>
                    <Input value={values['name']} onChangeText={handleChange('name')} onBlur={handleBlur('name')}/>
                </InputContainer>
                <InputContainer field_key={'segments'} label={'Segments'}
                                error={segments_touched ? segment_error : undefined}>
                    <SegmentPicker setSegments={(segments) => setValues({...values, segments})}
                                   active_segments={values['segments']} setTouched={() => setSegmentsTouched(true)}/>
                    <SegmentsBarView segments={values['segments']} marginTop={10}/>
                </InputContainer>
            </YStack>
        </KronosContainer>
    )
}

export default function DurationForm({title, initial_values, onSubmit, submit_text}: FormProps<Duration>) {
    const [global_error, setGlobalError] = React.useState<string | undefined>(undefined)
    const formikOnSubmit = React.useCallback(generateFormikOnSubmit(onSubmit, setGlobalError), [onSubmit])
    return (
        <Formik initialValues={initial_values ?? EMPTY_DURATION} onSubmit={formikOnSubmit}
                validationSchema={DurationFormValidation} enableReinitialize>
            <YStack w={'100%'} paddingHorizontal={10}>
                <XStack w={'100%'} alignItems={'center'} justifyContent={'space-between'} paddingVertical={10}>
                    <FormTitle title={title}/>
                    <SubmitButton<Duration> text={submit_text}/>
                </XStack>
                <FormError error={global_error}/>
                <DurationFormFields/>
            </YStack>
        </Formik>
    )
}
