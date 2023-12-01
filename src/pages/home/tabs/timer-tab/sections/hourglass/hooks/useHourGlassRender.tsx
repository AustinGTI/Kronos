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
import {bezierCurve, subdivideBezierCurve, xyToPt} from "../../../../../../../globals/helpers/math_functions";
import {ContainerDimensions} from "../../../../../../../globals/types/ui";
import {
    CAP_BEZIER_POINTS,
    FALLING_SAND_PROPERTIES,
    FUNNEL_BEZIER_POINTS,
    HOUR_GLASS_PROPERTIES,
    SAND_PROPERTIES
} from "../constants";
import {
    calculateSegmentGroupDurations,
    getHourGlassCurvesUnitRatiosGivenAreaUnitRatio
} from "../helpers";
import {CoordFunctions, SegmentData} from "./types";
import {Animated} from "react-native";
import {TimerStatus} from "../../../useTimer";
import {useSharedValue, withTiming} from "react-native-reanimated";
import {number} from "yup";

interface HourGlassRender {
    container_path: SkPath
    top_sand_path: SkiaValue<SkPath>
    bottom_sand_path: SkiaValue<SkPath>
    falling_sand_path: SkiaValue<SkPath>
}

function useFallingSandPath(coordX: (x: number) => number, coordY: (y: number) => number, timer_status: TimerStatus): SkiaValue<SkPath> {
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
    }, [falling_sand_top_position, falling_sand_bottom_position, coordX, coordY])

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

    const animated_completed_segments_duration = useValue<number>(completed_segments_duration)
    const animated_remaining_segments_duration = useValue<number>(remaining_segments_duration)

    // const animated_completed_segments_duration = withTiming(completed_segments_duration, {duration: 1000})
    // const animated_remaining_segments_duration = withTiming(remaining_segments_duration, {duration: 1000})
    // const animated_total_segments_duration = withTiming(total_segments_duration, {duration: 1000})

    React.useEffect(() => {
        // when the completed segments duration changes, animate the animated completed segments duration to the new value
        runTiming(animated_completed_segments_duration, completed_segments_duration, {duration: 1000})
        runTiming(animated_remaining_segments_duration, remaining_segments_duration, {duration: 1000})
    }, [completed_segments_duration, remaining_segments_duration]);

    // ? ........................
    // End ........................


    console.log('durations are ', completed_segments_duration, remaining_segments_duration, total_segments_duration)


    const container_path = React.useMemo(() => {
        const {ux, uy, vx, vy, u_curve, v_curve, cap_radius} = HOUR_GLASS_PROPERTIES

        // use skia to create a rounded hour glass shape
        const container_path = Skia.Path.Make()
        container_path.moveTo(coordX(100 - ux), coordY(uy))
        // ? top right bulb curve
        container_path.quadTo(coordX(100 - ux), coordY(uy - cap_radius), coordX(100 - ux - cap_radius), coordY(uy - cap_radius))
        // ? top of the hourglass
        container_path.lineTo(coordX(ux + cap_radius), coordY(uy - cap_radius))
        // ? top left bulb curve
        container_path.quadTo(coordX(ux), coordY(uy - cap_radius), coordX(ux), coordY(uy))
        // ? top left curved side of the hourglass
        container_path.cubicTo(coordX(ux), coordY(uy + u_curve), coordX(vx), coordY(vy - v_curve), coordX(vx), coordY(vy))
        // ? bottom left curved side of the hourglass
        container_path.cubicTo(coordX(vx), coordY(100 - (vy - v_curve)), coordX(ux), coordY(100 - (uy + u_curve)), coordX(ux), coordY(100 - uy))
        // ? bottom left bulb curve
        container_path.quadTo(coordX(ux), coordY(100 - (uy - cap_radius)), coordX(ux + cap_radius), coordY(100 - (uy - cap_radius)))
        // ? bottom of the hourglass
        container_path.lineTo(coordX(100 - ux - cap_radius), coordY(100 - (uy - cap_radius)))
        // ? bottom right bulb curve
        container_path.quadTo(coordX(100 - ux), coordY(100 - (uy - cap_radius)), coordX(100 - ux), coordY(100 - uy))
        // ? bottom right curved side of the hourglass
        container_path.cubicTo(coordX(100 - ux), coordY(100 - uy - u_curve), coordX(100 - vx), coordY(100 - vy + v_curve), coordX(100 - vx), coordY(100 - vy))
        // ? top right curved side of the hourglass
        container_path.cubicTo(coordX(100 - vx), coordY(vy - v_curve), coordX(100 - ux), coordY(uy + u_curve), coordX(100 - ux), coordY(uy))


        return container_path
    }, [coordX, coordY]);


    const top_sand_path = useComputedValue(() => {
        // calculate the total time as the sum of the durations of all segments
        const {ux, uy, vx, vy, u_curve, v_curve, cap_radius} = HOUR_GLASS_PROPERTIES
        const {max_bulge, bulge_rounding_factor} = SAND_PROPERTIES

        // ! TEST DATA
        // const total_time = 100
        // const past_time = 50
        // const remaining_time = total_time - past_time

        // first the top half of the hourglass
        const top_sand_path = Skia.Path.Make()

        const proportion_completed = animated_remaining_segments_duration.current / (animated_completed_segments_duration.current + animated_remaining_segments_duration.current)
        // const proportion_completed = remaining_segments_duration / (completed_segments_duration + remaining_segments_duration)

        const top_sand_bulge = proportion_completed * max_bulge

        const hourglass_neck_width = (50 - vx) * 2

        // if the remaining time is not 0
        if (animated_remaining_segments_duration.current) {
            // first get the sand level of the bulb
            // const sand_level = getHourGlassCurveLevel(proportion_completed, 'top')
            const {
                cap: top_cap_unit_ratio,
                funnel: top_funnel_unit_ratio
            } = getHourGlassCurvesUnitRatiosGivenAreaUnitRatio(proportion_completed, 'top')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level

            console.log('top cap unit ratio is ', top_cap_unit_ratio,'while top funnel unit ratio is ', top_funnel_unit_ratio)

            // Region FUNNEL PATH
            // ? ........................


            if (top_funnel_unit_ratio) {
                const [tf_u, tf_cp1, tf_cp2, tf_v] = subdivideBezierCurve(FUNNEL_BEZIER_POINTS, top_funnel_unit_ratio, 1)

                // ? start at top left of the funnel
                top_sand_path.moveTo(coordX(tf_u.x), coordY(tf_u.y))
                // ? draw the left curve aligned to the hourglass
                top_sand_path.cubicTo(coordX(tf_cp1.x), coordY(tf_cp1.y), coordX(tf_cp2.x), coordY(tf_cp2.y), coordX(tf_v.x), coordY(tf_v.y))
                // ? draw the bottom of the path which is a cubic bezier whose diameter is the width of the hourglass neck
                top_sand_path.cubicTo(coordX(tf_v.x), coordY(tf_v.y + hourglass_neck_width / 2), coordX(100 - tf_v.x), coordY(tf_v.y + hourglass_neck_width / 2), coordX(100 - tf_v.x), coordY(tf_v.y))
                // top_sand_path.lineTo(coordX(100 - tp_v.x), coordY(tp_v.y))
                // ? draw the right curve aligned to the hourglass
                top_sand_path.cubicTo(coordX(100 - tf_cp2.x), coordY(tf_cp2.y), coordX(100 - tf_cp1.x), coordY(tf_cp1.y), coordX(100 - tf_u.x), coordY(tf_u.y))
                // if the top_cap unit ratio is 0, we can draw the top of the path as a bulge, otherwise the bulge is drawn as part of the cap path
                if (!top_cap_unit_ratio) {
                    // ? draw the top right curve
                    top_sand_path.quadTo(coordX(100 - tf_u.x), coordY(tf_u.y - top_sand_bulge), coordX(100 - tf_u.x - top_sand_bulge * bulge_rounding_factor), coordY(tf_u.y - top_sand_bulge))
                    // ? draw the top of the path
                    top_sand_path.lineTo(coordX(tf_u.x + top_sand_bulge * bulge_rounding_factor), coordY(tf_u.y - top_sand_bulge))
                    // ? draw the top left curve
                    top_sand_path.quadTo(coordX(tf_u.x), coordY(tf_u.y - top_sand_bulge), coordX(tf_u.x), coordY(tf_u.y))
                }
            }

            // ? ........................
            // End ........................

            // Region CAP PATH
            // ? ........................


            if (top_cap_unit_ratio) {
                const [tc_u, tc_cp1, tc_v] = subdivideBezierCurve(CAP_BEZIER_POINTS, top_cap_unit_ratio, 1)

                // ? draw the right curve aligned to the hourglass of the cap, if there is a top_cap_ratio the previous path ended at the bottom right of the cap
                top_sand_path.quadTo(coordX(100 - tc_cp1.x), coordY(tc_cp1.y), coordX(100 - tc_u.x), coordY(tc_u.y))
                // ? draw the top of the cap
                top_sand_path.lineTo(coordX(tc_u.x), coordY(tc_u.y))
                // ? draw the left curve aligned to the hourglass of the cap
                top_sand_path.quadTo(coordX(tc_cp1.x), coordY(tc_cp1.y), coordX(tc_v.x), coordY(tc_v.y))
            }

            // ? ........................
            // End ........................
        }

        return top_sand_path
    }, [coordX, coordY, animated_remaining_segments_duration, animated_completed_segments_duration])

    const bottom_sand_path = useComputedValue(() => {

        const {max_bulge, bulge_rounding_factor} = SAND_PROPERTIES

        // now the bottom half of the hourglass
        const bottom_sand_path = Skia.Path.Make()

        const proportion_completed = animated_completed_segments_duration.current / (animated_completed_segments_duration.current + animated_remaining_segments_duration.current)
        // const proportion_completed = completed_segments_duration / (completed_segments_duration + remaining_segments_duration)

        const bottom_sand_bulge = proportion_completed * max_bulge

        // if the past time is not 0
        if (animated_completed_segments_duration.current) {
            // first get the sand level of the bulb
            const {
                cap: bottom_cap_unit_ratio,
                funnel: bottom_funnel_unit_ratio
            } = getHourGlassCurvesUnitRatiosGivenAreaUnitRatio(proportion_completed, 'bottom')
            console.log('bottom cap unit ratio is ', bottom_cap_unit_ratio,'while bottom funnel unit ratio is ', bottom_funnel_unit_ratio)
            // use this to calculate the control points for the bezier curve the corresponds to the sand level

            // Region CAP PATH
            // ? ........................


            // since this is the bottom half, the cap path is drawn first
            if (bottom_cap_unit_ratio) {
                const [bc_u, bc_cp1, bc_v] = subdivideBezierCurve(CAP_BEZIER_POINTS, 0, bottom_cap_unit_ratio)

                console.log('bc_u is ', bc_u, 'bc_cp1 is ', bc_cp1, 'bc_v is ', bc_v)

                // ? start from the top left of the cap
                bottom_sand_path.moveTo(coordX(bc_v.x), coordY(100 - bc_v.y))
                // ? draw the left curve aligned to the hourglass of the cap
                bottom_sand_path.quadTo(coordX(bc_cp1.x), coordY(100 - bc_cp1.y), coordX(bc_u.x), coordY(100 - bc_u.y))
                // ? draw the bottom of the cap
                bottom_sand_path.lineTo(coordX(100 - bc_u.x), coordY(100 - bc_u.y))
                // ? draw the right curve aligned to the hourglass of the cap
                bottom_sand_path.quadTo(coordX(100 - bc_cp1.x), coordY(100 - bc_cp1.y), coordX(100 - bc_v.x), coordY(100 - bc_v.y))

                // if the top_funnel unit ratio is 0, we can draw the top of the cap as a bulge, otherwise the bulge is drawn as part of the funnel path
                if (!bottom_funnel_unit_ratio) {
                    // ? draw the top right curve
                    bottom_sand_path.quadTo(coordX(100 - bc_v.x), coordY(100 - bc_v.y + bottom_sand_bulge), coordX(100 - bc_v.x - bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bc_v.y + bottom_sand_bulge))
                    // ? draw the top of the path
                    bottom_sand_path.lineTo(coordX(bc_v.x + bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bc_v.y + bottom_sand_bulge))
                    // ? draw the top left curve
                    bottom_sand_path.quadTo(coordX(bc_v.x), coordY(100 - bc_v.y + bottom_sand_bulge), coordX(bc_v.x), coordY(100 - bc_v.y))
                }
            }

            // ? ........................
            // End ........................


            // Region FUNNEL PATH
            // ? ........................

            if (bottom_funnel_unit_ratio) {
                const [bf_u, bf_cp1, bf_cp2, bf_v] = subdivideBezierCurve(FUNNEL_BEZIER_POINTS, 0, bottom_funnel_unit_ratio)

                // if there is a bottom_cap_ratio the previous path ended at the top right of the cap
                // ? draw the right curve aligned to the hourglass
                bottom_sand_path.cubicTo(coordX(100 - bf_cp1.x), coordY(100 - bf_cp1.y), coordX(100 - bf_cp2.x), coordY(100 - bf_cp2.y), coordX(100 - bf_v.x), coordY(100 - bf_v.y))
                // ? draw the top bulge of the funnel starting with the top right edge of the bulge
                bottom_sand_path.quadTo(coordX(100 - bf_v.x), coordY(100 - bf_v.y - bottom_sand_bulge), coordX(100 - bf_v.x - bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bf_v.y - bottom_sand_bulge))
                // bottom_sand_path.quadTo(coordX(100 - bulge_cp.x), coordY(100 - bulge_cp.y), coordX(100 - bf_v.x - bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bf_v.y - bottom_sand_bulge))
                // ? draw the top of the path
                bottom_sand_path.lineTo(coordX(bf_v.x + bottom_sand_bulge * bulge_rounding_factor), coordY(100 - bf_v.y - bottom_sand_bulge))
                // ? draw the top left curve
                bottom_sand_path.quadTo(coordX(bf_v.x), coordY(100 - bf_v.y - bottom_sand_bulge), coordX(bf_v.x), coordY(100 - bf_v.y))
                // ? draw the left curve aligned to the hourglass
                bottom_sand_path.cubicTo(coordX(bf_cp2.x), coordY(100 - bf_cp2.y), coordX(bf_cp1.x), coordY(100 - bf_cp1.y), coordX(bf_u.x), coordY(100 - bf_u.y))
            }

            // ? ........................
            // End ........................
        }

        return bottom_sand_path
    }, [coordX, coordY, animated_remaining_segments_duration, animated_remaining_segments_duration])

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
