-- Run once in Supabase SQL editor (additive; does not drop tables).
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check
  check (category in ('vegetables','fruit','fish','meat','cheese','bakery','pantry','flowers','more'));

insert into stalls values
('slager', 'Slagerij van Bart', 'Bart', 'meat', 'Boschstraat', 'Hulsberg', 15, 19,
 'Bart comes from a butcher family in Hulsberg. Beef and pork from Limburg farms, chicken from open barns near Nuth. The verse worst sells out by eleven.', '🥩')
on conflict (id) do nothing;

insert into products (id, stall_id, name, unit, category, price_min_cents, price_max_cents, deal_price_cents, deal_note, deal_starts_on, emoji, sort) values
(59, 'slager', 'Minced beef', '500 g', 'meat', 595, 595, null, null, null, '🥩', 1),
(60, 'slager', 'Chicken breast', '500 g', 'meat', 650, 650, null, null, null, '🍗', 2),
(61, 'slager', 'Pork chops', '2 pieces', 'meat', 495, 495, null, null, null, '🥩', 3),
(62, 'slager', 'Verse worst', '4 pieces', 'meat', 450, 450, null, null, null, '🌭', 4),
(63, 'slager', 'Entrecôte', 'per piece', 'meat', 995, 995, null, null, null, '🥩', 5),
(64, 'slager', 'Chicken thighs', '500 g', 'meat', 425, 425, null, null, null, '🍗', 6)
on conflict (id) do nothing;
