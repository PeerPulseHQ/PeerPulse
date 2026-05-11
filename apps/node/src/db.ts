import Database from 'better-sqlite3';
import type { ElectionDefinition, IntentPacket } from '@peerpulse/core';

const db = new Database('peerpulse.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS elections (
    election_id TEXT PRIMARY KEY,
    data        TEXT NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS intents (
    packet_id        TEXT PRIMARY KEY,
    election_id      TEXT NOT NULL,
    station_id       TEXT NOT NULL,
    reporter_pub_key TEXT NOT NULL,
    timestamp        INTEGER NOT NULL,
    data             TEXT NOT NULL
  );
`);

const stmts = {
  upsertElection: db.prepare(
    'INSERT OR REPLACE INTO elections (election_id, data) VALUES (?, ?)',
  ),
  allElections: db.prepare(
    'SELECT data FROM elections ORDER BY created_at DESC',
  ),
  oneElection: db.prepare(
    'SELECT data FROM elections WHERE election_id = ?',
  ),
  hasIntent: db.prepare(
    'SELECT 1 FROM intents WHERE election_id = ? AND reporter_pub_key = ? LIMIT 1',
  ),
  insertIntent: db.prepare(`
    INSERT OR IGNORE INTO intents
      (packet_id, election_id, station_id, reporter_pub_key, timestamp, data)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  intentsByElection: db.prepare(
    'SELECT data FROM intents WHERE election_id = ?',
  ),
};

export function saveElection(election: ElectionDefinition): void {
  stmts.upsertElection.run(election.election_id, JSON.stringify(election));
}

export function getElections(): ElectionDefinition[] {
  return (stmts.allElections.all() as { data: string }[]).map(r => JSON.parse(r.data));
}

export function getElection(id: string): ElectionDefinition | null {
  const row = stmts.oneElection.get(id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

/** Returns false if this identity already has an intent for this election. */
export function saveIntent(intent: IntentPacket): boolean {
  if (stmts.hasIntent.get(intent.election_id, intent.reporter_pub_key)) return false;
  stmts.insertIntent.run(
    intent.packet_id,
    intent.election_id,
    intent.station_id,
    intent.reporter_pub_key,
    intent.timestamp,
    JSON.stringify(intent),
  );
  return true;
}

export function getIntents(electionId: string): IntentPacket[] {
  return (stmts.intentsByElection.all(electionId) as { data: string }[]).map(r => JSON.parse(r.data));
}
