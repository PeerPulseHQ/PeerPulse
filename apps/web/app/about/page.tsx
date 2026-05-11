import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'PeerPulse is an open protocol for decentralised civic intelligence: election verification, opinion surveys, government-proceedings extraction, and civic education, released by pseudonymous contributors.',
  alternates: { canonical: 'https://peerpulse.app/about' },
};

export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <article className="about">
      <header className="about-hero">
        <div className="about-kicker">About PeerPulse</div>
        <h1 className="about-h1">
          Civic infrastructure that <span>no single party</span> can switch off.
        </h1>
        <p className="about-lede">
          PeerPulse is an open protocol for decentralised civic intelligence: independent election
          tally verification, targeted opinion surveys, AI-extracted summaries of official
          government proceedings, and civic education. It is built for environments where the
          institutions that should be neutral are sometimes not — and where citizens still deserve
          tools they can trust.
        </p>
      </header>

      <section className="about-section">
        <h2>Why this exists</h2>
        <p>
          Existing approaches to electoral integrity depend on a central authority: a trusted
          server, an accredited observer body, an official commission. Each shares a single point
          of failure: a human institution that can be pressured, corrupted, shut down, or
          legally compelled to hand over data. In contested elections — Kenya 2022, Nigeria 2023,
          DRC 2023, Uganda 2021 — every credible parallel count, every contested petition, every
          internet shutdown traces back to the same structural problem: somebody owns the
          infrastructure, and the wrong somebody can break it.
        </p>
        <p>
          PeerPulse moves the trust from institutions to mathematics. A citizen photographs the
          posted tally at the entrance of their polling station. Their phone automatically
          accumulates cryptographic co-presence attestations from other PeerPulse users at the
          same station, and produces a signed packet bound to the device's Trusted Execution
          Environment. The packet propagates over a peer-to-peer network with no central server.
          Anybody with the protocol specification can independently verify it. Anybody can run
          a relay. No one controls the network.
        </p>
      </section>

      <section className="about-section">
        <h2>How we operate</h2>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-kicker">PSEUDONYMOUS</div>
            <h3>No founder name, no headquarters</h3>
            <p>
              All public materials are attributed to <em>PeerPulse contributors</em>. There is no
              CEO to subpoena, no headquarters to raid. Press contact is a ProtonMail alias
              behind a Njalla-registered domain.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-kicker">OPEN PROTOCOL</div>
            <h3>The spec is the product</h3>
            <p>
              The protocol specification, application source code, and whitepaper are public.
              Any developer can build a compatible relay or client. No entity controls the
              network, and no entity can be the choke point.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-kicker">CITIZEN-FIRST</div>
            <h3>Useful from day one</h3>
            <p>
              The platform works with zero official participation. Citizens can independently
              verify tallies, respond to surveys, read government proceedings, and learn civic
              process without any electoral commission or NGO having to sign up first. Official
              participation is additive, not required.
            </p>
          </div>
          <div className="about-card">
            <div className="about-card-kicker">SOVEREIGNTY-RESPECTING</div>
            <h3>No US/UK dependency</h3>
            <p>
              Infrastructure runs on 1984 Hosting (Iceland) and similar jurisdictions with
              strong press-freedom protections. No US or UK servers in the critical path. No
              Google Play Store. Distribution via F-Droid and peer-to-peer APK sharing.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>What we're building, in order</h2>
        <ol className="about-roadmap">
          <li>
            <span className="about-rm-tag">MVP</span>
            <div>
              <strong>Elections + Journal seeding.</strong> One election, real tally data, real
              press coverage. Journal AI pipeline seeds the election calendar from day one.
            </div>
          </li>
          <li>
            <span className="about-rm-tag">V2</span>
            <div>
              <strong>Surveys.</strong> Organisations and governments publishing targeted
              opinion surveys with on-device privacy.
            </div>
          </li>
          <li>
            <span className="about-rm-tag">V3</span>
            <div>
              <strong>Journal (full).</strong> Year-round AI extraction of parliamentary
              debates, court rulings, executive orders, and budget statements, in local
              languages.
            </div>
          </li>
          <li>
            <span className="about-rm-tag">V4</span>
            <div>
              <strong>Learn.</strong> Civic education modules and quizzes. The retention and
              onboarding engine for the platform.
            </div>
          </li>
        </ol>
      </section>

      <section className="about-section">
        <h2>First deployment</h2>
        <p>
          <strong>Kenya General Election, 10 August 2027.</strong> Civil society seeding begins
          October 2026. The Elections Observation Group (ELOG) is the natural first partner: an
          established Parallel Vote Tabulation organisation that has worked with the IEBC since
          2010. Subsequent target markets include Nigeria (Feb 2027, contingent on go/no-go
          decision), DRC (Dec 2028), and Philippines (May 2028).
        </p>
      </section>

      <section className="about-section">
        <h2>How to engage</h2>
        <div className="about-engage">
          <Link href="/whitepaper" className="about-engage-link">
            <span className="about-engage-label">Read the whitepaper</span>
            <span className="about-engage-desc">Full v7.0 protocol specification</span>
          </Link>
          <Link href="/download" className="about-engage-link">
            <span className="about-engage-label">Install the app</span>
            <span className="about-engage-desc">Android APK, signed offline</span>
          </Link>
          <Link href="/relay" className="about-engage-link">
            <span className="about-engage-label">Run a Sovereign Relay</span>
            <span className="about-engage-desc">Anyone can operate one</span>
          </Link>
          <a href="mailto:press@peerpulse.app" className="about-engage-link">
            <span className="about-engage-label">Press inquiries</span>
            <span className="about-engage-desc">press@peerpulse.app · ProtonMail</span>
          </a>
        </div>
      </section>

      <footer className="about-foot">
        <p>
          PeerPulse is open-source software. The protocol specification, application source code,
          and whitepaper are published for public review and independent implementation. No
          entity controls the network.
        </p>
      </footer>
    </article>
  );
}
