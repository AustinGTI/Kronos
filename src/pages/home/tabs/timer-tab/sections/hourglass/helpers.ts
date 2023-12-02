import {
    HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE,
    HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE, HOUR_GLASS_HEIGHT_TO_AREA_CACHE,
    MAX_HOURGLASS_CAPACITY,
    NO_OF_AREA_SAMPLES,
} from "./constants";
import {TimerSegment} from "../../timer_state";
import React from "react";

interface HourGlassCurvesUnitIntervals {
    cap: number
    funnel: number
}

export function calculateHourGlassBulbFunnelArea(from: number, to: number): number {
    return HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE[Math.round(to * NO_OF_AREA_SAMPLES)] - HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE[Math.round(from * NO_OF_AREA_SAMPLES)]
}

export function calculateHourGlassBulbCapArea(from: number, to: number): number {
    return HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[Math.round(to * NO_OF_AREA_SAMPLES)] - HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[Math.round(from * NO_OF_AREA_SAMPLES)]
}

function getHourGlassCurveUnitInterval(target_area: number, calculateAreaFunction: (from: number, to: number) => number) {
    // use binary search to find the closest estimate of the sand level
    let low = 0;
    let high = 1;

    let iterations = 0
    while (iterations++ < 10 && low < high) {
        const mid = (low + high) / 2;
        const area = calculateAreaFunction(0, mid);
        if (area < target_area) {
            low = mid;
        } else if (area > target_area) {
            high = mid;
        } else {
            return mid;
        }
    }

    // get the closest estimate between the low and high
    return Math.abs(calculateAreaFunction(0, low) - target_area) < Math.abs(calculateAreaFunction(0, high) - target_area) ? low : high
}

/**
 * given an area unit interval (0 to 1), calculate the curve unit intervals (0 to 1) of the cap and funnel curves, this denotes the value of the t parameter of the bezier curve
 * for each curve
 * @param area_unit_interval
 * @param hour_glass_half
 */
export function getHourGlassCurvesUnitRatiosGivenAreaUnitRatio(area_unit_interval: number, hour_glass_half: 'top' | 'bottom'): HourGlassCurvesUnitIntervals {
    // we use binary search to get the closest estimate of the sand level given the relative amount of sand (0 to 1)
    // we also must account for the maximum capacity of the hourglass and the fact that a single bulb is 2 curves

    const total_bulb_area = calculateHourGlassBulbCapArea(0, 1) + calculateHourGlassBulbFunnelArea(0, 1)

    // the target area is the area of the bulb times the relative amount of sand times the maximum allowed capacity of the hourglass
    const target_area = total_bulb_area * (hour_glass_half === 'top' ? 1 - area_unit_interval * MAX_HOURGLASS_CAPACITY : area_unit_interval * MAX_HOURGLASS_CAPACITY)

    let cap_unit_interval = 0
    let funnel_unit_interval = 0

    // if the hour glass half is bottom, we start with the cap, if the target area overflows the cap, we move to the funnel
    // if (hour_glass_half === 'bottom') {
    if (target_area > calculateHourGlassBulbCapArea(0, 1)) {
        cap_unit_interval = 1
        funnel_unit_interval = getHourGlassCurveUnitInterval(target_area - calculateHourGlassBulbCapArea(0, 1), calculateHourGlassBulbFunnelArea)
    } else {
        cap_unit_interval = getHourGlassCurveUnitInterval(target_area, calculateHourGlassBulbCapArea)
        funnel_unit_interval = 0
    }
    // } else {
    //     // otherwise we start with the funnel, if the target area overflows the funnel, we move to the cap
    //     if (target_area > calculateHourGlassBulbFunnelArea(0, 1)) {
    //         funnel_unit_interval = 1
    //         cap_unit_interval = getHourGlassCurveUnitInterval(target_area - calculateHourGlassBulbFunnelArea(0, 1), calculateHourGlassBulbCapArea)
    //     } else {
    //         funnel_unit_interval = getHourGlassCurveUnitInterval(target_area, calculateHourGlassBulbFunnelArea)
    //         cap_unit_interval = 0
    //     }
    // }

    return {
        cap: cap_unit_interval,
        funnel: funnel_unit_interval
    }
}

/**
 * given an area unit interval (0 to 1), calculate the height unit interval (0 to 1) of the sand, which denotes the distance of the sand from the bottom of the bulb
 * @param area_unit_interval
 * @param hour_glass_half
 */
export function getHourGlassSandHeightGivenAreaUnitInterval(area_unit_interval: number, hour_glass_half: 'top' | 'bottom') {
    const total_bulb_area = calculateHourGlassBulbCapArea(0, 1) + calculateHourGlassBulbFunnelArea(0, 1)

    // the target area is the area of the bulb times the relative amount of sand times the maximum allowed capacity of the hourglass
    const target_area = total_bulb_area * (hour_glass_half === 'top' ? 1 - area_unit_interval * MAX_HOURGLASS_CAPACITY : area_unit_interval * MAX_HOURGLASS_CAPACITY)

    // use binary search to find the closest estimate of the sand level
    let low = 0;
    let high = 1;

    let iterations = 0
    while (iterations++ < 10 && low < high) {
        const mid = (low + high) / 2;
        const area = HOUR_GLASS_HEIGHT_TO_AREA_CACHE[Math.round(mid * NO_OF_AREA_SAMPLES)];
        if (area < target_area) {
            low = mid;
        } else if (area > target_area) {
            high = mid;
        } else {
            return mid;
        }
    }

    // get the closest estimate between the low and high
    return Math.abs(HOUR_GLASS_HEIGHT_TO_AREA_CACHE[low] - target_area) < Math.abs(HOUR_GLASS_HEIGHT_TO_AREA_CACHE[high] - target_area) ? low : high
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
export function calculateSegmentGroupDurations(active_segment: TimerSegment | null, completed_segments: TimerSegment[], remaining_segments: TimerSegment[]): SegmentGroupDurations {
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