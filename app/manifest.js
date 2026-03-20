export default function manifest() {
  return {
    name: "Vovinam Learning",
    short_name: "Vovinam",
    description:
      "App học Vovinam theo hệ 14 cấp đai: lộ trình rõ ràng, bài tập từng bước, lưu tiến độ và lịch tập 7 ngày.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#f1f5f9",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}