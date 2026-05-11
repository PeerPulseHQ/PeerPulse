import type { Metadata } from 'next';
import { StationCard } from '@/components/StationCard';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'PeerPulse uses BLE mutual attestation and Ed25519 signatures to prove physical co-presence at polling stations without pre-coordination.',
  alternates: { canonical: 'https://peerpulse.app/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <section style={{ padding: '60px 40px 100px' }}>
      <div className="section-inner">
        <div className="section-kicker" style={{ color: 'var(--tab)' }}>How it works</div>
        <h1 className="section-h2">Presence as Proof</h1>
        <p className="section-sub">
          Physical co-location at the polling station — proved cryptographically, without
          pre-coordination or any trusted third party.
        </p>

        <div className="how-grid" style={{ marginTop: '56px' }}>
          <div className="steps">
            {[
              {
                n: '1', title: 'Declare intent',
                desc: 'Citizens confirm their assigned polling station before election day. Intent accumulates as a signal that observers are on their way. No registration, no accreditation required.',
                tech: '→ IntentPacket · signed by device key · gossipped to the network',
              },
              {
                n: '2', title: 'Arrive and check in',
                desc: 'At survey-close time, observers gather at the station entrance — where results are legally required to be posted. No accreditation needed to stand at a public entrance.',
                tech: '→ CheckInPacket · GPS coordinates · ±50m geofence',
              },
              {
                n: '3', title: 'BLE witnesses each other',
                desc: 'Phones broadcast a BLE beacon. Every other observer\'s phone detects it. Co-witness attestations are exchanged automatically — proving physical co-presence without coordination.',
                tech: '→ WitnessBundle · mutual attestation · threshold n ≥ 2',
              },
              {
                n: '4', title: 'Submit a signed tally',
                desc: 'Results are posted at the station. Observers capture and submit a cryptographically signed TallyPacket with the witness bundle attached. One phone without internet can propagate to any nearby phone via BLE.',
                tech: '→ TallyPacket · Ed25519 signature · WitnessBundle attached · IPFS photo pin',
              },
              {
                n: '5', title: 'Dispute resolution runs automatically',
                desc: 'If two tallies disagree for the same station, every node runs the same deterministic algorithm. Trust scores — not raw counts — resolve the dispute. No human moderator, no coordinator.',
                tech: '→ CONFIRMED / LEADING / CONTESTED / DEADLOCKED · algorithmically determined',
              },
            ].map((step) => (
              <div className="step" key={step.n}>
                <div className="step-num">{step.n}</div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                  <div className="step-tech">{step.tech}</div>
                </div>
              </div>
            ))}
          </div>

          <StationCard />
        </div>

        <div
          style={{
            marginTop: '60px',
            padding: '28px 32px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
          }}
        >
          <h2
            style={{
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '12px',
              color: 'var(--tab)',
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Why this matters
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '16px' }}>
            Every contested election produces the same claim: "the other side cheated." Today, resolving
            that claim requires trusting official observers, international monitors, or media organisations
            — all of which can be pressured, expelled, or simply wrong.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '16px' }}>
            PeerPulse replaces institutional trust with cryptographic proof. A citizen standing at a polling
            station produces the same kind of evidence as a government-accredited observer — a signed tally,
            attested by physically co-present witnesses. Thousands of these signatures, aggregated, form a
            parallel count that any node can verify independently.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.75 }}>
            No government can pressure a protocol to change its output. No court order can shut down a
            gossip network. The count lives as long as a single peer does.
          </p>
        </div>
      </div>
    </section>
  );
}
