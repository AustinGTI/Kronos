export enum ValidationStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

export enum SpecialField {
    GLOBAL = 'GLOBAL',
}

interface ValidationError {
    field: string | SpecialField;
    message: string;
}

export interface ValidationResponse {
    status: ValidationStatus;
    error?: ValidationError;
}