ALTER TABLE community_submissions
  DROP CONSTRAINT IF EXISTS community_submissions_status_check;

ALTER TABLE community_submissions
  ADD CONSTRAINT community_submissions_status_check
  CHECK (status IN ('draft', 'pending', 'changes_requested', 'approved', 'rejected', 'removed'));

ALTER TABLE community_submissions
  ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES community_submissions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_moderator_email TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS submission_revisions (
  id UUID PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  editor_email TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, version)
);

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  reporter_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolver_email TEXT,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE (submission_id, reporter_email)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  email TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  afsc TEXT NOT NULL,
  rank TEXT NOT NULL,
  suspended BOOLEAN NOT NULL DEFAULT false,
  suspension_reason TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_memberships (
  community_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, member_email)
);

CREATE TABLE IF NOT EXISTS feature_overrides (
  feature_id TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL,
  updated_by_email TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  actor_email TEXT,
  event_name TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_name_date_idx
  ON analytics_events (event_name, created_at DESC);

CREATE TABLE IF NOT EXISTS learning_progress (
  user_email TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_email, asset_id)
);
