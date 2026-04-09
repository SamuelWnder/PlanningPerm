# DESIGN.md — PlanningPerm

> Drop this file into any AI prompt to generate UI that matches PlanningPerm's visual identity.

---

## 1. Visual Theme & Atmosphere

PlanningPerm is a **professional UK planning intelligence product** aimed at homeowners and property developers. The aesthetic combines:

- **Dark authority** — deep navy-black (`#0b1d28`) as the dominant surface colour on the marketing site, evoking trustworthiness and institutional weight
- **Warm gold** — burnished amber (`#D4922A`) as the primary action/CTA colour, conveying premium value
- **Teal accent** — clean teal (`rgb(55,176,170)` / `#37b0aa`) for success states, data highlights, and positive constraint results
- **Off-white warmth** — `#FAFAF8` and `#F5F0E8` instead of pure white, keeping surfaces warm and approachable
- **Editorial restraint** — generous whitespace, minimal decoration, no gradients except video overlays

The overall feel is closer to a premium fintech or legal product than a typical SaaS dashboard — serious, data-forward, but accessible to non-experts.

---

## 2. Colour Palette & Roles

| Token | Hex | Role |
|---|---|---|
| `--color-navy` | `#0b1d28` | Primary brand surface, page background (marketing), text headings |
| `--color-gold` | `#D4922A` | Primary CTA, buttons, brand accent, badge backgrounds |
| `--color-gold-dark` | `#b87820` | CTA hover state |
| `--color-teal` | `#37b0aa` / `rgb(55,176,170)` | Success/positive states, data highlights, links on dark surfaces |
| `--color-background` | `#FAFAF8` | App/dashboard page background |
| `--color-card` | `#FFFFFF` | Card surfaces |
| `--color-primary` | `#1A3A2A` | Component primary (dark green, used in focus rings and form elements) |
| `--color-primary-foreground` | `#F5F0E8` | Text on primary/dark surfaces |
| `--color-secondary` | `#F0EDE6` | Muted chip/badge backgrounds |
| `--color-foreground` | `#1A1F2E` | Body text on light surfaces |
| `--color-muted-foreground` | `#6B7280` | Placeholder text, secondary labels |
| `--color-slate` | `#2d3843` | Secondary text on marketing site (lighter than navy) |
| `--color-border` | `#E5E0D8` | All borders, dividers, input outlines |
| `--color-destructive` | `#DC2626` | Error states, "fail" constraint indicators |
| `--color-warn-bg` | `rgba(245,158,11,0.1)` | Warning chip background |
| `--color-warn-text` | `#b45309` | Warning chip text |
| `--color-fail-bg` | `rgba(220,38,38,0.08)` | Error/fail chip background |
| `--color-fail-text` | `#DC2626` | Error/fail chip text |
| `--color-ok-bg` | `rgba(55,176,170,0.1)` | Success chip background |
| `--color-ok-text` | `#37b0aa` | Success chip text |

---

## 3. Typography Rules

### Font Families

| Font | Usage | Import |
|---|---|---|
| **Clash Display** | All headings, brand name, display text | `https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&display=swap` |
| **Euclid Circular B** | Body copy, UI text, form inputs | `https://fonts.cdnfonts.com/css/euclid-circular-b` |
| System monospace | Code blocks only | `ui-monospace, "Cascadia Code", Menlo` |

### Type Scale

| Level | Font | Weight | Size | Tracking | Line Height | Usage |
|---|---|---|---|---|---|---|
| Hero H1 | Clash Display | 400 (normal) | `text-6xl` / `text-7xl` (96px) | `tracking-tight` | `leading-[1.0]` | Homepage hero |
| H2 Section | Clash Display | 400 | `text-5xl` / `text-6xl` | `tracking-tight` | `leading-[1.05]` | Major section headers |
| H3 Card | Clash Display | 400 | `text-xl` / `text-3xl` | `tracking-tight` | `leading-[1.3]` | Card headers, sub-sections |
| Eyebrow | Euclid Circular B | 600 | `text-[11px]` | `tracking-[0.15em]` | — | Section labels above headings — **always uppercase** |
| Body | Euclid Circular B | 400–500 | `text-sm` / `text-base` | default | `leading-relaxed` | Paragraphs, descriptions |
| UI Label | Euclid Circular B | 600 | `text-sm` | `tracking-[0.14em]` | — | Nav links, table headers — **uppercase** |
| Caption | Euclid Circular B | 400 | `text-xs` | default | — | Fine print, disclaimers |
| Brand Name | Clash Display | 400 | `text-xl` | `tracking-tight` | — | Always **lowercase** ("planningperm") |

