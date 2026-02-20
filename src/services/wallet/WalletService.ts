import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { WalletRepository } from 'src/repositories/WalletRepository';
import WalletOperations from 'src/services/wallets/operations';
import {
  AverageTxFees,
  TransactionPrerequisite,
} from 'src/services/wallets/interfaces';
import { TxPriority } from 'src/services/wallets/enums';
import { Keys, Storage } from 'src/storage';
import AppType from 'src/models/enums/AppType';
import ElectrumClient, { ELECTRUM_CLIENT } from 'src/services/electrum/client';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { TransactionKind } from 'src/services/wallets/enums';
import { RealmSchema } from 'src/storage/enum';
import { generateWallet } from 'src/services/wallets/factories/WalletFactory';
import { WalletType, DerivationPurpose, EntityKind } from 'src/services/wallets/enums';
import { DerivationConfig } from 'src/services/wallets/interfaces/wallet';
import config from 'src/utils/config';
import dbManager from 'src/storage/realm/dbManager';
import { generateEncryptionKey, encrypt } from 'src/utils/encryption';
import Relay from 'src/services/relay';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';


export class WalletService {
  private static instance: WalletService;
  private walletRepository: WalletRepository;

  private constructor() {
    this.walletRepository = WalletRepository.getInstance();
  }

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async createNewWallet({
    instanceNum = 0,
    walletName = 'Default Wallet',
    walletDescription = 'Default Tribe Wallet',
  }) {
    try {
      const { primaryMnemonic } = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
      const purpose = DerivationPurpose.BIP86; // Default: TAPROOT
      const accountNumber = 0;
      const path = WalletUtilities.getDerivationPath(
        EntityKind.WALLET,
        config.NETWORK_TYPE,
        accountNumber,
        purpose,
      );
      const derivationConfig: DerivationConfig = {
        path,
        purpose,
      };
      const wallet: Wallet = await generateWallet({
        type: WalletType.DEFAULT,
        instanceNum,
        walletName,
        walletDescription,
        derivationConfig,
        primaryMnemonic,
        networkType: config.NETWORK_TYPE,
      });
      if (wallet) {
        dbManager.createObject(RealmSchema.Wallet, wallet);
        return wallet;
      } else {
        throw new Error('Failed to create wallet');
      }
    } catch (err) {
      console.log({ err });
      throw err;
    }
  }

  /**
   * Refresh wallets balance and UTXOs
   */
  async refreshWallets(wallets: Wallet[], metaData: Object = null): Promise<void> {
    try {
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
      const NodeService = require('src/services/node/NodeService').NodeService; 
      const nodeService = NodeService.getInstance();

      if (
        app?.appType === AppType.NODE_CONNECT ||
        app?.appType === AppType.SUPPORTED_RLN
      ) {
         const balances = await nodeService.getBtcBalance();
         if (balances && balances.vanilla) {
             const rgbWallet = dbManager.getObjectByIndex(RealmSchema.RgbWallet) as any;
             dbManager.updateObjectByPrimaryId(RealmSchema.RgbWallet, 'mnemonic', rgbWallet.mnemonic, { nodeBtcBalance: balances });
         }
      } else {

        if (!ELECTRUM_CLIENT.isClientConnected) {
            // Re-using logic from ApiHandler:
            ElectrumClient.resetCurrentPeerIndex(); // Reset peer index
            const connectedInfo = await ElectrumClient.connect(); // Connect
            if (!connectedInfo.connected) {
                console.log('Node connection err: ', connectedInfo.error);
                return;
            } else {
                 console.log('Connected to: ', connectedInfo.connectedTo);
            }
        }
        
        const network = WalletUtilities.getNetworkByType(wallets[0].networkType);
        const { synchedWallets } = await WalletOperations.syncWalletsViaElectrumClient(wallets, network);

        for (const synchedWallet of synchedWallets) {
             if (metaData) {
                 const md = metaData;
                 synchedWallet.specs.transactions = synchedWallet.specs.transactions.map(tnx => 
                     md[tnx.txid] 
                     ? { ...tnx, metadata: { ...md[tnx.txid] }, transactionKind: TransactionKind.SERVICE_FEE }
                     : tnx
                 );
             }
             this.walletRepository.updateWallet(synchedWallet.id, { specs: synchedWallet.specs });
        }
      }
    } catch (err) {
      console.log('refreshWallets error', err);
      throw err;
    }
  }

