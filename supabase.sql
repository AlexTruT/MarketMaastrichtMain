-- Merret: schema and seed data
-- Paste into Supabase SQL editor and run once.
-- All stall names, people and stories are illustrative placeholders.
-- All DB access goes through server code with the service role key, so RLS stays off for the hackathon.

drop table if exists order_items;
drop table if exists orders;
drop table if exists products;
drop table if exists stalls;

create table stalls (
  id text primary key,
  name text not null,
  owner text not null,
  category text not null,
  zone text not null check (zone in ('Stadhuis', 'Boschstraat', 'Mosae Forum')),
  origin text not null,
  km_from_market int,
  years_at_market int not null,
  story text not null,
  emoji text not null
);

create table products (
  id int primary key,
  stall_id text references stalls(id),          -- null = general market item, bought by our shopper
  name text not null,
  unit text not null,
  category text not null check (category in ('vegetables','fruit','fish','meat','cheese','bakery','pantry','flowers','more')),
  price_min_cents int not null,                 -- fixed-price items: min = max
  price_max_cents int not null,
  deal_price_cents int,                         -- overrides price when deal is active
  deal_note text,
  deal_starts_on date,                          -- null = active now, future date = "coming soon"
  emoji text not null,
  sort int not null default 0
);

create table orders (
  id serial primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone text not null,
  fulfilment text not null check (fulfilment in ('home','pickup')),
  address text,
  pickup_point text,
  time_window text not null,
  substitution text not null check (substitution in ('substitute','skip','call')),
  note text,
  subtotal_min_cents int not null default 0,
  subtotal_max_cents int not null default 0,
  markup_min_cents int not null default 0,       -- 15% online markup on subtotal_min
  markup_max_cents int not null default 0,       -- 15% online markup on subtotal_max
  fee_cents int not null,                        -- fulfilment only (home 450 / pickup 0)
  status text not null default 'new' check (status in ('new','picking','ready','out','delivered'))
);

create table order_items (
  id serial primary key,
  order_id int not null references orders(id) on delete cascade,
  product_id int not null references products(id),
  qty int not null check (qty > 0),
  unit_min_cents int not null,                  -- price snapshot at order time
  unit_max_cents int not null,
  actual_unit_cents int check (actual_unit_cents is null or actual_unit_cents >= 0),
  picked boolean not null default false,
  substitute_note text
);

-- Stalls -------------------------------------------------------------------

insert into stalls values
('sjef', 'Hof van Sjef', 'Sjef and Mia', 'vegetables', 'Stadhuis', 'Margraten', 12, 31,
 'Sjef took over the farm in Margraten from his father in 1995. Everything on the table was still in the ground on Wednesday.', '🥕'),
('kersenhoek', 'De Kersenhoek', 'Familie Claes', 'fruit', 'Stadhuis', 'Haspengouw, Belgium', 30, 18,
 'The Claes family grows apples, pears and plums just across the border in Haspengouw. They have not missed a Friday in eighteen years.', '🍎'),
('boschstraat', 'Vis op de Boschstraat', 'Ruud', 'fish', 'Boschstraat', 'IJmuiden fish auction', null, 22,
 'Ruud drives to IJmuiden on Thursday night and is back on the Boschstraat by six. His Belgian regulars queue before nine.', '🐟'),
('hanneke', 'Kaas van Hanneke', 'Hanneke', 'cheese', 'Stadhuis', 'Herve plateau and South Limburg', 40, 9,
 'Hanneke sells cheese from small dairies on the Herve plateau and in South Limburg. Ask about the Remoudou and she will let you taste it.', '🧀'),
('mestreech', 'Bakkerij Mestreech', 'Jo', 'bakery', 'Stadhuis', 'Wyck, Maastricht', 1, 14,
 'Jo bakes vlaai the Limburg way, with yeast dough and a lattice top. The cherry one sells out before noon.', '🥧'),
('heuvelland', 'Eierhoeve Heuvelland', 'Lotte', 'pantry', 'Mosae Forum', 'Gulpen', 16, 6,
 'Lotte keeps 400 hens on open pasture near Gulpen and bees along the Geul. Eggs are never more than two days old.', '🥚'),
('mosae', 'Bloemen bij Mosae', 'Anouk', 'flowers', 'Mosae Forum', 'Growers around Venlo', 70, 11,
 'Anouk buys from growers around Venlo and arranges every bouquet at the stall. Sunflowers until the first frost.', '💐'),
('olijf', 'Olijfolie van Pedro', 'Pedro', 'pantry', 'Stadhuis', 'Andalusia, Spain', null, 8,
 'Pedro presses olives on his family''s grove near Córdoba and drives a van north every Thursday. Ask him which harvest the bottle is from.', '🫒'),
