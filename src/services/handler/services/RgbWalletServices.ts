import { Platform } from 'react-native';
import Realm from 'realm';
import * as RNFS from '@dr.pogodin/react-native-fs';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import RGBServices from 'src/services/rgb/RGBServices';
import Relay from 'src/services/relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { Keys, Storage } from 'src/storage';
import {
  Asset,
  AssetSchema,
  Coin,
  Collectible,
  Collection,
  InvoiceType,
  IssuerVerificationMethod,
  RGBWallet,
  UniqueDigitalAsset,
} from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import AppType from 'src/models/enums/AppType';
import { RLNNodeApiServices } from 'src/services/rgbnode/RLNNodeApi';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';
import { hexToBase64 } from 'src/utils/hexToBase64';
import { ServiceFeeType } from 'src/models/interfaces/Transactions';
import { urlParamsToObject } from 'src/utils/url';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { TransactionKind } from 'src/services/wallets/enums';
import DeepLinking, {
  DeepLinkFeature,
  DeepLinkType,
} from 'src/utils/DeepLinking';
import { fetchAndVerifyTweet } from 'src/services/twitter';
import Toast from 'src/components/Toast';
import { RgbLibErrors } from 'orbis1-sdk-rn';
import { createUtxos, updateTransaction, viewUtxos } from './WalletServices';
import { backup, backupAppImage } from './backupService';

function getTribeApp(): TribeApp {
  return dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
}

function getRgbWallet(): RGBWallet {
  return dbManager.getObjectByIndex(RealmSchema.RgbWallet) as RGBWallet;
}

function getAppType(): AppType {
  return getTribeApp().appType;
}

function getNodeApi(): RLNNodeApiServices {
  const rgbWallet = getRgbWallet();
  return new RLNNodeApiServices({
    baseUrl: rgbWallet.nodeUrl,
    apiKey: rgbWallet.nodeAuthentication,
  });
}

function getRgbContext(): { appType: AppType; api?: RLNNodeApiServices } {
  const appType = getAppType();
  if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
    return { appType, api: getNodeApi() };
  }
  return { appType };
}

function scheduleInvoicesCloudBackup() {
  backupAppImage({ invoices: true }).catch(e =>
    console.log('backupAppImage invoices', e),
  );
}

function shouldBackupAfterAssetSync(assets: any): boolean {
  let shouldBackup = false;
  const balanceKey = (b?: any) =>
    b
      ? `${b.settled ?? ''}|${b.spendable ?? ''}|${b.future ?? ''}|${b.offchainOutbound ?? ''}|${b.offchainInbound ?? ''}`
      : '';

  const checkAssetForBackup = (
    schema: RealmSchema,
    asset: { assetId: string; balance?: any },
  ) => {
    if (shouldBackup || !asset?.assetId) return;
    const existing = dbManager.getObjectByPrimaryId(schema, 'assetId', asset.assetId);
    if (!existing) {
      shouldBackup = true;
      return;
    }
    const existingKey = balanceKey((existing as any).balance);
    const incomingKey = balanceKey(asset.balance);
    if (existingKey !== incomingKey) {
      shouldBackup = true;
    }
  };

  const getCollectionIdFromUdaDetails = (uda: any): string | undefined => {
    if (shouldBackup) return;
    const details = uda?.details;
    if (typeof details !== 'string') return;
    if (!details.includes(DeepLinking.appLinkScheme)) return;

    const deepLinking = DeepLinking.processDeepLink(
      DeepLinking.appLinkScheme + details.split(DeepLinking.appLinkScheme)[1],
    );
    if (!deepLinking?.isValid) return;

    if (deepLinking.feature === DeepLinkFeature.COLLECTION) {
      return deepLinking.params?.id;
    }
    if (deepLinking.feature === DeepLinkFeature.COLLECTION_ITEM) {
      return deepLinking.params?.collectionId;
    }
    return;
  };

  const checkCollectionForBackup = (collectionId: string, uda: any) => {
    if (shouldBackup || !collectionId) return;
    const existingCollection = dbManager.getObjectByPrimaryId(
      RealmSchema.Collection,
      '_id',
      collectionId,
    );
    if (!existingCollection) {
      shouldBackup = true;
      return;
    }
    const existingKey = balanceKey((existingCollection as any).balance);
    const incomingKey = balanceKey(uda?.balance);
    if (existingKey !== incomingKey) {
      shouldBackup = true;
    }
  };

  if (assets?.nia && Array.isArray(assets.nia)) {
    for (const coin of assets.nia) {
      checkAssetForBackup(RealmSchema.Coin, coin);
      if (shouldBackup) return true;
    }
  }
  if (assets?.ifa && Array.isArray(assets.ifa)) {
    for (const ifa of assets.ifa) {
      checkAssetForBackup(RealmSchema.IFA, ifa);
      if (shouldBackup) return true;
    }
  }
  if (assets?.cfa && Array.isArray(assets.cfa)) {
    for (const cfa of assets.cfa) {
      checkAssetForBackup(RealmSchema.Collectible, cfa);
      if (shouldBackup) return true;
    }
  }
  if (assets?.uda && Array.isArray(assets.uda)) {
    for (const uda of assets.uda) {
      const collectionId = getCollectionIdFromUdaDetails(uda);
      if (collectionId) {
        checkCollectionForBackup(collectionId, uda);
      } else {
        checkAssetForBackup(RealmSchema.UniqueDigitalAsset, uda);
      }
      if (shouldBackup) return true;
    }
  }

  return false;
}

