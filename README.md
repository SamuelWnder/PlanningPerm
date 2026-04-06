# PlanningPerm

AI-powered planning permission companion for UK homeowners. From first idea to decision granted.

## What it does

1. **Feasibility Engine** — describes your project, cross-references 340+ UK local authority planning histories, and returns a genuine approval likelihood with comparable real decisions
2. **Document Generator** — AI-drafted Design & Access Statements, Planning Statements, and cover letters
3. **Application Tracker** — monitors the Planning Portal and sends plain-language alerts at every stage
4. **Appeals Support** (Phase 3) — analyses refusal grounds and drafts appeal statements

## Tech stack

- **Frontend/API**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Auth**: Clerk
- **Database**: PostgreSQL via Supabase (with pgvector for similarity search)
- **AI**: OpenAI GPT-4o (feasibility engine + document generation)
- **Email**: Resend
- **Data pipeline**: Python (FastAPI + Scrapy/httpx + APScheduler)
- **Deployment**: Vercel (Next.js) + Railway (Python service + Postgres)

## Getting started

### 1. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

Required keys:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — from [clerk.com](https://clerk.com)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` — from [supabase.com](https://supabase.com)
- `OPENAI_API_KEY` — from [platform.openai.com](https://platform.openai.com)
- `OS_PLACES_API_KEY` — from [osdatahub.os.uk](https://osdatahub.os.uk)
- `RESEND_API_KEY` — from [resend.com](https://resend.com)

### 2. Database setup

Run the migrations against your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually via Supabase SQL editor
# Run supabase/migrations/001_initial_schema.sql
# Run supabase/migrations/002_seed_lpas.sql
```

### 3. Python service

```bash
cd services/python
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, API_KEY

pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 4. Run initial scrape + embed

Once the Python service is running:

```bash
# Trigger a scrape of all configured LPAs (top 20)
curl -X POST http://localhost:8000/scrape/run \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"days_back": 365, "max_per_lpa": 2000}'

# Embed the scraped decisions
curl -X POST http://localhost:8000/embed/decisions \
  -H "x-api-key: YOUR_API_KEY"
```

### 5. Start Next.js

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Project structure

```
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── dashboard/          # Protected dashboard (projects, tracker, alerts)
│   │   ├── api/                # API routes (projects, documents, tracker, etc.)
│   │   └── (auth)/             # Sign-in / sign-up pages
│   ├── components/
│   │   ├── ui/                 # Design system primitives (Button, Card, Badge, etc.)
│   │   ├── feasibility/        # Feasibility report UI
│   │   ├── onboarding/         # New project wizard
│   │   ├── documents/          # Document editor (Tiptap)
│   │   └── tracker/            # Application tracker UI
│   ├── lib/
│   │   ├── feasibility/        # Engine + document generator
│   │   ├── planning-data/      # OS Places API, LPA lookup
│   │   ├── tracker/            # Planning Portal scraper, alert generator
│   │   └── supabase/           # Client/server Supabase instances
│   └── types/
│       └── database.ts         # Full typed Supabase schema
├── services/python/
│   ├── scraper/                # Idox + Northgate portal scrapers
│   ├── embedder/               # OpenAI embedding pipeline
│   └── api/                    # FastAPI service + APScheduler cron
└── supabase/migrations/        # SQL schema + seed data
```

## Key data sources

| Source | What it provides |
|---|---|
| LPA planning portals (Idox/Northgate) | Historical planning decisions |
| OS Places API | Address geocoding → LPA identification |
| NPPF + Local Plans | Policy context (PDFs embedded into pgvector) |
| Planning Portal API | Live application status tracking |

## Deployment

### Vercel (Next.js)
```bash
vercel deploy
```
Set all environment variables in the Vercel dashboard.

### Railway (Python service)
```bash
cd services/python
railway up
```

## Roadmap

- [ ] Phase 1: Feasibility engine (live)
- [ ] Phase 2: Document generator + application tracker (live)
- [ ] Phase 3: Objection response tool
- [ ] Phase 3: Appeals support
- [ ] Phase 3: Professional marketplace
