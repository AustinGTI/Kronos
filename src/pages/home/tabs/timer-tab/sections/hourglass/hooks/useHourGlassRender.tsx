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
import {
    bezierCurve, euclideanDistance,
    inverseModifiedLogisticFunction, modifiedLogisticFunction,
    subdivideBezierCurve,
    xyToPt
} from "../../../../../../../globals/helpers/math_functions";
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

        const {vx, vy, uy: uy_origin, ux, cap_radius} = HOUR_GLASS_PROPERTIES
        const {margin, rounding_radius} = FALLING_SAND_PROPERTIES
        // falling sand path goes from the bottom of the top sand path to the top of the bottom sand path and is a rounded rectangle

        const uy = uy_origin - cap_radius

        const sand_fall_height = vy - uy

        const falling_sand_top_height = sand_fall_height * from
        const falling_sand_bottom_height = sand_fall_height * (1 - to)

        falling_sand_path.moveTo(coordX(vx + margin), coordY(100 - vy + falling_sand_top_height))
        if (from !== 0) {
            falling_sand_path.cubicTo(
                coordX(vx + margin), coordY(100 - vy + falling_sand_top_height - rounding_radius),
                coordX(100 - vx - margin), coordY(100 - vy + falling_sand_top_height - rounding_radius),
                coordX(100 - vx - margin), coordY(100 - vy + falling_sand_top_height))
        } else {
            falling_sand_path.lineTo(coordX(100 - vx - margin), coordY(100 - vy + falling_sand_top_height))
        }

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
        const {funnel_bulge_sigmoid_factor, bulge_spread_factor} = SAND_PROPERTIES

        // ! TEST DATA
        // const total_time = 100
        // const past_time = 50
        // const remaining_time = total_time - past_time

        // first the top half of the hourglass
        const top_sand_path = Skia.Path.Make()

        const proportion_remaining = animated_remaining_segments_duration.current / (animated_completed_segments_duration.current + animated_remaining_segments_duration.current)

        // if the remaining time is not 0
        if (animated_remaining_segments_duration.current) {
            // first get the sand level of the bulb
            // const sand_level = getHourGlassCurveLevel(proportion_completed, 'top')
            const {
                cap: top_cap_unit_ratio,
                funnel: top_funnel_unit_ratio
            } = getHourGlassCurvesUnitRatiosGivenAreaUnitRatio(proportion_remaining, 'top')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level


            // Region FUNNEL PATH
            // ? ........................


            if (top_funnel_unit_ratio !== 1) {
                const [tf_u, tf_cp1, tf_cp2, tf_v] = subdivideBezierCurve(FUNNEL_BEZIER_POINTS, top_funnel_unit_ratio, 1)
                const hourglass_neck_width = (50 - vx) * 2

                // Region BULGE
                // ? ........................

                // the bulge control point is defined as a point further along the bezier curve than top_funnel_unit_ratio
                // to calculate this, top_funnel_unit_ratio is taken as a value y on a modified logistic curve f(x), the bulge control ratio is thus f(x - funnel_bulge_sigmoid_factor) (negative because this is the top half of the hourglass)
                // passed through a bezier curve function with the same funnel bezier points you get the bulge control point
                const top_bulge_unit_ratio = modifiedLogisticFunction(inverseModifiedLogisticFunction(top_funnel_unit_ratio) - funnel_bulge_sigmoid_factor)
                const top_bulge_cp = bezierCurve(FUNNEL_BEZIER_POINTS, top_bulge_unit_ratio)

                // the bulge end point is the point along the horizontal line that crosses the bulge control point.
                // its distance from the bulge control point is the distance between the bulge control point and the funnel end point times the bulge_spread_factor, of course this is capped at the center of the hourglass
                const top_bulge_v = xyToPt(Math.min(50, top_bulge_cp.x + euclideanDistance(tf_u, top_bulge_cp) * bulge_spread_factor), top_bulge_cp.y)


                // ? ........................
                // End ........................


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
                if (top_cap_unit_ratio === 1) {
                    // ? draw the top right curve
                    top_sand_path.quadTo(coordX(100 - top_bulge_cp.x), coordY(top_bulge_cp.y), coordX(100 - top_bulge_v.x), coordY(top_bulge_v.y))
                    // ? draw the top of the path
                    top_sand_path.lineTo(coordX(top_bulge_v.x), coordY(top_bulge_v.y))
                    // ? draw the top left curve
                    top_sand_path.quadTo(coordX(top_bulge_cp.x), coordY(top_bulge_cp.y), coordX(tf_u.x), coordY(tf_u.y))
                }
            }

            // ? ........................
            // End ........................

            // Region CAP PATH
            // ? ........................

            if (top_cap_unit_ratio !== 1) {
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

        const {funnel_bulge_sigmoid_factor,cap_bulge_sigmoid_factor,  bulge_spread_factor} = SAND_PROPERTIES

        // now the bottom half of the hourglass
        const bottom_sand_path = Skia.Path.Make()

        const proportion_completed = animated_completed_segments_duration.current / (animated_completed_segments_duration.current + animated_remaining_segments_duration.current)

        // if the past time is not 0
        if (animated_completed_segments_duration.current) {
            // first get the sand level of the bulb
            const {
                cap: bottom_cap_unit_ratio,
                funnel: bottom_funnel_unit_ratio
            } = getHourGlassCurvesUnitRatiosGivenAreaUnitRatio(proportion_completed, 'bottom')
            // use this to calculate the control points for the bezier curve the corresponds to the sand level

            // Region CAP PATH
            // ? ........................


            // since this is the bottom half, the cap path is drawn first
            if (bottom_cap_unit_ratio) {
                const [bc_u, bc_cp1, bc_v] = subdivideBezierCurve(CAP_BEZIER_POINTS, 0, bottom_cap_unit_ratio)


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
                    const bottom_cap_bulge_unit_ratio = modifiedLogisticFunction(inverseModifiedLogisticFunction(bottom_cap_unit_ratio) + cap_bulge_sigmoid_factor)
                    const bbc_cp = bezierCurve(CAP_BEZIER_POINTS, bottom_cap_bulge_unit_ratio)

                    const bbc_v = xyToPt(Math.min(50, bbc_cp.x + euclideanDistance(bbc_cp, bc_v) * bulge_spread_factor), bbc_cp.y)

                    // ? draw the top bulge of the funnel starting with the top right edge of the bulge
                    bottom_sand_path.quadTo(coordX(100 - bbc_cp.x), coordY(100 - bbc_cp.y), coordX(100 - bbc_v.x), coordY(100 - bbc_v.y))
                    // ? draw the top of the path
                    bottom_sand_path.lineTo(coordX(bbc_v.x), coordY(100 - bbc_v.y))
                    // ? draw the top left curve
                    bottom_sand_path.quadTo(coordX(bbc_cp.x), coordY(100 - bbc_cp.y), coordX(bc_v.x), coordY(100 - bc_v.y))

                    // // ? draw the top right curve
                    // bottom_sand_path.quadTo(coordX(100 - bc_v.x), coordY(100 - bc_v.y - bottom_cap_bulge), coordX(100 - bc_v.x - bottom_cap_bulge * bulge_spread_factor), coordY(100 - bc_v.y - bottom_cap_bulge))
                    // // ? draw the top of the path
                    // bottom_sand_path.lineTo(coordX(bc_v.x + bottom_cap_bulge * bulge_spread_factor), coordY(100 - bc_v.y - bottom_cap_bulge))
                    // // ? draw the top left curve
                    // bottom_sand_path.quadTo(coordX(bc_v.x), coordY(100 - bc_v.y - bottom_cap_bulge), coordX(bc_v.x), coordY(100 - bc_v.y))
                }
            }

            // ? ........................
            // End ........................


            // Region FUNNEL PATH
            // ? ........................

            if (bottom_funnel_unit_ratio) {
                const [bf_u, bf_cp1, bf_cp2, bf_v] = subdivideBezierCurve(FUNNEL_BEZIER_POINTS, 0, bottom_funnel_unit_ratio)

                // Region BULGE
                // ? ........................

                // the bulge control point is defined as a point further along the bezier curve than bottom_cap_unit_ratio
                // to calculate this, bottom_funnel_unit_ratio is taken as a value y on a modified logistic curve f(x), the bulge control ratio is thus f(x + funnel_bulge_sigmoid_factor)
                // passed through a bezier curve function with the same cap bezier points you get the bulge control point
                const bottom_funnel_bulge_unit_ratio = modifiedLogisticFunction(inverseModifiedLogisticFunction(bottom_funnel_unit_ratio) + funnel_bulge_sigmoid_factor)
                const bbf_cp = bezierCurve(FUNNEL_BEZIER_POINTS, bottom_funnel_bulge_unit_ratio)

                // the bulge end point is the point along the horizontal line that crosses the bulge control point.
                // its distance from the bulge control point is the distance between the bulge control point and the funnel end point times the bulge_spread_factor, of course this is capped at the center of the hourglass
                const bbf_v = xyToPt(Math.min(50, bbf_cp.x + euclideanDistance(bbf_cp, bf_v) * bulge_spread_factor), bbf_cp.y)


                // ? ........................
                // End ........................


                // if there is a bottom_cap_ratio the previous path ended at the top right of the cap
                // ? draw the right curve aligned to the hourglass
                bottom_sand_path.cubicTo(coordX(100 - bf_cp1.x), coordY(100 - bf_cp1.y), coordX(100 - bf_cp2.x), coordY(100 - bf_cp2.y), coordX(100 - bf_v.x), coordY(100 - bf_v.y))
                // ? draw the top bulge of the funnel starting with the top right edge of the bulge
                bottom_sand_path.quadTo(coordX(100 - bbf_cp.x), coordY(100 - bbf_cp.y), coordX(100 - bbf_v.x), coordY(100 - bbf_v.y))
                // ? draw the top of the path
                bottom_sand_path.lineTo(coordX(bbf_v.x), coordY(100 - bbf_v.y))
                // ? draw the top left curve
                bottom_sand_path.quadTo(coordX(bbf_cp.x), coordY(100 - bbf_cp.y), coordX(bf_v.x), coordY(100 - bf_v.y))
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