export async function receiveAsset({
  assetId,
  amount,
  linkedAsset,
  linkedAmount,
  expiry,
  blinded = true,
  useWatchTower = false,
  _retryCount = 0,
}: any) {
  try {
    const { appType, api } = getRgbContext();
    const rgbWallet = getRgbWallet();
    const parsedAmount = parseFloat(amount) ?? 0.0;

    const response = await RGBServices.receiveAsset(
      appType,
      api as any,
      assetId ?? null,
      parsedAmount,
      expiry,
      blinded,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    const invoices = [...(rgbWallet?.invoices || []), response];
    dbManager.updateObjectByPrimaryId(
      RealmSchema.RgbWallet,
      'mnemonic',
      rgbWallet.mnemonic,
      { receiveData: response, invoices },
    );
    scheduleInvoicesCloudBackup();

    if (linkedAsset && linkedAmount !== 0) {
      const { recipientId, batchTransferIdx, expirationTimestamp, invoice } = response;
      dbManager.createObject(RealmSchema.ReceiveUTXOData, {
        batchTransferIdx: batchTransferIdx || null,
        expirationTimestamp: expirationTimestamp || null,
        invoice: invoice || '',
        recipientId: recipientId || '',
        linkedAsset: linkedAsset || '',
        linkedAmount: linkedAmount || 0,
      });
    }

    if (useWatchTower && response.invoice) {
      const watchtowerResult = await RGBServices.addInvoiceToWatchTower(response.invoice);
      if (!watchtowerResult.success) {
        throw new Error(watchtowerResult.error || 'Failed to register with watchtower');
      }
    }

    viewUtxos();
    return response;
  } catch (error: any) {
    const errorCode = error?.code;
    if (errorCode === RgbLibErrors.InsufficientAllocationSlots) {
      if (_retryCount >= 1) {
        throw new Error('Unable to create new utxos for your invoice');
      }

      try {
        const res = await createUtxos();
        if (!res) {
          throw new Error('Unable to create new utxos for your invoice');
        }

        return await receiveAsset({
          assetId,
          amount,
          linkedAsset,
          linkedAmount,
          expiry,
          blinded,
          useWatchTower,
          _retryCount: _retryCount + 1,
        });
      } catch (utxoError: any) {
        const msg = utxoError?.message || utxoError?.code || `${utxoError}`;
        throw new Error(`Unable to create new utxos for your invoice: ${msg}`);
      }
    }
    throw error;
  }
}

export async function receiveAssetOnLN({
  assetId,
  amount,
  expiry,
}: {
  assetId?: string;
  amount?: number;
  expiry?: number;
}) {
  try {
    const response: any = await getNodeApi().lninvoice({
      amt_msat: 3000000,
      asset_id: assetId,
      asset_amount: Number(amount),
      expiry_sec: expiry,
    });
    if (response.invoice) {
      return response;
    }
    throw new Error(response.error);
  } catch (error) {
    console.log('errors', error);
    throw error;
  }
}

export async function decodeLnInvoice({ invoice }: { invoice: string }) {
  try {
    const response: any = await getNodeApi().decodelninvoice({ invoice });
    if (response.payment_hash) {
      return snakeCaseToCamelCaseCase(response);
    }
    throw new Error(response.error);
  } catch (error) {
    console.log('errors', error);
    throw error;
  }
}

export async function sendLNPayment({ invoice }: { invoice: string }) {
  try {
    const response: any = await getNodeApi().sendPayment({ invoice });
    if (response.payment_hash) {
      return snakeCaseToCamelCaseCase(response);
    }
    throw new Error(response.error);
  } catch (error) {
    console.log('errors', error);
    throw error;
  }
}

export async function listPayments() {
  try {
    const response: any = await getNodeApi().listpayments();
    if (response.payments && Array.isArray(response.payments)) {
      const rgbWallet = getRgbWallet();
      dbManager.updateObjectByPrimaryId(
        RealmSchema.RgbWallet,
        'mnemonic',
        rgbWallet.mnemonic,
        {
          lnPayments: response?.payments,
        },
      );
      return snakeCaseToCamelCaseCase(response.payments);
    }
    throw new Error(response.error);
  } catch (error) {
    throw error;
  }
}

export async function refreshRgbWallet() {
  try {
    const { appType, api } = getRgbContext();
    const assets = await RGBServices.syncRgbAssets(appType, api as any);
    const shouldBackup = shouldBackupAfterAssetSync(assets);

    if (assets?.nia) {
      dbManager.createObjectBulk(RealmSchema.Coin, assets.nia, Realm.UpdateMode.Modified);
    }
    if (assets?.ifa) {
      dbManager.createObjectBulk(RealmSchema.IFA, assets.ifa, Realm.UpdateMode.Modified);
    }

    if (assets?.cfa) {
      const cfas = [];
      let hasProcessedCfa = false;

      if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
        const nodeApi = getNodeApi();
        for (let i = 0; i < assets?.cfa.length; i++) {
          const collectible: Collectible = assets.cfa[i];
          const mediaByte: any = await nodeApi.getassetmedia({ digest: collectible.media.digest });
          const { base64 } = hexToBase64(mediaByte.bytes_hex);
          const ext = collectible.media.mime.split('/')[1];
          const path = `${RNFS.DocumentDirectoryPath}/${collectible.media.digest}.${ext}`;
          await RNFS.writeFile(path, base64, 'base64');

          cfas.push({
            ...collectible,
            media: {
              ...collectible.media,
              filePath: path,
            },
          });
        }
        hasProcessedCfa = true;
      }

      if (Platform.OS === 'ios' && appType === AppType.ON_CHAIN) {
        for (const element of assets.cfa) {
          const ext = element.media.mime.split('/')[1];
          const destination = `${element.media.filePath}.${ext}`;
          if (!(await RNFS.exists(destination))) {
            await RNFS.copyFile(element.media.filePath, destination);
          }
          cfas.push({
            ...element,
            media: {
              ...element.media,
              filePath: destination,
            },
          });
        }
        hasProcessedCfa = true;
      }

      if (!hasProcessedCfa) {
        cfas.push(...assets.cfa);
      }

      dbManager.createObjectBulk(
        RealmSchema.Collectible,
        cfas,
        Realm.UpdateMode.Modified,
      );
    }

    if (assets.uda) {
      const udas = [];
      const collections = [];
      if (appType === AppType.ON_CHAIN) {
        for (let i = 0; i < assets.uda.length; i++) {
          const uda: UniqueDigitalAsset = assets.uda[i];
          assets.uda[i].token.attachments = Object.values(uda.token.attachments);
          uda.token.attachments = Object.values(uda.token.attachments);

          if (Platform.OS === 'ios') {
            const ext = uda.token.media.mime.split('/')[1];
            const destination = `${uda.token.media.filePath}.${ext}`;
            const exists = await RNFS.exists(destination);
            if (!exists) {
              await RNFS.copyFile(uda.token.media.filePath, destination);
            }
            uda.token.media = {
              ...uda.token.media,
              filePath: destination,
            };
            for (let j = 0; j < uda.token.attachments.length; j++) {
              const attachment = uda.token.attachments[j];
              const ex = attachment.mime.split('/')[1];
              const dest = `${attachment.filePath}.${ex}`;
              const isexists = await RNFS.exists(dest);
              if (!isexists) {
                await RNFS.copyFile(attachment.filePath, dest);
              }
              uda.token.attachments[j] = {
                ...uda.token.attachments[j],
                filePath: dest,
              };
            }
          }

          if (uda.details.includes(DeepLinking.appLinkScheme)) {
            const deepLinking = DeepLinking.processDeepLink(
              DeepLinking.appLinkScheme + uda.details.split(DeepLinking.appLinkScheme)[1],
            );
            if (
              deepLinking.isValid &&
              deepLinking.feature === DeepLinkFeature.COLLECTION &&
              deepLinking.params.id
            ) {
              const slug = uda.details.split(DeepLinking.appLinkScheme)[1];
              const collection = urlParamsToObject(slug);
              const parsedItemsCount = parseInt(collection.no as string, 10);
              collections.push({
                _id: collection.id,
                description: uda.details.split(DeepLinking.appLinkScheme)[0],
                ...collection,
                ...uda,
                itemsCount:
                  isNaN(parsedItemsCount) || !isFinite(parsedItemsCount)
                    ? 0
                    : parsedItemsCount,
                isFixedSupply: collection.fxd === 'true',
                issuedSupply: String(uda.issuedSupply),
                slug,
                balance: {
                  settled: String(uda.balance.settled),
                  spendable: String(uda.balance.spendable),
                  future: String(uda.balance.future),
                  offchainOutbound: uda.balance.offchainOutbound
                    ? String(uda.balance.offchainOutbound)
                    : undefined,
                  offchainInbound: uda.balance.offchainInbound
                    ? String(uda.balance.offchainInbound)
                    : undefined,
                },
              });
            } else if (
              deepLinking.isValid &&
              deepLinking.feature === DeepLinkFeature.COLLECTION_ITEM &&
              deepLinking.params.collectionId
            ) {
              const collectionId = deepLinking.params.collectionId;
              const collection = dbManager.getObjectByPrimaryId(
                RealmSchema.Collection,
                '_id',
                collectionId,
              ) as any;

              if (collection) {
                dbManager.createObject(
                  RealmSchema.UniqueDigitalAsset,
                  {
                    ...uda,
                    issuedSupply: String(uda.issuedSupply),
                    balance: {
                      settled: String(uda.balance.settled),
                      spendable: String(uda.balance.spendable),
                      future: String(uda.balance.future),
                      offchainOutbound: uda.balance.offchainOutbound
                        ? String(uda.balance.offchainOutbound)
                        : undefined,
                      offchainInbound: uda.balance.offchainInbound
                        ? String(uda.balance.offchainInbound)
                        : undefined,
                    },
                  },
                  Realm.UpdateMode.Modified,
                );

                const udaObject = dbManager.getObjectByPrimaryId(
                  RealmSchema.UniqueDigitalAsset,
                  'assetId',
                  uda.assetId,
                ) as any;

                if (udaObject) {
                  const existingItem = collection.items.find(
                    (item: any) => item.assetId === uda.assetId,
                  );
                  if (!existingItem) {
                    dbManager.updateObjectByPrimaryId(
                      RealmSchema.Collection,
                      '_id',
                      collectionId,
                      {
                        items: [...collection.items, udaObject],
                      },
                    );
                  }
                }
              } else {
                const collectionResponse = await Relay.getCollectionDetails(collectionId);
                if (collectionResponse.status) {
                  const fetchedCollection = collectionResponse.collection;
                  const params = urlParamsToObject(fetchedCollection.slug);
                  fetchedCollection.description = fetchedCollection.details;
                  fetchedCollection.details =
                    fetchedCollection.details + ' ' + fetchedCollection.slug;
                  fetchedCollection.itemsCount = parseInt(params.no as string, 10);
                  fetchedCollection.isFixedSupply = params.fxd === 'true';
                  fetchedCollection.issuedSupply = String(uda.issuedSupply);
                  fetchedCollection.addedAt = Date.now();
                  fetchedCollection.media = {
                    filePath: fetchedCollection.media.file,
                    mime: fetchedCollection.media.mime,
                    base64Image: '',
                    digest: '',
                  };
                  fetchedCollection.attachments = fetchedCollection.attachments.map(
                    (attachment: any) => ({
                      filePath: attachment.file,
                      mime: attachment.mime,
                      base64Image: '',
                      digest: '',
                    }),
                  );
                  fetchedCollection.token = {
                    attachments: fetchedCollection.attachments,
                    embeddedMedia: false,
                    index: 0,
                    media: fetchedCollection.media,
                    reserves: false,
                  };
                  fetchedCollection.balance = {
                    settled: String(uda.balance.settled),
                    spendable: String(uda.balance.spendable),
                    future: String(uda.balance.future),
                    offchainOutbound: uda.balance.offchainOutbound
                      ? String(uda.balance.offchainOutbound)
                      : undefined,
                    offchainInbound: uda.balance.offchainInbound
                      ? String(uda.balance.offchainInbound)
                      : undefined,
                  };
                  fetchedCollection.items = [];

                  dbManager.createObject(
                    RealmSchema.Collection,
                    fetchedCollection,
                    Realm.UpdateMode.Modified,
                  );
                  dbManager.createObject(
                    RealmSchema.UniqueDigitalAsset,
                    {
                      ...uda,
                      balance: {
                        settled: String(uda.balance.settled),
                        spendable: String(uda.balance.spendable),
                        future: String(uda.balance.future),
                      },
                    },
                    Realm.UpdateMode.Modified,
                  );

                  const udaObject = dbManager.getObjectByPrimaryId(
                    RealmSchema.UniqueDigitalAsset,
                    'assetId',
                    uda.assetId,
                  ) as any;
                  if (udaObject) {
                    const existingItem = fetchedCollection.items.find(
                      (item: any) => item.assetId === uda.assetId,
                    );
                    if (!existingItem) {
                      dbManager.updateObjectByPrimaryId(
                        RealmSchema.Collection,
                        '_id',
                        collectionId,
                        {
                          items: [...fetchedCollection.items, udaObject],
                        },
                      );
                    }
                  }
                }
              }
            }
          } else {
            udas.push(uda);
          }
        }
      }

      if (collections.length > 0) {
        dbManager.createObjectBulk(RealmSchema.Collection, collections, Realm.UpdateMode.Modified);
      }
      if (udas.length > 0) {
        dbManager.createObjectBulk(
          RealmSchema.UniqueDigitalAsset,
          udas,
          Realm.UpdateMode.Modified,
        );
      }
    }

    await updateAssetVerificationStatus();
    if (shouldBackup) {
      await backup();
    }
  } catch (error) {
    console.log('error', error);
  }
}

