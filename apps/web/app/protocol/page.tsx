import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Protocol Reference',
  description:
    'PeerPulse open protocol — Ed25519 packets, BLE mutual attestation, libp2p GossipSub transport, hardware-backed device keys.',
  alternates: { canonical: 'https://peerpulse.app/protocol' },
};

const SECTIONS = [
  {
    color: 'var(--tab)',
    label: '§ WIRE FORMAT',
    body: 'Protobuf schema · IntentPacket · WitnessStartPacket · TallyPacket · ObserveHeartbeat',
  },
  {
    color: 'var(--svy)',
    label: '§ TRUST MODEL',
    body: 'Gold (1000) · Organisation (500) · Green (n × 100) · Yellow (1) · CITIZEN-CONFIRMED · DISPUTE_THRESHOLD (default 50)',
  },
  {
    color: 'var(--jrn)',
    label: '§ BLE CEREMONY',
    body: 'WitnessAttestation GATT exchange · Mutual presence proof · WitnessBundle assembly · Threshold n ≥ 2',
  },
  {
    color: 'var(--lrn)',
    label: '§ HARDWARE ATTESTATION',
    body: 'Android Keystore ECDSA P-256 · StrongBox API 28+ · Google HW Attestation Root CA · Revocation checks',
  },
];

export default function ProtocolPage() {
  return (
    <section style={{ padding: '60px 40px 100px' }}>
      <div className="stub-wrap" style={{ margin: '0 auto' }}>
        <div className="stub-icon">🔐</div>
        <h1 className="stub-h1">Protocol reference</h1>
        <p className="stub-sub">
          PeerPulse is a fully specified open protocol — Ed25519 signed packets, BLE mutual
          attestation, libp2p GossipSub transport, hardware-backed device keys via Android Keystore.
          Read the whitepaper for the full specification.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px', textAlign: 'left' }}>
          {SECTIONS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: '14px 18px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '9px',
                fontSize: '13px',
                color: 'var(--text-2)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  color: s.color,
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {s.label}
              </span>
              {s.body}
            </div>
          ))}
        </div>

        <Link href="/whitepaper" className="stub-tag" style={{ display: 'inline-block' }}>
          Whitepaper — full spec at /whitepaper
        </Link>
      </div>
    </section>
  );
}
