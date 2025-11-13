import { HolepunchMessage, HolepunchMessageType } from '../storage/MessageStorage';
import { MessageProcessor, ProcessorContext, ProcessResult } from './MessageProcessor';

/**
 * Processor for TEXT messages
 * Handles regular text chat messages (default behavior)
 */
export class TextProcessor implements MessageProcessor {
  canProcess(message: HolepunchMessage): boolean {
    return message.messageType === HolepunchMessageType.TEXT;
  }

  async process(message: HolepunchMessage, context: ProcessorContext): Promise<ProcessResult> {
    console.log('[TextProcessor] Processing text message from:', message.senderId);
    
    // Text messages are displayed as-is
    return {
      shouldSave: true,
      shouldDisplay: true,
      processedMessage: message,
    };
  }
}

