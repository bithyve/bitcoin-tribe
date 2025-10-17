/**
 * Message Encryption Service for P2P Chat
 * 
 * Uses crypto-js AES encryption for end-to-end encrypted messages.
 * Encryption happens in React Native, worklet only transports encrypted data.
 * 
 */

import cryptoJS from 'crypto-js';

export interface MessageData {
  text: string;
  sender?: string;
  senderPublicKey?: string;
  timestamp: number;
  [key: string]: any;
}

export class MessageEncryption {
  /**
   * Encrypt a message using AES-256
   * @param roomKey - 64-char hex string (32 bytes)
   * @param message - Message object to encrypt
   * @returns Base64 encoded encrypted string
   */
  static encrypt(roomKey: string, message: any): string {
    try {
      // Convert message to JSON string
      const messageString = JSON.stringify(message);
      
      // Encrypt using AES (crypto-js uses PBKDF2 internally for key derivation)
      const encrypted = cryptoJS.AES.encrypt(messageString, roomKey);
      
      // Return as base64 string for transport
      return encrypted.toString();
    } catch (error) {
      console.error('[MessageEncryption] Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt a message using AES-256
   * @param roomKey - 64-char hex string (32 bytes)
   * @param encryptedData - Base64 encoded encrypted string
   * @returns Decrypted message object
   */
  static decrypt(roomKey: string, encryptedData: string): MessageData {
    try {
      // Decrypt using AES
      const decrypted = cryptoJS.AES.decrypt(encryptedData, roomKey);
      
      // Convert to UTF-8 string
      const messageString = decrypted.toString(cryptoJS.enc.Utf8);
      
      if (!messageString) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      // Parse JSON
      const message = JSON.parse(messageString);
      
      return message;
    } catch (error) {
      console.error('[MessageEncryption] Decryption failed:', error);
      throw new Error('Failed to decrypt message - possibly wrong room key');
    }
  }

  /**
   * Generate a random 32-byte room key (64 hex chars)
   * @returns 64-character hex string
   */
  static generateRoomKey(): string {
    // Generate 32 random bytes
    const randomBytes = cryptoJS.lib.WordArray.random(32);
    // Convert to hex string (64 chars)
    return randomBytes.toString(cryptoJS.enc.Hex);
  }

  /**
   * Derive room ID from room key for P2P discovery
   * @param roomKey - 64-char hex string (32 bytes)
   * @returns 64-character hex string (SHA256 hash)
   */
  static deriveRoomId(roomKey: string): string {
    // Hash the room key to get a public room ID
    // This is what peers use to discover each other
    return cryptoJS.SHA256(roomKey).toString(cryptoJS.enc.Hex);
  }

  /**
   * Validate room key format
   * @param roomKey - String to validate
   * @returns true if valid 64-char hex string
   */
  static isValidRoomKey(roomKey: string): boolean {
    return /^[0-9a-f]{64}$/i.test(roomKey);
  }
}
