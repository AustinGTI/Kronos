/**
 * compares two strings, ignoring case
 * @param {string} a
 * @param {string} b
 * @param {boolean} [ignore_case=true] - whether to ignore case or not
 * @return {boolean} - true if the strings are equal, false otherwise
 */
export function compareStrings(a: string, b: string, ignore_case = true): boolean {
    if (ignore_case) {
        return a.toLowerCase() === b.toLowerCase()
    }
    return a === b
}


/**
 * Check if a color string is a valid hex color
 * @param {string} color - the color string to check
 * @return {boolean} - true if the color is valid, false otherwise
 */
export function isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}
