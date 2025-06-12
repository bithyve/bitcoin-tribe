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
import { Platform } from 'react-native';

export default class ContactsManager {
  static instance: ContactsManager;

  worklet: Worklet;
  IPC: any;
  rpc: any;
  onMessageCallback: ((data: any) => void) | null = null;
  onConnectionCallback: ((data: any) => void) | null = null;

  private constructor() {
    this.worklet = new Worklet();
    this.IPC = this.worklet.IPC;
  }

  static getInstance(): ContactsManager {
    if (!ContactsManager.instance) {
      ContactsManager.instance = new ContactsManager();
    }
    return ContactsManager.instance;
  }

  async init(seed: string): Promise<boolean> {
    await this.worklet.start('/app.bundle', bundle, [seed]);

    this.rpc = new RPC(this.IPC, async req => {
      const data = b4a.toString(req.data);
      console.log(`${Platform.OS} Received:`, req.command, data);

      if (req.command === RPC_KEY) {
      } else if (req.command === ON_MESSAGE) {
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
}
