export const numberWithCommas = (x: number | string, precision: number = 2): string => {
  if (!x) return '0';

  const num = typeof x === 'string' ? parseFloat(x) : x;
  if (isNaN(num)) return '0';
  
  if (Number.isInteger(num)) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  return num.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatNumber = text => {
  if (text == null || text === '') return '';
  const numberValue = String(text).replace(/,/g, '');
  if (numberValue === '') return '';
  const n = Number(numberValue);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('en-US').format(n);
};

export const formatLargeNumber = (num: number | string = 0) => {
  if (typeof num === 'string') {
    num = Number(num.replace(/,/g, ''));
  }
  if (num === 0) {
    return '0';
  }
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + 'M';
  } else {
    return numberWithCommas(num);
  }
};
