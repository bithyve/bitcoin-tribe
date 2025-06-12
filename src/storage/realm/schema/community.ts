import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const MessageSchema: ObjectSchema = {
  name: RealmSchema.Message,
  primaryKey: 'id',
  properties: {
    id: 'string',
    createdAt: {type: 'int', default: Date.now()},
    message: 'string?',
    type: 'string?',
    senderPublicKey: 'string',
    senderName: 'string',
  },
};

export const CommunitySchema: ObjectSchema = {
  name: RealmSchema.Community,
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string?',
    createdAt: {type: 'int', default: Date.now()},
    publicKey: 'string?',
    messages: `${RealmSchema.Message}[]`,
  },
};


