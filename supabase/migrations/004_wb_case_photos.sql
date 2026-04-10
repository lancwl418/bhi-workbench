-- Case photos: stores metadata for photos uploaded to Supabase Storage

CREATE TABLE wb_case_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES wb_cases(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL DEFAULT '',
  caption TEXT,
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_case_photos_case ON wb_case_photos(case_id);

-- RLS
ALTER TABLE wb_case_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_wb_case_photos" ON wb_case_photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cs_write_wb_case_photos" ON wb_case_photos
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));
