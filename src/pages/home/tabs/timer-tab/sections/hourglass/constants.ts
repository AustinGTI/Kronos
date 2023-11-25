import {bezierCurve, xyToPt} from "../../../../../../globals/helpers/math_functions";

export const HOUR_GLASS_PROPERTIES = {
    ux: 20,
    uy: 10,
    vx: 47,
    vy: 50,
    u_curve: 30,
    v_curve: 10,
    container_thickness: 6
}

export const FALLING_SAND_PROPERTIES = {
    margin: 1,
    rounding_radius: 2
}

export const MAX_HOURGLASS_CAPACITY = 0.8


export const NO_OF_AREA_SAMPLES = 1000


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

export const HOUR_GLASS_BULB_AREA_CACHE = generateHourGlassBulbAreaCache()

