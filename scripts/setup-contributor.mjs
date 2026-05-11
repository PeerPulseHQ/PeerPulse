#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, appendFileSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { getOrCreateIdentity, PERSONA_FILE } from './persona.mjs';

const persona = await getOrCreateIdentity();

const SSH_DIR     = join(homedir(), '.ssh');
const KEY_PATH    = join(SSH_DIR, 'id_peerpulse');
const PUB_PATH    = `${KEY_PATH}.pub`;
const CONFIG_PATH = join(SSH_DIR, 'config');
const HOST_ALIAS  = 'github-peerpulse';
const COMMENT     = persona.email;
const ORG_REPO    = 'PeerPulseHQ/PeerPulse';
const ALIAS_REMOTE_URL = `git@${HOST_ALIAS}:${ORG_REPO}.git`;

// When called standalone (not from postinstall), surface the persona context.
// Postinstall has already displayed it on first run, so suppress duplication there.
if (!process.env.PEERPULSE_FROM_POSTINSTALL) {
  console.log(`\n  PeerPulse persona: ${persona.name} <${persona.email}>`);
  console.log(`  ${persona.fresh ? 'Generated fresh —' : 'Loaded from'} ${PERSONA_FILE}`);
}

const CONFIG_BLOCK = `
# PeerPulse — pseudonymous GitHub identity
Host ${HOST_ALIAS}
  HostName github.com
  User git
  IdentityFile ${KEY_PATH}
  IdentitiesOnly yes
`;

function sh(cmd, opts = {}) { return execSync(cmd, { stdio: 'inherit', ...opts }); }
function shCapture(cmd) {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return ''; }
}

if (!existsSync(SSH_DIR)) mkdirSync(SSH_DIR, { mode: 0o700, recursive: true });

console.log('\n[1/4] SSH key');
if (existsSync(KEY_PATH)) {
  console.log(`  ✓ ${KEY_PATH} exists`);
} else {
  console.log(`  Generating ed25519 key at ${KEY_PATH} …`);
  sh(`ssh-keygen -t ed25519 -C "${COMMENT}" -f "${KEY_PATH}" -N ""`);
  chmodSync(KEY_PATH, 0o600);
  chmodSync(PUB_PATH, 0o644);
}

console.log('\n[2/4] SSH config');
const existingConfig = existsSync(CONFIG_PATH) ? readFileSync(CONFIG_PATH, 'utf8') : '';
if (existingConfig.includes(`Host ${HOST_ALIAS}`)) {
  console.log(`  ✓ ~/.ssh/config already has Host ${HOST_ALIAS}`);
} else {
  appendFileSync(CONFIG_PATH, CONFIG_BLOCK);
  chmodSync(CONFIG_PATH, 0o600);
  console.log(`  ✓ Appended Host ${HOST_ALIAS} to ${CONFIG_PATH}`);
}

console.log('\n[3/4] Authorise the key on GitHub');
console.log('\n  Public key — paste into the PeerPulseHQ GitHub account');
console.log('  (Settings > SSH and GPG keys > New SSH key):\n');
console.log('  ' + readFileSync(PUB_PATH, 'utf8').trim() + '\n');

if (!stdin.isTTY) {
  console.log('  (non-interactive shell — skipping GitHub upload prompt and ssh verification)');
  console.log('  Add the key to GitHub manually, then run `pnpm setup:contributor` to verify.\n');
  process.exit(0);
}

const rl = createInterface({ input: stdin, output: stdout });
await rl.question('  Press Enter once the key is added to GitHub … ');
rl.close();

console.log('\n  Testing ssh -T git@' + HOST_ALIAS + ' …');
const result = spawnSync('ssh', ['-T', '-o', 'StrictHostKeyChecking=accept-new', `git@${HOST_ALIAS}`], { encoding: 'utf8' });
const output = (result.stderr || '') + (result.stdout || '');
const ok = /successfully authenticated/i.test(output);

if (!ok) {
  console.error('\n  ✗ SSH authentication failed. Output:\n');
  console.error('  ' + output.split('\n').join('\n  '));
  console.error('  Verify the key is added to the correct GitHub account, then re-run this script.');
  process.exit(1);
}
const userMatch = output.match(/Hi ([^!]+)!/);
console.log(`  ✓ Authenticated${userMatch ? ' as ' + userMatch[1] : ''}`);

console.log('\n[4/4] Git remote');
const insideRepo = shCapture('git rev-parse --is-inside-work-tree') === 'true';
if (!insideRepo) {
  console.log('  Not inside a git repo — skipped. To clone:');
  console.log(`    git clone ${ALIAS_REMOTE_URL}`);
} else {
  const currentUrl = shCapture('git remote get-url origin');
  if (!currentUrl) {
    sh(`git remote add origin ${ALIAS_REMOTE_URL}`);
    console.log(`  ✓ Added origin → ${ALIAS_REMOTE_URL}`);
  } else if (currentUrl === ALIAS_REMOTE_URL) {
    console.log(`  ✓ origin already points to ${ALIAS_REMOTE_URL}`);
  } else if (/PeerPulseHQ\/PeerPulse(\.git)?$/i.test(currentUrl)) {
    sh(`git remote set-url origin ${ALIAS_REMOTE_URL}`);
    console.log(`  ✓ Rewrote origin: ${currentUrl} → ${ALIAS_REMOTE_URL}`);
  } else {
    console.log(`  ! origin is ${currentUrl} — not a PeerPulseHQ remote, left unchanged`);
  }
}

console.log(`\nSetup complete. You can now push as ${persona.name}.\n`);
