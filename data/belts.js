export const BELTS = [
  {
    id: "lam-dai",
    title: "Lam đai",
    short: "Nền tảng",
    description:
      "Giai đoạn làm quen tư thế, di chuyển, đòn tay/chân căn bản và thói quen tập an toàn.",
    lessonLevel: "co-ban",
  },
  {
    id: "hoang-dai",
    title: "Hoàng đai",
    short: "Kết hợp",
    description:
      "Giai đoạn phối hợp kỹ thuật, phản xạ và tự vệ cơ bản; tăng sức bền và kiểm soát nhịp thở.",
    lessonLevel: "trung-cap",
  },
  {
    id: "huyen-dai",
    title: "Huyền đai",
    short: "Ứng dụng",
    description:
      "Giai đoạn nâng cao ứng dụng, chuỗi kỹ thuật, đối luyện và phát triển sức mạnh – phục hồi.",
    lessonLevel: "nang-cao",
  },
];

export function getBeltById(id) {
  return BELTS.find((b) => b.id === id) || null;
}
