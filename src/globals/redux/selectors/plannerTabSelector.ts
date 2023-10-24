import {createSelector} from "@reduxjs/toolkit";
import {SessionsState} from "../reducers/sessionsReducer";
import selectActivityState from "./base_selectors/activitiesSelector";
import selectDurationState from "./base_selectors/durationsSelector";
import {SettingsState} from "../reducers/settingsReducer";

// returns an AppState object with only the planner state (activities and durations), sessions are not required in the planner
const selectPlannerState = createSelector(selectActivityState, selectDurationState, (activities, durations) => {
    return {
        activities, durations,
        sessions: {} as SessionsState,
        settings: {} as SettingsState
    };
})

export default selectPlannerState;
