import { RLNNodeApiServices } from 'src/services/rgbnode/RLNNodeApi';
import Relay from 'src/services/relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { snakeCaseToCamelCaseCase } from 'src/utils/snakeCaseToCamelCaseCase';
import { createNewWallet } from './AppAndLoginServices';

function getRgbWallet(): RGBWallet {
  return dbManager.getObjectByIndex(RealmSchema.RgbWallet) as RGBWallet;
}

function getTribeApp(): TribeApp {
  return dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
}

function getNodeApi(): RLNNodeApiServices {
  const rgbWallet = getRgbWallet();
  return new RLNNodeApiServices({
    baseUrl: rgbWallet.nodeUrl,
    apiKey: rgbWallet.nodeAuthentication,
  });
}

export async function getNodeOnchainBtcAddress() {
  try {
    const response = await getNodeApi().getAddress({});
    if (response) {
      return response;
    }
    throw new Error('Failed to connect to node');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to connect to node');
  }
}

export async function getNodeOnchainBtcTransactions() {
  try {
    const response: any = await getNodeApi().listTransactions({
      skip_sync: false,
    });
    if (response && Array.isArray(response.transactions)) {
      const rgbWallet = getRgbWallet();
      dbManager.updateObjectByPrimaryId(
        RealmSchema.RgbWallet,
        'mnemonic',
        rgbWallet.mnemonic,
        {
          nodeOnchainTransactions: response?.transactions,
        },
      );
      return response;
    }
    throw new Error('Failed to connect to node');
  } catch (error) {
    console.log('error- ', error);
    throw new Error('Failed to connect to node');
  }
}

export async function viewNodeInfo() {
  try {
    const response = await getNodeApi().nodeinfo();
    if (response) {
      return response;
    }
    throw new Error('Failed to connect to node');
  } catch (error) {
    console.log('viewNodeInfo - error', error);
    throw new Error('Failed to connect to node');
  }
}

export async function saveNodeMnemonic(
  nodeId: string,
  authToken: string,
): Promise<string> {
  try {
    const response = await Relay.saveNodeMnemonic(nodeId, authToken);
    if (!response) {
      throw new Error('Failed to fetch node status');
    }

    const { status, mnemonic, peerUrl } = response;
    if (mnemonic) {
      const rgbWallet = getRgbWallet();
      if (rgbWallet?.nodeMnemonic !== mnemonic) {
        await dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          { nodeMnemonic: mnemonic },
        );
        await dbManager.updateObjectByPrimaryId(
          RealmSchema.TribeApp,
          'id',
          nodeId,
          { primaryMnemonic: mnemonic },
        );
        await dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          { peerDNS: peerUrl },
        );

        await createNewWallet({});
      }
    }

    return status;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch node status');
  }
}

export const checkNodeStatus = async (
  nodeId: string,
  authToken: string,
): Promise<string | null> => {
  console.log('nodeId', nodeId);
  console.log('authToken', authToken);
  try {
    const node: any = await Relay.getNodeById(nodeId, authToken);
    const status = node?.nodeInfo?.data?.status || node?.node?.status;
    return status;
  } catch (err) {
    console.error('Error fetching node status:', err);
    return null;
  }
};

export async function startNode(nodeId: string, authToken: string) {
  try {
    const response = await Relay.startNodeById(nodeId, authToken);
    if (response) {
      return response;
    }
    throw new Error('Failed to fetching node status');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetching node status');
  }
}

export async function getassetmedia(digest: string) {
  try {
    const response = await getNodeApi().getassetmedia({ digest });
    if (response) {
      return response;
    }
    throw new Error('Failed to connect to node');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to connect to node');
  }
}

export async function openChannel({
  peerPubkeyAndOptAddr,
  capacitySat,
  pushMsat,
  assetAmount,
  assetId,
  isPublic,
  withAnchors,
  feeBaseMsat,
  feeProportionalMillionths,
  temporaryChannelId,
}: {
  peerPubkeyAndOptAddr: string;
  capacitySat: number;
  pushMsat: number;
  assetAmount: number;
  assetId: string;
  isPublic: boolean;
  withAnchors: boolean;
  feeBaseMsat: number;
  feeProportionalMillionths: number;
  temporaryChannelId: string;
}) {
  try {
    const api = getNodeApi();
    const response: any = await api.openchannel({
      asset_amount: assetAmount,
      asset_id: assetId,
      capacity_sat: capacitySat,
      fee_base_msat: feeBaseMsat,
      fee_proportional_millionths: feeProportionalMillionths,
      peer_pubkey_and_opt_addr: peerPubkeyAndOptAddr,
      public: isPublic,
      push_msat: pushMsat,
      //temporary_channel_id: temporaryChannelId,
      with_anchors: withAnchors,
    });
    if (response.error) {
      if (response.name === 'NoAvailableUtxos') {
        const createUtxos: any = await api.createutxos({
          fee_rate: 1,
          num: 1,
          size: capacitySat,
          skip_sync: false,
          up_to: false,
        });
        if (createUtxos?.error) {
          throw new Error(createUtxos.error);
        }
        if (createUtxos) {
          await openChannel({
            peerPubkeyAndOptAddr,
            capacitySat,
            pushMsat,
            assetAmount,
            assetId,
            isPublic,
            withAnchors,
            feeBaseMsat,
            feeProportionalMillionths,
            temporaryChannelId,
          });
        }
      } else {
        throw new Error(response.error);
      }
    } else if (response) {
      return response;
    } else {
      throw new Error('Failed to connect to node');
    }
  } catch (error) {
    throw error;
  }
}

export async function closeChannel({
  channelId,
  peerPubKey,
}: {
  channelId: string;
  peerPubKey: number;
}) {
  try {
    const response: any = await getNodeApi().closechannel({
      channel_id: channelId,
      peer_pubkey: peerPubKey,
      force: false,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getChannels() {
  try {
    const response: any = await getNodeApi().listchannels();
    if (response && response.channels) {
      return snakeCaseToCamelCaseCase(response).channels;
    }
    return snakeCaseToCamelCaseCase(response);
  } catch (error: any) {
    console.log('error - ', error);
    console.log('error?.message', error?.message);
    throw error;
  }
}

export async function syncNode() {
  try {
    const response = await getNodeApi().sync();
    if (response) {
      return response;
    }
    throw new Error('Failed to sync node');
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function unlockNode() {
  try {
    const app = getTribeApp();
    const response: any = await getNodeApi().unlock('tribe@2024', app.authToken);
    if (response.error) {
      throw new Error(response.error);
    }
    if (response) {
      return response;
    }
    throw new Error('Failed to unlock node');
  } catch (error) {
    throw error;
  }
}

export async function getAssetBalance(assetId: string) {
  try {
    const response: any = await getNodeApi().assetbalance({
      asset_id: assetId,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    if (response) {
      return snakeCaseToCamelCaseCase(response);
    }
    throw new Error('Failed to unlock node');
  } catch (error) {
    console.log(error);
    throw error;
  }
}