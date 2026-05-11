import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';
import { generateKeypair, pubkeyToHex } from '@peerpulse/core';

const KEY_FILE = 'platform.key';

export interface PlatformKey {
  privateKey: Uint8Array;
  publicKey:  Uint8Array;
  pubkeyHex:  string;
}

export function loadOrCreatePlatformKey(): PlatformKey {
  if (existsSync(KEY_FILE)) {
    const privateKey = hexToBytes(readFileSync(KEY_FILE, 'utf8').trim());
    const publicKey  = ed25519.getPublicKey(privateKey);
    return { privateKey, publicKey, pubkeyHex: bytesToHex(publicKey) };
  }
  const kp = generateKeypair();
  writeFileSync(KEY_FILE, bytesToHex(kp.privateKey), 'utf8');
  console.log('Platform keypair generated →', KEY_FILE);
  return { privateKey: kp.privateKey, publicKey: kp.publicKey, pubkeyHex: pubkeyToHex(kp.publicKey) };
}
