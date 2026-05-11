# Task: Next.js Website — apps/web

**Phase:** Week 1 (replaces web app placeholder)
**Depends on:** Monorepo scaffold (pnpm workspace + turbo config from Week 1)
**Spec refs:** `spec-operations.md §6.2–6.5`, `spec-journal.md §10.2`
**Mockup:** `docs/product/archive/website-mockup.html` — this is the source of truth for design, copy, and layout. Implement it directly; do not redesign.

---

## Outcome

`pnpm dev` in the monorepo root starts `apps/web` at `localhost:3000`. All static routes render correctly. Journal content pages render Uganda packet data. Elections page renders with starring via localStorage. Hash-based routing from the mockup is replaced by Next.js App Router file-based routing.

---

## Stack

- **Framework:** Next.js 15, App Router, TypeScript strict (`strict: true` in tsconfig)
- **Styling:** Tailwind CSS v4 — but use CSS variables matching the mockup exactly. Do not redesign; port the mockup's CSS variables and class names.
- **Fonts:** IBM Plex Sans + IBM Plex Mono via `next/font/google`. Variables: `--sans`, `--mono`.
- **Images:** `next/image` for all images — explicit `width`, `height`, `alt` on every instance.
- **No UI library.** The mockup's own CSS is the design system.

---

## Monorepo placement

```
apps/
  web/                  ← new
    app/
      layout.tsx        ← root layout: nav + footer, font injection
      page.tsx          ← home (/)
      how-it-works/
        page.tsx
      whitepaper/
        page.tsx
      download/
        page.tsx
      elections/
        page.tsx        ← ISR, revalidate 60s
        [electionId]/
          page.tsx      ← ISR, revalidate 60s
      journal/
        page.tsx        ← Journal index
        [jurisdiction]/
          [workstream]/
            [journalId]/
              page.tsx  ← individual article
      press/
        page.tsx
      relay/
        page.tsx
      protocol/
        page.tsx
    components/
      Nav.tsx
      Footer.tsx
      PulseCard.tsx
      PulseArticle.tsx
      ElectionsTable.tsx
      TrustModel.tsx
      StationCard.tsx   ← the live station card from the hero section
    lib/
      journal.ts          ← fetch/parse JournalPackets (static JSON for now)
      elections.ts      ← election data + star state
    data/
      uganda-parliament-may2026.json   ← copy from docs/product/journal/examples/
      elections-pipeline.json          ← structured version of elections-pipeline.md data
    public/
      robots.txt
    next.config.ts
    tailwind.config.ts
    tsconfig.json
```

---

## Routes and rendering

| Route | Strategy | Primary content |
|---|---|---|
| `/` | Static | Full landing page from mockup: hero (canvas animation), four pillars, how Tabulate works, trust model (4-tier: Gold/Blue/Green/Grey), elections pipeline snippet, Journal preview (3 Uganda articles), organisations, download, press |
| `/how-it-works` | Static | Expanded version of the "Presence as Proof" section from mockup |
| `/whitepaper` | Static | Placeholder — "Whitepaper coming soon" with download CTA |
| `/download` | Static | APK download button, F-Droid badge, SHA-256 checksum, "No Google Play" rationale |
| `/elections` | Static for now (ISR post-relay) | Full elections pipeline table with starring (localStorage), market prioritisation table — from `elections-pipeline.json` |
| `/elections/[electionId]` | Static for now (ISR post-relay) | Per-election detail — stub with available static data |
| `/journal` | Static | Journal index: Uganda jurisdiction, workstream tabs, article list from `uganda-parliament-may2026.json` |
| `/journal/[jurisdiction]/[workstream]/[journalId]` | Static | Individual article: summary, key points with source_ref citations, citations with excerpts, AI-extracted warning, Journal node, Poll card if applicable |
| `/press` | Static | One paragraph, key facts table, press@peerpulse.app, downloadable assets |
| `/relay` | Static | Relay operator docs — Docker setup block, config, community registry contact |
| `/protocol` | Static | Protocol reference — four sections (wire format, trust model, BLE ceremony, hardware attestation), whitepaper CTA |

