function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

export function snakeCaseToCamelCaseCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeCaseToCamelCaseCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key: string) => {
      const camelCaseKey = toCamelCase(key);
      result[camelCaseKey] = snakeCaseToCamelCaseCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}
