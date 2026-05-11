import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroCanvas, StationCard } from '@/components/StationCard';
import ElectionsTable from '@/components/ElectionsTable';

export const metadata: Metadata = {
  title: 'PeerPulse — Decentralised Election Verification',
  description:
    'Citizens independently verify elections with BLE presence attestation and cryptographic tallies. No central server. Android-only.',
  alternates: { canonical: 'https://peerpulse.app/' },
  openGraph: {
    title: 'PeerPulse — Decentralised Election Verification',
    description:
      'Citizens independently verify elections with BLE presence attestation and cryptographic tallies.',
  },
};

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <HeroCanvas />
        <div className="hero-content">
          <div className="hero-kicker">
            <div className="hero-kicker-dot" />
            Decentralised · Open Protocol · Android
          </div>
          <h1 className="hero-h1">
            Every vote,<br />
            <span>independently verified.</span>
          </h1>
          <p className="hero-sub">
            PeerPulse lets citizens count election results at every polling station — simultaneously,
            cryptographically, without a central server any government can pressure or take down.
          </p>
          <div className="hero-actions">
            <Link href="/download" className="btn-primary">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v13M8 12l4 4 4-4" />
              </svg>
              Download APK — free
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              How it works
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hs-num">46,229</div>
              <div className="hs-label">Polling stations tracked</div>
            </div>
            <div className="hero-stat">
              <div className="hs-num">1</div>
              <div className="hs-label">Elections in pipeline</div>
            </div>
            <div className="hero-stat">
              <div className="hs-num">0</div>
              <div className="hs-label">Central servers</div>
            </div>
            <div className="hero-stat">
              <div className="hs-num">Open</div>
              <div className="hs-label">Source protocol</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR PILLARS */}
      <section id="how">
        <div className="section-inner">
          <div className="section-kicker" style={{ color: 'var(--text-3)' }}>The Platform</div>
          <h2 className="section-h2">Four tools. One mission.</h2>
          <p className="section-sub">
            Built for citizens to hold power accountable year-round — not just on election day.
          </p>

          <div className="pillars-grid">
            <div className="pillar-card tab">
              <div className="pillar-icon">🗳️</div>
              <div className="pillar-name">Elections</div>
              <p className="pillar-desc">
                Citizens independently count and co-sign official election tallies at polling stations on
                election day. Results aggregate across thousands of stations into a parallel count —
                verifiable against any official result.
              </p>
              <div className="pillar-detail">
                Physical co-presence proven by BLE mutual attestation · GPS · hardware-backed device keys
                <br />No pre-coordination · No accreditation required · Works offline
              </div>
            </div>

            <div className="pillar-card pol">
              <div className="pillar-icon">📊</div>
              <div className="pillar-name">Surveys</div>
              <p className="pillar-desc">
                Governments, NGOs, and civil society organisations publish targeted surveys to opted-in
                citizens. Results are tallied locally on each device — no centralised collection, no
                demographic data leaves the phone.
              </p>
              <div className="pillar-detail">
                Publisher-signed SurveyDefinitions · Pseudonymous VotePackets · Three eligibility tiers
                <br />Open · Witnessed · Credentialed
              </div>
            </div>

            <div className="pillar-card pls">
              <div className="pillar-icon">⚡</div>
              <div className="pillar-name">Journal</div>
              <p className="pillar-desc">
                AI-extracted neutral summaries of official government proceedings — parliament debates,
                budgets, court rulings, executive orders — delivered in plain language and local languages.
              </p>
              <div className="pillar-detail">
                Hansard · Government Gazettes · Court registries · Treasury publications
                <br />Citations link to primary sources · No editorial opinion · Swahili, Lingala, French
              </div>
            </div>

            <div className="pillar-card iq">
              <div className="pillar-icon">🎓</div>
              <div className="pillar-name">Learn</div>
              <p className="pillar-desc">
                Curated civic education content and quizzes. Know your rights. Understand how elections
                work. Learn what a parliamentary committee does. Localised per jurisdiction.
              </p>
              <div className="pillar-detail">
                Year-round retention · Civic literacy badges · Onboarding funnel for Elections
                <br />Content sponsored by NGOs and civil society organisations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW ELECTIONS WORKS */}
      <section id="elections" style={{ background: 'var(--bg)' }}>
        <div className="section-inner">
          <div className="section-kicker" style={{ color: 'var(--tab)' }}>Elections</div>
          <h2 className="section-h2">Presence as proof.</h2>
          <p className="section-sub">
            Physical co-location at the polling station — proved cryptographically, without pre-coordination.
          </p>

          <div className="how-grid">
            <div className="steps">
              {[
                {
                  n: '1', title: 'Declare intent',
                  desc: 'Citizens confirm their assigned polling station before election day. Intent accumulates as a signal that observers are on their way.',
                  tech: '→ IntentPacket · signed by device key · gossipped to the network',
                },
                {
                  n: '2', title: 'Arrive and check in',
                  desc: 'At survey-close time, observers gather at the station entrance — where results are legally required to be posted. No accreditation needed.',
                  tech: '→ CheckInPacket · GPS coordinates · ±50m geofence',
                },
                {
                  n: '3', title: 'BLE witnesses each other',
                  desc: 'Phones broadcast a BLE beacon. Every other observer\'s phone detects it. Co-witness attestations are exchanged automatically.',
                  tech: '→ WitnessBundle · mutual attestation · threshold n ≥ 2',
                },
                {
                  n: '4', title: 'Submit a signed tally',
                  desc: 'Results are posted at the station. Observers capture and submit a cryptographically signed TallyPacket with the witness bundle attached.',
                  tech: '→ TallyPacket · Ed25519 signature · WitnessBundle attached · IPFS photo pin',
                },
                {
                  n: '5', title: 'Dispute resolution runs automatically',
                  desc: 'If two tallies disagree for the same station, every node runs the same deterministic algorithm. Trust scores — not raw counts — resolve the dispute.',
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
        </div>
      </section>

      {/* TRUST MODEL */}
      <section id="trust" style={{ background: 'var(--bg)', paddingTop: '60px', paddingBottom: '80px' }}>
        <div className="section-inner">
          <div className="section-kicker" style={{ color: 'var(--text-3)' }}>Trust Model</div>
          <h2 className="section-h2" style={{ fontSize: '28px' }}>Four tiers. One weight model.</h2>
          <div className="trust-grid">
            <div className="trust-card">
              <div className="tc-label" style={{ color: '#e8b84b' }}>Government · Gold</div>
              <div className="tc-val" style={{ color: '#e8b84b' }}>1000</div>
              <div className="tc-desc">
                Electoral commissions and official state bodies. 30-day device-bound leaf cert under
                GovernmentSubCA. Hardware-attested where available.
              </div>
            </div>
            <div className="trust-card">
              <div className="tc-label" style={{ color: 'var(--svy)' }}>Organisation</div>
              <div className="tc-val" style={{ color: 'var(--svy)' }}>500</div>
              <div className="tc-desc">
                NGOs, accredited media, and registered political parties. Organisation leaf cert under
                ObserverSubCA. Entity-capped to one slot per station per organisation.
              </div>
            </div>
            <div className="trust-card">
              <div className="tc-label" style={{ color: '#22c55e' }}>Attested Citizen · Green</div>
              <div className="tc-val" style={{ color: '#22c55e' }}>n × 100</div>
              <div className="tc-desc">
                Citizens with a valid BLE WitnessBundle. Weight scales with co-witness count{' '}
                <em>n</em>. 15 honest TEE-attested citizens can overrule a contradicting Gold submission.
              </div>
            </div>
            <div className="trust-card">
              <div className="tc-label" style={{ color: 'var(--text-3)' }}>Reported Citizen · Yellow</div>
              <div className="tc-val" style={{ color: 'var(--text-3)' }}>1</div>
              <div className="tc-desc">
                Citizen submission with no BLE attestation. Recorded and visible but does not contribute
                toward any confirmation state.
              </div>
            </div>
          </div>
          <p
            style={{
              marginTop: '20px',
              fontSize: '13px',
              color: 'var(--text-3)',
              fontFamily: 'var(--mono)',
              textAlign: 'center',
            }}
          >
            The app is fully functional with zero official participation. Green-tier citizen quorums work
            from day one. Gold and Organisation tiers layer on as governments and NGOs adopt.
          </p>
        </div>
      </section>

      {/* ELECTIONS PIPELINE SNIPPET */}
      <section
        id="elections-section"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="section-inner">
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '40px',
            }}
          >
            <div>
              <div className="section-kicker" style={{ color: 'var(--text-3)' }}>Elections Pipeline</div>
              <h2 className="section-h2">Where PeerPulse will be.</h2>
              <p className="section-sub">
                Monitored elections and targets through 2031. Primary selection criteria: active civil
                society, contested result, high Android penetration.
              </p>
            </div>
            <span className="live-badge">Continuously updated</span>
          </div>

          <ElectionsTable compact />

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Link
              href="/elections"
              style={{ fontSize: '13px', fontFamily: 'var(--mono)', color: 'var(--jrn)', fontWeight: 600 }}
            >
              View all elections →
            </Link>
          </div>
        </div>
      </section>

      {/* FOR ORGANISATIONS */}
      <section
        id="orgs"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="section-inner">
          <div className="section-kicker" style={{ color: 'var(--svy)' }}>Organisations</div>
          <h2 className="section-h2">Your observer corps, amplified.</h2>
          <p className="section-sub">
            Electoral commissions, NGOs, and media organisations gain credentialed-observer status that adds
            institutional weight to your submissions.
          </p>

          <div className="orgs-grid">
            <div className="orgs-features">
              {[
                {
                  title: 'Credentialed blue-tier weight',
                  desc: 'Approved organisations receive a device-bound ObserverLeaf cert under PeerPulse\'s ObserverSubCA. Each submission carries institutional trust weight (500) — 50× a solo grey-tier citizen.',
                },
                {
                  title: 'Multiple observers, one organisation ID',
                  desc: 'Each observer device gets its own leaf cert. All share the same org_id. Weight is entity-capped to one slot per station, preventing any one organisation from dominating the count.',
                },
                {
                  title: 'Live parallel count dashboard',
                  desc: 'The Desktop app gives your team a war-room view: every station, every submission, every dispute — in real time. Confirmation states, witness density, anomaly flags.',
                },
                {
                  title: 'Subsidised for civil society',
                  desc: 'Certification is per-election, not per-observer. Civil society organisations in target markets are eligible for subsidised or zero-cost certification at PeerPulse\'s discretion.',
                },
              ].map((f) => (
                <div className="org-feature" key={f.title}>
                  <div className="of-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="of-title">{f.title}</div>
                    <div className="of-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="org-contact-card">
              <div className="occ-title">Apply for Organisation Certification</div>
              <div className="occ-sub">
                Applications reviewed manually. Turnaround 5–10 business days. Apply at least 2 weeks
                before the organisation registration deadline.
              </div>
              <div className="occ-steps">
                {[
                  'Email press@peerpulse.app with your legal registration certificate, observer names (may be pseudonymous), and target election ID.',
                  'PeerPulse verifies your legal existence in the election jurisdiction. Use ProtonMail or SimpleX for encrypted correspondence.',
                  'On approval, each observer device generates a keypair and receives a signed OrganisationLeaf cert valid for the election duration + 7 days.',
                ].map((text, i) => (
                  <div className="occ-step" key={i}>
                    <div className="occ-step-num">{i + 1}</div>
                    <div className="occ-step-text">{text}</div>
                  </div>
                ))}
              </div>
              <a href="mailto:press@peerpulse.app" className="occ-email">
                <svg
                  viewBox="0 0 24 24"
                  style={{ width: '16px', height: '16px', fill: 'none', stroke: 'var(--svy)', strokeWidth: 2, strokeLinecap: 'round' }}
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                press@peerpulse.app
              </a>
              <div className="occ-note">
                All correspondence is encrypted. ProtonMail or SimpleX preferred.<br />
                Pre-launch subsidy available for civil society organisations in Kenya, Nigeria, and DRC.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="download" style={{ background: 'var(--bg)' }}>
        <div className="section-inner">
          <div className="download-inner">
            <div className="dl-icon">📲</div>
            <h2 className="dl-h2">Get PeerPulse</h2>
            <p className="dl-sub">
              Free, open-source, Android only. One download spreads peer-to-peer — one phone can share
              the APK to 20 others via WhatsApp in under five minutes.
            </p>

            <Link href="/download" className="dl-main-btn" style={{ textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v13M8 12l4 4 4-4" />
              </svg>
              Download PeerPulse.apk — v5.0.0
            </Link>

            <div className="dl-fdroid">
              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: 'var(--lrn)' }}>F</span>
              Get it on F-Droid
              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginLeft: '4px' }}>(listing pending)</span>
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

      {/* PRESS */}
      <section
        id="press"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="section-inner">
          <div className="section-kicker" style={{ color: 'var(--text-3)' }}>Press</div>
          <h2 className="section-h2">For journalists.</h2>

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
                stations across a country. Every submission is co-attested by Bluetooth witnesses
                physically present at the same location. Results aggregate in real time.
              </p>
              <p>
                The protocol is open-source. There is no corporate entity behind it —{' '}
                <strong>PeerPulse contributors</strong> release it as free software. There is no CEO to
                interview or subpoena. The product and the protocol speak.
              </p>
            </div>

            <div className="press-sidebar">
              <div className="press-card">
                <div className="press-card-title">Press Contact</div>
                <a href="mailto:press@peerpulse.app" className="press-contact">
                  press@peerpulse.app
                </a>
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
                  ].map(([k, v]) => (
                    <div className="kf-row" key={k}>
                      <span className="kf-key">{k}</span>
                      <span className="kf-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
