import {ActivitiesStateSchema} from "../../../../../../globals/redux/reducers/activitiesReducer";
import {DurationsStateSchema} from "../../../../../../globals/redux/reducers/durationsReducer";
import * as yup from 'yup'
import {SessionsStateSchema} from "../../../../../../globals/redux/reducers/sessionsReducer";
import {Activity} from "../../../../../../globals/types/main";

type VerificationResult = { valid: boolean, error?: string }

function hasNumericKeys(obj: unknown): boolean {
    return typeof obj === 'object' && obj !== null && Object.keys(obj).every(key => !isNaN(parseInt(key)))
}


const appRestoreDataSchema = yup.object().shape({
    activities: ActivitiesStateSchema,
    durations: DurationsStateSchema,
    sessions: SessionsStateSchema
})

/**
 * a function to verify the data from the backup file
 * @param restore_data
 */
export function restoreValidation(restore_data: unknown): boolean {
    console.log('restore data is', restore_data,'of type',typeof restore_data)
    const is_valid = appRestoreDataSchema.isValidSync(restore_data)
    if (!is_valid) {
        console.error('Restore data is invalid')
        console.log(appRestoreDataSchema.validateSync(restore_data))
        return false
    }

    console.log('passed validation')
    return true
}