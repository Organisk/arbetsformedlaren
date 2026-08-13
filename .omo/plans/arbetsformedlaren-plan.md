# Arbetsförmedlaren - Project Plan

## TL;DR

> **Modern job matching for Swedish job seekers.** Users upload their CV, the system extracts competencies and matches them against Arbetsförmedlingens JobSearch API job ads, showing relevant jobs with explanations. Dashboard shows new matches daily.

> **Tech stack:** Node.js + TypeScript + Express + SQLite + Playwright + OpenAI (optional)

> **MVP:** 1 user flow: upload CV → get matches → save/ignore → dashboard next day

---

## Context

### Original Request
Build a modern job matching platform for Swedish job seekers that:
- Accepts CV uploads
- Extracts competencies, experience, education, and roles
- Lets users set geographic position and search radius
- Fetches jobs from Arbetsförmedlingens öppna API
- Matches jobs to user profiles
- Ranks by relevance with explanations
- Saves/ignores jobs
- Shows new jobs on dashboard

### Product Vision
"Sluta be människor leta efter jobb. Låt systemet leta efter jobben åt dem."

Users shouldn't search - the system should proactively match them to relevant jobs using open data from Arbetsförmedlingen.

### Detected Framework
No SDD framework detected (greenfield project). Building from scratch.

### Key API Discovered
**JobSearch API** at `https://jobsearch.api.jobtechdev.se/`:
- Free text search with structured filters
- Returns job ads with: headline, description, occupation, skills, location, salary, employment type
- Supports filtering by location, occupation, working hours
- Each ad has `must_have` (skills, languages, work_experiences, education) and `nice_to_have`
- Coordinates available for geographic filtering

### Metis Review (Self-Correction)
Key assumptions verified:
1. API is free and public - NO auth required ✓
2. Coordinates provided in workplace_address ✓
3. Must have / nice to have structure for matching ✓
4. No BankID needed for MVP ✓
5. OpenAI optional, not required for core MVP ✓

---

## Work Objectives

### Core Objective
Enable Swedish job seekers to upload their CV and receive relevant job matches from Arbetsförmedlingens open data, with transparent explanations of why each job matches.

### Concrete Deliverables
1. **Web application** (React + Vite) with:
   - CV upload and parsing
   - Profile editor (location, radius, preferences)
   - Dashboard showing matched jobs
   - Save/ignore job functionality
2. **Backend** (Node.js/Express + TypeScript) with:
   - JobSearch API integration
   - CV parsing and normalization
   - Matching engine with weighted scoring
   - Scheduler for automated ingestion
3. **Database** (SQLite) with:
   - Users (hashed password or session, minimal data)
   - CVs (extracted data, not raw file)
   - Jobs (from API, normalized)
   - Matches (user-job pairs with scores and reasons)
4. **Matching Engine** with:
   - Weighted scoring based on: skills (40%), experience (20%), occupation (15%), location (15%), education (10%)
   - Fuzzy matching for job titles and skills
   - Geographic distance calculation
   - Transparent explanations per match
5. **Scheduler** for:
   - Daily job ingestion from API
   - Deduplication
   - Profile matching
   - Can use cron, GitHub Actions, or external scheduler

### Definition of Done - MVP
A new user can:
1. Open web application
2. Upload CV (text)
3. Set location and radius (e.g., 40 km)
4. Click "Hitta jobb"
5. Get relevant jobs from Arbetsförmedlingens API
6. See why each job matches (explanation)
7. Save or ignore each job
8. Return next day and see new relevant jobs

### Guardrails (from Metis)
- MUST NOT: Store raw CV text in logs
- MUST NOT: Use BankID in MVP
- MUST NOT: Make AI generate fake experience/education
- MUST: Anonymize/pseudonymize user data
- MUST: Never store OpenAI API keys in frontend or git
- MUST: Use parameterized queries to prevent SQL injection

---

## Verification Strategy

### Test Decision
- **Infrastructure**: Setting up from scratch (no existing test framework)
- **Automated tests**: Will add in Phase 10 (Testing, security, documentation)
- **Agent-Executed QA**: All tasks include QA scenarios (Playwright for UI, curl for API, tmux for CLI)

