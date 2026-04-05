# Enterprise Implementation Roadmap

Tai lieu nay bien blueprint thanh ke hoach build theo phase, co acceptance criteria de team co the execute ngay.

## Phase 1 — Core Foundation (2-3 tuan)

Muc tieu:

- Chot auth, role, RLS baseline.
- Chot schema curriculum/progress/training plan.
- On dinh UX "next action" tren flow hoc tap.

Task:

1. Chay va review [supabase/rls.sql](supabase/rls.sql).
2. Ap dung schema enterprise moi: [supabase/enterprise_blueprint.sql](supabase/enterprise_blueprint.sql).
3. Tao API v1 cho lesson progress va training plans.
4. Ghep roadmap page voi persisted progress table.

Acceptance criteria:

- User khong doc/sua du lieu user khac.
- Coach chi update hoc vien duoc assign.
- Roadmap hien 1 bai goi y hom nay + mark complete thanh cong.
- Lint pass va smoke test pass.

## Phase 2 — AI Coach Production (2-3 tuan)

Muc tieu:

- Dua AI tu demo sang system co context that.
- Co loop feedback de cai tien chat luong.

Task:

1. Dung retrieval tu ai_knowledge_chunks + filter theo belt.
2. Ket hop context progress + schedule vao prompt orchestration.
3. Luu full conversation va feedback.
4. Them timeout/fallback message than thien cho user.

Acceptance criteria:

- 90% AI response co context lien quan theo belt.
- P95 AI response < 5s trong muc tai muc tieu.
- Khong lo stack trace/secret trong response.

## Phase 3 — Community & Engagement (2 tuan)

Muc tieu:

- Tang social proof va giu chan nguoi dung.

Task:

1. Mo rong community feed (posts/comments/reactions).
2. Giu direct message + typing state theo schema hien co.
3. Them moderation flags va report pipeline.
4. Them notification center (in-app).

Acceptance criteria:

- Feed load P95 < 700ms.
- User chi thao tac duoc noi dung cua minh, moderation dung role.
- Co fallback state khi realtime cham/loi.

## Phase 4 — Monetization & Store (2 tuan)

Muc tieu:

- Bien traffic thanh doanh thu on dinh.

Task:

1. Tich hop stripe checkout + webhook idempotent.
2. Dong bo don hang vao commerce_orders.
3. Premium gating theo subscription_state.
4. Hoan thien funnel event tracking.

Acceptance criteria:

- Checkout thanh cong > 95% trong test run.
- Khong tao trung order khi retry webhook.
- Premium content chi mo khi status hop le.

## Phase 5 — SRE, Quality, Scale (2 tuan)

Muc tieu:

- Dat muc production enterprise (SLO + runbook + alerting).

Task:

1. Cai dat error tracking, tracing, alert channels.
2. Backup + restore drill cho Postgres.
3. Load test API core va toi uu query/index.
4. Hoan thien runbook su co.

Acceptance criteria:

- Uptime dat 99.9% theo chu ky danh gia.
- Co bao cao restore drill dat RTO/RPO muc tieu.
- Top 5 critical flows co test automation pass.

## Cross-Phase Engineering Standards

- Moi PR bat buoc:
- Co test cho logic moi (unit hoac integration).
- Co kiem tra authz neu co endpoint du lieu rieng.
- Co update docs neu doi API/schema.
- Release checklist moi dot:

1. Verify migrations on staging.
2. Verify security regression.
3. Verify product KPI event tracking.
4. Rollout production co monitoring 30-60 phut.
