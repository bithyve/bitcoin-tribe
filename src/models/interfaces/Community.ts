import { Asset } from './RGBWallet';
import { EncryptedKeys } from 'src/utils/ChatEnc';

export enum MessageType {
  Alert = 'Alert',
  Text = 'Text',
  Image = 'Image',
  RequestSats = 'RequestSats',
  SendSats = 'SendSats',
  RequestAsset = 'RequestAsset',
  SendAsset = 'SendAsset',
}

export enum CommunityType {
  Peer = 'Peer',
  Group = 'Group',
  Broadcast = 'Broadcast',
}

export interface Message {
  id: string;
  communityId: string;
  type: MessageType;
  text: string;
  createdAt: number;
  sender: string;
  block: number;
  unread: boolean;
  fileUrl?: string;
  request?: {
    type: RequestType;
    status: RequestStatus;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    notes?: string;
    asset?: Asset;
    amount?: number;
    invoice?: string;
    txid?: string;
  };
  encryptedKeys?: EncryptedKeys;
}

export enum RequestType {
  SendSats = 'SendSats',
  RequestSats = 'RequestSats',
  SendAsset = 'SendAsset',
  RequestAsset = 'RequestAsset',
}

export enum RequestStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  createdAt: number;
  updatedAt: number;
  with?: string;
  key?: string;
  // messages: Message[];
  // members: string[];
}

export interface Contact {
  appID: string;
  contactKey: string;
  imageUrl?: string;
  name: string;
}

export enum deeplinkType {
  Contact = 'contact',
  Group = 'group',
  Broadcast = 'broadcast',
}
