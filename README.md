# Merret (Market Maastricht)

> **Merret** (Maastricht dialect for *"Markt"*) brings the Friday Maastricht market online. Our personal shopper walks the market with an aggregated shopping list, buys everything fresh from partner and general stalls, and couriers deliver it or drop it at a pickup point.

Built as a mobile-first hackathon demo designed for phone screens (max content width 640px on desktop).

---

## 📖 Essential Documentation

Before starting, all team members should review these key documents:

- **[`context.md`](./context.md)** — **Core specification**: Business rules, pricing logic, tech stack constraints, route definitions, AI price board scanner, and design tokens. *(Cursor users: add this as a project rule)*.
- **[`build-plan.md`](./build-plan.md)** — **5-hour timeline & execution plan**: Builder roles (Lead/Ivan, A, B, C), Cursor prompts, demo script, and fallback cut list.
- **[`supabase.sql`](./supabase.sql)** — **Database schema & seed data**: Tables for stalls, products, orders, and order items. Run this once in the Supabase SQL editor.

---

## 👥 Builder Roles & Route Assignments

| Role | Builder | Routes / Areas | Responsibilities |
|---|---|---|---|
| **Lead** | Ivan | `/picker`, shared code, infra | Project scaffolding, Supabase client (`lib/supabase.ts`), types (`lib/types.ts`), pricing (`lib/pricing.ts`), cart context (`lib/cart.tsx`), Vercel deployment, PR merges, and the live picker screen. |
| **Builder A** | Team Member A | `/` | Home page, market cutoff line, deals strip, coming soon strip, category filters, and product grid. |
| **Builder B** | Team Member B | `/cart`, `/order/[id]` | Cart items & stepper, range-aware subtotal, checkout form (delivery vs. pickup, substitutions), order placement server action, and confirmation screen. |
| **Builder C** | Team Member C | `/stalls`, `/stalls/[id]`, `/map`, `/picker/scan` | Partner stall listings, stall story and products, static SVG market map, AI handwritten price board scanner, and hackathon pitch deck. |

> **Branching rule:** Each builder works on their own branch. Touch only your routes and `components/<your-area>/`. If you need adjustments in shared files, coordinate with the Lead.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, TypeScript in strict mode)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database:** [Supabase](https://supabase.com/) Postgres (server-only via `SUPABASE_SERVICE_ROLE_KEY`)
- **AI Integration:** Anthropic Messages API (`@anthropic-ai/sdk`, Claude Sonnet 5) for parsing handwritten Dutch market price boards
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📋 Core Business Rules

- **Market Schedule:** Every Friday, 09:00 – 15:00 on the Markt (Maastricht). The demo always targets the next upcoming Friday.
- **Order Cutoff:** Friday 10:00 (prominently displayed on the home page).
- **Delivery Windows:** `12:00 to 13:00`, `13:00 to 14:00`, `14:00 to 15:00`.
- **Fulfilment Options:**
  - **Home delivery:** Fee €5.95
  - **Pickup points:** Fee €1.95 (*Randwyck campus*, *Buurtcentrum Malberg*, *Merret stand, Markt*)
- **Substitutions:** Per order choice — `substitute` (shopper picks closest match), `skip` (leave it out), or `call` (call customer).
- **Pricing:**
  - Partner stalls: Fixed price (`price_min_cents = price_max_cents`).
  - General market items: Price range (`price_min_cents` to `price_max_cents`).
  - All currency stored as integer cents; formatted with `formatEuro()` at render time.

---

## 🎨 Design System

- **Colors:**
  - `Awning green` (`#1E5B3F`) — Primary: header awning stripe, buttons, active chips
  - `Price-card yellow` (`#F7E84B`) — Background behind prices only
  - `Maastricht red` (`#C8102E`) — Deals badge and accents
  - `Cobble grey` (`#E6E3DC`) — Borders and dividers
  - `Paper` (`#FFFFFF`) — Background
  - `Ink` (`#161616`) — Body text
- **Typography:**
  - UI & Body: **Instrument Sans** (via `next/font`)
  - Price tags: **Permanent Marker** (via `next/font`, rotated -2°)