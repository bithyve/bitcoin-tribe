import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';

export const updateAssetPostStatus = (
  schema: RealmSchema,
  assetId: string,
  isPosted: boolean,
) => {
  dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
    isPosted,
  });
};
