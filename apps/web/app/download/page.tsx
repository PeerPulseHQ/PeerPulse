import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download APK',
  description:
    'Download PeerPulse for Android. Free, open-source, no Google Play. Direct APK + F-Droid.',
  alternates: { canonical: 'https://peerpulse.app/download' },
};

export default function DownloadPage() {
  return (
    <section style={{ padding: '60px 40px 100px', background: 'var(--bg)' }}>
      <div className="section-inner">
        <div className="download-inner" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="dl-icon">📲</div>
          <h1 className="dl-h2">Get PeerPulse</h1>
          <p className="dl-sub">
            Free, open-source, Android only. One download spreads peer-to-peer — one phone can share
            the APK to 20 others via WhatsApp in under five minutes.
          </p>

          <button className="dl-main-btn" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v13M8 12l4 4 4-4" />
            </svg>
            Download PeerPulse.apk — v5.0.0
          </button>

          <div className="dl-fdroid">
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: 'var(--lrn)' }}>F</span>
            Get it on F-Droid
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginLeft: '4px' }}>
              (listing pending)
            </span>
          </div>

          <div className="dl-checksum">
            <div className="dl-checksum-label">SHA-256 · v5.0.0</div>
            <div className="dl-checksum-val">
              a7f3c29d8e1b4506f2a9c3d7e5b8f1a4c6d9e2b5f8a1c4d7e0b3f6a9c2d5e8b1
            </div>
          </div>

          <div className="dl-why">
            <strong>Why no Google Play Store?</strong>
            <br />
            In September 2021 Google removed Navalny&apos;s Smart Voting app from the Russian Play Store
            under direct government pressure — days before a federal election. That is PeerPulse&apos;s
            exact threat model. F-Droid and direct APK distribution have no single point of removal.
            <br /><br />
            <div className="no-play-badge">✕ Not on Google Play · by design</div>
          </div>
        </div>
      </div>
    </section>
  );
}
