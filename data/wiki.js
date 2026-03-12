export const TECHNIQUE_CATEGORIES = [
  {
    id: "tan-phap",
    title: "Tấn pháp",
    description: "Tư thế và bộ tấn nền tảng để tạo lực và giữ thăng bằng.",
  },
  {
    id: "don-tay",
    title: "Đòn tay",
    description: "Đòn đấm, chỏ, gạt/chặn, thao tác tay cơ bản.",
  },
  {
    id: "don-chan",
    title: "Đòn chân",
    description: "Đòn đá căn bản, tăng dần theo biên độ và kiểm soát gối/hông.",
  },
  {
    id: "khoa-go",
    title: "Khóa gỡ",
    description: "Thoát nắm, kiểm soát khớp, ưu tiên tập nhẹ và có tín hiệu dừng.",
  },
  {
    id: "phan-don",
    title: "Phản đòn",
    description: "Phản xạ – góc bước – thủ chắc – phản nhanh gọn.",
  },
];

export const TECHNIQUES = [
  {
    slug: "tan-trung-binh",
    title: "Tấn trung bình",
    categoryId: "tan-phap",
    difficulty: "easy",
    tags: ["tấn", "thăng bằng", "gối"],
    summary:
      "Nền tảng cho hầu hết kỹ thuật: giữ trục thẳng, gối hướng theo mũi chân, trọng tâm ổn định.",
    steps: [
      "Hai chân rộng bằng vai, mũi chân hơi mở tự nhiên.",
      "Hạ trọng tâm nhẹ, gối không đổ vào trong.",
      "Siết bụng nhẹ, vai thả lỏng, mắt nhìn thẳng.",
      "Giữ 20–30 giây × 3 hiệp; thở đều.",
    ],
    mistakes: [
      "Gối chụm vào trong hoặc vượt mũi chân quá mức",
      "Gồng vai/cổ, nín thở",
      "Đổ người về trước khiến mất trục",
    ],
    safety: [
      "Đau gối: giảm độ hạ trọng tâm, ưu tiên đúng hướng gối",
      "Tập trước gương để tự chỉnh trục",
    ],
  },
  {
    slug: "dam-thang",
    title: "Đấm thẳng",
    categoryId: "don-tay",
    difficulty: "easy",
    tags: ["đấm", "thủ", "hông"],
    summary:
      "Đòn tay cơ bản: lực đi từ chân–hông–vai; ra đòn gọn và thu về nhanh.",
    steps: [
      "Tư thế thủ: cằm thấp, tay che mặt, khuỷu gần thân.",
      "Đấm theo trục thẳng, vai thả lỏng.",
      "Khi ra đòn: thở ra ngắn; cổ tay thẳng.",
      "Thu tay về ngay để trở lại thủ.",
    ],
    mistakes: [
      "Đấm bằng vai (gồng) thay vì dùng trục",
      "Khuỷu mở rộng làm hở sườn",
      "Không thu tay về, hạ tay thủ",
    ],
    safety: ["Giữ cổ tay thẳng để tránh đau", "Tập chậm rồi mới tăng tốc"],
  },
  {
    slug: "da-tong-truoc",
    title: "Đá tống trước",
    categoryId: "don-chan",
    difficulty: "easy",
    tags: ["đá", "gối", "thăng bằng"],
    summary:
      "Ưu tiên nâng gối đúng hướng, duỗi chân và thu về nhanh để bảo vệ khớp.",
    steps: [
      "Tư thế thủ, trọng tâm ổn định.",
      "Nâng gối lên trước (không mở hông sớm).",
      "Duỗi cẳng chân ra trước và thở ra.",
      "Thu gối về rồi đặt chân xuống nhẹ.",
    ],
    mistakes: [
      "Ngả người ra sau quá nhiều",
      "Đặt chân xuống mạnh gây đau gối",
      "Đá cao khi chưa kiểm soát tốt",
    ],
    safety: ["Tập bám tường để học thăng bằng", "Giảm biên độ nếu đau"],
  },
  {
    slug: "thoat-nam-co-tay",
    title: "Thoát nắm cổ tay",
    categoryId: "khoa-go",
    difficulty: "medium",
    tags: ["tự vệ", "thoát nắm", "góc"],
    summary:
      "Thoát nắm dựa vào điểm yếu (ngón cái) và bước góc để an toàn.",
    steps: [
      "Bình tĩnh, giữ trục, không giật mạnh.",
      "Xoay cổ tay hướng về phía ngón cái đối phương để thoát.",
      "Bước ra góc an toàn, giữ khoảng cách.",
      "Dừng và kiểm soát tình huống.",
    ],
    mistakes: [
      "Giật bẻ đột ngột gây chấn thương",
      "Đứng trực diện không bước góc",
      "Tập quá nhanh khi chưa thống nhất tín hiệu dừng",
    ],
    safety: ["Tập đôi phải có tín hiệu 'dừng'", "Lực nhẹ – đúng kỹ thuật"],
  },
  {
    slug: "phan-don-can-ban-1",
    title: "Phản đòn căn bản 1",
    categoryId: "phan-don",
    difficulty: "medium",
    tags: ["phản đòn", "thủ", "khoảng cách"],
    summary:
      "Nguyên tắc: thủ chắc → bước góc → phản gọn → thu về.",
    steps: [
      "Giữ tay thủ cao, khuỷu gần thân.",
      "Bước góc tránh đứng trực diện.",
      "Phản bằng đòn ngắn, dứt khoát.",
      "Thu về thủ, giữ khoảng cách.",
    ],
    mistakes: ["Ham phản đòn khi chưa thủ an toàn", "Bước góc chậm", "Đòn quá rộng"],
    safety: ["Tập chậm, có bạn tập", "Dừng khi mất kiểm soát"],
  },
];

export function getTechniqueBySlug(slug) {
  return TECHNIQUES.find((t) => t.slug === slug) || null;
}
