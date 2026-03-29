export const BELTS = [
  {
    id: "lam-dai-tu-ve",
    title: "Lam đai tự vệ",
    short: "Nhập môn",
    description:
      "Mở đầu với phản xạ an toàn, thoát hiểm cơ bản và tư thế phòng vệ trong thực chiến đời thường.",
    lessonLevel: "lam-dai-tu-ve",
    freeTier: true,
  },
  {
    id: "lam-dai",
    title: "Lam đai",
    short: "Nền tảng 1",
    description:
      "Củng cố tấn pháp, di chuyển và đòn cơ bản để tạo nền kỹ thuật sạch và ổn định.",
    lessonLevel: "lam-dai",
    freeTier: true,
  },
  {
    id: "lam-dai-nhat",
    title: "Lam đai nhất",
    short: "Nền tảng 2",
    description:
      "Tăng nhịp phối hợp tay chân, giữ trục và kiểm soát thăng bằng trong bài quyền cơ bản.",
    lessonLevel: "lam-dai-nhat",
    freeTier: true,
  },
  {
    id: "lam-dai-nhi",
    title: "Lam đai nhị",
    short: "Nền tảng 3",
    description:
      "Bổ sung chiến lược vào-ra cự ly và phản xạ phòng thủ khi đối phương chủ động tấn công.",
    lessonLevel: "lam-dai-nhi",
    freeTier: true,
  },
  {
    id: "lam-dai-tam",
    title: "Lam đai tam",
    short: "Nền tảng 4",
    description:
      "Hoàn thiện hệ lam đai với chuỗi quyền, phản đòn và khóa gỡ nền để lên cấp cao hơn.",
    lessonLevel: "lam-dai-tam",
    freeTier: false,
  },
  {
    id: "hoang-dai",
    title: "Hoàng đai",
    short: "Trung cấp 1",
    description:
      "Bước vào trung cấp với quyền chiến lược, phản đòn chủ động và chuyển đổi nhịp thi đấu.",
    lessonLevel: "hoang-dai",
    freeTier: false,
  },
  {
    id: "hoang-dai-nhat",
    title: "Hoàng đai nhất",
    short: "Trung cấp 2",
    description:
      "Nâng cấp trung cấp với đối luyện chiến lược theo tình huống và kiểm soát nhịp áp sát.",
    lessonLevel: "hoang-dai-nhat",
    freeTier: false,
  },
  {
    id: "hoang-dai-nhi",
    title: "Hoàng đai nhị",
    short: "Trung cấp 3",
    description:
      "Gia tăng khả năng phản đòn liên hoàn, thoát khóa nâng cao và đọc ý đồ đối phương.",
    lessonLevel: "hoang-dai-nhi",
    freeTier: false,
  },
  {
    id: "hoang-dai-tam",
    title: "Hoàng đai tam",
    short: "Trung cấp 4",
    description:
      "Hoàn thiện hệ hoàng đai với ứng dụng thực tế, kiểm soát áp lực và bản lĩnh chiến thuật.",
    lessonLevel: "hoang-dai-tam",
    freeTier: false,
  },
  {
    id: "hong-dai",
    title: "Hồng đai",
    short: "Cao cấp 1",
    description:
      "Khởi đầu cao cấp với quyền chuyên sâu, phản đòn chuẩn xác và quản trị nhịp đối kháng.",
    lessonLevel: "hong-dai",
    freeTier: false,
  },
  {
    id: "hong-dai-nhat",
    title: "Hồng đai nhất",
    short: "Cao cấp 2",
    description:
      "Mở rộng chiến lược đối luyện nhiều pha, kiểm soát cự ly và áp lực cường độ cao.",
    lessonLevel: "hong-dai-nhat",
    freeTier: false,
  },
  {
    id: "hong-dai-nhi",
    title: "Hồng đai nhị",
    short: "Cao cấp 3",
    description:
      "Tăng độ khó phản đòn, khóa gỡ và chuyển trạng thái công thủ ở tốc độ thi đấu.",
    lessonLevel: "hong-dai-nhi",
    freeTier: false,
  },
  {
    id: "hong-dai-tam",
    title: "Hồng đai tam",
    short: "Cao cấp 4",
    description:
      "Tập trung vào chiến thuật kiểm soát trận đấu, ra quyết định nhanh và chính xác.",
    lessonLevel: "hong-dai-tam",
    freeTier: false,
  },
  {
    id: "hong-dai-tu",
    title: "Hồng đai tứ",
    short: "Đỉnh cao",
    description:
      "Mức hoàn thiện cao nhất: tư duy võ đạo, kỹ thuật chuẩn mực và truyền dạy an toàn.",
    lessonLevel: "hong-dai-tu",
    freeTier: false,
  },
];

export const BELT_IDS = BELTS.map((b) => b.id);

export const FREE_BELT_IDS = BELTS.filter((b) => b.freeTier).map((b) => b.id);

export const BELT_FAMILIES = [
  { id: "lam", title: "Lam đai" },
  { id: "hoang", title: "Hoàng đai" },
  { id: "hong", title: "Hồng đai" },
];

export function getBeltById(id) {
  return BELTS.find((b) => b.id === id) || null;
}

export function getBeltFamilyId(beltId) {
  const id = String(beltId || "").trim().toLowerCase();
  if (!id) return "";
  if (id.startsWith("lam-")) return "lam";
  if (id.startsWith("hoang-")) return "hoang";
  if (id.startsWith("hong-")) return "hong";
  return "";
}

export function getBeltsByFamilyId(familyId) {
  const safeFamilyId = String(familyId || "").trim().toLowerCase();
  if (!safeFamilyId) return [];
  return BELTS.filter((belt) => getBeltFamilyId(belt.id) === safeFamilyId);
}

export function isFreeBeltId(id) {
  return FREE_BELT_IDS.includes(String(id || "").trim());
}
