import { HolepunchMessage } from '../storage/MessageStorage';

/**
 * Context provided to message processors
 */
export interface ProcessorContext {
  roomId: string;
  currentPeerPubKey: string;
  currentPeerPrivKey: string; // Private key for decrypting DM invitations
}

/**
 * Result of message processing
 */
export interface ProcessResult {
  shouldSave: boolean;
  shouldDisplay: boolean;
  processedMessage: HolepunchMessage;  // Transformed message for UI (e.g., IDENTITY -> SYSTEM)
}

/**
 * Interface for message processors
 * Each processor handles a specific message type
 */
export interface MessageProcessor {
  canProcess(message: HolepunchMessage): boolean;
  process(message: HolepunchMessage, context: ProcessorContext): Promise<ProcessResult>;
}

/**
 * Registry for message processors
 * Processes messages through registered processors in order
 */
export class MessageProcessorRegistry {
  private processors: MessageProcessor[] = [];

  /**
   * Register a message processor
   */
  register(processor: MessageProcessor): void {
    this.processors.push(processor);
    console.log('[MessageProcessorRegistry] Registered processor:', processor.constructor.name);
  }

  /**
   * Process a message through registered processors
   * Returns the first matching processor's result
   */
  async process(message: HolepunchMessage, context: ProcessorContext): Promise<ProcessResult> {
    for (const processor of this.processors) {
      if (processor.canProcess(message)) {
        console.log('[MessageProcessorRegistry] Processing with:', processor.constructor.name);
        return await processor.process(message, context);
      }
    }

    // Default: display as-is if no processor matches
    console.warn('[MessageProcessorRegistry] No processor found for message type:', message.messageType);
    return {
      shouldSave: true,
      shouldDisplay: true,
      processedMessage: message,
    };
  }
}

