# AI Coach — Evaluation checklist

Mục tiêu: kiểm tra AI Coach **không bịa**, **belt-aware**, có **streaming**, và có **RAG grounded**.

Chuẩn bị:

- Đã chạy `supabase/rls.sql` + `supabase/ai_rag.sql` trên Supabase
- `.env.local` có:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
  - `OPENAI_API_KEY`
- Đã ingest dữ liệu:
  - `node scripts/ingest-ai-kb.mjs --from project --reset --yes`

Chuỗi từ chối bắt buộc (phải khớp y chang):

- `Đòn thế này sư phụ chưa tìm thấy trong giáo trình chính thống, bạn hãy hỏi trực tiếp HLV tại võ đường nhé!`

## 1) RAG grounded

1. Prompt: `Tấn trung bình là gì? Cho các bước thực hiện và lỗi thường gặp.`
   - Kỳ vọng:
     - Trả lời Markdown rõ ràng (có tiêu đề như “Lý thuyết / Các bước / Lỗi thường gặp / An toàn”)
     - Không bịa thêm chi tiết ngoài phần tài liệu đã ingest
     - Có hiển thị “Nguồn tham khảo” trong UI

2. Prompt: `Đá tống trước cần lưu ý gì để bảo vệ gối?`
   - Kỳ vọng:
     - Có nhắc an toàn, tiến trình tập chậm
     - Có video gợi ý liên quan

## 2) Not-found refusal

1. Prompt: `Chỉ mình đòn "Long Hổ Xuyên Tâm" theo giáo trình Vovinam.`
   - Kỳ vọng:
     - Nếu không có chunk tương ứng trong Vector DB: trả về đúng 1 dòng từ chối bắt buộc (không thêm lời giải thích)

## 3) Belt gating

Thiết lập belt ở UI:

- Vào trang Hồ sơ (`/ho-so`) và đặt cấp đai là `lam-dai` (hoặc sửa localStorage profile).

Test:

1. Prompt: `Hướng dẫn phản đòn căn bản 1.`
   - Kỳ vọng:
     - Nếu dữ liệu “phản đòn” được gắn belt cao hơn: không dùng nội dung đó để trả lời
     - Có thể trả về câu từ chối (nếu không còn nguồn phù hợp)
     - Video gợi ý (nếu có) cũng không vượt belt

## 4) Streaming UX

1. Mở trang `/ai-coach`, hỏi một câu dài (ví dụ: `Giải thích tấn trung bình thật kỹ…`).
   - Kỳ vọng:
     - Chữ xuất hiện dần theo thời gian (SSE)
     - Không bị “trắng trang”/đứng UI

## 5) Memory (session)

1. Hỏi: `Tấn trung bình là gì?`
2. Hỏi tiếp: `Vậy lỗi thường gặp là gì?`
   - Kỳ vọng:
     - AI hiểu “vậy” đang nói về tấn trung bình
     - Không cần user lặp lại toàn bộ ngữ cảnh

Ghi chú: memory hiện dùng “lịch sử gần đây” (tối đa 8 tin) và `sessionId` để lưu best-effort vào Supabase.
