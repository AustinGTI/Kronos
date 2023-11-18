/**
 * Returns a random number over a normal distribution with the given mean and standard deviation
 * @param {number} mean - The mean of the normal distribution
 * @param {number} standard_distribution - The standard deviation of the normal distribution
 * @returns {number} A random number over a normal distribution with the given mean and standard deviation
 */
export function generateRandomNormal(mean: number, standard_distribution: number): number {
    let u, v, s;
    do {
        u = 2 * Math.random() - 1;
        v = 2 * Math.random() - 1;
        s = u * u + v * v;
    } while (s >= 1 || s === 0);

    const normal = u * Math.sqrt((-2 * Math.log(s)) / s);

    return normal * standard_distribution + mean;
}

export type pt = { x: number, y: number };

export type CubicBezier = {
    u: pt,
    cp1: pt,
    cp2: pt,
    v: pt
}

/**
 * Converts 2 given numbers x and y into a point object holding the same values
 * @param x
 * @param y
 */
export function xyToPt(x: number, y: number): pt {
    return {x, y};
}

export function vecAdd(a: pt, b: pt): pt {
    return {x: a.x + b.x, y: a.y + b.y};
}

export function scalarMult(a: pt, b: number): pt {
    return {x: a.x * b, y: a.y * b};
}


/**
 * a recursive function that returns the point t between 0 and 1 of a n-point bezier curve given a list of points
 * @param pts - The list of points
 * @param t - The position on the curve from 0 to 1
 */
export function bezierCurve(pts: pt[], t: number): pt {
    if (pts.length === 1) {
        return pts[0];
    }
    return vecAdd(scalarMult(bezierCurve(pts.slice(0, -1), t), 1 - t), scalarMult(bezierCurve(pts.slice(1), t), t));
}


/**
 * A function to subdivide a Bézier curve at given points t1 and t2 returning the start, control points and end point of the segment between t1 and t2
 * @param pts - the starting point, control points and end point of the Bézier curve
 * @param t1 - the first point to subdivide at
 * @param t2 - the second point to subdivide at
 */
export function subdivideBezierCurve(pts: pt[], t1: number, t2: number): pt[] {
    console.log('starting subdivideBezierCurve with', pts, t1, t2)
    function div(pts: pt[], t: number, n_pts: pt[]): pt {
        if (pts.length === 1) {
            if (n_pts.length === 0) {
                n_pts.push(pts[0]);
            }
            return pts[0];
        }
        const res = vecAdd(scalarMult(div(pts.slice(0, -1), t, n_pts), 1 - t), scalarMult(div(pts.slice(1), t, n_pts), t));
        if (n_pts.length < pts.length) {
            n_pts.push(res);
        }
        return res
    }

    // first divide the curve into two curves at t2
    let n_pts: pt[] = [];
    div(pts, t2, n_pts);
    // the new curve is the second curve, now divide it at t1 with the points reversed
    let final_pts: pt[] = [];
    div(n_pts.reverse(), 1 - t1, final_pts);
    return final_pts.reverse()
}

