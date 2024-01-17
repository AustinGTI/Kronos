import {createSelector} from "@reduxjs/toolkit";
import {SessionsState} from "../reducers/sessionsReducer";
import selectActivityState from "./base_selectors/activitiesSelector";
import selectDurationState from "./base_selectors/durationsSelector";
import {SettingsState} from "../reducers/settingsReducer";
import selectSettingsState from "./base_selectors/settingsSelector";

// returns an AppState object with only the planner state (activities and durations), sessions are not required in the planner
const selectPlannerState = createSelector(selectActivityState, selectDurationState, selectSettingsState, (activities, durations, settings) => {
    return {
        activities, durations, settings,
        sessions: {} as SessionsState,
    };
})

export default selectPlannerState;
