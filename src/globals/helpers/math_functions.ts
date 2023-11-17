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
export function bezierCurve(pts: pt[],t: number): pt {
    if (pts.length === 1) {
        return pts[0];
    }
    return vecAdd(scalarMult(bezierCurve(pts.slice(0,-1),t), 1 - t), scalarMult(bezierCurve(pts.slice(1),t), t));
}


/**
 * Given the specifications of a bezier curve  namely the starting point, ending point, and two control points,
 * and 2 t values representing the start and end of a segment of the curve, returns the 4 control points of the
 * segment of the curve between the two t values
 * * Obviously ChatGPT generated lol
 * @param P0 - The starting point
 * @param P1 - The first control point
 * @param P2 - The second control point
 * @param P3 - The ending point
 * @param t1 - The start of the segment of the curve
 * @param t2 - The end of the segment of the curve
 */
export function subdivideCubicBezier(P0: pt, P1: pt, P2: pt, P3: pt, t1: number, t2: number): CubicBezier {
    const lerp = (a: pt, b: pt, t: number): pt => ({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
    });

    // Subdivide up to t2
    let [Q0, Q1, Q2, Q3] = [P0, P1, P2, P3];
    [Q0, Q1, Q2, Q3] = [
        lerp(Q0, Q1, t2),
        lerp(lerp(Q1, Q2, t2), lerp(Q2, Q3, t2), t2),
        lerp(lerp(lerp(Q1, Q2, t2), lerp(Q2, Q3, t2), t2), lerp(lerp(Q2, Q3, t2), Q3, t2), t2),
        lerp(Q2, Q3, t2)
    ];

    // Adjust t1 for the new range
    const adjustedT1 = (t1 - t2) / (1 - t2);

    // Subdivide the [0, t2] segment to get [t1, t2]
    const R0 = Q0;
    const R1 = lerp(Q0, Q1, adjustedT1);
    const R2 = lerp(lerp(Q0, Q1, adjustedT1), lerp(Q1, Q2, adjustedT1), adjustedT1);
    const R3 = lerp(lerp(lerp(Q0, Q1, adjustedT1), lerp(Q1, Q2, adjustedT1), adjustedT1), lerp(lerp(Q1, Q2, adjustedT1), Q2, adjustedT1), adjustedT1);

    return {
        u: R0, cp1: R1, cp2: R2, v: R3
    };
}
