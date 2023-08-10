import {AppState} from "../reducers";
import {SpecialField, ValidationStatus, ValidationResponse} from "../types";
import {Duration, SEGMENT_TYPES} from "../../types/main";

function genericDurationValidation(app_state: AppState, duration: Duration): ValidationResponse {
    // check that the segments follow a set of rules
    // ? 1. there must be at least one segment
    if (duration.segments.length === 0) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'There must be at least one segment'
            }
        }
    }
    // ? 2. the first and last segments must be focus segments
    if (duration.segments[0].type !== SEGMENT_TYPES.FOCUS || duration.segments[duration.segments.length - 1].type !== SEGMENT_TYPES.FOCUS) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'The first and last segments must be focus segments'
            }
        }
    }

    // ? 3. there cannot be 2 adjacent segments of the same type
    for (let i = 0; i < duration.segments.length - 1; i++) {
        if (duration.segments[i].type === duration.segments[i + 1].type) {
            return {
                status: ValidationStatus.ERROR,
                error: {
                    field: SpecialField.GLOBAL,
                    message: 'There cannot be 2 adjacent segments of the same type'
                }
            }
        }
    }

    return {
        status: ValidationStatus.SUCCESS
    }
}

export function createDurationValidation(app_state: AppState, new_duration: Duration): ValidationResponse {
    // check that the duration name is unique
    const has_duplicate = Object.values(app_state.durations).some(duration => compareStrings(duration.name, new_duration.name))
    if (has_duplicate) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'name',
                message: 'A duration with this name already exists'
            }
        }
    }
    return genericDurationValidation(app_state, new_duration)
}

export function updateDurationValidation(app_state: AppState, duration: Duration): ValidationResponse {
    // check that the duration exists
    if (!app_state.durations[duration.id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This duration does not exist'
            }
        }
    }

    // check that the duration name is unique, excluding the current duration
    const has_duplicate = Object.values(app_state.durations).some(other_duration => compareStrings(other_duration.name, duration.name) && other_duration.id !== duration.id)
    if (has_duplicate) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: 'name',
                message: 'A duration with this name already exists'
            }
        }
    }

    return genericDurationValidation(app_state, duration)
}

export function deleteDurationValidation(app_state: AppState, duration_id: number): ValidationResponse {
    // check that the duration exists
    if (!app_state.durations[duration_id]) {
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
