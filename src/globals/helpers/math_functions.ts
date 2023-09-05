/**
 * Returns a random number over a normal distribution with the given mean and standard deviation
 * @param {number} mean - The mean of the normal distribution
 * @param {number} standard_distribution - The standard deviation of the normal distribution
 * @returns {number} A random number over a normal distribution with the given mean and standard deviation
 */
export function generateRandomNormal(mean: number, standard_distribution:number): number {
    let u, v, s;
    do {
        u = 2 * Math.random() - 1;
        v = 2 * Math.random() - 1;
        s = u * u + v * v;
    } while (s >= 1 || s === 0);

    const normal = u * Math.sqrt((-2 * Math.log(s)) / s);

    return normal * standard_distribution + mean;
}
