import {createSelector} from "@reduxjs/toolkit";
import selectSessionsState from "./base_selectors/sessionsSelector";
import selectActivityState from "./base_selectors/activitiesSelector";


const selectCalendarState = createSelector(selectActivityState, selectSessionsState, (activities, sessions) => {
    return {
        activities, sessions
    };
})

export default selectCalendarState;