import {NewActivity} from "../reducers/activitiesReducer";
import {ValidationResponse, Status} from "../types";
import {AppState} from "../reducers";

export function createActivityValidation(app_state: AppState, new_activity: NewActivity): ValidationResponse {
    // check that the activity name is unique
    const activity_names = Array.from(app_state.activities.values()).map(activity => activity.name)
    if (activity_names.includes(new_activity.name)) {
        return {
            type: 'create_activity',
            status: Status.ERROR,
            error: 'An activity with this name already exists'
        }
    }
    // check that the default duration id given is valid
    // todo: implement this once durations are implemented
    return {
        type: 'create_activity',
        status: Status.SUCCESS
    }
}

export function updateActivityValidation(app_state: AppState, new_activity: NewActivity): ValidationResponse {
    // check that the activity name is unique
    const activity_names = Array.from(app_state.activities.values()).map(activity => activity.name)
    if (activity_names.includes(new_activity.name)) {
        return {
            type: 'update_activity',
            status: Status.ERROR,
            error: 'An activity with this name already exists'
        }
    }
    return {
        type: 'update_activity',
        status: Status.SUCCESS
    }
}

export function deleteActivityValidation(app_state: AppState, activity_id: number): ValidationResponse {
    // check that the activity exists
    if (!app_state.activities.has(activity_id)) {
        return {
            type: 'delete_activity',
            status: Status.ERROR,
            error: 'This activity does not exist'
        }
    }
    return {
        type: 'delete_activity',
        status: Status.SUCCESS
    }
}