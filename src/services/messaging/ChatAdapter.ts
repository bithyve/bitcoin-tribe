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
import { KeyPair, MessagesReceivedEvent } from './holepunch/network/types/network.types';
import { MessageProcessorRegistry } from './holepunch/processors/MessageProcessor';
import { IdentityProcessor } from './holepunch/processors/IdentityProcessor';
import { TextProcessor } from './holepunch/processors/TextProcessor';



export class ChatAdapter extends EventEmitter {
  private manager: HyperswarmManager;
  private currentRoom: HolepunchRoom | null = null;
  private keyPair: KeyPair | null = null;
  private processorRegistry: MessageProcessorRegistry;
  private userProfile: { name?: string; image?: string } | null = null;

  constructor() {
    super();
    this.manager = HyperswarmManager.getInstance();

    // Initialize message processor registry
    this.processorRegistry = new MessageProcessorRegistry();
    this.processorRegistry.register(new IdentityProcessor());
    this.processorRegistry.register(new TextProcessor());

    this.setupEventForwarding();
  }

  /**
   * Initialize the manager with seed (call once on app startup)
   */
  async initialize(seed: string, userProfile: { name?: string; image?: string }): Promise<void> {
    await this.manager.initialize(seed);

    this.keyPair = await this.manager.getKeys();
    this.userProfile = userProfile;
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

    this.manager.onMessagesReceived(async (event: MessagesReceivedEvent) => {
      // Processes and emits messages sequentially
      for (const { message, senderPublicKey, roomTopic, fromRootPeer } of event.messages) {
        // Process message (handles identity, text, etc.)
        const result = await this.processorRegistry.process(message, {
          roomId: this.currentRoom?.roomId,
          currentPeerPubKey: this.keyPair?.publicKey,
        });

        // Note 📢: Incoming messages are pesisted/commited only if they are from the ROOT Peer (maintains total message order across all peers)
        if (result.shouldSave && fromRootPeer) { // commited message stream (realm)
          await MessageStorage.saveMessage(result.processedMessage);
        }

        // Emit the display message (could be transformed, e.g., IDENTITY -> SYSTEM)
        if (result.shouldDisplay && !fromRootPeer) this.emit('chat:message-received', result.processedMessage); // emit the message to the session, uncommited message stream (sessoin messages) --> commited when resynced w/ the root peer (eventual total order consistency)
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
  async createRoom(roomName: string, roomType: HolepunchRoomType, roomDescription: string, roomImage?: string, roomKeyToJoin?: string): Promise<HolepunchRoom> {

    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    let roomKey: string;
    let creator: string;
    if (roomKeyToJoin) {
      // case: join a room created by someone else
      if (!MessageEncryption.isValidRoomKey(roomKeyToJoin)) {
        throw new Error('Invalid room key format');
      }
      roomKey = roomKeyToJoin;
      creator = '';
    } else {
      // case: create a new room
      roomKey = MessageEncryption.generateRoomKey();
      creator = this.keyPair.publicKey;
    }

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
      creator: creator,
      createdAt: Date.now(),
      lastActive: Date.now(),
      initializedIdentity: false,
      roomImage: roomImage,
    };

    // Save to storage
    await RoomStorage.saveRoom(this.currentRoom);
    console.log('[ChatAdapter] ✅ Room created:', this.currentRoom.roomName);
    this.emit('chat:room-created', this.currentRoom);
    return this.currentRoom;
  }

  /**
   * Join existing room with room key
   */
  async joinRoom(roomKey: string, lastSyncIndex: number): Promise<HolepunchRoom> {
    // Validate room key
    if (!MessageEncryption.isValidRoomKey(roomKey)) {
      throw new Error('Invalid room key format');
    }

    // Derive room topic
    const roomTopic = MessageEncryption.deriveRoomId(roomKey);

    // Load any cached messages from storage
    const allRooms = await RoomStorage.getAllRooms();
    const existingRoom = allRooms.find(r => r.roomKey === roomKey);

    if (!existingRoom) throw new Error('Room not found with key: ' + roomKey);
    this.currentRoom = existingRoom;

    // Join via HyperswarmManager (will sync messages from root peer)
    const { success, alreadyJoined } = await this.manager.joinRoom(roomTopic, roomKey);
    if (!success) throw new Error('Failed to join room');

    console.log('[ChatAdapter] ✅ Room joined:', this.currentRoom.roomName);
    this.emit('chat:room-joined', this.currentRoom);

    const syncResponse = await this.requestSync(this.currentRoom.roomId, lastSyncIndex) // essentially sync the room before sending the identity message(resolves sync conflict)
    
    if (syncResponse.success && !existingRoom.initializedIdentity) {
      console.log('[ChatAdapter] 📢 Sending identity message');
      await this.sendIdentityMessage(this.currentRoom) // Send identity message after joining a room for the first time
    }
    return this.currentRoom;
  };

  /**
   * Send message to current room
   */
  async sendMessage(content: string, messageType: HolepunchMessageType): Promise<void> {
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
      content,
      timestamp: Date.now(),
    };

    // Send message over the network using topic hash
    const { success, sentTo } = await this.manager.sendMessage(this.currentRoom.roomId, message);
    if (!success) throw new Error('Failed to send message');


    // Process message (handles identity, text, etc.)
    const result = await this.processorRegistry.process(message, {
      roomId: this.currentRoom.roomId,
      currentPeerPubKey: this.keyPair.publicKey,
    });

    // Note 📢: Self messages are pesisted upon synching w/ the root peer (maintains total message order across all peers)
    // if (result.shouldSave) {
    //   await MessageStorage.saveMessage(result.processedMessage);
    // }

    if (result.shouldDisplay) this.emit('chat:message-sent', result.processedMessage); // emit the message to the session
  }

  /**
   * Request sync from root peer
   */
  async requestSync(roomId: string, lastIndex: number): Promise<{ success: boolean }> {
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
   * Check if root peer is currently connected
   */
  isRootPeerConnected(): boolean {
    return this.manager.isRootPeerConnected();
  }

  /**
   * Send identity message to announce presence in room
   * Called automatically after joining a room
   */
  public async sendIdentityMessage(room: HolepunchRoom): Promise<void> {
    if (!this.currentRoom || !this.keyPair) {
      console.warn('[ChatAdapter] Cannot send identity - no room or keypair');
      return;
    }

    try {
      const identity = {
        name: this.userProfile?.name || 'Anonymous',
        publicKey: this.keyPair.publicKey,
        image: this.userProfile?.image || '',
      };

      console.log('[ChatAdapter] 📢 Sending identity message:', identity.name);
      await this.sendMessage(JSON.stringify(identity), HolepunchMessageType.IDENTITY);
      console.log('[ChatAdapter] ✅ Identity message sent');
      await RoomStorage.updateInitializedIdentity(room.roomId);
    } catch (error) {
      console.error('[ChatAdapter] ❌ Failed to send identity message:', error);
      // Don't throw - identity message failure shouldn't block room join
    }
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
