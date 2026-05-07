export const MAX_ASSET_SUPPLY_VALUE = BigInt('18446744073709551615');

export const sanitizeNumericInput = (text: string): string =>
  text.replace(/[^0-9]/g, '');

export const isIfaTotalSupplyValid = (
  totalSupplyAmt: string,
  precision: number,
): boolean => {
  const sanitizedText = totalSupplyAmt.replace(/,/g, '');

  if (!sanitizedText) {
    return false;
  }

  if (!/^\d+$/.test(sanitizedText)) {
    return false;
  }

  const totalSupply = BigInt(sanitizedText);

  if (totalSupply === BigInt(0)) {
    return false;
  }

  return totalSupply * BigInt(10 ** precision) <= MAX_ASSET_SUPPLY_VALUE;
};

export const isIfaAmendmentsValid = (replaceRightsNum: string): boolean =>
  replaceRightsNum !== '';
