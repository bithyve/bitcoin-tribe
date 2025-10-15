/**
 * useChat Hook
 * React hook for using Holepunch P2P chat.
 */

import { useState, useEffect, useCallback } from 'react';
import { ChatService } from '../services/messaging/ChatService';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { HolepunchRoom, HolepunchRoomType } from 'src/services/messaging/holepunch/storage/RoomStorage';
import { HolepunchMessageType } from 'src/services/messaging/holepunch/storage/MessageStorage';

interface UseChatResult {
  // State
  isInitializing: boolean;  // True while HyperswarmManager is starting up
  isConnected: boolean;     // True when joined a room
  isRootPeerConnected: boolean; // True when root peer is connected
  currentRoom: any | null;
  connectedPeers: string[];

  // Actions
  createRoom: (roomName: string, roomType: HolepunchRoomType, roomDescription: string, roomImage?: string) => Promise<void>;
  joinRoom: (roomKey: string, roomName?: string, roomType?: HolepunchRoomType, roomDescription?: string, roomImage?: string) => Promise<HolepunchRoom>;
  sendMessage: (text: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  reconnectRootPeer: () => Promise<void>;

  // Fetchers
  getAllRooms: () => Promise<any[]>;
  getPubKey: () => string | null;
  // getMessagesForRoom: (roomId: string) => Promise<any[]>;

  // Loading states
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  isSendingMessage: boolean;
  isReconnecting: boolean;

  // Error
  error: string | null;
}

export function useChat(): UseChatResult {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRootPeerConnected, setIsRootPeerConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<HolepunchRoom | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatService = ChatService.getInstance();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0] as any;
  const seed = app.primarySeed.toString();

