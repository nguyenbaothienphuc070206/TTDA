export const WEAPONS = [
  {
    slug: "con",
    title: "Côn",
    summary: "Vũ khí tập luyện giúp rèn tay-mắt, nhịp và kỷ luật an toàn khi vào binh khí.",
    history: [
      "Trong Vovinam, côn thường được đưa vào giai đoạn luyện tập nâng cao hơn để rèn nhịp, khoảng cách và sự kiểm soát lực.",
      "Tập côn không chỉ là ‘đánh cho mạnh’ mà là học cách giữ trục, đổi hướng mượt và dừng đúng điểm - đúng tinh thần võ đạo kỷ luật.",
    ],
    care: [
      "Lau khô sau buổi tập (nhất là côn gỗ/kim loại) để tránh ẩm mốc hoặc rỉ.",
      "Kiểm tra bề mặt, dằm gỗ và cạnh sắc trước khi tập; không tập khi vũ khí nứt/gãy.",
      "Tập ở không gian thoáng, đủ khoảng an toàn; ưu tiên tốc độ chậm trước khi tăng lực.",
    ],
    requiredBeltId: "hoang-dai",
  },
  {
    slug: "kiem",
    title: "Kiếm",
    summary: "Vũ khí đòi hỏi kiểm soát cao: đường kiếm, khoảng cách và an toàn tuyệt đối.",
    history: [
      "Kiếm trong chương trình binh khí nhấn mạnh sự chính xác, tiết chế và kiểm soát - mỗi đường kiếm đều phải ‘đúng, gọn, có điểm dừng’.",
      "Tập kiếm là bài học về kỷ luật: tôn trọng bạn tập, tuân thủ tín hiệu dừng và giữ an toàn như ưu tiên số một.",
    ],
    care: [
      "Cất kiếm trong bao/vỏ, tránh để cạnh va chạm làm mẻ hoặc cong lưỡi (nếu là kiếm kim loại).",
      "Không để kiếm nơi ẩm; nếu dùng kim loại, lau khô và bôi dầu mỏng định kỳ.",
      "Khi di chuyển/đổi bài, luôn hướng mũi kiếm xuống và giữ khoảng cách với người khác.",
    ],
    requiredBeltId: "hong-dai",
  },
];

export function getWeaponBySlug(slug) {
  const s = String(slug || "").trim().toLowerCase();
  return WEAPONS.find((w) => w.slug === s) || null;
}

