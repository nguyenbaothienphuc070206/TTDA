import { LESSONS } from "@/data/lessons";
import { VIDEOS } from "@/data/videos";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const lastModified = new Date();

  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/hoc-tap`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/lo-trinh`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/video`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/ky-thuat`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/tien-do`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/ai-coach`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lich-tap`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dinh-duong`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cua-hang`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ho-so`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/chinh-sach-bao-mat`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dieu-khoan`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const lessonPages = LESSONS.map((lesson) => {
    return {
      url: `${baseUrl}/bai-hoc/${lesson.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  const videoPages = VIDEOS.map((video) => {
    return {
      url: `${baseUrl}/video/${video.id}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.55,
    };
  });

  return [...staticPages, ...lessonPages, ...videoPages];
}
