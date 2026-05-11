import packetsRaw from '@/data/uganda-parliament-may2026.json';

export type JournalPacket = {
  journal_id: string;
  jurisdiction: string;
  workstream: string;
  language: string;
  title: string;
  summary: string;
  key_points: Array<{ text: string; source_ref: string }>;
  citations: Array<{ source_ref: string; url: string; excerpt: string }>;
  source_url: string;
  source_date: string;
  extracted_at: string;
  human_reviewed: boolean;
  node_id: string;
  extraction_notes?: string;
  has_poll?: boolean;
  poll_question?: string;
  poll_publisher?: string;
  node_label?: string;
};

const packets = packetsRaw as JournalPacket[];

export function getPackets(workstream?: string): JournalPacket[] {
  if (!workstream || workstream === 'all') return packets;
  return packets.filter((p) => p.workstream === workstream);
}

export function getPacket(id: string): JournalPacket | undefined {
  return packets.find((p) => p.journal_id === id);
}

// Post-relay: this will call lib/relay.ts instead of reading static JSON
