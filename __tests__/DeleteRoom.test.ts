/**
 * Tests for delete chat/room functionality
 * Covers: MessageStorage.deleteMessagesForRoom, ChatAdapter.deleteRoom
 */

// ─── MessageStorage mock ─────────────────────────────────────────────────────

const mockGetMessages = jest.fn();
const mockWriteMessages = jest.fn();
const mockDeleteMessage = jest.fn();

jest.mock('../src/storage/realm/realm', () => ({
  __esModule: true,
  default: {
    get: mockGetMessages,
    write: mockWriteMessages,
    delete: mockDeleteMessage,
    create: jest.fn(),
  },
}));

// ─── HyperswarmManager mock ───────────────────────────────────────────────────

const mockLeaveRoom = jest.fn(() => Promise.resolve());

jest.mock(
  '../src/services/messaging/holepunch/network/managers/HyperswarmManager',
  () => ({
    HyperswarmManager: {
      getInstance: jest.fn(() => ({
        initialize: jest.fn(() => Promise.resolve()),
        leaveRoom: mockLeaveRoom,
        onPeerConnected: jest.fn(),
        onPeerDisconnected: jest.fn(),
        onRootPeerConnected: jest.fn(),
        onRootPeerDisconnected: jest.fn(),
        onMessagesReceived: jest.fn(),
        onError: jest.fn(),
      })),
    },
  }),
);

// ─── MessageEncryption mock ───────────────────────────────────────────────────

jest.mock(
  '../src/services/messaging/holepunch/crypto/MessageEncryption',
  () => ({
    MessageEncryption: {
      generateRoomKey: jest.fn(() => 'mock-room-key'),
      deriveRoomId: jest.fn(() => 'mock-room-id'),
      isValidRoomKey: jest.fn(() => true),
    },
  }),
);

// ─── MessageProcessorRegistry mock ───────────────────────────────────────────

jest.mock(
  '../src/services/messaging/holepunch/processors/MessageProcessor',
  () => ({
    MessageProcessorRegistry: jest.fn(() => ({
      register: jest.fn(),
      process: jest.fn(() =>
        Promise.resolve({ shouldSave: false, shouldDisplay: false }),
      ),
    })),
  }),
);

jest.mock(
  '../src/services/messaging/holepunch/processors/IdentityProcessor',
  () => ({ IdentityProcessor: jest.fn() }),
);
jest.mock(
  '../src/services/messaging/holepunch/processors/TextProcessor',
  () => ({ TextProcessor: jest.fn() }),
);
jest.mock(
  '../src/services/messaging/holepunch/processors/DMInviteProcessor',
  () => ({ DMInviteProcessor: jest.fn() }),
);
jest.mock('../src/services/handler/services', () => ({
  ApiHandler: { backupAppImage: jest.fn() },
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { MessageStorage } from '../src/services/messaging/holepunch/storage/MessageStorage';
import { RoomStorage } from '../src/services/messaging/holepunch/storage/RoomStorage';
import { ChatAdapter } from '../src/services/messaging/ChatAdapter';
import { HolepunchRoomType } from '../src/services/messaging/holepunch/storage/RoomStorage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFakeRoom = (overrides = {}) => ({
  roomId: 'room-123',
  roomKey: 'key-abc',
  roomType: HolepunchRoomType.GROUP,
  roomName: 'Test Room',
  roomDescription: 'A test room',
  peers: [],
  creator: 'pub-key-xyz',
  createdAt: Date.now(),
  lastActive: Date.now(),
  initializedIdentity: false,
  ...overrides,
});

// ─── MessageStorage.deleteMessagesForRoom ─────────────────────────────────────

describe('MessageStorage.deleteMessagesForRoom', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('deletes all messages belonging to the given roomId', async () => {
    const filteredResults = [{ roomId: 'room-123' }, { roomId: 'room-123' }];
    const fakeResults = {
      filtered: jest.fn().mockReturnValue(filteredResults),
    };
    mockGetMessages.mockReturnValue(fakeResults);

    await MessageStorage.deleteMessagesForRoom('room-123');

    expect(fakeResults.filtered).toHaveBeenCalledWith('roomId == $0', 'room-123');
    // bulk delete passes the filtered Results object directly to RealmDatabase.delete
    expect(mockDeleteMessage).toHaveBeenCalledWith(filteredResults);
  });

  it('does nothing when there are no messages for the room', async () => {
    const emptyResults: never[] = [];
    const fakeResults = { filtered: jest.fn().mockReturnValue(emptyResults) };
    mockGetMessages.mockReturnValue(fakeResults);

    await expect(
      MessageStorage.deleteMessagesForRoom('room-empty'),
    ).resolves.toBeUndefined();

    // Bulk delete is still called; Realm handles empty results gracefully
    expect(mockDeleteMessage).toHaveBeenCalledWith(emptyResults);
  });

  it('does nothing when Realm returns null', async () => {
    mockGetMessages.mockReturnValue(null);

    await expect(
      MessageStorage.deleteMessagesForRoom('room-null'),
    ).resolves.toBeUndefined();

    expect(mockWriteMessages).not.toHaveBeenCalled();
  });

  it('propagates errors thrown during deletion', async () => {
    mockGetMessages.mockImplementation(() => {
      throw new Error('Realm failure');
    });

    await expect(
      MessageStorage.deleteMessagesForRoom('room-err'),
    ).rejects.toThrow('Realm failure');
  });
});

