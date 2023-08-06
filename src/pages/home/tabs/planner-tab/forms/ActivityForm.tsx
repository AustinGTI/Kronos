import React from 'react'
import {Formik, FormikContext, useFormikContext} from "formik";
import {Activity} from "../../../../../globals/types/main";
import ActivityValidation from "./ActivityValidation";
import {Paragraph, YStack} from "tamagui";

interface ActivityFormProps {
    activity?: Activity
}

function ActivityFormFields() {
    const {} = useFormikContext()
    return (
        <YStack>
            <Paragraph>Fields</Paragraph>
        </YStack>
    )
}

export default function ActivityForm({activity}:ActivityFormProps) {
    return (
        <Formik initialValues={activity ?? {}} onSubmit={(values) => console.log(values)} validationSchema={ActivityValidation}>
            <ActivityFormFields/>
        </Formik>
    )
}
