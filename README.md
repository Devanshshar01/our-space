# Couple Space

A private digital home for exactly two partners.

## Purpose

This is the central Couple Space application — the hub that owns authentication, identity, Couple Space membership, dashboard, and app launcher. Feature applications (Canvas, Notes, Tasks, etc.) live in separate repositories.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Auth**: Better Auth (email + password)
- **Database**: PostgreSQL (Neon compatible) via Drizzle ORM

## Requirements

- Node.js 22+
- pnpm 11+
- PostgreSQL database (Neon recommended)

## Local Development

```bash
# Install dependencies
pnpm install

# Copy environment template and fill in real values
cp .env.example .env.local

# Apply database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The application will be available at http://localhost:3000

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit and integration tests |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Current Scope (Step 1 + 2 + 3)

- Next.js App Router foundation
- TypeScript strict configuration
- Tailwind CSS with design token foundation
- Better Auth email/password authentication
- Signup, login, logout, session retrieval
- Couple Space creation, membership, and pairing
- Invitation tokens with expiration and single-use enforcement
- Onboarding flow (`/onboard`) with create-or-join choice
- Pending state (`/onboard/pending`) with invite link sharing
- Join flow (`/join`) for invite redemption
- Authenticated dashboard placeholder (`/dashboard`) showing partner details
- Exact-two-member invariant enforced transactionally with row-level locks
- Atomic invitation redemption and self-join protection

## Intentionally Deferred

Dashboard widgets (Countdown, Mood), app launcher, app integrations (Canvas, Notes, Tasks, Calendar, Letters, Games), OAuth/OIDC provider, cross-app SSO, social login, MFA, account deletion UI, and any feature-specific implementation are deferred to later phases.

## Architectural Boundary

**This repository owns:**
- Identity & authentication
- Couple Space creation & membership
- Invitations & onboarding
- Central dashboard & widgets
- App launcher
- Cross-app SSO authorization

**This repository does NOT own:**
- Canvas implementation (drawing, realtime, presence)
- Notes implementation (editor, autosave)
- Tasks, Calendar, Letters, Games implementations
- Feature-specific data models or business logic

Each feature application is a separate repository with its own domain ownership.

## Step 3 — Couple Space Model

A Couple Space has exactly two members at most.

State machine:

```
none → PENDING (creator)
PENDING → ACTIVE (when second member joins)
ACTIVE → DISSOLVED (future, not in Step 3)
```

Invitations:
- Token: 32 random bytes hex-encoded (64 chars)
- Storage: only SHA-256 hash kept in the database
- Expiration: 72 hours
- One use per invitation

Invariants enforced atomically (PostgreSQL transaction with `SELECT … FOR UPDATE`):
- A user can belong to at most one Couple Space (unique index on `user_id`)
- A Couple Space can have at most two active members (counted under lock)
- An invitation can only be redeemed while PENDING and not expired
- Self-join is rejected
- Already-paired joiner is rejected