# Merret: context for Cursor

Read this file before every task. If a request conflicts with this file, ask before deviating.

## What we are building

Merret (Maastrichts dialect for "Markt") lets people order from the Maastricht Friday market online. Our own shopper walks the market with the combined list, buys everything, and student couriers deliver it or drop it at a pickup point.

Vendors do nothing technical. We are a personal shopper and courier, not a marketplace.

This is a hackathon demo built in 5 hours. It must work end to end on a phone and look finished. It does not need to scale.

## Users

- **Customer:** busy residents, students, people who cannot easily reach the market (older people, people with limited mobility). Uses a phone.
- **Picker:** our shopper at the market on Friday morning. Uses a phone, one hand, outdoors. Needs big tap targets and high contrast.

## Business rules

- Market: every Friday, 09:00 to 15:00, on the Markt. The demo always targets the next upcoming Friday.
- Order cutoff: Friday 10:00. Show the cutoff on the home page.
- Delivery windows: "12:00 to 13:00", "13:00 to 14:00", "14:00 to 15:00".
- Fulfilment:
  - Home delivery: fee €4.50
  - Pickup: free (€0). Only at "Merret pickup point, Markt": a collection point by the Markt, not a market stall.
- Substitution choice per order: "substitute" (shopper picks closest match), "skip" (leave it out), "call" (phone me).
- Pricing:
  - Partner stall items have a fixed price: `price_min_cents = price_max_cents`.
  - General market items (stall_id null) have a range. Show "€1.50 to €2.00". Label them "Picked by our shopper at the best stall of the day".
  - Cart and checkout show the subtotal as a range when any item is ranged: "€23.40 to €25.10". Otherwise a single number.
  - Online / service markup: always 15% of the grocery subtotal (`Math.round(subtotal * 0.15)`), for both home and pickup. Shown separately from delivery. Stored as `markup_min_cents` / `markup_max_cents`.
  - Customer total = grocery subtotal + 15% markup + fulfilment fee (`fee_cents` is delivery only).
  - Stall catalogue prices stay as stall prices; markup is a separate line, not baked into unit snapshots.
- Deals:
  - `deal_price_cents` not null and (`deal_starts_on` null or today or earlier) = active deal. Use deal price, show old price struck through, show `deal_note`.
  - `deal_starts_on` in the future = "Coming soon". Show in its own strip with the date. Not addable to cart.

## Stack

- Next.js 15, App Router, TypeScript, strict mode
- Tailwind v4 and shadcn/ui. Use shadcn components before writing custom ones.
- Supabase Postgres. Schema and seed data in `supabase.sql`.
- Deploy on Vercel.

### Rules

- All database access happens on the server: server components, server actions, or route handlers. Use `lib/supabase.ts` with `SUPABASE_SERVICE_ROLE_KEY`. Never import it in a client component.
- Money is always integer cents. Format only at render time with `formatEuro()` from `lib/pricing.ts`. Output like `€3.50` (en-NL style: euro sign, dot decimal is fine for the demo).
- Cart lives in a client React context in `lib/cart.tsx`, persisted to localStorage, wrapped in try/catch.
- No auth, no payments, no admin panel.
- Keep components small. One component per file in `components/<area>/`.
- Do not refactor files outside the task you were given.
- Do not add new npm packages without saying why.

## Shared files (owned by the lead, others do not edit)

- `lib/supabase.ts` server client
- `lib/types.ts` types matching `supabase.sql`
- `lib/pricing.ts`: `formatEuro(cents)`, `isDealActive(product, today)`, `isComingSoon(product, today)`, `unitRange(product, today) -> {min, max}`, `formatRange(min, max)`, `feeFor(fulfilment)`, `markupCents(subtotal)`, `orderTotals(...)`
- `lib/cart.tsx` cart context: `items`, `add(productId, qty)`, `remove`, `setQty`, `clear`, `count`
- `app/layout.tsx`, `app/globals.css`, fonts, design tokens

## Routes

| Route | Owner | What it does |
|---|---|---|
| `/` | A | Next market date and cutoff line. Deals strip. Coming soon strip. Category chips (vegetables, fruit, fish, meat, cheese, bakery, pantry, flowers, more). Product grid, 2 columns on mobile. Each card: product photo tile, name, unit, stall name, price card, add button with qty stepper. |
| `/stalls` | C | Partner stalls list: search, zone filter, market-scene thumb, zone tag, item count. Links to `/stalls/[id]`. |
| `/stalls/[id]` | C | Seller profile for a partner stall: full-bleed market-scene hero, owner-led header, story, facts, then that stall's products using the same product card as `/`. Read-only; no vendor editing. |
| `/cart` | B | Cart lines with qty stepper, subtotal (range aware). Checkout form on the same page: fulfilment toggle, address or pickup point, time window, substitution choice, name, phone, note. Fee and total. Submit button "Place order". Server action writes `orders` and `order_items` with price snapshots, clears cart, redirects. |
| `/order/[id]` | B | Confirmation: "Order placed", number, window, where, items, total range, "Our shopper buys your order Friday morning". Link to `/profile` with the checkout phone prefilled. |
| `/profile` | B | Buyer profile: enter phone, confirm a four-digit OTP, then look up recent orders (server-side via `lib/data.ts`). Demo cannot send SMS — show the code on the page. Session cookie after verify. |
| `/why` | — | Public project justification (need, customers, how it works, pricing model, sources). No auth, no cart bar. |
| `/courier` | — | Demo courier picker: Alex, Emma, Lucas. Mock shift data in the browser. |
| `/courier/[id]` | — | Courier tool: hub crates, route map, shift earnings. Profile (name, avatar initials, vehicle, preferred cluster) in the top bar and Shift tab. |
| `/picker` | C | Phone view for the shopper. Tab 1 "Shopping list": all items from orders with status new or picking, aggregated by product, grouped by zone then stall, e.g. "3 × Smoked mackerel". Big checkbox per line. Tab 2 "Orders": one card per order with window, fulfilment, substitution, note, and status buttons (picking, ready, out, delivered). Poll every 5 seconds via a route handler so a new order appears live. |

