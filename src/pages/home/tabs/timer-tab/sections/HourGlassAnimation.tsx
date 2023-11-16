import React from 'react'
import {Canvas, Group, Path, Skia} from "@shopify/react-native-skia";
import {TimerStatus} from "../useTimer";
import {TimerSegment} from "../timer_state";
import {View} from "react-native";
import {sampleCubicBezier, subdivideCubicBezier, xyToPt} from "../../../../../globals/helpers/math_functions";
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


const HOURGLASS_DIMENSIONS = {
    ux: 20,
    uy: 10,
    vx: 45,
    vy: 50,
    u_curve: 30,
    v_curve: 10,
    container_thickness: 10
}

const NO_OF_AREA_SAMPLES = 25

const MAX_HOURGLASS_CAPACITY = 0.8

const SAND_LEVEL_MARGIN_OF_ERROR = 0.01


export default function HourGlassAnimation({
                                               active_segment,
                                               completed_segments,
                                               remaining_segments,
                                               timer_status,
                                               canvas_height_as_ptg = 60,
                                               canvas_width_as_ptg = 100
                                           }: HourGlassProps) {
    const [container_dimensions, setContainerDimensions] = React.useState<ContainerDimensions>({width: 0, height: 0})

    const coordY = React.useCallback((ptg: number): number => {
        // convert a percentage value to the accurate y coordinate within the canvas using the container dimensions
        return container_dimensions.height * ptg / 100
    }, [container_dimensions.height]);

    const coordX = React.useCallback((ptg: number) => {
        // convert a percentage value to the accurate x coordinate within the canvas using the container dimensions
        return container_dimensions.width * ptg / 100
    }, [container_dimensions.width]);

    const calculateBezierDistanceGivenBezierHeight = React.useCallback((b_height: number): number => {
        // given a value b_height between 0 and 1 denoting the height of the bezier curve, calculate the relative distance along the curve
        // that corresponds to the given height
        // we use binary search to find the closest distance
        const {ux, uy, vx, vy, u_curve, v_curve} = HOURGLASS_DIMENSIONS
        let low = 0, high = 1, mid = 0;
        while (low <= high) {
            mid = (low + high) / 2;
            const {y} = sampleCubicBezier(xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy), mid)
            if (y < b_height) {
                low = mid + 0.0001
            } else if (y > b_height) {
                high = mid - 0.0001
            } else {
                break
            }
        }
        return mid
    }, []);


    // calculate the area of one bulb of the hourglass by sampling points along the bezier curve then adding up the area of the trapezoids
    const calculateHourGlassBulbArea = React.useCallback((from: number, to: number) => {
        let curve_area = 0
        // get the area of the rect from the top of the curve to the first control point
        const {ux, uy, vx, vy, u_curve, v_curve} = HOURGLASS_DIMENSIONS
        // use 25 samples
        let {
            x, y
        } = sampleCubicBezier(xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy), from)
        for (let i = Math.floor(NO_OF_AREA_SAMPLES * from); i < Math.ceil(NO_OF_AREA_SAMPLES * to); i++) {
            const next_point = sampleCubicBezier(xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy), (i + 1) / NO_OF_AREA_SAMPLES)
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

        console.log('the total bulb area is', total_bulb_area, 'and the target bulb area is', target_area)

        // if we are calculating the level of the top half, our 'to' value is always 1 and it is the from that is variable
        // correspondingly, if we are calculating the level of the bottom half, our 'from' value is always 0 and it is the 'to'
        // that is variable
        let low = 0, high = 1, mid = 0;
        while (low <= high) {
            mid = (low + high) / 2;
            const area = hour_glass_half === 'top' ? calculateHourGlassBulbArea(mid, 1) : calculateHourGlassBulbArea(0, mid)
            console.log('on evaluating for the ', hour_glass_half, 'the current mid is', mid, 'and the area is', area, 'yet the target is', target_area)
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

        console.log('using the given mid value of', mid, 'the calculated area is', hour_glass_half === 'top' ? calculateHourGlassBulbArea(mid, 1) : calculateHourGlassBulbArea(0, mid))
        return mid
    }, [calculateHourGlassBulbArea]);

    const generateHourGlassContainer = React.useCallback(() => {
        const {ux, uy, vx, vy, u_curve, v_curve} = HOURGLASS_DIMENSIONS
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

        // const total_time = completed_segments.reduce((total, segment) => total + segment.initial_duration, 0) +
        //     remaining_segments.reduce((total, segment) => total + segment.initial_duration, 0) +
        //     (active_segment ? active_segment.initial_duration : 0)
        // // past time is the total amount of time in the remaining and active segments relative to the total time
        // const past_time = remaining_segments.reduce((total, segment) => total + segment.initial_duration, 0) +
        //     (active_segment ? active_segment.elapsed_duration : 0)
        //
        // const remaining_time = total_time - past_time

        // ! TEST DATA
        const total_time = 100
        const past_time = 50
        const remaining_time = total_time - past_time

        const {ux, uy, vx, vy, u_curve, v_curve} = HOURGLASS_DIMENSIONS

        // first the top half of the hourglass
        const top_sand_path = Skia.Path.Make()
        // if the remaining time is not 0
        if (remaining_time) {
            // first get the sand level of the bulb
            const curve_level = getHourGlassCurveLevel(remaining_time / total_time, 'top')
            console.log('calculated sand level for the top sand path is', curve_level, ' based on level', remaining_time / total_time)
            // use this to calculate the control points for the bezier curve the corresponds to the sand level
            const {
                u: tp_u, cp1: tp_cp1, cp2: tp_cp2, v: tp_v
            } = subdivideCubicBezier(xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy), curve_level, 1)
            console.log('calculated control points for the top sand path are', tp_u, tp_cp1, tp_cp2, tp_v)
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
        if (past_time) {
            // first get the sand level of the bulb
            const sand_level = getHourGlassCurveLevel(past_time / total_time, 'bottom')
            console.log('calculated sand level for the bottom sand path is', sand_level, ' based on level', past_time / total_time)
            // use this to calculate the control points for the bezier curve the corresponds to the sand level
            const {
                u: bp_u, cp1: bp_cp1, cp2: bp_cp2, v: bp_v
            } = subdivideCubicBezier(xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy), 0, sand_level)
            console.log('calculated control points for the bottom sand path are', bp_u, bp_cp1, bp_cp2, bp_v)
            // draw the path
            bottom_sand_path.moveTo(coordX(100 - bp_u.x), coordY(100 - bp_u.y))
            bottom_sand_path.lineTo(coordX(bp_u.x), coordY(100 - bp_u.y))
            bottom_sand_path.cubicTo(coordX(bp_cp1.x), coordY(100 - bp_cp1.y), coordX(bp_cp2.x), coordY(100 - bp_cp2.y), coordX(bp_v.x), coordY(100 - bp_v.y))
            bottom_sand_path.lineTo(coordX(100 - bp_v.x), coordY(100 - bp_v.y))
            bottom_sand_path.cubicTo(coordX(100 - bp_cp2.x), coordY(100 - bp_cp2.y), coordX(100 - bp_cp1.x), coordY(100 - bp_cp1.y), coordX(100 - bp_u.x), coordY(100 - bp_u.y))
        }

        return [top_sand_path, bottom_sand_path]
    }, [getHourGlassCurveLevel, coordX, coordY])

    const [top_sand_path, bottom_sand_path] = React.useMemo(() => {
        return generateHourGlassContents()
    }, [generateHourGlassContents]);

    return (
        <View
            style={{width: `${canvas_width_as_ptg}%`, height: `${canvas_height_as_ptg}%`}}
            onLayout={(event) => setContainerDimensions({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height
            })}>
            <Canvas style={{width: '100%', height: '100%', backgroundColor: 'pink'}}>
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
                        color={'yellow'}
                        strokeCap="round"/>

                    <Path path={bottom_sand_path}
                          style="fill"
                          color={'purple'}
                          strokeCap="round"/>
                    <Path
                        path={generateHourGlassContainer()}
                        style="stroke"
                        strokeWidth={10}
                        color={'black'}
                        strokeCap="round"
                    />
                </Group>
            </Canvas>
        </View>
    );
}
