/**
 * HyperswarmManager
 * 
 * Manages the Hyperswarm worklet and provides a clean API for React Native.
 * Handles all communication with the worklet via RPC over IPC.
 * 
 * This is a singleton - use getInstance() to access it.
 */

import { Worklet } from 'react-native-bare-kit';
import RPC from 'bare-rpc';
import b4a from 'b4a';
import bundle from '../worklet/app.bundle.mjs';
import { CommandIds, WorkletCommand, WorkletEvent } from '../constants/rpc-commands';
import { MessageEncryption } from '../../crypto/MessageEncryption';
import config from 'src/utils/config';
import type {
  KeyPair,
  WorkletReadyListener,
  PeerConnectedListener,
  PeerDisconnectedListener,
  MessageReceivedListener,
  WorkletErrorListener,
} from '../types/network.types';
import { HolepunchMessage } from '../../storage/MessageStorage';

// ============================================================================
// Manager Class
// ============================================================================

export class HyperswarmManager {
  private static instance: HyperswarmManager;
  
  private worklet: Worklet;
  private rpc: RPC | null = null;
  private initialized = false;
  
  // Root peer connection tracking
  private rootPeerConnected = false;
  private rootPeerConnectPromise: Promise<void> | null = null;
  private rootPeerConnectResolve: (() => void) | null = null;
  
  // Room key storage for encryption/decryption
  // Map: roomId (public topic) -> roomKey (secret for encryption)
  private roomKeys: Map<string, string> = new Map();
  
  // Event listeners
  private listeners = {
    ready: new Set<WorkletReadyListener>(),
    peerConnected: new Set<PeerConnectedListener>(),
    peerDisconnected: new Set<PeerDisconnectedListener>(),
    messageReceived: new Set<MessageReceivedListener>(),
    error: new Set<WorkletErrorListener>(),
    rootPeerConnected: new Set<() => void>(),
    rootPeerDisconnected: new Set<() => void>(),
  };

  private constructor() {
    this.worklet = new Worklet();
  }

  // --------------------------------------------------------------------------
  // Singleton Pattern
  // --------------------------------------------------------------------------

