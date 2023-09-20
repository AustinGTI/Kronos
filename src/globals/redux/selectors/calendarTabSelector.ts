import {createSelector} from "@reduxjs/toolkit";
import selectSessionState from "./base_selectors/sessionsSelector";
import selectActivityState from "./base_selectors/activitiesSelector";


const selectCalendarState = createSelector(selectActivityState, selectSessionState, (activities, sessions) => {
    return {
        activities, sessions
    };
})

export default selectCalendarState;