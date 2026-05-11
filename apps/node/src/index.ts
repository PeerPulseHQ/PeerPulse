import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@libp2p/noise';
import { yamux } from '@libp2p/yamux';
import { identify } from '@libp2p/identify';
import { circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import http from 'node:http';
import os from 'node:os';
import { loadOrCreatePlatformKey } from './platform-key.js';
import { loadOrCreatePeerKey } from './peer-key.js';
import * as db from './db.js';
import {
  TOPICS,
  signPacket,
  type ElectionDefinition,
  type IntentPacket,
} from '@peerpulse/core';

const WS_PORT   = Number(process.env.WS_PORT)   || 9090;
const INFO_PORT = Number(process.env.INFO_PORT)  || 9876;

// Host advertised to clients (in /info response, in wsAddr, in console output).
// Defaults to the first non-internal IPv4 LAN address so mobile devices on the
// same Wi-Fi can connect. Override with PUBLIC_HOST=192.168.x.x or a hostname.
function detectLanHost(): string {
  if (process.env.PUBLIC_HOST) return process.env.PUBLIC_HOST;
  for (const iface of Object.values(os.networkInterfaces())) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return '127.0.0.1';
}
const PUBLIC_HOST = detectLanHost();

const platformKey = loadOrCreatePlatformKey();
const peerPrivateKey = await loadOrCreatePeerKey();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const node = await createLibp2p({
  privateKey: peerPrivateKey,
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/0',
      `/ip4/0.0.0.0/tcp/${WS_PORT}/ws`,
    ],
  },
  transports:           [tcp(), webSockets()],
  streamMuxers:         [yamux()],
  connectionEncrypters: [noise()],
  services: {
    identify: identify(),
    relay:    circuitRelayServer(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pubsub:   gossipsub({ allowPublishToZeroTopicPeers: true, floodPublish: true }) as any,
  },
});

await node.start();

// Subscribe to receive elections and intents from peers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pubsub = (node.services as any).pubsub;
pubsub.subscribe(TOPICS.ELECTION);
pubsub.subscribe(TOPICS.INTENT);
pubsub.subscribe(TOPICS.WITNESS);
pubsub.subscribe(TOPICS.HEARTBEAT);

pubsub.addEventListener('message', (evt: any) => {
  const { topic, data } = evt.detail;
  try {
    const packet = JSON.parse(new TextDecoder().decode(data));
    if (topic === TOPICS.ELECTION && packet.type === 'election_definition') {
      db.saveElection(packet as ElectionDefinition);
      console.log('[election] saved', packet.election_id);
    } else if (topic === TOPICS.INTENT && packet.type === 'intent') {
      db.saveIntent(packet as IntentPacket);
      console.log('[intent]   received', packet.packet_id);
    } else if (topic === TOPICS.WITNESS) {
      console.log('[witness]  received', packet.packet_id);
    } else if (topic === TOPICS.HEARTBEAT) {
      console.log('[heartbeat] received', packet.packet_id);
    }
  } catch { /* malformed packet */ }
});

const peerId   = node.peerId.toString();
const wsAddr   = `/ip4/${PUBLIC_HOST}/tcp/${WS_PORT}/ws/p2p/${peerId}`;
const allAddrs = node.getMultiaddrs().map(a => a.toString());

console.log('PeerPulse relay node started');
console.log('Peer ID:', peerId);
console.log('Platform pubkey:', platformKey.pubkeyHex);
allAddrs.forEach(a => console.log(' ', a));

// ── SSE broadcast ────────────────────────────────────────────────────────────

const sseClients = new Set<http.ServerResponse>();

function broadcast(event: string, data: unknown) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(msg); } catch { sseClients.delete(client); }
  }
}

// ── HTTP server ───────────────────────────────────────────────────────────────

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end',  () => resolve(body));
    req.on('error', reject);
  });
}

function cors(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
}

function json(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url ?? '/', `http://${PUBLIC_HOST}:${INFO_PORT}`);

  // GET / — relay info
  if (req.method === 'GET' && url.pathname === '/') {
    return json(res, 200, { peerId, wsAddr, addrs: allAddrs, platform_pub_key: platformKey.pubkeyHex });
  }

  // GET /events — SSE stream for real-time updates
  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':\n\n'); // keep-alive comment
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // GET /elections — list all elections
  if (req.method === 'GET' && url.pathname === '/elections') {
    return json(res, 200, db.getElections());
  }

  // POST /elections — create and publish a new election
  if (req.method === 'POST' && url.pathname === '/elections') {
    try {
      const body = await readBody(req);
      const input = JSON.parse(body) as Omit<ElectionDefinition, 'type' | 'election_id' | 'platform_pub_key' | 'sig'>;

      const unsigned: Omit<ElectionDefinition, 'sig'> = {
        type:                  'election_definition',
        election_id:           crypto.randomUUID(),
        platform_pub_key:      platformKey.pubkeyHex,
        name:                  input.name,
        jurisdiction:          input.jurisdiction,
        election_date:         input.election_date,
        polls_close_time:      input.polls_close_time,
        registration_deadline: input.registration_deadline,
        stations:              input.stations,
        dispute_threshold:     input.dispute_threshold ?? 5,
      };

      const election = signPacket<ElectionDefinition>(unsigned, platformKey.privateKey);
      db.saveElection(election);

      const bytes = new TextEncoder().encode(JSON.stringify(election));
      await pubsub.publish(TOPICS.ELECTION, bytes);

      return json(res, 201, election);
    } catch (e) {
      return json(res, 400, { error: String(e) });
    }
  }

  const intentMatch = url.pathname.match(/^\/elections\/([^/]+)\/intents$/);

  // GET /elections/:id/intents
  if (req.method === 'GET' && intentMatch) {
    return json(res, 200, db.getIntents(intentMatch[1]!));
  }

  // POST /elections/:id/intents — store intent, SSE broadcast, gossip to peers
  if (req.method === 'POST' && intentMatch) {
    try {
      const intent = JSON.parse(await readBody(req)) as IntentPacket;
      const saved = db.saveIntent(intent);
      if (!saved) return json(res, 409, { error: 'Identity already declared intent for this election' });
      broadcast('intent', intent);
      const bytes = new TextEncoder().encode(JSON.stringify(intent));
      await pubsub.publish(TOPICS.INTENT, bytes).catch(() => {/* mesh not ready */});
      return json(res, 201, { ok: true });
    } catch (e) {
      return json(res, 400, { error: String(e) });
    }
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(INFO_PORT, '0.0.0.0', () => {
  console.log(`HTTP API: http://${PUBLIC_HOST}:${INFO_PORT}/  (bound 0.0.0.0)`);
});

process.on('SIGINT',  async () => { server.close(); await node.stop(); process.exit(0); });
process.on('SIGTERM', async () => { server.close(); await node.stop(); process.exit(0); });
