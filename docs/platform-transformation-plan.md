# Platform Transformation Plan (Final)

## Core Reality

- Local-first flow alone does not create retention or network effects.
- Community needs real cloud data and realtime updates to become a growth engine.
- AI must move from side feature to core coaching loop.

## Product Identity

- Vovinam AI Training Platform
- Learning + Tracking + Community + AI Coach + Marketplace

## Architecture (Production)

1. Client: Next.js App Router + PWA
2. API: Route Handlers (BFF layer)
3. Core: Supabase Auth + Postgres + Realtime + Storage
4. AI: OpenAI + optional video analyzer worker (FastAPI)

## Implemented Foundations

1. Cloud API core: auth, lessons, progress, sync, community
2. Realtime community chat component (belt-group aware)
3. AI endpoints: planning, video analysis, memory-aware coach-pro
4. Coach dashboard + leaderboard APIs
5. Analytics event tracking and follow graph APIs
6. Subscription status API and monetization helpers

## Data Layer Upgrades

Use these SQL files in sequence:

1. `supabase/rls.sql`
2. `supabase/platform_core_upgrade.sql`
3. `supabase/ai_video_coach.sql`
4. `supabase/final_blueprint_upgrade.sql`

## Retention Loop (Must-have)

1. User completes lesson
2. Progress is persisted in DB
3. AI coach-pro returns practical corrective advice
4. Streak/check-in updates
5. Leaderboard + community reinforces return behavior

## Execution Phases

1. Phase 1: Stabilize real data loops

- Ensure all local progress is synced to cloud
- Enable realtime community in production

2. Phase 2: AI differentiation

- Roll out coach-pro memory loop
- Activate video analysis MVP workflow

3. Phase 3: Business and scale

- Add paywall gating and conversion triggers
- Add analytics dashboards and funnel tracking
- Harden queue/cache/ops for larger traffic

## Success Criteria

1. D1 and W4 retention improvement
2. AI usage tied to completion uplift
3. Community activity tied to streak stability
4. Clear free-to-premium conversion path
