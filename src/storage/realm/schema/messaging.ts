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