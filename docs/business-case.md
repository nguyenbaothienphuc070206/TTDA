# Vovinam Learning — Business case (Pitch)

Mục tiêu: có 1 trang “nói chuyện với hội đồng” (mô hình doanh thu, vai trò team, vận hành/chi phí, break-even).

## 1) Sản phẩm & giá trị

Vovinam Learning là web app học Vovinam theo cấp đai (Lam → Hoàng → Huyền) với:

- Wiki kỹ thuật + video minh hoạ
- AI Coach (RAG) để hỏi lỗi thường gặp, lưu ý an toàn
- Lịch thi đấu & sự kiện (feed nhỏ)

Nguyên tắc: ưu tiên **an toàn**, nội dung **có nguồn** (RAG), và trải nghiệm **tự học có hướng dẫn**.

## 2) Mô hình doanh thu (Profit)

### A) Freemium / Premium

- Freemium: mở nội dung nền tảng (Lam đai), giúp người dùng vào app “không rào cản”.
- Premium: mở nội dung nâng cao (Hoàng/Huyền) + AI Coach.

Ghi chú triển khai:

- Hiện tại trong project, Premium là demo (lưu local). Khi triển khai thật: Stripe Subscription + entitlement lưu DB (ví dụ Supabase) để đồng bộ đa thiết bị.

### B) Affiliate (Cửa hàng)

- Cửa hàng đóng vai trò “giới thiệu đồ tập/đồ bảo hộ” (găng, đích, bảo vệ gối…), điều hướng qua link đối tác.
- App hiển thị disclosure (minh bạch affiliate).

## 3) Vai trò & teamwork (đủ để trình bày kiểu senior)

### CTO / Tech Lead

- Thiết kế kiến trúc (Next.js App Router, i18n, data layer, quyền truy cập Premium).
- Chất lượng: code review, lint/build, chuẩn hoá patterns (local profile/event sync).
- Security/Privacy: RLS cho admin/coach, quy tắc không lộ key, kiểm soát prompt/RAG.
- CI/CD & vận hành: deploy, environment, theo dõi lỗi.

### Product / PM

- Định nghĩa scope MVP (Wiki + Video + AI Coach + Feed sự kiện).
- Viết user story: “tự học tại nhà”, “xem kỹ thuật đúng”, “hỏi lỗi thường gặp”.
- Xây roadmap: nội dung theo cấp đai, retention (nhắc tập).

### Content Owner (HLV/Chuyên môn)

- Chuẩn hoá giáo trình, gắn nhãn theo cấp đai.
- Review nội dung an toàn: chống bịa, tránh hướng dẫn nguy hiểm.

### UI/UX

- Thiết kế flow xem kỹ thuật/video, và upsell Premium “không gây khó chịu”.
- Tối ưu mobile-first.

### Growth/Partnership

- Tìm đối tác affiliate (dụng cụ tập), quản lý link/commission.
- SEO nội dung nền tảng (Freemium) để kéo organic.

## 4) Maintenance & chi phí vận hành

> Lưu ý: số liệu phụ thuộc nhà cung cấp và có thể thay đổi. Dùng phần này như khung tính + ví dụ minh hoạ, rồi cập nhật theo bảng giá hiện tại.

### A) Nhóm chi phí cố định (tháng)

- Hosting (Next.js): Vercel/Netlify/Render
- Database/Auth/Vector (nếu dùng RAG thật): Supabase
- Domain
- Monitoring/logging (tối thiểu: error tracking)

### B) Nhóm chi phí biến đổi

- AI usage: token (chat) + embeddings (ingest/update tài liệu)
- Storage/egress (nếu tự host video; nếu dùng YouTube embed thì gần như 0)

### C) Break-even (hoà vốn)

Ký hiệu:

- $C_{fixed}$: chi phí cố định/tháng
- $c_{var}$: chi phí biến đổi trung bình / 1 user Premium / tháng
- $P$: giá Premium / tháng
- $N$: số user Premium cần để hoà vốn

Công thức:

$$N = \lceil \frac{C_{fixed}}{P - c_{var}} \rceil$$

Ví dụ minh hoạ (thay bằng số thật khi thuyết trình):

- $C_{fixed}=1{,}000{,}000$ VND/tháng
- $c_{var}=5{,}000$ VND/user/tháng (AI usage nhẹ)
- $P=49{,}000$ VND/tháng

Khi đó:

- $N = \lceil 1{,}000{,}000 / (49{,}000-5{,}000) \rceil = 23$ user Premium

Gợi ý cách trình bày:

- Nếu chưa muốn “đặt giá”, có thể trình bày theo 2 kịch bản (giá thấp / giá trung) và cho $N$ tương ứng.

## 5) Rủi ro chính & cách giảm rủi ro

- Nội dung sai gây chấn thương: ưu tiên RAG grounded + cảnh báo an toàn + khuyến nghị tập với HLV.
- Chi phí AI tăng: đặt rate limit, cache, chỉ mở AI Coach cho Premium.
- Đồng bộ entitlement đa thiết bị: chuyển entitlement khỏi localStorage sang DB.
