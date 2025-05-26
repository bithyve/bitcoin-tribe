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
    const existingAsset = await dbManager.getObjectByPrimaryId(
      schema,
      'assetId',
      assetId,
    );
    const existingIssuer =
      JSON.parse(JSON.stringify(existingAsset?.issuer)) || {};
    const filteredVerifiedBy = (existingIssuer.verifiedBy || []).filter(
      entry => entry.type !== IssuerVerificationMethod.TWITTER,
    );
    let updatedVerifiedBy = [
      ...filteredVerifiedBy,
      {
        type: IssuerVerificationMethod.TWITTER,
        link: '',
        id: '',
        name: '',
        username: twitterHandle,
        verified: false,
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
