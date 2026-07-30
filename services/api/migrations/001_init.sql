CREATE TABLE IF NOT EXISTS tool_submissions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT NOT NULL,
  data_level TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_by_afsc TEXT,
  submitted_by_rank TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
