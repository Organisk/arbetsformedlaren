# Arbetsförmedlaren - Agent Instruction File

> **Project**: Modern job matching platform for Swedish job seekers
> **Tech Stack**: Node.js + TypeScript + Express + SQLite + React + Vite
> **Primary API**: Arbetsförmedlingens JobSearch API (jobsearch.api.jobtechdev.se)

---

## Project Overview

Arbetsförmedlaren is a job matching platform that helps Swedish job seekers find relevant job postings from the public Arbetsförmedlingen JobSearch API. Users upload their CV, the system extracts competencies and matches them against job ads, showing relevant jobs with explanations. The dashboard shows new matches daily.

**Core Flow**:
1. User uploads CV text
2. System parses CV (skills, experience, education, occupational roles)
3. User sets location and search radius
4. Backend fetches jobs from JobSearch API
5. Matching engine scores jobs against user profile
6. Dashboard displays jobs with match percentages and reasons
7. User can save or ignore jobs

---

## Architecture

### High-Level Layers

| Layer | Technology | Purpose |
|---|---|---|
| **Database** | SQLite (better-sqlite3) | Persistent storage for users, jobs, matches |
| **Backend** | Node.js + Express + TypeScript | REST API, API integration, business logic |
| **Frontend** | React + Vite + TypeScript + Tailwind | User interface, CV upload, dashboard |
| **Matching** | Custom weighted scoring | Skills (40%) + Experience (20%) + Occupation (15%) + Education (10%) + Languages (5%) + Location (10%) |
| **External API** | JobSearch API | Source of job postings from Arbetsförmedlingen |

### Data Flow

```
User uploads CV → Frontend parses CV → Stores parsed CV in localStorage
                 ↓
User sets location/radius → Frontend stores preferences
                 ↓
Frontend calls /api/jobs/search → Backend fetches from JobSearch API
                 ↓
Matching engine scores jobs → Scores based on CV vs job requirements
                 ↓
Frontend displays dashboard with matches
                 ↓
User saves/ignores → Backend updates matches table status
```

### Key Components

- **`src/app.ts`** - Express entry point, server setup, health check
- **`src/config.ts`** - Environment configuration (PORT, API_BASE_URL, DB_PATH, cities)
- **`src/services/jobsearch-client.ts`** - JobSearch API client, search and normalization
- **`src/services/cv-parser.ts`** - CV text parsing (skills, experience, education, roles)
- **`src/services/matching-engine.ts`** - Weighted matching algorithm
- **`src/services/db.service.ts`** - SQLite database wrapper
- **`frontend/src/App.tsx`** - React dashboard with CV upload, search, job cards
- **`frontend/src/services/jobsearch-client.js`** - Thin JS wrapper for API calls

---

## Repository Structure

```
arbetsformedlaren/
├── .omo/              # OpenCode session management
├── database/          # SQLite DB + init schema
├── dist/              # Compiled JS output
├── frontend/          # React + Vite frontend
│   ├── src/           # React source
│   ├── package.json   # Frontend dependencies
│   └── vite.config.ts
├── node_modules/      # Dependencies
├── package.json       # Root depscripts and scripts
├── src/               # Node.js/TypeScript source
│   ├── app.ts         # Express server entry
│   ├── config.ts      # Environment config
│   ├── config/        # (empty - config via env vars)
│   ├── database/      # SQL init files
│   ├── models/        # Type interfaces (jobmodel, userprofile)
│   ├── routes/        # (currently empty - routes defined inline in app.ts)
│   ├── services/      # Business logic services
│   │   ├── ai.service.ts          # Optional OpenAI integration
│   │   ├── cv-parser.ts           # CV parsing module
│   │   ├── db.service.ts          # SQLite wrapper
│   │   ├── jobsearch-client.ts    # JobSearch API client
│   │   ├── matching-engine.ts     # Weighted scoring engine
│   │   ├── privacy.service.ts     # Data minimization & hashing
│   │   └── scheduler.service.ts     # Automated job ingestion
│   └── types/         # Shared TypeScript interfaces
└── test-cv.js         # Test script for CV parsing
```

