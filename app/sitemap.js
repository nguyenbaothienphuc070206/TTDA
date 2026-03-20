import { LESSONS } from "@/data/lessons";
import { VIDEOS } from "@/data/videos";
import { TECHNIQUES } from "@/data/wiki";
import { WEAPONS } from "@/data/weapons";

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
      url: `${baseUrl}/learning`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
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
      url: `${baseUrl}/dau-truong-ai`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/thien-vo`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/ban-do-the-gioi`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${baseUrl}/bang-so`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.55,
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
      url: `${baseUrl}/cong-dong`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/impact-dashboard`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.55,
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

  const techniquePages = TECHNIQUES.map((t) => {
    return {
      url: `${baseUrl}/ky-thuat/${t.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    };
  });

  const weaponPages = WEAPONS.map((weapon) => {
    return {
      url: `${baseUrl}/binh-khi/${weapon.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.45,
    };
  });

  return [...staticPages, ...lessonPages, ...videoPages, ...techniquePages, ...weaponPages];
}
