/**
 * Formats a number with commas as thousand separators.
 *
 * @param {number|string} x - The number to format.
 * @return {string} - The formatted number with commas.
 */
export const numberWithCommas = (x: number | string): string => {
  return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
};
