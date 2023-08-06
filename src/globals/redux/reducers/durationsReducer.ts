import {Duration} from "../../types/main";
import {createSlice} from "@reduxjs/toolkit";
import DEFAULT_DURATION_STATE from "../defaults/default_durations";

export type DurationsState = Map<number,Duration>

export type NewDuration = { id?: never } & Omit<Duration, 'id'>

const initial_state: DurationsState = DEFAULT_DURATION_STATE

const durationsSlice = createSlice({
    name: 'durations',
    initialState: initial_state,
    reducers: {
        createDuration: (state, {payload}: { type: string, payload: NewDuration }) => {
            // a new duration will have no id, so we need to generate one
            const id = Math.max(...state.keys()) + 1
            const new_duration: Duration = {...payload, id}
            state.set(id, new_duration)
        },

        updateDuration: (state, {payload}: { type: string, payload: Duration }) => {
            state.set(payload.id, payload)
        },

        deleteDuration: (state, {payload}: { type: string, payload: number }) => {
            state.delete(payload)
        },

        // ! These functions are purely for testing purposes, should not be used in production
        resetDurations: (state) => {
            state = DEFAULT_DURATION_STATE
        },

        clearDurations: (state) => {
            state.clear()
        }

    }
})

export const {createDuration, updateDuration, deleteDuration} = durationsSlice.actions
export default durationsSlice.reducer