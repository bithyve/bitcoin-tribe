import { useMemo } from 'react';

/**
 * Rules: invoice may be requested without an asset if no amount is committed;
 * a committed amount requires an asset to be selected.
 */
export function useReceiveAssetInvoiceGuards(
  assetId: string,
  amountCommittedSmallest: '' | number,
) {
  return useMemo(() => {
    const hasAssetSelection = Boolean((assetId || '').trim());
    const hasCommittedAmount = amountCommittedSmallest !== '';
    const blocksInvoiceWithoutAsset =
      hasCommittedAmount && !hasAssetSelection;

    return {
      hasAssetSelection,
      hasCommittedAmount,
      blocksInvoiceWithoutAsset,
    };
  }, [assetId, amountCommittedSmallest]);
}
