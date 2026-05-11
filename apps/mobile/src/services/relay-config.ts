// Relay endpoints used by the mobile app.
//
// Defaults point at the local dev relay (apps/node) running on the laptop's
// Wi-Fi LAN IP. Update these when:
//   - Your laptop's LAN IP changes (run `pnpm --filter @peerpulse/node dev`
//     and copy the WS multiaddr it prints, or call `curl http://<host>:9876/`).
//   - The relay key rotates (delete apps/node/peer.key to force a new peerId).
//
// At runtime, EXPO_PUBLIC_* env vars override these constants — for non-local
// or per-device testing, set them in .env.local before `expo start`.

const DEFAULT_RELAY_HOST = '10.216.22.64';
const DEFAULT_RELAY_WS_PORT = 9090;
const DEFAULT_RELAY_INFO_PORT = 9876;
const DEFAULT_RELAY_PEER_ID = '12D3KooWFJijFUoxykFiBKt8S1zC47biHNBjuWPzMj7ypxBEDHpG';

const DEFAULT_RELAY_WS_ADDR =
  `/ip4/${DEFAULT_RELAY_HOST}/tcp/${DEFAULT_RELAY_WS_PORT}/ws/p2p/${DEFAULT_RELAY_PEER_ID}`;
const DEFAULT_RELAY_INFO_URL =
  `http://${DEFAULT_RELAY_HOST}:${DEFAULT_RELAY_INFO_PORT}`;

export const RELAY_WS_ADDR  = process.env['EXPO_PUBLIC_RELAY_WS_ADDR']  ?? DEFAULT_RELAY_WS_ADDR;
export const RELAY_INFO_URL = process.env['EXPO_PUBLIC_RELAY_INFO_URL'] ?? DEFAULT_RELAY_INFO_URL;
