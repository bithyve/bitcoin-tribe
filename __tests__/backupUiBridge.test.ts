import {
  backupFinished,
  backupStarted,
  backupSucceeded,
  registerBackupUiHandlers,
  unregisterBackupUiHandlers,
} from '../src/services/backup/backupUiBridge';

describe('backupUiBridge', () => {
  const handlers = {
    setBackupInProgress: jest.fn(),
    setBackupDone: jest.fn(),
    setManualAssetBackupStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    unregisterBackupUiHandlers();
    registerBackupUiHandlers(handlers);
  });

  afterEach(() => {
    unregisterBackupUiHandlers();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('notifies when a backup starts and finishes', () => {
    backupStarted();
    backupFinished();

    expect(handlers.setBackupInProgress).toHaveBeenNthCalledWith(1, true);
    expect(handlers.setBackupInProgress).toHaveBeenNthCalledWith(2, false);
  });

  it('marks a backup done and updates the manual status after the timeout', () => {
    backupSucceeded();

    expect(handlers.setBackupDone).toHaveBeenCalledWith(true);
    expect(handlers.setManualAssetBackupStatus).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1500);

    expect(handlers.setManualAssetBackupStatus).toHaveBeenCalledWith(true);
  });

  it('restarts the timeout when backupSucceeded is called again', () => {
    backupSucceeded();
    jest.advanceTimersByTime(1000);
    backupSucceeded();
    jest.advanceTimersByTime(1000);

    expect(handlers.setManualAssetBackupStatus).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(handlers.setManualAssetBackupStatus).toHaveBeenCalledTimes(1);
  });

  it('clears handlers and pending timeout on unregister', () => {
    backupSucceeded();
    unregisterBackupUiHandlers();

    jest.advanceTimersByTime(1500);

    expect(handlers.setManualAssetBackupStatus).not.toHaveBeenCalled();
  });
});