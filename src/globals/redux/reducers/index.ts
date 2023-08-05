import {combineReducers} from "@reduxjs/toolkit";
import activitiesReducer, {ActivitiesState} from "./activitiesReducer";
import durationsReducer, {DurationsState} from "./durationsReducer";
import sessionsReducer, {SessionsState} from "./sessionsReducer";

export interface AppState {
    activities: ActivitiesState,
    durations: DurationsState,
    sessions: SessionsState
}


const rootReducer = combineReducers({
    activities: activitiesReducer,
    durations: durationsReducer,
    sessions: sessionsReducer
});

export default rootReducer;