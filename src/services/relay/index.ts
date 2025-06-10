import config from 'src/utils/config';
import RestClient from '../rest/RestClient';
import { NetworkType } from '../wallets/enums';
import { AverageTxFeesByNetwork } from '../wallets/interfaces';
import { Asset } from 'src/models/interfaces/RGBWallet';
import logger from 'src/utils/logger';
import { Platform } from 'react-native';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { Storage, Keys } from 'src/storage';
const { HEXA_ID, RELAY } = config;
export default class Relay {
  public static getRegtestSats = async (address: string, amount: number) => {
    try {
      const res = await RestClient.post(`${RELAY}/btcfaucet/getcoins`, {
        HEXA_ID,
        address,
        amount,
        network: 'iris',
      });
      return res.data;
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  };

  public static getTestcoins = async (
    recipientAddress: string,
    network: any,
  ): Promise<{
    txid: any;
    funded: any;
  }> => {
    if (network === NetworkType.MAINNET) {
      throw new Error('Invalid network: failed to fund via testnet');
    }

    try {
      if (network === NetworkType.REGTEST) {
        await this.getRegtestSats(recipientAddress, 1);
        return { funded: true, txid: '' };
      } else {
        const res = await RestClient.post(`${RELAY}testnetFaucet`, {
          recipientAddress,
        });
        const { txid, funded } = res.data;
        return {
          txid,
          funded,
        };
      }
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.err);
      } else if (err.code) {
        throw new Error(err.code);
      }
    }
  };

  public static fetchFeeAndExchangeRates = async (): Promise<{
    exchangeRates: any;
    averageTxFees: AverageTxFeesByNetwork;
    serviceFee: any;
  }> => {
    try {
      let res;
      try {
        res = await RestClient.post(`${RELAY}/utils/fetchFeeAndExchangeRates`, {
          HEXA_ID,
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      const { exchangeRates, averageTxFees, serviceFee } = res.data || res.json;

      return {
        exchangeRates,
        averageTxFees,
        serviceFee,
      };
    } catch (err) {
      throw new Error('Failed fetch fee and exchange rates');
    }
  };

  public static getChallenge = async (
    appID: string,
    publicKey: string,
  ): Promise<{ challenge: string; expiresAt: string; publicId: string }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}/app/challenge`, {
        appID,
        publicKey,
      });
    } catch (err) {
      logger.error(err, err.response);
      if (err.response) {
        throw new Error(err.response.data.err);
      }
      if (err.code) {
        throw new Error(err.code);
      }
    }
    return res.data || res.json;
  };

  public static createNewApp = async (
    name = '',
    appID: string,
    publicId: string,
    publicKey: string,
    appType: string,
    network: string,
    fcmToken = '',
    signature: string,
  ): Promise<{ status: boolean; error?: string; app: TribeApp }> => {
    let res;
    try {
      res = await RestClient.post(`${RELAY}/app/new`, {
        name,
        appID,
        publicId,
        appType,
        network,
        fcmToken,
        signature,
        publicKey,
      });
    } catch (err) {
      logger.error(err, err.response?.data);
      if (err.response) {
        throw new Error(err.response.data.err);
      }
      if (err.code) {
        throw new Error(err.code);
      }
    }
    return res.data || res.json;
  };

  public static syncFcmToken = async (
    authToken: string,
    fcmToken: string,
  ): Promise<{ updated: boolean }> => {
    let res;
    try {
      res = await RestClient.post(
        `${RELAY}/app/syncfcm`,
        { fcmToken },
        { authorization: `Bearer ${authToken}` },
      );
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.err);
      }
      if (err.code) {
        throw new Error(err.code);
      }
    }
    return res.data || res.json;
  };

  public static createSupportedNode = async (): Promise<{}> => {
    try {
      let res;
      try {
        res = await RestClient.post(`${RELAY}/supported/new`, {});
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static getAssetIssuanceFee = async (): Promise<{
    address: string;
    fee: number;
    includeTxFee: number;
  }> => {
    try {
      const serviceFee = Storage.get(Keys.SERVICE_FEE);
      if (serviceFee) {
        return JSON.parse(serviceFee);
      }
      let res;
      try {
        res = await RestClient.get(`${RELAY}/servicefee/issuance`);
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static getAsset = async (
    assetId: string,
  ): Promise<{
    asset: Asset;
    status: boolean;
  }> => {
    try {
      const res = await RestClient.get(`${RELAY}/registry/asset/${assetId}`);
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static registerAsset = async (
    appID: string,
    asset: Asset,
  ): Promise<{ status: boolean }> => {
    try {
      let res;
      try {
        const formData = new FormData();
        formData.append('appID', appID);
        formData.append('network', 'regtest');
        formData.append('asset', JSON.stringify(asset));
        if (asset?.media) {
          formData.append('media', {
            uri: Platform.select({
              android: `file://${asset.media.filePath}`,
              ios: asset.media.filePath,
            }),
            name: `${Math.random()
              .toString(36)
              .substring(2, 11)}_${asset.media.filePath.split('/').pop()}`,
            type: asset.media.mime,
          });
        } else if (asset?.token?.media) {
          formData.append('media', {
            uri: Platform.select({
              android: `file://${asset.token.media.filePath}`,
              ios: asset.token.media.filePath,
            }),
            name: `${Math.random()
              .toString(36)
              .substring(2, 11)}_${asset.token.media.filePath
              .split('/')
              .pop()}`,
            type: asset.token.media.mime,
          });
        }
        if (asset?.token?.attachments) {
          asset.token.attachments.forEach(attachment => {
            formData.append('attachments', {
              uri: Platform.select({
                android: `file://${attachment.filePath}`,
                ios: attachment.filePath,
              }),
              name: `${Math.random()
                .toString(36)
                .substring(2, 11)}_${attachment.filePath.split('/').pop()}`,
              type: attachment.mime,
            });
          });
        }
        res = await RestClient.post(`${RELAY}/registry/add`, formData, {
          'Content-Type': 'multipart/form-data',
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static verifyIssuer = async (
    appID: string,
    assetId: string,
    issuer: {
      type: string;
      id: string;
      name: string;
      username: string;
      link: string;
    },
  ): Promise<{ status: boolean }> => {
    try {
      let res;
      try {
        res = await RestClient.post(`${RELAY}/registry/verifyissuer`, {
          appID,
          assetId,
          issuer,
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static getAssetsVerificationStatus = async (
    assetIds: string[],
  ): Promise<{
    status: boolean;
    records?: {
      assetId: string;
      issuer: {
        verified: boolean;
        verifiedBy: {
          type: string;
          name: string;
          id: string;
          username: string;
          link: string;
        }[];
      };
    }[];
    error?: string;
  }> => {
    try {
      let res;
      try {
        res = await RestClient.post(`${RELAY}/registry/getverificationstatus`, {
          assetIds,
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static registerIssuerDomain = async (
    appId: string,
    assetId: string,
    domain: string,
  ): Promise<{
    record: string;
    recordType: string;
    error: string;
    status: boolean;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}/registry/registerDomain/`, {
        appId,
        assetId,
        domain,
      });
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static verifyIssuerDomain = async (
    appId: string,
    assetId: string,
  ): Promise<{
    asset: Asset;
    error: string;
    status: boolean;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}/registry/verifyDomain/`, {
        appId,
        assetId,
      });
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static rgbFileBackup = async (
    filePath: string,
    appID: string,
    fingerprint: string,
  ): Promise<{ uploaded: boolean }> => {
    try {
      let res;
      try {
        const formData = new FormData();
        formData.append('appID', appID);
        formData.append('fingerprint', fingerprint);
        formData.append('file', {
          uri: filePath,
          name: filePath.split('/').pop(),
          type: 'application/zip',
        });
        res = await RestClient.post(`${RELAY}/backup/rgbbackup`, formData, {
          'Content-Type': 'multipart/form-data',
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static getBackup = async (
    appID: string,
  ): Promise<{
    error?: string;
    node?: {
      mnemonic: string;
      hash: string;
      isAllocated: boolean;
      _id: string;
      nodeId: string;
      invoke_url: string;
      status: string;
      initialized: boolean;
      name: string;
      network: string;
      port: number;
      peerDNS: string;
      peerPort: number;
    };
    nodeInfo?: {};
    token?: string;
    apiUrl?: string;
    peerDNS?: string;
    file?: string;
  }> => {
    try {
      let res;
      try {
        res = await RestClient.post(`${RELAY}/backup/getbackup`, {
          appID,
        });
      } catch (err) {
        if (err.response) {
          throw new Error(err.response.data.err);
        }
        if (err.code) {
          throw new Error(err.code);
        }
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };
}