  static getInstance(): HyperswarmManager {
    if (!HyperswarmManager.instance) {
      HyperswarmManager.instance = new HyperswarmManager();
    }
    return HyperswarmManager.instance;
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  async initialize(seed: string): Promise<void> {
    if (this.initialized) {
      console.log('[HyperswarmManager] Already initialized');
      return;
    }

    try {
      console.log('[HyperswarmManager] Starting worklet...');
      
      // Create promise for root peer connection
      this.createRootPeerConnectPromise();
      
      const discoveryKey = config.HOLEPUNCH_ROOT_PEER_DISCOVERY;
      if (!discoveryKey) throw new Error('Discovery key not found');
      
      await this.worklet.start('/app.bundle', bundle, [seed, discoveryKey]);
      
      this.setupRPC();
      this.initialized = true;
      
      console.log('[HyperswarmManager] Initialized successfully');
      console.log('[HyperswarmManager] ⏳ Waiting for root peer connection...');
    } catch (error) {
      console.error('[HyperswarmManager] Initialization failed:', error);
      throw new Error(`Failed to initialize Hyperswarm: ${error.message}`);
    }
  }

  private createRootPeerConnectPromise(): void {
    this.rootPeerConnectPromise = new Promise((resolve) => {
      this.rootPeerConnectResolve = resolve;
    });
  }

  private setupRPC(): void {
    this.rpc = new RPC(this.worklet.IPC, async (req) => {
      try {
        const data = b4a.toString(req.data);
        const payload = JSON.parse(data);
        
        this.handleWorkletEvent(req.command, payload);
      } catch (error) {
        console.error('[HyperswarmManager] Error processing worklet event:', error);
      }
    });
  }

  private handleWorkletEvent(eventType: number, payload: any): void {
    switch (eventType) {
      case CommandIds[WorkletEvent.READY]:
        this.emit('ready', payload);
        break;
      
      case CommandIds[WorkletEvent.PEER_CONNECTED]:
        // Check if this is the root peer
        if (payload.isRootPeer === true) {
          console.log('[HyperswarmManager] 🏰 Root peer connected!');
          this.rootPeerConnected = true;
          
          // Resolve the promise if anyone is waiting
          if (this.rootPeerConnectResolve) {
            this.rootPeerConnectResolve();
            this.rootPeerConnectResolve = null;
          }
          
          // Emit root peer connected event
          this.emitRootPeerEvent('rootPeerConnected');
        }
        this.emit('peerConnected', payload);
        break;
      
      case CommandIds[WorkletEvent.PEER_DISCONNECTED]:
        // Check if this is the root peer
        if (payload.isRootPeer === true) {
          console.log('[HyperswarmManager] 👋 Root peer disconnected!');
          this.rootPeerConnected = false;
          
          // Create new promise for next connection
          this.createRootPeerConnectPromise();
          
          // Emit root peer disconnected event
          this.emitRootPeerEvent('rootPeerDisconnected');
        }
        this.emit('peerDisconnected', payload);
        break;
      
      case CommandIds[WorkletEvent.MESSAGE_RECEIVED]:
        // Decrypt message if encrypted
        this.handleMessageReceived(payload);
        break;
      
      case CommandIds[WorkletEvent.ERROR]:
        this.emit('error', payload);
        break;
      
      default:
        console.warn('[HyperswarmManager] Unknown event type:', eventType);
    }
  }

  /**
   * Handle received message - decrypt if encrypted
   */
  private handleMessageReceived(payload: any): void {
    try {
        const roomTopic = payload.roomTopic || payload.message.roomTopic;
        const roomKey = this.roomKeys.get(roomTopic);
        
        if (!roomKey) {
          console.error('[HyperswarmManager] ❌ Cannot decrypt - room key not found for:', roomTopic?.substring(0, 16));
          this.emit('error', { error: 'Cannot decrypt message - room key not found' });
          return;
        }
        
        console.log('[HyperswarmManager] 🔓 Decrypting received message...');
        
        // Decrypt the message - handle different formats
        let encryptedData: string;
        
        if (typeof payload.message === 'string') {
          // Direct encrypted string (from P2P messages)
          encryptedData = payload.message;
        } else if (payload.message && typeof payload.message === 'object') {
          // Object with metadata from root peer sync
          // Backend stores as: { message: "encrypted_string", storedAt, fromPeer, senderPublicKey }
          if (payload.message.message && typeof payload.message.message === 'string') {
            encryptedData = payload.message.message;
          } else {
            throw new Error('Could not find encrypted data in message object');
          }
        } else {
          throw new Error('Invalid message format');
        }
        
        const decryptedMessage = MessageEncryption.decrypt(roomKey, encryptedData);
        
        console.log('[HyperswarmManager] ✅ Message decrypted successfully');
        
        // Emit decrypted message
        this.emit('messageReceived', decryptedMessage);

    } catch (error) {
      console.error('[HyperswarmManager] ❌ Decryption failed:', error);
      this.emit('error', { 
        error: 'Failed to decrypt message',
        details: error.message,
      });
    }
  }

  // --------------------------------------------------------------------------
  // Commands (React Native → Worklet)
  // --------------------------------------------------------------------------

  async getKeys(): Promise<KeyPair> {
    this.ensureInitialized();
    
    const request = this.rpc!.request(CommandIds[WorkletCommand.GET_KEYS]);
    request.send('');
    
    const reply = await request.reply();
    const response = JSON.parse(b4a.toString(reply));
    
    return response;
  }

  async getConnectedPeers(): Promise<string[]> {
    this.ensureInitialized();
    
    const request = this.rpc!.request(CommandIds[WorkletCommand.GET_CONNECTED_PEERS]);
    request.send('');
    
    const reply = await request.reply();
    const response = JSON.parse(b4a.toString(reply));
    
    return response;
  }

  /**
   * Manually trigger root peer reconnection
   * This rejoins the discovery swarm to actively search for the root peer
   */
  async reconnectRootPeer(): Promise<{ success: boolean; alreadyConnected?: boolean }> {
    this.ensureInitialized();
    
    console.log('[HyperswarmManager] 🔄 Triggering manual root peer reconnection...');
    
    const request = this.rpc!.request(CommandIds[WorkletCommand.RECONNECT_ROOT_PEER]);
    request.send('');
    
    const reply = await request.reply();
    const response = JSON.parse(b4a.toString(reply));
    
    return response;
  }

  /**
   * Wait for root peer to connect
   * @param timeout - Timeout in milliseconds (default: 5000ms / 5 seconds)
   * @param triggerReconnect - If true, actively trigger reconnection before waiting (default: true)
   * @throws Error if timeout reached or root peer doesn't connect
   */
  async waitForRootPeer(timeout: number = 5000, triggerReconnect: boolean = true): Promise<void> {
    if (this.rootPeerConnected) {
      console.log('[HyperswarmManager] ✅ Root peer already connected');
      return;
    }

    // Actively trigger reconnection to refresh discovery
    if (triggerReconnect) {
      console.log('[HyperswarmManager] 🔄 Triggering active reconnection...');
      try {
        await this.reconnectRootPeer();
      } catch (error) {
        console.warn('[HyperswarmManager] ⚠️ Reconnect trigger failed, will still wait:', error);
      }
    }

    console.log('[HyperswarmManager] ⏳ Waiting for root peer to connect...');
    console.log('[HyperswarmManager] 📡 Worklet is actively searching on discovery swarm...');

    // Ensure we have a fresh promise (in case the old one was rejected)
    if (!this.rootPeerConnectPromise || !this.rootPeerConnectResolve) {
      console.log('[HyperswarmManager] 🔄 Creating new connection promise...');
      this.createRootPeerConnectPromise();
    }

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout waiting for root peer connection. Please ensure the backend server is running.'));
      }, timeout);
    });

    try {
      await Promise.race([this.rootPeerConnectPromise!, timeoutPromise]);
      console.log('[HyperswarmManager] ✅ Root peer connected successfully');
    } catch (error) {
      console.error('[HyperswarmManager] ❌ Failed to connect to root peer:', error);
      console.log('[HyperswarmManager] 🔍 Worklet will continue searching in background...');
      throw error;
    }
  }

  /**
   * Check if root peer is currently connected
   */
  isRootPeerConnected(): boolean {
    return this.rootPeerConnected;
  }

  /**
   * Join a room with encryption
   * @param roomTopic - Room ID (hash of room key) for P2P discovery
   * @param roomKey - 64-char hex room key for message encryption (not sent to worklet)
   */
  async joinRoom(roomTopic: string, roomKey: string): Promise<{ success: boolean; alreadyJoined?: boolean }> {
    this.ensureInitialized();
    
    // ⚠️ IMPORTANT: Wait for root peer connection before allowing room join
    if (!this.rootPeerConnected) {
      console.log('[HyperswarmManager] 🚫 Root peer not connected. Waiting...');
      try {
        await this.waitForRootPeer();
      } catch (error) {
        throw new Error('Cannot join room: Root peer is not connected. Please ensure the backend server is running and try again.');
      }
    }
    
    // Validate room key format
    if (!MessageEncryption.isValidRoomKey(roomKey)) {
      throw new Error('Invalid room key format - must be 64 hex characters');
    }
    
    // Store room key for encryption/decryption (NOT sent to worklet)
    this.roomKeys.set(roomTopic, roomKey);
    
    console.log('[HyperswarmManager] Joining room:', roomTopic, '(with encryption)');
    
    // Send only roomTopic to worklet (room key stays in React Native)
    const request = this.rpc!.request(CommandIds[WorkletCommand.JOIN_ROOM]);
    request.send(JSON.stringify({ roomTopic }));
    
    const reply = await request.reply();
    const response = JSON.parse(b4a.toString(reply));
    
    return response;
  }

  async leaveRoom(roomTopic: string): Promise<{ success: boolean }> {
    this.ensureInitialized();
    
    console.log('[HyperswarmManager] Leaving room:', roomTopic);
    
    const request = this.rpc!.request(CommandIds[WorkletCommand.LEAVE_ROOM]);
    request.send(JSON.stringify({ roomTopic }));
    
    const reply = await request.reply();
    const response = JSON.parse(b4a.toString(reply));
    
    return response;
  }

  /**
   * Send an encrypted message to a room
   * @param roomTopic - Room ID
   * @param message - Message object to encrypt and send
   */
  async sendMessage(roomTopic: string, message: HolepunchMessage): Promise<{ success: boolean; sentTo: number }> {
    this.ensureInitialized();
    
    // Get room key for encryption
    const roomKey = this.roomKeys.get(roomTopic);
    if (!roomKey) {
      throw new Error('Room key not found - room not joined or key not stored');
    }
    
    console.log('[HyperswarmManager] 🔐 Encrypting and sending message to room:', roomTopic);
    
    try {
      // Encrypt message in React Native
      const encryptedData = MessageEncryption.encrypt(roomKey, message);
      console.log('[HyperswarmManager] ✅ Message encrypted, size:', encryptedData.length, 'bytes');
      
      // Send encrypted data to worklet (worklet doesn't decrypt, just forwards)
      const request = this.rpc!.request(CommandIds[WorkletCommand.SEND_MESSAGE]);
      const envelope = {
        message: encryptedData, // Send encrypted string instead of plain message
        roomTopic,
        encrypted: true, // Flag to indicate this is encrypted
        // senderPublicKey: this.keyPair.publicKey (added by the worklet)
      };
      request.send(JSON.stringify(envelope));
      
      const reply = await request.reply();
      const response = JSON.parse(b4a.toString(reply));
      if(!response.success) throw new Error(response.error)
      
      return response;
    } catch (error) {
      console.error('[HyperswarmManager] ❌ Encryption failed:', error);
      throw new Error(`Failed to encrypt message: ${error.message}`);
    }
  }

  /**
   * Manually request sync from root peer starting at a specific message index
   * @param roomTopic - Room ID
   * @param lastIndex - Start syncing from this message index (0 = all messages)
   */
  async requestSync(roomTopic: string, lastIndex: number = 0): Promise<{ success: boolean }> {
    this.ensureInitialized();
    
    console.log('[HyperswarmManager] 🔄 Requesting sync from index:', lastIndex, 'for room:', roomTopic);
    
    const request = this.rpc!.request(CommandIds[WorkletCommand.REQUEST_SYNC]);
    request.send(JSON.stringify({ roomTopic, lastIndex }));
    
    const reply = await request.reply();
    const response = JSON.parse(b4a.toString(reply));
    
    console.log('[HyperswarmManager] ✅ Sync request sent');
    
    return response;
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------

  onReady(listener: WorkletReadyListener): () => void {
    this.listeners.ready.add(listener);
    return () => this.listeners.ready.delete(listener);
  }

  onPeerConnected(listener: PeerConnectedListener): () => void {
    this.listeners.peerConnected.add(listener);
    return () => this.listeners.peerConnected.delete(listener);
  }

  onPeerDisconnected(listener: PeerDisconnectedListener): () => void {
    this.listeners.peerDisconnected.add(listener);
    return () => this.listeners.peerDisconnected.delete(listener);
  }

  /**
   * Register a listener for root peer connection events
   * @returns cleanup function to remove the listener
   */
  onRootPeerConnected(listener: () => void): () => void {
    this.listeners.rootPeerConnected.add(listener);
    return () => this.listeners.rootPeerConnected.delete(listener);
  }

  /**
   * Register a listener for root peer disconnection events
   * @returns cleanup function to remove the listener
   */
  onRootPeerDisconnected(listener: () => void): () => void {
    this.listeners.rootPeerDisconnected.add(listener);
    return () => this.listeners.rootPeerDisconnected.delete(listener);
  }

  onMessageReceived(listener: MessageReceivedListener): () => void {
    this.listeners.messageReceived.add(listener);
    return () => this.listeners.messageReceived.delete(listener);
  }

  onError(listener: WorkletErrorListener): () => void {
    this.listeners.error.add(listener);
    return () => this.listeners.error.delete(listener);
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private emit<K extends keyof typeof this.listeners>(
    event: K,
    payload?: any
  ): void {
    const listeners = this.listeners[event];
    listeners.forEach((listener) => {
      try {
        // Root peer events don't take any arguments
        if (event === 'rootPeerConnected' || event === 'rootPeerDisconnected') {
          (listener as () => void)();
        } else {
          (listener as (payload: any) => void)(payload);
        }
      } catch (error) {
        console.error(`[HyperswarmManager] Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Helper to emit root peer events (no payload)
   */
  private emitRootPeerEvent(event: 'rootPeerConnected' | 'rootPeerDisconnected'): void {
    this.emit(event);
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.rpc) {
      throw new Error('HyperswarmManager not initialized. Call initialize() first.');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // --------------------------------------------------------------------------
  // Cleanup
  // --------------------------------------------------------------------------

  async destroy(): Promise<void> {
    console.log('[HyperswarmManager] Shutting down...');
    
    // Clear all listeners
    Object.values(this.listeners).forEach(set => set.clear());
    
    // TODO: Add worklet.terminate() if available
    this.initialized = false;
    this.rpc = null;
    
    console.log('[HyperswarmManager] Shutdown complete');
  }
}

// Export singleton instance getter
export default HyperswarmManager.getInstance;
