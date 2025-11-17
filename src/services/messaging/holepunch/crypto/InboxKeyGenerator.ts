/**
 * InboxKeyGenerator
 * 
 * Generates deterministic inbox room keys from user public keys.
 * Anyone can derive a user's inbox key to send them DM invitations.
 */

import cryptoJS from 'crypto-js';
import { MessageEncryption } from './MessageEncryption';

export class InboxKeyGenerator {
  /**
   * Generate deterministic inbox room key from user's public key
   * Anyone can derive this to send invitations to the user
   * 
   * @param userPublicKey - User's public key (64-char hex string)
   * @returns Deterministic inbox room key (64-char hex string)
   */
  static generateInboxRoomKey(userPublicKey: string): string {
    const seed = `inbox:${userPublicKey}`;
    const hash = cryptoJS.SHA256(seed);
    return hash.toString(cryptoJS.enc.Hex);
  }
  
  /**
   * Generate inbox room ID (hash of inbox room key)
   * This is what peers use to discover the inbox room
   * 
   * @param userPublicKey - User's public key (64-char hex string)
   * @returns Inbox room ID (64-char hex string)
   */
  static generateInboxRoomId(userPublicKey: string): string {
    const roomKey = this.generateInboxRoomKey(userPublicKey);
    return MessageEncryption.deriveRoomId(roomKey);
  }
}


