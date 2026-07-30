CREATE TABLE IF NOT EXISTS learning_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  audience TEXT NOT NULL DEFAULT '',
  afsc_tags TEXT[] NOT NULL DEFAULT '{}',
  rank_tags TEXT[] NOT NULL DEFAULT '{}',
  playback_url TEXT NOT NULL,
  thumbnail_url TEXT,
  transcript TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  data_level TEXT NOT NULL DEFAULT 'public',
  created_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_assets_status_updated_idx
  ON learning_assets (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY,
  sender_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  CHECK (sender_email <> recipient_email)
);

CREATE INDEX IF NOT EXISTS direct_messages_sender_recipient_idx
  ON direct_messages (sender_email, recipient_email, created_at DESC);

CREATE INDEX IF NOT EXISTS direct_messages_recipient_unread_idx
  ON direct_messages (recipient_email, read_at, created_at DESC)
  WHERE removed_at IS NULL;