---

## Design implementation

Port the mockup's CSS variables verbatim into `app/globals.css`:

```css
:root {
  --bg:       #050810;
  --surface:  #090d18;
  --card:     #0c1222;
  --border:   #1a2540;
  --border-hi:#2a3a5a;
  --text:     #e8edf5;
  --text-2:   #8899b4;
  --text-3:   #4a6080;
  --tab:      #eab308;   /* UDA — Ruto */
  --pol:      #60a5fa;   /* UKF — Gachagua */
  --ind:      #34d399;   /* WDM — Kalonzo */
  --gpp:      #a78bfa;   /* NRK — Karua */
  --green:    #22c55e;   /* Citizen (witnessed) trust tier */
  --sans:     var(--font-plex-sans);
  --mono:     var(--font-plex-mono);
  --pls:      #c084fc;   /* Journal pillar */
  --iq:       #4ade80;   /* Learn pillar */
}
```

**Trust tier colors** (4 tiers, updated from mockup):
- Gold `#e8b84b` — Official (1000)
- Blue `#4d9ef6` — Observer (500)
- Green `#22c55e` — Citizen witnessed (n×10)
- Grey `#5e6f85` — Unwitnessed (10)

---

## Key components

### Nav.tsx
- Fixed, full-width, dark bg with border
- Logo: SVG node graph mark + `PEER*PULSE*` wordmark
- Links: How it works · Elections · Journal · Organisations · Press · Protocol (all Next.js `<Link>`)
- CTA: "Download APK" → `/download`
- Active state: highlight current route

### ElectionsTable.tsx
- Renders from `elections-pipeline.json`
- Star button per row — toggles `localStorage` key `pp_starred`; starred rows float to top
- Status badges: 🎯 Primary (amber) / ⚡ High (blue) / 👁 Watch (grey) / 📋 Catalogue (dim)
- Accepts a `compact` prop for the landing page snippet (shows top 5 only)

### PulseCard.tsx
- Renders a single `JournalPacket` as a clickable card
- Workstream badge (Parliament/Budget/Executive/Courts/Electoral) with color per workstream
- Date, node attribution, 2-line summary, citation count, source domain
- `extraction_notes` → amber warning chip
- `has_poll` → indigo "📊 Poll" chip
- Links to `/journal/[jurisdiction]/[workstream]/[journalId]`

### PulseArticle.tsx
- Full article detail from a single `JournalPacket`
- Breadcrumb: Journal › Uganda › Parliament (links)
- Canonical URL display (monospace, dimmed): `peerpulse.app/journal/ug/legislature/[id]`
- AI-extracted warning banner (amber, shown when `human_reviewed: false`)
- Extraction notes banner (red, shown when `extraction_notes` present)
- Summary paragraph, key points list with `source_ref` citations, primary sources section with verbatim excerpts, Journal node card
- Poll card if `has_poll: true`
- "Subscribe in app" CTA → `/download`

### StationCard.tsx
- The live station card from the hero section (ELD-001, Eldoret, CONFIRMED, Ruto 82%)
- Static for MVP — data hardcoded
- Canvas animation for the hero: port the JS from the mockup to a `useEffect` client component

---

## Data files

### `data/elections-pipeline.json`
Structured version of `docs/product/elections-pipeline.md`. Schema:

```typescript
interface Election {
  id: string;           // ke-general-2027
  flag: string;         // 🇰🇪
  country: string;
  type: string;         // Presidential + Parliamentary + County
  date: string;         // 10 Aug 2027
  status: 'primary' | 'high' | 'watch' | 'cat';
  lead: string;         // 15 months
  notes: string;
  action: string;       // Seeding begins Oct 2026
}
```

