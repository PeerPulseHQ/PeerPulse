import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press',
  description:
    'PeerPulse press contact, key facts, and downloadable assets for journalists covering election verification.',
  alternates: { canonical: 'https://peerpulse.app/press' },
};

export default function PressPage() {
  return (
    <section
      style={{
        padding: '60px 40px 100px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="section-inner">
        <div className="section-kicker" style={{ color: 'var(--text-3)' }}>Press</div>
        <h1 className="section-h2">For journalists.</h1>

        <div className="press-grid">
          <div className="press-copy">
            <p>
              PeerPulse is a decentralised protocol for election observation. It gives any citizen with
              an Android phone the ability to independently verify election results at their polling
              station — with cryptographic proof of physical co-presence and no reliance on a central
              server.
            </p>
            <p>
              On election day, thousands of observers simultaneously submit signed tallies from polling
              stations across a country. Every submission is co-attested by Bluetooth witnesses physically
              present at the same location. Results aggregate in real time. If the official count diverges
              from the citizen count, every observer has a signed receipt.
            </p>
            <p>
              The protocol is open-source. There is no corporate entity behind it —{' '}
              <strong>PeerPulse contributors</strong> release it as free software. There is no CEO to
              interview or subpoena. The product and the protocol speak.
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '14px' }}>
              All press enquiries are handled through the contact below. ProtonMail preferred for
              encrypted correspondence. Pre-election briefings available on request for journalists
              covering target elections.
            </p>
          </div>

          <div className="press-sidebar">
            <div className="press-card">
              <div className="press-card-title">Press Contact</div>
              <a href="mailto:press@peerpulse.app" className="press-contact">
                <svg
                  style={{ width: '16px', height: '16px', fill: 'none', stroke: 'var(--svy)', strokeWidth: 2, strokeLinecap: 'round' }}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                press@peerpulse.app
              </a>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-3)',
                  fontFamily: 'var(--mono)',
                  marginTop: '10px',
                  lineHeight: 1.6,
                }}
              >
                Encrypted email preferred (ProtonMail).<br />
                All materials attributed to &ldquo;PeerPulse contributors.&rdquo;
              </div>
            </div>

            <div className="press-card">
              <div className="press-card-title">Key Facts</div>
              <div className="key-facts">
                {[
                  ['Protocol',       'Open-source'],
                  ['Platform',       'Android only'],
                  ['Distribution',   'F-Droid + direct APK'],
                  ['Trust mechanism','BLE + GPS + Ed25519'],
                  ['Central servers','Zero'],
                  ['Primary target', 'Kenya Aug 2027'],
                  ['Attribution',    'PeerPulse contributors'],
                ].map(([k, v]) => (
                  <div className="kf-row" key={k}>
                    <span className="kf-key">{k}</span>
                    <span className="kf-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="press-card">
              <div className="press-card-title">Downloadable Assets</div>
              <div className="press-assets">
                <div className="press-asset">
                  <span>Whitepaper (PDF)</span>
                  <span className="press-asset-size">↓ PDF · coming soon</span>
                </div>
                <div className="press-asset">
                  <span>Protocol reference</span>
                  <span className="press-asset-size">↗ /protocol</span>
                </div>
                <div className="press-asset">
                  <span>Logo assets (SVG + PNG)</span>
                  <span className="press-asset-size">↓ ZIP · coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
