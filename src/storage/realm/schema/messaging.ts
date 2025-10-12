import { ObjectSchema } from 'realm';

export const HolepunchRoomSchema: ObjectSchema = {
  name: 'HolepunchRoom',
  primaryKey: 'roomId',
  properties: {
    roomId: 'string',
    roomKey: 'string',
    roomName: 'string',
    creator: 'string',
    createdAt: 'int',
    lastActive: 'int?',
  },
};

export const HolepunchMessageSchema: ObjectSchema = {
  name: 'HolepunchMessage',
  primaryKey: 'messageId',
  properties: {
    messageId: 'string',
    roomId: 'string',
    senderId: 'string',
    content: 'string',
    timestamp: 'int',
  },
};