('paddestoel', 'Paddenstoelen van Maarten', 'Maarten', 'vegetables', 'Stadhuis', 'Meerssen', 8, 5,
 'Maarten grows chestnut and oyster mushrooms in a cool shed behind the house in Meerssen. Picked the morning of market day.', '🍄'),
('moestuin', 'Moestuin Valkenburg', 'Iris', 'vegetables', 'Stadhuis', 'Valkenburg aan de Geul', 14, 7,
 'Iris runs a small kitchen garden above the Geul. Peppers, onions and courgettes come up the same morning she packs the crates.', '🫑'),
('kruiden', 'Kruiden van An', 'An', 'flowers', 'Mosae Forum', 'Beek', 10, 4,
 'An sells pot herbs and cut bunches from her greenhouse in Beek. Basil and parsley go first; ask if you need something less common.', '🌿'),
('speciaal', 'Limburgse Specialiteiten', 'Piet', 'pantry', 'Stadhuis', 'Nuth', 18, 15,
 'Piet bottles Limburgse stroop and apple juice from orchards around Nuth. The krentenmik comes from a baker two villages over.', '🍯'),
('geit', 'Geitenkaas van Marieke', 'Marieke', 'cheese', 'Stadhuis', 'Epen', 22, 6,
 'Marieke milks thirty goats on the plateau above Epen. Soft cheese on Friday, aged rounds when she has them.', '🐐'),
('slager', 'Slagerij van Bart', 'Bart', 'meat', 'Boschstraat', 'Hulsberg', 15, 19,
 'Bart comes from a butcher family in Hulsberg. Beef and pork from Limburg farms, chicken from open barns near Nuth. The verse worst sells out by eleven.', '🥩');

-- Products: partner stalls (fixed prices) -----------------------------------

insert into products (id, stall_id, name, unit, category, price_min_cents, price_max_cents, deal_price_cents, deal_note, deal_starts_on, emoji, sort) values
(1,  'sjef', 'Tomatoes', 'per kg', 'vegetables', 350, 350, null, null, null, '🍅', 1),
(2,  'sjef', 'Potatoes', '2.5 kg bag', 'vegetables', 325, 325, null, null, null, '🥔', 2),
(3,  'sjef', 'Carrots', 'per kg', 'vegetables', 180, 180, null, null, null, '🥕', 3),
(4,  'sjef', 'Leeks', '3 pieces', 'vegetables', 225, 225, null, null, null, '🥬', 4),
(5,  'sjef', 'Courgette', 'per piece', 'vegetables', 95, 95, null, null, null, '🥒', 5),
(6,  'sjef', 'Butternut pumpkin', 'per piece', 'vegetables', 250, 250, 150, 'Big harvest: 60 pumpkins this week', null, '🎃', 6),
(7,  'sjef', 'Hokkaido pumpkin', 'per piece', 'vegetables', 275, 275, 175, 'Peak harvest arriving', '2026-10-09', '🎃', 7),
(8,  'sjef', 'Spinach', '500 g', 'vegetables', 250, 250, null, null, null, '🥬', 8),

(9,  'kersenhoek', 'Elstar apples', 'per kg', 'fruit', 240, 240, null, null, null, '🍎', 1),
(10, 'kersenhoek', 'Conference pears', 'per kg', 'fruit', 220, 220, null, null, null, '🍐', 2),
(11, 'kersenhoek', 'Plums', 'per kg', 'fruit', 350, 350, 250, 'Last plums of the season', null, '🫐', 3),
(12, 'kersenhoek', 'Apple juice', '1 litre', 'fruit', 325, 325, null, null, null, '🧃', 4),

(13, 'boschstraat', 'Smoked mackerel', 'per piece', 'fish', 450, 450, null, null, null, '🐟', 1),
(14, 'boschstraat', 'Salmon fillet', '250 g', 'fish', 650, 650, null, null, null, '🐟', 2),
(15, 'boschstraat', 'Zeeland mussels', '1 kg', 'fish', 695, 695, null, null, null, '🦪', 3),
(16, 'boschstraat', 'Cod fillet', '250 g', 'fish', 595, 595, null, null, null, '🐟', 4),

(17, 'hanneke', 'Remoudou', '250 g', 'cheese', 550, 550, null, null, null, '🧀', 1),
(18, 'hanneke', 'Old Gouda', '500 g', 'cheese', 995, 995, null, null, null, '🧀', 2),
(19, 'hanneke', 'Young Gouda', '500 g', 'cheese', 695, 695, null, null, null, '🧀', 3),
(20, 'hanneke', 'Herve', '200 g', 'cheese', 475, 475, null, null, null, '🧀', 4),

