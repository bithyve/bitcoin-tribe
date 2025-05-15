import { IssuerVerificationMethod } from 'src/models/interfaces/RGBWallet';
import Relay from 'src/services/relay';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';

export const updateAssetPostStatus = async (
  asset,
  schema: RealmSchema,
  assetId: string,
  isVerifyPosted: boolean,
) => {
  if (isVerifyPosted) {
    const response = await Relay.verifyIssuer('appID', asset.assetId, {
      type: IssuerVerificationMethod.TWITTER_POST,
      link: '',
      id: asset?.issuer?.verifiedBy?.find(
        v => v.type === IssuerVerificationMethod.TWITTER,
      )?.id,
      name: asset?.issuer?.verifiedBy?.find(
        v => v.type === IssuerVerificationMethod.TWITTER,
      )?.name,
      username: asset?.issuer?.verifiedBy?.find(
        v => v.type === IssuerVerificationMethod.TWITTER,
      )?.username,
    });
    if (response.status) {
      const existingAsset = await dbManager.getObjectByPrimaryId(
        schema,
        'assetId',
        asset.assetId,
      );

      const existingVerifiedBy = existingAsset?.issuer?.verifiedBy || [];
      const alreadyExists = existingVerifiedBy.some(
        v => v.type === IssuerVerificationMethod.TWITTER,
      );
      let updatedVerifiedBy = [];
      if (alreadyExists) {
        updatedVerifiedBy = [
          ...existingVerifiedBy,
          {
            type: IssuerVerificationMethod.TWITTER_POST,
            link: '',
            id: asset?.issuer?.verifiedBy?.find(
              v => v.type === IssuerVerificationMethod.TWITTER,
            )?.id,
            name: asset?.issuer?.verifiedBy?.find(
              v => v.type === IssuerVerificationMethod.TWITTER,
            )?.name,
            username: asset?.issuer?.verifiedBy?.find(
              v => v.type === IssuerVerificationMethod.TWITTER,
            )?.username,
          },
        ];
        await dbManager.updateObjectByPrimaryId(
          schema,
          'assetId',
          asset.assetId,
          {
            isVerifyPosted,
            issuer: {
              verified: true,
              verifiedBy: updatedVerifiedBy,
            },
          },
        );
      }
    } else {
      dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
        isVerifyPosted,
      });
    }
  }
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
