# DisasterGuard — Full-Stack Disaster Preparedness & Emergency Response Platform

DisasterGuard is an enterprise-grade full-stack disaster preparedness, emergency alert, evacuation coordination, and public safety platform. It integrates official meteorological alerts (IMD, NDMA, CWC), interactive OpenStreetMap GIS hazard overlays, automated SOS triage and dispatch, relief shelter bed capacity tracking, community crowd-sourced hazard feeds, family safety check-in circles, and an AI safety advisor powered by Google Gemini.

---

## Key Features

1. **Active Disaster Alerts & Early Warnings**
   - Official hazard feeds for Floods, Cyclones, Earthquakes, Landslides, Tsunamis, Severe Storms, and Extreme Heat.
   - Severity-based ranking (Critical Red, High Orange, Moderate Yellow).
   - Clear distinction between official verified bulletins and scheduled drill simulations.
   - AI "Explain Alert Simply" button powered by Google Gemini Flash to translate complex meteorological data into plain English, Kannada, or Hindi.

2. **Interactive Natural Disaster Map (Leaflet & OpenStreetMap)**
   - High-performance vector tile rendering with hazard danger zones (radial overlays).
   - Multi-layer filters: Active Warnings, Open Shelters, Blocked Roads, and Citizen Reports.
   - Accessible List-Based Alternative View for users with screen readers or limited mobility.

3. **SOS Emergency Dispatch Workflow**
   - 8 Emergency categories (Trapped Person, Medical Emergency, Flood Rescue, Fire Outbreak, Missing Person, Essential Food/Water, Shelter Need).
   - Automated priority classification engine prioritizing life-threatening and trapped conditions as CRITICAL.
   - GPS coordinate fixed capture with manual location fallback.
   - Built-in duplicate submission detection within 5-minute windows.
   - Prominent 112 National Emergency Helpline advisory on all emergency screens.

4. **Responder Command Portal**
   - Profile & Agency Badges (NDRF 10th Battalion, SDRF, Fire Services).
   - Duty availability toggle (Available, On Rescue Mission, Off Duty).
   - Actionable lifecycle status pipeline: `Acknowledged` -> `Responder En Route` -> `On Scene / In Progress` -> `Resolved`.
   - Real-time operational mission log and notes trail.

5. **Relief Shelters & Resource Tracking**
   - Shelter directory with Haversine great-circle distance sorting from user location.
   - Live bed capacity vs. occupancy progress bars.
   - Amenity indicators: Medical trauma unit, Clean drinking water & meals, Family suites, Pet accommodation, Wheelchair accessibility.
   - Shelter Manager Mode for updating occupant counts and notes in real time.
   - Critical relief resources inventory tracking (Water bottles, MRE rations, first aid kits, thermal blankets).

6. **Citizen Ground Hazard Reporting**
   - Crowdsourced reporting for flooded streets, uprooted trees, damaged retaining walls, and snapped power cables.
   - Crowd upvotes / confirmations.
   - Official municipal moderation workflow (Submitted -> Under Review -> Verified / Rejected).

7. **Preparedness & Safety Education Center**
   - 9 comprehensive disaster survival protocols (Before, During, After, and Do's & Don'ts).
   - Interactive 72-Hour Household Survival Go-Bag checklist with persistent completion tracking.
   - Community Safety Assessment Quiz with instant answers and explanations.

8. **Family Safety & Check-in Circle**
   - Private family group with invite codes.
   - One-tap "Mark Myself Safe" broadcast with battery status and voluntary coordinates.
   - Emergency contact directory with primary responder designation.

9. **AI Safety Advisor (Google Gemini Flash)**
   - Context-aware disaster guidance answering life safety queries.
   - Multilingual generation in English, Kannada, and Hindi.
   - Built-in factual disaster knowledge fallback ensuring 100% availability.

10. **Authority Administration Dashboard**
    - Platform analytics: Active warnings, critical alerts, incoming SOS queue, shelter occupancy percentage, responders online.
    - Official Alert Creation & Publishing Studio.
    - SOS Incident Dispatcher to assign emergency requests to responders.
    - External data sources sync (IMD, NDMA, CWC, OpenStreetMap).
    - Immutable Security Audit Trail.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet OpenStreetMap.
- **Backend:** Node.js, Express, TypeScript (`server.ts` & `server/routes.ts`).
- **Database:** Supabase PostgreSQL with 34 normalized tables, primary keys, foreign keys, triggers, and Row Level Security (RLS) policies in `supabase/migrations/20261102000000_disasterguard_master_schema.sql`.
- **In-Memory Store:** `server/db.ts` providing realistic seed data and state persistence for all roles.
- **AI Integration:** `@google/genai` (Gemini 2.5 Flash) with domain-specific safety system instructions.
- **Testing:** Node.js native test runner (`node:test`, `node:assert/strict`) via `tsx --test`.

---

## User Roles (Switchable in Header)

1. **Guest (Public):** Browse active warnings, public shelter info, and preparedness guides.
2. **Citizen (Arun Kumar):** Report emergencies (SOS), track response, mark safe, manage contacts, report hazards.
3. **Emergency Responder (Inspector Rajesh Varma, NDRF):** Manage assigned incidents, advance mission lifecycle, append logs.
4. **Shelter Manager (Dr. Sunita Rao):** Update live shelter occupancy and monitor relief resources.
5. **Disaster Authority (District Commissioner):** Broadcast official alerts, dispatch responders, moderate reports.
6. **System Administrator:** Oversee system health, external data feeds, and audit logs.

---

## Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (geospatial, triage, alert rules)
npm test

# 3. Start full-stack development server (Express + Vite on port 3000)
npm run dev

# 4. Build for production
npm run build
```

---

## External Integration Setup Instructions

Features marked as `BLOCKED BY EXTERNAL API OR CREDENTIALS` in the audit checklist require official credentials:

1. **Google Gemini AI API Key:**
   - Set `GEMINI_API_KEY="your-gemini-key"` in `.env`.
   - DisasterGuard automatically uses this for real-time safety queries and alert explanations.

2. **National Disaster Management Authority (NDMA) & IMD CAP Feeds:**
   - Production feeds require Common Alerting Protocol (CAP-CP) credentials from NDMA.
   - Enter your CAP token in `data_sources` table in PostgreSQL.

3. **Live Cellular SMS Priority Alerts:**
   - Requires an enterprise SMS gateway (Twilio, Gupshup, or Fast2SMS) registered with Telecom Regulatory Authority (TRAI) DLT templates for emergency government messaging.
   - Configure gateway credentials in `server.ts` or environment variables `SMS_PROVIDER_API_KEY`.
