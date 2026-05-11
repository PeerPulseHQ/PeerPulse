'use client';

import { useEffect, useState } from 'react';

type Mode = 'auto' | 'light' | 'dark';

function readMode(): Mode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const v = window.localStorage.getItem('theme');
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* localStorage may be blocked */
  }
  return 'auto';
}

function applyMode(mode: Mode) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (mode === 'auto') {
    html.removeAttribute('data-theme');
    try { window.localStorage.removeItem('theme'); } catch { /* ignore */ }
  } else {
    html.setAttribute('data-theme', mode);
    try { window.localStorage.setItem('theme', mode); } catch { /* ignore */ }
  }
}

const NEXT: Record<Mode, Mode> = { auto: 'light', light: 'dark', dark: 'auto' };

const LABEL: Record<Mode, string> = {
  auto:  'Theme: follow system. Click to switch to light.',
  light: 'Theme: light. Click to switch to dark.',
  dark:  'Theme: dark. Click to follow system.',
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('auto');
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount so the button reflects current state.
  useEffect(() => {
    setMode(readMode());
    setMounted(true);
  }, []);

  function cycle() {
    const next = NEXT[mode];
    setMode(next);
    applyMode(next);
  }

  // SSR-safe: render the button shell with an invisible icon until mounted,
  // so server and first-client render match exactly (no hydration mismatch).
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      aria-label={LABEL[mode]}
      title={LABEL[mode]}
    >
      {mounted ? <Icon mode={mode} /> : <span style={{ display: 'block', width: 16, height: 16 }} />}
    </button>
  );
}

function Icon({ mode }: { mode: Mode }) {
  if (mode === 'light') {
    // sun
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (mode === 'dark') {
    // moon
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  // auto — monitor with up arrow
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 20h8M12 17v3" />
      <path d="M8 11l4-3 4 3" />
    </svg>
  );
}