// ─── ChatAdapter.deleteRoom ────────────────────────────────────────────────────

describe('ChatAdapter.deleteRoom', () => {
  let adapter: ChatAdapter;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    adapter = new ChatAdapter();
  });

  it('deletes room messages and the room record from storage', async () => {
    const room = makeFakeRoom();

    // Stub storage methods
    jest
      .spyOn(MessageStorage, 'deleteMessagesForRoom')
      .mockResolvedValue(undefined);
    jest.spyOn(RoomStorage, 'deleteRoom').mockResolvedValue(undefined);

    await adapter.deleteRoom(room.roomId);

    expect(MessageStorage.deleteMessagesForRoom).toHaveBeenCalledWith(room.roomId);
    expect(RoomStorage.deleteRoom).toHaveBeenCalledWith(room.roomId);
  });

  it('emits chat:room-deleted with the roomId after deletion', async () => {
    jest
      .spyOn(MessageStorage, 'deleteMessagesForRoom')
      .mockResolvedValue(undefined);
    jest.spyOn(RoomStorage, 'deleteRoom').mockResolvedValue(undefined);

    const emitSpy = jest.spyOn(adapter, 'emit');

    await adapter.deleteRoom('room-abc');

    expect(emitSpy).toHaveBeenCalledWith('chat:room-deleted', 'room-abc');
  });

  it('leaves the active room before deleting when it matches the given roomId', async () => {
    const room = makeFakeRoom({ roomId: 'active-room' });

    // Set adapter's currentRoom by calling leaveRoom's internal path via a cast
    (adapter as any).currentRoom = room;

    jest
      .spyOn(MessageStorage, 'deleteMessagesForRoom')
      .mockResolvedValue(undefined);
    jest.spyOn(RoomStorage, 'deleteRoom').mockResolvedValue(undefined);

    await adapter.deleteRoom('active-room');

    // HyperswarmManager.leaveRoom should have been called
    expect(mockLeaveRoom).toHaveBeenCalledWith('active-room');
    // currentRoom should be cleared after leaving
    expect((adapter as any).currentRoom).toBeNull();
  });

  it('does NOT leave any room when the roomId does not match the active room', async () => {
    const room = makeFakeRoom({ roomId: 'other-room' });
    (adapter as any).currentRoom = room;

    jest
      .spyOn(MessageStorage, 'deleteMessagesForRoom')
      .mockResolvedValue(undefined);
    jest.spyOn(RoomStorage, 'deleteRoom').mockResolvedValue(undefined);

    await adapter.deleteRoom('some-different-room');

    // leaveRoom should NOT be called since the active room is different
    expect(mockLeaveRoom).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by MessageStorage.deleteMessagesForRoom', async () => {
    jest
      .spyOn(MessageStorage, 'deleteMessagesForRoom')
      .mockRejectedValue(new Error('storage error'));

    await expect(adapter.deleteRoom('room-fail')).rejects.toThrow('storage error');
  });

  it('propagates errors thrown by RoomStorage.deleteRoom', async () => {
    jest
      .spyOn(MessageStorage, 'deleteMessagesForRoom')
      .mockResolvedValue(undefined);
    jest
      .spyOn(RoomStorage, 'deleteRoom')
      .mockRejectedValue(new Error('room delete error'));

    await expect(adapter.deleteRoom('room-fail')).rejects.toThrow(
      'room delete error',
    );
  });
});
