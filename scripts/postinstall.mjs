#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOrCreateIdentity, PERSONA_FILE } from './persona.mjs';

const SSH_KEY_PATH    = join(homedir(), '.ssh', 'id_peerpulse');
const SSH_CONFIG_PATH = join(homedir(), '.ssh', 'config');
const SSH_HOST_ALIAS  = 'github-peerpulse';

const LEGACY_SHARED_NAME  = 'PeerPulse contributors';
const LEGACY_SHARED_EMAIL = 'contributors@peerpulse.app';

function git(args) {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

function gitSet(key, value) {
  try { execSync(`git config --local ${key} ${JSON.stringify(value)}`, { stdio: 'ignore' }); } catch {}
}

if (!git('rev-parse --is-inside-work-tree')) process.exit(0);

try { execSync('git config core.hooksPath .githooks', { stdio: 'ignore' }); } catch {}

const identity = await getOrCreateIdentity();

const currentName  = git('config --local user.name');
const currentEmail = git('config --local user.email');
const isLegacyShared = currentName === LEGACY_SHARED_NAME && currentEmail === LEGACY_SHARED_EMAIL;

// Set git identity from the chosen contributor identity if unset or still on
// the legacy shared identity. A manually-chosen identity is left alone.
if (!currentName  || isLegacyShared) gitSet('user.name',  identity.name);
if (!currentEmail || isLegacyShared) gitSet('user.email', identity.email);

gitSet('commit.gpgsign', 'false');
gitSet('tag.gpgsign',    'false');

// Named contributors keep their existing GitHub auth (their normal SSH key,
// their normal `origin` remote). The pseudonymous SSH alias and remote rewrite
// only run for pseudonym contributors. Named contributors who *want* the
// alias too can invoke `pnpm run setup:contributor` standalone later.
const isNamed = identity.kind === 'named';

const sshConfigContent = existsSync(SSH_CONFIG_PATH) ? readFileSync(SSH_CONFIG_PATH, 'utf8') : '';
const sshConfigured = existsSync(SSH_KEY_PATH) && sshConfigContent.includes(`Host ${SSH_HOST_ALIAS}`);
const needsSetup = !isNamed && (identity.fresh || !sshConfigured);

if (identity.fresh) {
  console.log('');
  if (isNamed) {
    console.log(`  Identity: named contributor — ${identity.name} <${identity.email}>`);
    console.log(`  Saved at ${PERSONA_FILE}`);
    console.log(`  Your git identity has been set. Use your existing SSH/GitHub auth to push.`);
    console.log(`  If you later want the pseudonymous SSH alias too: pnpm run setup:contributor`);
  } else {
    console.log(`  Identity: pseudonym — ${identity.name} <${identity.email}>`);
    console.log(`  Saved at ${PERSONA_FILE}`);
    console.log(`  Back this file up to keep this identity across machines.`);
    console.log(`  Delete it to be asked again on next install.`);
  }
}

if (needsSetup) {
  if (!identity.fresh) {
    console.log(`\n  Pseudonym: ${identity.name} <${identity.email}>`);
    console.log(`  SSH key or config missing — running contributor setup …`);
  }
  const setupScript = join(dirname(fileURLToPath(import.meta.url)), 'setup-contributor.mjs');
  const result = spawnSync('node', [setupScript], {
    stdio: 'inherit',
    env: { ...process.env, PEERPULSE_FROM_POSTINSTALL: '1' },
  });
  if (typeof result.status === 'number' && result.status !== 0) process.exit(result.status);
}
