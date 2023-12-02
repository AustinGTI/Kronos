import React from 'react'
import {
    runTiming,
    SkiaValue,
    SkPath,
    SkPoint,
    SkRect,
    useComputedValue,
    useValue,
    vec
} from "@shopify/react-native-skia";
import {
    calculateSegmentGroupDurations,
    getHourGlassSandHeightGivenAreaUnitInterval
} from "../helpers";
import {SegmentData} from "./types";

interface GradientSpecifications {
    start: SkiaValue<SkPoint>,
    end: SkiaValue<SkPoint>,
    positions: SkiaValue<number[]>
}

interface HourGlassTexture {
    top_sand_gradient: GradientSpecifications
    bottom_sand_gradient: GradientSpecifications
}

interface BoundsData {
    top_sand_bounds: SkRect
    bottom_sand_bounds: SkRect
}


export default function useHourGlassTexture(top_sand_path: SkiaValue<SkPath>, bottom_sand_path: SkiaValue<SkPath>, segment_data: SegmentData): HourGlassTexture {
    const {active_segment, completed_segments, remaining_segments} = segment_data

    const {
        total_segments_duration
    } = calculateSegmentGroupDurations(active_segment, completed_segments, remaining_segments)

    const active_segment_elapsed_duration = React.useMemo(() => (
        Math.min(active_segment?.elapsed_duration ?? 0, active_segment?.initial_duration ?? 0)
    ), [active_segment?.elapsed_duration, active_segment?.initial_duration]);

    const animated_active_segment_elapsed_duration = useValue<number>(active_segment_elapsed_duration)

    React.useEffect(() => {
        // when the active segment elapsed duration changes, update the animated value
        runTiming(animated_active_segment_elapsed_duration, active_segment_elapsed_duration, {duration: 1000})
    }, [active_segment_elapsed_duration]);

    // if active segment changes, directly update the animated value
    React.useEffect(() => {
        animated_active_segment_elapsed_duration.current = active_segment_elapsed_duration
    }, [active_segment?.key]);

    // Region TOP SAND GRADIENT
    // ? ........................

    const top_sand_start: SkiaValue<SkPoint> = useComputedValue(() => {
        // the top center of the top sand path as a SkPoint
        const {x: t_x, y: t_y, width: t_w, height: t_h} = top_sand_path.current.getBounds()
        return vec(t_x + t_w / 2, t_y)
    }, [top_sand_path]);

    const top_sand_end: SkiaValue<SkPoint> = useComputedValue(() => {
        // the bottom center of the top sand path as a SkPoint
        const {x: t_x, y: t_y, width: t_w, height: t_h} = top_sand_path.current.getBounds()
        return vec(t_x + t_w / 2, t_y + t_h)
    }, [top_sand_path]);

    const top_sand_positions: SkiaValue<number[]> = useComputedValue(() => {
        const remaining_segments_duration = remaining_segments.reduce((duration, segment) => duration + segment.initial_duration, 0) +
            (active_segment ? (active_segment?.initial_duration ?? 0) - animated_active_segment_elapsed_duration.current : 0)

        const remaining_or_active_segments = [...remaining_segments, active_segment]
        return remaining_or_active_segments.reduce((positions, segment) => {
            if (!segment) return positions
            let current_segment_remaining_duration: number;
            if (segment.key === active_segment?.key) {
                current_segment_remaining_duration = segment.initial_duration - animated_active_segment_elapsed_duration.current
            } else {
                current_segment_remaining_duration = segment.initial_duration
            }
            const t = positions[1][positions[1].length - 1] + current_segment_remaining_duration / remaining_segments_duration
            positions[1].push(t)
            // console.log('t top at the moment is', t,'from initial duration',segment.initial_duration,'and elapsed duration',segment.elapsed_duration,'and remaining duration',remaining_segments_duration)
            const total_sand_level = getHourGlassSandHeightGivenAreaUnitInterval(remaining_segments_duration / total_segments_duration, 'top')
            const sand_level = 1 - (1 - getHourGlassSandHeightGivenAreaUnitInterval((1 - t) * remaining_segments_duration / total_segments_duration, 'top')) / (1 - total_sand_level)
            positions[0].push(sand_level)
            positions[0].push(sand_level)
            return positions
        }, [[0], [0]] as [number[], number[]])[0].slice(0, -1)
    }, [completed_segments, remaining_segments, active_segment, total_segments_duration, animated_active_segment_elapsed_duration]);

    // ? ........................
    // End ........................

    // Region BOTTOM SAND GRADIENT
    // ? ........................

    const bottom_sand_start: SkiaValue<SkPoint> = useComputedValue(() => {
        // the top center of the bottom sand path as a SkPoint
        const {x: b_x, y: b_y, width: b_w, height: b_h} = bottom_sand_path.current.getBounds()
        return vec(b_x + b_w / 2, b_y)
    }, [bottom_sand_path]);


    const bottom_sand_end: SkiaValue<SkPoint> = useComputedValue(() => {
        // the bottom center of the bottom sand path as a SkPoint
        const {x: b_x, y: b_y, width: b_w, height: b_h} = bottom_sand_path.current.getBounds()
        return vec(b_x + b_w / 2, b_y + b_h)
    }, [bottom_sand_path]);

    const bottom_sand_positions: SkiaValue<number[]> = useComputedValue(() => {
        const completed_segments_duration = completed_segments.reduce((duration, segment) => duration + segment.initial_duration, 0) +
            (active_segment ? animated_active_segment_elapsed_duration.current : 0)

        const completed_or_active_segments = [active_segment, ...completed_segments.slice().reverse()]
        return completed_or_active_segments.reduce((positions, segment) => {
            if (!segment) return positions
            let current_segment_completed_duration: number;
            if (segment.key === active_segment?.key) {
                current_segment_completed_duration = Math.min(animated_active_segment_elapsed_duration.current, active_segment.initial_duration)
            } else {
                current_segment_completed_duration = segment.initial_duration
            }
            const t = positions[1][positions[1].length - 1] + current_segment_completed_duration / completed_segments_duration
            positions[1].push(t)
            // console.log('t bottom at the moment is', t,'from initial duration',segment.initial_duration,'and elapsed duration',segment.elapsed_duration,'and past duration',past_segments_duration)
            const total_sand_level = getHourGlassSandHeightGivenAreaUnitInterval(completed_segments_duration / total_segments_duration, 'bottom')
            const sand_level = 1 - getHourGlassSandHeightGivenAreaUnitInterval((1 - t) * completed_segments_duration / total_segments_duration, 'bottom') / total_sand_level
            positions[0].push(sand_level)
            positions[0].push(sand_level)
            return positions
        }, [[0], [0]] as [number[], number[]])[0].slice(0, -1)
    }, [completed_segments, remaining_segments, active_segment, total_segments_duration, animated_active_segment_elapsed_duration]);

    // ? ........................
    // End ........................


    // const top_sand_gradient = useComputedValue(() => {
    //     const {x: t_x, y: t_y, width: t_w, height: t_h} = top_sand_bounds
    //     const remaining_or_active_segments = [...remaining_segments, active_segment]
    //
    //     const top_sand_gradient: GradientSpecifications = {
    //         colors: remaining_or_active_segments.reduce((colors, segment) => {
    //             if (!segment) return colors
    //             // we need to push color twice to act as the bounds for the gradient as we want the gradient to be a sequence of solid colors
    //             colors.push(segment.segment_type.color)
    //             colors.push(segment.segment_type.color)
    //             return colors
    //         }, [] as string[]),
    //         positions: remaining_or_active_segments.reduce((positions, segment) => {
    //             if (!segment) return positions
    //             let current_segment_remaining_duration: number;
    //             if (segment.key === active_segment?.key) {
    //                 current_segment_remaining_duration = segment.initial_duration - animated_active_segment_elapsed_duration.current
    //             } else {
    //                 current_segment_remaining_duration = segment.initial_duration
    //             }
    //             const t = positions[1][positions[1].length - 1] + current_segment_remaining_duration / remaining_segments_duration
    //             positions[1].push(t)
    //             // console.log('t top at the moment is', t,'from initial duration',segment.initial_duration,'and elapsed duration',segment.elapsed_duration,'and remaining duration',remaining_segments_duration)
    //             const total_sand_level = getHourGlassCurveLevel(remaining_segments_duration / total_segments_duration, 'top')
    //             const sand_level = 1 - (1 - getHourGlassCurveLevel((1 - t) * remaining_segments_duration / total_segments_duration, 'top')) / (1 - total_sand_level)
    //             positions[0].push(sand_level)
    //             positions[0].push(sand_level)
    //             return positions
    //         }, [[0], [0]] as [number[], number[]])[0].slice(0, -1),
    //         // starting from the top center to the bottom center
    //         start: vec(t_x + t_w / 2, t_y),
    //         end: vec(t_x + t_w / 2, t_y + t_h)
    //     }
    //
    //
    //     // console.log('top sand positions are', top_sand_gradient.positions, 'bottom sand positions are', bottom_sand_gradient.positions)
    //     return top_sand_gradient
    // }, [completed_segments, remaining_segments, active_segment, top_sand_bounds, bottom_sand_bounds, total_segments_duration, animated_active_segment_elapsed_duration]);
    //
    // const bottom_sand_gradient = useComputedValue(() => {
    //     // get the bottom sand gradient
    //     const {x: b_x, y: b_y, width: b_w, height: b_h} = bottom_sand_bounds
    //     const completed_or_active_segments = [active_segment, ...completed_segments.slice().reverse()]
    //
    //     const bottom_sand_gradient: GradientSpecifications = {
    //         colors: completed_or_active_segments.reduce((colors, segment) => {
    //             if (!segment) return colors
    //             // we need to push color twice to act as the bounds for the gradient as we want the gradient to be a sequence of solid colors
    //             colors.push(segment.segment_type.color)
    //             colors.push(segment.segment_type.color)
    //             return colors
    //         }, [] as string[]),
    //         positions: completed_or_active_segments.reduce((positions, segment) => {
    //             if (!segment) return positions
    //             let current_segment_completed_duration: number;
    //             if (segment.key === active_segment?.key) {
    //                 current_segment_completed_duration = animated_active_segment_elapsed_duration.current
    //             } else {
    //                 current_segment_completed_duration = segment.initial_duration
    //             }
    //             const t = positions[1][positions[1].length - 1] + current_segment_completed_duration / completed_segments_duration
    //             positions[1].push(t)
    //             // console.log('t bottom at the moment is', t,'from initial duration',segment.initial_duration,'and elapsed duration',segment.elapsed_duration,'and past duration',past_segments_duration)
    //             const total_sand_level = getHourGlassCurveLevel(completed_segments_duration / total_segments_duration, 'bottom')
    //             const sand_level = 1 - getHourGlassCurveLevel((1 - t) * completed_segments_duration / total_segments_duration, 'bottom') / total_sand_level
    //             positions[0].push(sand_level)
    //             positions[0].push(sand_level)
    //             return positions
    //         }, [[0], [0]] as [number[], number[]])[0].slice(0, -1),
    //         // starting from the top center to the bottom center
    //         start: vec(b_x + b_w / 2, b_y),
    //         end: vec(b_x + b_w / 2, b_y + b_h)
    //     }
    //
    //     return bottom_sand_gradient
    // }, [completed_segments, remaining_segments, active_segment, top_sand_bounds, bottom_sand_bounds, total_segments_duration, animated_active_segment_elapsed_duration])

    return (
        {
            top_sand_gradient: {
                start: top_sand_start,
                end: top_sand_end,
                positions: top_sand_positions
            },
            bottom_sand_gradient: {
                start: bottom_sand_start,
                end: bottom_sand_end,
                positions: bottom_sand_positions
            }
        }
    );
}
