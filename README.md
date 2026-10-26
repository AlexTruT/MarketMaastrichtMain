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

---

## Legal due diligence

Desk research · September 2026 · Not legal advice. Every point below comes from public sources (listed at the end). Before launch, confirm the market, VAT and employment points with the marktmeesters, the Belastingdienst or an accountant, and a lawyer. Several Dutch universities and incubators offer free or cheap legal help for student startups.

### Summary

- **Can Merret run as a startup? Yes.** No special licence is needed to deliver groceries by bike in Maastricht. The mandatory steps are routine: register with the KvK, register as a food business with the NVWA, register for VAT and set up payroll.
- **Carrying the bags is legal**, as long as Merret follows basic food-hygiene rules: keep chilled food cold, keep raw meat and fish separate from ready-to-eat food, and keep a simple record of what it does to stay safe.
- **Working for the vendor, not as a middleman, is the right model.** It is also the cleanest one legally. The vendor stays the seller, and Merret acts as the vendor's agent for sales and delivery. Two parts of the current app contradict this model and need a decision (see below).
- **A "Merret stand" on the Markt is very unlikely under the current rules.** A market stand must sell new goods from one product category (branch), and there is no category for services or pickup counters. The practical alternatives are pickup at a partner vendor's stall (ask the marktmeesters first) or the collection point near the Markt that is already in the budget.
- **The main risks are practical, not blocking:** couriers must be employees, payments must go through a licensed payment provider, prices must include the mandatory 15% fee, and customers must see allergen information before they buy.

### 1. A Merret stand on the Markt

The Friday market is governed by the *Marktreglement Vrijdagmarkt Maastricht* and the *Branchebesluit week- en dagmarkten*:

- A stand must be filled with **new goods from the branch named on its permit** (art. 21). Goods outside that permit may not be displayed (art. 23).
- A permit holder may trade in **one branch only**, and mixing branches is not allowed (Branchebesluit art. 2(3)). The Friday market's branches are textiles, food, flowers and plants, decoration and leisure, technical and household, and miscellaneous. **None of them covers services, promotion or order pickup.**
- **Fixed stands** come from a waiting list (€42.65 registration fee in 2026, via `marktmeesters@maastricht.nl`). A selection committee chooses the applicant who best improves the quality of the market, and every new stand has a **one-year trial period**. **Day permits** are given out by the marktmeester on the morning of the market, and only to traders with goods to sell.

A Merret counter that only hands out bags is therefore very unlikely to get a permit. Options, best first:

1. **Pickup at a partner vendor's stall.** A permit holder may have someone else staff the stall (art. 21), and customers collecting goods they already paid for from that vendor is ordinary trade. Handing out mixed bags from several vendors at one stall could count as displaying goods outside the permit. **Ask the marktmeesters before promising this to customers.** They may also welcome a project that brings the market new customers.
2. **An off-market collection point near the Markt**, such as a café, shop or small rented room. The budget already includes €250 per month for one. This is outside the market rules, but it needs the owner's permission, NVWA registration as an extra location, and refrigeration for evening orders.
3. **Merret trading under its own food permit.** This only fits if Merret becomes a reseller, which contradicts the vendor-side model, and it still means the waiting list and the trial year.

**App change (done):** the pickup option is now "Merret pickup point, Markt", an off-market collection point, instead of "Merret stand". Replace it with the real address once one is secured.

### 2. Vendor-side model: Merret as the vendor's agent

The model you described: **the vendor sells to the customer, and Merret takes orders, collects and delivers on the vendor's behalf.** Under Dutch law, Merret would be the vendor's agent (*agentuur* or *bemiddeling*) and delivery provider. The purchase contract is between the customer and the vendor.

What this model gives you:

- The **vendor stays the seller.** The vendor is responsible for the product itself (quality, conformity, labelling) and charges its own VAT on the food. Merret is responsible for its own part: handling, storage, transport and customer service.
- Vendors' grocery money never becomes Merret's revenue. The README budget already treats it this way.
- It fits the payment rules (section 4).

