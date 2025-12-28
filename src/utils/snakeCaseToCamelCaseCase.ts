function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

export function snakeCaseToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeCaseToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key: string) => {
      const camelCaseKey = toCamelCase(key);
      result[camelCaseKey] = snakeCaseToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}


export const formatTUsdt = (str: string) => {
  try {
    if (!str) return str;
    return str.replace(/tusdt/gi, 'tUSDT');
  } catch (error) {
    return str
  }
};

export const formatSmartTime=(timestamp) =>{
  const inputDate = new Date(timestamp);
  const now = new Date();

  // Helper functions
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isSameWeek = (d1, d2) => {
    const oneJan = new Date(d1.getFullYear(), 0, 1);
    const weekNumber = date => {
      const msInDay = 86400000;
      return Math.floor(((date - oneJan) / msInDay + oneJan.getDay() + 1) / 7);
    };
    return d1.getFullYear() === d2.getFullYear() &&
           weekNumber(d1) === weekNumber(d2);
  };

  const isSameMonth = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth();

  const isSameYear = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear();

  // Format options
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  if (isSameDay(inputDate, now)) {
    // Show time like "12:30 PM"
    let hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  } else if (isSameWeek(inputDate, now)) {
    // Show day name like "Tuesday"
    return days[inputDate.getDay()];
  } else if (isSameMonth(inputDate, now)) {
    // Show date like "16"
    return inputDate.getDate().toString();
  } else if (isSameYear(inputDate, now)) {
    // Show month like "October"
    return months[inputDate.getMonth()];
  } else {
    // Show year like "2022"
    return inputDate.getFullYear().toString();
  }
}
