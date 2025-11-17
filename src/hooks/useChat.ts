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
import { HolepunchMessage, HolepunchMessageType } from 'src/services/messaging/holepunch/storage/MessageStorage';
import { HolepunchPeer } from 'src/services/messaging/holepunch/storage/PeerStorage';
import { PeerStorage } from 'src/services/messaging/holepunch/storage/PeerStorage';

interface UseChatResult {
  // State
  isInitializing: boolean;  // True while HyperswarmManager is starting up
  isConnected: boolean;     // True when joined a room
  isRootPeerConnected: boolean; // True when root peer is connected
  currentRoom: any | null;
  connectedPeers: string[];
  sessionMessages: HolepunchMessage[];

  // Actions
  createRoom: (roomName: string, roomType: HolepunchRoomType, roomDescription: string, roomImage?: string, roomKeyToJoin?: string) => Promise<void>;
  joinRoom: (roomKey: string, lastSyncIndex: number) => Promise<HolepunchRoom>;
  sendMessage: (text: string, messageType: HolepunchMessageType) => Promise<void>;
  leaveRoom: () => Promise<void>;
  reconnectRootPeer: () => Promise<void>;
  sendDMInvitation: (recipientPublicKey: string, recipientName?: string, recipientImage?: string) => Promise<HolepunchRoom>;
  syncInbox: () => Promise<{ synced: boolean }>;

  // Fetchers
  getAllRooms: () => Promise<any[]>;
  getCurrentPeerPubKey: () => string | null;
  getPeersForRoom: (roomId: string) => Promise<HolepunchPeer[]>;
  getInboxRoom: () => Promise<HolepunchRoom | null>;
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
  const [sessionMessages, setSessionMessages] = useState<HolepunchMessage[]>([]);

  const chatService = ChatService.getInstance();
  const app: TribeApp = useQuery(RealmSchema.TribeApp)[0] as any;
  const seed = app.primarySeed.toString();

  // Initialize service (starts worklet, waits for root peer)
  useEffect(() => {
    if (seed && !chatService.isInitialized()) {
      setIsInitializing(true);

      // Set user profile from TribeApp
      const userProfile = {
        name: app?.appName || 'Anonymous',
        image: app?.walletImage || app?.imageUrl || '',
      };
      console.log('[useChat] Initializing with seed:', seed)
      chatService.initialize(seed, userProfile)
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
  }, [seed, app]);


  // Set up event listeners
  useEffect(() => {
    if (!chatService.isInitialized()) {
      return () => { }; // Return empty cleanup function
    }

    const adapter = chatService.getAdapter();

    // Set initial root peer connection status
    const initialStatus = adapter.isRootPeerConnected();
    setIsRootPeerConnected(initialStatus);

    const handleSessionMessage = (message: HolepunchMessage) => {
      console.log('[useChat] Received message:', { message });
      setSessionMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleRoomCreated = (room: HolepunchRoom) => {
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

    adapter.on('chat:message-received', handleSessionMessage);
    adapter.on('chat:message-sent', handleSessionMessage);
    adapter.on('chat:room-created', handleRoomCreated);
    adapter.on('chat:room-joined', handleRoomJoined);
    adapter.on('chat:peer-connected', handlePeerConnected);
    adapter.on('chat:peer-disconnected', handlePeerDisconnected);
    adapter.on('chat:root-peer-connected', handleRootPeerConnected);
    adapter.on('chat:root-peer-disconnected', handleRootPeerDisconnected);

    return () => {
      adapter.off('chat:message-received', handleSessionMessage);
      adapter.off('chat:message-sent', handleSessionMessage);
      adapter.off('chat:room-created', handleRoomCreated);
      adapter.off('chat:room-joined', handleRoomJoined);
      adapter.off('chat:peer-connected', handlePeerConnected);
      adapter.off('chat:peer-disconnected', handlePeerDisconnected);
      adapter.off('chat:root-peer-connected', handleRootPeerConnected);
      adapter.off('chat:root-peer-disconnected', handleRootPeerDisconnected);
    };
  }, [chatService.isInitialized()]);

  const createRoom = useCallback(async (roomName: string, roomType: HolepunchRoomType, roomDescription: string, roomImage?: string, roomKeyToJoin?: string) => {
    setIsCreatingRoom(true);
    setError(null);
    try {
      const adapter = chatService.getAdapter();
      await adapter.createRoom(roomName, roomType, roomDescription, roomImage, roomKeyToJoin);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreatingRoom(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomKey: string, lastSyncIndex: number): Promise<HolepunchRoom> => {
    setIsJoiningRoom(true);
    setError(null);
    try {
      console.log('[useChat] Joining room with key:', roomKey);
      const adapter = chatService.getAdapter();
      return await adapter.joinRoom(roomKey, lastSyncIndex);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsJoiningRoom(false);
    }
  }, []);

  const sendMessage = useCallback(async (text: string, messageType: HolepunchMessageType) => {
    setIsSendingMessage(true);
    setError(null);
    try {
      const adapter = chatService.getAdapter();
      await adapter.sendMessage(text, messageType);
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
      setSessionMessages([]);
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
  const getCurrentPeerPubKey = useCallback(() => {
    if (!chatService.isInitialized()) {
      return null;
    }
    const adapter = chatService.getAdapter();
    return adapter.getKeyPair()?.publicKey || null;
  }, []);

  // Get peers for a specific room
  const getPeersForRoom = useCallback(async (roomId: string) => {
    return await PeerStorage.getPeersForRoom(roomId);
  }, []);

  // Send DM invitation to another user
  const sendDMInvitation = useCallback(async (
    recipientPublicKey: string,
    recipientName?: string,
    recipientImage?: string
  ): Promise<HolepunchRoom> => {
    setIsCreatingRoom(true);
    setError(null);
    try {
      const adapter = chatService.getAdapter();
      const dmRoom = await adapter.sendDMInvitation(
        recipientPublicKey,
        recipientName,
        recipientImage
      );
      return dmRoom;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreatingRoom(false);
    }
  }, []);

  // Get user's inbox room
  const getInboxRoom = useCallback(async () => {
    const adapter = chatService.getAdapter();
    return await adapter.getInboxRoom();
  }, []);

  // Sync inbox (creates inbox if needed, then syncs)
  const syncInbox = useCallback(async () => {
    const adapter = chatService.getAdapter();
    return await adapter.syncInbox();
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
    sessionMessages,
    createRoom,
    joinRoom,
    sendMessage,
    leaveRoom,
    reconnectRootPeer,
    sendDMInvitation,
    syncInbox,
    getAllRooms,
    getCurrentPeerPubKey,
    getPeersForRoom,
    getInboxRoom,
    // getMessagesForRoom,
    isCreatingRoom,
    isJoiningRoom,
    isSendingMessage,
    isReconnecting,
    error,
  };
}