### Key Directories Explained

| Directory | Purpose |
|---|---|
| `src/` | All Node/TS source code. This is the backend logic. |
| `src/services/` | All service modules - CV parsing, matching, API, DB, privacy, scheduler |
| `src/models/` | Type interfaces for Job, UserProfile, ParsedCV, MatchResult |
| `src/types/index.ts` | Shared types used between frontend and backend |
| `frontend/` | React + Vite frontend application |
| `frontend/src/` | React component source |
| `frontend/src/components/` | UI components (App, job cards, form elements) |
| `frontend/src/hooks/` | Custom React hooks (use jobs, location, etc.) |
| `database/` | SQLite database file and migration scripts |
| `dist/` | Compiled output from TypeScript compilation |

---

## Development Commands

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start development server (ts-node) |
| `npm run build` | Compile TypeScript to dist/ |
| `node dist/app.js` | Start production server |
| `curl http://localhost:4443/api/health` | Health check endpoint |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run Oxlint for linting |
| `npm run preview` | Preview production build |

### Root

| Command | Description |
|---|---|
| `npm test` | Echo "Error: no test specified" (no tests configured) |
| `npm run` | List all available scripts |

### Environment Variables

Create a `.env` file in the root with:

```
PORT=3000
API_BASE_URL=https://jobsearch.api.jobtechdev.se
DB_PATH=./database/arbetsformedlaren.db
```

**Do NOT commit `.env` files.** The `.gitignore` should exclude them.

---

## Coding Conventions

### TypeScript

- Use strict TypeScript (`"strict": true` in tsconfig)
- Export interfaces from `src/types/index.ts`
- Use `as const` where appropriate
- Avoid `as any` - if you find yourself needing it, reconsider the type design
- All new files must have proper JSDoc comments

### Express/Backend

- Middleware order: `cors()` → `express.json()` → routes → error handler
- All API responses are JSON
- Error handler sends 500 with `{ error: 'Internal server error' }`
- Health check at `GET /api/health` returns `{ status: 'ok', timestamp: '...' }`
- Route prefixes: consider `/api/jobs`, `/api/matches`, `/api/profile`

### React/Frontend

- Functional components with hooks
- Use React Router for navigation
- Tailwind CSS for styling (utility-first)
- Components must have JSDoc describing props
- State initialization should be minimal
- `useEffect` cleanup required for any subscriptions/event listeners

### CV Parsing

- Use regex patterns with word boundaries (`\b`)
- Normalize to lowercase for matching
- Handle Swedish characters (å, ä, ö)
- Extract: skills, work_experiences (years), education, occupational_roles, languages

### Matching Engine

- Weighted scoring: Skills 40% + Experience 20% + Occupation 15% + Education 10% + Languages 5% + Location 10% = 100%
- Total score capped at 100
- Generate transparent reasons string for each match component
- Minimum match threshold: 30% to show as match

### Database

- Use parameterized queries (never string interpolation for values)
- All queries must use `?` placeholders with `better-sqlite3`
- Indexes: `idx_jobs_lat_lon`, `idx_jobs_occupation`, `idx_jobs_municipality`, `idx_matches_user`, `idx_matches_job`, `idx_matches_status`
- Soft delete: `removed` flag on jobs table, don't physically delete
- Match status: `new`, `saved`, `ignored`

### API Integration

- JobSearch API is free, no auth required
- Base URL: `https://jobsearch.api.jobtechdev.se/search`
- Parameters: `q` (free text), `location`, `radius`, `size`, `page`
- Response mapping needed: map API response to internal Job model
- Deduplication: by `external_id` or headline+company combo

### Error Handling

- Never swallow errors with empty `catch(e) {}`
- Always log errors to console with context
- User-facing errors: generic message, no stack traces
- API errors: include status code and sensible message

---

## Architectural Rules (Boundaries)

