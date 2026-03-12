export default function manifest() {
  return {
    name: "Vovinam Learning",
    short_name: "Vovinam",
    description:
      "App học Vovinam từ cơ bản đến nâng cao: lộ trình rõ ràng, bài tập từng bước, lưu tiến độ và lịch tập 7 ngày.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}