import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@libp2p/noise';
import { yamux } from '@libp2p/yamux';
import { identify } from '@libp2p/identify';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { multiaddr } from '@multiformats/multiaddr';

const RELAY_ADDR = (await fetch('http://127.0.0.1:9876/').then(r => r.json())).wsAddr;
const ELECTION_ID = '4c875d85-13a0-4e55-8b01-eb0a9fa04305';
const INTENT_TOPIC = 'peerpulse/intent/1.0.0';

const sub = await createLibp2p({
  connectionGater: { denyDialMultiaddr: async () => false },
  transports: [webSockets()], streamMuxers: [yamux()], connectionEncrypters: [noise()],
  services: { identify: identify(), pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, floodPublish: true }) },
});
await sub.start();
await sub.dial(multiaddr(RELAY_ADDR));
sub.services.pubsub.subscribe(INTENT_TOPIC);

let received = false;
sub.services.pubsub.addEventListener('message', (evt) => {
  if (evt.detail.topic === INTENT_TOPIC) {
    console.log('✓ RECEIVED via gossip:', new TextDecoder().decode(evt.detail.data).slice(0, 80));
    received = true;
  }
});

await new Promise(r => setTimeout(r, 2000));

await fetch(`http://127.0.0.1:9876/elections/${ELECTION_ID}/intents`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'intent', packet_id: crypto.randomUUID(), timestamp: Date.now(),
    election_id: ELECTION_ID, station_id: 'k', reporter_pub_key: 'testkey', sig: 'testsig' }),
});
console.log('intent posted to relay');

await new Promise(r => setTimeout(r, 2000));
console.log(received ? 'real-time gossip works ✓' : 'gossip did NOT reach subscriber ✗');
await sub.stop();
