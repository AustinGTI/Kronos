import {createSlice} from "@reduxjs/toolkit";
import {Activity} from "../../types/main";
import DEFAULT_ACTIVITIES_STATE from "../defaults/default_activities";

export type ActivitiesState = {[id:number]: Activity}


export type NewActivity = { id?: never } & Omit<Activity, 'id'>


const initial_state: ActivitiesState = DEFAULT_ACTIVITIES_STATE

const activitiesSlice = createSlice({
    name: 'activities',
    initialState: initial_state,
    reducers: {
        createActivity: (state, {payload}: { type: string, payload: NewActivity }) => {
            // a new activity will have no id, so we need to generate one
            const id = Math.max(...Object.keys(state).map(key => parseInt(key))) + 1
            state[id] = {...payload, id}
        },
        updateActivity: (state, {payload}: { type: string, payload: Activity }) => {
            state[payload.id] = payload
        },

        incrementActivityStats: (state, {payload}: { type: string, payload: { activity_id: number, session_duration: number } }) => {
            const activity = state[payload.activity_id] as Activity
            activity.stats_data.total_time += payload.session_duration
            activity.stats_data.total_sessions += 1
        },

        deleteActivity: (state, {payload}: { type: string, payload: number }) => {
            delete state[payload]
        },

        // ! These functions are purely for testing purposes, should not be used in production
        resetActivities: (state) => {
            state = DEFAULT_ACTIVITIES_STATE
        },

        clearActivities: (state) => {
            state = {} as ActivitiesState
        }
    }
})


export const {createActivity, updateActivity, deleteActivity} = activitiesSlice.actions
export default activitiesSlice.reducer