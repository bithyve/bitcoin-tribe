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
