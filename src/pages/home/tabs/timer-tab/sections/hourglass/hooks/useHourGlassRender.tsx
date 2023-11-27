import React from 'react'
import {
    Easing,
    runTiming,
    Skia,
    SkiaValue,
    SkPath,
    useComputedValue,
    useTiming,
    useValue
} from "@shopify/react-native-skia";
import {subdivideBezierCurve, xyToPt} from "../../../../../../../globals/helpers/math_functions";
import {ContainerDimensions} from "../../../../../../../globals/types/ui";
import {FALLING_SAND_PROPERTIES, HOUR_GLASS_PROPERTIES,SAND_PROPERTIES} from "../constants";
import {calculateSegmentGroupDurations, getHourGlassCurveLevel} from "../helpers";
import {CoordFunctions, SegmentData} from "./types";
import {Animated} from "react-native";
import {TimerStatus} from "../../../useTimer";
import {useSharedValue, withTiming} from "react-native-reanimated";

interface HourGlassRender {
    container_path: SkPath
    top_sand_path: SkPath
    bottom_sand_path: SkPath
    falling_sand_path: SkiaValue<SkPath>
}

function useFallingSandPath(coordX: (x: number) => number, coordY: (y: number) => number, timer_status: TimerStatus) {
    const curr_timer_status_ref = React.useRef<TimerStatus>(timer_status)

    const falling_sand_top_position = useValue<number>(0)
    const falling_sand_bottom_position = useValue<number>(0)

    const startSandFall = () => {
        // animate from 0 to 1 over 300 ms
        runTiming(falling_sand_bottom_position, 1, {duration: 300, easing: Easing.in(Easing.quad)})
    }

    const stopSandFall = () => {
        // animate from 1 to 0 over 300 ms
        runTiming(falling_sand_top_position, 1, {duration: 300, easing: Easing.in(Easing.quad)}, () => {
            falling_sand_top_position.current = 0
            falling_sand_bottom_position.current = 0
        })
    }

    React.useEffect(() => {
        // if the timer status goes from anything else to running, start the sand fall animation
        if (timer_status === TimerStatus.RUNNING) {
            startSandFall()
        }
        // else if the timer status goes from running to anything else, stop the sand fall animation
        else if (curr_timer_status_ref.current === TimerStatus.RUNNING) {
            stopSandFall()
        }
        // update the current timer status ref
        curr_timer_status_ref.current = timer_status
    }, [timer_status]);

    const falling_sand_path = useComputedValue(() => {
        const from = falling_sand_top_position.current
        const to = falling_sand_bottom_position.current

        const falling_sand_path = Skia.Path.Make()

        const {vx, vy, uy, ux} = HOUR_GLASS_PROPERTIES
        const {margin, rounding_radius} = FALLING_SAND_PROPERTIES
        // falling sand path goes from the bottom of the top sand path to the top of the bottom sand path and is a rounded rectangle

        const sand_fall_height = vy - uy

        const falling_sand_top_height = sand_fall_height * from
        const falling_sand_bottom_height = sand_fall_height * (1 - to)

        falling_sand_path.moveTo(coordX(vx + margin), coordY(100 - vy + falling_sand_top_height))
        falling_sand_path.cubicTo(
            coordX(vx + margin), coordY(100 - vy + falling_sand_top_height - rounding_radius),
            coordX(100 - vx - margin), coordY(100 - vy + falling_sand_top_height - rounding_radius),
            coordX(100 - vx - margin), coordY(100 - vy + falling_sand_top_height))
        falling_sand_path.lineTo(coordX(100 - vx - margin), coordY(100 - uy - falling_sand_bottom_height))

        // if the sand is still falling, that is t is not yet 1, the bottom of the sand is rounded
        if (to !== 1) {
            falling_sand_path.cubicTo(
                coordX(100 - vx - margin), coordY(100 - uy - falling_sand_bottom_height + rounding_radius),
                coordX(vx + margin), coordY(100 - uy - falling_sand_bottom_height + rounding_radius),
                coordX(vx + margin), coordY(100 - uy - falling_sand_bottom_height)
            )
        } else {
            falling_sand_path.lineTo(coordX(vx + margin), coordY(100 - uy - falling_sand_bottom_height))
        }

        return falling_sand_path
    }, [coordX, coordY, timer_status, falling_sand_top_position, falling_sand_bottom_position])

    return falling_sand_path
}

