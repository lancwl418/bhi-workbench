-- Workbench: Return Processing
-- Tracks actual physical returns received, condition, and outcome

CREATE TYPE wb_return_reason AS ENUM (
  'product_defect',
  'installation_error',
  'shipping_damage',
  'wrong_item',
  'customer_changed_mind',
  'missing_parts',
  'other'
);

CREATE TYPE wb_return_status AS ENUM (
  'initiated',
  'label_issued',
  'in_transit',
  'received',
  'inspected',
  'completed'
);

CREATE TYPE wb_return_outcome AS ENUM (
  'refund',
  'replacement',
  'repair',
  'rejected'
);

CREATE TYPE wb_item_condition AS ENUM (
  'new_sealed',
  'like_new',
  'minor_damage',
  'major_damage',
  'defective',
  'incomplete'
);

CREATE TABLE wb_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number TEXT UNIQUE NOT NULL,

  -- Customer info
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT,
  customer_phone TEXT,
  customer_id UUID REFERENCES customers(id),

  -- What was returned
  brand TEXT NOT NULL DEFAULT '',
  model_number TEXT,
  sku_code TEXT,
  product_name TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Why
  reason wb_return_reason NOT NULL DEFAULT 'other',
  reason_detail TEXT,

  -- Logistics
  status wb_return_status NOT NULL DEFAULT 'initiated',
  tracking_number TEXT,
  carrier TEXT,
  return_label_url TEXT,

  -- Received inspection
  received_date DATE,
  condition wb_item_condition,
  condition_notes TEXT,

  -- Outcome
  outcome wb_return_outcome,
  outcome_notes TEXT,

  -- ERP links
  order_id UUID REFERENCES orders(id),
  case_id UUID REFERENCES wb_cases(id),
  po_number TEXT,
  channel TEXT,

  -- Financial link (to ERP returns table for reconciliation)
  erp_return_id UUID,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Auto-generate return_number
CREATE SEQUENCE wb_return_seq START 1;

CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.return_number := 'RT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('wb_return_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wb_returns_auto_number
  BEFORE INSERT ON wb_returns
  FOR EACH ROW
  WHEN (NEW.return_number IS NULL OR NEW.return_number = '')
  EXECUTE FUNCTION generate_return_number();

CREATE TRIGGER wb_returns_updated_at
  BEFORE UPDATE ON wb_returns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_wb_returns_status ON wb_returns(status);
CREATE INDEX idx_wb_returns_reason ON wb_returns(reason);
CREATE INDEX idx_wb_returns_order ON wb_returns(order_id);
CREATE INDEX idx_wb_returns_case ON wb_returns(case_id);
CREATE INDEX idx_wb_returns_created ON wb_returns(created_at DESC);
CREATE INDEX idx_wb_returns_received ON wb_returns(received_date);

-- ─── Return Items (if a return has multiple items) ───

CREATE TABLE wb_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES wb_returns(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  model_number TEXT,
  sku_code TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  condition wb_item_condition,
  condition_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_return_items_return ON wb_return_items(return_id);

-- ─── Return Comments ───

CREATE TABLE wb_return_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES wb_returns(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id),
  author_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_return_comments_return ON wb_return_comments(return_id);

-- ─── RLS ───

ALTER TABLE wb_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE wb_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wb_return_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_wb_returns" ON wb_returns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_wb_return_items" ON wb_return_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_wb_return_comments" ON wb_return_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cs_write_wb_returns" ON wb_returns
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

CREATE POLICY "cs_write_wb_return_items" ON wb_return_items
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

CREATE POLICY "cs_write_wb_return_comments" ON wb_return_comments
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));
