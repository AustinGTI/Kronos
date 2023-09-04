import {AppState} from "../reducers";
import {createSelector} from "@reduxjs/toolkit";
import {SessionsState} from "../reducers/sessionsReducer";

function selectActivityState(state: AppState) {
    return state.activities;
}

function selectDurationState(state: AppState) {
    return state.durations;
}

// returns an AppState object with only the planner state (activities and durations), sessions are not required in the planner
const selectPlannerState = createSelector(selectActivityState, selectDurationState, (activities, durations) => {
    return {
        activities, durations,
        sessions: {} as SessionsState
    };
})

export default selectPlannerState;
