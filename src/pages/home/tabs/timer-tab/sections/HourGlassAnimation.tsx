import React from 'react'
import {Canvas, Group, LinearGradient, Path, Skia, SkPoint, vec} from "@shopify/react-native-skia";
import {TimerStatus} from "../useTimer";
import {TimerSegment} from "../timer_state";
import {View} from "react-native";
import {
    bezierCurve, pt, subdivideBezierCurve,
    xyToPt
} from "../../../../../globals/helpers/math_functions";
import {number} from "yup";

interface HourGlassProps {
    timer_status: TimerStatus
    active_segment: TimerSegment | null
    completed_segments: TimerSegment[]
    remaining_segments: TimerSegment[]
    canvas_height_as_ptg?: number
    canvas_width_as_ptg?: number
}

interface ContainerDimensions {
    width: number
    height: number
}

interface GradientSpecifications {
    start: SkPoint,
    end: SkPoint,
    colors: string[]
    positions: number[]
}

const HOUR_GLASS_PROPERTIES = {
    ux: 20,
    uy: 10,
    vx: 47,
    vy: 50,
    u_curve: 30,
    v_curve: 10,
    container_thickness: 6
}

const NO_OF_AREA_SAMPLES = 100

const MAX_HOURGLASS_CAPACITY = 0.8

const SAND_LEVEL_MARGIN_OF_ERROR = 0.01

const FALLING_SAND_PROPERTIES = {
    margin: 1,
    rounding_radius: 2
}


