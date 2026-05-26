BEGIN;

CREATE TEMP TABLE target_buyers AS
SELECT "id", "name", "email"
FROM "Buyer"
WHERE lower(coalesce("name", '')) IN (
  'buyer_8',
  'buyer_9',
  'b_10',
  'b_11',
  'leo mateoli',
  'agus',
  'feibu',
  'admin'
)
OR lower(split_part("email", '@', 1)) IN (
  'buyer_8',
  'buyer_9',
  'b_10',
  'b_11',
  'leo mateoli',
  'agus',
  'feibu',
  'admin'
)
OR lower("email") IN (
  'buyer_8@gmail.com',
  'buyer_9@gmail.com',
  'b_10@gmail.com',
  'b_11@gmail.com',
  'admin@gmail.com'
);

DELETE FROM "MockSellerOrderItem"
WHERE "orderId" IN (
  SELECT "id"
  FROM "MockSellerOrder"
  WHERE "buyerId" IN (SELECT "id" FROM target_buyers)
);

DELETE FROM "MockSellerOrder"
WHERE "buyerId" IN (SELECT "id" FROM target_buyers);

DELETE FROM "CartItem"
WHERE "cartId" IN (
  SELECT "id"
  FROM "Cart"
  WHERE "buyerId" IN (SELECT "id" FROM target_buyers)
);

DELETE FROM "Cart"
WHERE "buyerId" IN (SELECT "id" FROM target_buyers);

DELETE FROM "Address"
WHERE "buyerId" IN (SELECT "id" FROM target_buyers);

DELETE FROM "Buyer"
WHERE "id" IN (SELECT "id" FROM target_buyers);

COMMIT;