  /**
   * Prepare On-Chain Transaction (Phase 1)
   */
  async prepareTransaction({
    sender,
    recipient,
    averageTxFee,
    selectedPriority,
  }: {
    sender: Wallet;
    recipient: { address: string; amount: number };
    averageTxFee: AverageTxFees;
    selectedPriority: TxPriority;
  }): Promise<TransactionPrerequisite> {
    const recipients = [recipient];
    const { txPrerequisites } = await WalletOperations.transferST1(
      sender,
      recipients,
      averageTxFee,
      selectedPriority,
    );
    return txPrerequisites;
  }

  /**
   * Broadcast On-Chain Transaction (Phase 2)
   */
  async broadcastTransaction({
    sender,
    recipient,
    txPrerequisites,
    txPriority,
  }: {
    sender: Wallet;
    recipient: { address: string; amount: number };
    txPrerequisites: TransactionPrerequisite;
    txPriority: TxPriority;
  }): Promise<{ txid: string; txPrerequisites?: TransactionPrerequisite }> {
    const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
    
    if (
      app?.appType === AppType.NODE_CONNECT ||
      app?.appType === AppType.SUPPORTED_RLN
    ) {

       const { NodeService } = require('src/services/node/NodeService');
       const nodeService = NodeService.getInstance();
       const averageTxFeeJSON = Storage.get(Keys.AVERAGE_TX_FEE_BY_NETWORK);
       if(!averageTxFeeJSON) throw new Error("Average Tx Fee not found");
       const averageTxFeeByNetwork = JSON.parse(averageTxFeeJSON);
       const averageTxFee: AverageTxFees = averageTxFeeByNetwork[config.NETWORK_TYPE];
       
       const api = nodeService.getApi();
       if(!api) throw new Error("Node API not available");

       const response = await api.sendBTCTransaction({
          amount: recipient.amount,
          address: recipient.address,
          fee_rate: String(averageTxFee[txPriority].averageTxFee),
          skip_sync: false,
       });

       if (response) {
          const feeEstimate = await api.estimateFee({ blocks: 7 });
          return {
            txid: response.txid,
            txPrerequisites: feeEstimate,
          };
        } else {
          throw new Error('Failed to connect to node');
        }
    } else {
       const { txid } = await WalletOperations.transferST2(
        sender,
        txPrerequisites,
        txPriority,
        [recipient],
       );

       if (txid) {
         this.walletRepository.updateWallet(sender.id, { specs: sender.specs });
         return { txid };
       } else {
         throw new Error('Failed to execute the transaction');
       }
    }
  }


  /**
   * Get Node Onchain BTC Transactions
   */
  async getNodeOnchainBtcTransactions(): Promise<any> {
    const { NodeService } = require('src/services/node/NodeService');
    return await NodeService.getInstance().getNodeOnchainBtcTransactions();
  }

  async receiveTestSats(): Promise<any> {
    try {
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
      
      if (app?.appType === AppType.NODE_CONNECT || app?.appType === AppType.SUPPORTED_RLN) {
        const { NodeService } = require('src/services/node/NodeService');
        const response = await NodeService.getInstance().getNodeOnchainBtcAddress();
        if (response.address) {
          const { funded } = await Relay.getTestcoins(
            response.address,
            config.NETWORK_TYPE,
          );
          if (!funded) {
            throw new Error('Failed to get test coins');
          }
          // Refresh wallets
          await this.refreshWallets([]);
        } else {
          throw new Error('Failed to get test coins');
        }
      } else {
        const wallet = dbManager.getObjectByIndex(RealmSchema.Wallet) as any;
        const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
        const { funded } = await Relay.getTestcoins(
          receivingAddress,
          wallet.networkType,
        );
        if (!funded) {
          throw new Error('Failed to get test coins');
        }
        await this.refreshWallets([wallet]);
      }
    } catch (error) {
      console.log({ error });
      throw new Error('Failed to get test coins');
    }
  }

