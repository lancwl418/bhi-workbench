-- Error Code Management
-- Stores error code definitions, solutions, and links to products

CREATE TABLE wb_error_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT,
  possible_causes TEXT,
  solution TEXT,
  severity TEXT NOT NULL DEFAULT 'warning',
  doc_storage_path TEXT,
  doc_file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_error_codes_code ON wb_error_codes(code);
CREATE INDEX idx_wb_error_codes_severity ON wb_error_codes(severity);

CREATE TRIGGER wb_error_codes_updated_at
  BEFORE UPDATE ON wb_error_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Junction: error codes ↔ products
CREATE TABLE wb_error_code_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code_id UUID NOT NULL REFERENCES wb_error_codes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (error_code_id, product_id)
);

CREATE INDEX idx_wb_ecp_error_code ON wb_error_code_products(error_code_id);
CREATE INDEX idx_wb_ecp_product ON wb_error_code_products(product_id);

-- RLS
ALTER TABLE wb_error_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wb_error_code_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_wb_error_codes" ON wb_error_codes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_wb_error_code_products" ON wb_error_code_products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cs_write_wb_error_codes" ON wb_error_codes
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

CREATE POLICY "cs_write_wb_error_code_products" ON wb_error_code_products
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));
