-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  location_lat REAL,
  location_lon REAL,
  radius_km INTEGER NOT NULL DEFAULT 40,
  occupations TEXT DEFAULT '',
  preferences TEXT DEFAULT '{}'
);

-- Jobs table (normalized from JobSearch API)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  external_id TEXT UNIQUE,
  headline TEXT NOT NULL,
  company TEXT NOT NULL,
  municipality TEXT NOT NULL,
  county TEXT NOT NULL,
  salary_type TEXT,
  employment_type TEXT,
  duration TEXT,
  working_hours_type TEXT,
  scope_of_work INTEGER DEFAULT 0,
  lat REAL,
  lon REAL,
  must_skills TEXT DEFAULT '',
  must_languages TEXT DEFAULT '',
  must_work_experiences TEXT DEFAULT '',
  must_education TEXT DEFAULT '',
  nice_skills TEXT DEFAULT '',
  nice_languages TEXT DEFAULT '',
  occupation TEXT,
  occupation_group TEXT,
  publication_date TEXT NOT NULL,
  last_publication_date TEXT,
  publication_url TEXT NOT NULL,
  employer_name TEXT,
  employer_org_number TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  removed INTEGER NOT NULL DEFAULT 0
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  match_reasons TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new',  -- 'new', 'saved', 'ignored'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_lat_lon ON jobs(lat, lon);
CREATE INDEX IF NOT EXISTS idx_jobs_occupation ON jobs(occupation);
CREATE INDEX IF NOT EXISTS idx_jobs_municipality ON jobs(municipality);
CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_job ON matches(job_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
