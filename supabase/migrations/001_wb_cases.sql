-- Workbench: Customer Service Case Management
-- Shares Supabase instance with ERP (customers, orders, products, skus, warranties)

-- ─── Enums ───

CREATE TYPE wb_case_status AS ENUM (
  'new', 'in_progress', 'awaiting_customer', 'resolved', 'closed'
);

CREATE TYPE wb_case_source AS ENUM (
  'phone', 'email', 'platform', 'manual'
);

CREATE TYPE wb_case_category AS ENUM (
  'missing_item',
  'parts_request',
  'installation',
  'error_code',
  'product_malfunction',
  'return_request',
  'warranty_claim',
  'general_inquiry'
);

-- ─── Cases ───

CREATE TABLE wb_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  source wb_case_source NOT NULL DEFAULT 'phone',
  category wb_case_category NOT NULL DEFAULT 'general_inquiry',
  subject TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status wb_case_status NOT NULL DEFAULT 'new',
  assignee_id UUID REFERENCES user_profiles(id),

  -- Customer info (may or may not link to ERP customer)
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT,
  customer_phone TEXT,
  customer_id UUID REFERENCES customers(id),

  -- Product info
  model_number TEXT,
  error_code TEXT,

  -- Resolution
  solution TEXT,

  -- ERP links
  order_id UUID REFERENCES orders(id),
  warranty_id UUID REFERENCES warranties(id),

  -- Context from original log
  store TEXT,
  purchase_date DATE,
  po_number TEXT,
  raw_body TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_wb_cases_status ON wb_cases(status);
CREATE INDEX idx_wb_cases_brand ON wb_cases(brand);
CREATE INDEX idx_wb_cases_category ON wb_cases(category);
CREATE INDEX idx_wb_cases_assignee ON wb_cases(assignee_id);
CREATE INDEX idx_wb_cases_customer ON wb_cases(customer_id);
CREATE INDEX idx_wb_cases_model ON wb_cases(model_number);
CREATE INDEX idx_wb_cases_created ON wb_cases(created_at DESC);

-- Auto-generate case_number
CREATE SEQUENCE wb_case_seq START 1;

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_number := 'CS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('wb_case_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wb_cases_auto_number
  BEFORE INSERT ON wb_cases
  FOR EACH ROW
  WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
  EXECUTE FUNCTION generate_case_number();

-- Updated_at trigger
CREATE TRIGGER wb_cases_updated_at
  BEFORE UPDATE ON wb_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Case Parts (links to ERP products/skus) ───

CREATE TABLE wb_case_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES wb_cases(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  product_id UUID REFERENCES products(id),
  part_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  fulfilled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_case_parts_case ON wb_case_parts(case_id);

-- ─── Case Comments (activity log / timeline) ───

CREATE TABLE wb_case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES wb_cases(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id),
  author_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_case_comments_case ON wb_case_comments(case_id);

-- ─── Helper (bypasses RLS on user_profiles to avoid infinite recursion) ───

CREATE OR REPLACE FUNCTION wb_has_role(allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role::text = ANY(allowed_roles)
  );
$$;

-- ─── RLS ───

ALTER TABLE wb_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE wb_case_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wb_case_comments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "authenticated_read_wb_cases" ON wb_cases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_wb_case_parts" ON wb_case_parts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_wb_case_comments" ON wb_case_comments
  FOR SELECT TO authenticated USING (true);

-- CS, admin, manager can write
CREATE POLICY "cs_write_wb_cases" ON wb_cases
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

CREATE POLICY "cs_write_wb_case_parts" ON wb_case_parts
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

CREATE POLICY "cs_write_wb_case_comments" ON wb_case_comments
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));
