import {AppState} from "../reducers";
import {NewSession} from "../reducers/sessionsReducer";
import {SpecialField, ValidationResponse, ValidationStatus} from "../types";
import {extractSessionDateKey} from "../../helpers/session_functions";

export function startSessionValidation(app_state: AppState, new_session: NewSession): ValidationResponse {
    // check that the activity exists if given
    if (new_session.activity_id && !app_state.activities[new_session.activity_id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This activity does not exist'
            }
        }
    }
    // check that the duration exists if given
    if (new_session.duration_id && !app_state.durations[new_session.duration_id]) {
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

export function updateSessionValidation(app_state: AppState, session_id: number): ValidationResponse {
    // check that the day exists
    const date_key = extractSessionDateKey(session_id)
    if (!app_state.sessions[date_key]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This day does not exist in the calendar'
            }
        }
    }
    // check that the session exists
    if (!app_state.sessions[date_key]?.sessions[session_id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This session does not exist in the calendar'
            }
        }
    }
    return {
        status: ValidationStatus.SUCCESS
    }
}

export function deleteSessionValidation(app_state: AppState, session_id: number): ValidationResponse {
    // for now this is the same as updateSessionValidation
    return updateSessionValidation(app_state, session_id)
}
