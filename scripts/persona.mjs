// Contributor identity helper for PeerPulse.
//
// On first run, asks the contributor to choose between:
//   - pseudonym (default): a per-machine generated identity, e.g. "Lucky Cipher"
//   - named:               their real name and email
//
// The choice is persisted to ~/.peerpulse-persona.json so subsequent runs don't
// re-prompt. Back up that file to carry the identity across machines; delete it
// to be asked again on the next install.

import crypto from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export const PERSONA_FILE = join(homedir(), '.peerpulse-persona.json');

const ADJECTIVES = [
  'Slick', 'Lucky', 'Quiet', 'Sticky', 'Velvet', 'Smooth', 'Shifty', 'Silent',
  'Cool', 'Snappy', 'Steady', 'Sly', 'Speedy', 'Salty', 'Big', 'Little',
  'Long', 'Short', 'Honest', 'Humble', 'Three-Card', 'Two-Bit', 'Half-Pint',
  'Loose-Lipped', 'Tight-Lipped', 'Rusty', 'Greasy', 'Brass', 'Iron', 'Pearl',
  'Slow-Hand', 'Quick-Hand', 'Knockabout', 'Sidewinder', 'Backroom', 'Boxcar',
];

const NICKNAMES = [
  // Mob-era nicknames
  'Otto', 'Vinny', 'Sal', 'Tony', 'Mickey', 'Pete', 'Charlie', 'Eddie',
  'Frankie', 'Tommy', 'Marty', 'Joey', 'Louie', 'Sully', 'Benny', 'Manny',
  'Gus', 'Hank', 'Ace', 'Domino',
  // Things-as-nicknames (Goodfellas vibes)
  'Knuckles', 'Fingers', 'Boots', 'Pockets', 'Toothpick', 'Briefcase',
  'Numbers', 'Cufflinks', 'Notebook', 'Lighter',
  // Tech-meets-noir
  'Pixel', 'Hex', 'Hash', 'Cipher', 'Token', 'Buffer', 'Cache', 'Mongoose',
  'Sketch', 'Pivot', 'Loop', 'Glitch', 'Bitwise', 'Kernel',
];

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pick(list) {
  return list[crypto.randomInt(0, list.length)];
}

function generatePseudonym() {
  const adj = pick(ADJECTIVES);
  const nick = pick(NICKNAMES);
  const id = crypto.randomBytes(3).toString('hex'); // disambiguates collisions
  return {
    kind: 'pseudonym',
    name: `${adj} ${nick}`,
    email: `${slug(adj)}-${slug(nick)}-${id}@peerpulse.app`,
    generated_at: new Date().toISOString(),
  };
}

async function askIdentityChoice() {
  console.log('');
  console.log('  ──────────────────────────────────────────────────────────────');
  console.log('  PeerPulse contributor identity');
  console.log('  ──────────────────────────────────────────────────────────────');
  console.log('');
  console.log('  Two paths:');
  console.log('');
  console.log('  [P] Pseudonym  (default, recommended)');
  console.log('       A per-machine identity is generated for you (e.g. "Lucky');
  console.log('       Cipher"). Right choice if you live in or near a target');
  console.log('       jurisdiction (Kenya, Nigeria, DRC, Uganda, Philippines,');
  console.log('       Indonesia), are in a profession that could be pressured,');
  console.log('       or simply prefer privacy.');
  console.log('');
  console.log('  [N] Named contributor');
  console.log('       You commit under your real name and email. Right choice');
  console.log('       if you are outside target jurisdictions, not professionally');
  console.log('       at risk, and accept that public association with PeerPulse');
  console.log('       may attract attention from hostile state actors or press');
  console.log('       in future. This is a one-way door — once your name is in');
  console.log('       the git history, it stays there.');
  console.log('');

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const raw = (await rl.question('  Choice [P/n]: ')).trim().toLowerCase();
    if (raw === 'n' || raw === 'named') {
      const name  = (await rl.question('  Your name (as it should appear in commits): ')).trim();
      const email = (await rl.question('  Your email (as it should appear in commits): ')).trim();
      if (!name || !email) {
        console.log('  Empty name or email — falling back to pseudonym.');
        return generatePseudonym();
      }
      return {
        kind: 'named',
        name,
        email,
        generated_at: new Date().toISOString(),
      };
    }
    return generatePseudonym();
  } finally {
    rl.close();
  }
}

/**
 * Load the identity from disk, or prompt the contributor and persist a new one.
 * Non-interactive shells (CI, sandboxes) silently default to pseudonym.
 *
 * @returns {Promise<{
 *   kind: 'pseudonym' | 'named';
 *   name: string;
 *   email: string;
 *   generated_at: string;
 *   fresh: boolean;
 * }>}  `fresh` is true when the identity was created on this call.
 */
export async function getOrCreateIdentity() {
  if (existsSync(PERSONA_FILE)) {
    try {
      const data = JSON.parse(readFileSync(PERSONA_FILE, 'utf8'));
      if (typeof data.name === 'string' && typeof data.email === 'string') {
        return { kind: data.kind ?? 'pseudonym', ...data, fresh: false };
      }
    } catch {
      // fall through and re-prompt
    }
  }

  const identity = stdin.isTTY
    ? await askIdentityChoice()
    : generatePseudonym();

  writeFileSync(PERSONA_FILE, JSON.stringify(identity, null, 2) + '\n');
  try { chmodSync(PERSONA_FILE, 0o600); } catch { /* */ }
  return { ...identity, fresh: true };
}

// Backwards-compatible alias for the previous synchronous API. Returns a
// promise now; existing call sites that `await` will continue to work.
export const getOrCreatePersona = getOrCreateIdentity;
