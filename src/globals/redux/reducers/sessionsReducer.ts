import {Day, SegmentType, Session} from "../../types/main";
import {createSlice} from "@reduxjs/toolkit";
import {dateToDDMMYYYY, getStartOfDay} from "../../helpers/datetime_functions";
import {extractSessionDateKey, generateSessionId} from "../../helpers/session_functions";
import generateDummyDay from "../dummies/dummy_sessions";

export type SessionsState = { [date_key: string]: Day }

export type NewSession = { activity_id?: number, duration_id?: number }

const initial_state: SessionsState = {}


const sessionsSlice = createSlice({
    name: 'sessions',
    initialState: initial_state,
    reducers: {
        startSession: (state, {payload}: { type: string, payload: NewSession }) => {
            // a new session will have no id, so we need to generate one
            const start_time = new Date()
            const id = generateSessionId(start_time, Object.keys(state[dateToDDMMYYYY(start_time)]?.sessions).length ?? 0)

            const new_session: Session = {
                ...payload,
                id, start_time,
                is_ongoing: true,
                end_time: null,
                segments: []
            }
            // check if there is already a day for today
            const today = dateToDDMMYYYY(start_time)
            if (state[today]) {
                // if there is, add the new session to it
                state[today].sessions[id] = new_session
            }
            // if there isn't, create a day for today and add the new session to it
            else {
                state[today] = {
                    // the date should be 00:00:00 of today
                    date: getStartOfDay(start_time),
                    sessions: {[id]: new_session}
                }
            }
        },

        endSession: (state, {payload}: { type: string, payload: { session_id: number, end_time?: Date } }) => {
            // first get the session
            const date_key = extractSessionDateKey(payload.session_id)
            const session = state[date_key]?.sessions[payload.session_id] as Session

            // set is_on_going to false and end_time to the current time if not provided
            session.is_ongoing = false
            session.end_time = payload.end_time ?? new Date()

            // update the session in the state
            state[date_key].sessions[payload.session_id] = session
        },

        // ? There will be 2 approaches to updating a session, both will be implemented, use will be decided on the frontend

        // ? METHOD 1: a single function called incrementSession, that takes a session id and a segment type, and increments the duration of the last segment of that type
        // * PROS:
        // * - flexible in that more segment types can be added in the future
        // * - could be useful if there is a strict mode, where the user needs to be in the app every minute for the session to be updated correctly

        // * CONS:
        // * - user needs to be in the app every minute for the session to be updated correctly
        // * - computationally expensive, there needs to be a call to incrementSession every minute

        // durations are assumed to be in minutes
        incrementSegment: (state, {payload}: {
            type: string,
            payload: { session_id: number, segment_type: SegmentType }
        }) => {
            // first get the session
            const date_key = extractSessionDateKey(payload.session_id)
            const session = state[date_key]?.sessions[payload.session_id] as Session

            // if the last segment is of the same type as given in the payload, increment its duration
            if (session.segments[session.segments.length - 1].type === payload.segment_type) {
                session.segments[session.segments.length - 1].duration += 1
            } else {
                // if the last segment is of a different type, add a new segment of the given type and set its duration to 1
                session.segments.push({
                    type: payload.segment_type,
                    duration: 1
                })
            }

            // update the session in the state
            state[date_key].sessions[payload.session_id] = session
        },

        // ? METHOD 2: a pair of function to start and end a session of a given type
        // * PROS:
        // * - only 2 calls each segment, one to start and one to end, much cheaper computationally
        // * - user does not need to be in the app every minute for the session to be updated correctly

        // * CONS:
        // * - allows for absurd segment durations if the user forgets to end a session for a long time, might need to be a limit on the frontend
        // * - more complex to determine end time of a session because all previous segments need to be summed up and added to the start time
        // * - confusion if a segment is not ended before the next one is started

        startSegment: (state, {payload}: {
            type: string,
            payload: { session_id: number, segment_type: SegmentType }
        }) => {
            // first get the session
            const date_key = extractSessionDateKey(payload.session_id)
            const session = state[date_key]?.sessions[payload.session_id] as Session

            // add a new segment of the given type and set its duration to 0
            session.segments.push({
                type: payload.segment_type,
                duration: 0
            })

            // update the session in the state
            state[date_key].sessions[payload.session_id] = session
        },

        endSegment: (state, {payload}: { type: string, payload: { session_id: number } }) => {
            // first get the session
            const date_key = extractSessionDateKey(payload.session_id)
            const session = state[date_key]?.sessions[payload.session_id] as Session

            // get the duration of the most recent segment
            // if there are no segments, return and log a warning
            if (session.segments.length === 0) {
                console.warn('Trying to end a segment when there are no segments')
                return
            }

            // get the sum of all previous segments, if there are no previous segments, set it to 0
            const previous_segments_duration = session.segments.slice(0, -1).reduce((acc, segment) => acc + segment.duration, 0)

            // add this to the start time to get the current segment start time
            const current_segment_start_time = new Date(session.start_time.getTime() + previous_segments_duration * 60 * 1000)

            // subtract this from the current time to get the current segment duration, convert to minutes
            // set the duration of the last segment to the current segment duration
            session.segments[session.segments.length - 1].duration = Math.floor((new Date().getTime() - current_segment_start_time.getTime()) / 1000 / 60)

            // update the session in the state
            state[date_key].sessions[payload.session_id] = session
        },

        // ? Its unclear if this will every be used, I don't see a reason to delete a session, but I'll leave it here for now
        deleteSession: (state, {payload}: { type: string, payload: number }) => {
            // first get the date_key from the session id
            const date_key = extractSessionDateKey(payload)

            // delete the session from the state
            delete state[date_key].sessions[payload]
        },

        // ! These functions are only used for testing, they should not be used in production
        generateDummySessions: (state, {payload}: { type: string, payload: { start_date: Date, end_date?: Date } }) => {
            // if end date is not defined it is assumed to be yesterday
            let end_date = payload.end_date ?? new Date()
            if (!payload.end_date) {
                end_date.setDate(end_date.getDate() - 1)
            }
            // for every day in the state within the range that does not have any sessions, generate dummy sessions
            for (let date = payload.start_date; date <= end_date; date.setDate(date.getDate() + 1)) {
                const date_key = dateToDDMMYYYY(date)
                if (!state[date_key]) {
                    state[date_key] = generateDummyDay(date)
                }
            }
        },

        clearSessions: (state) => {
            state = {} as SessionsState
        }
    }
})

export const {
    startSession,
    endSession,
    incrementSegment,
    startSegment,
    endSegment,
    deleteSession,
    generateDummySessions,
    clearSessions
} = sessionsSlice.actions
export default sessionsSlice.reducer