/**
 * Network Types for Bare Kit Hyperswarm Implementation
 * 
 * These types define the structure of messages, events, and data
 * exchanged between React Native and the Bare worklet.
 */

import { HolepunchMessage } from "../../storage/MessageStorage";

/**
 * Keypair for Hyperswarm identity
 */
export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

/**
 * Peer information
 */
export interface PeerInfo {
  publicKey: string;
  connectedAt: number;
  rooms: string[];
}

/**
 * Worklet events
 */
export interface WorkletReadyEvent {
  type: 'ready';
  publicKey: string;
}

export interface PeerConnectedEvent {
  peerPublicKey: string;
  timestamp: number;
}

export interface PeerDisconnectedEvent {
  peerPublicKey: string;
  timestamp: number;
}

export interface MessagesReceivedEvent {
  messages: {
    message: HolepunchMessage;
    senderPublicKey: string;
    roomTopic: string;
    fromRootPeer: boolean;
  }[];
}

export interface WorkletErrorEvent {
  error: string;
  context?: string;
  peerPublicKey?: string;
}

/**
 * Event listeners
 */
export type WorkletReadyListener = (event: WorkletReadyEvent) => void;
export type PeerConnectedListener = (event: PeerConnectedEvent) => void;
export type PeerDisconnectedListener = (event: PeerDisconnectedEvent) => void;
export type MessagesReceivedListener = (event: MessagesReceivedEvent) => void;
export type WorkletErrorListener = (event: WorkletErrorEvent) => void;
