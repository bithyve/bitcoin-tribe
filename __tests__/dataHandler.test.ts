import { DataHandler } from '../src/services/handler/dataHandler';

describe('DataHandler', () => {
  it('logs the realm read/write placeholder message', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    DataHandler.readOrWriteToRealm();

    expect(console.log).toHaveBeenCalledWith('Reading or writing to Realm');
  });
});