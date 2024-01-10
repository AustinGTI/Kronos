import {createSelector} from "@reduxjs/toolkit";
import selectActivityState from "./base_selectors/activitiesSelector";
import selectDurationState from "./base_selectors/durationsSelector";
import selectSessionsState from "./base_selectors/sessionsSelector";

const selectAppStateForBackup = createSelector(selectActivityState, selectDurationState, selectSessionsState, (activities, durations, sessions) => {
    return {
        activities, durations, sessions
    }
})

export default selectAppStateForBackup;