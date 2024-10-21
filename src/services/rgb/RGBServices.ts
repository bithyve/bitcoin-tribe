import { NativeModules } from 'react-native';
import { NetworkType } from '../wallets/enums';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import AppType from 'src/models/enums/AppType';
import { AssetSchema, OnChainApi, RGBApi } from '../rgbnode';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';

const { RGB } = NativeModules;
export const SATS_FOR_RGB = 9000;

export default class RGBServices {
  static NETWORK = NetworkType.TESTNET;

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
    config: any,
  ): Promise<{ created: boolean; error?: string }> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await new RGBApi(config).createutxosPost({
        feeRate: 5,
        num: 5,
        size: 1100,
        skipSync: false,
        upTo: false,
      });
      if (response.status === 200) {
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

  static syncRgbAssets = async (appType: AppType, config: any) => {
    if (appType === AppType.NODE_CONNECT) {
      await new RGBApi(config).refreshtransfersPostForm(false);
      const response = await new RGBApi(config).listassetsPost({
        filter_asset_schemas: [
          AssetSchema.Cfa,
          AssetSchema.Nia,
          AssetSchema.Uda,
        ],
      });
      if (response.status === 200) {
        const data = snakeCaseToCamelCaseCase(response.data);
        return data;
      } else {
        return response.data;
      }
    } else {
      const assets = await RGB.syncRgbAssets();
      return JSON.parse(assets);
    }
  };

  static receiveAsset = async (
    appType: AppType,
    config: any,
  ): Promise<{
    batchTransferIdx?: number;
    expirationTimestamp?: number;
    invoice?: string;
    recipientId?: string;
    error?: string;
  }> => {
    try {
      if (appType === AppType.NODE_CONNECT) {
        await new RGBApi(config).refreshtransfersPostForm(false);
        const response = await new RGBApi(config).rgbinvoicePost({
          assetId: '',
          minConfirmations: 0,
          durationSeconds: 86400,
        });
        console.log('ss', response.data);
        if (response.status === 200) {
          const data = snakeCaseToCamelCaseCase(response.data);
          return data;
        } else {
          return response.data;
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
    config: any,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await new RGBApi(config).assetm({
        asset_id: assetId,
      });
      if (response.status === 200) {
        const data = snakeCaseToCamelCaseCase(response.data.transfers);
        return data;
      } else {
        return response.data.transfers;
      }
    } else {
      const data = await RGB.getRgbAssetMetaData(assetId);
      return JSON.parse(data);
    }
  };

  static getRgbAssetTransactions = async (
    assetId: string,
    appType: AppType,
    config: any,
  ): Promise<{}[]> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await new RGBApi(config).listtransfersPost({
        asset_id: assetId,
      });
      if (response.status === 200) {
        const data = snakeCaseToCamelCaseCase(response.data.transfers);
        return data;
      } else {
        return response.data.transfers;
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
    config: any,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await new RGBApi(config).issueassetniaPost(
        {
          ticker,
          name,
          precision: 0,
          amounts: [Number(supply)],
        },
        {
          validateStatus: (status: number) => true,
        },
      );
      if (response.status === 200) {
        const data = snakeCaseToCamelCaseCase(response.data.asset);
        console.log(data);
        return data;
      } else {
        return response.data.asset;
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
  ): Promise<{}> => {
    const data = await RGB.issueRgb25Asset(name, description, supply, filePath);
    return JSON.parse(data);
  };

  static sendAsset = async (
    assetId: string,
    blindedUTXO: string,
    amount: string,
    consignmentEndpoints: string,
    feePerByte,
  ): Promise<{}> => {
    const data = await RGB.sendAsset(
      assetId,
      blindedUTXO,
      amount,
      consignmentEndpoints,
      feePerByte,
    );
    return JSON.parse(data);
  };

  static getUnspents = async (appType: AppType, config: any): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT) {
      const response = await new OnChainApi(config).listunspentsPost(
        { skip_sync: false },
        {
          validateStatus: (status: number) => true,
        },
      );
      if (response.status === 200) {
        const data = snakeCaseToCamelCaseCase(response.data.unspents);
        console.log(data);
        return data;
      } else {
        return response.data.error;
      }
    } else {
      const data = await RGB.getUnspents();
      return JSON.parse(data);
    }
  };

  static getBtcBalance = async (config: any) => {
    const response = await new OnChainApi(config).btcbalancePost(
      { skip_sync: false },
      {
        validateStatus: (status: number) => true,
      },
    );
    return response.data;
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
