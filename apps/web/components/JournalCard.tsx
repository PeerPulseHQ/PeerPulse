import Link from 'next/link';
import type { JournalPacket } from '@/lib/journal';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getSourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

interface JournalCardProps {
  packet: JournalPacket;
}

export default function JournalCard({ packet }: JournalCardProps) {
  const jur = packet.jurisdiction.toLowerCase();
  const href = `/journal/${jur}/${packet.workstream}/${packet.journal_id}`;

  return (
    <Link href={href} className="pw-card" style={{ display: 'block' }}>
      <div className="pw-card-top">
        <span className={`pw-ws-badge ${packet.workstream}`}>
          {packet.workstream}
        </span>
        <span className="pw-card-date">{fmtDate(packet.source_date)}</span>
        {packet.extraction_notes && (
          <span className="pw-warn-chip">AI extracted · review flagged</span>
        )}
        <span className="pw-card-node">
          <span className="pw-node-live" aria-hidden="true" />
          {packet.node_label ?? packet.node_id}
        </span>
      </div>

      <h3>{packet.title}</h3>
      <p className="pw-card-summary">{packet.summary}</p>

      <div className="pw-card-footer">
        <span className="pw-card-source">
          {getSourceDomain(packet.source_url)}
        </span>
        <span className="pw-card-points">
          {packet.key_points.length} key points
        </span>
      </div>
    </Link>
  );
}