What must be true for the model to hold:

- **A short written agreement with each partner vendor.** It should say that Merret sells in the vendor's name at the vendor's prices, and cover the fee, the order cutoff, handover time, labelling, allergen information, how complaints and refunds are split, and who pays when goods are spoiled or missing.
- **The customer is told who the seller is.** EU rules for online marketplaces require telling consumers whether the seller is a trader and who is responsible for what. Show "Sold by Hof van Sjef, delivered by Merret" on the product and on the receipt.

**Two places where the current app contradicts this model:**

1. **General market items** (items with no stall, bought "at the best stall of the day") have no vendor behind them, so nobody has appointed Merret as agent. In practice Merret buys them and resells them. That makes Merret the seller: it is liable for those goods and owes VAT on the whole resale price, not just the fee. Either drop these items and sell only from partner stalls (cleanest), or accept that Merret is the seller for them and say so in the terms.
2. **The 15% service fee is charged to the customer.** That is how a customer's personal shopper gets paid, not a vendor's agent. It also creates the price-display problem in section 5. Consider charging vendors a **commission** instead and building it into their listed prices. That matches "we're on the vendor's side" and makes the displayed price the final price. The current pitch that vendors "pay no commission" would then need rewording.

### 3. Transporting food: registration, hygiene and allergens

- **NVWA registration is required** for anyone who stores, transports or sells food, including online. It is free and done in MijnNVWA (since March 2026) after KvK registration. Register **each location** separately, including the collection point, and confirm the registration every year.
- **Merret does not need an *erkenning*** (the stricter approval for meat and fish processors). The vendors hold those where required. Delivering to the final consumer only needs registration.
- **No transport licence is needed** for pedelec e-bikes or cargo bikes capped at 25 km/h. (Speed pedelecs need a driving licence and a number plate.)
- **Hygiene:** work from an approved **hygiëne­code** that fits the activity (the Voedingscentrum lists them) and keep a simple HACCP log. In practice:
  - Keep chilled products at or below the temperature on the label or the one the vendor gives (commonly ≤ 7 °C). Keep fish on ice. Use insulated bags with cooling elements, and check and log temperatures at handover and at delivery.
  - Keep raw meat and fish in separate, sealed bags, away from bread, cheese and fruit.
  - Evening orders need **refrigeration** at the collection point. The README already notes this, but it is a legal requirement, not only good practice.
  - Couriers must have basic hygiene instructions. Clean bags daily.
- **Allergens must be shown before purchase.** For food sold online, allergen information must be available **before the order is placed** and again at delivery (EU Regulation 1169/2011, art. 14). Pre-packed products also need the other mandatory label information. **Done in the app:** products have an `allergens` field (run [`supabase-allergens.sql`](./supabase-allergens.sql) once, after the other migrations). Allergens appear on product cards, on every cart line before checkout and on the order confirmation. A product whose stall hasn't confirmed its allergens shows "not confirmed yet" instead of "none". The seeded values are demo data; get the real ones from each stall at onboarding.

### 4. Payments

A platform that receives customers' money and passes it on to sellers is providing a payment service, which in principle needs a **DNB licence** (PSD2). There is an exemption for a "commercial agent" acting for only one side, and the vendor-side model points that way, but DNB applies it narrowly. **Do not rely on it.**

The app currently takes payment in cash or by card at handover, so this only matters once online payment is added. When it is, **use a licensed provider's marketplace product** (for example Mollie Connect or Stripe Connect). The provider takes the payment and splits it: the grocery amount goes to the vendor and Merret's fee to Merret. This is the standard route, and the €0.29 per order in the budget roughly matches these providers' fees. Each vendor goes through the provider's identity checks when they sign up.

**Ranged prices:** for general market items, authorise the upper end of the range and charge the actual amount after shopping, and say so at checkout.

### 5. Consumer law

