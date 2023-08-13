import {ValidationResponse, ValidationStatus} from "../redux/types";

export interface FormProps<Record extends Object> {
    title: string
    submit_text?: string
    initial_values: Record | null
    onSubmit: (values: Record) => ValidationResponse
}

export const DEFAULT_FORM_PARAMS: FormProps<any> = {
    title: '',
    submit_text: 'Submit',
    initial_values: null,
    onSubmit: () => ({status: ValidationStatus.SUCCESS})
}