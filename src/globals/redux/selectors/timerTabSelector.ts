import {AppState} from "../reducers";
import {createSelector} from "@reduxjs/toolkit";
import {SessionsState} from "../reducers/sessionsReducer";

export function selectActivityState(state:AppState) {
    return state.activities;
}

export function selectDurationState(state:AppState) {
    return state.durations;
}
const selectTimerState = createSelector(selectActivityState,selectDurationState, (activities,durations) => {
    return {
        activities,durations,
        sessions: {} as SessionsState
    };
})

export default selectTimerState;
