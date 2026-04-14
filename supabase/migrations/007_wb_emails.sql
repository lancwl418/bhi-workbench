-- Workbench: Email Inbox with AI Classification
-- Pulls emails from Gmail and classifies them automatically

CREATE TYPE wb_email_category AS ENUM (
  'return_request',
  'technical_support',
  'missing_item',
  'inspection_request',
  'others'
);

CREATE TABLE wb_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Gmail metadata
  gmail_id TEXT UNIQUE NOT NULL,
  thread_id TEXT,

  -- Email content
  subject TEXT NOT NULL DEFAULT '',
  from_name TEXT,
  from_email TEXT NOT NULL DEFAULT '',
  to_email TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL,

  -- AI classification
  category wb_email_category NOT NULL DEFAULT 'others',
  category_confidence REAL,
  category_reason TEXT,

  -- Tracking
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,

  -- Links to other entities
  case_id UUID REFERENCES wb_cases(id),
  return_id UUID REFERENCES wb_returns(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_emails_gmail_id ON wb_emails(gmail_id);
CREATE INDEX idx_wb_emails_category ON wb_emails(category);
CREATE INDEX idx_wb_emails_received ON wb_emails(received_at DESC);
CREATE INDEX idx_wb_emails_is_read ON wb_emails(is_read);

-- RLS
ALTER TABLE wb_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_wb_emails" ON wb_emails
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cs_write_wb_emails" ON wb_emails
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin', 'cs', 'manager']))
  WITH CHECK (wb_has_role(ARRAY['admin', 'cs', 'manager']));

-- Store Gmail OAuth tokens
CREATE TABLE wb_gmail_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wb_gmail_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_gmail_tokens" ON wb_gmail_tokens
  FOR ALL TO authenticated
  USING (wb_has_role(ARRAY['admin']))
  WITH CHECK (wb_has_role(ARRAY['admin']));
