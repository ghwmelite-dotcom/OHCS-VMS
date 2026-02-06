export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  KV: KVNamespace;
  AI: Ai;
  LIVE_COUNTER: DurableObjectNamespace;
  ENVIRONMENT: string;
  OHCS_NAME: string;
  DEFAULT_TIMEZONE: string;
  BADGE_LETTERS: string;
  MAX_BADGE_PER_LETTER: string;
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_PHONE_ID: string;
  WHATSAPP_TOKEN: string;
}

export interface Office {
  id: number;
  abbreviation: string;
  full_name: string;
  office_type: 'directorate' | 'unit' | 'executive';
  floor: string | null;
  room: string | null;
  head_officer: string | null;
  head_officer_title: string | null;
  head_officer_email: string | null;
  phone_extension: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Visitor {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  id_type: string;
  id_number: string | null;
  photo_key: string | null;
  is_blocklisted: boolean;
  visit_count: number;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: number;
  visitor_id: string;
  office_id: number;
  purpose: string;
  host_officer: string;
  badge_number: string | null;
  check_in: string;
  check_out: string | null;
  status: 'checked-in' | 'checked-out' | 'pre-registered';
  ai_flag: string | null;
  ai_routed: boolean;
  ai_routing_confidence: number | null;
  sentiment: string | null;
  notes: string | null;
  checked_in_by: string | null;
}

export interface AnomalyLog {
  id: number;
  visitor_id: string | null;
  visit_id: number | null;
  severity: 'high' | 'medium' | 'low';
  anomaly_type: string;
  description: string;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  resolved: boolean;
  resolved_by: string | null;
  created_at: string;
}

export interface Feedback {
  id: number;
  visit_id: number;
  rating: number | null;
  comment: string | null;
  ai_sentiment: string | null;
  ai_sentiment_score: number | null;
  created_at: string;
}

export interface PreRegistration {
  id: number;
  visitor_name: string;
  visitor_phone: string | null;
  visitor_email: string | null;
  visitor_organization: string | null;
  office_id: number;
  purpose: string;
  host_officer: string;
  expected_date: string;
  expected_time: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'converted';
  confirmation_sent: boolean;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  checkedIn: number;
  preRegistered: number;
  checkedOut: number;
}

export interface AIRoutingResult {
  office_abbreviation: string;
  office_full_name: string;
  office_type: 'directorate' | 'unit' | 'executive';
  host: string;
  room: string;
  floor: string;
  confidence: number;
  reason: string;
}
