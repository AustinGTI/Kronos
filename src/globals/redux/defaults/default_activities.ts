import {Activity} from "../../types/main";
import {ActivitiesState} from "../reducers/activitiesReducer";

const default_stats_data = {
    total_time: 0,
    total_sessions: 0
}

const DEFAULT_ACTIVITIES_STATE: ActivitiesState = {
    1: {
        id: 1,
        name: 'Work',
        color: '#f66',
        default_duration_id: 1,
        stats_data: default_stats_data
    },
    2: {
        id: 2,
        name: 'Study',
        color: '#6f6',
        default_duration_id: 1,
        stats_data: default_stats_data
    },
    3: {
        id: 3,
        name: 'Exercise',
        color: '#66f',
        default_duration_id: 3,
        stats_data: default_stats_data
    },
    4: {
        id: 4,
        name: 'Meditate',
        color: '#ffe169',
        default_duration_id: 3,
        stats_data: default_stats_data
    },
    5: {
        id: 5,
        name: 'Art',
        color: '#d78fff',
        default_duration_id: 2,
        stats_data: default_stats_data
    }
}

export default DEFAULT_ACTIVITIES_STATE