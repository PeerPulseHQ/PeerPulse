import Link from 'next/link';
import PeerPulseLockup from './PeerPulseLockup';

export default function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-left">
          <div className="footer-logo">
            <PeerPulseLockup height={28} className="footer-logo-img" />
          </div>
          <div className="footer-tagline">
            Decentralised election verification for every citizen, on any Android phone, without trusting anyone.
          </div>
          <div className="footer-attrib">Released by PeerPulse contributors · peerpulse.app</div>
        </div>

        <div className="footer-links">
          <div>
            <div className="footer-col-title">Platform</div>
            <Link href="/how-it-works" className="footer-link">How it works</Link>
            <Link href="/journal"        className="footer-link">Journal</Link>
            <Link href="/elections"    className="footer-link">Elections</Link>
          </div>
          <div>
            <div className="footer-col-title">Protocol</div>
            <Link href="/protocol"   className="footer-link">Protocol reference</Link>
            <Link href="/relay"      className="footer-link">Run a relay</Link>
            <Link href="/playground" className="footer-link">Playground</Link>
            <Link href="/whitepaper" className="footer-link">Whitepaper</Link>
          </div>
          <div>
            <div className="footer-col-title">Resources</div>
            <Link href="/about"                   className="footer-link">About</Link>
            <Link href="/press"                   className="footer-link">Press</Link>
            <Link href="/download"                className="footer-link">Download APK</Link>
            <a    href="mailto:press@peerpulse.app" className="footer-link">press@peerpulse.app</a>
          </div>
        </div>
      </footer>

      <div className="footer-bottom">
        <span className="footer-bottom-text">peerpulse.app · Njalla-registered · Anonymous infrastructure · Monero-funded</span>
        <span className="footer-bottom-text">Open protocol · PeerPulse contributors · All rights reserved</span>
      </div>
    </>
  );
}
