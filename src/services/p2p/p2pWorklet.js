const { IPC } = BareKit;
IPC.setEncoding('utf8');

const DHT = require('hyperdht');
const b4a = require('b4a');

const node = new DHT();
let server;
let keyPair;
let connection = null;

function onPeerConnected(sock) {
  connection = sock;
  IPC.write(JSON.stringify({ type: 'status', status: 'connected' }));
  sock.on('data', (data) => {
    IPC.write(JSON.stringify({
      type: 'message',
      sender: 'peer',
      text: data.toString(),
      timestamp: Date.now()
    }));
  });
  sock.on('error', (err) => {
    IPC.write(JSON.stringify({ type: 'error', error: err.message }));
  });
}

IPC.on('data', (raw) => {
  const msg = JSON.parse(raw);
  if (msg.action === 'init') {
    if (msg.secret) {
      keyPair = DHT.keyPair(b4a.from(msg.secret, 'hex'));
    } else {
      keyPair = DHT.keyPair();
    }
    server = node.createServer();
    server.on('connection', onPeerConnected);
    server.listen(keyPair).then(() => {
      const pubHex = b4a.toString(keyPair.publicKey, 'hex');
      if (msg.secret) {
        IPC.write(JSON.stringify({ type: 'ownKey', publicKey: pubHex }));
      } else {
        IPC.write(JSON.stringify({
          type: 'ownKey',
          publicKey: pubHex,
          privateKey: b4a.toString(keyPair.secretKey, 'hex')
        }));
      }
    }).catch(err => {
      IPC.write(JSON.stringify({ type: 'error', error: err.message }));
    });

  } else if (msg.action === 'connect') {
    const peerKey = b4a.from(msg.key, 'hex');
    const sock = node.connect(peerKey);
    sock.on('open', () => {
      connection = sock;
      IPC.write(JSON.stringify({ type: 'status', status: 'connected' }));
      sock.on('data', (data) => {
        IPC.write(JSON.stringify({
          type: 'message',
          sender: 'peer',
          text: data.toString(),
          timestamp: Date.now()
        }));
      });
      sock.on('error', (err) => {
        IPC.write(JSON.stringify({ type: 'error', error: err.message }));
      });
    });

  } else if (msg.action === 'send') {
    if (connection) {
      connection.write(msg.text);
    }
  }
});
