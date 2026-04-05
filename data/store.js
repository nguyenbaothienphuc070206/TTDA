export const PRODUCTS = [
  {
    id: "vo-phuc-basic",
    name: "Võ phục Vovinam (Basic)",
    priceVnd: 320000,
    category: "võ phục",
    summary: "Vải thoáng, form dễ mặc, phù hợp người mới.",
    badges: ["Phổ biến", "HLV khuyên dùng"],
    partnerName: "Shopee Mall",
    affiliateUrl: "https://shopee.vn/search?keyword=vo%20phuc%20vovinam",
    rating: 4.8,
    reviewCount: 218,
  },
  {
    id: "dai-lam",
    name: "Đai Lam (mẫu)",
    priceVnd: 80000,
    category: "phù hiệu/đai",
    summary: "Đai tập Lam đai, dùng cho giai đoạn nền tảng.",
    badges: ["Phổ biến"],
    partnerName: "Lazada Mall",
    affiliateUrl: "https://www.lazada.vn/catalog/?q=dai%20vovinam",
    rating: 4.7,
    reviewCount: 146,
  },
  {
    id: "bao-ho-ong-quyen",
    name: "Bảo hộ ống quyển",
    priceVnd: 190000,
    category: "bảo hộ",
    summary: "Êm, chắc, hỗ trợ tập đá an toàn hơn.",
    badges: ["An toàn", "HLV khuyên dùng"],
    partnerName: "Shopee Mall",
    affiliateUrl: "https://shopee.vn/search?keyword=bao%20ho%20ong%20quyen",
    rating: 4.9,
    reviewCount: 312,
  },
  {
    id: "con-nhua",
    name: "Côn nhựa tập luyện",
    priceVnd: 150000,
    category: "binh khí",
    weaponSlug: "con",
    summary: "Nhẹ, bền, phù hợp tập kỹ thuật cơ bản.",
    badges: ["Phổ biến"],
    partnerName: "Lazada Mall",
    affiliateUrl: "https://www.lazada.vn/catalog/?q=con%20tap%20vo",
    rating: 4.6,
    reviewCount: 97,
  },
  {
    id: "kiem-go",
    name: "Kiếm gỗ tập luyện",
    priceVnd: 260000,
    category: "binh khí",
    weaponSlug: "kiem",
    summary: "Dành cho luyện đường kiếm an toàn hơn so với kiếm kim loại.",
    badges: ["HLV khuyên dùng"],
    partnerName: "Shopee Mall",
    affiliateUrl: "https://shopee.vn/search?keyword=kiem%20go%20tap%20vo",
    rating: 4.7,
    reviewCount: 84,
  },
];

export function formatVnd(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString("vi-VN") + "₫";
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}