Seed with all 10 elections from the mockup's `ELECTIONS` array.

### `data/uganda-parliament-may2026.json`
Already exists at `docs/product/journal/examples/uganda-parliament-may2026.json`. Copy to `apps/web/data/`. Do not modify.

### `lib/journal.ts`
```typescript
import packets from '@/data/uganda-parliament-may2026.json';

export type JournalPacket = typeof packets[number];

export function getPackets(workstream?: string): JournalPacket[] {
  if (!workstream || workstream === 'all') return packets;
  return packets.filter(p => p.workstream === workstream);
}

export function getPacket(id: string): JournalPacket | undefined {
  return packets.find(p => p.journal_id === id);
}

// Post-relay: this will call lib/relay.ts instead of reading static JSON
```

---

## SEO

Every route gets `generateMetadata()`:

```typescript
// app/journal/[jurisdiction]/[workstream]/[journalId]/page.tsx
export async function generateMetadata({ params }) {
  const packet = getPacket(params.journalId);
  return {
    title: `${packet.title} — PeerPulse Journal`,
    description: packet.summary.slice(0, 160),
    alternates: { canonical: `https://peerpulse.app/journal/${params.jurisdiction}/${params.workstream}/${params.journalId}` },
    openGraph: { title: packet.title, description: packet.summary.slice(0, 160) },
  };
}
```

Root layout metadata:
```typescript
export const metadata = {
  title: { default: 'PeerPulse — Decentralised Election Verification', template: '%s — PeerPulse' },
  description: 'Citizens independently verify elections with BLE presence attestation and cryptographic tallies. No central server. Android-only.',
  metadataBase: new URL('https://peerpulse.app'),
};
```

JSON-LD:
- `/` → `Organization` schema
- `/whitepaper` → `Article` schema
- `/journal/[jurisdiction]/[workstream]/[journalId]` → `Article` schema with `author` = Journal node label
- `/elections/[electionId]` → `Event` schema

`app/sitemap.ts` — static routes + all Journal article routes generated from static JSON.

`public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://peerpulse.app/sitemap.xml
```

---

## Performance targets

- LCP < 2.5s on a simulated 4G connection
- CLS = 0 — reserve space for all images and the canvas element
- INP < 200ms
- Hero canvas: `<canvas>` in a `'use client'` component; animation starts after paint via `requestAnimationFrame`, does not block LCP
- No layout shift from fonts: `next/font` with `display: swap` and CSS variables

---

## What is NOT in scope for this task

- Real relay integration (`lib/relay.ts` — deferred to Week 4 when relay is live)
- ISR revalidation (routes are fully static; ISR wiring comes when relay is live)
- `/elections/[electionId]` detail pages with live tally data (stub only)
- OG image generation (`/opengraph-image.tsx`) — add when relay data is available
- Whitepaper content — placeholder only
- Any auth or server actions

---

## Acceptance criteria

- [ ] `pnpm dev` starts `apps/web` at `localhost:3000` with no errors
- [ ] `/` renders the full landing page matching the mockup visually
- [ ] `/journal` lists all 6 Uganda articles; workstream filter tabs work
- [ ] `/journal/ug/legislature/ug-legislature-20260506-001` renders the Sovereignty Bill article in full with all key points, citations, and the linked survey card
- [ ] `/elections` renders the full pipeline table; starring persists across page reload via localStorage; starred rows float to top
- [ ] `/relay` and `/protocol` render their stub pages
- [ ] `curl https://localhost:3000/sitemap.xml` returns a valid sitemap including all Journal article routes
- [ ] `curl https://localhost:3000/robots.txt` returns correct robots.txt
- [ ] TypeScript `tsc --noEmit` passes with zero errors
- [ ] Trust tier colors: Gold `#e8b84b`, Blue `#4d9ef6`, Green `#22c55e` (witnessed), Grey `#5e6f85` (unwitnessed)
