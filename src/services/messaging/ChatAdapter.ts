/**
 * ChatAdapter
 * Adapter layer that bridges Tribe's UI/business logic
 * with the Holepunch P2P chat functionality (HyperswarmManager).
 * Orchestrates: HyperswarmManager and Storage
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { HyperswarmManager } from './holepunch/network/managers/HyperswarmManager';
import { MessageEncryption } from './holepunch/crypto/MessageEncryption';

import { RoomStorage, HolepunchRoom, HolepunchRoomType } from './holepunch/storage/RoomStorage';
import { MessageStorage, HolepunchMessage, HolepunchMessageType } from './holepunch/storage/MessageStorage';
import { KeyPair } from './holepunch/network/types/network.types';



export class ChatAdapter extends EventEmitter {
  private manager: HyperswarmManager;
  private currentRoom: HolepunchRoom | null = null;
  private keyPair: KeyPair | null = null;

  constructor() {
    super();
    this.manager = HyperswarmManager.getInstance();
    this.setupEventForwarding();
  }

  /**
   * Initialize the manager with seed (call once on app startup)
   */
  async initialize(seed: string): Promise<void> {
    await this.manager.initialize(seed);

    this.keyPair = await this.manager.getKeys();
  }

  /**
   * Forward HyperswarmManager events to application-specific events
   */
  private setupEventForwarding(): void {
    this.manager.onPeerConnected((data: any) => {
      this.emit('chat:peer-connected', data);
    });

    this.manager.onPeerDisconnected((data: any) => {
      this.emit('chat:peer-disconnected', data);
    });


    this.manager.onRootPeerConnected(() => {
      this.emit('chat:root-peer-connected');
    });

    this.manager.onRootPeerDisconnected(() => {
      this.emit('chat:root-peer-disconnected');
    });

    this.manager.onMessageReceived(async (data: any) => {
      // Persist message to storage
      if (this.currentRoom) {
        const savedMsg: HolepunchMessage = {
          messageId: data.messageId,
          roomId: data.roomId,
          senderId: data.senderId,
          messageType: data.messageType,
          content: data.content,
          timestamp: data.timestamp,
        };
        await MessageStorage.saveMessage(savedMsg);
        this.emit('chat:message-received', savedMsg);
      }
    });

    this.manager.onError((error: any) => {
      this.emit('chat:error', error);
    });
  }

  /**
   * Create a new chat room
   * Generates room key, derives topic, saves metadata
   */
  async createRoom(roomName: string, roomType: HolepunchRoomType, roomDescription: string, roomImage?: string): Promise<HolepunchRoom> {

    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    // Generate new room key (64-char hex)
    const roomKey = MessageEncryption.generateRoomKey();
    // Derive room topic (hash of room key)
    const roomTopic = MessageEncryption.deriveRoomId(roomKey);

    // Create room object
    this.currentRoom = {
      roomId: roomTopic,
      roomKey: roomKey,
      roomType: roomType,
      roomName: roomName,
      roomDescription: roomDescription,
      peers: [],
      creator: this.keyPair.publicKey,
      createdAt: Date.now(),
      lastActive: Date.now(),
      roomImage: roomImage,
    };

    // Save to storage
    await RoomStorage.saveRoom(this.currentRoom);
    await this.manager.joinRoom(roomTopic, roomKey);

    console.log('[ChatAdapter] ✅ Room created:', this.currentRoom.roomName);
    this.emit('chat:room-created', this.currentRoom);
    return this.currentRoom;
  }

  /**
   * Join existing room with room key
   */
  async joinRoom(roomKey: string, roomName?: string, roomType?: HolepunchRoomType, roomDescription?: string, roomImage?: string): Promise<HolepunchRoom> {
    // Validate room key
    if (!MessageEncryption.isValidRoomKey(roomKey)) {
      throw new Error('Invalid room key format');
    }

    // Derive room topic
    const roomTopic = MessageEncryption.deriveRoomId(roomKey);

    // Load any cached messages from storage
    const allRooms = await RoomStorage.getAllRooms();
    const existingRoom = allRooms.find(r => r.roomKey === roomKey);

    // Create room object
    if(existingRoom) {
      this.currentRoom = existingRoom;
    } else {
      // TODO: update fields once meta data for the new room is communicated ()
      this.currentRoom =  {
        roomId: roomTopic,
        roomKey: roomKey,
        roomType: roomType || HolepunchRoomType.GROUP,
        roomName: roomName || `Room ${roomTopic.substring(0, 8)}`,
        roomDescription: roomDescription || `Description for room ${roomTopic.substring(0, 8)}`,
        peers: [],
        creator: '', 
        createdAt: Date.now(),
        lastActive: Date.now(),
        roomImage: roomImage,
      };

      await RoomStorage.saveRoom(this.currentRoom);
    }

    // Join via HyperswarmManager (will sync messages from root peer)
    await this.manager.joinRoom(roomTopic, roomKey);

    console.log('[ChatAdapter] ✅ Room joined:', this.currentRoom.roomName);
    this.emit('chat:room-joined', this.currentRoom);
    return this.currentRoom;
  }

  /**
   * Send message to current room
   */
  async sendMessage(text: string, messageType: HolepunchMessageType): Promise<void> {
    if (!this.currentRoom) {
      throw new Error('No active room');
    }

    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    // Prepare message for both network and storage (HolepunchMessage type)
    const message: HolepunchMessage = {
      messageId: uuidv4(),
      roomId: this.currentRoom.roomId,
      senderId: this.keyPair.publicKey,
      messageType: messageType,
      content: text,
      timestamp: Date.now(),
    };

    // Send message over the network using topic hash
    const result = await this.manager.sendMessage(this.currentRoom.roomId, message);

    if (!result.success) {
      throw new Error('Failed to send message');
    }

    // Persist own message to storage
    if (this.currentRoom) {
      await MessageStorage.saveMessage(message);
      this.emit('chat:message-sent', {
        message,
        sentTo: result.sentTo,
      });
    }
  }

  /**
   * Request sync from root peer
   */
  async requestSync(roomId: string, lastIndex: number): Promise <{ success: boolean }> {
    return await this.manager.requestSync(roomId, lastIndex);
  }

  /**
   * Get message history for current room
   */
  async getMessageHistory(): Promise<any[]> {
    if (!this.currentRoom) return [];
    const messages = await MessageStorage.getMessagesForRoom(this.currentRoom.roomId);
    return messages;
  }

  /**
   * Fetch all rooms from persistent storage
   */
  async getAllRooms(): Promise<any[]> {
    return await RoomStorage.getAllRooms();
  }

  /**
   * Fetch all messages for a given room from persistent storage
   */
  async getMessagesForRoom(roomId: string): Promise<any[]> {
    const messages = await MessageStorage.getMessagesForRoom(roomId);
    return messages;
  }

  /**
   * Get connected peers info
   */
  async getConnectedPeers(): Promise<string[]> {
    if (!this.currentRoom) return [];
    return await this.manager.getConnectedPeers();
  }

  /**
   * Get current room info
   */
  getCurrentRoom(): HolepunchRoom | null {
    return this.currentRoom;
  }

  /**
  * Get the peer key pair
  */
  getKeyPair(): KeyPair | null {
    return this.keyPair;
  }

  /**
   * Leave current room and disconnect
   */
  async leaveRoom(): Promise<void> {
    if (!this.currentRoom) return;

    await this.manager.leaveRoom(this.currentRoom.roomId);
    this.currentRoom = null;
    this.emit('chat:room-left');
  }



  /**
   * Cleanup on logout/app close
   */
  async destroy(): Promise<void> {
    if (this.currentRoom) {
      await this.leaveRoom();
    }
    await this.manager.destroy();
    this.removeAllListeners();
  }
}
