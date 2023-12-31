import {createSlice} from "@reduxjs/toolkit";
import {Activity} from "../../types/main";
import DEFAULT_ACTIVITIES_STATE from "../defaults/default_activities";

export type ActivitiesState = { [id: number]: Activity }


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

        // ! These functions are purely for testing purposes, should not be used in production

        clearActivities: (state) => {
            // delete every activity in state
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            console.log('activities are now', state)
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
    resetActivities
} = activitiesSlice.actions

export default activitiesSlice.reducer;