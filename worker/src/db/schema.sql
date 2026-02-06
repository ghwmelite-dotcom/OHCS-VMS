-- OHCS Visitor Management System — Database Schema
-- Cloudflare D1 (SQLite)

-- Offices table (Directorates, Units, Executive)
CREATE TABLE IF NOT EXISTS offices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  abbreviation TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  office_type TEXT NOT NULL CHECK(office_type IN ('directorate', 'unit', 'executive')),
  floor TEXT,
  room TEXT,
  head_officer TEXT,
  head_officer_title TEXT,
  head_officer_email TEXT,
  phone_extension TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  organization TEXT,
  id_type TEXT DEFAULT 'Ghana Card',
  id_number TEXT,
  photo_key TEXT,
  is_blocklisted BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL REFERENCES visitors(id),
  office_id INTEGER NOT NULL REFERENCES offices(id),
  purpose TEXT NOT NULL,
  host_officer TEXT NOT NULL,
  badge_number TEXT,
  check_in DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out DATETIME,
  status TEXT DEFAULT 'checked-in',
  ai_flag TEXT,
  ai_routed BOOLEAN DEFAULT FALSE,
  ai_routing_confidence REAL,
  sentiment TEXT,
  notes TEXT,
  checked_in_by TEXT
);

-- AI Anomaly Logs
CREATE TABLE IF NOT EXISTS anomaly_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  visit_id INTEGER,
  severity TEXT NOT NULL,
  anomaly_type TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_confidence REAL,
  ai_reasoning TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER NOT NULL REFERENCES visits(id),
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  ai_sentiment TEXT,
  ai_sentiment_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pre-registrations
CREATE TABLE IF NOT EXISTS pre_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  visitor_email TEXT,
  visitor_organization TEXT,
  office_id INTEGER NOT NULL REFERENCES offices(id),
  purpose TEXT NOT NULL,
  host_officer TEXT NOT NULL,
  expected_date DATE NOT NULL,
  expected_time TIME,
  status TEXT DEFAULT 'pending',
  confirmation_sent BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily Analytics (aggregated nightly)
CREATE TABLE IF NOT EXISTS daily_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  peak_hour INTEGER,
  peak_hour_count INTEGER,
  avg_visit_duration_mins REAL,
  sentiment_positive INTEGER DEFAULT 0,
  sentiment_neutral INTEGER DEFAULT 0,
  sentiment_negative INTEGER DEFAULT 0,
  anomalies_detected INTEGER DEFAULT 0,
  top_office_id INTEGER REFERENCES offices(id),
  ai_predicted_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Office-level daily analytics
CREATE TABLE IF NOT EXISTS office_daily_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  office_id INTEGER NOT NULL REFERENCES offices(id),
  visitor_count INTEGER DEFAULT 0,
  avg_visit_duration_mins REAL,
  peak_hour INTEGER,
  UNIQUE(date, office_id)
);

-- Badge Pool
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  assigned_to INTEGER,
  assigned_at DATETIME,
  is_available BOOLEAN DEFAULT TRUE
);
