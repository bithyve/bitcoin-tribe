import { RealmSchema } from 'src/storage/enum';
import RealmDatabase from 'src/storage/realm/realm';

export enum HolepunchMessageType {
  TEXT = 'TEXT',
  IDENTITY = 'IDENTITY',  // Peer identity announcement
  SYSTEM = 'SYSTEM',      // System messages (join notifications)
  DM_INVITE = 'DM_INVITE',  // DM invitation message
}

export interface HolepunchMessage {
  messageId: string;
  roomId: string;
  senderId: string;
  messageType: HolepunchMessageType;
  content: string;
  timestamp: number;
}

export class MessageStorage {
  /**
   * Save or update a message in Realm
   */
  static async saveMessage(message: HolepunchMessage): Promise<void> {
    try {
      RealmDatabase.create(RealmSchema.HolepunchMessage, message, 'modified');
      // Optionally, handle message status updates elsewhere
      console.log('[MessageStorage] Message saved:', message.messageId);
    } catch (error) {
      console.error('[MessageStorage] Failed to save message:', error);
      throw error;
    }
  }

  /**
   * Get all messages for a room, sorted by timestamp ascending
   */
  static async getMessagesForRoom(roomId: string): Promise<HolepunchMessage[]> {
    try {
      const realmMessages = RealmDatabase.get(RealmSchema.HolepunchMessage);
      if (!realmMessages) return [];
      const messages: HolepunchMessage[] = Array.from((realmMessages as Realm.Results<any>).filtered('roomId == $0', roomId)).map((m) => ({
        messageId: String(m._id),
        roomId: String(m.roomId),
        senderId: String(m.senderId),
        messageType: String(m.messageType) as HolepunchMessageType,
        content: String(m.content),
        timestamp: m.timestamp instanceof Date ? m.timestamp.getTime() : Date.now(),
        status: String(m.status),
      }));
      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      return messages;
    } catch (error) {
      console.error('[MessageStorage] Failed to get messages:', error);
      return [];
    }
  }

  /**
   * Get a specific message by ID
   */
  static async getMessage(messageId: string): Promise<HolepunchMessage | null> {
    try {
      const realmMessages = RealmDatabase.get(RealmSchema.HolepunchMessage);
      if (!realmMessages) return null;
      const m = (realmMessages as Realm.Results<any>).filtered('_id == $0', messageId)[0];
      if (!m) return null;
      return {
        messageId: String(m._id),
        roomId: String(m.roomId),
        senderId: String(m.senderId),
        messageType: String(m.messageType) as HolepunchMessageType,
        content: String(m.content),
        timestamp: m.timestamp instanceof Date ? m.timestamp.getTime() : Date.now(),
      };
    } catch (error) {
      console.error('[MessageStorage] Failed to get message:', error);
      return null;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const realmMessages = RealmDatabase.get(RealmSchema.HolepunchMessage);
      if (!realmMessages) return;
      const m = (realmMessages as Realm.Results<any>).filtered('_id == $0', messageId)[0];
      if (m) {
        RealmDatabase.delete(m);
        console.log('[MessageStorage] Message deleted:', messageId);
      }
    } catch (error) {
      console.error('[MessageStorage] Failed to delete message:', error);
      throw error;
    }
  }

  /**
   * Clear all messages (for testing/debugging)
   */
  static async clearAllMessages(): Promise<void> {
    try {
      const realmMessages = RealmDatabase.get(RealmSchema.HolepunchMessage);
      if (!realmMessages) return;
      RealmDatabase.write(() => {
        (realmMessages as Realm.Results<any>).forEach((m: any) => {
          RealmDatabase.delete(m);
        });
      });
      console.log('[MessageStorage] All messages cleared');
    } catch (error) {
      console.error('[MessageStorage] Failed to clear messages:', error);
      throw error;
    }
  }
}
