import {AppState} from "../reducers";
import {NewDuration} from "../reducers/durationsReducer";
import {SpecialField, ValidationStatus, ValidationResponse} from "../types";

export function createDurationValidation(app_state:AppState, new_duration:NewDuration):ValidationResponse {
    // check that the duration name is unique
    const duration_names = Array.from(app_state.durations.values()).map(duration => duration.name)
    if (duration_names.includes(new_duration.name)) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'name',
                message: 'A duration with this name already exists'
            }
        }
    }
    //todo: add segment validation
    return {
        status: ValidationStatus.SUCCESS
    }
}

export function updateDurationValidation(app_state:AppState, new_duration:NewDuration):ValidationResponse {
    // check that the duration name is unique
    const duration_names = Array.from(app_state.durations.values()).map(duration => duration.name)
    if (duration_names.includes(new_duration.name)) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'name',
                message: 'A duration with this name already exists'
            }
        }
    }
    return {
        status: ValidationStatus.SUCCESS
    }
}

export function deleteDurationValidation(app_state:AppState, duration_id:number):ValidationResponse {
    // check that the duration exists
    if (!app_state.durations.has(duration_id)) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This duration does not exist'
            }
        }
    }
    return {
        status: ValidationStatus.SUCCESS
    }
}
