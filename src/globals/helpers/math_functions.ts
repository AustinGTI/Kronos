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

/**
 * Returns a sample position on a cubic bezier curve given the four control points and a t value
 * representing the position on the curve from 0 to 1
 * * Obviously ChatGPT generated lol
 * @param p0 - The starting point
 * @param p1 - The first control point
 * @param p2 - The second control point
 * @param p3 - The ending point
 * @param t - The position on the curve from 0 to 1
 */
export function sampleCubicBezier(p0: pt, p1: pt, p2: pt, p3: pt, t: number): pt {
    const invT = 1 - t;
    const invT2 = invT * invT;
    const invT3 = invT2 * invT;
    const t2 = t * t;
    const t3 = t2 * t;

    let x = invT3 * p0.x;
    x += 3 * invT2 * t * p1.x;
    x += 3 * invT * t2 * p2.x;
    x += t3 * p3.x;

    let y = invT3 * p0.y;
    y += 3 * invT2 * t * p1.y;
    y += 3 * invT * t2 * p2.y;
    y += t3 * p3.y;

    return {x, y};
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
