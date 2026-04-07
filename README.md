# TTDA — Vovinam Learning (Next.js)

Web app học Vovinam theo **Lam đai → Hoàng đai → Huyền đai**.

Điểm chính:

- UI tối, nổi bật (xanh/cyan + điểm nhấn vàng), có hiệu ứng nền + hover.
- Có **lộ trình bài học**, **trang chi tiết bài**, **đánh dấu hoàn thành** (lưu local).
- Có **lịch tập 7 ngày** gợi ý theo cấp đai (lưu local).
- Có **tính calories** + **gợi ý ăn uống** theo cân nặng/chiều cao/mức tập.
- Có trang **Chính sách bảo mật** và **Điều khoản**.

> Lưu ý an toàn: Nội dung mang tính tham khảo & hỗ trợ tự luyện. Kỹ thuật khó nên có huấn luyện viên hướng dẫn.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở trình duyệt: http://localhost:3000

## Scripts

```bash
npm run lint
npm run build
npm start
```

## Tài liệu pitching

- Business case (Profit/Team/Maintenance/Break-even): `docs/business-case.md`

## Các trang chính

- Trang chủ: `app/page.js`
- Lộ trình: `app/lo-trinh/page.js`
- Bài học (dynamic route): `app/bai-hoc/[slug]/page.js`
- Lịch tập: `app/lich-tap/page.js`
- Dinh dưỡng (calories): `app/dinh-duong/page.js`
- Chính sách bảo mật: `app/chinh-sach-bao-mat/page.js`
- Điều khoản: `app/dieu-khoan/page.js`

## Sửa/Nâng cấp nội dung bài học

Toàn bộ dữ liệu bài học nằm trong:

- `data/lessons.js`

Bạn có thể:

- Thêm bài mới bằng cách thêm object vào mảng `LESSONS`.
- Đổi thứ tự bài bằng cách đổi vị trí trong mảng.
- Sửa nội dung từng bài: `goals`, `steps`, `mistakes`, `tips`.

## Lưu tiến độ & lịch tập

App lưu ở localStorage:

- Tiến độ hoàn thành: key `vovinam_done_v1`
- Lịch tập: key `vovinam_schedule_v1`

## Biến môi trường (tùy chọn)

Nếu bạn deploy thật và muốn `sitemap.xml`/`robots.txt` dùng đúng domain:

1. Copy `.env.example` → `.env.local`
2. Điền `NEXT_PUBLIC_SITE_URL=https://your-domain.com`

### Pitch Mode (demo/pitching)

Để bật giao diện pitch (ẩn bớt phần phụ, giữ AI Coach + Form Check + flow chính):

1. Mở `.env.local`
2. Thêm `NEXT_PUBLIC_PITCH_MODE=1`

Để quay lại giao diện đầy đủ, đặt `NEXT_PUBLIC_PITCH_MODE=0` (hoặc xóa biến).

## Hardening cho tải lớn (100M+ users)

Để chạy an toàn ở quy mô lớn, app đã có thêm lớp chặn quá tải ở edge cho toàn bộ `/api/*` và tăng cường security headers.

Thiết lập thêm trong `.env.local` (và môi trường production):

- `RATE_LIMIT_UPSTASH_REDIS_REST_URL`
- `RATE_LIMIT_UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_GLOBAL_WINDOW_SEC` (mặc định: `60`)
- `RATE_LIMIT_GLOBAL_LIMIT_WRITE` (mặc định: `240` request / window / IP)
- `RATE_LIMIT_GLOBAL_LIMIT_READ` (mặc định: `1200` request / window / IP)
- `TRUSTED_PROXY_COUNT` (mặc định: `1`, số hop proxy tin cậy khi parse `x-forwarded-for`)

Khuyến nghị production:

- Luôn đặt app sau CDN/WAF (Cloudflare/Akamai/Fastly).
- Dùng Redis managed đa vùng để rate-limit phân tán (không dùng memory local).
- Bật monitoring cho `429`, `5xx`, và `x-rate-limit-mode` để phát hiện degraded mode.

## PHASE 2 - Polymorphic Data Ingestion Engine

Endpoint mới: `POST /api/ai/ingest`

Mục tiêu:

- Gom dữ liệu đa hình cho AI Coach: `text`, `image`, `video`, `pose`, `audio`, `progress`.
- Chuẩn hóa payload về định dạng thống nhất để dễ phân tích thời gian thực.

Ví dụ payload:

```json
{
  "modality": "video",
  "durationMs": 18000,
  "fps": 30,
  "frameCount": 540,
  "motionScore": 0.72,
  "keyframes": [{ "tsMs": 1200, "confidence": 0.89, "hint": "front kick" }]
}
```

## PHASE 8 - Core API Gateway

Endpoint mới: `GET|POST /api/gateway?target=<target>`

Mục tiêu:

- Làm cổng API trung tâm để frontend gọi vào 1 cửa.
- Allow-list target nội bộ (AI Coach, Checkout, Community, Ingest).
- Kế thừa rate limit + no-store + request-id để vận hành ổn định khi tải lớn.

Ví dụ target hiện có:

- `aiCoachAsk`, `aiCoachFeedback`
- `checkoutCreate`, `checkoutSession`
- `communityMessagesGet`, `communityMessagesSend`
- `aiIngest`