Sticky bottom bar on `/`, `/stalls/*`: item count, subtotal, "View cart". Hidden when cart is empty.

## AI feature: price board scan (core, not optional)

Problem it solves: vendors will not maintain prices online. So on Friday morning our shopper photographs each stall's handwritten price board, and Claude turns it into prices in the database. Vendors still do nothing.

Route `/picker/scan` (owner C):
1. Pick a stall from a dropdown.
2. Take or upload a photo (`<input type="file" accept="image/*" capture="environment">`).
3. Server action sends the image as base64 to the Anthropic Messages API with `@anthropic-ai/sdk`, model `claude-sonnet-5`, key in `ANTHROPIC_API_KEY` (server only).
4. System prompt: read a handwritten Dutch market price board, return JSON only, no prose, shape `{"items":[{"name_on_board":string,"price_cents":int,"unit":string,"confidence":"high"|"low"}]}`. Prices like "2,50" or "3 voor 5" must be normalised to cents per unit written on the board.
5. Match each item to that stall's products by name (simple case-insensitive contains match, plus the model's output). Show a review table: product, old price, new price, confidence. Low confidence rows highlighted. Unmatched rows shown as "new item, not added".
6. Button "Update prices" writes the approved rows to `products.price_min_cents` and `price_max_cents`. The shopper always approves; nothing is written automatically.

Strip \`\`\`json fences before parsing. Wrap the call in try/catch and show "Could not read this photo. Try again closer to the board." on failure.

Keep 3 test photos of handwritten price boards in `public/demo/` so the demo does not depend on the camera.

## Design

Grounded in the Friday market itself: striped market awnings and hand-written fluorescent price cards.

**Colors**
- Paper `#FFFFFF` background
- Ink `#161616` text
- Awning green `#1E5B3F` primary: header, buttons, active chips
- Price-card yellow `#F7E84B` only behind prices
- Maastricht red `#C8102E` only for deals
- Cobble grey `#E6E3DC` borders and dividers

**Type**
- UI and body: Instrument Sans (Google Fonts via next/font)
- Prices only: Permanent Marker (Google Fonts via next/font)

**The one bold element:** every price is a small yellow price card, handwritten font, rotated -2deg, like the cardboard signs on the stalls. Deal prices get the same card with the old price struck through in small plain text above it. Everything else stays quiet.

**Product photography:** every product has a real studio-style photo (plain paper-white background, soft shadow, shot from slightly above), not an emoji and not a flat illustration. One file per product at `public/produce/<key>.jpg`, `<key>` from `produceKey(name)` in `components/shared/Produce.tsx`. This is the one place the design intentionally allows a soft photographic shadow; everything else on the page stays flat.

**Stall photography:** partner stalls use place-like market scenes (stalls, produce on the Markt, Stadhuis atmosphere) from `assets/` via `lib/stall-scenes.ts` — never the studio produce cutouts. List thumbs are rounded rectangles; detail pages use a full-bleed scene hero.

**Layout**
- Mobile first, designed at 390px, max content width 640px on desktop.
- Left aligned. Generous spacing. Tap targets at least 44px.
- Header: "Merret" wordmark and nav (Market, Stalls, Profile, Why).
- Product photos sit on a plain paper tile with a hairline `cobble` ring, not floating and not tinted.
- Border radius: 6px on cards and inputs. Price cards 2px.
- No gradients, no drop shadows on UI chrome, except the product photos themselves and a single subtle one on the sticky cart bar.
- No page-load animations. Motion only on user actions (add-to-cart bump, cart bar enter, press feedback). Prefer transform/opacity, 150–250ms ease-out. Honour `prefers-reduced-motion`.

**Picker view** uses larger type (18px base), full-width rows, checkbox on the left, checked rows greyed and struck through.

## Copy

- English. Keep local product names as they are: vlaai, Limburgse stroop, Remoudou, krentenmik.
- Sentence case everywhere. No all-caps labels.
- Buttons say what happens: "Add", "View cart", "Place order", "Mark ready".
- Empty cart: "Your bag is empty. The market is open Friday from 9."
- Errors say what went wrong and what to do: "Add a phone number so our shopper can reach you."
- No marketing phrases. Plain descriptions.

## Out of scope. Do not build.

Login, accounts, passwords, payment, maps, vendor dashboard, admin, dark mode, i18n, emails, SMS, analytics, tests.

**Allowed demo exception:** `/profile` uses a four-digit phone OTP (code shown on-page, hashed in an httpOnly cookie). No SMS provider. After verify, a session cookie unlocks orders for that number. Not a full account system.

## Definition of done

- Deployed on Vercel.
- On a phone: add items including a deal and a ranged item, check out with pickup, see confirmation.
- The new order appears in `/picker` within 5 seconds and aggregates with existing orders.
- A demo photo in `/picker/scan` produces a review table, and approved prices show up on `/` after refresh.
- No console errors. No layout overflow at 360px wide.
