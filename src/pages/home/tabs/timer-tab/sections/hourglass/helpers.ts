import {HOUR_GLASS_BULB_AREA_CACHE, MAX_HOURGLASS_CAPACITY, NO_OF_AREA_SAMPLES,} from "./constants";
import {TimerSegment} from "../../timer_state";
import React from "react";


/**
 * a function that calculates the area of an hourglass bulb from 'from' to 'to'
 * @param from
 * @param to
 */
export function calculateHourGlassBulbArea(from: number, to: number) : number {
    return HOUR_GLASS_BULB_AREA_CACHE[Math.round(to * NO_OF_AREA_SAMPLES)] - HOUR_GLASS_BULB_AREA_CACHE[Math.round(from * NO_OF_AREA_SAMPLES)]
}

export function getHourGlassCurveLevel(relative_amount: number, hour_glass_half: 'top' | 'bottom') {
    // we use binary search to get the closest estimate of the sand level given the relative amount of sand (0 to 1)
    // we also must account for the maximum capacity of the hourglass
    const total_bulb_area = calculateHourGlassBulbArea(0, 1)
    let target_area = total_bulb_area * relative_amount * MAX_HOURGLASS_CAPACITY

    target_area = hour_glass_half === 'top' ? total_bulb_area - target_area : target_area

    // use binary search to find the closest estimate of the sand level
    let low = 0;
    let high = 1;

    let iterations = 0
    while (iterations++ < 10 && low < high) {
        const mid = (low + high) / 2;
        const area = calculateHourGlassBulbArea(0, mid);
        if (area < target_area) {
            low = mid;
        } else if (area > target_area) {
            high = mid;
        } else {
            return mid;
        }
    }

    return Math.abs(HOUR_GLASS_BULB_AREA_CACHE[low] - target_area) < Math.abs(HOUR_GLASS_BULB_AREA_CACHE[high] - target_area) ? low : high
}

interface SegmentGroupDurations {
    completed_segments_duration: number
    remaining_segments_duration: number
    total_segments_duration: number
}

/**
 * given a set of completed and remaining segments as well as the active segment, calculate the past and remaining durations
 * @param active_segment
 * @param completed_segments
 * @param remaining_segments
 */
export function calculateSegmentGroupDurations(active_segment:TimerSegment | null,completed_segments:TimerSegment[],remaining_segments:TimerSegment[]):SegmentGroupDurations {
    const total_segments_duration = ([...completed_segments, ...remaining_segments].reduce((total, segment) => total + segment.initial_duration, 0) +
        (active_segment ? active_segment.initial_duration : 0))

    // past time is the total amount of time in the remaining and active segments relative to the total time
    const completed_segments_duration = completed_segments.reduce((total, segment) => total + segment.initial_duration, 0) +
        (active_segment ? Math.min(active_segment.elapsed_duration, active_segment.initial_duration) : 0)

    const remaining_segments_duration = React.useMemo(() => total_segments_duration - completed_segments_duration, [total_segments_duration, completed_segments_duration])

    return {
        completed_segments_duration,
        remaining_segments_duration,
        total_segments_duration
    }
}