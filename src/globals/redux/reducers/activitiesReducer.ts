import {createSlice} from "@reduxjs/toolkit";
import {Activity} from "../../types/main";
import {ReduxResponse, Status} from "../types";

type ActivitiesState = {
    data: Map<number, Activity>
    response: ReduxResponse | null
}


type NewActivity = { id?: never } & Omit<Activity, 'id'>

const initial_state: ActivitiesState = {
    data: new Map<number, Activity>(),
    response: null
}

function validateActivity(activities: Map<number, Activity>, activity: Activity | NewActivity): ReduxResponse {
    // check that the activity name is unique
    const activity_names = Array.from(activities.values()).map(activity => activity.name)
    if (activity_names.includes(activity.name)) {
        return {
            type: 'create_activity',
            status: Status.ERROR,
            error: 'An activity with this name already exists'
        }
    }
    return {
        type: 'create_activity',
        status: Status.SUCCESS
    }
}

const activitiesSlice = createSlice({
    name: 'activities',
    initialState: initial_state,
    reducers: {
        createActivity: (state, {payload}: { type: string, payload: NewActivity }) => {
            // validate the activity
            const response = validateActivity(state.data, payload)
            if (response.status === Status.ERROR) {
                state.response = response
                return
            }
            // a new activity will have no id, so we need to generate one
            const id = Math.max(...state.data.keys()) + 1
            const new_activity: Activity = {...payload, id}
            state.data.set(id, new_activity)
            state.response = response
        },
        updateActivity: (state, {payload}: { type: string, payload: Activity }) => {
            // validate the activity
            const response = validateActivity(state.data, payload)
            if (response.status === Status.ERROR) {
                state.response = response
                return
            }
            state.data.set(payload.id, payload)
            state.response = response
        },
        deleteActivity: (state, {payload}: { type: string, payload: number }) => {
            // check that the activity exists
            if (!state.data.has(payload)) {
                state.response = {
                    type: 'delete_activity',
                    status: Status.ERROR,
                    error: 'Activity does not exist'
                }
                return
            }
            state.data.delete(payload)
            state.response = {
                type: 'delete_activity',
                status: Status.SUCCESS
            }
        },

        // ? RESPONSE REDUCERS
        // ? ........................
        clearResponse: (state, _) => {
            state.response = null
        }
    }
})


export const {createActivity, updateActivity, deleteActivity, clearResponse} = activitiesSlice.actions
export default activitiesSlice.reducer