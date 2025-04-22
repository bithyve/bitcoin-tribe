import jdenticon from 'jdenticon';

export const generateIdenticonSvg = (
  value: string,
  size: number = 45,
): string => {
  return jdenticon.toSvg(value, size);
};
