import { RealmSchema } from 'src/storage/enum';
import RealmDatabase from 'src/storage/realm/realm';

export interface HolepunchPeer {
  peerId: string;
  peerName?: string;
  peerImage?: string;
}

export class PeerStorage {
  /**
   * Save or update a peer globally
   */
  static async savePeer(peer: HolepunchPeer): Promise<void> {
    try {
      RealmDatabase.create(RealmSchema.HolepunchPeer, peer, 'modified');
      console.log('[PeerStorage] Peer saved:', peer.peerId.substring(0, 8), peer.peerName);
    } catch (error) {
      console.error('[PeerStorage] Failed to save peer:', error);
      throw error;
    }
  }

  /**
   * Get a specific peer by ID
   */
  static async getPeer(peerId: string): Promise<HolepunchPeer | null> {
    try {
      const realmPeers = RealmDatabase.get(RealmSchema.HolepunchPeer);
      if (!realmPeers) return null;
      
      const p = (realmPeers as Realm.Results<any>).filtered('peerId == $0', peerId)[0];
      if (!p) return null;
      
      return {
        peerId: String(p.peerId),
        peerName: p.peerName ? String(p.peerName) : undefined,
        peerImage: p.peerImage ? String(p.peerImage) : undefined,
      };
    } catch (error) {
      console.error('[PeerStorage] Failed to get peer:', error);
      return null;
    }
  }

  /**
   * Get all peers for a specific room (by looking up room.peers array)
   */
  static async getPeersForRoom(roomId: string): Promise<HolepunchPeer[]> {
    try {
      // Get the room first
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return [];
      
      const room = (realmRooms as Realm.Results<any>).filtered('roomId == $0', roomId)[0];
      if (!room || !room.peers) return [];
      
      // Get all peers in the room
      const peerIds: string[] = Array.from(room.peers);
      const peers: HolepunchPeer[] = [];
      
      for (const peerId of peerIds) {
        const peer = await this.getPeer(peerId);
        if (peer) {
          peers.push(peer);
        }
      }
      
      return peers;
    } catch (error) {
      console.error('[PeerStorage] Failed to get peers for room:', error);
      return [];
    }
  }

  /**
   * Add a peer to a room's peers array
   */
  static async addPeerToRoom(peerId: string, roomId: string): Promise<void> {
    try {
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return;
      
      const room = (realmRooms as Realm.Results<any>).filtered('roomId == $0', roomId)[0];
      if (!room) {
        console.warn('[PeerStorage] Room not found:', roomId);
        return;
      }
      
      RealmDatabase.write(() => {
        const peers = Array.from(room.peers || []);
        if (!peers.includes(peerId)) {
          peers.push(peerId);
          room.peers = peers;
          console.log('[PeerStorage] Peer added to room:', peerId.substring(0, 8), 'in', roomId.substring(0, 8));
        }
      });
    } catch (error) {
      console.error('[PeerStorage] Failed to add peer to room:', error);
      throw error;
    }
  }

  /**
   * Remove a peer from a room's peers array
   */
  static async removePeerFromRoom(peerId: string, roomId: string): Promise<void> {
    try {
      const realmRooms = RealmDatabase.get(RealmSchema.HolepunchRoom);
      if (!realmRooms) return;
      
      const room = (realmRooms as Realm.Results<any>).filtered('roomId == $0', roomId)[0];
      if (!room) return;
      
      RealmDatabase.write(() => {
        const peers = Array.from(room.peers || []);
        const index = peers.indexOf(peerId);
        if (index > -1) {
          peers.splice(index, 1);
          room.peers = peers;
          console.log('[PeerStorage] Peer removed from room:', peerId.substring(0, 8));
        }
      });
    } catch (error) {
      console.error('[PeerStorage] Failed to remove peer from room:', error);
      throw error;
    }
  }
}

