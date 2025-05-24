import { IssuerVerificationMethod } from 'src/models/interfaces/RGBWallet';
import Relay from 'src/services/relay';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';

export const saveTwitterHandle = async (
  schema: RealmSchema,
  assetId: string,
  twitterHandle: string,
) => {
  const response = await Relay.verifyIssuer('appID', assetId, {
    type: IssuerVerificationMethod.TWITTER,
    link: '',
    id: '',
    name: '',
    username: twitterHandle,
  });
  if (response.status) {
    let updatedVerifiedBy = [
      {
        type: IssuerVerificationMethod.TWITTER,
        link: '',
        id: '',
        name: '',
        username: twitterHandle,
      },
    ];
    await dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
      issuer: {
        verified: false,
        verifiedBy: updatedVerifiedBy,
      },
    });
  }
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
