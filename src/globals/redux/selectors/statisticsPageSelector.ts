import {createSelector} from "@reduxjs/toolkit";
import selectActivityState from "./base_selectors/activitiesSelector";
import selectSessionState from "./base_selectors/sessionsSelector";

const selectStatisticsState = createSelector(selectActivityState, selectSessionState, (activities, sessions) => {
    return {
        activities, sessions
    };
})

export default selectStatisticsState;
