export type SegmentType = {
    name: string;
    color: string;
}

export const SEGMENT_TYPES: { [key: string]: SegmentType } = {
    FOCUS: {
        name: 'focus',
        color: '#db9cff'
    },
    BREAK: {
        name: 'break',
        color: '#ffe169'
    }
}

export interface Segment {
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
    default_duration_id: number;

    stats_data: {
        total_time: number;
        total_sessions: number;
    }
}

export const EMPTY_ACTIVITY: Activity = {
    id: -1,
    name: '',
    color: '#fff',
    default_duration_id: -1,
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
    id: -1,
    name: '',

    segments: []
}

export type Session = {
    id: number;
    activity_id?: number;
    duration_id?: number;

    start_time: Date,

    segments: Segment[]
} & (
    { is_ongoing: true, end_time: null } |
    { is_ongoing: false, end_time: Date }
    )

export interface Day {
    date: Date;
    sessions: { [id: number]: Session }
}

// ? ........................
// ? ........................
