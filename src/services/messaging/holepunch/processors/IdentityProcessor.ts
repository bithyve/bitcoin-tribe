import { HolepunchMessage, HolepunchMessageType } from '../storage/MessageStorage';
import { PeerStorage } from '../storage/PeerStorage';
import { MessageProcessor, ProcessorContext, ProcessResult } from './MessageProcessor';

/**
 * Processor for IDENTITY messages
 * Handles peer identity announcements when joining a room
 */
export class IdentityProcessor implements MessageProcessor {
  canProcess(message: HolepunchMessage): boolean {
    return message.messageType === HolepunchMessageType.IDENTITY;
  }

  async process(message: HolepunchMessage, context: ProcessorContext): Promise<ProcessResult> {
    try {
      console.log('[IdentityProcessor] Processing identity message from:', message.senderId);
      
      // Parse identity data from message content
      const identity = JSON.parse(message.content);
      
      // Save peer globally
      await PeerStorage.savePeer({
        peerId: message.senderId,
        peerName: identity.name || 'Anonymous',
        peerImage: identity.image || '',
      });
      
      // Add peer to room's peers array
      await PeerStorage.addPeerToRoom(message.senderId, context.roomId);
      
      
      // Create system message for display
      const systemMessage: HolepunchMessage = {
        ...message,
        messageType: HolepunchMessageType.SYSTEM,
        content: `${ context.currentPeerPubKey === message.senderId? 'You' : (identity.name || 'Anonymous')} joined the room`,
      };
      
      console.log('[IdentityProcessor] ✅ Peer saved and system message created');
      
      return {
        shouldSave: true,
        shouldDisplay: true,
        processedMessage: systemMessage,
      };
    } catch (error) {
      console.error('[IdentityProcessor] ❌ Failed to process identity message:', error);
      
      // Return a generic system message on error
      return {
        shouldSave: true,
        shouldDisplay: true,
        processedMessage: {
          ...message,
          messageType: HolepunchMessageType.SYSTEM,
          content: 'A peer joined the room',
        },
      };
    }
  }
}