export default function HourGlassAnimation({
                                               active_segment,
                                               completed_segments,
                                               remaining_segments,
                                               timer_status,
                                               canvas_height_as_ptg = 60,
                                               canvas_width_as_ptg = 100
                                           }: HourGlassProps) {
    const [container_dimensions, setContainerDimensions] = React.useState<ContainerDimensions>({width: 0, height: 0})

    const total_segments_duration = React.useMemo(() => ([...completed_segments, ...remaining_segments].reduce((total, segment) => total + segment.initial_duration, 0) +
        (active_segment ? active_segment.initial_duration : 0)), [active_segment, completed_segments, remaining_segments])

    // past time is the total amount of time in the remaining and active segments relative to the total time
    const past_segments_duration = React.useMemo(() => (completed_segments.reduce((total, segment) => total + segment.initial_duration, 0) +
        (active_segment ? Math.min(active_segment.elapsed_duration, active_segment.initial_duration) : 0)), [active_segment, completed_segments])

    const remaining_segments_duration = React.useMemo(() => total_segments_duration - past_segments_duration, [total_segments_duration, past_segments_duration])

    const coordY = React.useCallback((ptg: number): number => {
        // convert a percentage value to the accurate y coordinate within the canvas using the container dimensions
        return container_dimensions.height * ptg / 100
    }, [container_dimensions.height]);

    const coordX = React.useCallback((ptg: number) => {
        // convert a percentage value to the accurate x coordinate within the canvas using the container dimensions
        return container_dimensions.width * ptg / 100
    }, [container_dimensions.width]);


    // calculate the area of one bulb of the hourglass by sampling points along the bezier curve then adding up the area of the trapezoids
    const calculateHourGlassBulbArea = React.useCallback((from: number, to: number) => {
        let curve_area = 0
        // get the area of the rect from the top of the curve to the first control point
        const {ux, uy, vx, vy, u_curve, v_curve} = HOUR_GLASS_PROPERTIES
        // use 25 samples
        let {
            x, y
        } = bezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], from)
        for (let i = Math.floor(NO_OF_AREA_SAMPLES * from); i < Math.ceil(NO_OF_AREA_SAMPLES * to); i++) {
            const next_point = bezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], (i + 1) / NO_OF_AREA_SAMPLES)
            // the trapezoid has base width of x - vx, top width of next_point.x - vx, and height of next_point.y - y
            curve_area += 1 / 2 * (50 - x + 50 - next_point.x) * (next_point.y - y)
            // update x and y to the next point
            x = next_point.x;
            y = next_point.y;
        }
        // the curve area only accounts for a portion of the hourglass, so multiply by 2 for the 2 halves of a bulb
        return 2 * curve_area
    }, [])

    const getHourGlassCurveLevel = React.useCallback((relative_amount: number, hour_glass_half: 'top' | 'bottom') => {
        // we use binary search to get the closest estimate of the sand level given the relative amount of sand (0 to 1)
        // we also must account for the maximum capacity of the hourglass
        const total_bulb_area = calculateHourGlassBulbArea(0, 1)
        const target_area = total_bulb_area * relative_amount * MAX_HOURGLASS_CAPACITY


        // if we are calculating the level of the top half, our 'to' value is always 1 and it is the from that is variable
        // correspondingly, if we are calculating the level of the bottom half, our 'from' value is always 0 and it is the 'to'
        // that is variable
        let low = 0, high = 1, mid = 0;
        while (low <= high) {
            mid = (low + high) / 2;
            const area = hour_glass_half === 'top' ? calculateHourGlassBulbArea(mid, 1) : calculateHourGlassBulbArea(0, mid)
            if (area < target_area && area + SAND_LEVEL_MARGIN_OF_ERROR < target_area) {
                if (hour_glass_half === 'top') {
                    // if we are calculating the top half, we want to decrease the sand level, so we decrease the 'from' value
                    high = mid - 0.0001
                } else {
                    // if we are calculating the bottom half, we want to increase the sand level, so we increase the 'to' value
                    low = mid + 0.0001
                }
            } else if (area > target_area && area - SAND_LEVEL_MARGIN_OF_ERROR > target_area) {
                if (hour_glass_half === 'top') {
                    // if we are calculating the top half, we want to increase the sand level, so we increase the 'from' value
                    low = mid + 0.0001
                } else {
                    // if we are calculating the bottom half, we want to decrease the sand level, so we decrease the 'to' value
                    high = mid - 0.0001
                }
            } else {
                break
            }
        }

        return mid
    }, [calculateHourGlassBulbArea]);

    const generateHourGlassContainer = React.useCallback(() => {
        const {ux, uy, vx, vy, u_curve, v_curve} = HOUR_GLASS_PROPERTIES
        // use skia to create a rounded hour glass shape
        const container_path = Skia.Path.Make()
        container_path.moveTo(coordX(100 - ux), coordY(uy))
        // top left
        container_path.lineTo(coordX(ux), coordY(uy))
        container_path.cubicTo(coordX(ux), coordY(uy + u_curve), coordX(vx), coordY(vy - v_curve), coordX(vx), coordY(vy))
        // bottom left
        container_path.cubicTo(coordX(vx), coordY(100 - (vy - v_curve)), coordX(ux), coordY(100 - (uy + u_curve)), coordX(ux), coordY(100 - uy))
        container_path.lineTo(coordX(100 - ux), coordY(100 - uy))
        // top right
        container_path.cubicTo(coordX(100 - ux), coordY(100 - uy - u_curve), coordX(100 - vx), coordY(100 - vy + v_curve), coordX(100 - vx), coordY(100 - vy))
        // bottom right
        container_path.cubicTo(coordX(100 - vx), coordY(vy - v_curve), coordX(100 - ux), coordY(uy + u_curve), coordX(100 - ux), coordY(uy))


        return container_path
    }, [coordX, coordY]);

    const generateHourGlassContents = React.useCallback(() => {
        // calculate the total time as the sum of the durations of all segments


        console.log('currently the total time is', total_segments_duration, 'the past time is', past_segments_duration, 'and the remaining time is', remaining_segments_duration)

        // ! TEST DATA
        // const total_time = 100
        // const past_time = 50
        // const remaining_time = total_time - past_time

        const {ux, uy, vx, vy, u_curve, v_curve} = HOUR_GLASS_PROPERTIES

        // first the top half of the hourglass
        const top_sand_path = Skia.Path.Make()
        // if the remaining time is not 0
        if (remaining_segments_duration) {
            // first get the sand level of the bulb
            const sand_level = getHourGlassCurveLevel(remaining_segments_duration / total_segments_duration, 'top')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level
            const [tp_u, tp_cp1, tp_cp2, tp_v] = subdivideBezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], sand_level, 1)
            // draw the path
            top_sand_path.moveTo(coordX(100 - tp_u.x), coordY(tp_u.y))
            top_sand_path.lineTo(coordX(tp_u.x), coordY(tp_u.y))
            top_sand_path.cubicTo(coordX(tp_cp1.x), coordY(tp_cp1.y), coordX(tp_cp2.x), coordY(tp_cp2.y), coordX(tp_v.x), coordY(tp_v.y))
            top_sand_path.lineTo(coordX(100 - tp_v.x), coordY(tp_v.y))
            top_sand_path.cubicTo(coordX(100 - tp_cp2.x), coordY(tp_cp2.y), coordX(100 - tp_cp1.x), coordY(tp_cp1.y), coordX(100 - tp_u.x), coordY(tp_u.y))
        }

        // now the bottom half of the hourglass
        const bottom_sand_path = Skia.Path.Make()
        // if the past time is not 0
        if (past_segments_duration) {
            // first get the sand level of the bulb
            const sand_level = getHourGlassCurveLevel(past_segments_duration / total_segments_duration, 'bottom')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level
            const [bp_u, bp_cp1, bp_cp2, bp_v] = subdivideBezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], 0, sand_level)
            // draw the path
            bottom_sand_path.moveTo(coordX(100 - bp_u.x), coordY(100 - bp_u.y))
            bottom_sand_path.lineTo(coordX(bp_u.x), coordY(100 - bp_u.y))
            bottom_sand_path.cubicTo(coordX(bp_cp1.x), coordY(100 - bp_cp1.y), coordX(bp_cp2.x), coordY(100 - bp_cp2.y), coordX(bp_v.x), coordY(100 - bp_v.y))
            bottom_sand_path.lineTo(coordX(100 - bp_v.x), coordY(100 - bp_v.y))
            bottom_sand_path.cubicTo(coordX(100 - bp_cp2.x), coordY(100 - bp_cp2.y), coordX(100 - bp_cp1.x), coordY(100 - bp_cp1.y), coordX(100 - bp_u.x), coordY(100 - bp_u.y))
        }

        return [top_sand_path, bottom_sand_path]
    }, [getHourGlassCurveLevel, coordX, coordY, completed_segments, remaining_segments, active_segment])

    const [top_sand_path, bottom_sand_path] = React.useMemo(() => {
        return generateHourGlassContents()
    }, [generateHourGlassContents]);

    const generateFallingSand = React.useCallback((t: number) => {
        const {vx, vy, uy, ux} = HOUR_GLASS_PROPERTIES
        const {margin, rounding_radius} = FALLING_SAND_PROPERTIES
        // falling sand path goes from the bottom of the top sand path to the top of the bottom sand path and is a rounded rectangle
        const falling_sand_path = Skia.Path.Make()

        const sand_fall_height = 100 - uy - vy

        const distance_sand_fallen = sand_fall_height * t

        falling_sand_path.moveTo(coordX(vx + margin), coordY(vy))
        falling_sand_path.lineTo(coordX(100 - vx - margin), coordY(vy))
        falling_sand_path.lineTo(coordX(100 - vx - margin), coordY(vy + distance_sand_fallen))

        // if the sand is still falling, that is t is not yet 1, the bottom of the sand is rounded
        if (t !== 1) {
            falling_sand_path.cubicTo(coordX(100 - vx - margin), coordY(vy + distance_sand_fallen + rounding_radius), coordX(vx + margin), coordY(vy + distance_sand_fallen + rounding_radius), coordX(vx + margin), coordY(vy + distance_sand_fallen))
        } else {
            falling_sand_path.lineTo(coordX(vx + margin), coordY(vy + distance_sand_fallen))
        }

        return falling_sand_path
    }, [coordX, coordY])

    const [top_sand_gradient, bottom_sand_gradient] = React.useMemo(() => {
        const {x: t_x, y: t_y, width: t_w, height: t_h} = top_sand_path.getBounds()
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
                const t = positions[positions.length - 1] + (segment.initial_duration - segment.elapsed_duration) / remaining_segments_duration
                positions.push(t)
                positions.push(t)
                return positions
            }, [0] as number[]).slice(0, -1),
            // starting from the top center to the bottom center
            start: vec(t_x + t_w / 2, t_y),
            end: vec(t_x + t_w / 2, t_y + t_h)
        }

        // get the bottom sand gradient
        const {x: b_x, y: b_y, width: b_w, height: b_h} = bottom_sand_path.getBounds()
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
                const t = positions[positions.length - 1] + segment.elapsed_duration / past_segments_duration
                positions.push(t)
                positions.push(t)
                return positions
            }, [0] as number[]).slice(0, -1),
            // starting from the top center to the bottom center
            start: vec(b_x + b_w / 2, b_y),
            end: vec(b_x + b_w / 2, b_y + b_h)
        }

        return [top_sand_gradient, bottom_sand_gradient]
    }, [top_sand_path, bottom_sand_path, completed_segments, remaining_segments, active_segment]);

    console.log('active segment is', active_segment, 'completed segments are', completed_segments, 'remaining segments are', remaining_segments)


    return (
        <View
            style={{width: `${canvas_width_as_ptg}%`, height: `${canvas_height_as_ptg}%`}}
            onLayout={(event) => setContainerDimensions({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height
            })}>
            <Canvas style={{width: '100%', height: '100%'}}>
                <Group>
                    <Path
                        path={generateHourGlassContainer()}
                        style="fill"
                        color={'white'}
                        strokeCap="round"
                    />
                    <Path
                        path={top_sand_path}
                        style="fill"
                        color={'red'}
                        strokeCap="round">
                        <LinearGradient
                            start={top_sand_gradient.start}
                            end={top_sand_gradient.end}
                            colors={top_sand_gradient.colors}
                            positions={top_sand_gradient.positions}
                        />
                    </Path>

                    {
                        timer_status === TimerStatus.RUNNING ?
                            <Path path={generateFallingSand(1)}
                                  style="fill"
                                  color={top_sand_gradient.colors[top_sand_gradient.colors.length - 1]}
                                  strokeCap="round"/>
                            : null
                    }

                    <Path path={bottom_sand_path}
                          style="fill"
                          color={'purple'}
                          strokeCap="round">
                        <LinearGradient
                            start={bottom_sand_gradient.start}
                            end={bottom_sand_gradient.end}
                            colors={bottom_sand_gradient.colors}
                            positions={bottom_sand_gradient.positions}
                        />
                    </Path>

                    <Path
                        path={generateHourGlassContainer()}
                        style="stroke"
                        strokeWidth={HOUR_GLASS_PROPERTIES.container_thickness}
                        color={'black'}
                        strokeCap="round"
                    />
                </Group>
            </Canvas>
        </View>
    );
}
