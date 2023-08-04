import {createSlice} from "@reduxjs/toolkit";
import {Activity} from "../../types/main";
import {ValidationResponse, Status} from "../types";

export type ActivitiesState =  Map<number, Activity>


export type NewActivity = { id?: never } & Omit<Activity, 'id'>

const initial_state: ActivitiesState = new Map<number, Activity>()

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
        deleteActivity: (state, {payload}: { type: string, payload: number }) => {
            state.delete(payload)
        },
    }
})


export const {createActivity, updateActivity, deleteActivity} = activitiesSlice.actions
export default activitiesSlice.reducer