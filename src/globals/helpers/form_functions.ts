import {SpecialField, ValidationResponse, ValidationStatus} from "../redux/types";
import {FormikHelpers} from "formik";
import {Activity} from "../types/main";

export function generateFormikOnSubmit<Record extends Object>(onSubmit: (values: Record) => ValidationResponse, setGlobalError: (message: string) => void) {
    return function (values: Record, formik_helpers: FormikHelpers<Activity>) {
        const validation_response: ValidationResponse = onSubmit(values)
        // set the formik errors based on the validation response
        if (validation_response.status === ValidationStatus.ERROR) {
            if (validation_response.error) {
                // if the error is a global error, set the global error instead
                if (validation_response.error.field === SpecialField.GLOBAL) {
                    setGlobalError(validation_response.error.message)
                } else {
                    formik_helpers.setErrors({
                        [validation_response.error.field]: validation_response.error.message
                    })
                }
            }
        } else {
            // reset the form
            formik_helpers.resetForm()
        }
    }
}