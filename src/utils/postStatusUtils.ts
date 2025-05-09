import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';

export const updateAssetPostStatus = (
  schema: RealmSchema,
  assetId: string,
  isVerifyPosted: boolean,
) => {
  dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
    isVerifyPosted,
  });
};
export const updateAssetIssuedPostStatus = (
  schema: RealmSchema,
  assetId: string,
  isIssuedPosted: boolean,
) => {
  dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
    isIssuedPosted,
  });
};