1. **Never store raw CV text in logs** - Use `privacy.service.ts` to sanitize before any logging
2. **Never use BankID in MVP** - Authentication is out of scope
3. **Always use parameterized queries** - Prevent SQL injection via `db.service.ts` DatabaseHelper
4. **Never expose OpenAI API keys in frontend** - Keep in backend only, env vars
5. **Preserve the `removed` flag** - Jobs are soft-deleted, never physically removed from DB
6. **Match score is 0-100** - Never exceed 100 or go below 0
7. **Geographic filtering uses Haversine formula** - Distance calculated in km
8. **User location is opt-in** - Default null, must be set before search
9. **CV parsing is rule-based only for MVP** - No OpenAI required for core functionality
10. **Scheduler runs periodically** - Daily ingestion, deduplication, matching

---

## Testing

### Test Structure

- No automated test framework configured yet (root `npm test` just echoes error)
- Frontend has Oxlint for linting
- Manual QA recommended via browser

### Manual QA Scenarios

| Scenario | Expected Result |
|---|---|
| User uploads CV text → sees parsed skills/experience | Parsed data displayed correctly |
| User sets location and radius → search runs | Jobs filtered by location |
| Match score >= 30 → job appears in matches | Job shows with match percentage |
| User clicks "Spara" → match status changes to "saved" | Dashboard updates |
| User clicks "Ignorera" → match removed | Dashboard shows fewer jobs |
| Health check endpoint responds | `{ status: 'ok', timestamp: '...' }` |

### QA Checklist (run after any changes)

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Lint passes: `npm run lint` (frontend) or `oxlint` (backend)
- [ ] Health check: `curl http://localhost:4443/api/health`
- [ ] CV parsing works with sample data
- [ ] Job search API integration returns data
- [ ] Matching engine produces scores + reasons
- [ ] No secrets exposed in compiled output or frontend

---

## Configuration

### Environment Variables (.env)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4443` | Server port |
| `API_BASE_URL` | `https://jobsearch.api.jobtechdev.se` | JobSearch API base |
| `DB_PATH` | `./database/arbetsformedlaren.db` | SQLite database path |

### Supported Cities (configurable in `src/config.ts`)

```typescript
export const SUPPORTED_CITIES = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås',
  'Eskilstuna', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping'
];
```

Each city has predefined coordinates used in the frontend `App.tsx`.

### API Integration Config

- No API key required for JobSearch
- Rate limiting: handle 429 responses gracefully (retry with backoff)
- Timeout: 30 seconds per API call
- No auth headers required

---

## External Services

### JobSearch API (Primary)

- **URL**: `https://jobsearch.api.jobtechdev.se/search`
- **Authentication**: None - free public API
- **Endpoints**: `GET /search?q=&location=&radius=&size=&page=`
- **Rate limits**: Unknown, handle 429 gracefully
- **Data returned**: Job ads with headline, company, location, skills, occupation, etc.
- **Must have structure**: `must_have { skills, languages, work_experiences, education }` + `nice_to_have { skills, languages }`

### Database (SQLite)

- **Engine**: `better-sqlite3`
- **Path**: `./database/arbetsformedlaren.db`
- **Tables**: `users`, `jobs`, `matches`
- **Backup**: The `.db` file is the source of truth; no separate migration system yet

---

## Database

### Schema Summary

| Table | Key Columns | Purpose |
|---|---|---|
| `users` | `id`, `email_hash`, `location_lat`, `location_lon`, `radius_km`, `occupations`, `preferences` | User profile with location preferences |
| `jobs` | `id`, `external_id`, `headline`, `company`, `municipality`, `county`, `lat`, `lon`, `must_skills`, `must_languages`, `must_education`, `occupation`, `occupation_group`, `publication_date` | Job postings from API |
| `matches` | `id`, `user_id`, `job_id`, `score`, `match_reasons`, `status` | User-job match results |

### Important Conventions

