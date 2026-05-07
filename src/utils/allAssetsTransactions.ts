import { RealmSchema } from 'src/storage/enum';
import { Transfer, TransferWithAsset } from 'src/models/interfaces/RGBWallet';
import { filterGasFreeTransfers } from './gasFreeTransactions';

/**
 * Minimal shape required from each asset to build an enriched transaction list.
 */
export interface AssetForTransactions {
  assetId: string;
  name: string;
  precision: number;
  transactions: Transfer[];
}

/**
 * Combines transactions from all provided asset groups into a single sorted list,
 * enriching each transfer with its source asset's context.
 *
 * @param assetGroups - Array of { assets, schema } pairs to aggregate.
 * @returns All gas-free-filtered transfers sorted newest-first.
 */
export function buildAllAssetsTransactions(
  assetGroups: { assets: AssetForTransactions[]; schema: RealmSchema }[],
): TransferWithAsset[] {
  const result: TransferWithAsset[] = [];

  for (const { assets, schema } of assetGroups) {
    for (const asset of assets) {
      const filtered = filterGasFreeTransfers(asset.transactions ?? []);
      for (const tx of filtered) {
        result.push({
          ...tx,
          assetId: asset.assetId,
          assetName: asset.name,
          assetPrecision: asset.precision,
          assetSchema: schema,
        });
      }
    }
  }

  return result.sort((a, b) => b.createdAt - a.createdAt);
}
