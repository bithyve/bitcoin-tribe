import config from 'src/utils/config';
import RestClient from '../rest/RestClient';
import { NetworkType } from '../wallets/enums';
import { AverageTxFeesByNetwork } from '../wallets/interfaces';
import { Asset, Coin } from 'src/models/interfaces/RGBWallet';
import { Platform } from 'react-native';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { Storage, Keys } from 'src/storage';
import { Asset as ImageAsset } from 'react-native-image-picker';

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
      console.log(error);
      throw new Error(error);
    }
  };

  public static getPresetAssets = async (): Promise<{ coins: Coin[] }> => {
    try {
      const res = await RestClient.get(`${RELAY}/app/preset-assets`);
      return res.data;
    } catch (error) {
      console.log(error);
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
      console.log(err, err.response);
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
    walletImage: ImageAsset | null,
    contactKey: string,
  ): Promise<{ status: boolean; error?: string; app: TribeApp }> => {
    let res;
    try {
      const formData = new FormData();
      if(walletImage){
        formData.append('file', {
          uri: walletImage.uri,
          name: walletImage.fileName,
          type: walletImage.type,
        });
      }
      formData.append('name', name);
      formData.append('appID', appID);
      formData.append('publicId', publicId);
      formData.append('publicKey', publicKey);
      formData.append('appType', appType);
      formData.append('network', network);
      formData.append('fcmToken', fcmToken);
      formData.append('signature', signature);
      formData.append('contactKey', contactKey);
      res = await RestClient.post(`${RELAY}/app/new`, formData, {
        'Content-Type': 'multipart/form-data',
      });
    } catch (err) {
      console.log(err, err.response.data);
      if (err.response) {
        throw new Error(err.response.data.err);
      }
      if (err.code) {
        throw new Error(err.code);
      }
    }
    return res.data || res.json;
  };

  public static updateApp = async (
    appID: string,
    name: string,
    walletImage: ImageAsset | null,
    authToken: string,
  ): Promise<{ updated: boolean; error?: string; imageUrl: string }> => {
    let res;
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('appID', appID);
      if(walletImage){
        formData.append('file', {
          uri: walletImage.uri,
          name: walletImage.fileName,
          type: walletImage.type,
        });
      }
      res = await RestClient.put(`${RELAY}/app/update`, formData, {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      });
    } catch (err) {
      console.log(err, err.response.data);
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
        { Authorization: `Bearer ${authToken}` },
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

  public static getNodeById = async (
    nodeId: string,
    authToken: string,
  ): Promise<{}> => {
    try {
      let res;
      try {
        res = await RestClient.get(`${RELAY}/supported/node/${nodeId}`, {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        });
      } catch (err) {
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response body:', err.response.data);
          throw new Error(
            err.response.data.err || 'Server responded with an error',
          );
        }
        if (err.code) {
          throw new Error(err.code);
        }
        throw err;
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };
  public static startNodeById = async (
    nodeId: string,
    authToken: string,
  ): Promise<{}> => {
    try {
      let res;
      try {
        res = await RestClient.get(`${RELAY}/supported/node/${nodeId}/start`, {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        });
      } catch (err) {
        if (err.response) {
          throw new Error(
            err.response.data.err || 'Server responded with an error',
          );
        }
        if (err.code) {
          throw new Error(err.code);
        }
        throw err;
      }
      return res.data || res.json;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static saveNodeMnemonic = async (
    nodeId: string,
    authToken: string,
  ): Promise<{
    status: string;
    mnemonic?: string;
    peerUrl?: string;
  } | null> => {
    try {
      const node: any = await Relay.getNodeById(nodeId, authToken);
      const status = node?.node?.status || node?.nodeInfo?.data?.status;
      const fetchedMnemonic = node?.node?.mnemonic;
      const peerDNS = node?.node?.peerDNS;
      const peerPort = node?.node?.peerPort;
      const peerUrl = `${peerDNS}:${peerPort}`;
      return { status, mnemonic: fetchedMnemonic, peerUrl };
    } catch (err) {
      console.error('Error fetching node status:', err);
      return null;
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
        formData.append('network', config.NETWORK_TYPE.toString());
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
      const errMsg =
        err?.response?.data?.err ||
        err?.code ||
        err?.message ||
        'Asset registration failed';
      throw new Error(errMsg);
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
      iconUrl?: string;
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

  public static registryAssetSearch = async (
    query: string,
  ): Promise<{
    asset: Asset;
    error: string;
    status: boolean;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}/registry/search`, {
        query,
      });
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static getWalletProfiles = async (
    contactKeys: string[],
  ): Promise<{
    results: {
      contactKey: string;
      appID: string;
      name: string;
      imageUrl: string;
    }[];
    error: string;
    status: boolean;
  }> => {
    try {
      const res = await RestClient.post(`${RELAY}/app/getWalletProfiles`, {
        contactKeys,
      });
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static getPeerMessages = async (
    contactKey: string,
    from: number,
  ): Promise<{
    messages: {
      message: string;
      timestamp: number;
      blockNumber: number;
    }[];
    error: string;
    status: boolean;
  }> => {
    try {
      const res = await RestClient.get(`${RELAY}/chat/getmessages?publicKey=${contactKey}&from=${from}`);
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  public static uploadFile = async (
    file: ImageAsset,
    authToken: string,
  ): Promise<{
    fileUrl: string;
    error: string;
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.fileName,
        type: file.type,
      });
      const res = await RestClient.post(`${RELAY}/chat/uploadfile`, formData, {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      });
      return res.data;
    } catch (err) {
      throw new Error(err);
    }
  };
}
