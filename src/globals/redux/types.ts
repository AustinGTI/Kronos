export enum Status {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
export interface ValidationResponse {
    type: string;
    status: Status;
    error?: string;
}