### Typography Rules
- Headings are **font-normal (400)** in Clash Display — never bold
- Clash Display italic creates editorial emphasis (testimonials, pull quotes)
- Eyebrow labels are always `uppercase` + wide tracking + `font-semibold`
- Body text uses `#0b1d28` on light surfaces, `#F5F0E8` on dark surfaces
- Secondary body text uses `#2d3843` on light surfaces

---

## 4. Component Styles

### Buttons

**Primary CTA (Gold, filled)**
```
bg-[#D4922A] text-white rounded-full px-6–12 py-2.5–4 text-sm font-bold hover:bg-[#b87820] transition-colors
```

**Secondary (Navy outline)**
```
border-2 border-[#0b1d28] text-[#0b1d28] rounded-full px-8 py-3 text-sm font-semibold hover:bg-[#0b1d28] hover:text-white transition-colors
```

**Ghost / Link style**
```
text-[#D4922A] text-sm font-semibold hover:underline
```

### Inputs
```
flex h-10 w-full rounded-md border border-[#E5E0D8] bg-white px-3 py-2 text-sm
placeholder:text-[#9CA3AF]
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3A2A] focus-visible:ring-offset-0 focus-visible:border-[#1A3A2A]
disabled:cursor-not-allowed disabled:opacity-50
transition-colors
```
Large hero search input uses `rounded-2xl py-5 text-base font-bold`.

### Cards
```
bg-white rounded-2xl shadow-sm overflow-hidden
border border-[#E5E0D8]  ← for dashboard cards
```
- Padding: `p-6` standard, `p-8` for feature cards
- On dark backgrounds: `bg-white/[0.04] border border-white/10 rounded-2xl`

### Constraint Chips (Status Indicators)

**No issue (ok)**
```
bg-[rgba(55,176,170,0.1)] text-[#37b0aa] rounded-full px-3 py-1 text-xs font-semibold
```

**Warning**
```
bg-[rgba(245,158,11,0.1)] text-[#b45309] rounded-full px-3 py-1 text-xs font-semibold
```

**Fail / Significant constraint**
```
bg-[rgba(220,38,38,0.08)] text-[#DC2626] rounded-full px-3 py-1 text-xs font-semibold
```

**Severe (greenbelt, listed, etc.)**
```
bg-[#DC2626] text-white rounded-full px-3 py-1 text-xs font-bold
```

### Score Meter
Circular arc showing 0–100 approval likelihood score. Colour shifts:
- 70–100: `#37b0aa` (teal)
- 40–69: `#D4922A` (amber)
- 0–39: `#DC2626` (red)

### Navigation (Marketing site)
```
bg-[#0b1d28] text-white h-16 px-6–8
Logo: Clash Display font-normal text-xl text-white lowercase
Nav links: text-[11px] uppercase tracking-[0.14em] font-semibold text-white/80 hover:text-white
CTA button: bg-[#D4922A] text-white rounded-full px-5 py-2 text-sm font-semibold
```

### Navigation (Dashboard)
```
bg-white border-b border-[#e8f0f0] shadow-[0_1px_8px_rgba(0,0,0,0.06)] h-16 px-6
Logo icon: color #D4922A (gold)
Logo text: Clash Display font-normal text-[17px] text-[#0b1d28] lowercase
Nav items: text-sm font-medium text-[#2d3843] hover:text-[#0b1d28]
Active nav item: text-[#0b1d28] font-semibold border-b-2 border-[#D4922A]
```

### Tables (Comparison)
```
bg-white rounded-2xl shadow-sm overflow-hidden
th: px-6 py-5 text-sm font-semibold text-[#0b1d28]
Brand column th: text-[#D4922A] font-bold
Rows: border-t border-[#E5E0D8] px-6 py-4
Even rows: bg-[#FAFAF8]
```

### Risk Flags
```
High risk: border-l-4 border-[#DC2626] bg-red-50 rounded-r-xl p-4
Medium risk: border-l-4 border-[#D4922A] bg-amber-50 rounded-r-xl p-4
Low risk: border-l-4 border-[#37b0aa] bg-teal-50 rounded-r-xl p-4
```

---

## 5. Layout Principles

### Spacing Scale
Standard Tailwind spacing — key values in use:
- Section vertical padding: `py-20` / `py-24` / `py-32`
- Card padding: `p-6` / `p-8`
- Stack gap: `gap-4` / `gap-6` / `gap-8`
- Grid gap: `gap-6` / `gap-8` / `gap-12`

