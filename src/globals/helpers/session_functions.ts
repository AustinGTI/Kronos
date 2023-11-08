import {dateToDDMMYYYY} from "./datetime_functions";

/**
 * A function to generate an integer session id given a Date and a session index
 * @param {Date} date - a string representing a date_as_iso in the format DD/MM/YYYY
 * @param {number} session_index - the index of the session in the day
 * @returns {number} the session id
 */
export function generateSessionId(date: Date, session_index: number): number {
    return parseInt(`${date.getTime()}${session_index.toString().padStart(4, '0')}`)
}

/**
 * A function to extract the date_key from a session id by removing the last 4 digits and converting the rest to a date_as_iso then to a string
 * @param {number} session_id - the session id to extract the date_as_iso key from
 */
export function extractSessionDateKey(session_id: number): string {
    return dateToDDMMYYYY(new Date(parseInt(session_id.toString().slice(0, -4))))
}
