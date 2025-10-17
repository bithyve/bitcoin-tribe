/**
 * RPC Command Identifiers
 * 
 * These define the commands and events exchanged between React Native
 * and the Bare worklet via IPC (Inter-Process Communication).
 */

/**
 * Commands sent FROM React Native TO Worklet
 */
export enum WorkletCommand {
  GET_KEYS = 'GET_KEYS',
  GET_CONNECTED_PEERS = 'GET_CONNECTED_PEERS',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  SEND_MESSAGE = 'SEND_MESSAGE',
  REQUEST_SYNC = 'REQUEST_SYNC', // Request sync with specific lastIndex
  RECONNECT_ROOT_PEER = 'RECONNECT_ROOT_PEER', // Manually trigger root peer reconnection
}

/**
 * Events sent FROM Worklet TO React Native
 */
export enum WorkletEvent {
  READY = 'READY',
  PEER_CONNECTED = 'PEER_CONNECTED',
  PEER_DISCONNECTED = 'PEER_DISCONNECTED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  ERROR = 'ERROR',
}

/**
 * Command ID mapping for bare-rpc
 * (RPC requires numeric IDs for communication)
 */
export const CommandIds = {
  // Commands (React Native → Worklet)
  [WorkletCommand.GET_KEYS]: 1,
  [WorkletCommand.GET_CONNECTED_PEERS]: 2,
  [WorkletCommand.JOIN_ROOM]: 3,
  [WorkletCommand.LEAVE_ROOM]: 4,
  [WorkletCommand.SEND_MESSAGE]: 5,
  [WorkletCommand.REQUEST_SYNC]: 6,
  [WorkletCommand.RECONNECT_ROOT_PEER]: 7,
  
  // Events (Worklet → React Native)
  [WorkletEvent.READY]: 10,
  [WorkletEvent.PEER_CONNECTED]: 11,
  [WorkletEvent.PEER_DISCONNECTED]: 12,
  [WorkletEvent.MESSAGE_RECEIVED]: 13,
  [WorkletEvent.ERROR]: 14,
} as const;
