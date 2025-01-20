/**
 * Formats a number with commas as thousand separators.
 *
 * @param {number|string} x - The number to format.
 * @return {string} - The formatted number with commas.
 */
export const numberWithCommas = (x: number | string): string => {
  return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
};

export const formatNumber = text => {
  const numberValue = text.replace(/,/g, ''); // Remove existing commas
  return text ? new Intl.NumberFormat('en-US').format(numberValue) : '';
};

export const formatLargeNumber = num => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'; // Format as billions
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; // Format as millions
  } else {
    return num.toLocaleString(); // Show normal number with commas
  }
};
