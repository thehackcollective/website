CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  headline TEXT,
  avatar_url TEXT,
  summary TEXT,
  circle TEXT NOT NULL CHECK (circle IN ('core', 'partner', 'builder', 'member', 'subscriber')),
  intent INTEGER NOT NULL DEFAULT 0 CHECK (intent BETWEEN 0 AND 100),
  identity TEXT NOT NULL CHECK (identity IN ('confirmed', 'likely')),
  luma_attended INTEGER,
  luma_hosted INTEGER,
  subscribed_at TEXT,
  whatsapp_member INTEGER NOT NULL DEFAULT 0,
  builder_groups INTEGER NOT NULL DEFAULT 0,
  chat_messages INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX people_circle_intent ON people (circle, intent DESC);

CREATE TABLE person_links (
  person_id TEXT NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('luma', 'linkedin', 'x', 'github', 'instagram', 'website', 'email')),
  value TEXT NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (person_id, kind, value)
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  thc_role TEXT NOT NULL CHECK (thc_role IN ('host', 'co-host', 'community partner')),
  went INTEGER
);

CREATE TABLE ties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id TEXT NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (
    kind IN (
      'core team',
      'co-host',
      'organiser',
      'winner',
      'helper',
      'partner contact',
      'event submitter',
      'group admin',
      'chat voice',
      'builder circuit',
      'personal'
    )
  ),
  detail TEXT NOT NULL,
  event_id TEXT REFERENCES events (id),
  source TEXT NOT NULL CHECK (source IN ('luma', 'whatsapp', 'x', 'cv', 'contacts')),
  source_url TEXT,
  observed_at TEXT
);

CREATE INDEX ties_person ON ties (person_id);
