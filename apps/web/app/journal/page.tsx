'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import JournalCard from '@/components/JournalCard';
import { getPackets } from '@/lib/journal';

// Note: metadata cannot be exported from client components, so we use
// a wrapper. For this page we export it from a server component wrapper below.

const WS_TABS = [
  { id: 'all',         label: 'All'         },
  { id: 'legislature', label: 'Legislative' },
  { id: 'executive',   label: 'Executive'   },
  { id: 'judiciary',   label: 'Judicial'    },
];

export default function PulseIndexPage() {
  const [activeWs, setActiveWs] = useState('all');

  const packets = getPackets(activeWs);

  return (
    <div className="pw-wrap">
      <div className="pw-topbar">
        <div>
          <div className="pw-title">
            ⚡ <em>Journal</em>
          </div>
          <div className="pw-title-sub">
            Official government proceedings, AI-extracted, cited to primary sources
          </div>
        </div>
        <div className="pw-meta-note">
          No editorial opinion. Every claim cited back to a specific section of the primary document.
          Verify against the source before relying on specific figures.
        </div>
      </div>

      <div className="pw-jur-row">
        <button className="pw-jur-btn active">🇺🇬 Uganda</button>
        <button className="pw-jur-btn coming">🇰🇪 Kenya — seeding Oct 2026</button>
        <button className="pw-jur-btn coming">🇳🇬 Nigeria — pending</button>
      </div>

      <div className="pw-ws-row">
        {WS_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`pw-ws-btn${activeWs === tab.id ? ' active' : ''}`}
            onClick={() => setActiveWs(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pw-article-list">
        {packets.length === 0 ? (
          <div
            style={{
              background: 'var(--card)',
              padding: '32px',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--text-3)',
            }}
          >
            No articles in this branch yet.
          </div>
        ) : (
          packets.map((packet) => <JournalCard key={packet.journal_id} packet={packet} />)
        )}
      </div>
    </div>
  );
}
