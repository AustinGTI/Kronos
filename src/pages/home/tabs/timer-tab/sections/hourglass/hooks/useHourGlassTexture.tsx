import React from 'react'
import {number} from "yup";
import {SkPoint, SkRect, vec} from "@shopify/react-native-skia";
import {calculateSegmentGroupDurations, getHourGlassCurveLevel} from "../helpers";
import {TimerSegment} from "../../../timer_state";
import {SegmentData} from "./types";

interface GradientSpecifications {
    start: SkPoint,
    end: SkPoint,
    colors: string[]
    positions: number[]
}

interface HourGlassTexture {
    top_sand_gradient: GradientSpecifications
    bottom_sand_gradient: GradientSpecifications
}

interface BoundsData {
    top_sand_bounds: SkRect
    bottom_sand_bounds: SkRect
}


export default function useHourGlassTexture(bounds_data: BoundsData, segment_data: SegmentData): HourGlassTexture {
    const {top_sand_bounds, bottom_sand_bounds} = bounds_data
    const {active_segment, completed_segments, remaining_segments} = segment_data

    const {
        completed_segments_duration, remaining_segments_duration, total_segments_duration
    } = calculateSegmentGroupDurations(active_segment, completed_segments, remaining_segments)

    const [top_sand_gradient, bottom_sand_gradient] = React.useMemo(() => {
        const {x: t_x, y: t_y, width: t_w, height: t_h} = top_sand_bounds
        const remaining_or_active_segments = [...remaining_segments, active_segment]

        const top_sand_gradient: GradientSpecifications = {
            colors: remaining_or_active_segments.reduce((colors, segment) => {
                if (!segment) return colors
                // we need to push color twice to act as the bounds for the gradient as we want the gradient to be a sequence of solid colors
                colors.push(segment.segment_type.color)
                colors.push(segment.segment_type.color)
                return colors
            }, [] as string[]),
            positions: remaining_or_active_segments.reduce((positions, segment) => {
                if (!segment) return positions
                const t = positions[1][positions[1].length - 1] + (segment.initial_duration - segment.elapsed_duration) / remaining_segments_duration
                positions[1].push(t)
                // console.log('t top at the moment is', t,'from initial duration',segment.initial_duration,'and elapsed duration',segment.elapsed_duration,'and remaining duration',remaining_segments_duration)
                const total_sand_level = getHourGlassCurveLevel(remaining_segments_duration / total_segments_duration, 'top')
                const sand_level = 1 - (1 - getHourGlassCurveLevel((1 - t) * remaining_segments_duration / total_segments_duration, 'top')) / (1 - total_sand_level)
                positions[0].push(sand_level)
                positions[0].push(sand_level)
                return positions
            }, [[0], [0]] as [number[], number[]])[0].slice(0, -1),
            // starting from the top center to the bottom center
            start: vec(t_x + t_w / 2, t_y),
            end: vec(t_x + t_w / 2, t_y + t_h)
        }

        // get the bottom sand gradient
        const {x: b_x, y: b_y, width: b_w, height: b_h} = bottom_sand_bounds
        const completed_or_active_segments = [active_segment, ...completed_segments.slice().reverse()]

        const bottom_sand_gradient: GradientSpecifications = {
            colors: completed_or_active_segments.reduce((colors, segment) => {
                if (!segment) return colors
                // we need to push color twice to act as the bounds for the gradient as we want the gradient to be a sequence of solid colors
                colors.push(segment.segment_type.color)
                colors.push(segment.segment_type.color)
                return colors
            }, [] as string[]),
            positions: completed_or_active_segments.reduce((positions, segment) => {
                if (!segment) return positions
                const t = positions[1][positions[1].length - 1] + (segment.key === active_segment?.key ? segment.elapsed_duration : segment.initial_duration) / completed_segments_duration
                positions[1].push(t)
                // console.log('t bottom at the moment is', t,'from initial duration',segment.initial_duration,'and elapsed duration',segment.elapsed_duration,'and past duration',past_segments_duration)
                const total_sand_level = getHourGlassCurveLevel(completed_segments_duration / total_segments_duration, 'bottom')
                const sand_level = 1 - getHourGlassCurveLevel((1 - t) * completed_segments_duration / total_segments_duration, 'bottom') / total_sand_level
                positions[0].push(sand_level)
                positions[0].push(sand_level)
                return positions
            }, [[0], [0]] as [number[], number[]])[0].slice(0, -1),
            // starting from the top center to the bottom center
            start: vec(b_x + b_w / 2, b_y),
            end: vec(b_x + b_w / 2, b_y + b_h)
        }

        // console.log('top sand positions are', top_sand_gradient.positions, 'bottom sand positions are', bottom_sand_gradient.positions)
        return [top_sand_gradient, bottom_sand_gradient]
    }, [completed_segments, remaining_segments, active_segment, top_sand_bounds, bottom_sand_bounds, total_segments_duration]);

    return (
        {
            top_sand_gradient,
            bottom_sand_gradient
        }
    );
}