export default function useHourGlassRender(timer_status: TimerStatus, segments_data: SegmentData, coord_functions: CoordFunctions): HourGlassRender {
    const {x: coordX, y: coordY} = coord_functions

    // Region SEGMENTS DURATIONS
    // ? ........................
    const {active_segment, completed_segments, remaining_segments} = segments_data

    const {
        completed_segments_duration, remaining_segments_duration, total_segments_duration
    } = calculateSegmentGroupDurations(active_segment, completed_segments, remaining_segments)

    const total_duration = completed_segments_duration + remaining_segments_duration

    // ? ........................
    // End ........................


    console.log('durations are ', completed_segments_duration, remaining_segments_duration, total_segments_duration)


    const container_path = React.useMemo(() => {
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

    const [top_sand_path, bottom_sand_path] = React.useMemo(() => {
        // calculate the total time as the sum of the durations of all segments

        // ! TEST DATA
        // const total_time = 100
        // const past_time = 50
        // const remaining_time = total_time - past_time

        const {ux, uy, vx, vy, u_curve, v_curve} = HOUR_GLASS_PROPERTIES
        const {max_bulge, bulge_rounding_factor} = SAND_PROPERTIES

        // first the top half of the hourglass
        const top_sand_path = Skia.Path.Make()

        const top_sand_bulge = Math.round(remaining_segments_duration/total_duration * max_bulge)

        // if the remaining time is not 0
        if (remaining_segments_duration) {
            // first get the sand level of the bulb
            const sand_level = getHourGlassCurveLevel(remaining_segments_duration / total_duration, 'top')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level
            const [tp_u, tp_cp1, tp_cp2, tp_v] = subdivideBezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], sand_level, 1)
            // draw the path
            // ? start at top right
            top_sand_path.moveTo(coordX(100 - tp_u.x), coordY(tp_u.y))
            // ? draw the top right curve
            top_sand_path.quadTo(coordX(100 - tp_u.x),coordY(tp_u.y - top_sand_bulge),coordX(100 - tp_u.x - top_sand_bulge* bulge_rounding_factor),coordY(tp_u.y - top_sand_bulge))
            // ? draw the top of the path
            top_sand_path.lineTo(coordX(tp_u.x + top_sand_bulge * bulge_rounding_factor),coordY(tp_u.y - top_sand_bulge))
            // ? draw the top left curve
            top_sand_path.quadTo(coordX(tp_u.x),coordY(tp_u.y - top_sand_bulge),coordX(tp_u.x), coordY(tp_u.y))
            // ? draw the left curve aligned to the hourglass
            top_sand_path.cubicTo(coordX(tp_cp1.x), coordY(tp_cp1.y), coordX(tp_cp2.x), coordY(tp_cp2.y), coordX(tp_v.x), coordY(tp_v.y))
            // ? draw the bottom of the path
            top_sand_path.lineTo(coordX(100 - tp_v.x), coordY(tp_v.y))
            // ? draw the right curve aligned to the hourglass
            top_sand_path.cubicTo(coordX(100 - tp_cp2.x), coordY(tp_cp2.y), coordX(100 - tp_cp1.x), coordY(tp_cp1.y), coordX(100 - tp_u.x), coordY(tp_u.y))
        }

        // now the bottom half of the hourglass
        const bottom_sand_path = Skia.Path.Make()

        const bottom_sand_bulge = Math.round(completed_segments_duration/total_duration * max_bulge)

        // if the past time is not 0
        if (completed_segments_duration) {
            // first get the sand level of the bulb
            const sand_level = getHourGlassCurveLevel(completed_segments_duration / total_duration, 'bottom')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level
            const [bp_u, bp_cp1, bp_cp2, bp_v] = subdivideBezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], 0, sand_level)
            // draw the path
            bottom_sand_path.moveTo(coordX(100 - bp_u.x), coordY(100 - bp_u.y))
            bottom_sand_path.lineTo(coordX(bp_u.x), coordY(100 - bp_u.y))
            bottom_sand_path.cubicTo(coordX(bp_cp1.x), coordY(100 - bp_cp1.y), coordX(bp_cp2.x), coordY(100 - bp_cp2.y), coordX(bp_v.x), coordY(100 - bp_v.y))
            bottom_sand_path.quadTo(coordX(bp_v.x), coordY(100 - bp_v.y - bottom_sand_bulge), coordX(bp_v.x + bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bp_v.y - bottom_sand_bulge))
            bottom_sand_path.lineTo(coordX(100 - bp_v.x - bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bp_v.y - bottom_sand_bulge))
            bottom_sand_path.quadTo(coordX(100 - bp_v.x), coordY(100 - bp_v.y - bottom_sand_bulge), coordX(100 - bp_v.x), coordY(100 - bp_v.y))
            bottom_sand_path.cubicTo(coordX(100 - bp_cp2.x), coordY(100 - bp_cp2.y), coordX(100 - bp_cp1.x), coordY(100 - bp_cp1.y), coordX(100 - bp_u.x), coordY(100 - bp_u.y))
        }

        return [top_sand_path, bottom_sand_path]
    }, [coordX, coordY, remaining_segments_duration, completed_segments_duration])

    const falling_sand_path = useFallingSandPath(coordX, coordY, timer_status)

    return (
        {
            container_path,
            top_sand_path,
            bottom_sand_path,
            falling_sand_path
        }
    );
}
