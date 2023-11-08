/**
 * A function to get the very start of a day given a date_as_iso
 * @param {Date} date - The date_as_iso to get the start of
 * @returns {Date} The start of the day
 */
export function getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Converts a date_as_iso to a string in the format DD/MM/YYYY
 * @param {Date} date - The date_as_iso to convert
 * @returns {string} The date_as_iso as a string in the format DD/MM/YYYY
 */
export function dateToDDMMYYYY(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
 * Converts a string of the format DD/MM/YYYY to a date_as_iso, specifically the date_as_iso at 00:00:00
 * @param {string} date_string - The date_as_iso string to convert
 * @returns {Date} The date_as_iso at 00:00:00
 */
export function DDMMYYYYToDate(date_string: string): Date {
    const [day, month, year] = date_string.split('/').map((x) => parseInt(x));
    return new Date(year, month - 1, day);
}