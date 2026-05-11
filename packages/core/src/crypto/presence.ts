import { sha256 } from '@noble/hashes/sha256';
import { sign, verify, bytesToHex, hexToBytes } from './keys.js';
import type { WitnessAttestation, WitnessBundle } from '../packets/types.js';

const SESSION_WINDOW_SECS = 4 * 60 * 60; // 4-hour pairing window

function attestationMessage(subjectPubKey: string, sessionWindow: number): Uint8Array {
  const msg = `peerpulse:attest:${subjectPubKey}:${sessionWindow}`;
  return sha256(new TextEncoder().encode(msg));
}

export function createAttestation(
  subjectPubKey:  string,
  witnessPrivKey: Uint8Array,
  witnessPubKey:  string,
  sessionWindow:  number,
): WitnessAttestation {
  const msg = attestationMessage(subjectPubKey, sessionWindow);
  const sig = sign(msg, witnessPrivKey);
  return {
    presence_pub_key: witnessPubKey,
    attestation_sig:  bytesToHex(sig),
    session_window:   sessionWindow,
    pairing_method:   'qr',
  };
}

export function verifyAttestation(
  subjectPubKey: string,
  attestation:   WitnessAttestation,
): boolean {
  const msg = attestationMessage(subjectPubKey, attestation.session_window);
  try {
    return verify(
      msg,
      hexToBytes(attestation.attestation_sig),
      hexToBytes(attestation.presence_pub_key),
    );
  } catch {
    return false;
  }
}

export function currentSessionWindow(): number {
  return Math.floor(Date.now() / 1000 / SESSION_WINDOW_SECS) * SESSION_WINDOW_SECS;
}

export function verifyBundle(bundle: WitnessBundle): boolean {
  return bundle.attestations.every(a => verifyAttestation(bundle.subject_pub_key, a));
}