(21, 'mestreech', 'Cherry vlaai', 'whole, 8 slices', 'bakery', 1450, 1450, null, null, null, '🥧', 1),
(22, 'mestreech', 'Vlaai slice', 'per slice', 'bakery', 325, 325, null, null, null, '🥧', 2),
(23, 'mestreech', 'Sourdough loaf', 'per loaf', 'bakery', 450, 450, null, null, null, '🍞', 3),
(24, 'mestreech', 'Krentenmik', 'per loaf', 'bakery', 425, 425, null, null, null, '🍞', 4),

(25, 'heuvelland', 'Free-range eggs', '10 eggs', 'pantry', 395, 395, null, null, null, '🥚', 1),
(26, 'heuvelland', 'Wildflower honey', '450 g jar', 'pantry', 750, 750, null, null, null, '🍯', 2),
(27, 'heuvelland', 'Limburgse stroop', '450 g jar', 'pantry', 395, 395, null, null, null, '🍯', 3),

(28, 'mosae', 'Sunflowers', 'bunch of 5', 'flowers', 500, 500, null, null, null, '🌻', 1),
(29, 'mosae', 'Seasonal bouquet', 'per bouquet', 'flowers', 1000, 1000, null, null, null, '💐', 2),

(38, 'olijf', 'Extra virgin olive oil', '500 ml bottle', 'pantry', 895, 895, null, null, null, '🫒', 1),
(39, 'olijf', 'Garlic', '3 bulbs', 'pantry', 125, 125, null, null, null, '🧄', 2),
(40, 'olijf', 'Fresh herbs', 'per bunch', 'pantry', 150, 150, null, null, null, '🌿', 3),

(41, 'paddestoel', 'Chestnut mushrooms', '400 g', 'vegetables', 375, 375, null, null, null, '🍄', 1),
(42, 'paddestoel', 'Oyster mushrooms', '250 g', 'vegetables', 325, 325, null, null, null, '🍄', 2),
(43, 'paddestoel', 'Spinach', '500 g', 'vegetables', 250, 250, null, null, null, '🥬', 3),

(44, 'moestuin', 'Bell peppers', '3 pieces', 'vegetables', 225, 225, null, null, null, '🫑', 1),
(45, 'moestuin', 'Onions', 'per kg', 'vegetables', 140, 140, null, null, null, '🧅', 2),
(46, 'moestuin', 'Courgette', 'per piece', 'vegetables', 95, 95, null, null, null, '🥒', 3),
(47, 'moestuin', 'Carrots', 'per kg', 'vegetables', 180, 180, null, null, null, '🥕', 4),

(48, 'kruiden', 'Fresh herbs', 'per pot', 'flowers', 275, 275, null, null, null, '🌿', 1),
(49, 'kruiden', 'Seasonal bouquet', 'per bouquet', 'flowers', 850, 850, null, null, null, '💐', 2),
(50, 'kruiden', 'Sunflowers', 'bunch of 5', 'flowers', 450, 450, null, null, null, '🌻', 3),

(51, 'speciaal', 'Limburgse stroop', '450 g jar', 'pantry', 395, 395, null, null, null, '🍯', 1),
(52, 'speciaal', 'Wildflower honey', '450 g jar', 'pantry', 750, 750, null, null, null, '🍯', 2),
(53, 'speciaal', 'Apple juice', '1 litre', 'pantry', 325, 325, null, null, null, '🧃', 3),
(54, 'speciaal', 'Krentenmik', 'per loaf', 'bakery', 425, 425, null, null, null, '🍞', 4),

(55, 'geit', 'Fresh goat cheese', '200 g', 'cheese', 475, 475, null, null, null, '🧀', 1),
(56, 'geit', 'Aged goat cheese', '200 g', 'cheese', 625, 625, null, null, null, '🧀', 2),
(57, 'geit', 'Young Gouda', '500 g', 'cheese', 695, 695, null, null, null, '🧀', 3),

(59, 'slager', 'Minced beef', '500 g', 'meat', 595, 595, null, null, null, '🥩', 1),
(60, 'slager', 'Chicken breast', '500 g', 'meat', 650, 650, null, null, null, '🍗', 2),
(61, 'slager', 'Pork chops', '2 pieces', 'meat', 495, 495, null, null, null, '🥩', 3),
(62, 'slager', 'Verse worst', '4 pieces', 'meat', 450, 450, null, null, null, '🌭', 4),
(63, 'slager', 'Entrecôte', 'per piece', 'meat', 995, 995, null, null, null, '🥩', 5),
(64, 'slager', 'Chicken thighs', '500 g', 'meat', 425, 425, null, null, null, '🍗', 6),

