export enum SegmentType {
    FOCUS = 'focus',
    BREAK = 'break'
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


export interface Duration {
    id: number;
    name: string;

    segments: Segment[]
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
