/**
 * DMInviteProcessor
 * 
 * Processes DM invitation messages received in inbox rooms.
 * - Decrypts the ENTIRE invitation payload using ECDH (Elliptic Curve Diffie-Hellman)
 * - Creates a local DM room entry
 * - Transforms the invitation into a system message for display
 * 
 * Security: The entire invitation is encrypted using ECDH key agreement,
 * so the root peer cannot read any invitation content (sender name, room key, etc.)
 * Only the recipient (with their private key) can decrypt the invitation.
 */

import { HolepunchMessage, HolepunchMessageType } from '../storage/MessageStorage';
import { MessageProcessor, ProcessorContext, ProcessResult } from './MessageProcessor';
import { MessageEncryption } from '../crypto/MessageEncryption';
import { RoomStorage, HolepunchRoomType, HolepunchRoom } from '../storage/RoomStorage';
import { DMInvitation } from '../types/DMInvitation';

export class DMInviteProcessor implements MessageProcessor {
  canProcess(message: HolepunchMessage): boolean {
    return message.messageType === HolepunchMessageType.DM_INVITE;
  }

  async process(message: HolepunchMessage, context: ProcessorContext): Promise<ProcessResult> {
    try {
      console.log('[DMInviteProcessor] 🔓 Processing encrypted DM invitation');
      
      // Decrypt the ENTIRE invitation payload using ECDH
      // message.content is the encrypted payload (base64 ciphertext)
      // Uses: recipientPrivate * senderPublic = shared secret
      const decryptedPayload = MessageEncryption.decryptWithPrivateKey(
        message.content,
        context.currentPeerPrivKey,
        message.senderId  // Sender's public key (from message)
      );
      
      // Parse decrypted invitation data
      const invitationData: DMInvitation = JSON.parse(decryptedPayload);
      
      // Verify invitation type
      if (invitationData.invitationType !== HolepunchMessageType.DM_INVITE) {
        throw new Error('Invalid invitation type');
      }
      
      // Verify room ID matches the room key
      const expectedRoomId = MessageEncryption.deriveRoomId(invitationData.dmRoomKey);
      if (expectedRoomId !== invitationData.dmRoomId) {
        throw new Error('Room ID mismatch - possible tampering');
      }
      
      // Check if DM room already exists
      const existingDM = await RoomStorage.getRoom(invitationData.dmRoomId);
      
      if (!existingDM) {
        // Create DM room entry
        const dmRoom: HolepunchRoom = {
          roomId: invitationData.dmRoomId,
          roomKey: invitationData.dmRoomKey, // Now plaintext (was decrypted from payload)
          roomType: HolepunchRoomType.DIRECT_MESSAGE,
          roomName: invitationData.senderName,
          roomDescription: 'Direct message',
          peers: [context.currentPeerPubKey, invitationData.senderPublicKey],
          creator: invitationData.senderPublicKey,
          createdAt: invitationData.timestamp,
          lastActive: Date.now(),
          initializedIdentity: false,
          roomImage: invitationData.senderImage,
          otherParticipantPubKey: invitationData.senderPublicKey,
        };
        
        await RoomStorage.saveRoom(dmRoom);
        console.log('[DMInviteProcessor] ✅ DM room created from invitation');
      } else {
        console.log('[DMInviteProcessor] ℹ️ DM room already exists, skipping creation');
      }
      
      // Create system message for display
      const systemMessage: HolepunchMessage = {
        ...message,
        messageType: HolepunchMessageType.SYSTEM,
        content: `${invitationData.senderName} sent you a DM invitation`,
      };
      
      return {
        shouldSave: true,
        shouldDisplay: true,
        processedMessage: systemMessage,
      };
      
    } catch (error) {
      console.error('[DMInviteProcessor] ❌ Failed to process invitation:', error);
      
      return {
        shouldSave: false,
        shouldDisplay: true,
        processedMessage: {
          ...message,
          messageType: HolepunchMessageType.SYSTEM,
          content: 'Received an invalid DM invitation',
        },
      };
    }
  }
}


