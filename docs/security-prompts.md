# Security Prompts (Copy/Paste)

## 🛡️ Bước 1 — Security Architect (Kiến trúc bảo mật)

Bạn hãy đóng vai **Cyber Security Architect cấp cao**. Thiết kế mô hình bảo mật toàn diện cho hệ thống Web/App học Vovinam (Next.js App Router + Supabase).

Ràng buộc & bối cảnh:
- Client: Web/PWA (học viên), Admin portal (CLB), Trainer portal (HLV).
- Backend: Next.js API routes / server actions.
- Identity: Supabase Auth.
- Dữ liệu: PII (họ tên, SĐT, cấp đai), dữ liệu tập luyện (tiến độ, điểm danh), dữ liệu kỳ thi.
- Mục tiêu: Zero Trust, least privilege, khả năng truy vết, chống brute force/DDoS, không lộ PII.

Yêu cầu đầu ra (phải có):
1) **Zero Trust Architecture**
   - Trust boundaries, threat model ngắn gọn.
   - AuthN/AuthZ end-to-end.
   - Triển khai Supabase Auth + MFA (TOTP) bắt buộc cho **Trainer/Coach** (và Admin nếu nên).
   - Cách bắt buộc MFA ở tầng API và/hoặc RLS (gợi ý: AAL2 / AMR claims).

2) **Data Encryption**
   - In Transit: TLS, HSTS, cookie flags.
   - At Rest: chiến lược mã hoá trên Supabase Postgres và backup.
   - Nếu cần tìm kiếm theo SĐT: đề xuất mô hình **encrypt + hash** (encrypted phone + deterministic hash) và key rotation.

3) **API Security (Next.js)**
   - Chống SQL Injection, XSS, CSRF.
   - Validation chặt: schema validation, giới hạn payload, content-type.
   - Rate limiting, bot protection, logging/monitoring.
   - Security headers khuyến nghị (CSP strategy không phá Next.js).

4) **Checklist triển khai**
   - Checklist theo tuần (Week 1/2/3) và ưu tiên (P0/P1/P2).

## 🔐 Bước 2 — RBAC + RLS (Phân quyền & Quản lý)

Thiết kế hệ thống **RBAC tối ưu** cho app Vovinam với 4 vai trò:
- Admin (Chủ nhiệm CLB)
- Trainer (Huấn luyện viên)
- Student (Võ sinh)
- Guest (Khách)

Yêu cầu đầu ra:
1) Ma trận quyền (Create/Read/Update/Delete) cho các tài nguyên: profile, attendance, exams, content, store/orders, audit logs.
2) Mô hình bảng Supabase (Postgres) tối thiểu để hỗ trợ RBAC + quan hệ Trainer↔Student.
3) **Row Level Security (RLS)**:
   - Student chỉ xem/sửa dữ liệu của chính mình.
   - Trainer chỉ xem/sửa học viên được phân công.
   - Admin full quyền.
   - Ví dụ SQL policies cụ thể.
4) **EQ / UX**:
   - Thiết kế thông báo bị từ chối truy cập lịch sự (thay vì 403 khô khan).
   - Ví dụ: "Bạn cần đạt Lam đai để mở khóa kỹ thuật này".

## 🚀 Bước 3 — DevSecOps (Backup/DR + Rate Limit + Audit Logs)

Bạn hãy đóng vai **DevSecOps Lead**. Thiết kế quy trình vận hành an toàn, chống sự cố.

Yêu cầu đầu ra:
1) **Backup & Disaster Recovery**
   - RPO/RTO đề xuất.
   - Tự động backup hằng ngày, lưu nơi biệt lập (S3/GCS), mã hoá, retention.
   - Quy trình restore + drill định kỳ.

2) **Rate Limiting**
   - Code mẫu cho Next.js API route: giới hạn request/IP chống brute force/DDoS.
   - Gợi ý kiến trúc production (Redis/Upstash) + fallback.

3) **Audit Logs**
   - Thiết kế bảng audit log, chính sách append-only.
   - Ghi lại hành động quan trọng: ai đổi kết quả thi thăng đai của võ sinh X.
   - Cách hiển thị/tra cứu (admin only) + retention.
