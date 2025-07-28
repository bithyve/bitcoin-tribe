import RPC from 'bare-rpc';
import b4a from 'b4a';
import { Worklet } from 'react-native-bare-kit';
import bundle from './app.bundle.mjs';
import {
  GET_KEYS,
  GET_PEERS,
  JOIN_PEER,
  ON_CONNECTION,
  ON_MESSAGE,
  RPC_KEY,
  SEND_MESSAGE,
} from './rpc-commands.mjs';
import Relay from '../relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/enum';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { Community, CommunityType, Message } from 'src/models/interfaces/Community';
import Realm from 'realm';
import { ChatKeyManager } from 'src/utils/ChatEnc';

export default class ChatPeerManager {
  static instance: ChatPeerManager;

  worklet: Worklet;
  IPC: any;
  rpc: any;
  onMessageCallback: ((data: any) => void) | null = null;
  onConnectionCallback: ((data: any) => void) | null = null;
  app: TribeApp;

  private constructor() {
    this.worklet = new Worklet();
    this.IPC = this.worklet.IPC;
    this.app = dbManager.getObjectByIndex(RealmSchema.TribeApp) as TribeApp;
  }

  static getInstance(): ChatPeerManager {
    if (!ChatPeerManager.instance) {
      ChatPeerManager.instance = new ChatPeerManager();
    }
    return ChatPeerManager.instance;
  }

  async init(seed: string): Promise<boolean> {
    try {
      await this.worklet.start('/app.bundle', bundle, [seed]);
  
      this.rpc = new RPC(this.IPC, async req => {
        const data = b4a.toString(req.data);
        // console.log(`${Platform.OS} Received:`, req.command, data);
  
        if (req.command === RPC_KEY) {
        } else if (req.command === ON_MESSAGE) {
          this.storeMessage(JSON.parse(data));
          if (this.onMessageCallback) {
            this.onMessageCallback(JSON.parse(data));
          }
        } else if (req.command === ON_CONNECTION) {
          if (this.onConnectionCallback) {
            this.onConnectionCallback(JSON.parse(data));
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Error initializing chat peer manager:', error);
      return false;
    }
  }

  async getKeys() {
    const request = this.rpc.request(GET_KEYS);
    request.send(`${GET_KEYS}`);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return JSON.parse(response);
  }

  async getPeers() {
    const request = this.rpc.request(GET_PEERS);
    request.send(`${GET_PEERS}`);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return JSON.parse(response);
  }

  async joinPeers(pubKey: string) {
    const request = this.rpc.request(JOIN_PEER);
    request.send(pubKey);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return response;
  }

  async sendMessage(pubKey: string, message: string) {
    const request = this.rpc.request(SEND_MESSAGE);
    request.send(JSON.stringify({ pubKey, message }));
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return response;
  }

  setOnMessageListener(callback: (data: object) => void) {
    this.onMessageCallback = callback;
  }

  setOnConnectionListener(callback: (data: object) => void) {
    this.onConnectionCallback = callback;
  }

  async loadPendingMessages(lastBlock = 0) {
    try {
      const response = await Relay.getPeerMessages(
        this.app.contactsKey.publicKey,
        lastBlock === 0 ? 0 : lastBlock - 1,
      );
      if (response.messages.length > 0) {
        for (const msg of response.messages) {
          const message: Message = JSON.parse(msg.message);
          const communityId = message.communityId;
          let community = dbManager.getObjectByPrimaryId(RealmSchema.Community, 'id', communityId);
          if (!community && message.encryptedKeys) {
            const contact = await Relay.getWalletProfiles([message.sender]);
            if (contact.results.length > 0) {
              dbManager.createObject(RealmSchema.Contact, contact.results[0]);
              const sharedSecret = ChatKeyManager.performKeyExchange(this.app.contactsKey, message.sender);
              const encryptedKeys = ChatKeyManager.decryptKeys(message.encryptedKeys, sharedSecret);
              community = {
                id: communityId,
                communityId: communityId,
                name: contact.results[0].name,
                type: CommunityType.Peer,
                createdAt: msg.timestamp,
                updatedAt: msg.timestamp,
                with: message.sender,
                key: encryptedKeys.aesKey,
              };  
              dbManager.createObject(RealmSchema.Community, community);
            }
          }
          const decryptedMessage = ChatKeyManager.decryptMessage(message, community.key);
          const messageData = JSON.parse(decryptedMessage);
          dbManager.createObject(RealmSchema.Message, {
            id: messageData.id,
            communityId: messageData.communityId,
            type: messageData.type,
            text: messageData.text,
            createdAt: msg.timestamp,
            sender: messageData.sender,
            block: msg.blockNumber,
            unread: true,
            fileUrl: messageData?.fileUrl,
            request: messageData?.request,
          });
        }
      }
    } catch (error) {
      console.error('Error loading pending messages:', error);
    }
  }

  storeMessage = async (payload: any) => {
    try {
      const communities = dbManager.getCollection(RealmSchema.Community);
      const data = JSON.parse(payload.data);
      const message = JSON.parse(data.message);
      let community: Community = communities.find(c => c.id === message.communityId);
      if (!community && message.encryptedKeys) {
        const contact = await Relay.getWalletProfiles([message.sender]);
        if (contact.results.length > 0) {
          const sharedSecret = ChatKeyManager.performKeyExchange(this.app.contactsKey, message.sender);
          const encryptedKeys = ChatKeyManager.decryptKeys(message.encryptedKeys, sharedSecret);
          dbManager.createObject(RealmSchema.Contact, contact.results[0]);
          community = {
            id: message.communityId,
            name: contact.results[0].name,
            type: CommunityType.Peer,
            createdAt: data.timestamp,
            updatedAt: data.timestamp,
            with: message.sender,
            key: encryptedKeys.aesKey,
          };
          dbManager.createObject(RealmSchema.Community, community);
        }
      }
      const decryptedMessage = ChatKeyManager.decryptMessage(message, community.key);
      const messageData = JSON.parse(decryptedMessage);
      dbManager.createObject(RealmSchema.Message, {
        id: messageData.id,
        communityId: messageData.communityId,
        type: messageData.type,
        text: messageData.text,
        createdAt: data.timestamp,
        sender: messageData.sender,
        block: data.blockNumber,
        unread: true,
        fileUrl: messageData?.fileUrl,
        request: messageData?.request,
      });
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  };

  async syncContacts() {
    try {
      const contacts = dbManager.getCollection(RealmSchema.Contact);
      const response = await Relay.getWalletProfiles(
        contacts.map(c => c.contactKey),
      );
      if (response.results.length > 0) {
        dbManager.createObjectBulk(
          RealmSchema.Contact,
          response.results,
          Realm.UpdateMode.Modified,
        );
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
    }
  }
}
