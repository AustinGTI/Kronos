import {createSlice} from "@reduxjs/toolkit";
import {Activity} from "../../types/main";
import DEFAULT_ACTIVITIES_STATE from "../defaults/default_activities";
import * as yup from 'yup'

export type ActivitiesState = { [id: number]: Activity }

// Region ACTIVITY VALIDATION SCHEMAS
// ? ........................

const activitySchema = yup.object().shape({
    id: yup.number().required('ID is required'),
    name: yup.string().required('Name is required'),
    color: yup.string().required('Color is required'),
    // a number or null
    default_duration_id: yup.number().nullable(),

    stats_data: yup.object().shape({
        total_time: yup.number().required('Total time is required'),
        total_sessions: yup.number().required('Total sessions is required'),
    })
})

export const ActivitiesStateSchema = yup.object().test({
    name: 'has_numeric_keys',
    test: (obj) => Object.keys(obj).every(key => !isNaN(parseInt(key))),
    message: 'Keys must be numbers'
}).test({
    name: 'has_valid_activity_schema',
    test: (obj) => Object.values(obj).every(value => activitySchema.isValidSync(value)),
    message: 'Values must be valid activity objects'
})

// ? ........................
// End ........................


const initial_state: ActivitiesState = DEFAULT_ACTIVITIES_STATE

const activitiesSlice = createSlice({
    name: 'activities',
    initialState: initial_state,
    reducers: {
        createActivity: (state, {payload}: { type: string, payload: Activity }) => {
            // a new activity will have an id of -1, so generate a valid one
            const id = Math.max(...Object.keys(state).map(key => parseInt(key))) + 1
            state[id] = {...payload, id}
        },
        updateActivity: (state, {payload}: { type: string, payload: Activity }) => {
            state[payload.id] = payload
        },

        // incrementActivityStats: (state, {payload}: { type: string, payload: { activity_id: number, session_duration: number } }) => {
        //     const activity = state[payload.activity_id] as Activity
        //     activity.stats_data.total_time += payload.session_duration
        //     activity.stats_data.total_sessions += 1
        // },

        incrementActivitySessions: (state, {payload}: { type: string, payload: { activity_id: number } }) => {
            const activity = state[payload.activity_id] as Activity
            activity.stats_data.total_sessions += 1
        },

        incrementActivityTime: (state, {payload}: {
            type: string,
            payload: { activity_id: number, increment: number }
        }) => {
            const activity = state[payload.activity_id] as Activity
            activity.stats_data.total_time += payload.increment
        },

        deleteActivity: (state, {payload}: { type: string, payload: number }) => {
            console.log('deleting activity', payload)
            delete state[payload]
        },
        resetActivities: (state) => {
            // remove all keys in state and set the ones in default state
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            Object.keys(DEFAULT_ACTIVITIES_STATE).forEach(key => state[key as unknown as number] = DEFAULT_ACTIVITIES_STATE[key as unknown as number])
            console.log('reset activities', state)
        },

        clearActivities: (state) => {
            // delete every activity in state
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            console.log('activities are now', state)
        },

        restoreActivities: (state, {payload}: { type: string, payload: ActivitiesState }) => {
            console.log('restoring activities', payload)
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            Object.keys(payload).forEach(key => state[key as unknown as number] = payload[key as unknown as number])
        }
    }
})


export const {
    createActivity,
    updateActivity,
    deleteActivity,
    incrementActivitySessions,
    incrementActivityTime,
    clearActivities,
    resetActivities,
    restoreActivities
} = activitiesSlice.actions

export default activitiesSlice.reducer;