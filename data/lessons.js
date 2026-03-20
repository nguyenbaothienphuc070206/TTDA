import { BELTS } from "./belts";

export const LEVELS = BELTS.map((belt, idx) => ({
  id: belt.lessonLevel,
  title: belt.title,
  short: belt.short,
  description: belt.description,
  order: idx,
}));

const LESSON_TRACKS = [
  {
    id: "quyen",
    title: "Quyền",
    baseMinutes: 18,
    summary:
      "Rèn quyền trọng tâm của cấp đai này để chuẩn hóa nhịp, trục và khí lực khi lên bài.",
    goals: [
      "Thuộc bố cục bài quyền theo đúng nhịp",
      "Giữ trục cơ thể ổn định khi chuyển tấn",
      "Ra đòn dứt khoát và thu về đúng thế thủ",
    ],
    steps: [
      "Khởi động khớp cổ chân, gối, hông, vai trong 6-8 phút.",
      "Chia bài quyền thành cụm ngắn, tập chậm đúng biên độ.",
      "Nối cụm theo nhịp thở, ưu tiên ổn định trước khi tăng tốc.",
      "Quay video 15-20 giây để tự kiểm tra trục và nhịp.",
    ],
    mistakes: [
      "Ra đòn nhanh nhưng thiếu trục và mất thăng bằng",
      "Nhảy nhịp trong đoạn chuyển tấn",
      "Đánh mạnh quá sớm làm hụt hơi ở nửa sau bài quyền",
    ],
    tips: [
      "Tập theo nhịp 1-2-3, không tăng tốc khi động tác chưa sạch",
      "Nếu hụt hơi: giảm biên độ 10-15% và giữ nhịp thở đều",
    ],
  },
  {
    id: "chien-luoc",
    title: "Chiến lược",
    baseMinutes: 20,
    summary:
      "Luyện tư duy khoảng cách, nhịp độ và lựa chọn đòn an toàn theo bối cảnh đối luyện.",
    goals: [
      "Nhận diện đúng cự ly xa - trung - gần",
      "Điều khiển nhịp vào ra thay vì đứng yên đổi đòn",
      "Ra quyết định 1-2 phương án rõ ràng trong mỗi pha",
    ],
    steps: [
      "Mở bài bằng 2 phút di chuyển giữ cự ly và tay thủ.",
      "Tập tình huống đối phương áp sát: cắt góc rồi phản 1 nhịp.",
      "Tập tình huống đối phương lùi sâu: dồn nhịp có kiểm soát.",
      "Kết thúc bằng 1 hiệp ôn chiến lược ở tốc độ 60-70%.",
    ],
    mistakes: [
      "Đuổi theo đối phương theo đường thẳng quá lâu",
      "Đổi đòn theo cảm tính, không có ý đồ rõ",
      "Đứng cao người, mất trọng tâm khi đổi hướng",
    ],
    tips: [
      "Mỗi hiệp chỉ giữ 1 mục tiêu chiến thuật chính",
      "Ưu tiên vị trí và khoảng cách đúng trước lực ra đòn",
    ],
  },
  {
    id: "phan-don",
    title: "Phản đòn",
    baseMinutes: 22,
    summary:
      "Chuẩn hóa chuỗi né - gạt - phản đòn để bảo toàn an toàn và hiệu quả trong thực chiến.",
    goals: [
      "Né đòn tối thiểu nhưng đủ an toàn",
      "Gạt đòn đúng góc, không mở sườn",
      "Phản đòn ngắn gọn và trở về thủ ngay",
    ],
    steps: [
      "Bắt đầu với nhịp chậm: đối tác ra đòn giả định hướng.",
      "Thực hiện chuỗi né - gạt - phản theo đúng thứ tự.",
      "Tăng tốc dần nhưng giữ biên độ kiểm soát.",
      "Đổi vai trò để cả hai đều tập đủ lượt phản.",
    ],
    mistakes: [
      "Né quá rộng làm mất cơ hội phản",
      "Gạt bằng cổ tay đơn lẻ, thiếu khung cẳng tay",
      "Phản đòn xong quên về thủ",
    ],
    tips: [
      "Giữ cằm thấp, mắt nhìn ngực đối phương để đọc ý đồ",
      "Chỉ tăng tốc khi cả hai đã thống nhất tín hiệu dừng",
    ],
  },
  {
    id: "khoa-go",
    title: "Khóa gỡ",
    baseMinutes: 24,
    summary:
      "Luyện kỹ thuật khóa gỡ theo nguyên tắc an toàn khớp và thoát hiểm thực dụng.",
    goals: [
      "Thoát nắm cổ tay/cổ áo đúng hướng yếu",
      "Khóa kiểm soát với lực vừa đủ",
      "Thoát khóa và tạo khoảng cách an toàn",
    ],
    steps: [
      "Thỏa thuận tín hiệu dừng với bạn tập trước khi vào bài.",
      "Tập thoát nắm theo điểm yếu ngón cái ở nhịp chậm.",
      "Thêm bước góc để giảm lực đối kháng trực diện.",
      "Kết thúc bằng bài reset tư thế và kiểm tra an toàn khớp.",
    ],
    mistakes: [
      "Bẻ/giật đột ngột gây đau khớp bạn tập",
      "Đứng vuông góc quá lâu, không bước góc",
      "Quên kiểm soát nhịp thở nên nhanh xuống sức",
    ],
    tips: [
      "Luôn tập lực nhẹ trước, kỹ thuật đúng sau đó mới tăng tốc",
      "Nếu thấy đau nhói ở cổ tay/khuỷu: dừng ngay và giảm lực",
    ],
  },
];

function makeTitle(trackTitle, beltTitle) {
  return `${trackTitle} ${beltTitle}`;
}

function makeSlug(beltId, trackId) {
  return `${beltId}-${trackId}`;
}

function makeMinutes(baseMinutes, beltIndex, trackIndex) {
  const beltBoost = Math.floor(beltIndex / 2);
  const trackBoost = trackIndex;
  return baseMinutes + beltBoost + trackBoost;
}

function makeSummary(trackSummary, beltTitle) {
  return `${trackSummary} Trọng tâm của ${beltTitle}: kỷ luật kỹ thuật, an toàn và tiến bộ ổn định.`;
}

function withBeltContext(lines, beltTitle) {
  return (Array.isArray(lines) ? lines : []).map((line) => {
    return `${line} (${beltTitle})`;
  });
}

export const LESSONS = BELTS.flatMap((belt, beltIndex) => {
  return LESSON_TRACKS.map((track, trackIndex) => {
    const title = makeTitle(track.title, belt.title);

    return {
      slug: makeSlug(belt.id, track.id),
      level: belt.lessonLevel,
      beltId: belt.id,
      title,
      minutes: makeMinutes(track.baseMinutes, beltIndex, trackIndex),
      summary: makeSummary(track.summary, belt.title),
      goals: withBeltContext(track.goals, belt.title),
      steps: withBeltContext(track.steps, belt.title),
      mistakes: withBeltContext(track.mistakes, belt.title),
      tips: withBeltContext(track.tips, belt.title),
      tags: [belt.title, track.title, "Vovinam"],
    };
  });
});

export function getLessonBySlug(slug) {
  return LESSONS.find((l) => l.slug === slug) || null;
}

export function getLessonsByLevel(levelId) {
  return LESSONS.filter((l) => l.level === levelId);
}

export function getLessonsByBeltId(beltId) {
  const safe = String(beltId || "").trim();
  if (!safe) return [];
  return LESSONS.filter((l) => l.beltId === safe);
}