import { sha256 } from '@noble/hashes/sha256';
import { sign, verify, hexToBytes, bytesToHex } from './keys.js';
import type { AnyPacket } from '../packets/types.js';

function packetCanonical(packet: Omit<AnyPacket, 'sig'>): Uint8Array {
  const copy = { ...packet } as Record<string, unknown>;
  delete copy['sig'];
  const json = JSON.stringify(copy, Object.keys(copy).sort());
  return new TextEncoder().encode(json);
}

export function signPacket<T extends AnyPacket>(
  packet: Omit<T, 'sig'>,
  privateKey: Uint8Array,
): T {
  const bytes = packetCanonical(packet as Omit<AnyPacket, 'sig'>);
  const digest = sha256(bytes);
  const sig = sign(digest, privateKey);
  return { ...packet, sig: bytesToHex(sig) } as T;
}

export function verifyPacket(packet: AnyPacket, publicKeyHex: string): boolean {
  const { sig, ...rest } = packet;
  const bytes = packetCanonical(rest as Omit<AnyPacket, 'sig'>);
  const digest = sha256(bytes);
  try {
    return verify(digest, hexToBytes(sig), hexToBytes(publicKeyHex));
  } catch {
    return false;
  }
}
