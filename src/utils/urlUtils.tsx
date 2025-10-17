export const objectToUrlParams = (obj: Record<string, string | number | boolean>) => {
    return Object.entries(obj)
      .map(([key, value]) => 
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&');
  };

  export const urlParamsToObject = (url: string) => {
    const queryString = url.includes('?') ? url.split('?')[1] : url;
    const params = new URLSearchParams(queryString);
    const result: Record<string, string | number | boolean> = {};
  
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  };
  