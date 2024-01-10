import {Duration, SegmentTypes} from "../../types/main";
import {createSlice} from "@reduxjs/toolkit";
import DEFAULT_DURATION_STATE from "../defaults/default_durations";
import * as yup from 'yup'

export type DurationsState = { [id: number]: Duration }

const initial_state: DurationsState = DEFAULT_DURATION_STATE

// Region DURATION VALIDATION SCHEMAS
// ? ........................

const segmentTypeSchema = yup.object().shape({
    key: yup.number().required(),
    name: yup.string().required(),
    color: yup.string().required(),
    persists_on_app_close: yup.boolean().required(),
}).test({
    name: 'isValidSegmentType',
    message: 'Invalid SegmentType',
    test: (value) => Object.values(SegmentTypes).some((type) => value.key === type.key && JSON.stringify(value) === JSON.stringify(type)),
});

export const segmentSchema = yup.object().shape({
    key: yup.number().required('Key is required'),
    duration: yup.number().required('Duration is required'),
    // keys in type must be one of the keys in SegmentTypes
    type: segmentTypeSchema
})

const durationSchema = yup.object().shape({
    id: yup.number().required('ID is required'),
    name: yup.string().required('Name is required'),
    // an array of atleast one segment
    segments: yup.array().of(segmentSchema).min(1).required('Segments are required')
})

export const DurationsStateSchema = yup.object().test({
    name: 'has_numeric_keys',
    test: (obj) => Object.keys(obj).every(key => !isNaN(parseInt(key))),
    message: 'Keys must be numbers'
}).test({
    name: 'has_valid_duration_schema',
    test: (obj) => Object.values(obj).every(value => durationSchema.isValidSync(value)),
    message: 'Values must be valid duration objects'
})

// ? ........................
// End ........................


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

        resetDurations: (state) => {
            // remove all keys in state and set the ones in default state
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            Object.keys(DEFAULT_DURATION_STATE).forEach(key => state[key as unknown as number] = DEFAULT_DURATION_STATE[key as unknown as number])
        },

        restoreDurations: (state, {payload}: { type: string, payload: DurationsState }) => {
            // remove all keys in state and set the ones in payload
            Object.keys(state).forEach(key => delete state[key as unknown as number])
            Object.keys(payload).forEach(key => state[key as unknown as number] = payload[key as unknown as number])
        }

    }
})

export const {
    createDuration,
    updateDuration,
    deleteDuration,
    resetDurations,
    clearDurations,
    restoreDurations

} = durationsSlice.actions
export default durationsSlice.reducer
