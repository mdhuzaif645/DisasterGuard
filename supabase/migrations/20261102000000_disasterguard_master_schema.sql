-- ============================================================================
-- DISASTERGUARD MASTER DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Complete 34 Normalized Tables, RLS Policies, Indexes, and Constraints
-- ============================================================================

-- Extension setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Enums
CREATE TYPE user_role_enum AS ENUM (
  'guest',
  'citizen',
  'emergency_responder',
  'shelter_manager',
  'disaster_authority',
  'system_administrator'
);

CREATE TYPE alert_severity_enum AS ENUM (
  'critical',
  'high',
  'moderate',
  'minor',
  'informational'
);

CREATE TYPE alert_status_enum AS ENUM (
  'draft',
  'pending_verification',
  'verified',
  'published',
  'updated',
  'expired',
  'cancelled'
);

CREATE TYPE sos_status_enum AS ENUM (
  'submitted',
  'acknowledged',
  'assigned',
  'responder_en_route',
  'in_progress',
  'resolved',
  'cancelled'
);

CREATE TYPE report_status_enum AS ENUM (
  'submitted',
  'under_review',
  'verified',
  'rejected',
  'resolved'
);

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  home_city TEXT DEFAULT 'Bengaluru',
  home_lat DOUBLE PRECISION DEFAULT 12.9716,
  home_lng DOUBLE PRECISION DEFAULT 77.5946,
  location_permission_granted BOOLEAN DEFAULT FALSE,
  notification_push_enabled BOOLEAN DEFAULT TRUE,
  notification_email_enabled BOOLEAN DEFAULT TRUE,
  notification_sms_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. USER_ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL DEFAULT 'citizen',
  assigned_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. EMERGENCY_CONTACTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  notify_on_sos BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. FAMILY_GROUPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code VARCHAR(12) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. FAMILY_MEMBERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. FAMILY_SAFETY_STATUS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_safety_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'safe', -- 'safe', 'needs_help', 'unknown'
  message TEXT,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  battery_level INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. SAVED_LOCATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- 'Home', 'Work', 'Parents'
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION DEFAULT 25.0,
  notify_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. DISASTER_ALERTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disaster_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'flood', 'cyclone', 'earthquake', 'wildfire', 'landslide', etc.
  severity alert_severity_enum NOT NULL DEFAULT 'moderate',
  status alert_status_enum NOT NULL DEFAULT 'draft',
  description TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  source_url TEXT,
  source_identifier TEXT,
  is_official BOOLEAN DEFAULT TRUE,
  is_simulated BOOLEAN DEFAULT FALSE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  recommended_actions TEXT[],
  evacuation_instructions TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. ALERT_GEOGRAPHIC_AREAS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_geographic_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID REFERENCES disaster_alerts(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_km DOUBLE PRECISION NOT NULL DEFAULT 50.0,
  boundary_geojson JSONB
);

