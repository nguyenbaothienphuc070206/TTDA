# Enterprise Scaffold Guide

This scaffold maps your requested enterprise structure into the current repository (JavaScript-first Next.js app).

## Added Structure

- app/community/page.js
- app/roadmap/page.js
- app/schedule/page.js
- app/nutrition/page.js
- app/progress/page.js
- app/api/ai/route.js
- app/api/track/route.js
- components/ui/SectionCard.jsx
- components/lesson/LessonList.jsx
- components/progress/ProgressSummary.jsx
- components/community/PostFeed.jsx
- lib/supabase/index.js
- lib/auth/index.js
- lib/ai/index.js
- store/useUser.js
- store/useProgress.js
- services/progress.service.js
- services/lesson.service.js
- types/domain.js
- utils/training.js
- utils/nutrition.js
- utils/affiliate.js
- utils/sync.js
- utils/premium.js
- utils/nutrition.test.js
- supabase/full_schema_enterprise.sql

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- OPENAI_API_KEY=
- OPENAI_MODEL=gpt-4o-mini

## Notes

- Existing Vietnamese routes remain the source of truth.
- New English routes are enterprise aliases/scaffolds and can be expanded progressively.
- RLS and role-aware SQL already exist in this repo; this scaffold adds a lightweight baseline schema in a separate file.
