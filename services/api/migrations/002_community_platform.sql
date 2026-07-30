CREATE TABLE IF NOT EXISTS community_submissions (
  id UUID PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('tool', 'play', 'community')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  url TEXT,
  category TEXT,
  data_level TEXT NOT NULL DEFAULT 'tbd',
  author_email TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_afsc TEXT NOT NULL,
  author_rank TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderator_email TEXT,
  moderation_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS community_submissions_feed_idx
  ON community_submissions (kind, status, created_at DESC);

CREATE TABLE IF NOT EXISTS community_votes (
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  voter_email TEXT NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (submission_id, voter_email)
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_afsc TEXT NOT NULL,
  author_rank TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_comments_submission_idx
  ON community_comments (submission_id, created_at ASC);
