export const VIDEOS = [
  {
    id: "quyen-1",
    title: "Bài quyền số 1 (mẫu)",
    minutes: 8,
    beltId: "lam-dai",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    summary:
      "Video mẫu để demo chức năng hỏi nhanh kỹ thuật bằng RAG. Bạn có thể thay link YouTube thật sau.",
    transcript: [
      "Mở đầu: đứng tư thế chuẩn bị, giữ trục cơ thể thẳng và thở đều.",
      "Phần 1: di chuyển tiến/lùi ngắn, tay thủ luôn giữ cao, khuỷu gần thân.",
      "Phần 2: đòn tay thẳng – ra đòn gọn, thu tay về nhanh để bảo vệ cằm.",
      "Kết thúc: giãn cơ nhẹ vùng hông, gối, cổ chân; uống nước từ từ.",
    ],
    tags: ["tư thế", "di chuyển", "đòn tay"],
  },
  {
    id: "da-co-ban",
    title: "Đá tống trước (mẫu)",
    minutes: 6,
    beltId: "lam-dai",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    summary:
      "Trọng tâm: nâng gối đúng hướng, duỗi chân, thu về nhanh, không cố đá cao khi chưa kiểm soát.",
    transcript: [
      "Bước 1: tư thế thủ, trọng tâm ổn định.",
      "Bước 2: nâng gối (chân đá) lên trước, gối hướng thẳng.",
      "Bước 3: duỗi cẳng chân ra trước, thở ra ngắn.",
      "Bước 4: thu gối về trước khi đặt chân xuống để bảo vệ khớp.",
    ],
    tags: ["đòn chân", "thăng bằng", "gối"],
  },
  {
    id: "phan-don-1",
    title: "Phản đòn căn bản 1 (mẫu)",
    minutes: 10,
    beltId: "hoang-dai",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    summary:
      "Demo bài phản đòn: ưu tiên khoảng cách, thủ chắc, thao tác gọn và dừng đúng nhịp.",
    transcript: [
      "Mục tiêu: thủ an toàn trước, phản đòn sau.",
      "Dùng bước góc để tránh đứng trực diện.",
      "Khi phản đòn: ra đòn ngắn, thu về nhanh.",
    ],
    tags: ["phản đòn", "tự vệ", "khoảng cách"],
  },
];

export function getVideoById(id) {
  return VIDEOS.find((v) => v.id === id) || null;
}
