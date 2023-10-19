export const EMPTY_RECORD_ID = -1;
export const UNTITLED_RECORD_ID = -2;

export type SegmentType = {
    key: number,
    name: string;
    color: string;
    persists_on_app_close?: boolean;
}

export const SegmentTypes: { [key: string]: SegmentType } = {
    FOCUS: {
        key: 1,
        name: 'focus',
        color: '#db9cff',
        persists_on_app_close: false,
    },
    BREAK: {
        key: 2,
        name: 'break',
        color: '#ffe169',
        persists_on_app_close: true,
    },
    PAUSE: {
        key: 3,
        name: 'pause',
        color: '#999',
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
    color: '#fff',
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
    date: string; // an ISO string of the start of the day
    sessions: { [id: number]: Session }
}

// ? ........................
// ? ........................
