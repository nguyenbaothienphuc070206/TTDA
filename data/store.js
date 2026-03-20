export const PRODUCTS = [
  {
    id: "vo-phuc-basic",
    name: "Võ phục Vovinam (Basic)",
    priceVnd: 320000,
    category: "võ phục",
    summary: "Vải thoáng, form dễ mặc, phù hợp người mới.",
    badges: ["Bán chạy"],
    partnerName: "Đối tác",
    affiliateUrl: "https://example.com/?product=vo-phuc-basic",
  },
  {
    id: "dai-lam",
    name: "Đai Lam (mẫu)",
    priceVnd: 80000,
    category: "phù hiệu/đai",
    summary: "Đai tập Lam đai, dùng cho giai đoạn nền tảng.",
    badges: ["Phổ biến"],
    partnerName: "Đối tác",
    affiliateUrl: "https://example.com/?product=dai-lam",
  },
  {
    id: "bao-ho-ong-quyen",
    name: "Bảo hộ ống quyển",
    priceVnd: 190000,
    category: "bảo hộ",
    summary: "Êm, chắc, hỗ trợ tập đá an toàn hơn.",
    badges: ["An toàn"],
    partnerName: "Đối tác",
    affiliateUrl: "https://example.com/?product=bao-ho-ong-quyen",
  },
  {
    id: "con-nhua",
    name: "Côn nhựa tập luyện",
    priceVnd: 150000,
    category: "binh khí",
    weaponSlug: "con",
    summary: "Nhẹ, bền, phù hợp tập kỹ thuật cơ bản.",
    badges: [],
    partnerName: "Đối tác",
    affiliateUrl: "https://example.com/?product=con-nhua",
  },
  {
    id: "kiem-go",
    name: "Kiếm gỗ tập luyện",
    priceVnd: 260000,
    category: "binh khí",
    weaponSlug: "kiem",
    summary: "Dành cho luyện đường kiếm an toàn hơn so với kiếm kim loại.",
    badges: ["Kỷ luật"],
    partnerName: "Đối tác",
    affiliateUrl: "https://example.com/?product=kiem-go",
  },
];

export function formatVnd(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString("vi-VN") + "₫";
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}
