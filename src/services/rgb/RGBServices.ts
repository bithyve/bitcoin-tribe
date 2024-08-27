import { NativeModules } from 'react-native';
import { NetworkType } from '../wallets/enums';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';

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
    return JSON.parse(keys);
  };

  static getAddress = async (): Promise<string> => {
    const address = await RGB.getAddress();
    return address;
  };

  static createUtxos = async (
    feePerByte,
  ): Promise<{ created: boolean; error: string }> => {
    const response = await RGB.createUtxos(feePerByte);
    return JSON.parse(response);
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

  static syncRgbAssets = async (): Promise<string> => {
    const assets = await RGB.syncRgbAssets();
    return JSON.parse(assets);
  };

  static receiveAsset = async (): Promise<{
    batchTransferIdx?: number;
    expirationTimestamp?: number;
    invoice?: string;
    recipientId?: string;
    error?: string;
  }> => {
    try {
      const data = await RGB.receiveAsset();
      return JSON.parse(data);
    } catch (error) {
      return {
        error: `${error}`,
      };
    }
  };

  static getRgbAssetMetaData = async (assetId: string): Promise<{}> => {
    const data = await RGB.getRgbAssetMetaData(assetId);
    return JSON.parse(data);
  };

  static getRgbAssetTransactions = async (assetId: string): Promise<{}[]> => {
    const data = await RGB.getRgbAssetTransactions(assetId);
    return JSON.parse(data);
  };

  static issueRgb20Asset = async (
    ticker: string,
    name: string,
    supply: string,
  ): Promise<{}> => {
    const data = await RGB.issueRgb20Asset(ticker, name, supply);
    return JSON.parse(data);
  };

  static issueRgb25Asset = async (
    name: string,
    description: string,
    supply: string,
    filePath: string,
  ): Promise<{}> => {
    const data = await RGB.issueRgb25Asset(description, name, supply, filePath);
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

  static getUnspents = async (): Promise<{}> => {
    const data = await RGB.getUnspents();
    return JSON.parse(data);
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
