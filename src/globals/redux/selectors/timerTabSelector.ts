import {createSelector} from "@reduxjs/toolkit";
import {SessionsState} from "../reducers/sessionsReducer";
import selectActivityState from "./base_selectors/activitiesSelector";
import selectDurationState from "./base_selectors/durationsSelector";
import {SettingsState} from "../reducers/settingsReducer";

const selectTimerState = createSelector(selectActivityState,selectDurationState, (activities,durations) => {
    return {
        activities,durations,
        sessions: {} as SessionsState,
        settings: {} as SettingsState
    };
})

export default selectTimerState;
