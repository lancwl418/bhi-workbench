-- Return photos: stores metadata for photos uploaded to Supabase Storage

CREATE TABLE wb_return_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES wb_returns(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL DEFAULT '',
  caption TEXT,
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_return_photos_return ON wb_return_photos(return_id);

-- RLS
ALTER TABLE wb_return_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_wb_return_photos" ON wb_return_photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cs_write_wb_return_photos" ON wb_return_photos
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

-- Storage bucket (run via Supabase dashboard or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('return-photos', 'return-photos', false);