### QA Policy
Every task MUST include agent-executed QA scenarios.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - foundation + scaffolding):
├── Task 1: Project scaffolding (Node/TS/config) [quick]
├── Task 2: Directory structure & config [quick]
├── Task 3: TypeScript config [quick]
├── Task 4: SQLite database setup [quick]
├── Task 5: Basic Express server [quick]
├── Task 6: API route structure [quick]
└── Task 7: Import JobSearch API client [quick]

Wave 2 (After Wave 1 - core data models):
├── Task 8: Database schema (users, jobs, matches) [deep]
├── Task 9: JobSearch API integration [deep]
├── Task 10: CV parsing module [deep]
├── Task 11: Normalization layer [deep]
├── Task 12: Matching engine skeleton [deep]
└── Task 13: Geographic distance calc [deep]

Wave 3 (After Wave 2 - frontend + matching):
├── Task 14: React Vite frontend scaffold [deep]
├── Task 15: CV upload component [visual-engineering]
├── Task 16: Location/radius selector [visual-engineering]
├── Task 17: Dashboard component [visual-engineering]
├── Task 18: Job card with match explanation [visual-engineering]
└── Task 19: Save/ignore job UI [visual-engineering]

Wave FINAL (Integration + QA):
├── Task F1: End-to-end flow test (CV → matches) [oracle]
├── Task F2: API response validation [unspecified-high]
├── Task F3: UI Playwright tests [unspecified-high]
├── Task F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay
```

### Agent Dispatch Summary

- **1**: **7** - T1-T7 → `quick`
- **2**: **7** - T8-T13 → `deep`
- **3**: **6** - T14-T19 → `visual-engineering`
- **4**: **4** - F1-F4 → `oracle`/`unspecified-high`/`unspecified-high`/`deep`
- **FINAL**: **4** - Present to user

---

## TODOs

> **IMPORTANT**: Task labels MUST use bare numbers: `1.`, `2.`, `3.` — NOT `T1.`, `Task 1.`, `Phase 1:`.

- [ ] 1. **Project scaffolding** — `quick`
  - Initialize Node.js project with TypeScript
  - Configure Express, ESM/CJS
  - Set up package.json scripts (dev, build, start)
  - Create directory structure: `src/`, `routes/`, `models/`, `services/`, `utils/`
  - Add dependencies: `express`, `sqlite3`, `cors`, `dotenv`, `typescript`, `ts-node`
  - **Recommended Agent Profile**: `quick` + `unspecified-low`
    - Reason: Simple setup task, minimal complexity
  - Skills: `bash`, `typescript`
    - `bash`: For running terminal commands
    - `typescript`: For type safety in config

- [ ] 2. **Directory structure & config** — `quick`
  - Create `src/config.ts` with environment variables
  - Create `src/app.ts` with Express setup
  - Set up `.env` template with: `PORT`, `API_BASE_URL`, `DB_PATH`
  - Create `src/constant.ts` for API endpoints
  - Initialize git repo with `.gitignore` (no node_modules, .env, .omo/)
  - **Recommended Agent Profile**: `quick`
    - Reason: Routine configuration task
  - Skills: `bash`, `typescript`

- [ ] 3. **TypeScript config** — `quick`
  - Create `tsconfig.json` with proper paths
  - Set up `eslint.config.mjs` basic config
  - Add `prettier` config
  - Define types for API responses, database models
  - **Recommended Agent Profile**: `quick`
  - Skills: `typescript`

- [ ] 4. **SQLite database setup** — `deep`
  - Initialize SQLite database with `better-sqlite3`
  - Create tables: `users`, `cv_data`, `jobs`, `matches`
  - Define schema with proper indexing for performance
  - Create migration script (initial schema)
  - **Recommended Agent Profile**: `deep`
    - Reason: Data modeling requires careful design
  - Skills: `bash`, `sqlite3`
    - `bash`: Running sqlite3 commands
    - `sqlite3`: Database modeling

- [ ] 5. **Basic Express server** — `quick`
  - Create entry point `src/index.ts`
  - Set up middleware: `json()`, `cors()`, `express.static()`
  - Create health check endpoint `GET /api/health`
  - Add error handling middleware
  - Start server on configured port
  - **Recommended Agent Profile**: `quick`
  - Skills: `bash`, `typescript`

- [ ] 6. **API route structure** — `quick`
  - Create route files: `routes/api.ts`, `routes/jobs.ts`, `routes/matches.ts`
  - Define Express routes structure
  - Set up route prefixes: `/api/jobs`, `/api/matches`, `/api/profile`
  - Basic route handlers (stub implementations)
  - **Recommended Agent Profile**: `quick`
  - Skills: `typescript`

- [ ] 7. **Import JobSearch API client** — `quick`
  - Create `services/jobsearch-client.ts` 
  - Implement search function: `searchJobs(query, location, radius)`
  - Map API response to internal job model
  - Handle pagination and error responses
  - **Recommended Agent Profile**: `quick`
    - Reason: Wrapping API in service layer
  - Skills: `bash`, `typescript`
    - `bash`: curl testing
    - `typescript`: Type definitions

- [ ] 8. **Database schema (users, jobs, matches)** — `deep`
  - Design and create SQLite tables:
    - `users`: id, email (hashed), created_at, location_lat, location_lon, radius_km, created_at
    - `jobs`: id, external_id, headline, company, municipality, county, coordinates, salary, employment_type, occupation, skills [JSON], languages [JSON], work_experiences [JSON], education [JSON], must_have [JSON], nice_to_have [JSON], published_at, removed
    - `matches`: id, user_id, job_id, score, match_reasons [JSON], status (saved/ignored), created_at
  - Add indexes for: user lookups, geographic queries, match scoring
  - Create seed script for test data
  - **Recommended Agent Profile**: `deep`
    - Reason: Critical data design affecting entire system
  - Skills: `bash`, `sqlite3`, `typescript`
    - `bash`: SQLite commands
    - `sqlite3`: Schema creation
    - `typescript`: Type definitions for schema

- [ ] 9. **JobSearch API integration** — `deep`
  - Implement full integration with `https://jobsearch.api.jobtechdev.se/search`
  - Parameters: `q` (free text), `occupation_concept_ids`, `location_concept_ids`, `location` (text search), `radius`
  - Handle API rate limits and error responses
  - Map API fields to internal Job model:
    - headline, company, municipality, county
    - coordinates (lat/lon)
    - must_have { skills, languages, work_experiences, education }
    - nice_to_have { skills, languages }
    - employment_type, salary_type, duration, working_hours_type
    - scope_of_work
  - Implement deduplication (by external_id or headline + company)
  - **Recommended Agent Profile**: `deep`
    - Reason: Core integration with external API
  - Skills: `bash`, `typescript`
    - `bash`: API testing with curl
    - `typescript`: API client types

