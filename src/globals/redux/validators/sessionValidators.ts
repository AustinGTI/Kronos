import {AppState} from "../reducers";
import {SpecialField, ValidationResponse, ValidationStatus} from "../types";
import {extractSessionDateKey} from "../../helpers/session_functions";
import {Session} from "../../types/main";
import {dateToDDMMYYYY} from "../../helpers/datetime_functions";
import {store} from "../index";

export function startSessionValidation(new_session: Session): ValidationResponse {
    const app_state = store.getState()
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
    // check that the increment exists if given
    if (new_session.duration_id && !app_state.durations[new_session.duration_id]) {
        return {
            status: ValidationStatus.ERROR,
            error: {
                field: SpecialField.GLOBAL,
                message: 'This increment does not exist'
            }
        }
    }
    return {
        status: ValidationStatus.SUCCESS
    }
}

export function updateSessionValidation(session_id: number): ValidationResponse {
    const app_state = store.getState()
    // check that the day exists
    const date_key = dateToDDMMYYYY(new Date(session_id))
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

export function deleteSessionValidation(session_id: number): ValidationResponse {
    const app_state = store.getState()
    // for now this is the same as updateSessionValidation
    return updateSessionValidation(session_id)
}
