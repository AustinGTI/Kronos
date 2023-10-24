import {combineReducers} from "@reduxjs/toolkit";
import activitiesReducer, {ActivitiesState} from "./activitiesReducer";
import durationsReducer, {DurationsState} from "./durationsReducer";
import sessionsReducer, {SessionsState} from "./sessionsReducer";
import {enableMapSet} from "immer";
import settingsReducer, {SettingsState} from "./settingsReducer";

export interface AppState {
    settings: SettingsState,
    activities: ActivitiesState,
    durations: DurationsState,
    sessions: SessionsState
}


const rootReducer = combineReducers({
    settings: settingsReducer,
    activities: activitiesReducer,
    durations: durationsReducer,
    sessions: sessionsReducer
});

export default rootReducer;