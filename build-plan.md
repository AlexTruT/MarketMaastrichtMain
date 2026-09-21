# Merret: build plan for the 5 hours

Files in the repo root before you start: `context.md`, `supabase.sql`, this file.
In Cursor, add `context.md` as a project rule (Settings, Rules, or `.cursor/rules/context.mdc`) so every agent reads it.

## Roles

Three builders assumed. With two, merge A and C.

- **Lead (Ivan):** scaffold, shared files, deploy, merges. Then owns `/picker`.
- **A:** home page and product card.
- **B:** cart, checkout, confirmation.
- **C:** stalls, stall page, map. If the lead owns `/picker`, C also writes the pitch deck from hour 3:30.

One branch per person. Touch only your routes and `components/<your-area>/`. Need a change in a shared file? Ask the lead.

## Models in Cursor

- **Default for all agent work: Claude Sonnet 5.** Fast, strong, cheaper. Good enough for everything in this plan.
- **Claude Opus 5 for two things only:** the scaffold prompt (P0) and any bug that survives two fix attempts.
- Skip Claude Fable 5.1 on a shared Pro budget. It scores highest but it is slower and costs the most per token.
- Check usage at hour 2. If someone is close to the limit, switch them to Sonnet 5 or Cursor's own Composer for small edits.

## Tonight (15 minutes)

1. Create a GitHub repo, add everyone.
2. Create a Supabase project. Copy URL and service role key somewhere private.
3. Create a Vercel account linked to GitHub.
4. Confirm every builder has Cursor installed and logged in.
5. Check the hackathon rules on pre-written code. Plans and seed data are usually fine. If not, bring these files only as notes.

## Timeline

### 0:00 to 0:40, lead only: scaffold (Opus 5)

Others meanwhile: A and B read `context.md` fully and sketch their screens on paper. C starts the pitch outline.

Prompt P0:

> Read @context.md and @supabase.sql. Scaffold a Next.js 15 App Router project with TypeScript strict, Tailwind v4 and shadcn/ui (button, card, input, textarea, radio-group, tabs, badge, checkbox, sonner). Then create:
> 1. `lib/supabase.ts`: server-only Supabase client using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Add `import "server-only"`.
> 2. `lib/types.ts`: types for Stall, Product, Order, OrderItem matching supabase.sql exactly.
> 3. `lib/pricing.ts` with the functions listed in context.md. "today" is passed in, never read inside.
> 4. `lib/cart.tsx`: client cart context as described, persisted to localStorage with try/catch.
> 5. `lib/data.ts`: server functions `getProducts()`, `getStalls()`, `getStall(id)`, `getProductsByStall(id)`.
> 6. Fonts (Instrument Sans, Permanent Marker) via next/font and the color tokens from context.md as CSS variables and Tailwind theme values.
> 7. `app/layout.tsx` with the awning stripe header, "Merret" wordmark, nav, and the CartProvider.
> 8. `components/shared/PriceCard.tsx` implementing the yellow handwritten price card, with a deal variant.
> 9. `components/shared/ProductCard.tsx` using PriceCard, with add button and qty stepper wired to the cart.
> 10. Empty page files for every route in context.md with just a heading.
> Do not build page features yet. Keep each file small.

Then: run `supabase.sql` in the Supabase SQL editor, add env vars locally and on Vercel, push, deploy. **The empty site must be live on Vercel before 0:40.**

### 0:40 to 2:40: parallel build (Sonnet 5)

Build in slices. One prompt, check it on a phone-width browser, commit, next prompt.

**A: home page**

> Using @context.md, build `/` as described. Use ProductCard from components/shared. Server-render products with getProducts(). Category chips filter on the client. Deals strip first, then Coming soon strip, then the grid. Put new components in components/home/.

> Add the sticky bottom cart bar from context.md as components/shared/CartBar.tsx and render it on `/`. (Tell the lead, since it is shared.)

**B: cart and checkout**

> Using @context.md, build `/cart`: cart lines from the cart context, joined with product data from a server action or props. Qty stepper and remove. Range-aware subtotal using lib/pricing.ts. Put components in components/cart/.

> Add the checkout form on `/cart` as in context.md. Validate: phone always, address when home, pickup point when pickup. Server action `placeOrder` inserts the order and order_items with unit price snapshots (deal price when active), computes subtotals and fee, then clears the cart on the client and redirects to /order/[id].

> Build `/order/[id]` confirmation as in context.md.

**C: stalls and map**

> Using @context.md, build `/stalls` and `/stalls/[id]`. Reuse ProductCard. Stall page leads with the story, then facts (origin, km, years at the market), then products. Components in components/stalls/.

> Build `/map` as a static inline SVG with three labelled zones and a list of stalls per zone linking to their pages. Simple shapes, brand colors, no map library.

**Lead: picker**

> Using @context.md, build `/picker`. Route handler `app/api/picker/route.ts` returns orders with status new or picking plus their items and products. Client page polls it every 5 seconds. Tab 1 aggregates items by product, grouped by zone then stall, with a big checkbox that sets picked on all matching order_items. Tab 2 lists orders with status buttons. Server actions for both updates. 18px base font, full-width rows.

### 2:40 to 3:30: merge and phone check

- Lead merges one branch at a time, runs the app, fixes conflicts.
- Everyone opens the Vercel URL on their own phone and goes through the definition of done in context.md.
- Fix only what breaks the demo flow. Log the rest and ignore it.

### 3:30 to 4:20: polish, PWA, pitch

- Lead: add `app/manifest.ts` (name Merret, theme color awning green, icon). Test "Add to home screen".
- A and B: fix spacing, empty states, the 360px width check.
- C: pitch deck.

### 4:20 to 4:40: reset data and freeze

- Re-run `supabase.sql` so the picker shows the 8 demo orders and nothing from testing.
- **Code freeze.** No more commits after this unless the demo is broken.

### 4:40 to 5:00: rehearse

- Run the live demo three times with two phones.
- Record a 60 second screen capture of the full flow as backup.

## Demo script (90 seconds)

Two phones. Phone 1 is the customer, phone 2 shows `/picker`, mirrored to the screen if possible.

1. Phone 1, home: "Friday market, order before 10." Point at the pumpkin deal and the Hokkaido coming-soon card.
2. Tap Hof van Sjef: the story. "Every partner stall has one of these."
3. Add butternut pumpkin (deal), smoked mackerel, a vlaai slice, and onions (price range). "Onions are from the rest of the market. Our shopper picks the best stall that day."
4. Cart, pickup at Merret stand on the Markt, substitution "call me", place order.
5. Switch to phone 2: the order appears within 5 seconds. Shopping list now says "4 × Smoked mackerel" because it merged with other orders. "One walk through the market serves everyone."
6. Tick mackerel. Open Orders tab, mark an order ready.

## If something breaks on stage

- Site down or wifi dead: play the recording, keep talking.
- Order does not appear: pull to refresh, say "polling every five seconds" and keep going.
- Never debug in front of the jury.

## Cut list if you fall behind (cut in this order)

1. `/map`
2. Coming soon strip
3. Picker Orders tab (keep the shopping list)
4. Category chips
5. Stall list page (keep individual stall pages linked from product cards)
