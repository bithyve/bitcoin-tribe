import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';

export const saveTwitterHandle = (
  schema: RealmSchema,
  assetId: string,
  twitterHandle: string,
) => {
  dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
    twitterHandle,
  });
};

export const saveDomainName = (
  schema: RealmSchema,
  assetId: string,
  domainName: string,
) => {
  dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
    domainName,
  });
};
