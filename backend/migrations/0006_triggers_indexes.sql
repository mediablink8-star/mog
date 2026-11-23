-- 0006_triggers_indexes.sql
-- Keep updated_at current and optimise read paths.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_repairs_updated ON repairs;
CREATE TRIGGER trg_repairs_updated
  BEFORE UPDATE ON repairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_repairs_status_date ON repairs (status, date_received DESC);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_sales_customer ON sales (customer_id);
CREATE INDEX idx_sale_items_product ON sale_items (product_id);
