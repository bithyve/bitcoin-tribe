const mockInitialize = jest.fn(() => Promise.resolve());
const mockDestroy = jest.fn(() => Promise.resolve());

jest.mock('../src/services/messaging/ChatAdapter', () => ({
  ChatAdapter: jest.fn(() => ({
    initialize: mockInitialize,
    destroy: mockDestroy,
  })),
}));

import { ChatAdapter } from '../src/services/messaging/ChatAdapter';
import { ChatService } from '../src/services/messaging/ChatService';

describe('ChatService', () => {
  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await ChatService.getInstance().reset();
    jest.clearAllMocks();
  });

  it('returns the same singleton instance every time', () => {
    expect(ChatService.getInstance()).toBe(ChatService.getInstance());
  });

  it('throws if getAdapter is called before initialization', () => {
    expect(() => ChatService.getInstance().getAdapter()).toThrow(
      'ChatService not initialized. Call initialize() first.',
    );
  });

  it('initializes the adapter once and marks the service initialized', async () => {
    const service = ChatService.getInstance();

    await service.initialize('seed-value', { name: 'Alice', image: 'avatar.png' });

    expect(ChatAdapter).toHaveBeenCalledTimes(1);
    expect(mockInitialize).toHaveBeenCalledWith('seed-value', {
      name: 'Alice',
      image: 'avatar.png',
    });
    expect(service.isInitialized()).toBe(true);
    expect(service.getAdapter()).toBeDefined();
  });

  it('does not initialize twice once already initialized', async () => {
    const service = ChatService.getInstance();

    await service.initialize('seed-value', { name: 'Alice' });
    await service.initialize('seed-value-2', { name: 'Bob' });

    expect(ChatAdapter).toHaveBeenCalledTimes(1);
    expect(mockInitialize).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('[ChatService] Already initialized');
  });

  it('reset destroys the adapter and clears initialized state', async () => {
    const service = ChatService.getInstance();
    await service.initialize('seed-value', { name: 'Alice' });

    await service.reset();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(service.isInitialized()).toBe(false);
    expect(() => service.getAdapter()).toThrow();
  });

  it('reset is safe when no adapter has been created', async () => {
    await expect(ChatService.getInstance().reset()).resolves.toBeUndefined();
    expect(mockDestroy).not.toHaveBeenCalled();
  });
});