# Merret (Market Maastricht)

> **Merret** (Maastricht dialect for *"Markt"*) brings the Friday Maastricht market online. Our personal shopper walks the market with an aggregated shopping list, buys everything fresh from partner and general stalls, and couriers deliver it or drop it at a pickup point.

## Demo

**Live:** [https://merret.vercel.app](https://merret.vercel.app)  
**Video (backup):** [https://streamable.com/elg9ed](https://streamable.com/elg9ed)

You pick products online; Merret’s shopper buys them at the Friday market and a courier delivers or holds for pickup. Phone or laptop — no login.

**Stack:** Next.js 15 · TypeScript · Tailwind · Supabase · Anthropic (handwritten price-board scan) · Vercel

Project write-up: [merret.vercel.app/why](https://merret.vercel.app/why)

---

## Essential documentation

- **[`context.md`](./context.md)** — Core specification: business rules, pricing, routes, AI price board scanner, design tokens.
- **[`build-plan.md`](./build-plan.md)** — Timeline, builder roles, demo script, fallback cut list.
- **[`supabase.sql`](./supabase.sql)** — Database schema & seed data (run once in the Supabase SQL editor).

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and (for `/picker/scan`) `ANTHROPIC_API_KEY`.
3. `npm run dev` → [http://localhost:3000](http://localhost:3000)

**Lead setup (once):** create a Supabase project, run `supabase.sql`, add the same env vars on Vercel, then deploy.

---

## Project justification

### Merret: making Maastricht’s markets accessible throughout the week

Project justification · September 2026 · All financial figures exclude VAT. Demand and budget figures are planning assumptions, not measured results.

### Why this project is needed

Maastricht’s Wednesday and Friday markets normally open from 09:00 to 15:00. These hours can make visiting difficult for people with work, study or family commitments. [1] Merret would let customers order from several market vendors online throughout the week and receive their purchases on a market day.

Customers gain one order and one delivery across several vendors. Vendors receive their full prices, pay no commission and do not need their own webshop. Merret manages ordering and customer communication, helping vendors reach customers who cannot visit.

### Customers and sales potential

The working target is 100 orders per market day, or 200 per week. For budgeting, the model uses 8.5 market days per month: 850 orders. Actual market days vary by month.

The proposed starting delivery area is within 3.5 km of Markt square. The following customer mix and preferences are assumptions to test.

| Customer group | Orders per market day | Likely purchases | Proposed delivery preference |
|---|---:|---|---|
| People working from home | 45 | Vegetables, cheese, berries and bread | 40% morning; 60% evening |
| Students and international residents, including UM/Zuyd communities | 30 | Speciality foods, snacks and cheese | Evening, before dinner |
| Families with children | 15 | Larger meat and fish baskets | Evening, before dinner |
| Local cafés and offices | 10 | Berries, milk and baked goods | Morning |
| **Total** | **100** | | **28 morning; 72 evening** |

The marketing target is 350–450 regular households, plus business customers. With 90 household orders per market day, those households would need to order about 1.7–2.2 times per month on average. Ordering every 1.5–2 weeks is a stronger repeat-purchase scenario to test, rather than an established customer habit.

For context, Maastricht recorded 70,726 households in 2023. [2] The suggested 8–10% share of the local target audience is unverified: the number of suitable customers within the proposed delivery area has not been measured. Repeat purchases at the full price will be the test of demand.

### How the service works

Customers choose a market day and delivery window, then place their order before a cutoff agreed with vendors. Merret sends each vendor a consolidated order list. Vendors prepare and label their goods for an agreed morning handover; Merret combines purchases from different stalls into complete customer orders at a small collection point near Markt.

Morning orders leave first. Evening orders remain appropriately stored, including refrigeration where needed, until their delivery window. Vendor preparation, collection space and storage must be agreed before launch. Customers approve substitutions and receive clear product, price and allergen information.

The plan uses three couriers earning €16 per hour, each completing four deliveries per paid hour on average. Delivering 100 orders requires 100 ÷ 4 = 25 courier hours, averaging 8 hours 20 minutes per courier across the day. This includes loading, travel, waiting, handovers and returns. Three six-hour courier shifts would cover only 72 orders at that rate, so the budget uses the full 25 hours. A separate coordinator is budgeted for four hours of collection and order assembly.

### Pricing and expected financial result

The minimum grocery order is €25. Merret adds 15% to the vendor’s price, plus €4.50 for delivery. Vendors retain the full grocery payment. Tips are optional and go entirely to couriers, following Flink’s stated approach. [3]

A minimum delivered order costs €25 + €3.75 + €4.50 = €33.25. The financial model assumes €35 including the 15% service fee, plus €4.50 delivery: €39.50 before any tip. The vendor share is €35 ÷ 1.15 ≈ €30.43, leaving approximately €4.57 for Merret. The 15% is applied to the vendor price, not to the fee-inclusive €35. Pickup customers pay the 15% service fee without delivery; the figures below assume all 100 orders are delivered.

At this volume, vendors receive approximately €3,043.48 per market day, or €25,869.57 per planning month. These grocery payments belong to vendors and are excluded from Merret’s revenue.

| Merret’s budget | Per market day | Per month: 8.5 days |
|---|---:|---:|
| 15% service fees | €456.52 | €3,880.43 |
| Delivery fees | €450.00 | €3,825.00 |
| **Total fee revenue** | **€906.52** | **€7,705.43** |
| Courier wages: 25 hours × €16 | €400.00 | €3,400.00 |
| Coordinator: 4 hours × €16 | €64.00 | €544.00 |
| Collection-point rent | €29.41 | €250.00 |
| Payment processing: €0.29 per order | €29.00 | €246.50 |
| Branded paper packaging: €0.25 per order | €25.00 | €212.50 |
| Three bikes: depreciation and charging | €28.00 | €238.00 |
| **Total modelled operating costs** | **€575.41** | **€4,891.00** |
| **Operating surplus** | **€331.11** | **€2,814.43** |

The coordinator, rent, processing, packaging and bike amounts are budget estimates supplied for the project. Totals use unrounded average basket shares and rent allocation. The surplus is 36.5% of fee revenue, before tax and any unbudgeted costs such as employer charges, marketing, software or additional staff time; it is not guaranteed take-home income.

With the full planned courier and coordinator hours paid, the model breaks even at approximately 62 orders per market day, allowing payment and packaging costs to vary with orders. The estimated €7,300 initial budget for three electric bikes and bags equals about 2.6 months of the modelled surplus at target volume. This is a simple investment-recovery comparison; actual cash payback depends on launch sales, other startup costs and the split between depreciation and cash expenses.

### Why the project is worth testing

Merret connects a specific access problem with a practical service: advance orders, coordinated vendor preparation and scheduled delivery. The pilot should test repeat purchases, the €35 average basket including the service fee, actual costs and additional vendor sales. These results will show whether the service can provide lasting value to customers and traders while earning a surplus.

### Sources

1. Gemeente Maastricht — Market days and opening hours
2. Gemeente Maastricht — Staat van Maastricht 2024, household figures for 2023
3. Flink — Dutch terms, section 8.4: voluntary tips for couriers