- **`must_skills`** stored as JSON text array in jobs table
- **`must_languages`** stored as JSON text array in jobs table
- **Soft delete**: jobs have `removed` flag, don't physically delete
- **Foreign keys**: matches references users(id) and jobs(id)
- **Indexes**: geographic (lat,lon), occupation, municipality, user lookup, match status

### Key SQL Conventions

- Always use `?` placeholders in queries
- Never interpolate user data directly into SQL
- Use `db.prepare(...).all()` for reads, `db.run(...)` for writes
- `created_at` defaults to `datetime('now')`
- Use WAL mode for better concurrency

---

## Security

### Data Minimization

- Only store extracted CV data (skills, experience, education), not raw text
- Hash emails with `privacy.service.ts` pseudonymizeEmail()
- Location data is opt-in; default to null if not provided

### SQL Injection Prevention

- Use `db.service.ts` DatabaseHelper with safeInsert/safeSelect/safeUpdate/safeDelete
- All queries must use `?` placeholders
- Never build SQL strings with user data

### XSS Prevention

- Frontend uses Tailwind CSS, sanitize any user-rendered HTML
- Escape any data inserted into DOM

### Secrets

- **NEVER** commit `.env` files
- **NEVER** expose `OPENAI_API_KEY` in frontend code
- API keys go in environment variables only

### Data Retention

- Matches older than 30 days are cleaned up by scheduler
- Jobs are soft-deleted (removed flag), not purged indefinitely

---

## AI Agent Rules

### Inspect Before Modifying

- **ALWAYS** read existing code before implementing new features
- Check `src/services/` for similar patterns before creating new services
- Review `src/types/index.ts` for existing interfaces
- Look at how existing modules export and import

### Prefer Modifying Existing Abstractions

- **DO NOT** create duplicate services if existing ones can be extended
- If adding a new feature, check if it fits within existing service patterns
- Example: Add CV parsing methods to `cv-parser.ts` rather than creating `new-cv-parser.ts`

### Do Not Introduce Dependencies Without Justification

- The project already has: `express`, `better-sqlite3`, `cors`, `dotenv`, `typescript`
- **Before adding new npm packages**: Ask - is there existing code that already does this?
- Preferred: Use built-in Node.js APIs or existing dependencies first

### Do Not Rewrite Working Code Merely for Stylistic Reasons

- If a function works correctly, leave it as-is even if "could be cleaner"
- Refactoring is only allowed when explicitly requested or as part of a focused task
- Code that passes tests and produces correct results is "done"

### Run Relevant Tests After Changes

- TypeScript: `npx tsc --noEmit`
- Lint: `npm run lint` (frontend) or `oxlint` (backend)
- Manual: Run the MVP flow end-to-end

### Keep Changes Scoped to the Requested Task

- Don't fix unrelated issues while working on a task
- If you discover other problems, document them in a TODO or separate task
- Scope creep is the #1 cause of incomplete projects

### Do Not Modify Generated Files Unless Required

- `dist/` files are compiled output - regenerate with `npm run build`
- `*.d.ts` type definition files follow the same rule
- Only modify source `.ts` files in `src/`

### Preserve Existing API Contracts

- The `GET /api/health` endpoint must always return `{ status: 'ok', timestamp: '...' }`
- The JobSearch API integration must maintain the normalized Job model shape
- CV parsing output must match the `ParsedCV` interface

### Privacy First

- Sanitize CV text before any logging with `privacy.service.ts.sanitizeCVText()`
- Never store raw personal identity numbers (personnummer)
- Hash emails before storing in database
- Location data is opt-in only

### When in Doubt, Omit

- If unsure whether to add a feature or change, err on the side of minimal changes
- The MVP has clear boundaries - stay within them
- Ask for clarification before making architectural decisions outside the MVP scope

### Keep the Boulder Moving

- This is a daily-rolled boulder task - make progress each session
- Small, verified steps are better than large, unverified changes
- If blocked, document the blocker and move to the next tractable task
- Never leave code in a broken state - run tests before declaring "done"