-- ----------------------------------------------------------------------------
-- 10. ALERT_ACKNOWLEDGEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID REFERENCES disaster_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. ALERT_SUBSCRIPTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  min_severity alert_severity_enum DEFAULT 'moderate',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. DISASTER_REPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disaster_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  status report_status_enum DEFAULT 'submitted',
  admin_notes TEXT,
  moderated_by UUID REFERENCES profiles(id),
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. REPORT_ATTACHMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS report_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES disaster_reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. SHELTERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  operating_status TEXT DEFAULT 'open', -- 'open', 'full', 'temporarily_closed'
  total_capacity INT NOT NULL DEFAULT 200,
  current_occupancy INT NOT NULL DEFAULT 0,
  has_medical_support BOOLEAN DEFAULT TRUE,
  has_food_water BOOLEAN DEFAULT TRUE,
  allows_pets BOOLEAN DEFAULT FALSE,
  family_friendly BOOLEAN DEFAULT TRUE,
  is_accessible BOOLEAN DEFAULT TRUE,
  managed_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. SHELTER_OCCUPANCY_UPDATES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shelter_occupancy_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES profiles(id),
  previous_occupancy INT NOT NULL,
  new_occupancy INT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16. SHELTER_FACILITIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shelter_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,
  is_operational BOOLEAN DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 17. RELIEF_RESOURCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relief_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_id UUID REFERENCES shelters(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL, -- 'drinking_water', 'packaged_meals', 'first_aid_kits', 'blankets', 'power_generators'
  unit TEXT NOT NULL, -- 'liters', 'packets', 'kits', 'units'
  total_quantity INT NOT NULL,
  available_quantity INT NOT NULL,
  last_restocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 18. SOS_REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sos_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'trapped_person', 'medical_emergency', 'flood_rescue', 'fire_related', etc.
  priority TEXT NOT NULL DEFAULT 'critical', -- 'critical', 'high', 'medium', 'low'
  status sos_status_enum NOT NULL DEFAULT 'submitted',
  description TEXT NOT NULL,
  people_count INT DEFAULT 1,
  has_injuries BOOLEAN DEFAULT FALSE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address_approx TEXT,
  assigned_responder_id UUID REFERENCES profiles(id),
  incident_notes TEXT,
  cancelled_reason TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 19. SOS_ATTACHMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sos_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sos_id UUID REFERENCES sos_requests(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 20. EMERGENCY_ASSIGNMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sos_id UUID REFERENCES sos_requests(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- ----------------------------------------------------------------------------
-- 21. RESPONDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS responders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agency TEXT NOT NULL, -- 'NDRF', 'SDRF', 'Civil Defence', 'Fire & Rescue Services', 'Indian Red Cross'
  badge_number TEXT,
  specialization TEXT, -- 'Water Rescue', 'Medical Trauma', 'Fire Containment', 'Search & K9'
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 22. RESPONDER_AVAILABILITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS responder_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responder_id UUID REFERENCES responders(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'busy', 'off_duty'
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 23. INCIDENT_UPDATES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sos_id UUID REFERENCES sos_requests(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  status_change TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 24. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL, -- 'alert', 'sos_status', 'family_checkin', 'shelter_update'
  severity TEXT DEFAULT 'moderate',
  is_read BOOLEAN DEFAULT FALSE,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 25. NOTIFICATION_PREFERENCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  web_push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  critical_override BOOLEAN DEFAULT TRUE,
  min_alert_severity alert_severity_enum DEFAULT 'moderate'
);

-- ----------------------------------------------------------------------------
-- 26. NOTIFICATION_DELIVERY_LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'in_app', 'web_push', 'email', 'sms'
  status TEXT NOT NULL, -- 'delivered', 'pending', 'failed'
  provider_reference TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 27. PREPAREDNESS_GUIDES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preparedness_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  disaster_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  before_steps TEXT[] NOT NULL,
  during_steps TEXT[] NOT NULL,
  after_steps TEXT[] NOT NULL,
  dos TEXT[] NOT NULL,
  donts TEXT[] NOT NULL,
  official_source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 28. PREPAREDNESS_CHECKLISTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preparedness_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- 'emergency_kit', 'important_documents', 'first_aid', 'family_plan'
  item_name TEXT NOT NULL,
  recommended_quantity TEXT,
  is_essential BOOLEAN DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 29. PREPAREDNESS_PROGRESS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preparedness_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES preparedness_checklists(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 30. AI_CONVERSATION_SESSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Safety Consultation',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 31. AI_CONVERSATION_MESSAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES ai_conversation_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'model'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 32. DATA_SOURCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name TEXT NOT NULL, -- 'IMD (India Meteorological Department)', 'NDMA', 'CWC Flood Alert'
  api_endpoint TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'degraded', 'offline', 'simulated'
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  is_official BOOLEAN DEFAULT TRUE,
  attribution TEXT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 33. AUDIT_LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 34. APP_SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_safety_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public can view active published alerts
CREATE POLICY "Public can view published alerts" ON disaster_alerts
  FOR SELECT USING (status = 'published');

-- Citizens manage their own emergency contacts
CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Citizens can view and create their own SOS requests
CREATE POLICY "Users can view and create own SOS requests" ON sos_requests
  FOR ALL USING (auth.uid() = user_id);

-- Shelters are publicly readable
CREATE POLICY "Public can read shelters" ON shelters
  FOR SELECT USING (true);
