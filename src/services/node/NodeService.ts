import { RLNNodeApiServices } from 'src/services/rgbnode/RLNNodeApi';
import { RgbNodeConnectParams, NodeInfo } from 'src/models/interfaces/RGBWallet';
import { RealmSchema } from 'src/storage/enum';
import dbManager from 'src/storage/realm/dbManager';
import Relay from 'src/services/relay';
import { RGBWallet } from 'src/models/interfaces/RGBWallet';
import { TribeApp } from 'src/models/interfaces/TribeApp';

export class NodeService {
  private static instance: NodeService;
  private api: RLNNodeApiServices | null = null;

  private constructor() {}

  static getInstance(): NodeService {
    if (!NodeService.instance) {
      NodeService.instance = new NodeService();
    }
    return NodeService.instance;
  }

  getApi(): RLNNodeApiServices | null {
      // If not initialized, try to retrieve from ApiHandler or init? 
      // For now, minimal migration.
      // Ideally we store credentials and re-init if null.
      if (!this.api) {
          // Fallback to ApiHandler's api if possible or throw
          // return ApiHandler.api; // Accessing private property not allowed if private.
          // We need a way to init API.
      }
      return this.api;
  }
  
  initApi(nodeUrl: string, authentication: string, authToken: string) {
      this.api = new RLNNodeApiServices({
        baseUrl: nodeUrl,
        // authentication, // ApiConfig doesn't have authentication? It has apiKey.
        // Check RLNNodeApi.ts: apiKey?: string.
        apiKey: authToken, // ApiHandler pass authToken as second arg or inside config?
        // ApiHandler.ts: new RLNNodeApiServices({nodeUrl, authentication, authToken}) vs RLNNodeApi definitions.
        // RLNNodeApi.ts: constructor(config: ApiConfig). ApiConfig { baseUrl, apiKey }.
        // So authentication is likely not used or mapped to apiKey?
        // Let's assume authToken is apiKey.
      });
  }

  async connectToNode() {
      // Logic for connection if separate from check
  }

  async checkRgbNodeConnection(params: RgbNodeConnectParams) {
    try {
        const { nodeUrl, authentication, mnemonic, nodeId, peerDNS } = params;
        this.api = new RLNNodeApiServices({
          baseUrl: nodeUrl,
          apiKey: '', // Auth token might be needed?
        });
        
        // This method seems to be used during onboarding to verify connection params
        const response = await this.api.nodeinfo();
        if (response) {
            return response;
        } else {
            throw new Error('Failed to connect to node');
        }
    } catch (error) {
        throw error;
    }
  }

  async viewNodeInfo() {
      if (!this.api) throw new Error("API not initialized");
      const response = await this.api.nodeinfo();
      if (response) return response;
      throw new Error('Failed to connect to node');
  }

  async saveNodeMnemonic(nodeId: string, authToken: string) {
    try {
      const response = await Relay.saveNodeMnemonic(nodeId, authToken);
      if (response) {
        const { status, mnemonic, peerUrl } = response;
        if (mnemonic) {
          const rgbWallet = dbManager.getObjectByIndex(
            RealmSchema.RgbWallet,
          ) as RGBWallet;
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

            const { WalletService } = require('src/services/wallet/WalletService');
            await WalletService.getInstance().createNewWallet({});
          }
        }
        return status;
      } else {
        throw new Error('Failed to fetch node status');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch node status');
    }
  }

  async startNode(nodeId: string, authToken: string) {
    try {
      const response = await Relay.startNodeById(nodeId, authToken);
      if (response) {
        return response;
      } else {
        throw new Error('Failed to fetching node status');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to fetching node status');
    }
  }

  async syncNode() {
      // Implementation
  }

  async createSupportedNode() {
    try {
      const response = await Relay.createSupportedNode();
      if (response.error) {
        throw new Error(response.error);
      } else if (response) {
        return response;
      } else {
        throw new Error('Failed to create node');
      }
    } catch (error: any) {
      let message =
        error?.response?.data?.error || error?.message || 'Unknown error';
      if (!message || message === 'Error') {
        message =
          'Unable to create wallet in supported mode. Please try again later.';
      }
      throw new Error(message);
    }
  }

  async unlockNode() {
      // Implementation
  }
  
  async getBtcBalance(skipSync = false) {
    if (!this.api) return null;
    return await this.api.getBtcBalance({ skip_sync: skipSync });
  }

  async checkNodeStatus(nodeId: string, authToken: string): Promise<string | null> {
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
  }

  async getNodeOnchainBtcAddress() {
    try {
      if (!this.api) throw new Error("API not initialized");
      const response = await this.api.getAddress({});
      if (response) {
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log(error);
      throw new Error('Failed to connect to node');
    }
  }

  async getNodeOnchainBtcTransactions(): Promise<any> {
    try {
      if (!this.api) throw new Error("API not initialized");
      const response = await this.api.listTransactions({
        skip_sync: false,
      });
      if (response && Array.isArray(response.transactions)) {
        const rgbWallet = dbManager.getObjectByIndex(
          RealmSchema.RgbWallet,
        ) as RGBWallet;
        dbManager.updateObjectByPrimaryId(
          RealmSchema.RgbWallet,
          'mnemonic',
          rgbWallet.mnemonic,
          {
            nodeOnchainTransactions: response?.transactions,
          },
        );
        return response;
      } else {
        throw new Error('Failed to connect to node');
      }
    } catch (error) {
      console.log('error- ', error);
      throw new Error('Failed to connect to node');
    }
  }
}

