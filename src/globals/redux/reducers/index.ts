import {combineReducers} from "@reduxjs/toolkit";
import activitiesReducer, {ActivitiesState} from "./activitiesReducer";
import durationsReducer, {DurationsState} from "./durationsReducer";

export interface AppState {
    activities: ActivitiesState,
    durations: DurationsState,
}


const rootReducer = combineReducers({
    activities: activitiesReducer,
    durations: durationsReducer,
});

export default rootReducer;