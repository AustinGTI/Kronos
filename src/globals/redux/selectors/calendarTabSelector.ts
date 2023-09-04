import {AppState} from "../reducers";
import {createSelector} from "@reduxjs/toolkit";

export function selectActivityState(state: AppState) {
  return state.activities;
}

export function selectSessionState(state: AppState) {
  return state.sessions;
}

const selectCalendarState = createSelector(selectActivityState,selectSessionState, (activities,sessions) => {
    return {
        activities,sessions
    };
})

export default selectCalendarState;