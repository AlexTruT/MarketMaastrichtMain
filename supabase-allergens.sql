-- Run once in Supabase SQL editor (additive; does not drop tables).
-- Allergen info per product (EU 1169/2011 art. 14: shown before purchase).
-- null = the stall has not confirmed yet; '{}' = confirmed, none of the 14.
alter table products add column if not exists allergens text[];
alter table products drop constraint if exists products_allergens_check;
alter table products add constraint products_allergens_check
  check (allergens <@ array['gluten','crustaceans','eggs','fish','peanuts','soy','milk','nuts','celery','mustard','sesame','sulphites','lupin','molluscs']::text[]);

-- Demo seed. Real values come from each stall at onboarding.
update products set allergens = '{}' where allergens is null;
update products set allergens = '{fish}' where id in (13, 14, 16);
update products set allergens = '{molluscs}' where id = 15;
update products set allergens = '{milk}' where id in (17, 18, 19, 20, 55, 56, 57);
update products set allergens = '{gluten,eggs,milk}' where id in (21, 22);
update products set allergens = '{gluten}' where id = 23;
update products set allergens = '{gluten,milk}' where id in (24, 54);
update products set allergens = '{eggs}' where id = 25;
-- Sausage seasoning varies by batch: left unconfirmed until the butcher says.
update products set allergens = null where id = 62;
