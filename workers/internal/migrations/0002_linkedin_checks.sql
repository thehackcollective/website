CREATE TABLE linkedin_checks (
  person_id TEXT PRIMARY KEY REFERENCES people (id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('match', 'no_match', 'ambiguous', 'skipped')),
  profile_url TEXT,
  headline TEXT,
  company TEXT,
  role TEXT,
  location TEXT,
  connection_degree INTEGER CHECK (connection_degree IN (1, 2, 3)),
  evidence TEXT NOT NULL,
  checked_by TEXT NOT NULL,
  checked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX linkedin_checks_verdict ON linkedin_checks (verdict);