-- Coming soon (deal_starts_on in the future): pairs with Hokkaido for a 2-up strip
(58, 'kersenhoek', 'Quinces', 'per kg', 'fruit', 320, 320, 240, 'First crates from the orchard', '2026-10-16', '🍐', 5);

-- Products: rest of the market (price range, our shopper picks the best offer) --

insert into products (id, stall_id, name, unit, category, price_min_cents, price_max_cents, deal_price_cents, deal_note, deal_starts_on, emoji, sort) values
(30, null, 'Bananas', 'per kg', 'more', 150, 200, null, null, null, '🍌', 1),
(31, null, 'Onions', 'per kg', 'more', 100, 150, null, null, null, '🧅', 2),
(32, null, 'Garlic', '3 bulbs', 'more', 100, 150, null, null, null, '🧄', 3),
(33, null, 'Mushrooms', '500 g', 'more', 200, 300, null, null, null, '🍄', 4),
(34, null, 'Oranges', 'per kg', 'more', 150, 250, null, null, null, '🍊', 5),
(35, null, 'Grapes', 'per kg', 'more', 300, 400, null, null, null, '🍇', 6),
(36, null, 'Fresh herbs', 'per bunch', 'more', 100, 150, null, null, null, '🌿', 7),
(37, null, 'Bell peppers', '3 pieces', 'more', 150, 250, null, null, null, '🫑', 8);

-- Demo orders so the picker view is not empty --------------------------------

insert into orders (id, customer_name, phone, fulfilment, address, pickup_point, time_window, substitution, note, fee_cents) values
(1, 'Maria', '06 1234 5601', 'home', 'Scharnerweg 12', null, '12:00 to 13:00', 'call', 'Please ring twice, I need a moment to get to the door', 450),
(2, 'Daan', '06 1234 5602', 'pickup', null, 'Merret pickup point, Markt', '13:00 to 14:00', 'substitute', null, 0),
(3, 'Fatima', '06 1234 5603', 'home', 'Tongersestraat 44', null, '13:00 to 14:00', 'skip', null, 450),
(4, 'Jan', '06 1234 5604', 'home', 'Oranjeplein 8', null, '12:00 to 13:00', 'call', 'Leave with neighbour at number 10', 450),
(5, 'Sophie', '06 1234 5605', 'pickup', null, 'Merret pickup point, Markt', '14:00 to 15:00', 'substitute', null, 0),
(6, 'Tom', '06 1234 5606', 'pickup', null, 'Merret pickup point, Markt', '13:00 to 14:00', 'substitute', null, 0),
(7, 'Els', '06 1234 5607', 'home', 'Brusselsestraat 71', null, '14:00 to 15:00', 'call', null, 450),
(8, 'Yusuf', '06 1234 5608', 'pickup', null, 'Merret pickup point, Markt', '12:00 to 13:00', 'skip', null, 0);

insert into order_items (order_id, product_id, qty, unit_min_cents, unit_max_cents) values
(1, 1, 1, 350, 350), (1, 6, 1, 150, 150), (1, 25, 1, 395, 395), (1, 22, 2, 325, 325),
(2, 9, 1, 240, 240), (2, 13, 2, 450, 450), (2, 23, 1, 450, 450), (2, 30, 1, 150, 200),
(3, 15, 1, 695, 695), (3, 31, 1, 100, 150), (3, 32, 1, 100, 150), (3, 36, 2, 100, 150),
(4, 18, 1, 995, 995), (4, 21, 1, 1450, 1450), (4, 27, 1, 395, 395),
(5, 6, 2, 150, 150), (5, 3, 1, 180, 180), (5, 4, 1, 225, 225), (5, 19, 1, 695, 695),
(6, 13, 1, 450, 450), (6, 11, 1, 250, 250), (6, 25, 1, 395, 395),
(7, 17, 1, 550, 550), (7, 22, 4, 325, 325), (7, 28, 1, 500, 500),
(8, 14, 2, 650, 650), (8, 1, 1, 350, 350), (8, 33, 1, 200, 300);

update orders o set
  subtotal_min_cents = (select coalesce(sum(qty * unit_min_cents), 0) from order_items where order_id = o.id),
  subtotal_max_cents = (select coalesce(sum(qty * unit_max_cents), 0) from order_items where order_id = o.id);

update orders set
  markup_min_cents = round(subtotal_min_cents * 0.15)::int,
  markup_max_cents = round(subtotal_max_cents * 0.15)::int;

select setval('orders_id_seq', (select max(id) from orders));
