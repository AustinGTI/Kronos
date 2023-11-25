import {TimerSegment} from "../../../timer_state";

export interface SegmentData {
    active_segment: TimerSegment | null
    completed_segments: TimerSegment[]
    remaining_segments: TimerSegment[]
}
