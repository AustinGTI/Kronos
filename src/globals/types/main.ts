export const EMPTY_RECORD_ID = -1;
export const UNTITLED_RECORD_ID = -2;
export const DELETED_RECORD_ID = -3;

export enum SegmentColorKey {
    FOCUS = 'focus_color',
    BREAK = 'break_color',
    PAUSE = 'pause_color'
}

export type SegmentType = {
    key: number,
    name: string;
    color_key: SegmentColorKey;
    persists_on_app_close: boolean;
}

export const SegmentTypes: { [key: string]: SegmentType } = {
    FOCUS: {
        key: 1,
        name: 'focus',
        color_key: SegmentColorKey.FOCUS,
        persists_on_app_close: true,
    },
    BREAK: {
        key: 2,
        name: 'break',
        color_key: SegmentColorKey.BREAK,
        persists_on_app_close: true,
    },
    PAUSE: {
        key: 3,
        name: 'pause',
        color_key: SegmentColorKey.PAUSE,
        persists_on_app_close: true,
    }
}

export interface Segment {
    key: number;
    duration: number;
    type: SegmentType
}

// ? MAIN DATA STRUCTURES
// ? ........................


export interface Activity {
    id: number;
    name: string;
    // description: string;
    color: string;
    default_duration_id: number | null;

    stats_data: {
        total_time: number;
        total_sessions: number;
    }
}

export const EMPTY_ACTIVITY: Activity = {
    id: EMPTY_RECORD_ID,
    name: '',
    color: '#f44336',
    default_duration_id: null,
    stats_data: {
        total_time: 0,
        total_sessions: 0
    }
}

export const UNTITLED_ACTIVITY: Activity = {
    id: UNTITLED_RECORD_ID,
    name: 'Untitled Activity',
    color: '#ccc',
    default_duration_id: null,
    stats_data: {
        total_time: 0,
        total_sessions: 0
    }
}

export const DELETED_ACTIVITY: Activity = {
    id: DELETED_RECORD_ID,
    name: 'Deleted Activity',
    color: '#ccc',
    default_duration_id: null,
    stats_data: {
        total_time: 0,
        total_sessions: 0
    }
}


export interface Duration {
    id: number;
    name: string;

    segments: Segment[]
}

export const EMPTY_DURATION: Duration = {
    id: EMPTY_RECORD_ID,
    name: '',
    segments: []
}

export const CUSTOM_DURATION: Duration = {
    id: UNTITLED_RECORD_ID,
    name: 'Custom Duration',
    segments: []
}

export type Session = {
    id: number;
    activity_id: number;
    duration_id: number;

    start_time: string, // an ISO string of the start time

    segments: Segment[]
} & (
    { is_ongoing: true, end_time: null } |
    { is_ongoing: false, end_time: string } // end time is an ISO string
    )

export interface Day {
    date_as_iso: string; // an ISO string of the start of the day
    sessions: { [id: number]: Session }
}

// ? ........................
// ? ........................
