import {SpecialField, ValidationResponse, ValidationStatus} from "../redux/types";
import {FormikErrors, FormikHelpers, FormikValues} from "formik";

export function generateFormikOnSubmit<Record extends FormikValues>(onSubmit: (values: Record) => ValidationResponse, setGlobalError: (message: string) => void) {
    return function (values: Record, formik_helpers: FormikHelpers<Record>) {
        console.log('values', values)
        const validation_response: ValidationResponse = onSubmit(values)
        // set the formik errors based on the validation response
        if (validation_response.status === ValidationStatus.ERROR) {
            if (validation_response.error) {
                // if the error is a global error, set the global error instead
                if (validation_response.error.field === SpecialField.GLOBAL) {
                    setGlobalError(validation_response.error.message)
                } else {
                    const field = validation_response.error.field as keyof Record
                    formik_helpers.setErrors({
                        [field]: validation_response.error.message
                    } as FormikErrors<Record>)
                }
            }
        } else {
            // reset the form
            formik_helpers.resetForm()
        }
    }
}


export function getFirstError<Values>(errors: FormikErrors<any>): string | undefined {
    for (const key in errors) {
        if (errors[key]) {
            if (Array.isArray(errors[key])) {
                for (const nestedError of errors[key] as any) {
                    const firstNestedError = getFirstError(nestedError);
                    if (firstNestedError) {
                        return firstNestedError;
                    }
                }
            } else if (typeof errors[key] === 'object') {
                const firstNestedError = getFirstError(errors[key] as FormikErrors<any>);
                if (firstNestedError) {
                    return firstNestedError;
                }
            } else {
                return errors[key] as string
            }
        }
    }
    return undefined;
}