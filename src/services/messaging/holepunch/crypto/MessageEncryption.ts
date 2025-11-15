/**
 * Message Encryption Service for P2P Chat
 * 
 * Uses crypto-js AES encryption for end-to-end encrypted messages.
 * Uses X25519 (Curve25519) with ECDH for asymmetric encryption.
 * 
 * Asymmetric Encryption (ECDH):
 * - Sender: Encrypts with recipient's PUBLIC key + sender's PRIVATE key
 * - Recipient: Decrypts with recipient's PRIVATE key + sender's PUBLIC key
 * - Both compute the SAME shared secret via ECDH
 * 
 * Note: Ed25519 keys (signing) are converted to X25519 keys (encryption).
 */

import cryptoJS from 'crypto-js';
import { x25519, edwardsToMontgomeryPub, edwardsToMontgomeryPriv } from '@noble/curves/ed25519';

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

  /**
   * Encrypt data using ECDH (Elliptic Curve Diffie-Hellman)
   * 
   * Uses direct key agreement between sender and recipient:
   * - Sender computes: sharedSecret = senderPrivate * recipientPublic
   * - Recipient computes: sharedSecret = recipientPrivate * senderPublic
   * - Both get the SAME shared secret (ECDH property)
   * 
   * @param data - Data to encrypt (string)
   * @param recipientPublicKey - Recipient's Ed25519 public key (64-char hex string)
   * @param senderPrivateKey - Sender's Ed25519 private key (64-char hex string)
   * @returns Encrypted string (base64 ciphertext)
   */
  static encryptWithPublicKey(
    data: string,
    recipientPublicKey: string,
    senderPrivateKey: string
  ): string {
    try {
      // Convert Ed25519 keys to X25519 (for encryption)
      const recipientPubKeyBytes = this.hexToBytes(recipientPublicKey);
      const recipientX25519PubKey = edwardsToMontgomeryPub(recipientPubKeyBytes);
      
      const senderPrivKeyBytes = this.hexToBytes(senderPrivateKey);
      const senderX25519PrivKey = edwardsToMontgomeryPriv(senderPrivKeyBytes);
      
      // Compute shared secret: senderPrivate * recipientPublic
      const sharedSecret = x25519.getSharedSecret(senderX25519PrivKey, recipientX25519PubKey);
      
      // Derive AES key from shared secret
      const aesKey = cryptoJS.SHA256(
        cryptoJS.lib.WordArray.create(Array.from(sharedSecret))
      ).toString(cryptoJS.enc.Hex).substring(0, 64);
      
      // Encrypt data with AES
      const encrypted = cryptoJS.AES.encrypt(data, aesKey);
      
      // Return encrypted data as base64
      return encrypted.toString();
    } catch (error) {
      console.error('[MessageEncryption] ECDH encryption failed:', error);
      throw new Error('Failed to encrypt with public key');
    }
  }
  
  /**
   * Decrypt data using ECDH (Elliptic Curve Diffie-Hellman)
   * 
   * Uses direct key agreement between sender and recipient:
   * - Recipient computes: sharedSecret = recipientPrivate * senderPublic
   * - This matches the sender's: sharedSecret = senderPrivate * recipientPublic
   * - Both get the SAME shared secret (ECDH property)
   * 
   * @param encryptedPayload - Encrypted string (base64 ciphertext)
   * @param ownPrivateKey - Own Ed25519 private key (64-char hex string)
   * @param senderPublicKey - Sender's Ed25519 public key (64-char hex string)
   * @returns Decrypted data as string
   */
  static decryptWithPrivateKey(
    encryptedPayload: string,
    ownPrivateKey: string,
    senderPublicKey: string
  ): string {
    try {
      // Convert Ed25519 keys to X25519 (for encryption)
      const ownPrivKeyBytes = this.hexToBytes(ownPrivateKey);
      const ownX25519PrivKey = edwardsToMontgomeryPriv(ownPrivKeyBytes);
      
      const senderPubKeyBytes = this.hexToBytes(senderPublicKey);
      const senderX25519PubKey = edwardsToMontgomeryPub(senderPubKeyBytes);
      
      // Compute shared secret: ownPrivate * senderPublic
      // This produces the SAME shared secret as encryption computed
      const sharedSecret = x25519.getSharedSecret(ownX25519PrivKey, senderX25519PubKey);
      
      // Derive AES key from shared secret (same derivation as encryption)
      const aesKey = cryptoJS.SHA256(
        cryptoJS.lib.WordArray.create(Array.from(sharedSecret))
      ).toString(cryptoJS.enc.Hex).substring(0, 64);
      
      // Decrypt data with AES
      const decrypted = cryptoJS.AES.decrypt(encryptedPayload, aesKey);
      const decryptedString = decrypted.toString(cryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      return decryptedString;
    } catch (error) {
      console.error('[MessageEncryption] ECDH decryption failed:', error);
      throw new Error('Failed to decrypt with private key');
    }
  }
  
  /**
   * Convert hex string to Uint8Array
   */
  private static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
  
  /**
   * Convert Uint8Array to hex string
   */
  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
