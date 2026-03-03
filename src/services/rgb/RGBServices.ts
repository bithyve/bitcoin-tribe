import AppType from 'src/models/enums/AppType';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';
import { RLNNodeApiServices } from '../rgbnode/RLNNodeApi';
import config from 'src/utils/config';
import { 
  Orbis1SDK,
  BitcoinNetwork, 
  AssetSchema, 
  BtcBalance, 
  decodeInvoice, 
  InvoiceData, 
  Transaction, 
  Recipient, 
  Assignment, 
  Transfer, 
  RefreshFilter, 
  restoreBackup,
  LogLevel,
} from 'orbis1-sdk-rn';
import { NetworkType } from '../wallets/enums';
import * as RNFS from '@dr.pogodin/react-native-fs';

export default class RGBServices {
  private static sdk: Orbis1SDK | null = null;
  private static RGBWallet: any = null; // Will be the Wallet instance from SDK

  static getBitcoinNetwork = (): BitcoinNetwork => {
    switch (config.NETWORK_TYPE) {
      case NetworkType.MAINNET:
        return BitcoinNetwork.MAINNET;
      case NetworkType.TESTNET:
        return BitcoinNetwork.TESTNET;
      case NetworkType.REGTEST:
        return BitcoinNetwork.REGTEST;
      case NetworkType.TESTNET4:
        return BitcoinNetwork.TESTNET4;
      default:
        return BitcoinNetwork.TESTNET;
    }
  };

  static getElectrumUrl(network: BitcoinNetwork): string {
    return network === BitcoinNetwork.TESTNET ? "ssl://electrum.iriswallet.com:50013" : network === BitcoinNetwork.TESTNET4 ? "ssl://electrum.iriswallet.com:50053" : network === BitcoinNetwork.REGTEST ? "electrum.rgbtools.org:50041" : "ssl://electrum.iriswallet.com:50003";
  }


  static resetWallet = async (masterFingerprint: string): Promise<{ status: boolean, error?: string }> => {
    throw new Error('Not implemented');
    // const keys = await RGB.resetWallet(masterFingerprint);
    // return JSON.parse(keys);
  };

  static getAddress = async (): Promise<string> => {
    const address = await RGBServices.RGBWallet.getAddress();
    return address;
  };

