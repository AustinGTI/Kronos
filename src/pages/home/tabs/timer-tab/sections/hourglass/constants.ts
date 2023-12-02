import {bezierCurve, pt, xyToPt} from "../../../../../../globals/helpers/math_functions";

export const HOUR_GLASS_PROPERTIES = {
    ux: 22,
    // must be more than cap_radius
    uy: 6,
    vx: 48,
    vy: 50,
    u_curve: 25,
    v_curve: 10,
    cap_radius: 3,
    container_thickness: 6
}

export const SAND_PROPERTIES = {
    // how much to increase the x value of the logistic function that represents the sand level by
    funnel_bulge_sigmoid_factor: 0.03,
    cap_bulge_sigmoid_factor: 0.1,
    bulge_spread_factor: 1,
}

export const FALLING_SAND_PROPERTIES = {
    margin: 0,
    rounding_radius: 2
}

export const MAX_HOURGLASS_CAPACITY = 0.8


export const NO_OF_AREA_SAMPLES = 1000

export const CAP_BEZIER_POINTS = [
    xyToPt(HOUR_GLASS_PROPERTIES.ux + HOUR_GLASS_PROPERTIES.cap_radius, HOUR_GLASS_PROPERTIES.uy - HOUR_GLASS_PROPERTIES.cap_radius),
    xyToPt(HOUR_GLASS_PROPERTIES.ux, HOUR_GLASS_PROPERTIES.uy - HOUR_GLASS_PROPERTIES.cap_radius),
    xyToPt(HOUR_GLASS_PROPERTIES.ux, HOUR_GLASS_PROPERTIES.uy)
]

export const FUNNEL_BEZIER_POINTS = [
    xyToPt(HOUR_GLASS_PROPERTIES.ux, HOUR_GLASS_PROPERTIES.uy),
    xyToPt(HOUR_GLASS_PROPERTIES.ux, HOUR_GLASS_PROPERTIES.uy + HOUR_GLASS_PROPERTIES.u_curve),
    xyToPt(HOUR_GLASS_PROPERTIES.vx, HOUR_GLASS_PROPERTIES.vy - HOUR_GLASS_PROPERTIES.v_curve),
    xyToPt(HOUR_GLASS_PROPERTIES.vx, HOUR_GLASS_PROPERTIES.vy)
]


/**
 * a function that calculates a cache of the area of the hourglass bulb from 0 to 1 in 1/NO_OF_AREA_SAMPLES increments
 * this will make calculate the area of the bulb a O(1) operation
 * the generated list will be cumulative such that to get for example:
 * the area from 0.5 to 0.75, you would do cache[0.75 * NO_OF_AREA_SAMPLES] - cache[0.5 * NO_OF_AREA_SAMPLES]
 *
 * the size of the cache is NO_OF_AREA_SAMPLES + 1 to account for the 0th index (which is 0) and the very NO_OF_AREA_SAMPLESth index (which is the total area)
 */
function generateHourGlassBulbAreaCache() {
    let curve_area = 0
    // get the area of the rect from the top of the curve to the first control point
    const {ux, uy, vx, vy, u_curve, v_curve} = HOUR_GLASS_PROPERTIES

    const cache: number[] = [0]

    let curr_point = bezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], 0)

    for (let i = 0; i < NO_OF_AREA_SAMPLES; i++) {
        // update x and y to the next point
        const next_point = bezierCurve([xyToPt(ux, uy), xyToPt(ux, uy + u_curve), xyToPt(vx, vy - v_curve), xyToPt(vx, vy)], (i + 1) / NO_OF_AREA_SAMPLES)
        // the trapezoid has base width of x - vx, top width of next_point.x - vx, and height of next_point.y - y
        // multiply by 2 for the 2 halves of a bulb
        curve_area += 1 / 2 * (50 - curr_point.x + 50 - next_point.x) * (next_point.y - curr_point.y) * 2
        cache.push(curve_area)

        curr_point = {...next_point}
    }
    return cache
}

function generateBezierCurveAreaLookup(bezier_points: pt[], no_of_samples: number) {
    let curve_area = 0

    const lookup: number[] = [0]

    let curr_point = bezierCurve(bezier_points, 0)

    for (let i = 0; i <= no_of_samples; i++) {
        // update x and y to the next point
        const next_point = bezierCurve(bezier_points, (i + 1) / no_of_samples)
        // the trapezoid has base width of x - vx, top width of next_point.x - vx, and height of next_point.y - y
        // multiply by 2 for the 2 halves of a bulb
        curve_area += 1 / 2 * (50 - curr_point.x + 50 - next_point.x) * (next_point.y - curr_point.y) * 2
        lookup.push(curve_area)

        curr_point = {...next_point}
    }

    return lookup
}

