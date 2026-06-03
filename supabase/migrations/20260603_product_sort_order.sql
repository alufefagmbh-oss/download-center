-- Reihenfolge-Spalte für Produktarten
ALTER TABLE product_types ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Initiale Reihenfolge nach Name vergeben
UPDATE product_types
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY manufacturer_id ORDER BY name) - 1 AS rn
  FROM product_types
) sub
WHERE product_types.id = sub.id;