- **Price display:** under the ACM's price-display guidance, costs a customer cannot avoid must be **included in the price shown**. The 15% fee applies to every order, but product cards show the vendor price and the fee only appears at checkout. **Fix:** either show prices including the 15% everywhere, or move to a vendor commission (section 2). The delivery fee may stay separate, because pickup avoids it, but show it before checkout.
- **Right of withdrawal:** perishable goods (fresh produce, meat, fish, dairy, bread, flowers) are **exempt** from the 14-day withdrawal right. Pantry and non-food items are **not**. Since **19 June 2026**, online shops must also offer a clearly labelled **withdrawal button** for goods where withdrawal applies. Either limit the range to perishables or add this flow. Say in the terms which products are exempt.
- **Required information on the site:** legal name, KvK number, VAT number, a physical address and an email address (Civil Code art. 3:15d). Add these to `/terms` and the footer.
- **Age-restricted goods** (alcohol, some vendors' tobacco): **do not list them** at launch. Selling them requires age checks at delivery, and for alcohol, licences.

### 6. Company, tax and founders

- **Legal form:** a *VOF* (partnership) is cheap to start, but the partners are personally liable. Merret will employ couriers and handle food, so it should move to a **BV** (private limited company) before hiring. Discuss the timing with an accountant.
- **VAT:** at target volume, Merret's own fee revenue is about €90k per year, well above the €20,000 small-business exemption (KOR). **Register for VAT from day one.**
  - Merret's fees are probably **21% VAT** as an agent's service. For goods Merret resells itself, the delivery fee follows the food rate (9%).
  - Consumer prices must include VAT, but the budget figures exclude it. A €4.50 delivery fee including 21% VAT leaves Merret **€3.72**. **Re-run the budget with VAT-inclusive consumer prices.**
- **Founders on a student residence permit:** the IND allows non-EU students on a study permit to be **self-employed**, provided they keep meeting the study-permit conditions (study progress, sufficient means). **Working as an employee** requires a work permit (*TWV*) from the employer and is limited to **16 hours per week** outside June to August. This also affects hiring international students as couriers. Confirm your own situation with the IND or your university's international office.
- **Name:** before printing branding, search "Merret" in the Benelux trademark register (BOIP). Avoid anything that suggests Merret is the official market or the municipality.

### 7. Couriers

- **Hire them as employees, not freelancers.** In 2023 the Supreme Court ruled that Deliveroo's riders were employees (ECLI:NL:HR:2023:443), and enforcement of false self-employment has increased since 2025. Merret's couriers work set shifts, in its uniform and on its bikes, which makes them employees.
- **Minimum wage** is €14.99 per hour for workers aged 21 and over (from 1 July 2026), and lower for 18–20-year-olds. The planned €16 per hour is fine.
  - **Employer costs** (social insurance, holiday pay, pension if a collective agreement applies, sick pay) add roughly **20–30%**, and the budget does not include them.
  - A payroll company or a student staffing agency can take over the administration at first.
- **Insurance:** general business liability (*AVB*), bike and theft cover, goods-in-transit cover, and product liability.
- **Courier location:** the courier app does **not** track couriers live. At each drop, proof of delivery records one photo and the phone's location at that moment. Both stay in the courier's browser and are deleted when the courier resets the shift (`components/courier/ProofOfDropSheet.tsx`, `lib/courier-store.tsx`). This is still personal data about employees under the GDPR, so tell couriers about it in writing in their contract. If live tracking is ever added, limit it to shifts and do a **DPIA** (a privacy risk assessment) first. `/privacy` describes proof of delivery.

### 8. Data and privacy (customers)

`/privacy` now names the hosting and AI providers and describes proof of delivery. Before launch:

- sign data-processing agreements with Supabase, Vercel, Anthropic and the payment provider;
- decide how long customer addresses and order data are kept;
- make sure price-board photos sent to the AI scanner contain no people's faces.

### Launch checklist

- [ ] Email the marktmeesters about pickup at a partner stall or the collection-point plan. Put the real pickup address in the app.
- [x] Rename "Merret stand, Markt" to an off-market pickup point.
- [ ] Register with the KvK (VOF, then BV before hiring) and get a VAT number.
- [ ] Register with the NVWA (each location). Choose a hygiene code and start a temperature log.
- [ ] Sign a written agency agreement with each partner vendor.
- [ ] Set up a licensed marketplace payment provider (Mollie or Stripe Connect).
- [ ] Show prices including the 15% fee (or switch to a vendor commission). Show "Sold by … / delivered by Merret".
- [x] Add allergen fields to products and show them before checkout (run `supabase-allergens.sql`).
- [ ] Collect real allergen lists from every partner stall.
- [ ] Decide what to do with general market items (drop them, or accept Merret as the reseller).
- [x] Explain the withdrawal exemption for perishables in `/terms`, and the 14-day return for products that keep.
- [ ] Add legal name, KvK, VAT number, address and email to `/terms` (placeholder section "Who we are") once registered. Add a withdrawal button for non-perishables, or limit the range to perishables.
- [x] Describe proof-of-delivery photo and location in `/privacy`.
- [ ] Hire couriers as employees (or through payroll). Take out insurance. Put proof of delivery in the courier contract.
- [ ] Run a trademark search for "Merret".

### Legal sources

1. [Marktreglement Vrijdagmarkt Maastricht](https://lokaleregelgeving.overheid.nl/CVDR607419): art. 1, 10, 11, 21, 23
2. [Branchebesluit week- en dagmarkten Maastricht](https://lokaleregelgeving.overheid.nl/CVDR607425): art. 2–3
3. [Beleidsregels sollicitatie standplaats weekmarkten Maastricht](https://lokaleregelgeving.overheid.nl/CVDR607500/1): selection committee, one-year trial
4. [Gemeente Maastricht: Marktstandplaats, eenmalige of vaste toewijzing](https://www.gemeentemaastricht.nl/ondernemen/marktstandplaats-eenmalige-vaste-toewijzing): 2026 fees, application process
5. [NVWA: Registreer uw levensmiddelenbedrijf](https://www.nvwa.nl/onderwerpen/voedselveiligheid/levensmiddelen-produceren-en-verhandelen/registratie-en-erkenning/registreer-uw-levensmiddelenbedrijf) and [MijnNVWA (March 2026)](https://www.nvwa.nl/actueel/nieuws/2026/03/10/levensmiddelenregistratie-voortaan-in-mijnnvwa)
6. [European Commission: Distance selling of food (Reg. 1169/2011 art. 14)](https://food.ec.europa.eu/food-safety/labelling-and-nutrition/food-information-consumers-legislation/distance-selling_en)
7. [DNB: E-commerce platforms and PSD2](https://www.dnb.nl/voor-de-sector/open-boek-toezicht/wet-regelgeving/psd2/elektronische-handelsplatformen-e-commerce-platforms-psd2/)
8. [ACM: Leidraad prijsweergave en -vergelijkingen](https://www.acm.nl/nl/publicaties/leidraad-prijsweergave-en-vergelijkingen) and [Prijzen vermelden](https://www.acm.nl/nl/verkoop-aan-consumenten/consumenten-informeren/prijzen-vermelden)
9. [Belastingdienst: Btw-tarief voedingsmiddelen](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/tarieven_en_vrijstellingen/goederen_9_btw/voedingsmiddelen/)
10. [Hoge Raad 24 March 2023, ECLI:NL:HR:2023:443 (Deliveroo)](https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AHR%3A2023%3A443)
11. [Rijksoverheid: Bedragen minimumloon 2026](https://www.rijksoverheid.nl/themas/werk/minimumloon/bedragen-minimumloon/bedragen-minimumloon-2026)
12. [IND: Student residence permit](https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education) and [Employing a foreign national](https://ind.nl/en/residence-permits/work/employing-a-foreign-national)
