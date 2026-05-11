'use client';

import { useState, useEffect } from 'react';
import { elections, STATUS_META, type Election } from '@/lib/elections';

interface ElectionsTableProps {
  compact?: boolean;
}

export default function ElectionsTable({ compact = false }: ElectionsTableProps) {
  const [starred, setStarred] = useState<Set<string>>(new Set());

  // Load starred from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pp_starred');
      if (raw) {
        setStarred(new Set(JSON.parse(raw) as string[]));
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleStar(id: string) {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('pp_starred', JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Sort: starred rows float to top
  const ordered: Election[] = [
    ...elections.filter((e) => starred.has(e.id)),
    ...elections.filter((e) => !starred.has(e.id)),
  ];

  const rows = compact ? ordered.slice(0, 5) : ordered;

  return (
    <div className="elections-table">
      <div className="et-head">
        {!compact && <div className="et-th" />}
        <div className="et-th" />
        <div className="et-th">Country</div>
        <div className="et-th">Why it fits</div>
        <div className="et-th">Date</div>
        <div className="et-th">Priority</div>
        <div className="et-th">Action</div>
      </div>

      {rows.map((e) => {
        const sm = STATUS_META[e.status] ?? STATUS_META.cat;
        const isStarred = starred.has(e.id);

        return (
          <div
            key={e.id}
            className="et-row"
            style={{
              gridTemplateColumns: compact
                ? '24px 200px 1fr 120px 120px 100px'
                : '32px 24px 200px 1fr 120px 120px 100px',
            }}
          >
            {!compact && (
              <button
                className={`et-star${isStarred ? ' starred' : ''}`}
                onClick={() => toggleStar(e.id)}
                title={isStarred ? 'Following' : 'Star to follow'}
                aria-label={isStarred ? `Unstar ${e.country}` : `Star ${e.country}`}
              >
                {isStarred ? '★' : '☆'}
              </button>
            )}
            <div className="et-flag">{e.flag}</div>
            <div>
              <div className="et-country">{e.country}</div>
              <div className="et-election">{e.type}</div>
            </div>
            <div className="et-desc">{e.notes}</div>
            <div className="et-date">{e.date}</div>
            <div>
              <span className={`et-badge ${sm.cls}`}>{sm.label}</span>
            </div>
            <div className="et-action">{e.action}</div>
          </div>
        );
      })}
    </div>
  );
}
