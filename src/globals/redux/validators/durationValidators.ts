import {AppState} from "../reducers";
import {NewDuration} from "../reducers/durationsReducer";
import {ValidationResponse, Status} from "../types";

export function createDurationValidation(app_state:AppState, new_duration:NewDuration):ValidationResponse {
    // check that the duration name is unique
    const duration_names = Array.from(app_state.durations.values()).map(duration => duration.name)
    if (duration_names.includes(new_duration.name)) {
        return {
            type: 'create_duration',
            status: Status.ERROR,
            error: 'A duration with this name already exists'
        }
    }
    //todo: add segment validation
    return {
        type: 'create_duration',
        status: Status.SUCCESS
    }
}

export function updateDurationValidation(app_state:AppState, new_duration:NewDuration):ValidationResponse {
    // check that the duration name is unique
    const duration_names = Array.from(app_state.durations.values()).map(duration => duration.name)
    if (duration_names.includes(new_duration.name)) {
        return {
            type: 'update_duration',
            status: Status.ERROR,
            error: 'A duration with this name already exists'
        }
    }
    return {
        type: 'update_duration',
        status: Status.SUCCESS
    }
}

export function deleteDurationValidation(app_state:AppState, duration_id:number):ValidationResponse {
    // check that the duration exists
    if (!app_state.durations.has(duration_id)) {
        return {
            type: 'delete_duration',
            status: Status.ERROR,
            error: 'This duration does not exist'
        }
    }
    return {
        type: 'delete_duration',
        status: Status.SUCCESS
    }
}
