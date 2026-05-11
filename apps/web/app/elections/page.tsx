import type { Metadata } from 'next';
import ElectionsTable from '@/components/ElectionsTable';

export const metadata: Metadata = {
  title: 'Elections Pipeline',
  description:
    'PeerPulse election targets through 2031. Primary launch: Kenya General 2027. Star elections to follow them.',
  alternates: { canonical: 'https://peerpulse.app/elections' },
};

export default function ElectionsPage() {
  return (
    <div className="ep-wrap">
      {/* JSON-LD for the primary election */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: 'Kenya General Election 2027',
            startDate: '2027-08-10',
            location: { '@type': 'Country', name: 'Kenya' },
            organizer: {
              '@type': 'Organization',
              name: 'Independent Electoral and Boundaries Commission',
            },
          }),
        }}
      />

      <div className="ep-header">
        <div
          className="pw-breadcrumb"
          style={{ marginBottom: '8px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-3)' }}
        >
          Home › Elections
        </div>
        <div className="ep-h1">Elections pipeline</div>
        <p className="ep-sub">
          PeerPulse targets elections where civil society has the infrastructure to seed an observer
          network. The primary launch target is Kenya General 2027. Star elections to follow them.
        </p>
      </div>

      <div className="ep-table-wrap">
        <ElectionsTable />
      </div>

      <div className="ep-section-title">Market prioritisation</div>
      <div className="ep-table-wrap">
        <table className="ep-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Country</th>
              <th>Election</th>
              <th>Date</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {[
              { p: '1', pColor: 'var(--tab)',  country: 'Kenya',       type: 'General',     date: 'Aug 2027', why: 'Legal review done, civil society ready (ELOG), 15-month lead time' },
              { p: '2', pColor: 'var(--svy)',  country: 'Nigeria',     type: 'General',     date: 'Feb 2027', why: 'Largest African democracy; YIAGA Africa PVT programme; 9-month lead — decide now' },
              { p: '3', pColor: 'var(--jrn)',  country: 'Philippines', type: 'Presidential',date: 'May 2028', why: 'High Android, English-language, PPCRV PVT tradition, large diaspora' },
              { p: '4', pColor: 'var(--lrn)',   country: 'DRC',         type: 'Presidential',date: 'Dec 2028', why: 'Core target market — conditional on eastern conflict resolution' },
              { p: 'Watch', pColor: 'var(--text-3)', country: 'Zambia', type: 'General', date: 'Aug 2026', why: '3-month lead — pilot run only, no full deployment' },
            ].map((r) => (
              <tr key={r.country + r.type}>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontWeight: 700,
                      color: r.pColor,
                    }}
                  >
                    {r.p}
                  </span>
                </td>
                <td>{r.country}</td>
                <td>{r.type}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{r.date}</td>
                <td className="ep-notes">{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
