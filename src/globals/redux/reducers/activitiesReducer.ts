import {createSlice} from "@reduxjs/toolkit";
import {Activity} from "../../types/main";
import {ValidationResponse, ValidationStatus} from "../types";
import DEFAULT_ACTIVITIES_STATE from "../defaults/default_activities";

export type ActivitiesState = Map<number, Activity>


export type NewActivity = { id?: never } & Omit<Activity, 'id'>


const initial_state: ActivitiesState = DEFAULT_ACTIVITIES_STATE

const activitiesSlice = createSlice({
    name: 'activities',
    initialState: initial_state,
    reducers: {
        createActivity: (state, {payload}: { type: string, payload: NewActivity }) => {
            // a new activity will have no id, so we need to generate one
            const id = Math.max(...state.keys()) + 1
            const new_activity: Activity = {...payload, id}
            state.set(id, new_activity)
        },
        updateActivity: (state, {payload}: { type: string, payload: Activity }) => {
            state.set(payload.id, payload)
        },

        incrementActivityStats: (state, {payload}: { type: string, payload: { activity_id: number, session_duration: number } }) => {
            const activity = state.get(payload.activity_id) as Activity
            activity.stats_data.total_time += payload.session_duration
            activity.stats_data.total_sessions += 1
        },

        deleteActivity: (state, {payload}: { type: string, payload: number }) => {
            state.delete(payload)
        },

        // ! These functions are purely for testing purposes, should not be used in production
        resetActivities: (state) => {
            state = DEFAULT_ACTIVITIES_STATE
        },

        clearActivities: (state) => {
            state.clear()
        }
    }
})


export const {createActivity, updateActivity, deleteActivity} = activitiesSlice.actions
export default activitiesSlice.reducer