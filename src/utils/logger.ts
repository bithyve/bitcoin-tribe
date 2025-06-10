export const logger = {
  log: (...args: any[]): void => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  error: (...args: any[]): void => {
    console.error(...args);
  },
};
export default logger;