- [ ] 10. **CV parsing module** — `deep`
  - Implement CV text extraction from uploaded files
  - Parse: competencies (skills), experience (years, roles), education (degrees, institutions), occupational roles
  - Use simple regex/NLP patterns initially (no external AI required for MVP)
  - Normalize extracted data to match JobSearch API `must_have` structure
  - Output format: `{ skills: [], languages: [], work_experiences: [], education: [] }`
  - **Recommended Agent Profile**: `deep`
    - Reason: NLP parsing requires careful design
  - Skills: `bash`, `typescript`
    - `bash`: Testing regex patterns
    - `typescript`: Parsing types

- [ ] 11. **Normalization layer** — `deep`
  - Map parsed CV data to job matching format
  - Align CV competencies with job `must_have` skills
  - Match occupation codes (user's role vs job occupation)
  - Handle seniority level extraction from CV
  - Create normalized profile: `{ skills: [], occupation: '', seniority: '', education: [], languages: [] }`
  - **Recommended Agent Profile**: `deep`
  - Skills: `typescript`, `bash`

- [ ] 12. **Matching engine skeleton** — `deep`
  - Implement weighted scoring algorithm:
    - Skills match: 40% weight (intersection of CV skills vs job must_have skills)
    - Occupation match: 15% weight (exact match or related)
    - Experience match: 20% weight (years vs job requirements)
    - Education match: 10% weight (degree level)
    - Language match: 5% weight (required vs have)
    - Location match: 10% weight (distance from user location)
  - Calculate total score (0-100%)
  - Generate match reasons list (string explanations)
  - **Recommended Agent Profile**: `deep`
    - Reason: Core business logic, needs to be correct
  - Skills: `typescript`, `bash`
    - `typescript`: Scoring algorithm
    - `bash`: Test scenarios

- [ ] 13. **Geographic distance calculation** — `deep`
  - Implement Haversine formula for lat/lon distance
  - Calculate km/miles between user location and job workplace
  - Filter jobs outside max radius
  - Add distance to match explanation
  - **Recommended Agent Profile**: `deep`
  - Skills: `bash`, `typescript`
    - `bash`: Test with known coordinates
    - `typescript`: Distance math

- [ ] 14. **React Vite frontend scaffold** — `visual-engineering`
  - Create Vite + React project
  - Configure routing (React Router)
  - Set up Tailwind CSS or minimal styling
  - Create folder structure: `src/components/`, `src/pages/`, `src/hooks/`
  - Add dependencies: `react`, `react-dom`, `react-router-dom`, `axios`
  - **Recommended Agent Profile**: `visual-engineering`
    - Reason: Frontend UI setup
  - Skills: `bash`, `typescript`
    - `bash`: Terminal commands
    - `typescript`: React TypeScript

- [ ] 15. **CV upload component** — `visual-engineering`
  - Create file input for CV text upload
  - Handle onChange with text extraction
  - Show preview of parsed data (skills, experience, etc.)
  - Store parsed CV in local state or send to backend
  - **Recommended Agent Profile**: `visual-engineering`
    - Reason: User-facing CV upload
  - Skills: `bash`, `typescript`
    - `bash`: File handling testing
    - `typescript`: React component types

- [ ] 16. **Location/radius selector** — `visual-engineering`
  - Create map-like selector or city dropdown
  - Allow user to set latitude/longitude or select Swedish city
  - Add radius slider/input (10km, 25km, 50km, 100km)
  - Store location in user profile
  - **Recommended Agent Profile**: `visual-engineering`
    - Reason: Geographic preference UI
  - Skills: `bash`, `typescript`
    - `bash`: Coordinate testing
    - `typescript`: UI state types

- [ ] 17. **Dashboard component** — `visual-engineering`
  - Show "Nya jobb för you" section
  - List matched jobs with match percentages
  - Display match explanation per job
  - Show save/ignore buttons
  - Track new vs previously seen jobs
  - **Recommended Agent Profile**: `visual-engineering`
    - Reason: Core dashboard UI
  - Skills: `bash`, `typescript`
    - `bash`: API response testing
    - `typescript`: Dashboard data types

- [ ] 18. **Job card with match explanation** — `visual-engineering`
  - Create reusable card component
  - Display: headline, company, location, match %, match reasons
  - Show: "8/10 efterfrågade kompetenser matchar", "Rätt senioritetsnivå", "14 km från angiven position", "Saknad kompetens: Azure"
  - Make clickable to view full job
  - **Recommended Agent Profile**: `visual-engineering`
    - Reason: Reusable match display component
  - Skills: `bash`, `typescript`
    - `bash`: Rendering tests
    - `typescript`: Component props types

- [ ] 19. **Save/ignore job UI** — `visual-engineering`
  - Create buttons: "Spara", "Ignorera" per job card
  - Persist choice to backend (matches table status)
  - Update dashboard to show only unsaved jobs
  - **Recommended Agent Profile**: `visual-engineering`
  - Skills: `bash`, `typescript`
    - `bash`: Button click testing
    - `typescript`: State management

- [ ] 20. **End-to-end flow test (CV → matches)** — `oracle`
  - Test full flow: upload CV → set location → search → get matches → show dashboard
  - Verify match explanations are accurate and helpful
  - Test save/ignore functionality
  - **Recommended Agent Profile**: `oracle`
    - Reason: Verifying complete system flow
  - Skills: `playwright`, `bash`
    - `playwright`: Browser automation
    - `bash`: Test assertions

- [ ] 21. **API response validation** — `unspecified-high`
  - Validate JobSearch API responses are properly mapped
  - Test edge cases: no results, error responses, rate limiting
  - Verify data normalization is correct
  - **Recommended Agent Profile**: `unspecified-high`
  - Skills: `bash`, `curl`
    - `bash`: API calls
    - `curl`: Testing endpoints

- [ ] 22. **UI Playwright tests** — `unspecified-high`
  - Write Playwright tests for: CV upload, job search, match display, save/ignore
  - Run tests in headless mode
  - Capture evidence screenshots
  - **Recommended Agent Profile**: `unspecified-high`
  - Skills: `playwright`
    - `playwright`: End-to-end browser testing

- [ ] 23. **Scope fidelity check** — `deep`
  - Verify all MVP requirements from Definition of Done are met
  - Check no scope creep: no BankID, no AI required, no BankID
  - Verify all 10 MVP criteria are implementable
  - **Recommended Agent Profile**: `deep`
  - Skills: `bash`, `typescript`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify all MVP requirements present.

- [ ] F2. **Code quality review** — `unspecified-high`
  Run type check, lint. Verify no AI slop patterns.

- [ ] F3. **Real manual QA** — `unspecified-high`
  Execute the MVP flow manually or via Playwright.

- [ ] F4. **Scope fidelity check** — `deep`
  Verify 1:1 compliance with Definition of Done.

> **Output**: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `type(scope): desc` - e.g., `feat(api): add jobsearch client` - `src/services/jobsearch-client.ts`
- **2**: `npm test` or `bun test`

---

## Success Criteria

### Verification Commands
```bash
# Start dev server
bun run dev

# Test API integration
curl http://localhost:3000/api/health

# Run type check
npx tsc --noEmit

# Run lint
npx eslint .
```

### Final Checklist
- [ ] All "Must Have" present (MVP criteria 1-10)
- [ ] All "Must NOT Have" absent (no BankID, no raw CV in logs, etc.)
- [ ] TypeScript compiles without errors
- [ ] Basic Express server runs
- [ ] JobSearch API integration works (search returns jobs)
- [ ] CV parsing module functional
- [ ] Matching engine produces scores + reasons
- [ ] Frontend can upload CV and see dashboard
- [ ] Save/ignore functionality works
- [ ] Geographic filtering by radius works
- [ ] Dashboard shows new jobs on return
- [ ] No secrets in git or frontend
- [ ] Documentation exists for setup and API integration
```

Now the plan file is created. Let me mark the first todo as complete and continue.</think>
<tool_call>
<function=todowrite>
<parameter=todos>
[{"content": "Create project structure and plan document (.omo/plans/arbetsformedlaren-plan.md)", "priority": "high", "status": "completed"}, {"content": "Set up development environment (Node.js/TypeScript, database, etc.)", "priority": "high", "status": "in_progress"}, {"content": "Design and implement API integration with Arbetsförmedlingens JobSearch API", "priority": "high", "status": "pending"}, {"content": "Design database schema for jobs, users, CVs, matches", "priority": "high", "status": "pending"}, {"content": "Implement CV parsing/extraction (competencies, experience, education, roles)", "priority": "high", "status": "pending"}, {"content": "Implement matching engine (fuzzy matching, weighted scoring)", "priority": "high", "status": "pending"}, {"content": "Implement frontend dashboard with job listings and match explanations", "priority": "high", "status": "pending"}, {"content": "Implement scheduler for automated job ingestion", "priority": "medium", "status": "pending"}, {"content": "Implement AI integration (OpenAI optional, CV analysis, suggestions)", "priority": "medium", "status": "pending"}, {"content": "Implement privacy/security features (data minimization, encryption)", "priority": "high", "status": "pending"}, {"content": "Test MVP end-to-end: CV upload → matches → dashboard", "priority": "high", "status": "pending"}]