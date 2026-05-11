import { createLibp2p, type Libp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise, pureJsCrypto } from '@libp2p/noise';
import { yamux } from '@libp2p/yamux';
import { identify, type Identify } from '@libp2p/identify';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import type { GossipSub } from '@chainsafe/libp2p-gossipsub';
import { multiaddr } from '@multiformats/multiaddr';
import { RELAY_WS_ADDR } from './relay-config';

export type PeerPulseServices = { identify: Identify; pubsub: GossipSub };
export type PeerPulseNode     = Libp2p<PeerPulseServices>;

// RN's WebSocket doesn't implement `bufferedAmount`, so it reads as undefined.
// @libp2p/websockets checks `websocket.bufferedAmount < maxBufferedAmount` to
// decide whether to backpressure; `undefined < N` is false, so it thinks every
// write needs to drain, awaits a 'drain' event RN never emits, and the eventual
// 'close' makes pEvent reject with undefined — surfacing as the cryptic
// "Cannot read property 'message' of undefined" inside libp2p's upgrader.
// Forcing bufferedAmount to 0 makes the check pass.
let RN_WEBSOCKET_PATCHED = false;
function patchRNWebSocket() {
  if (RN_WEBSOCKET_PATCHED) return;
  RN_WEBSOCKET_PATCHED = true;
  const OrigWS = globalThis.WebSocket;
  if (!OrigWS) return;
  globalThis.WebSocket = function (url: string, ...rest: any[]) {
    const ws: any = new (OrigWS as any)(url, ...rest);
    if (ws.bufferedAmount === undefined) {
      Object.defineProperty(ws, 'bufferedAmount', {
        get() { return 0; },
        configurable: true,
      });
    }
    return ws;
  } as any;
  Object.setPrototypeOf(globalThis.WebSocket, OrigWS);
  globalThis.WebSocket.prototype = OrigWS.prototype;
}

export async function createPeerPulseNode(): Promise<PeerPulseNode> {
  patchRNWebSocket();

  const node = await createLibp2p<PeerPulseServices>({
    connectionGater: { denyDialMultiaddr: async () => false },
    transports: [webSockets(), circuitRelayTransport()],
    streamMuxers: [yamux()],
    // pureJsCrypto avoids @libp2p/noise's defaultCrypto which calls
    // node:crypto.generateKeyPairSync('x25519') and crypto.diffieHellman —
    // unsupported by react-native-quick-crypto.
    connectionEncrypters: [noise({ crypto: pureJsCrypto })],
    services: {
      identify: identify(),
      pubsub: gossipsub({
        allowPublishToZeroTopicPeers: true,
        floodPublish: true,
      }) as any,
    },
  });

  await node.start();

  if (RELAY_WS_ADDR) {
    await node.dial(multiaddr(RELAY_WS_ADDR));
  }

  return node;
}
