# TTDA — Vovinam Learning (Next.js)

Web app học Vovinam từ **cơ bản → trung cấp → nâng cao**.

Điểm chính:

- UI tối, nổi bật (xanh/cyan + điểm nhấn vàng), có hiệu ứng nền + hover.
- Có **lộ trình bài học**, **trang chi tiết bài**, **đánh dấu hoàn thành** (lưu local).
- Có **lịch tập 7 ngày** gợi ý theo cấp độ (lưu local).
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
