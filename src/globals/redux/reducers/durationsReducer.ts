import {Duration} from "../../types/main";
import {createSlice} from "@reduxjs/toolkit";
import DEFAULT_DURATION_STATE from "../defaults/default_durations";

export type DurationsState = { [id: number]: Duration }

const initial_state: DurationsState = DEFAULT_DURATION_STATE

const durationsSlice = createSlice({
    name: 'durations',
    initialState: initial_state,
    reducers: {
        createDuration: (state, {payload}: { type: string, payload: Duration }) => {
            // a new increment will have an id of -1, so generate a valid one
            const id = Math.max(...Object.keys(state).map(key => parseInt(key))) + 1
            state[id] = {...payload, id}
        },

        updateDuration: (state, {payload}: { type: string, payload: Duration }) => {
            state[payload.id] = payload
        },

        deleteDuration: (state, {payload}: { type: string, payload: number }) => {
            delete state[payload]
        },

        clearDurations: (state) => {
            // delete every duration in state
            Object.keys(state).forEach(key => delete state[key as unknown as number])
        },

        // ! These functions are purely for testing purposes, should not be used in production
        resetDurations: (state) => {
            // remove all keys in state and set the ones in default state
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            Object.keys(DEFAULT_DURATION_STATE).forEach(key => state[key as unknown as number] = DEFAULT_DURATION_STATE[key as unknown as number])
        },

    }
})

export const {
    createDuration,
    updateDuration,
    deleteDuration,
    resetDurations,
    clearDurations
} = durationsSlice.actions
export default durationsSlice.reducer
