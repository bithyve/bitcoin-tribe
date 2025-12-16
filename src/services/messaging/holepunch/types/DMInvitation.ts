/**
 * DM Invitation Data Types
 * 
 * Defines the structure of DM invitation messages sent to inbox rooms.
 * 
 * SECURITY: The ENTIRE DMInvitation object is encrypted with ECC
 * (Elliptic Curve Cryptography) using the recipient's public key.
 * This ensures the root peer cannot read ANY invitation content.
 * 
 * The encrypted payload is sent as the message content, and only the
 * recipient can decrypt it using their private key.
 */

export interface DMInvitation {
  invitationType: 'DM_INVITE';
  dmRoomKey: string;              // Plaintext room key (entire payload is encrypted)
  dmRoomId: string;               // Hash of dmRoomKey (for verification)
  senderPublicKey: string;        // Sender's public key
  senderName: string;             // Sender's display name
  senderImage?: string;           // Sender's avatar URL
  invitationId: string;           // Unique invitation ID
  timestamp: number;              // When invitation was created
}


