import {SpecialField, ValidationStatus, ValidationResponse} from "../types";
import {AppState} from "../reducers";
import {Activity} from "../../types/main";
import {compareStrings, isValidHexColor} from "../../helpers/string_functions";


function genericActivityValidation(app_state:AppState,activity: Activity): ValidationResponse {
    // check that the color is a valid hex color
    if (!isValidHexColor(activity.color)) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'color',
                message: 'This is not a valid hex color'
            }
        }
    }

    // check that the default increment id given is valid
    if (!app_state.durations[activity.default_duration_id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'default_duration_id',
                message: 'This increment does not exist'
            }
        }
    }

    return {
        status: ValidationStatus.SUCCESS
    }
}


export function createActivityValidation(app_state: AppState, new_activity: Activity): ValidationResponse {
    // check that the activity name is unique
    const has_duplicate = Object.values(app_state.activities).some(activity => compareStrings(activity.name, new_activity.name))
    if (has_duplicate) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'name',
                message: 'An activity with this name already exists'
            }
        }
    }
    // check that stats data is valid, both total time and total sessions should be 0 for a new activity
    if (new_activity.stats_data.total_time !== 0 || new_activity.stats_data.total_sessions !== 0) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'Stats data should be 0 for a new activity'
            }
        }
    }

    return genericActivityValidation(app_state, new_activity)
}

export function updateActivityValidation(app_state: AppState, updated_activity: Activity): ValidationResponse {
    // check that the activity exists
    if (!app_state.activities[updated_activity.id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This activity does not exist'
            }
        }
    }

    // check that the activity name is unique
    if (Object.values(app_state.activities).some(activity => {
        // for update, we need to ignore the activity with the same id
        if (activity.id === updated_activity.id) return false
        return compareStrings(activity.name, updated_activity.name)
    })) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'name',
                message: 'An activity with this name already exists'
            }
        }
    }

    return genericActivityValidation(app_state, updated_activity)
}

export function incrementActivityStatsValidation(app_state: AppState, activity_id: number): ValidationResponse {
    // check that the activity exists
    if (!app_state.activities[activity_id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This activity does not exist'
            }
        }
    }
    return {
        status: ValidationStatus.SUCCESS
    }
}

export function deleteActivityValidation(app_state: AppState, activity_id: number): ValidationResponse {
    // check that the activity exists
    if (!app_state.activities[activity_id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This activity does not exist'
            }
        }
    }
    return {
        status: ValidationStatus.SUCCESS
    }
}