## Vovinam Learning (Next.js)

Web app học Vovinam từ **cơ bản → trung cấp → nâng cao**.

Điểm chính:

- UI tối, nổi bật (xanh/cyan + điểm nhấn vàng), có hiệu ứng nền + hover.
- Có **lộ trình bài học**, **trang chi tiết bài**, **đánh dấu hoàn thành** (lưu local).
- Có **lịch tập 7 ngày** gợi ý theo cấp độ (lưu local).

> Lưu ý an toàn: Nội dung mang tính tham khảo & hỗ trợ tự luyện. Kỹ thuật khó nên có huấn luyện viên hướng dẫn.

## Chạy dự án

Trong thư mục `vovinam-app`, chạy:

```bash
npm run dev
```

Mở trình duyệt: http://localhost:3000

## Các trang chính

- Trang chủ: `app/page.js`
- Lộ trình: `app/lo-trinh/page.js`
- Bài học (dynamic route): `app/bai-hoc/[slug]/page.js`
- Lịch tập: `app/lich-tap/page.js`

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