## PHASE 11 - Biometric Identity (Passkey)

Endpoint mới: `POST /api/auth/passkey`

Các action:

- `register_options`
- `register_verify`
- `login_options`
- `login_verify`
- `logout`

UI đã tích hợp trong khu vực hồ sơ (`UserAuthPanel`) để dùng Face ID / Touch ID / Windows Hello qua WebAuthn.

Biến môi trường khuyến nghị:

- `PASSKEY_RP_ID`
- `PASSKEY_RP_NAME`
- `PASSKEY_EXPECTED_ORIGINS` (danh sách origin, phân tách bằng dấu phẩy)
- `PASSKEY_UPSTASH_REDIS_REST_URL` (khuyến nghị cho multi-instance)
- `PASSKEY_UPSTASH_REDIS_REST_TOKEN` (khuyến nghị cho multi-instance)

Nếu không cấu hình Redis cho passkey, hệ thống sẽ fallback sang memory local (phù hợp demo/single-instance).

## PHASE 19 - Offline Mesh Transaction Network

UI mới: `OfflineMeshPanel` ở trang học tập.

Khả năng:

- Tạo gói dữ liệu tiến độ offline.
- Chia sẻ gần bằng QR / Web Share (`vovinam-mesh://...`).
- Nhập gói từ thiết bị khác.
- Xếp hàng sync khi offline và tự đồng bộ lại khi online qua gateway (`aiIngest`, modality `progress`).

Ghi chú: trình duyệt web không hỗ trợ mesh Bluetooth đầy đủ như app native; bản này dùng mô hình offline-first + near-share để đạt trải nghiệm tương đương cho phần lớn tình huống thực tế.

## Trạng thái kiến truc API

- Frontend da chuyen sang mo hinh `gateway-first` thong qua `lib/api/gatewayClient.js`.
- Tat ca call AI/Community/Auth quan trong di qua `GET|POST|PUT /api/gateway?target=...`.
- Rate limit phan tan va security headers duoc xu ly tai `proxy.js` (theo yeu cau Next.js 16, khong dung file middleware.js rieng).

## Resilience & Observability (moi)

Da bo sung co che retry/timeout/circuit-breaker cho upstream Stripe trong:

- `app/api/checkout/route.js`
- `app/api/checkout/session/route.js`

Helper dung chung:

- `lib/api/upstreamResilience.js`

Bien moi truong tuy chinh:

- `UPSTREAM_CB_FAILURE_THRESHOLD` (mac dinh `5`)
- `UPSTREAM_CB_OPEN_MS` (mac dinh `30000`)

Gateway co them header do tre:

- `x-gateway-latency-ms`

Bat audit log gateway (tuỳ chọn):

- `GATEWAY_AUDIT_LOG=1`

## Supabase Auth + RLS (Admin/Coach)

Khu vực `/admin` dùng **Supabase Auth** (Google OAuth hoặc Email OTP) và **RLS**.

### 1) Cấu hình env

1. Copy `.env.example` → `.env.local`
2. Điền:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

> Không đưa bất kỳ key bí mật nào vào biến `NEXT_PUBLIC_*`.

### 2) Tạo schema + bật RLS policy

Trong Supabase Dashboard → SQL Editor:

- Chạy file: `supabase/rls.sql`

File này tạo các bảng RBAC tối thiểu (`user_roles`, `coach_students`, ...) và bật RLS sao cho:

- **User** chỉ xem/sửa dữ liệu của chính mình.
- **Coach** chỉ thao tác trên học viên được phân công.
- **Admin** toàn quyền (bao gồm module học phí).

### 3) Bật Google OAuth / Email OTP

Supabase Dashboard → Authentication → Providers:

- Bật Google và/hoặc Email OTP.
- Thêm Redirect URL:
  - Local: `http://localhost:3000/auth/callback`
  - Prod: `https://<your-domain>/auth/callback`

### 4) Bootstrap role Admin/Coach

Sau khi tạo user trong Auth → Users, dùng snippet ở cuối `supabase/rls.sql` để set role:

- Đặt 1 user làm `admin`
- Đặt user khác làm `coach`
- Gán học viên cho coach qua bảng `coach_students`

## AI Coach (RAG Vector + Streaming)

AI Coach có 2 chế độ:

- **Vector RAG (khuyến nghị)**: Supabase Vector + OpenAI embeddings (trả lời grounded theo tài liệu đã ingest).
- **Fallback (RAG-lite)**: nếu chưa cấu hình OpenAI/Supabase Vector, vẫn trả lời dựa trên dữ liệu trong project.

### 1) Tạo schema Vector + Memory

Trong Supabase Dashboard → SQL Editor:

1. Chạy `supabase/rls.sql` (nếu chưa chạy)
2. Chạy `supabase/ai_rag.sql`

### 2) Cấu hình env

Trong `.env.local`:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

### 3) Ingest dữ liệu vào Vector DB

Chạy script (ở thư mục `vovinam-app/`):

```bash
node scripts/ingest-ai-kb.mjs --from project --reset --yes
```

Hoặc ingest từ thư mục tài liệu của bạn (md/txt):

```bash
node scripts/ingest-ai-kb.mjs --dir ./knowledge --source manual --belt lam-dai
```