export function parseAssetResponse(response: any) {
  if (!response || typeof response !== 'object') return undefined;
  if (response?.error || response?.code >= 400 || !response?.asset) {
    return response;
  }
  return getAppType() === AppType.SUPPORTED_RLN ? response.asset : response;
}

export async function addAssetToWallet({ asset }: { asset: Asset }) {
  try {
    const coins = dbManager.getCollection(RealmSchema.Coin);
    if (coins.find((coin: any) => coin.assetId === asset.assetId)) {
      return;
    }
    dbManager.createObject(RealmSchema.Coin, {
      ...asset,
      addedAt: Date.now(),
      issuedSupply: asset?.issuedSupply?.toString(),
      balance: {
        spendable: '0',
        future: '0',
        settled: '0',
        offchainOutbound: '0',
        offchainInbound: '0',
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function issueNewCoin({
  name,
  ticker,
  supply,
  precision,
}: {
  name: string;
  ticker: string;
  supply: string;
  precision: number;
}) {
  try {
    const { appType, api } = getRgbContext();
    const assetResponse = await RGBServices.issueAssetNia(
      ticker,
      name,
      `${supply}`,
      precision,
      appType,
      api as any,
    );
    const response = parseAssetResponse(assetResponse);
    if (response?.assetId) {
      const app = getTribeApp();
      const metadata = await RGBServices.getRgbAssetMetaData(
        response?.assetId,
        appType,
        api as any,
      );
      await Relay.registerAsset(app.id, { ...metadata, ...response }, app.authToken);
      const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
      const tx = wallet.specs.transactions.find(
        (t: any) =>
          t.transactionKind === TransactionKind.SERVICE_FEE &&
          t.metadata?.assetId === '',
      );
      if (tx) {
        updateTransaction({
          txid: tx.txid,
          updateProps: {
            metadata: {
              feeType: ServiceFeeType.REGISTER_ASSET_FEE,
              assetId: response.assetId,
              note: `Issued ${response.name} on ${moment().format('DD MMM YY  •  hh:mm A')}`,
            },
          },
        });
      }
      await refreshRgbWallet();
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export async function issueIFA({
  name,
  ticker,
  supply,
  precision,
  replaceRightsNum,
  rejectListUrl,
}: {
  name: string;
  ticker: string;
  supply: string;
  precision: number;
  replaceRightsNum: number;
  rejectListUrl: string | null;
}) {
  try {
    const { appType, api } = getRgbContext();
    const assetResponse = await RGBServices.issueAssetIfa(
      ticker,
      name,
      Number(precision),
      [Number(supply)],
      [],
      Number(replaceRightsNum),
      rejectListUrl,
      appType,
    );
    console.log(assetResponse);
    const response = parseAssetResponse(assetResponse);
    if (response?.assetId) {
      const app = getTribeApp();
      const metadata = await RGBServices.getRgbAssetMetaData(
        response?.assetId,
        appType,
        api as any,
      );
      await Relay.registerAsset(app.id, { ...metadata, ...response }, app.authToken);
      const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
      const tx = wallet.specs.transactions.find(
        (t: any) =>
          t.transactionKind === TransactionKind.SERVICE_FEE &&
          t.metadata?.assetId === '',
      );
      if (tx) {
        updateTransaction({
          txid: tx.txid,
          updateProps: {
            metadata: {
              feeType: ServiceFeeType.REGISTER_ASSET_FEE,
              assetId: response.assetId,
              note: `Issued ${response.name} on ${moment().format('DD MMM YY  •  hh:mm A')}`,
            },
          },
        });
      }
      await refreshRgbWallet();
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export async function issueNewCollectible({
  name,
  description,
  supply,
  filePath,
  precision,
}: {
  name: string;
  description: string;
  supply: string;
  filePath: string;
  precision: number;
}) {
  try {
    const { appType, api } = getRgbContext();
    const assetResponse = await RGBServices.issueAssetCfa(
      name,
      description,
      `${supply}`,
      precision,
      filePath,
      appType,
      api as any,
    );
    const response = parseAssetResponse(assetResponse);
    if (response?.assetId) {
      const app = getTribeApp();
      await refreshRgbWallet();
      const collectible = dbManager.getObjectByPrimaryId(
        RealmSchema.Collectible,
        'assetId',
        response?.assetId,
      ) as unknown as Collectible;
      await Relay.registerAsset(app.id, { ...collectible }, app.authToken);
      const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
      const tx = wallet.specs.transactions.find(
        (t: any) =>
          t.transactionKind === TransactionKind.SERVICE_FEE &&
          t.metadata?.assetId === '',
      );
      if (tx) {
        updateTransaction({
          txid: tx.txid,
          updateProps: {
            metadata: {
              feeType: ServiceFeeType.CREATE_COLLECTION_FEE,
              assetId: response.assetId,
              note: `Issued ${response.name} on ${moment().format('DD MMM YY  •  hh:mm A')}`,
            },
          },
        });
      }
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export async function issueAssetUda({
  name,
  ticker,
  details,
  mediaFilePath,
  attachmentsFilePaths,
}: {
  name: string;
  ticker: string;
  details: string;
  mediaFilePath: string;
  attachmentsFilePaths: string[];
}) {
  try {
    const { appType, api } = getRgbContext();
    const assetResponse = await RGBServices.issueAssetUda(
      name,
      ticker,
      details,
      mediaFilePath,
      attachmentsFilePaths,
      appType,
      api as any,
    );
    const response = parseAssetResponse(assetResponse);
    if (response?.assetId) {
      await refreshRgbWallet();
      const app = getTribeApp();
      const collectible = dbManager.getObjectByPrimaryId(
        RealmSchema.UniqueDigitalAsset,
        'assetId',
        response?.assetId,
      ) as unknown as Collectible;
      await Relay.registerAsset(app.id, { ...collectible }, app.authToken);
      const wallet: Wallet = (dbManager.getObjectByIndex(RealmSchema.Wallet) as any).toJSON();
      const tx = wallet.specs.transactions.find(
        (t: any) =>
          t.transactionKind === TransactionKind.SERVICE_FEE &&
          t.metadata?.assetId === '',
      );
      if (tx) {
        updateTransaction({
          txid: tx.txid,
          updateProps: {
            metadata: {
              feeType: ServiceFeeType.REGISTER_ASSET_FEE,
              assetId: response.assetId,
              note: `Issued ${response.name} on ${moment().format('DD MMM YY  •  hh:mm A')}`,
            },
          },
        });
      }
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export async function mintCollectionItem({
  name,
  ticker,
  details,
  mediaFilePath,
  attachmentsFilePaths,
  collectionId,
}: {
  name: string;
  ticker: string;
  details: string;
  mediaFilePath: string;
  attachmentsFilePaths: string[];
  collectionId: string;
}) {
  try {
    const { appType, api } = getRgbContext();
    const assetResponse = await RGBServices.issueAssetUda(
      name,
      ticker,
      details,
      mediaFilePath,
      attachmentsFilePaths,
      appType,
      api as any,
    );
    const response = parseAssetResponse(assetResponse);
    if (response?.assetId) {
      await refreshRgbWallet();
      const app = getTribeApp();
      const asset = dbManager.getObjectByPrimaryId(
        RealmSchema.UniqueDigitalAsset,
        'assetId',
        response?.assetId,
      ) as unknown as UniqueDigitalAsset;
      await Relay.mintCollectionItem(collectionId, asset, app.id, app.authToken);
      return response;
    }
    return response;
  } catch (error) {
    console.log('mintCollectionItem', error);
    throw error;
  }
}

export function generateCollectionSlug(
  collectionId: string,
  itemsCount: number,
  isFixedSupply: boolean,
) {
  return `${collectionId},${itemsCount},${isFixedSupply ? 'true' : 'false'}`;
}

export function parseCollectionSlug(slug: string) {
  const [collectionId, itemsCount, isFixedSupply] = slug.split(',');
  return {
    collectionId,
    itemsCount: parseInt(itemsCount, 10),
    isFixedSupply: isFixedSupply === 'true',
  };
}

export async function issueNewCollection({
  name,
  ticker = 'TCOLP',
  details,
  totalSupplyAmt,
  isFixedSupply,
  mediaFilePath,
  attachmentsFilePaths,
  createUtxos,
}: {
  name: string;
  ticker?: string;
  details: string;
  totalSupplyAmt: number;
  isFixedSupply: boolean;
  mediaFilePath: string;
  attachmentsFilePaths: string[];
  createUtxos: boolean;
}): Promise<Collection | null> {
  try {
    if (createUtxos) {
      await createUtxos();
    }
    const collectionId = uuidv4().split('-')[0];
    const slug = DeepLinking.buildUrl(
      DeepLinkFeature.COLLECTION,
      {
        id: collectionId,
        no: totalSupplyAmt,
        fxd: isFixedSupply,
      },
      DeepLinkType.APP_LINK,
    );

    const { appType, api } = getRgbContext();
    const response: any = await RGBServices.issueAssetUda(
      name,
      ticker,
      details.trim() + ' ' + slug,
      mediaFilePath,
      attachmentsFilePaths,
      appType,
      api as any,
    );

    if (response?.assetId) {
      await refreshRgbWallet();
      const app = getTribeApp();
      const collection = dbManager.getObjectByPrimaryId(
        RealmSchema.Collection,
        '_id',
        collectionId,
      ) as unknown as Collection;
      const registerCollectionResponse = await Relay.registerCollection(
        app.id,
        { ...collection },
        app.authToken,
      );
      await getAssetTransactions({
        assetId: collection.assetId,
        schema: RealmSchema.Collection,
        isCollection: true,
        collectionId,
      });
      if (registerCollectionResponse.created) {
        return collection;
      }
      throw new Error('Failed to register collection');
    }

    throw new Error('Failed to issue collection');
  } catch (error) {
    console.log('issueNewCollection', error);
    throw error;
  }
}

export async function getAssetTransactions({
  assetId,
  schema,
  isCollection = false,
  collectionId,
}: {
  assetId: string;
  schema: RealmSchema;
  isCollection: boolean;
  collectionId: string;
}) {
  try {
    const { appType, api } = getRgbContext();
    const response = await RGBServices.getRgbAssetTransactions(
      assetId,
      appType,
      api as any,
    );

    if (response.length > 0 && !isCollection) {
      dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
        transactions: response,
      });
    }

    if (isCollection) {
      dbManager.updateObjectByPrimaryId(RealmSchema.Collection, '_id', collectionId, {
        transactions: response,
      });
    }

    if (appType === AppType.NODE_CONNECT || appType === AppType.SUPPORTED_RLN) {
      const balances: any = await getNodeApi().assetbalance({
        asset_id: assetId,
      });
      if (balances && balances.future) {
        dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
          balance: snakeCaseToCamelCaseCase(balances),
        });
      }
    }

    return response;
  } catch (error) {
    console.log('refreshRgbWallet', error);
    throw error;
  }
}

export async function sendAsset({
  assetId,
  blindedUTXO,
  amount,
  consignmentEndpoints,
  feeRate,
  isDonation,
  schema,
  witnessSats,
}: {
  assetId: string;
  blindedUTXO: string;
  amount: number;
  consignmentEndpoints: string;
  feeRate: number;
  isDonation: boolean;
  schema: string;
  witnessSats: number;
}) {
  try {
    const { appType, api } = getRgbContext();
    return await RGBServices.sendAsset(
      assetId,
      blindedUTXO,
      amount,
      consignmentEndpoints,
      feeRate,
      isDonation,
      schema,
      witnessSats,
      appType,
      api as any,
    );
  } catch (error) {
    console.log('sendAsset', error);
    throw error;
  }
}

export async function getAssetMetaData({
  assetId,
  schema,
}: {
  assetId: string;
  schema: RealmSchema;
}) {
  try {
    const { appType, api } = getRgbContext();
    const response: any = await RGBServices.getRgbAssetMetaData(
      assetId,
      appType,
      api as any,
    );
    if (response) {
      if (response.maxSupply) {
        response.maxSupply = response?.maxSupply.toString();
      }
      if (response.issuedSupply) {
        response.issuedSupply = response?.issuedSupply?.toString();
      }
      if (response.knownCirculatingSupply) {
        response.knownCirculatingSupply = response?.knownCirculatingSupply?.toString();
      }
      if (response.initialSupply) {
        response.initialSupply = response?.initialSupply?.toString();
      }
      dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
        metaData: response,
      });
    }
    return response;
  } catch (error) {
    console.log('refreshRgbWallet', error);
    throw error;
  }
}

export async function handleTransferFailure(
  batchTransferIdx: Number,
  noAssetOnly: boolean,
) {
  try {
    const response: any = await RGBServices.failTransfer(batchTransferIdx, noAssetOnly);
    if (response.status) {
      return response;
    }
    if (response.error) {
      throw new Error(response.error);
    }
    throw new Error('Error - Canceling transfer ');
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function decodeInvoice(invoiceString: string) {
  try {
    const response: any = await RGBServices.decodeInvoice(invoiceString);
    if (response.recipientId) {
      return response;
    }
    if (response.error) {
      throw new Error(response.error);
    }
    throw new Error('Error - Canceling transfer ');
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateAssetVerificationStatus() {
  try {
    const getUnverifiedAssets = (schema: RealmSchema) =>
      dbManager.getCollection(schema).filter(
        (asset: any) => !asset.issuer || asset?.issuer?.verified === false,
      );

    const schemas = [
      { schema: RealmSchema.Coin, type: 'coin' },
      { schema: RealmSchema.Collectible, type: 'collectible' },
      { schema: RealmSchema.UniqueDigitalAsset, type: 'uda' },
      { schema: RealmSchema.Collection, type: 'collection' },
    ];

    const assetIds = schemas.flatMap(({ schema }) =>
      getUnverifiedAssets(schema).map((asset: any) => asset.assetId),
    );
    if (assetIds.length === 0) return;

    const response = await Relay.getAssetsVerificationStatus(assetIds);
    if (!response.status) {
      throw new Error(response.error || 'Failed to update asset verification status');
    }

    if (response?.records) {
      for (const { assetId, issuer, iconUrl } of response.records) {
        for (const { schema } of schemas) {
          const asset = dbManager.getCollection(schema).find((a: any) => a.assetId === assetId);
          if (asset) {
            dbManager.updateObjectByPrimaryId(schema, 'assetId', assetId, {
              issuer,
              iconUrl,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const validateTweetForAsset = async (
  tweetId: string,
  assetId: string,
  schema: RealmSchema,
  asset: Asset,
): Promise<{ success: boolean; tweet?: any; reason?: string }> => {
  try {
    const response = await fetchAndVerifyTweet(tweetId);

    if (response.status === 429) {
      const resetAfter = response.headers.get('x-rate-limit-reset');
      const now = Math.floor(Date.now() / 1000);
      const waitTime = resetAfter ? Number(resetAfter) - now : null;

      if (waitTime && waitTime > 0) {
        Toast(
          `You've reached the tweet fetch limit. Try again in ${waitTime}s (around ${new Date(
            Number(resetAfter) * 1000,
          ).toLocaleTimeString()}).`,
          true,
        );
      }

      return {
        success: false,
        reason: 'Too many requests to Twitter. Try again after a short break.',
      };
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const message =
        errorJson?.title === 'UsageCapExceeded'
          ? 'Twitter API usage cap exceeded. Please try again later.'
          : errorJson?.title || errorJson?.detail || `HTTP error ${response.status}`;
      return { success: false, reason: message };
    }

    const data = await response.json();
    const tweet = data?.data;

    if (!tweet) return { success: false, reason: 'Tweet not found' };
    if (!tweet.text.includes(assetId)) {
      return { success: false, reason: 'Asset ID not found in tweet text' };
    }

    const existingAsset: any = await dbManager.getObjectByPrimaryId(
      schema,
      'assetId',
      asset.assetId,
    );
    const existingVerifiedBy = existingAsset?.issuer?.verifiedBy || [];
    const updatedVerifiedBy = [...existingVerifiedBy];

    const twitterPostIndex = updatedVerifiedBy.findIndex(
      (v: any) => v.type === IssuerVerificationMethod.TWITTER_POST,
    );

    const twitterPostData = {
      type: IssuerVerificationMethod.TWITTER_POST,
      link: tweetId,
      id: '',
      name: '',
      username: '',
    };

    if (twitterPostIndex !== -1) {
      updatedVerifiedBy[twitterPostIndex] = twitterPostData;
    } else {
      updatedVerifiedBy.push(twitterPostData);
    }

    const relayResponse = await Relay.verifyIssuer('appID', asset.assetId, twitterPostData);
    const isVerified = relayResponse.status;

    await dbManager.updateObjectByPrimaryId(schema, 'assetId', asset.assetId, {
      issuer: {
        verified: isVerified,
        verifiedBy: updatedVerifiedBy,
      },
    });

    return { success: true, tweet };
  } catch (error: any) {
    console.error('Twitter API error:', error.message || error);
    return { success: false, reason: 'Network or fetch error' };
  }
};

export const searchAssetFromRegistry = async (
  query: string,
): Promise<{ asset?: Asset }> => {
  try {
    return await Relay.registryAssetSearch(query);
  } catch (error: any) {
    console.error('Twitter API error:', error.message || error);
    return error;
  }
};

export const fetchPresetAssets = async () => {
  try {
    const { status, results } = (await Relay.getPresetAssets()) || {};
    if (status && results) {
      Storage.set(Keys.PRESET_ASSETS, JSON.stringify(results));
      const makeZeroBalance = () => ({
        spendable: '0',
        future: '0',
        settled: '0',
        offchainOutbound: '0',
        offchainInbound: '0',
      });
      const balanceFromExistingOrZero = (
        schema: RealmSchema,
        assetId: string | undefined,
      ) => {
        if (!assetId) return makeZeroBalance();
        const existing = dbManager.getObjectByPrimaryId(
          schema,
          'assetId',
          assetId,
        ) as { balance?: Record<string, string> } | undefined;
        const b = existing?.balance;
        if (!b) return makeZeroBalance();
        return {
          spendable: String(b.spendable ?? '0'),
          future: String(b.future ?? '0'),
          settled: String(b.settled ?? '0'),
          offchainOutbound: String(b.offchainOutbound ?? '0'),
          offchainInbound: String(b.offchainInbound ?? '0'),
        };
      };
      const putFeaturedAsset = (
        schema: RealmSchema,
        result: Coin | Collectible | Collection | UniqueDigitalAsset,
      ) => {
        const { transactions: presetTransactions, ...rest } = result as any;
        const existingIdField = schema === RealmSchema.Collection ? '_id' : 'assetId';
        const existingId =
          schema === RealmSchema.Collection
            ? (result as Collection)._id
            : (result as any).assetId;
        const existing = dbManager.getObjectByPrimaryId(schema, existingIdField, existingId);
        const issuedRaw = (result as any).issuedSupply;
        const payload = {
          ...rest,
          addedAt: Date.now(),
          issuedSupply: issuedRaw != null ? String(issuedRaw) : '',
          balance: balanceFromExistingOrZero(schema, (result as any).assetId),
        };
        if (existing) {
          dbManager.createObject(schema, payload, Realm.UpdateMode.Modified);
        } else {
          dbManager.createObject(
            schema,
            {
              ...payload,
              transactions: Array.isArray(presetTransactions) ? presetTransactions : [],
            },
            Realm.UpdateMode.All,
          );
        }
      };

      (results as (Asset & { collectionSchema?: unknown })[]).forEach(result => {
        if (result.metaData.assetSchema === AssetSchema.Coin) {
          putFeaturedAsset(RealmSchema.Coin, result as Coin);
        } else if (result.metaData.assetSchema === AssetSchema.Collectible) {
          putFeaturedAsset(RealmSchema.Collectible, result as Collectible);
        } else if (result.collectionSchema) {
          putFeaturedAsset(RealmSchema.Collection, result as Collection);
        } else if (result.metaData.assetSchema === AssetSchema.UDA) {
          putFeaturedAsset(RealmSchema.UniqueDigitalAsset, result as UniqueDigitalAsset);
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching preset assets:', error);
    return false;
  }
};

async function tryClaimWithInvoice(
  app: TribeApp,
  campaignId: string,
  isBlinded: boolean,
  expiryTime: number,
) {
  const { appType, api } = getRgbContext();
  const receiveData = await RGBServices.receiveAsset(
    appType,
    api as any,
    '',
    0,
    expiryTime,
    isBlinded,
  );

  if (receiveData.invoice) {
    const rgbWallet = getRgbWallet();
    const invoices = [...(rgbWallet?.invoices || []), { ...receiveData, type: InvoiceType.Campaign }];
    dbManager.updateObjectByPrimaryId(
      RealmSchema.RgbWallet,
      'mnemonic',
      rgbWallet.mnemonic,
      { receiveData, invoices },
    );
    scheduleInvoicesCloudBackup();
    return Relay.claimCampaign(app.authToken, campaignId, receiveData.invoice);
  }

  return { claimed: false, error: receiveData.error };
}

export async function claimCampaign(campaignId: string, mode: 'WITNESS' | 'BLINDED') {
  try {
    const app = getTribeApp();
    const isEligible = await Relay.isEligibleForCampaign(app.authToken, campaignId);
    if (!isEligible.status) {
      return {
        claimed: false,
        error: isEligible.message,
      };
    }

    const isBlinded = mode === 'BLINDED';
    const expiryTime = 60 * 60 * 24 * 3;

    const invoice: any = await tryClaimWithInvoice(app, campaignId, isBlinded, expiryTime);
    if (invoice.claimed) return invoice;

    if (invoice.error === 'Insufficient sats for RGB') {
      const utxos = await createUtxos();
      if (utxos) {
        await refreshRgbWallet();
        await Promise.resolve(new Promise(resolve => setTimeout(resolve, 1000)));
        const retryInvoice: any = await tryClaimWithInvoice(app, campaignId, isBlinded, expiryTime);
        if (retryInvoice.claimed) return retryInvoice;
      }
      return {
        claimed: false,
        error: invoice.error,
      };
    }

    return {
      claimed: false,
      error: invoice.error || invoice.message || 'Failed to generate invoice',
    };
  } catch (error: any) {
    console.error('Claim campaign error:', error.message || error);
    return { claimed: false, error: error.message || error };
  }
}

export function isGasFreeAvailable(): boolean {
  return RGBServices.isGasFreeAvailable();
}

export async function requestGasFreeQuote(
  userId: string,
  assetId: string,
  transferAmount: number,
  recipientInvoice: string,
  numInputs?: number,
  numOutputs?: number,
) {
  try {
    return await RGBServices.requestGasFreeQuote(
      userId,
      assetId,
      transferAmount,
      recipientInvoice,
      numInputs,
      numOutputs,
    );
  } catch (error) {
    console.error('Error requesting gas-free quote:', error);
    throw error;
  }
}

export async function confirmGasFreeTransfer(request: any, feeQuote: any) {
  try {
    return await RGBServices.confirmGasFreeTransfer(request, feeQuote);
  } catch (error) {
    console.error('Error confirming gas-free transfer:', error);
    throw error;
  }
}
