const { tor } = require('../rest/RestClient');
const logger = require('../utils/logger').default;

/**
 * Wrapper for react-native-tor mimicking Socket class from NET package
 */
class TorSocket {
  constructor() {
    this._socket = false;
    this._listeners = {};
  }

  setTimeout() {}

  setEncoding() {}

  setKeepAlive() {}

  setNoDelay() {}

  on(event, listener) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(listener);
  }

  removeListener(event, listener) {
    this._listeners[event] = this._listeners[event] || [];
    const newListeners = [];

    let found = false;
    for (const savedListener of this._listeners[event]) {
      if (savedListener === listener) {
        // found our listener
        found = true;
        // we just skip it
      } else {
        // other listeners should go back to original array
        newListeners.push(savedListener);
      }
    }

    if (found) {
      this._listeners[event] = newListeners;
    } else {
      // something went wrong, lets just cleanup all listeners
      this._listeners[event] = [];
    }
  }

  connect(port, host, callback) {
    logger.log('connecting TOR socket...', host, port);
    (async () => {
      logger.log('starting tor...');
      try {
        await tor.startIfNotStarted();
      } catch (e) {
        console.warn('Could not bootstrap TOR', e);
        await tor.stopIfRunning();
        this._passOnEvent('error', 'Could not bootstrap TOR');
        return false;
      }
      logger.log('started tor');
      const iWillConnectISwear = tor.createTcpConnection(
        { target: `${host}:${port}`, connectionTimeout: 15000 },
        (data, err) => {
          if (err) {
            logger.error('TOR socket onData error: ', err);
            // this._passOnEvent('error', err);
            return;
          }
          this._passOnEvent('data', data);
        },
      );

      try {
        this._socket = await Promise.race([
          iWillConnectISwear,
          new Promise(resolve => setTimeout(resolve, 21000)),
        ]);
      } catch (e) {}

      if (!this._socket) {
        logger.error('connecting TOR socket failed'); // either sleep expired or connect threw an exception
        await tor.stopIfRunning();
        this._passOnEvent('error', 'connecting TOR socket failed');
        return false;
      }

      logger.log('TOR socket connected:', host, port);
      setTimeout(() => {
        this._passOnEvent('connect', true);
        callback();
      }, 1000);
    })();
  }

  _passOnEvent(event, data) {
    this._listeners[event] = this._listeners[event] || [];
    for (const savedListener of this._listeners[event]) {
      savedListener(data);
    }
  }

  emit(event, data) {}

  end() {
    logger.log('trying to close TOR socket');
    if (this._socket && this._socket.close) {
      logger.log('trying to close TOR socket SUCCESS');
      return this._socket.close();
    }
  }

  destroy() {}

  write(data) {
    if (this._socket && this._socket.write) {
      try {
        return this._socket.write(data);
      } catch (error) {
        logger.error(
          'this._socket.write() failed so we are issuing ERROR event',
          error,
        );
        this._passOnEvent('error', error);
      }
    } else {
      logger.error('TOR socket write error, socket not connected');
      this._passOnEvent('error', 'TOR socket not connected');
    }
  }
}

module.exports.Socket = TorSocket;
