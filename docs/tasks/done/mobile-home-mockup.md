# Task: Mobile Home Screen — Static Mockup

**Phase:** Design mockup (post-Week 1)
**Depends on:** existing `apps/mobile/` tab navigation
**Spec refs:** `product-overview.md`, `elections-pipeline.md`, design discussion (Home dashboard pattern, status strip, hero, Journal preview, See-it-work callout)

---

## Scope

**Mockup only.** No live data, no libp2p wiring, no relay calls, no BLE. Every value on screen is a hardcoded constant in the screen file. The goal is to ship a screen the team can show to civil society partners, journalists, and funders and say "this is what citizens will see when they open the app." Real data wiring is a separate task.

---

## What exists today

- `apps/mobile/src/navigation/RootNavigator.tsx` — 4 production tabs (Journal / Surveys / Elections / Learn) + 2 dev tabs (Debug / Playground), labels are text-only
- `apps/mobile/src/screens/journal/JournalScreen.tsx`, `elections/ElectionsScreen.tsx`, `surveys/SurveysScreen.tsx`, `learn/LearnScreen.tsx` — placeholder screens
- `apps/mobile/src/theme/colors.ts` — design tokens matching the website's dark palette

---

## What this task builds

A new **Home** tab as the default landing surface. The tab bar reorders to:

```
Home  |  Elections  |  Journal  |  ⚙ Debug (DEV)  |  ⚗ Test (DEV)
```

Surveys and Learn tabs are hidden until V2 / V4 — they don't have content yet and would be empty placeholders.

All tabs get icons (see "Icons" below). No more text-only tab labels.

### Home screen layout

Five vertically stacked sections, all static content:

```
┌─────────────────────────────────────┐
│ ● Connected · 1 relay · 0 BLE peers │  Status strip (1)
├─────────────────────────────────────┤
│                                     │
│   ⚡ KENYA GENERAL ELECTION          │  Hero (2)
│      Mon · 10 Aug 2027              │
│      15 months away                 │
│      [ Star to follow ]             │
│                                     │
├─────────────────────────────────────┤
│ TODAY IN GOVERNMENT          (47)   │  Journal preview (3)
│                                     │
│ ● KENYA · LEGISLATURE               │
│   Health Care Reform Bill, 2nd rdng │
│   Hansard p.412 · 2h ago            │
│                                     │
│ ● KENYA · EXECUTIVE                 │
│   Cabinet reshuffle, 6 ministries   │
│   Gazette 4521/2026 · yesterday     │
│                                     │
│ ● UGANDA · BUDGET                   │
│   2026/27 FY estimates published    │
│   Treasury · 2 days ago             │
│                                     │
│   View all in Journal →             │
├─────────────────────────────────────┤
│ 📡 SEE IT WORK                      │  Test-run callout (4)
│                                     │
│ Get two or three friends to install │
│ the app. Stand in the same room.    │
│ Watch the protocol verify your      │
│ presence and sign a test count —    │
│ exactly what happens on election    │
│ day, minus the real vote.           │
│                                     │
│ 3 friends? 30? It scales the same.  │
│                                     │
│   [ Start a test run → ]            │
├─────────────────────────────────────┤
│ MORE ELECTIONS COMING               │  Elections list (5)
│                                     │
│ 🇿🇲 ZAMBIA · 13 Aug 2026 · 3 months  │
│ 🇳🇬 NIGERIA · 20 Feb 2027 · 9 mos    │
│ 🇨🇩 DRC · 16 Dec 2028 · 31 months    │
│                                     │
│   Browse all elections →            │
└─────────────────────────────────────┘
```

### Section behaviour

| # | Section | Mockup behaviour |
|---|---|---|
| 1 | Status strip | Static text `● Connected · 1 relay · 0 BLE peers`. Green dot. No live data. |
| 2 | Hero | Hardcoded "Kenya General Election" with countdown calculated client-side from `new Date('2027-08-10')`. `Star to follow` is a button with `onPress = () => {}`. No persistence. |
| 3 | Journal preview | Hardcoded array of 3 items in the screen file. `View all in Journal →` navigates to the Journal tab using existing tab navigator. |
| 4 | Test run callout | Hardcoded copy. Button navigates to the Test tab (Playground screen — separate mockup task). |
| 5 | Elections list | Hardcoded array of 3 elections (Zambia / Nigeria / DRC). Tap does nothing in mockup. `Browse all` navigates to Elections tab. |

---

## Tabs and icons

Install `@expo/vector-icons` (ships with Expo, no native linking needed):

Tabs and icons (Ionicons set):

| Tab | Active icon | Inactive icon | Label |
|---|---|---|---|
| Home | `home` | `home-outline` | Home |
| Elections | `checkbox` | `checkbox-outline` | Elections |
| Journal | `newspaper` | `newspaper-outline` | Journal |
| Debug *(DEV)* | `bug` | `bug-outline` | — *(icon only)* |
| Test *(DEV)* | `flask` | `flask-outline` | — *(icon only)* |

Active tint stays `#eab308` (the project yellow), inactive `#364f6e`. Use `tabBarIcon: ({focused, color, size}) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />`.

Hide Surveys and Learn tabs until those pillars ship — comment them out in `RootNavigator.tsx` with a TODO referencing the V2 / V4 build phase.

---

## File structure

```
apps/mobile/
  package.json              ← add @expo/vector-icons (~14.0.0 for Expo SDK 55)
  src/
    navigation/
      RootNavigator.tsx     ← rewrite — Home first, icons added, Surveys/Learn hidden
    screens/
      home/
        HomeScreen.tsx      ← NEW — the screen described above
        components/
          StatusStrip.tsx
          ElectionHero.tsx
          JournalPreview.tsx
          TestRunCallout.tsx
          UpcomingElections.tsx
        data.ts             ← all hardcoded mockup constants
```

Splitting components is for clarity and so a future task can swap any one component for a live version without touching the others. `data.ts` is the *one place* mockup values live — when wiring up real data later, deleting `data.ts` should make the type errors point at every call site that needs to be fixed.

---

## Acceptance criteria

- [ ] Tab bar shows Home / Elections / Journal with icons (active = filled, inactive = outline)
- [ ] Home is the default tab on app launch
- [ ] Debug + Test tabs are visible only in `__DEV__` builds, with icons (no text labels)
- [ ] Surveys + Learn tabs are commented out in `RootNavigator.tsx` with a `// TODO: V2` / `// TODO: V4` marker
- [ ] Home screen renders all five sections on a 375×667 viewport (smallest iPhone-class size — Android Pixel 4a is similar) without horizontal scroll
- [ ] Home screen scrolls vertically when content overflows
- [ ] Tapping "Start a test run →" navigates to the Test tab
- [ ] Tapping "View all in Journal →" navigates to the Journal tab
- [ ] Tapping "Browse all elections →" navigates to the Elections tab
- [ ] `pnpm typecheck` passes
- [ ] App does not crash on launch
- [ ] All values on screen come from `data.ts` (one file to find and gut when wiring to real data)

---

## Out of scope (do NOT do in this task)

- libp2p, GossipSub, or relay HTTP calls — the status strip is static
- BLE — the "0 BLE peers" string is hardcoded
- Real countdown logic against multiple elections / jurisdictions — just the Kenya 2027 one
- Persistence of "starred" state
- Real Journal pipeline / data ingestion
- Empty states for jurisdiction-aware variations
- Real navigation to a per-election detail page
- Animations on status changes
- i18n / translations

Each of those is its own follow-up task. This one ships the visual surface.