  static createUtxos = async (
    feePerByte,
    appType: AppType,
    api: RLNNodeApiServices,
    num: number = 2,
    size: number = 1000,
    upTo: boolean = false,
  ): Promise<{ created: boolean; error?: string, count?: number }> => {
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
      const response = await RGBServices.RGBWallet.createUtxos(upTo, num, size, feePerByte, false);
      return { created: response > 0, count: response };
    }
  };

  static initiate = async (
    mnemonic: string,
    xpub: string,
    accountXpubVanilla: string,
    accountXpubColored: string,
    masterFingerprint: string,
  ): Promise<{
    status: boolean;
    error: string;
  }> => {
    try {
      const keys = {
        mnemonic: mnemonic,
        xpub: xpub,
        accountXpubVanilla: accountXpubVanilla,
        accountXpubColored: accountXpubColored,
        masterFingerprint: masterFingerprint,
      };
      
      // Determine environment based on network
      const network = this.getBitcoinNetwork();
      
      // Create SDK instance
      RGBServices.sdk = new Orbis1SDK({
        apiKey: config.ORBIS1_API_KEY, 
        wallet: {
          enabled: true,
          keys,
          network,
          supportedSchemas: [AssetSchema.CFA, AssetSchema.NIA, AssetSchema.UDA],
          maxAllocationsPerUtxo: 1,
          vanillaKeychain: 0,
        },
        features: {
          gasFree: { name: 'gasFree', enabled: false },
          watchTower: { name: 'watchTower', enabled: false },
        },
        logging: { level: LogLevel.ERROR },
      });
      
      // Initialize SDK
      await RGBServices.sdk.initialize();
      
      // Get wallet instance once and store it
      RGBServices.RGBWallet = RGBServices.sdk.getWallet();
      if (!RGBServices.RGBWallet) {
        throw new Error('Failed to get wallet from SDK');
      }
      
      // Connect wallet to Electrum
      await RGBServices.RGBWallet.goOnline(this.getElectrumUrl(this.getBitcoinNetwork()), false);
      
      return {
        status: true,
        error: '',
      };
    } catch (error) {
      return {
        status: false,
        error: `${error}`,
      };
    }
  };

  static goOnline = async (
    skipSync: boolean = false,
  ): Promise<{ status: boolean; error?: string }> => {
    try {
      await RGBServices.RGBWallet.goOnline(this.getElectrumUrl(this.getBitcoinNetwork()), skipSync);
      return { status: true };
    } catch (error) {
      return { status: false, error: `${error}` };
    }
  };

  static getBalance = async (): Promise<BtcBalance> => {
    const balance = await RGBServices.RGBWallet.getBtcBalance();
    return balance
  };

  static getTransactions = async (): Promise<Transaction[]> => {
    const txns = await RGBServices.RGBWallet.listTransactions(false);
    return txns;
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
      await RGBServices.RGBWallet.sync();
      const assets = await RGBServices.RGBWallet.listAssets([AssetSchema.NIA, AssetSchema.CFA, AssetSchema.UDA, AssetSchema.IFA]);
      return assets;
    }
  };

  static refresh = async ( appType: AppType, api: RLNNodeApiServices, assetId: string, filter: RefreshFilter[] ) => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      await api.refreshtransfers({ skip_sync: false });
    } else {
      await RGBServices.RGBWallet.refresh(assetId, filter, false);
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
        const data = await blinded ? RGBServices.RGBWallet.blindReceive(asset_id ? asset_id : null, {
          type: 'ANY',
          amount: amount,
        }, expiry, [config.PROXY_CONSIGNMENT_ENDPOINT], 0) : RGBServices.RGBWallet.witnessReceive(asset_id ? asset_id : null, {
          type: 'ANY',
          amount: amount,
        }, expiry, [config.PROXY_CONSIGNMENT_ENDPOINT], 0);
        return data;
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
      const data = await RGBServices.RGBWallet.getAssetMetadata(assetId);
      return data;
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
      }
      return [];
    } else {
      let data = await RGBServices.RGBWallet.listTransfers(assetId);
      data = data.map((transfer: Transfer) => {
        return {
          ...transfer,
          requestedAssignment: transfer?.requestedAssignment ? {
            amount: transfer.requestedAssignment.amount !== undefined 
              ? transfer.requestedAssignment.amount.toString() 
              : undefined,
            type: transfer.requestedAssignment.type,
          } : undefined,
          assignments: transfer?.assignments?.map((assignment: Assignment) => {
            return {
              amount: assignment?.amount !== undefined 
                ? assignment.amount.toString() 
                : undefined,
              type: assignment.type,
            };
          }),
        };
      });
      return data;
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
      const data = await RGBServices.RGBWallet.issueAssetNia(ticker, name, precision, [Number(supply)]);
      return data;
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
      // const responseDigest = await api.postassetmedia({ filePath });
      // if (responseDigest) {
      //   const response = await api.issueassetcfa({
      //     amounts: [Number(supply)],
      //     details: description,
      //     name,
      //     precision,
      //     file_digest: responseDigest.digest,
      //   });
      //   if (response) {
      //     const data = snakeCaseToCamelCaseCase(response);
      //     return data.asset ? data.asset : data;
      //   } else {
      //     return response;
      //   }
      // }
    } else {
      const data = await RGBServices.RGBWallet.issueAssetCfa(
        name,
        description,
        precision,
        [Number(supply)],
        filePath,
      );
      return data;
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
      const data = await RGBServices.RGBWallet.issueAssetUda(
        ticker,
        name,
        details,
        0,
        mediaFilePath,
        attachmentsFilePaths,
      );
      return data;
    }
  };

  static sendAsset = async (
    assetId: string,
    blindedUTXO: string,
    amount: number,
    consignmentEndpoints: string,
    feePerByte,
    isDonation: boolean,
    schema: string,
    witnessSats: number = 0,
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
      const recipientMap: Record<string, Recipient[]> = {
        [assetId]: [{
          recipientId: blindedUTXO,
          assignment: { type: schema.toUpperCase() === 'UDA' ? 'NON_FUNGIBLE' : 'FUNGIBLE', amount: amount },
          transportEndpoints: [consignmentEndpoints],
          ...(witnessSats > 0 ? {
            witnessData: {
              amountSat: witnessSats,
              blinding: null,
            },
          } : {}),
        }],
      };
      const data = await RGBServices.RGBWallet.send(
        recipientMap,
        isDonation,
        feePerByte,
        0,
        false,
      );
      return data;
    }
  };

  static getUnspents = async (
    appType: AppType,
    api: RLNNodeApiServices,
  ): Promise<{}> => {
    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      // const response = await api.listUnspents({ skip_sync: false });
      // if (response) {
      //   const data = snakeCaseToCamelCaseCase(response.unspents);
      //   return data;
      // } else {
      //   return response.error;
      // }
    } else {
      const data = await RGBServices.RGBWallet.listUnspents(false, false);
      return data
    }
  };

  /**
   * Set the status for eligible transfers to [`TransferStatus::Failed`]
   */
  static failTransfer = async (
    batchTransferIdx: number,
    noAssetOnly: boolean,
  ): Promise<{ status: boolean; error?: string }> => {
    const data = await RGBServices.RGBWallet.failTransfers(batchTransferIdx, noAssetOnly, false);
    return {
      status: data,
      error: undefined,
    }
  };

  /**
   * Delete eligible transfers from the database
   */
  static deleteransfer = async (
    batchTransferIdx: number,
    noAssetOnly: boolean,
  ): Promise<{ status: boolean; error?: string }> => {
    const data = await RGBServices.RGBWallet.deleteTransfers(batchTransferIdx, noAssetOnly);
    return {
      status: data,
      error: undefined,
    }
  };

  static getBtcBalance = async (api: RLNNodeApiServices) => {
    const response = await api.getBtcBalance({ skip_sync: false });
    return response;
  };

  static backup = async (
    path: string,
    password: string,
    publicId: string,
  ): Promise<{
    file: string;
    error?: string;
  }> => {
    const filePath = RNFS.DocumentDirectoryPath + `/${publicId}.rgb_backup`;
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
    await RGBServices.RGBWallet.backup(filePath, password);
    return { file: filePath };
  };

  static isBackupRequired = async (): Promise<{}> => {
    const data = await RGBServices.RGBWallet.backupInfo();
    return data;
  };

  static restore = async (mnemonic: string, filePath: string): Promise<{}> => {
    const data = await restoreBackup(mnemonic, filePath);
    return {};
  };


  static decodeInvoice = async (
    invoiceString: string,
  ): Promise<InvoiceData> => {
    const data = await decodeInvoice(invoiceString);
    return data
  };

  static getWalletData = async (): Promise<{
    dataDir: string;
    bitcoinNetwork: string;
    databaseType: string;
    maxAllocationsPerUtxo: number;
    accountXpubVanilla: string;
    accountXpubColored: string;
    mnemonic?: string;
    masterFingerprint: string;
    vanillaKeychain?: number;
    supportedSchemas: string[];
  }> => {
    const data = await RGBServices.RGBWallet.getWalletData();
    return data;
  };
}
