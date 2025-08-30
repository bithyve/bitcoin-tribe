import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const MessageSchema: ObjectSchema = {
  name: RealmSchema.Message,
  primaryKey: 'id',
  properties: {
    id: 'string',
    communityId: 'string',
    block: 'int?',
    unread: 'bool',
    createdAt: {type: 'int', default: Date.now()},
    text: 'string?',
    type: 'string?',
    sender: 'string',
    fileUrl: 'string?',
    request: `${RealmSchema.Request}?`,
  },
};

export const RequestSchema: ObjectSchema = {
  name: RealmSchema.Request,
  properties: {
    id: 'string',
    type: 'string',
    status: 'string',
    createdBy: 'string',
    createdAt: {type: 'int', default: Date.now()},
    updatedAt: {type: 'int', default: Date.now()},
    notes: 'string?',
    asset: 'string?{}',
    amount: 'string?',
    invoice: 'string?',
    txid: 'string?',
  },
};  

export const ContactSchema: ObjectSchema = {
  name: RealmSchema.Contact,
  primaryKey: 'contactKey',
  properties: {
    contactKey: 'string',
    appID: 'string',
    imageUrl: 'string?',
    name: 'string',
  },
};

  export const CommunitySchema: ObjectSchema = {
  name: RealmSchema.Community,
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string?',
    createdAt: {type: 'int', default: Date.now()},
    type: 'string',
    with: 'string?',
    key: 'string?',
  },
};


