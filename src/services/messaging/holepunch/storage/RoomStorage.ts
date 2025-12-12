
import { RealmSchema } from 'src/storage/enum';
import RealmDatabase from 'src/storage/realm/realm';

export enum HolepunchRoomType {
  GROUP = 'GROUP',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
  INBOX = 'INBOX',  // Personal inbox room
}

export interface HolepunchRoom {
  roomId: string,
  roomKey: string,
  roomType: HolepunchRoomType,
  roomName: string,
  roomDescription: string,
  peers: string[],
  creator: string,
  createdAt: number,
  lastActive: number,
  initializedIdentity: boolean,  // true if the identity message has been sent to the room
  roomImage?: string,
  
  // DM-specific fields
  otherParticipantPubKey?: string,   // For DMs: the other person's public key
  isInboxRoom?: boolean,              // Flag for inbox rooms
}

export class RoomStorage {
  /**
   * Save or update a room in Realm
   */
  static async saveRoom(room: HolepunchRoom): Promise<void> {
    try {
      RealmDatabase.create(RealmSchema.HolepunchRoom, room, 'modified');
      console.log('[RoomStorage] Room saved:', room.roomId);
    } catch (error) {
      console.error('[RoomStorage] Failed to save room:', error);
      throw error;
    }
  }

  /**
   * Get all saved rooms
   */
  static async getAllRooms(): Promise<HolepunchRoom[]> {
    try {
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return [];
      // Convert Realm objects to HolepunchRoom
      const rooms: HolepunchRoom[] = Array.from(realmRooms as Realm.Results<any>).map((r) => ({
        roomId: String(r.roomId),
        roomKey: String(r.roomKey),
        roomType: String(r.roomType) as HolepunchRoomType,
        roomName: String(r.roomName),
        roomDescription: String(r.roomDescription),
        peers: r.peers.map(String),
        creator: String(r.creator),
        createdAt: Number(r.createdAt),
        lastActive: Number(r.lastActive),
        initializedIdentity: Boolean(r.initializedIdentity),
        roomImage: r.roomImage ? String(r.roomImage) : undefined,
        otherParticipantPubKey: r.otherParticipantPubKey ? String(r.otherParticipantPubKey) : undefined,
        isInboxRoom: r.isInboxRoom ? Boolean(r.isInboxRoom) : undefined,
      }));
      // Sort by last active (most recent first)
      rooms.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
      return rooms;
    } catch (error) {
      console.error('[RoomStorage] Failed to get rooms:', error);
      return [];
    }
  }

  /**
   * Get a specific room by ID
   */
  static async getRoom(roomId: string): Promise<HolepunchRoom | null> {
    try {
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return null;
      const r = (realmRooms as Realm.Results<any>).filtered('roomId == $0', roomId)[0];
      if (!r) return null;
      return {
        roomId: String(r.roomId),
        roomKey: String(r.roomKey),
        roomType: String(r.roomType) as HolepunchRoomType,
        roomName: String(r.roomName),
        roomDescription: String(r.roomDescription),
        peers: r.peers.map(String),
        creator: String(r.creator),
        createdAt: Number(r.createdAt),
        lastActive: Number(r.lastActive),
        initializedIdentity: Boolean(r.initializedIdentity),
        roomImage: r.roomImage ? String(r.roomImage) : undefined,
        otherParticipantPubKey: r.otherParticipantPubKey ? String(r.otherParticipantPubKey) : undefined,
        isInboxRoom: r.isInboxRoom ? Boolean(r.isInboxRoom) : undefined,
      };
    } catch (error) {
      console.error('[RoomStorage] Failed to get room:', error);
      return null;
    }
  }

    /**
   * Update room's initialized identity flag
   */
    static async updateInitializedIdentity(roomId: string): Promise<void> {
      try {
        const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
        if (!realmRooms) return;
        const r = (realmRooms as Realm.Results<any>).filtered('roomId == $0', roomId)[0];
        if (r) {
          RealmDatabase.write(() => {
            r.initializedIdentity = true;
          });
        }
      } catch (error) {
        console.error('[RoomStorage] Failed to update initialized identity:', error);
      }
    }

  /**
   * Delete a room
   */
  static async deleteRoom(roomId: string): Promise<void> {
    try {
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return;
      const r = (realmRooms as Realm.Results<any>).filtered('roomId == $0', roomId)[0];
      if (r) {
        RealmDatabase.delete(r);
        console.log('[RoomStorage] Room deleted:', roomId);
      }
    } catch (error) {
      console.error('[RoomStorage] Failed to delete room:', error);
      throw error;
    }
  }

  /**
   * Clear all rooms (for testing/debugging)
   */
  static async clearAllRooms(): Promise<void> {
    try {
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return;
      RealmDatabase.write(() => {
        (realmRooms as Realm.Results<any>).forEach((r: any) => {
          RealmDatabase.delete(r);
        });
      });
      console.log('[RoomStorage] All rooms cleared');
    } catch (error) {
      console.error('[RoomStorage] Failed to clear rooms:', error);
      throw error;
    }
  }
}
