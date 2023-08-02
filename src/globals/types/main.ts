interface Session {
    id: number;
    activity_id: number;
    duration_id: number;

    start_time: Date,
    end_time: Date,

    segments: Segment[]
}
interface Day {
    date: Date;
    sessions: Session[];
}

interface Segment {
    duration: number;
    type: 'focus' | 'break';
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

export type Calendar = Map<string, Day>

// ? ........................
// ? ........................
