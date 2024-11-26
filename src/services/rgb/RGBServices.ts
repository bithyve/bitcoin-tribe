import { NativeModules } from 'react-native';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';
import { RLNNodeApiServices } from '../rgbnode/RLNNodeApi';
import config from 'src/utils/config';

const { RGB } = NativeModules;

export default class RGBServices {
  static NETWORK = config.NETWORK_TYPE;

  static generateKeys = async (): Promise<RGBWallet> => {
    const keys = await RGB.generateKeys(this.NETWORK);
    return JSON.parse(keys);
  };

  static restoreKeys = async (mnemonic: string): Promise<RGBWallet> => {
    const keys = await RGB.restoreKeys(this.NETWORK, mnemonic);
    console.log('keys', keys);
    return JSON.parse(keys);
  };

  static getAddress = async (): Promise<string> => {
    const address = await RGB.getAddress();
    return address;
  };

  static createUtxos = async (
    feePerByte,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{ created: boolean; error?: string }> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await api.createutxos({
        fee_rate: 5,
        num: 5,
        size: 1100,
        skip_sync: false,
        up_to: false,
      });
      if (response) {
        return { created: true };
      }
      return { created: false };
    } else {
      const response = await RGB.createUtxos(feePerByte);
      return JSON.parse(response);
    }
  };

  static initiate = async (
    mnemonic: string,
    pubKey: string,
  ): Promise<string> => {
    try {
      const data = await RGB.initiate(this.NETWORK, mnemonic, pubKey);
      return JSON.parse(data);
    } catch (error) {
      return `${error}`;
    }
  };

  static getBalance = async (mnemonic: string): Promise<string> => {
    const balance = await RGB.getBalance(mnemonic, this.NETWORK);
    return JSON.parse(balance);
  };

  static getTransactions = async (mnemonic: string): Promise<[]> => {
    const txns = await RGB.getTransactions(mnemonic, this.NETWORK);
    return JSON.parse(txns);
  };

  static sync = async (mnemonic: string): Promise<string> => {
    const isSynched = await RGB.sync(mnemonic, this.NETWORK);
    return isSynched;
  };

  static syncRgbAssets = async (appType: AppType, api: RLNNodeApiServices) => {
    if (appType === AppType.NODE_CONNECT) {
      await api.refreshtransfers({ skip_sync: false });
      const response = await api.listassets({
        filter_asset_schemas: ['Nia', 'Cfa'],
      });
      if (response) {
        const data = snakeCaseToCamelCaseCase(response);
        return data;
      } else {
        return response;
      }
    } else {
      const assets = await RGB.syncRgbAssets();
      return JSON.parse(assets);
    }
  };

  static receiveAsset = async (
    appType: AppType,
    api: RLNNodeApiServices,
    asset_id?: string,
  ): Promise<{
    batchTransferIdx?: number;
    expirationTimestamp?: number;
    invoice?: string;
    recipientId?: string;
    error?: string;
  }> => {
    try {
      if (appType === AppType.NODE_CONNECT) {
        await api.refreshtransfers({ skip_sync: false });
        const response = await api.rgbinvoice({
          //asset_id,
          min_confirmations: 0,
          duration_seconds: 86400,
        });
        if (response) {
          const data = snakeCaseToCamelCaseCase(response);
          return data;
        } else {
          return response;
        }
      } else {
        const data = await RGB.receiveAsset();
        return JSON.parse(data);
      }
    } catch (error) {
      return {
        error: `${error}`,
      };
    }
  };

  static getRgbAssetMetaData = async (
    assetId: string,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await api.assetmetadata({
        asset_id: assetId,
      });
      if (response) {
        const data = snakeCaseToCamelCaseCase(response);
        return data;
      } else {
        return response;
      }
    } else {
      const data = await RGB.getRgbAssetMetaData(assetId);
      return JSON.parse(data);
    }
  };

  static getRgbAssetTransactions = async (
    assetId: string,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}[]> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await api.listtransfers({ asset_id: assetId });
      if (response) {
        const data = snakeCaseToCamelCaseCase(response.transfers.reverse());
        return data;
      } else {
        return response;
      }
    } else {
      const data = await RGB.getRgbAssetTransactions(assetId);
      return JSON.parse(data);
    }
  };

  static issueRgb20Asset = async (
    ticker: string,
    name: string,
    supply: string,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await api.issueassetnia({
        ticker,
        name,
        precision: 0,
        amounts: [Number(supply)],
      });
      if (response) {
        const data = snakeCaseToCamelCaseCase(response);
        return data;
      } else {
        return response;
      }
    } else {
      const data = await RGB.issueRgb20Asset(ticker, name, supply);
      return JSON.parse(data);
    }
  };

  static issueRgb25Asset = async (
    name: string,
    description: string,
    supply: string,
    filePath: string,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const responseDigest = await api.postassetmedia({ filePath });
      if (responseDigest) {
        const response = await api.issueassetcfa({
          amounts: [Number(supply)],
          details: description,
          name,
          precision: 0,
          file_digest: responseDigest.digest,
        });
        if (response) {
          const data = snakeCaseToCamelCaseCase(response);
          return data.asset ? data.asset : data;
        } else {
          return response;
        }
      }
    } else {
      const data = await RGB.issueRgb25Asset(
        name,
        description,
        supply,
        filePath,
      );
      return JSON.parse(data);
    }
  };

  static sendAsset = async (
    assetId: string,
    blindedUTXO: string,
    amount: string,
    consignmentEndpoints: string,
    feePerByte,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await api.sendasset({
        asset_id: assetId,
        donation: false,
        fee_rate: feePerByte,
        min_confirmations: 0,
        recipient_id: blindedUTXO,
        transport_endpoints: [consignmentEndpoints],
        amount: Number(amount),
        skip_sync: false,
      });
      return response;
    } else {
      const data = await RGB.sendAsset(
        assetId,
        blindedUTXO,
        amount,
        consignmentEndpoints,
        feePerByte,
      );
      return JSON.parse(data);
    }
  };

  static getUnspents = async (
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await api.listUnspents({ skip_sync: false });
      if (response) {
        const data = snakeCaseToCamelCaseCase(response.unspents);
        return data;
      } else {
        return response.error;
      }
    } else {
      const data = await RGB.getUnspents();
      return JSON.parse(data);
    }
  };

  static getBtcBalance = async (api: RLNNodeApiServices) => {
    const response = await api.getBtcBalance({ skip_sync: false });
    return response;
  };

  static backup = async (path: string, password: string): Promise<string> => {
    const data = await RGB.backup(path, password);
    return JSON.parse(data);
  };

  static isBackupRequired = async (): Promise<{}> => {
    const data = await RGB.isBackupRequired();
    return data;
  };

  static restore = async (mnemonic: string): Promise<{}> => {
    const data = await RGB.restore(mnemonic);
    return data;
  };

  static isValidBlindedUtxo = async (invoiceData: string): Promise<{}> => {
    const data = await RGB.isValidBlindedUtxo(invoiceData);
    return data;
  };
}