### Grid
- Marketing site: max-width container `max-w-6xl xl:max-w-7xl mx-auto px-6`
- Dashboard: sidebar-less full-width with `max-w-5xl mx-auto px-6`
- Feature grids: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Two-column layout: `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`

### Section Pattern (Marketing)
```
Background alternation:
- Dark section: bg-[#0b1d28] text-white
- Light section: bg-[#FAFAF8] or bg-white
- Eyebrow label → H2 → body → CTA = standard section structure
```

### Border Radius
```
--radius: 0.5rem (8px) — UI components (inputs, selects)
rounded-xl (12px) — cards, panels
rounded-2xl (16px) — large cards, modals, hero input
rounded-full — all buttons and pills/badges
```

---

## 6. Depth & Elevation

| Level | Usage | Shadow |
|---|---|---|
| Flat | Bordered cards, table rows | `border border-[#E5E0D8]` only |
| Low | Default cards | `shadow-sm` |
| Medium | Nav bar, floating panels | `shadow-[0_1px_8px_rgba(0,0,0,0.06)]` |
| High | Modals, dropdowns | `shadow-lg` |
| Dark surface overlay | Cards on `#0b1d28` | `bg-white/[0.04] border border-white/10` |

---

## 7. Do's and Don'ts

### Do
- Use **Clash Display at font-normal (400)** for headings — never bold
- Use **rounded-full** for all buttons and badges
- Use **uppercase + wide tracking** for eyebrow labels
- Keep body text at `#0b1d28` on light or `#F5F0E8` on dark
- Use gold `#D4922A` exclusively for CTAs and brand highlights — not decorative elements
- Use teal `#37b0aa` for positive/success states and data
- Write the brand name as **lowercase** "planningperm" in the UI

### Don't
- Don't use gradient fills (except as video overlays)
- Don't use font-bold (700) in Clash Display — it looks heavy
- Don't use pure black `#000000` or pure white `#ffffff` for surfaces
- Don't mix gold and teal in the same UI element — they serve distinct semantic roles
- Don't use border-radius on nav bars or page-level sections — only components
- Don't use drop shadows heavier than `shadow-md` on cards
- Don't use Clash Display for body copy or UI labels

---

## 8. Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| `sm` (640px) | Stack nav; hide secondary nav links |
| `md` (768px) | Show desktop nav; 2-col grids activate |
| `lg` (1024px) | Full layout; side-by-side hero sections |
| `xl` (1280px) | Max content width; hero text scales up |

- Hero H1 scales: `text-5xl md:text-6xl xl:text-7xl`
- Section padding increases at larger screens: `py-20 xl:py-32`
- Touch targets: minimum `h-10` (40px) for all interactive elements
- Mobile CTAs: `w-full` buttons, stacked cards

---

## 9. Agent Prompt Guide

### Quick colour reference
```
Navy (brand dark):  #0b1d28
Gold (CTA/accent):  #D4922A
Gold hover:         #b87820
Teal (success):     #37b0aa
Slate (secondary):  #2d3843
Background:         #FAFAF8
Border:             #E5E0D8
```

### Ready-to-use prompts

**"Build a new marketing section"**
> Use DESIGN.md. Dark navy background `#0b1d28`, eyebrow label in `text-[11px] uppercase tracking-[0.15em] font-semibold`, H2 in Clash Display font-normal, body in Euclid Circular B, gold CTA button `bg-[#D4922A] rounded-full`.

**"Build a dashboard card"**
> Use DESIGN.md. White card `bg-white rounded-2xl shadow-sm border border-[#E5E0D8] p-6`. Heading in Clash Display font-normal text-[#0b1d28], body in Euclid Circular B text-[#2d3843], status chips in rounded-full with teal/amber/red semantic colours.

**"Add a data/stats row"**
> Use DESIGN.md. Large number in Clash Display font-normal tracking-tight text-[#37b0aa], label below in Euclid Circular B font-semibold text-[#0b1d28] text-sm.

**"Build a constraint/status indicator"**
> Use DESIGN.md. Pill badge: rounded-full px-3 py-1 text-xs font-semibold. Green=ok `bg-[rgba(55,176,170,0.1)] text-[#37b0aa]`, amber=warn `bg-[rgba(245,158,11,0.1)] text-[#b45309]`, red=fail `bg-[rgba(220,38,38,0.08)] text-[#DC2626]`.
