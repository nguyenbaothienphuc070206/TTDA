import { BELTS } from "./belts";

const HLS_DEMO_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const YOUTUBE_DEMO_ID = "M7lc1UVf-VE";

const VIDEO_TRACKS = [
  {
    id: "quyen",
    title: "Video quyền",
    query: "bai quyen",
    youtubeId: YOUTUBE_DEMO_ID,
    baseMinutes: 8,
    summary:
      "Video thực hành quyền theo đúng nhịp và chuyển tấn của cấp đai này.",
  },
  {
    id: "chien-luoc",
    title: "Video chiến lược",
    query: "chien luoc doi luyen",
    youtubeId: YOUTUBE_DEMO_ID,
    baseMinutes: 10,
    summary:
      "Video chiến lược vào - ra cự ly, quản trị nhịp và đọc ý đồ đối thủ.",
  },
  {
    id: "phan-don",
    title: "Video phản đòn",
    query: "phan don",
    youtubeId: YOUTUBE_DEMO_ID,
    baseMinutes: 11,
    summary:
      "Video mô tả chuỗi né - gạt - phản đòn theo đúng nguyên tắc an toàn.",
  },
  {
    id: "khoa-go",
    title: "Video khóa gỡ",
    query: "khoa go tu ve",
    youtubeId: YOUTUBE_DEMO_ID,
    baseMinutes: 12,
    summary:
      "Video khóa gỡ và thoát hiểm theo bài bản dành riêng cho cấp đai tương ứng.",
  },
];

function makeYoutubeEmbedUrl(videoId) {
  const id = String(videoId || "").trim();
  if (!id) return "";
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
}

function makeTranscript(trackTitle, beltTitle) {
  return [
    `Mục tiêu buổi này: chuẩn hóa ${trackTitle.toLowerCase()} cho ${beltTitle}.`,
    "Giữ nhịp thở đều và ưu tiên trục cơ thể ổn định.",
    "Tập chậm trước, tăng tốc sau khi động tác sạch.",
    "Nếu đau nhói hoặc mất kiểm soát, dừng ngay để đảm bảo an toàn.",
  ];
}

export const VIDEOS = BELTS.flatMap((belt, beltIndex) => {
  return VIDEO_TRACKS.map((track, trackIndex) => {
    const title = `${track.title} ${belt.title}`;
    const query = `Vovinam ${belt.title} ${track.query}`;

    return {
      id: `${belt.id}-${track.id}`,
      title,
      minutes: track.baseMinutes + Math.floor(beltIndex / 2) + trackIndex,
      beltId: belt.id,
      hlsUrl: HLS_DEMO_URL,
      embedUrl: makeYoutubeEmbedUrl(track.youtubeId),
      watchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      summary: `${track.summary} Từ khóa tìm kiếm video: ${query}.`,
      transcript: makeTranscript(track.title, belt.title),
      tags: [belt.title, track.title, "Vovinam"],
    };
  });
});

export function getVideoById(id) {
  return VIDEOS.find((v) => v.id === id) || null;
}