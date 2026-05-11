import { ed25519 } from '@noble/curves/ed25519';
import { randomBytes } from '@noble/hashes/utils';
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';

export interface KeyPair {
  publicKey:  Uint8Array;
  privateKey: Uint8Array;
}

export function generateKeypair(): KeyPair {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey  = ed25519.getPublicKey(privateKey);
  return { publicKey, privateKey };
}

export function sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
  return ed25519.sign(message, privateKey);
}

export function verify(
  message:   Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): boolean {
  try {
    return ed25519.verify(signature, message, publicKey);
  } catch {
    return false;
  }
}

export function pubkeyToHex(key: Uint8Array): string {
  return bytesToHex(key);
}

export function hexToPubkey(hex: string): Uint8Array {
  return hexToBytes(hex);
}

export { randomBytes, bytesToHex, hexToBytes };
