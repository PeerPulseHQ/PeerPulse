import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { generateKeyPair, privateKeyFromProtobuf, privateKeyToProtobuf } from '@libp2p/crypto/keys';
import type { PrivateKey } from '@libp2p/interface';

const PEER_KEY_FILE = 'peer.key';

export async function loadOrCreatePeerKey(): Promise<PrivateKey> {
  if (existsSync(PEER_KEY_FILE)) {
    const buf = readFileSync(PEER_KEY_FILE);
    return privateKeyFromProtobuf(new Uint8Array(buf));
  }
  const key = await generateKeyPair('Ed25519');
  writeFileSync(PEER_KEY_FILE, Buffer.from(privateKeyToProtobuf(key)));
  console.log('libp2p peer keypair generated →', PEER_KEY_FILE);
  return key;
}
