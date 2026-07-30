ALTER TABLE community_submissions
  ADD COLUMN IF NOT EXISTS authority_url TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS thread_locked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retired_at TIMESTAMPTZ;

ALTER TABLE learning_assets
  ADD COLUMN IF NOT EXISTS caption_url TEXT,
  ADD COLUMN IF NOT EXISTS authority_url TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE community_comments
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS removed_by_email TEXT;

CREATE TABLE IF NOT EXISTS access_reports (
  id UUID PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('tool', 'play', 'community', 'learning', 'source')),
  target_id TEXT NOT NULL,
  target_title TEXT NOT NULL,
  target_url TEXT,
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('broken-link', 'access-denied', 'outdated', 'data-label', 'accessibility', 'other')),
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolver_email TEXT,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS access_reports_status_created_idx
  ON access_reports (status, created_at DESC);

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS user_notifications_recipient_idx
  ON user_notifications (recipient_email, read_at, created_at DESC);
