import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Run a Relay',
  description:
    'Sovereign Relays are the backbone of the PeerPulse network. Docker setup, configuration, and community registry.',
  alternates: { canonical: 'https://peerpulse.app/relay' },
};

export default function RelayPage() {
  return (
    <section style={{ padding: '60px 40px 100px' }}>
      <div className="stub-wrap" style={{ margin: '0 auto' }}>
        <div className="stub-icon">📡</div>
        <h1 className="stub-h1">Run a Sovereign Relay</h1>
        <p className="stub-sub">
          Sovereign Relays are the backbone of the PeerPulse network — they route TallyPackets, pin IPFS
          photo evidence, and serve as the gossip layer that every mobile node connects to. Minimum 3
          relays per election; at least 2 in the target country.
        </p>

        <div className="stub-code">
          docker pull ghcr.io/peerpulse/relay:latest<br /><br />
          docker run -d \<br />
          &nbsp;&nbsp;-p 9090:9090 \<br />
          &nbsp;&nbsp;-p 9876:9876 \<br />
          &nbsp;&nbsp;-e ELECTION_ID=ke-general-2027 \<br />
          &nbsp;&nbsp;-e RELAY_IDENTITY=anonymous \<br />
          &nbsp;&nbsp;ghcr.io/peerpulse/relay:latest
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--text-2)',
            lineHeight: 1.7,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              color: 'var(--tab)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Infrastructure recommendation
          </span>
          Host on 1984 Hosting (Iceland) or Mullvad. Pay with Monero. No traceable registration. Operators
          are listed pseudonymously in the community registry — contact{' '}
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--svy)' }}>press@peerpulse.app</span> to
          register.
        </div>

        <div
          style={{
            padding: '16px 20px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '13px',
            color: 'var(--text-2)',
            lineHeight: 1.7,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              color: 'var(--jrn)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Configuration
          </span>
          Each relay needs an ELECTION_ID matching the target election and a RELAY_IDENTITY (may be
          pseudonymous). Relays gossip via libp2p GossipSub on topic{' '}
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--tab)' }}>
            /peerpulse/tally/1.0.0/[election_id]
          </span>
          . No registration with PeerPulse required — the protocol is permissionless.
        </div>

        <span className="stub-tag">Full operator docs — coming with first relay release</span>
      </div>
    </section>
  );
}
