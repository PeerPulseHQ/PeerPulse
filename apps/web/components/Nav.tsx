'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import PeerPulseLockup from './PeerPulseLockup';

type NavLink = { href: string; label: string; desc?: string };

const PRODUCT: NavLink[] = [
  { href: '/how-it-works', label: 'How it works', desc: 'The protocol in plain language' },
  { href: '/elections',    label: 'Elections',    desc: 'Live tally observation' },
  { href: '/journal',      label: 'Journal',      desc: 'Government proceedings, summarised' },
];

const DOCS: NavLink[] = [
  { href: '/whitepaper', label: 'Whitepaper',         desc: 'Full v7.0 protocol specification' },
  { href: '/protocol',   label: 'Protocol reference', desc: 'Wire format and validation' },
  { href: '/playground', label: 'Playground',         desc: 'Build packets in the browser' },
  { href: '/relay',      label: 'Run a relay',        desc: 'Operate Sovereign Relay infrastructure' },
  { href: '/press',      label: 'Press',              desc: 'Press kit and contact' },
];

const SINGLES: NavLink[] = [
  { href: '/about', label: 'About' },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Nav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<'product' | 'docs' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpenMenu(null); setMobileOpen(false); }
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const productActive = PRODUCT.some(l => isActive(pathname, l.href));
  const docsActive    = DOCS.some(l => isActive(pathname, l.href));

  return (
    <>
      <nav className="site-nav" ref={menuRef}>
        <Link href="/" className="nav-logo" aria-label="PeerPulse home">
          <PeerPulseLockup height={32} className="nav-logo-img" />
        </Link>

        <div className="nav-links">
          <NavDropdown
            label="Product"
            active={productActive}
            open={openMenu === 'product'}
            onToggle={() => setOpenMenu(openMenu === 'product' ? null : 'product')}
            items={PRODUCT}
            pathname={pathname}
          />
          <NavDropdown
            label="Docs"
            active={docsActive}
            open={openMenu === 'docs'}
            onToggle={() => setOpenMenu(openMenu === 'docs' ? null : 'docs')}
            items={DOCS}
            pathname={pathname}
          />
          {SINGLES.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${isActive(pathname, href) ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <Link href="/download" className="nav-cta nav-cta-desktop">
          Download APK
        </Link>

        <ThemeToggle />

        <button
          type="button"
          className={`nav-burger${mobileOpen ? ' is-open' : ''}`}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(o => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`nav-mobile-sheet${mobileOpen ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!mobileOpen}>
        <div className="nav-mobile-inner">
          <MobileGroup title="Product" items={PRODUCT} pathname={pathname} />
          <MobileGroup title="Docs"    items={DOCS}    pathname={pathname} />
          <MobileGroup title=""        items={SINGLES} pathname={pathname} />
          <Link href="/download" className="nav-cta nav-cta-mobile">
            Download APK
          </Link>
        </div>
      </div>
    </>
  );
}

function NavDropdown({
  label, active, open, onToggle, items, pathname,
}: {
  label: string; active: boolean; open: boolean; onToggle: () => void;
  items: NavLink[]; pathname: string;
}) {
  return (
    <div className={`nav-dd${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`nav-link nav-dd-trigger${active ? ' active' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onToggle}
      >
        {label}
        <svg className="nav-dd-caret" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="nav-dd-panel" role="menu">
          {items.map(({ href, label: lbl, desc }) => (
            <Link
              key={href}
              href={href}
              className={`nav-dd-item${isActive(pathname, href) ? ' active' : ''}`}
              role="menuitem"
            >
              <span className="nav-dd-item-label">{lbl}</span>
              {desc && <span className="nav-dd-item-desc">{desc}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileGroup({ title, items, pathname }: { title: string; items: NavLink[]; pathname: string }) {
  if (items.length === 0) return null;
  return (
    <div className="nav-mobile-group">
      {title && <div className="nav-mobile-title">{title}</div>}
      {items.map(({ href, label, desc }) => (
        <Link
          key={href}
          href={href}
          className={`nav-mobile-link${isActive(pathname, href) ? ' active' : ''}`}
        >
          <span className="nav-mobile-link-label">{label}</span>
          {desc && <span className="nav-mobile-link-desc">{desc}</span>}
        </Link>
      ))}
    </div>
  );
}