  async updateTransaction({
    txid,
    updateProps,
  }: {
    txid: string;
    updateProps: {};
  }): Promise<boolean> {
    try {
      const walletObj: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
      const transactions = walletObj.specs.transactions;
      const index = transactions.findIndex((tx: any) => tx.txid === txid);
      if (index !== -1) {
          transactions[index] = {
            ...transactions[index],
            ...updateProps,
          };

          dbManager.updateObjectByPrimaryId(RealmSchema.Wallet, 'id', walletObj.id, {
            specs: {
              transactions: transactions,
              ...walletObj.specs,
            },
          });

          this.backupAppImage({
            tnxMeta: {
              txid,
              // @ts-ignore
              metaData: transactions[index].metadata,
            },
          });
          return true;
      }
      return false;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }

  async backupAppImage({
    settings = false,
    room = null,
    all = false,
    tnxMeta = null,
  }: {
    settings?: boolean;
    room?: null | any;
    all?: boolean;
    tnxMeta?: null | { txid: string; metaData: object };
  }) {
    Storage.set(Keys.IS_APP_IMAGE_BACKUP_ERROR, false);
    try {
      const app: any = dbManager.getCollection(RealmSchema.TribeApp)[0];
      const encryptionKey = generateEncryptionKey(app.primaryMnemonic);
      let settingsObject: any = '';
      let roomsObject: any = {};
      let tnxMetaObject: any = {};

      if (all || settings) {
        const keys = [Keys.APP_CURRENCY, Keys.APP_LANGUAGE, Keys.CURRENCY_MODE];

        settingsObject = Object.fromEntries(
          keys
            .map(key => [key, Storage.get(key)])
            .filter(([, value]) => value !== undefined && value !== null),
        );
        settingsObject = encrypt(encryptionKey, JSON.stringify(settingsObject));
      }

      if (all) {
        const rooms = dbManager.getCollection(RealmSchema.HolepunchRoom);
        for (const index in rooms) {
          const room = rooms[index] as any;
          const encryptedRoom = encrypt(encryptionKey, JSON.stringify(room));
          const encryptedRoomId = encrypt(encryptionKey, room.roomId);
          roomsObject[encryptedRoomId] = encryptedRoom;
        }

        const transactions = (getJSONFromRealmObject(
          dbManager.getObjectByIndex(RealmSchema.Wallet),
        ) as any).specs?.transactions;
        for (const tnx of transactions) {
          if (Object.keys(tnx.metadata).length) {
            const encryptedMeta = encrypt(
              encryptionKey,
              JSON.stringify(tnx.metadata),
            );
            tnxMetaObject[tnx.txid] = encryptedMeta;
          }
        }
      } else {
        if (room) {
          const encryptedRoom = encrypt(encryptionKey, JSON.stringify(room));
          const encryptedRoomId = encrypt(encryptionKey, room.roomId);
          roomsObject[encryptedRoomId] = encryptedRoom;
        }
        if (tnxMeta?.txid && tnxMeta?.metaData) {
          const encryptedMeta = encrypt(
            encryptionKey,
            JSON.stringify(tnxMeta.metaData),
          );
          tnxMetaObject[tnxMeta.txid] = encryptedMeta;
        }
      }

      await Relay.createAppImageBackup(
        app.authToken,
        roomsObject,
        settingsObject,
        tnxMetaObject,
      );
      return {
        status: true,
        message: 'App image backup created successfully',
      };
    } catch (err) {
      Storage.set(Keys.IS_APP_IMAGE_BACKUP_ERROR, true);
      console.log('🚀 ~ WalletService ~ backupAppImage ~ err:', err);
      return {
        status: false,
        message: 'App image backup failed',
      };
    }
  }

  async getFeeAndExchangeRates() {

    try {
        // Need Relay import
        const { exchangeRates, serviceFee } = await require('src/services/relay').default.fetchFeeAndExchangeRates();
        Storage.set(
            Keys.EXCHANGE_RATES,
            JSON.stringify(exchangeRates.exchangeRates),
        );
        if (serviceFee) {
            Storage.set(Keys.SERVICE_FEE, JSON.stringify(serviceFee));
        }
        // await ApiHandler.getTxRates(); // This calls api.estimateFee?
        // WalletOperations.calculateAverageTxFee? 
        // ApiHandler.getTxRates calculates fees. 
        // Need to check getTxRates implementation. 
        // For now, let's omit or comment out until checked.
        // Or assume WalletOperations handles it.
        // Actually ApiHandler.getTxRates calls WalletOperations.calculateAverageTxFee().
        await WalletOperations.calculateAverageTxFee().then(averageTxFeeByNetwork => {
            Storage.set(
                Keys.AVERAGE_TX_FEE_BY_NETWORK,
                JSON.stringify(averageTxFeeByNetwork),
            );
        });
    } catch(e) {
        console.log("getFeeAndExchangeRates error", e);
    }
  }

  async updateProfile(appId: string, name: string, image: any) {
    try {
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
      const response = await Relay.updateApp(
        appId,
        name,
        image,
        app.authToken,
      );
      if (response.updated) {
        dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appId, {
          appName: name,
          walletImage: response.imageUrl,
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async removeWalletPicture(appId: string) {
    try {
      const app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as any;
      const response = await Relay.removeWalletPicture(
        app.authToken,
        appId,
      );
      if (response.success) {
        dbManager.updateObjectByPrimaryId(RealmSchema.TribeApp, 'id', appId, {
          walletImage: null,
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
}

