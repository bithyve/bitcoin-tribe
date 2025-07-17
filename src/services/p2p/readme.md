# ChatPeerManager Usage Guide

The `ChatPeerManager` is a singleton class that handles peer-to-peer messaging functionality in the Tribe app. It manages connections, message sending/receiving, and integrates with the local database for message persistence.

## Overview

`ChatPeerManager` provides a bridge between the React Native app and a native worklet that handles the actual P2P networking. It uses RPC (Remote Procedure Call) to communicate with the worklet and manages message storage in Realm database.

## Install dependencies
```yarn add react-native-bare-kit@0.5.6 bare-rpc hyperswarm b4a buffer```

## Setup
- Move `worklet.mjs` and `ChatPeerManager.ts` to required folder
- Generate bundle using npx bare-pack --target ios --target android  --linked --out /output_path /worklet.mjs_path (refer to the `bare-pack` script in package.json)
- Import the generated bundle in `ChatPeerManager`

## Initialization

### 1. Get Instance
```typescript
import ChatPeerManager from 'src/services/p2p/ChatPeerManager';

const chatManager = ChatPeerManager.getInstance();
```

### 2. Initialize with Seed
```typescript
// Initialize the P2P worklet with your seed
const success = await chatManager.init(seed);
if (success) {
  console.log('ChatPeerManager initialized successfully');
}
```

## Core Methods

### Key Management

#### Get Keys
```typescript
const keys = await chatManager.getKeys();
// Returns: { publicKey: string, privateKey: string }
```

#### Get Connected Peers
```typescript
const peers = await chatManager.getPeers();
// Returns: Array of connected peer public keys
```

### Peer Connection

#### Join a Peer
```typescript
const result = await chatManager.joinPeers(peerPublicKey);
// Attempts to establish connection with the specified peer
```

### Messaging

#### Send Message
```typescript
const result = await chatManager.sendMessage(peerPublicKey, messageText);
// Sends a text message to the specified peer
```

### Event Listeners

#### Message Listener
```typescript
chatManager.setOnMessageListener((data) => {
  console.log('New message received:', data);
  // Handle incoming messages here
});
```

#### Connection Listener
```typescript
chatManager.setOnConnectionListener((data) => {
  console.log('Connection event:', data);
  // Handle connection status changes
});
```