function generateHourGlassFunnelAreaCache() {
    return generateBezierCurveAreaLookup(FUNNEL_BEZIER_POINTS, NO_OF_AREA_SAMPLES)
}

function generateHourGlassCapAreaCache() {
    return generateBezierCurveAreaLookup(CAP_BEZIER_POINTS, NO_OF_AREA_SAMPLES)
}

function getClosestCurveUnitIntervalToHeightUnitInterval(height_unit_interval: number, getHeightGivenCurve: (curve_unit_interval: number) => number): number {
    // use binary search with at most 10 iterations to find the curve unit interval that is closest to the height unit interval
    let low = 0;
    let high = 1;

    let iterations = 0
    while (iterations++ < 10 && low < high) {
        const mid = (low + high) / 2;
        const height = getHeightGivenCurve(mid);
        if (height < height_unit_interval) {
            low = mid;
        } else if (height > height_unit_interval) {
            high = mid;
        } else {
            return mid;
        }
    }


    // get the closest estimate between the low and high
    return Math.abs(getHeightGivenCurve(low) - height_unit_interval) < Math.abs(getHeightGivenCurve(high) - height_unit_interval) ? low : high
}

function generateHourGlassHeightToAreaCache() {
    const {ux, uy, vx, vy, cap_radius} = HOUR_GLASS_PROPERTIES
    const max_height = vy - uy + cap_radius

    let curr_height = 0
    const cache: number[] = [0]

    for (let i = 0; i < NO_OF_AREA_SAMPLES; i++) {
        let area = 0
        const next_height = (i + 1) / NO_OF_AREA_SAMPLES * max_height
        // if the height is more than the cap radius, then we need to calculate the area of the funnel, just add the area of the cap
        if (next_height > cap_radius) {
            area += HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES]
            const t = getClosestCurveUnitIntervalToHeightUnitInterval(
                next_height - cap_radius,
                (curve_unit_interval) => bezierCurve(FUNNEL_BEZIER_POINTS, curve_unit_interval).y - uy
            )
            area += HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE[Math.round(t * NO_OF_AREA_SAMPLES)]
        } else {
            // if the height is less than the cap radius, then only the cap needs to be considered for the area
            const t = getClosestCurveUnitIntervalToHeightUnitInterval(
                next_height,
                (curve_unit_interval) => bezierCurve(CAP_BEZIER_POINTS, curve_unit_interval).y - uy
            )
            area += HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[Math.round(t * NO_OF_AREA_SAMPLES)]
        }

        cache.push(area)

        curr_height = next_height
    }

    return cache
}

function calculateFunnelAreaProportion() {
    const total = HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES] + HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES]
    return HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES] / total
}

function calculateCapAreaProportion() {
    const total = HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES] + HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES]
    return HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE[NO_OF_AREA_SAMPLES] / total
}

/**
 * this is a cache that maps the t parameter of the bezier curve to the area of the curve swept so far from 0 to 1 in increments of 1/NO_OF_AREA_SAMPLES
 * as denoted in the variable name, this goes for the cap and funnel curves which have separate caches
 */
export const HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE = generateHourGlassFunnelAreaCache()
export const HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE = generateHourGlassCapAreaCache()

/**
 * this is a cache that maps the height of the hourglass to the area of the bulb from 0 to 1 (top to bottom) of a bulb in increments of 1/NO_OF_AREA_SAMPLES
 * this is unified for both the cap and funnel curves thus regards the whole bulb as a single area
 */
export const HOUR_GLASS_HEIGHT_TO_AREA_CACHE = generateHourGlassHeightToAreaCache()

/**
 * the proportion of the area of the funnel and cap respectively to the total area of the bulb
 */
export const FUNNEL_AREA_PROPORTION = calculateFunnelAreaProportion()
export const CAP_AREA_PROPORTION = calculateCapAreaProportion()


// console.log('hour glass funnel curve to area', HOUR_GLASS_BULB_FUNNEL_CURVE_TO_AREA_CACHE)
// console.log('hour glass cap curve to area', HOUR_GLASS_BULB_CAP_CURVE_TO_AREA_CACHE)
// console.log('hour glass height to area', HOUR_GLASS_HEIGHT_TO_AREA_CACHE)