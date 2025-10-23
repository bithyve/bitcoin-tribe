import { ObjectSchema } from 'realm';

export const HolepunchRoomSchema: ObjectSchema = {
  name: 'HolepunchRoom',
  primaryKey: 'roomId',
  properties: {
    roomId: 'string',
    roomKey: 'string',
    roomType: 'string',
    roomName: 'string',
    roomDescription: 'string',
    peers: 'string[]',
    creator: 'string',
    createdAt: 'int',
    lastActive: 'int',
    initializedIdentity: 'bool',
    roomImage: 'string?',
  },
};

export const HolepunchMessageSchema: ObjectSchema = {
  name: 'HolepunchMessage',
  primaryKey: 'messageId',
  properties: {
    messageId: 'string',
    roomId: 'string',
    senderId: 'string',
    messageType: 'string',
    content: 'string',
    timestamp: 'int',
  },
};

export const HolepunchPeerSchema: ObjectSchema = {
  name: 'HolepunchPeer',
  primaryKey: 'peerId',
  properties: {
    peerId: 'string',           // Peer's public key (primary key)
    peerName: 'string?',         // Display name
    peerImage: 'string?',        // Image URL
  },
};