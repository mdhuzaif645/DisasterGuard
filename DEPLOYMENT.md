# DISASTERGUARD — PRODUCTION DEPLOYMENT & DATABASE GUIDE

This guide provides step-by-step instructions for deploying DisasterGuard to production environments with PostgreSQL, Supabase, Google Cloud Run, Render, or Railway.

---

## 1. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Server Port & Mode
PORT=3000
NODE_ENV=production

# Gemini AI API Key (Injected in Google AI Studio or configured in secrets)
GEMINI_API_KEY="AIzaSy..."

# Application Host URL
APP_URL="https://your-disasterguard-domain.com"

# Supabase PostgreSQL Connection String (Optional for managed external database)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Emergency Push & Notification Credentials (Optional)
FCM_SERVER_KEY=""
SMS_GATEWAY_API_KEY=""
```

---

## 2. Database Migrations (PostgreSQL / Supabase)

DisasterGuard includes the complete production migration script defining all 34 normalized tables, primary keys, foreign keys, indexes, check constraints, Row Level Security (RLS) policies, and triggers:

```bash
# Path to migration script
supabase/migrations/20261102000000_disasterguard_master_schema.sql
```

### Applying the Schema:

#### Option A: Via Supabase CLI
```bash
supabase db push
# or
supabase migration up
```

#### Option B: Via psql or Supabase SQL Editor
1. Log in to your Supabase Dashboard or PostgreSQL instance.
2. Navigate to **SQL Editor**.
3. Copy the entire contents of `supabase/migrations/20261102000000_disasterguard_master_schema.sql`.
4. Click **Run**.
5. All 34 tables, enums (`user_role_enum`, `alert_severity_enum`, `sos_status_enum`), and RLS policies will be created immediately.

---

## 3. Production Build & Deployment

### Build Command:
```bash
npm run build
```
This compiles the frontend with Vite into `dist/`.

### Start Command:
```bash
npm start
```
This executes `tsx server.ts`, which starts Express, mounts `/api` REST endpoints, and serves `dist/` with client-side SPA routing fallback.

### Deploying to Google Cloud Run:
```bash
# Containerize and deploy
gcloud run deploy disasterguard \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=3000
```

### Deploying to Render / Railway:
1. Connect your repository.
2. Set Build Command: `npm run build`
3. Set Start Command: `npm start`
4. Set Environment Variables: `NODE_ENV=production`, `PORT=3000`, `GEMINI_API_KEY=...`

---

## 4. Production Security & Reliability Checklist

- [x] **Rate Limiting:** Protect public submission endpoints (`/api/sos`, `/api/reports`) against automated spam.
- [x] **No Secrets in Frontend:** API keys (`GEMINI_API_KEY`) are kept exclusively on the server side in `server/ai.ts`.
- [x] **Row Level Security:** Ensure Supabase RLS is enabled on all tables so citizens only query their own private data while responders only view authorized incidents.
- [x] **CORS Configuration:** Restrict allowed origins to `APP_URL`.
- [x] **Audit Logging:** Every critical administrative action (alert creation, responder dispatch, shelter occupancy modification) is recorded in the `audit_logs` table.
- [x] **Emergency Disclaimer:** All public screens clearly state that DisasterGuard facilitates coordination, and users in imminent life-threatening danger must contact official emergency services directly at **112**.
