/**
 * ChatService
 * Singleton service that manages P2P chat functionality
 * 
 */

import { ChatAdapter } from './ChatAdapter';

export class ChatService {
  private static instance: ChatService | null = null;
  private adapter: ChatAdapter | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Initialize chat service with user info
   * This initializes both the adapter AND the underlying HyperswarmManager
   */
  async initialize(seed: string, userProfile: { name?: string; image?: string }): Promise<void> {
    if (this.initialized) {
      console.warn('[ChatService] Already initialized');
      return;
    }

    console.log('[ChatService] Initializing:');

    // Create adapter
    this.adapter = new ChatAdapter();

    // Initialize HyperswarmManager (loads seed, starts worklet)
    await this.adapter.initialize(seed, userProfile);

    this.initialized = true;
    console.log('[ChatService] Initialized successfully');
  }

  /**
   * Get the chat adapter (throws if not initialized)
   */
  getAdapter(): ChatAdapter {
    if (!this.adapter) {
      throw new Error('ChatService not initialized. Call initialize() first.');
    }
    return this.adapter;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset service (logout/cleanup)
   */
  async reset(): Promise<void> {
    if (this.adapter) {
      await this.adapter.destroy();
      this.adapter = null;
    }
    this.initialized = false;
    console.log('[ChatService] Reset complete');
  }
}
