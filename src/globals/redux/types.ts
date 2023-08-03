export enum Status {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
export interface ReduxResponse {
    type: string;
    status: Status;
    error?: string;
}