  // Initialize service (starts worklet, waits for root peer)
  useEffect(() => {
    if (seed && !chatService.isInitialized()) {
      setIsInitializing(true);
      console.log('[useChat] Initializing with seed:', seed)
      chatService.initialize(seed)
        .then(() => {
          console.log('[useChat] ✅ Initialized');
          setIsInitializing(false);
        })
        .catch(err => {
          console.error('[useChat] ❌ Failed to initialize:', err);
          setError(err.message);
          setIsInitializing(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);


  // Set up event listeners
  useEffect(() => {
    if (!chatService.isInitialized()) {
      return () => { }; // Return empty cleanup function
    }

    const adapter = chatService.getAdapter();

    // Set initial root peer connection status
    const initialStatus = adapter.isRootPeerConnected();
    setIsRootPeerConnected(initialStatus);

    const handleMessage = () => {
      // console.log('[useChat] Received message:', message);
    };

    const handleRoomCreated = (room: any) => {
      console.log('[useChat] Created room:', room);
      setCurrentRoom(room);
      setIsConnected(true);
    };

    const handleRoomJoined = (room: any) => {
      console.log('[useChat] Joined room:', room);
      setCurrentRoom(room);
      setIsConnected(true);
    };

    const handlePeerConnected = async () => {
      const peers = await adapter.getConnectedPeers();
      setConnectedPeers(peers);
    };

    const handlePeerDisconnected = async () => {
      const peers = await adapter.getConnectedPeers();
      setConnectedPeers(peers);
    };

    const handleRootPeerConnected = () => {
      console.log('[useChat] 🏰 Root peer connected');
      setIsRootPeerConnected(true);
    };

    const handleRootPeerDisconnected = () => {
      console.log('[useChat] 👋 Root peer disconnected');
      setIsRootPeerConnected(false);
    };

    adapter.on('chat:message-received', handleMessage);
    adapter.on('chat:room-created', handleRoomCreated);
    adapter.on('chat:room-joined', handleRoomJoined);
    adapter.on('chat:peer-connected', handlePeerConnected);
    adapter.on('chat:peer-disconnected', handlePeerDisconnected);
    adapter.on('chat:root-peer-connected', handleRootPeerConnected);
    adapter.on('chat:root-peer-disconnected', handleRootPeerDisconnected);

    return () => {
      adapter.off('chat:message-received', handleMessage);
      adapter.off('chat:room-created', handleRoomCreated);
      adapter.off('chat:room-joined', handleRoomJoined);
      adapter.off('chat:peer-connected', handlePeerConnected);
      adapter.off('chat:peer-disconnected', handlePeerDisconnected);
      adapter.off('chat:root-peer-connected', handleRootPeerConnected);
      adapter.off('chat:root-peer-disconnected', handleRootPeerDisconnected);
    };
  }, [chatService.isInitialized()]);

  const createRoom = useCallback(async (roomName: string, roomType: HolepunchRoomType, roomDescription: string, roomImage?: string) => {
    setIsCreatingRoom(true);
    setError(null);
    try {
      const adapter = chatService.getAdapter();
      await adapter.createRoom(roomName, roomType, roomDescription, roomImage);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreatingRoom(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomKey: string, roomName?: string, roomType?: HolepunchRoomType, roomDescription?: string, roomImage?: string): Promise<HolepunchRoom> => {
    setIsJoiningRoom(true);
    setError(null);
    try {
      console.log('[useChat] Joining room with key:', roomKey);
      const adapter = chatService.getAdapter();
      return await adapter.joinRoom(roomKey, roomName, roomType, roomDescription, roomImage);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsJoiningRoom(false);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    setIsSendingMessage(true);
    setError(null);
    try {
      const adapter = chatService.getAdapter();
      await adapter.sendMessage(text, HolepunchMessageType.TEXT);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSendingMessage(false);
    }
  }, []);

  const leaveRoom = useCallback(async () => {
    try {
      const adapter = chatService.getAdapter();
      await adapter.leaveRoom();
      setIsConnected(false);
      setCurrentRoom(null);
      setConnectedPeers([]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Manually reconnect to root peer
   * Useful for pull-to-refresh functionality
   */
  const reconnectRootPeer = useCallback(async () => {
    if (!chatService.isInitialized()) {
      console.warn('[useChat] Cannot reconnect - service not initialized');
      return;
    }

    setIsReconnecting(true);
    setError(null);
    
    try {
      const adapter = chatService.getAdapter();
      
      // Check if already connected
      if (adapter.isRootPeerConnected()) {
        console.log('[useChat] ✅ Already connected to root peer');
        setIsReconnecting(false);
        return;
      }

      console.log('[useChat] 🔄 Attempting to reconnect to root peer...');
      
      // Access the manager through the adapter to trigger reconnection
      const manager = (adapter as any).manager;
      const result = await manager.reconnectRootPeer();
      
      if (result.alreadyConnected) {
        console.log('[useChat] ✅ Root peer already connected');
        setIsRootPeerConnected(true);
      } else if (result.success) {
        console.log('[useChat] 🔄 Reconnection initiated, waiting for connection...');
        // The connection status will be updated via the event listener
        // Wait a bit for the connection to establish
        await manager.waitForRootPeer(3000, false); // 3 second timeout, don't trigger another reconnect
        console.log('[useChat] ✅ Successfully reconnected to root peer');
      } else {
        throw new Error('Failed to initiate reconnection');
      }
    } catch (err: any) {
      console.error('[useChat] ❌ Failed to reconnect to root peer:', err);
      setError(err.message || 'Failed to reconnect to server');
      throw err;
    } finally {
      setIsReconnecting(false);
    }
  }, [chatService]);

  // Fetch all rooms using chatAdapter
  const getAllRooms = useCallback(async () => {
    const adapter = chatService.getAdapter();
    return await adapter.getAllRooms();
  }, []);

  // Get the peer public key
  const getPubKey = useCallback(() => {
    const adapter = chatService.getAdapter();
    return adapter.getKeyPair().publicKey;
  }, []);

  // Fetch all messages for a given room using chatAdapter
  // const getMessagesForRoom = useCallback(async (roomId: string) => {
  //   const adapter = chatService.getAdapter();
  //   return await adapter.getMessagesForRoom(roomId);
  // }, []);

  return {
    isInitializing,
    isConnected,
    isRootPeerConnected,
    currentRoom,
    connectedPeers,
    createRoom,
    joinRoom,
    sendMessage,
    leaveRoom,
    reconnectRootPeer,
    getAllRooms,
    getPubKey,
    // getMessagesForRoom,
    isCreatingRoom,
    isJoiningRoom,
    isSendingMessage,
    isReconnecting,
    error,
  };
}
