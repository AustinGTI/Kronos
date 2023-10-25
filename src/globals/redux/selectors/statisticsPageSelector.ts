import {createSelector} from "@reduxjs/toolkit";
import selectActivityState from "./base_selectors/activitiesSelector";
import selectSessionsState from "./base_selectors/sessionsSelector";

const selectStatisticsState = createSelector(selectActivityState, selectSessionsState, (activities, sessions) => {
    return {
        activities, sessions
    };
})

export default selectStatisticsState;
