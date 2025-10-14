/**
 * useChat Hook
 * React hook for using Holepunch P2P chat.
 */

import { useState, useEffect, useCallback } from 'react';
import { ChatService } from '../services/messaging/ChatService';
import { TribeApp } from 'src/models/interfaces/TribeApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/enum';
import { HolepunchRoom } from 'src/services/messaging/holepunch/storage/RoomStorage';

interface UseChatResult {
  // State
  isInitializing: boolean;  // True while HyperswarmManager is starting up
  isConnected: boolean;     // True when joined a room
  currentRoom: any | null;
  connectedPeers: string[];

  // Actions
  createRoom: (roomName: string) => Promise<void>;
  joinRoom: (roomKey: string, roomName?: string) => Promise<HolepunchRoom>;
  sendMessage: (text: string) => Promise<void>;
  leaveRoom: () => Promise<void>;

  // Fetchers
  getAllRooms: () => Promise<any[]>;
  getPubKey: () => string | null;
  // getMessagesForRoom: (roomId: string) => Promise<any[]>;

  // Loading states
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  isSendingMessage: boolean;

  // Error
  error: string | null;
}

export function useChat(): UseChatResult {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<HolepunchRoom | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatService = ChatService.getInstance();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0];
  const seed = app.primarySeed.toString('hex');

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
  }, [seed]);


  // Set up event listeners
  useEffect(() => {
    if (!chatService.isInitialized()) {
      return () => { }; // Return empty cleanup function
    }

    const adapter = chatService.getAdapter();

    const handleMessage = (message: any) => {
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

    adapter.on('chat:message-received', handleMessage);
    adapter.on('chat:room-created', handleRoomCreated);
    adapter.on('chat:room-joined', handleRoomJoined);
    adapter.on('chat:peer-connected', handlePeerConnected);
    adapter.on('chat:peer-disconnected', handlePeerDisconnected);

    return () => {
      adapter.off('chat:message-received', handleMessage);
      adapter.off('chat:room-created', handleRoomCreated);
      adapter.off('chat:room-joined', handleRoomJoined);
      adapter.off('chat:peer-connected', handlePeerConnected);
      adapter.off('chat:peer-disconnected', handlePeerDisconnected);
    };
  }, [chatService.isInitialized()]);

  const createRoom = useCallback(async (roomName: string) => {
    setIsCreatingRoom(true);
    setError(null);
    try {
      const adapter = chatService.getAdapter();
      await adapter.createRoom(roomName);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreatingRoom(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomKey: string, roomName?: string): Promise<HolepunchRoom> => {
    setIsJoiningRoom(true);
    setError(null);
    try {
      console.log('[useChat] Joining room with key:', roomKey);
      const adapter = chatService.getAdapter();
      return await adapter.joinRoom(roomKey, roomName);
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
      await adapter.sendMessage(text);
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
    currentRoom,
    connectedPeers,
    createRoom,
    joinRoom,
    sendMessage,
    leaveRoom,
    getAllRooms,
    getPubKey,
    // getMessagesForRoom,
    isCreatingRoom,
    isJoiningRoom,
    isSendingMessage,
    error,
  };
}
