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
    return JSON.parse(keys);
  };

  static getAddress = async (): Promise<string> => {
    const address = await RGB.getAddress();
    return address;
  };

  static getRgbDir = async (): Promise<{
    dir?: string,
    error?: string,
  }> => {
    const address = await RGB.getRgbDir();
    return JSON.parse(address);
  };

  static createUtxosBegin = async (
    upTo: boolean,
    num: Number,
    size: Number,
    feeRate: Number,
    skipSync: boolean,
  ): Promise<{ unsignedPsbt: string; error?: string }> => {
    const response = await RGB.createUtxosBegin(
      upTo,
      num,
      size,
      feeRate,
      skipSync,
    );
    return JSON.parse(response);
  };

  static signPsbt = async (
    unsignedPsbt: string,
  ): Promise<{ signedPsbt: string; error?: string }> => {
    const response = await RGB.signPsbt(unsignedPsbt);
    return JSON.parse(response);
  };

  static createUtxosEnd = async (
    signedPsbt: string,
    skipSync: boolean,
  ): Promise<{ num: Number; error?: string }> => {
    const response = await RGB.createUtxosEnd(signedPsbt, skipSync);
    return JSON.parse(response);
  };

  static createUtxos = async (
    feePerByte,
    appType: AppType,
    api: RLNNodeApiServices,
    num: number = 2,
    size: number = 1000,
    upTo: boolean = false,
  ): Promise<{ created: boolean; error?: string }> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      const response = await api.createutxos({
        fee_rate: 5,
        num,
        size,
        skip_sync: false,
        up_to: upTo,
      });
      if (response) {
        return { created: true };
      }
      return { created: false };
    } else {
      const response = await RGB.createUtxos(feePerByte, num, size, upTo);
      return JSON.parse(response);
    }
  };

  static initiate = async (
    mnemonic: string,
    accountXpubVanilla: string,
    accountXpubColored: string,
    masterFingerprint: string,
  ): Promise<{
    status: boolean;
    error: string;
  }> => {
    try {
      const data = await RGB.initiate(
        this.NETWORK,
        mnemonic,
        accountXpubVanilla,
        accountXpubColored,
        masterFingerprint,
      );
      return JSON.parse(data);
    } catch (error) {
      return {
        status: false,
        error: `${error}`,
      };
    }
  };

  static getBalance = async (): Promise<string> => {
    const balance = await RGB.getBtcBalance();
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
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
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
    amount?: number,
    expiry?: number,
    blinded?: boolean,
  ): Promise<{
    batchTransferIdx?: number;
    expirationTimestamp?: number;
    invoice?: string;
    recipientId?: string;
    error?: string;
  }> => {
    try {
      if (
        appType === AppType.NODE_CONNECT ||
        appType === AppType.SUPPORTED_RLN
      ) {
        await api.refreshtransfers({ skip_sync: false });
        const response = await api.rgbinvoice({
          //asset_id,
          min_confirmations: 0,
          duration_seconds: expiry,
        });
        if (response) {
          const data = snakeCaseToCamelCaseCase(response);
          return data;
        } else {
          return response;
        }
      } else {
        const data = await RGB.receiveAsset(asset_id, amount, expiry, blinded);
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
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
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
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
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

  static issueAssetNia = async (
    ticker: string,
    name: string,
    supply: string,
    precision: number,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
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
      const data = await RGB.issueAssetNia(ticker, name, supply, precision);
      return JSON.parse(data);
    }
  };

  static issueAssetCfa = async (
    name: string,
    description: string,
    supply: string,
    precision: number,
    filePath: string,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      const responseDigest = await api.postassetmedia({ filePath });
      if (responseDigest) {
        const response = await api.issueassetcfa({
          amounts: [Number(supply)],
          details: description,
          name,
          precision,
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
      const data = await RGB.issueAssetCfa(
        name,
        description,
        supply,
        precision,
        filePath,
      );
      return JSON.parse(data);
    }
  };

  static issueAssetUda = async (
    name: string,
    ticker: string,
    details: string,
    mediaFilePath: string,
    attachmentsFilePaths: string[],
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      // todo
    } else {
      const data = await RGB.issueAssetUda(
        name,
        ticker,
        details,
        mediaFilePath,
        attachmentsFilePaths,
      );
      return JSON.parse(data);
    }
  };

  static sendAsset = async (
    assetId: string,
    blindedUTXO: string,
    amount: number,
    consignmentEndpoints: string,
    feePerByte,
    isDonation: boolean,
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      const response = await api.sendasset({
        asset_id: assetId,
        donation: isDonation,
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
        isDonation,
      );
      return JSON.parse(data);
    }
  };

  static getUnspents = async (
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
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

  /**
   * Set the status for eligible transfers to [`TransferStatus::Failed`]
   */
  static failTransfer = async (
    batchTransferIdx: Number,
    noAssetOnly: boolean,
  ): Promise<{ status: boolean; error?: string }> => {
    const keys = await RGB.failTransfer(batchTransferIdx, noAssetOnly);
    return JSON.parse(keys);
  };

  /**
   * Delete eligible transfers from the database
   */
  static deleteransfer = async (
    batchTransferIdx: Number,
    noAssetOnly: boolean,
  ): Promise<{ status: boolean; error?: string }> => {
    const keys = await RGB.deleteransfer(batchTransferIdx, noAssetOnly);
    return JSON.parse(keys);
  };

  static getBtcBalance = async (api: RLNNodeApiServices) => {
    const response = await api.getBtcBalance({ skip_sync: false });
    return response;
  };

  static backup = async (
    path: string,
    password: string,
  ): Promise<{
    file: string;
    error?: string;
  }> => {
    const data = await RGB.backup(path, password);
    return JSON.parse(data);
  };

  static isBackupRequired = async (): Promise<{}> => {
    const data = await RGB.isBackupRequired();
    return data;
  };

  static restore = async (mnemonic: string, filePath: string): Promise<{}> => {
    const data = await RGB.restore(mnemonic, filePath);
    return JSON.parse(data);
  };

  static isValidBlindedUtxo = async (invoiceData: string): Promise<{}> => {
    const data = await RGB.isValidBlindedUtxo(invoiceData);
    return data;
  };

  static decodeInvoice = async (
    invoiceString: string,
  ): Promise<{
    recipientId?: string;
    expirationTimestamp?: number;
    assetId?: string;
    assetSchema?: string;
    network?: string;
    transportEndpoints?: string;
    error?: string;
  }> => {
    const data = await RGB.decodeInvoice(invoiceString);
    return JSON.parse(data);
  };

  static getWalletData = async (): Promise<{
    dataDir?: string;
    bitcoinNetwork?: string;
    databaseType?: string;
    maxAllocationsPerUtxo?: string;
    mnemonic?: string;
    pubkey?: string;
    vanillaKeychain?: string;
  }> => {
    const data = await RGB.getWalletData();
    return JSON.parse(data);
  };
}
