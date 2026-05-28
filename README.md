# AI Content Calendar

AI-powered content creation and social media scheduling platform. Create, edit, and schedule content across multiple platforms with intelligent AI assistance.

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL 16
- **Queue**: Redis + BullMQ
- **AI**: OpenAI-compatible API abstraction
- **Auth**: NextAuth.js v5
- **Testing**: Vitest + Playwright
- **Deploy**: Docker Compose

## Features

- User authentication (email/password)
- Brand profiles (tone, audience, forbidden words)
- AI content generation (Twitter, LinkedIn, Xiaohongshu, Email, Blog, Ads)
- Prompt templates (system + custom)
- Content editor with AI rewrite/shorten/expand/translate
- Content calendar with drag-and-drop scheduling
- Multi-platform social accounts (mock + OAuth-ready)
- Approval workflows (submit, approve, reject)
- Analytics dashboard (content stats, AI token usage)
- Team collaboration (workspace, roles, comments)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for DB/Redis)
- An OpenAI-compatible API key

### 1. Clone and Install

```bash
git clone https://github.com/Thibaultzhu/ai-content-calendar.git
cd ai-content-calendar
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your API key and settings
```

### 3. Start Infrastructure

```bash
docker compose up db redis -d
```

### 4. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Start Background Worker (optional)

```bash
npm run worker:publish
```

## Full Docker Deployment

```bash
docker compose up --build
```

This starts the app, worker, PostgreSQL, and Redis together.

## Test Accounts

After seeding:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Owner |
| editor@example.com | password123 | Editor |
| reviewer@example.com | password123 | Admin/Reviewer |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:seed` | Seed database |
| `npm run worker:publish` | Start publish worker |

## Architecture Decisions

- **OpenAI-compatible API**: Supports any provider (OpenAI, Azure, local models) via base URL
- **BullMQ**: Reliable job queue for scheduled publishing with retry/backoff
- **Versioned Content**: Every edit creates a new version for audit trail
- **Role-based Access**: Owner > Admin > Editor > Viewer hierarchy
- **Mock Social Accounts**: Simulated connections with OAuth structure ready for production

## License

MIT
