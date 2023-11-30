import {TimerSegment} from "../../../timer_state";
import {SkiaMutableValue} from "@shopify/react-native-skia";

export interface SegmentData {
    active_segment: TimerSegment | null
    completed_segments: TimerSegment[]
    remaining_segments: TimerSegment[]
}

export interface SegmentAnimatedDurationData {
    animated_completed_segments_duration: SkiaMutableValue<number>
    animated_remaining_segments_duration: SkiaMutableValue<number>
}

export interface CoordFunctions {
    x: (t: number) => number
    y: (t: number) => number
}