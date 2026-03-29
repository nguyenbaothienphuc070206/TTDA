import Link from "next/link";
import { getLocale } from "next-intl/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faCalendarCheck,
  faCalendarDays,
  faChartLine,
  faDumbbell,
  faGaugeHigh,
  faHeartPulse,
  faLock,
  faPersonRunning,
  faRoute,
  faShieldHalved,
  faUsers,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

import { BELTS } from "@/data/belts";
import { LEVELS, LESSONS, getLessonsByLevel } from "@/data/lessons";
import { NEWS } from "@/data/news";
import JsonLd from "@/components/JsonLd";
import RouteWarmup from "@/components/RouteWarmup";

export const metadata = {
  title: "Vovinam Learning - Học Vovinam Theo Lộ Trình",
  description:
    "Nền tảng học Vovinam theo lộ trình rõ ràng: bài học từng bước, video kỹ thuật, lịch tập 7 ngày và theo dõi tiến độ.",
  openGraph: {
    title: "Vovinam Learning",
    description:
      "Học Vovinam theo cấp đai với trải nghiệm hiện đại, rõ ràng, tối ưu cho tự luyện và phát triển kỹ thuật.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vovinam Learning",
    description:
      "Lộ trình Vovinam đầy đủ từ nền tảng đến nâng cao, kèm lịch tập và tiến độ cá nhân.",
  },
};

function ChipLink({ href, children }) {
  const cls =
    "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30";

  if (String(href || "").startsWith("/")) {
    return (
      <Link href={href} prefetch className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={cls}
    >
      {children}
    </a>
  );
}

function SectionHeading({ id, title, description, right }) {
  return (
    <div
      id={id}
      className="flex scroll-mt-28 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="surface-card enterprise-shell ui3d-card group relative overflow-hidden rounded-3xl p-5 transition duration-300 hover:bg-white/10">
      <div className="accent-line absolute left-6 right-6 top-0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start gap-4">
        <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-linear-to-br from-cyan-300/20 to-blue-500/10 text-cyan-100">
          {icon ? <span className="text-lg">{icon}</span> : null}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, title, description, bullets }) {
  return (
    <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="pulse-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-300 to-blue-500 text-sm font-extrabold text-slate-950">
          {step}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>

      {Array.isArray(bullets) && bullets.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-300">
          {bullets.map((b, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

function LessonPreviewCard({ lesson, levelTitle }) {
  return (
    <Link
      href={`/bai-hoc/${lesson.slug}`}
      className="surface-card enterprise-shell ui3d-card group relative overflow-hidden rounded-3xl p-5 transition duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Pill>{levelTitle}</Pill>
          <Pill>{lesson.minutes} phút</Pill>
        </div>
        <h3 className="mt-3 text-base font-semibold text-white group-hover:text-white">
          {lesson.title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{lesson.summary}</p>

        <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-white">
          Xem bài →
        </div>
      </div>
    </Link>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="surface-card ui3d-card group rounded-3xl p-5 open:bg-white/10">
      <summary className="cursor-pointer list-none text-sm font-semibold text-white outline-none">
        <div className="flex items-center justify-between gap-3">
          <span>{q}</span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition group-open:rotate-45">
            +
          </span>
        </div>
      </summary>
      <p className="mt-3 text-sm leading-7 text-slate-300">{a}</p>
    </details>
  );
}

function Stat({ label, value }) {
  return (
    <div className="surface-card ui3d-card rounded-2xl p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

function MotivationStrip({ title, message, chips }) {
  const safeChips = Array.isArray(chips) ? chips.filter(Boolean).slice(0, 3) : [];

  return (
    <section className="surface-card enterprise-shell ui3d-card mt-6 rounded-3xl p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
      {safeChips.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {safeChips.map((chip) => (
            <div
              key={chip}
              className="rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-xs font-semibold text-slate-200"
            >
              {chip}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function LevelPreview({ level }) {
  const lessons = getLessonsByLevel(level.id);

  return (
    <div className="surface-card enterprise-shell ui3d-card relative overflow-hidden rounded-3xl p-6 transition hover:bg-white/10">
      <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{level.title}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
            {lessons.length} bài
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {level.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {lessons.slice(0, 2).map((l) => (
            <span
              key={l.slug}
              className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-200"
            >
              {l.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeltPreview({ belt }) {
  const isHighest = belt?.id === BELTS[BELTS.length - 1]?.id;

  return (
    <Link
      href="/hoc-tap"
      className={
        "group enterprise-shell ui3d-card relative overflow-hidden rounded-3xl border p-6 transition duration-300 focus:outline-none focus:ring-2 " +
        (isHighest
          ? "border-amber-300/25 bg-slate-950/30 backdrop-blur-xl shadow-(--shadow-card) hover:bg-slate-950/20 focus:ring-amber-300/30"
          : "surface-card hover:bg-white/10 focus:ring-cyan-300/30")
      }
    >
      <div
        className={
          "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 " +
          (isHighest
            ? "bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]")
        }
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{belt.title}</h3>
          <span
            className={
              "rounded-full border px-2.5 py-1 text-xs font-semibold " +
              (isHighest
                ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
                : "border-white/10 bg-white/5 text-slate-200")
            }
          >
            {belt.short}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{belt.description}</p>
        <div
          className={
            "mt-4 text-sm font-semibold transition group-hover:text-white " +
            (isHighest ? "text-amber-200" : "text-cyan-200")
          }
        >
          Xem khóa học →
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ item }) {
  const kind = typeof item?.kind === "string" ? item.kind : "";

  return (
    <Link
      href={item.href}
      className="surface-card enterprise-shell ui3d-card group relative overflow-hidden rounded-3xl p-5 transition duration-300 hover:border-amber-300/20 focus:outline-none focus:ring-2 focus:ring-amber-300/30"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Pill>{kind || "Sự kiện"}</Pill>
          <Pill>{item.date}</Pill>
        </div>
        <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{item.summary}</p>
        <div className="mt-4 text-sm font-semibold text-amber-200 transition group-hover:text-white">
          Xem thêm →
        </div>
      </div>
    </Link>
  );
}

function MobileQuickActions({ startLabel, scheduleLabel }) {
  return (
    <div className="mobile-quick-actions sm:hidden">
      <div className="surface-card-strong enterprise-shell ui3d-card grid grid-cols-2 gap-2 rounded-2xl p-2">
        <Link
          href="/lo-trinh"
          className="cta-primary inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold"
        >
          {startLabel}
        </Link>
        <Link
          href="/lich-tap"
          className="cta-secondary inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold text-white"
        >
          {scheduleLabel}
        </Link>
      </div>
    </div>
  );
}

function buildHomeJsonLd(locale) {
  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "https://vovinam-learning.vn").replace(/\/$/, "");
  const localeId = String(locale || "vi").toLowerCase();
  const pagePath = localeId === "vi" ? "/" : `/${localeId}`;
  const pageUrl = `${siteUrl}${pagePath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Vovinam Learning",
        inLanguage: localeId,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/learning?query={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Vovinam Learning",
        url: siteUrl,
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Vovinam Learning Home",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        inLanguage: localeId,
        description:
          "Trang chủ học Vovinam với lộ trình, kỹ thuật, video và kế hoạch luyện tập theo tuần.",
      },
      {
        "@type": "ItemList",
        name: "Featured Lessons",
        itemListElement: LESSONS.slice(0, 6).map((lesson, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/bai-hoc/${lesson.slug}`,
          name: lesson.title,
        })),
      },
    ],
  };
}

function HomeVi() {
  const featured = BELTS.slice(0, 6)
    .map((belt) => getLessonsByLevel(belt.lessonLevel)[0])
    .filter(Boolean);

  const levelTitleById = Object.fromEntries(
    LEVELS.map((l) => [l.id, l.title])
  );

  return (
    <div className="ui3d-stage mobile-safe-bottom mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <RouteWarmup />
      <JsonLd data={buildHomeJsonLd("vi")} />
      <section className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card hero-noise hero-compact relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_58%)]" />
        <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl float-fast motion-gradient-orb" />
        <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl float-slower motion-gradient-orb" />
        <div className="relative">
          <div className="accent-line" />
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            Lộ trình rõ ràng • Từng bước dễ tập • Lưu tiến độ
          </p>

          <h1 className="headline-gradient motion-gradient-title hero-title-enterprise mt-3 max-w-3xl font-semibold">
            Học Vovinam theo lộ trình đầy đủ từ Lam đai tự vệ đến Hồng đai tứ
          </h1>
          <p className="hero-subtitle-enterprise mt-2 max-w-2xl text-slate-300">
            Mỗi bài có mục tiêu, hướng dẫn từng bước, lỗi thường gặp và gợi ý tự
            luyện. Bạn có thể đánh dấu hoàn thành để theo dõi tiến độ.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/lo-trinh"
              className="cta-primary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              Bắt đầu học
            </Link>
            <Link
              href="/lich-tap"
              className="cta-secondary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              Tạo lịch tập 7 ngày
            </Link>
          </div>

        </div>
      </section>

      <MotivationStrip
        title="Bạn không cần hoàn hảo, bạn cần đều đặn"
        message="Nếu hôm nay chỉ tập được 15-20 phút cũng rất tốt. Một buổi gọn gàng, đúng kỹ thuật luôn có giá trị hơn tập nhiều mà rối form."
        chips={[
          "Hoàn thành 1 bài là đã thắng",
          "Giữ form trước khi tăng tốc",
          "Mệt thì giảm nhịp, không bỏ hẳn",
        ]}
      />

      <section className="mt-10">
        <SectionHeading
          id="vo-dao"
          title="Tinh thần võ đạo"
          description="Tập để khỏe - tự tin - kỷ luật. Tập đúng kỹ thuật và giữ tâm thế bình tĩnh." 
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Kỷ luật & đều đặn"
            description="Tập đều quan trọng hơn tập nặng. Tăng dần nhẹ mỗi tuần để bền." 
            icon={<FontAwesomeIcon icon={faCalendarCheck} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Tôn trọng & tự vệ"
            description="Mục tiêu là tự bảo vệ và kiểm soát bản thân, không phô trương hay gây hấn." 
            icon={<FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />}
          />
          <FeatureCard
            title="An toàn là ưu tiên"
            description="Khởi động kỹ, tập chậm, dừng khi đau nhói. Kỹ thuật khó nên có HLV." 
            icon={<FontAwesomeIcon icon={faHeartPulse} className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="khoa-hoc"
          title="Khóa học theo cấp đai"
          description="Chia theo đầy đủ hệ đai để bạn biết đang ở giai đoạn nào và học gì tiếp theo." 
          right={
            <Link
              href="/hoc-tap"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Vào dashboard →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {BELTS.map((b) => (
            <BeltPreview key={b.id} belt={b} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="tin-tuc"
          title="Lịch thi đấu & sự kiện"
          description="Feed nhỏ cập nhật lịch thi đấu, đăng ký và nhắc lịch quan trọng." 
          right={
            <Link
              href="/lich-tap"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Tạo lịch tập →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {NEWS.slice(0, 3).map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          id="tinh-nang"
          title="Tính năng nổi bật"
          description="Tập trung vào thứ bạn cần khi tự luyện: rõ ràng, dễ theo dõi và an toàn."
          right={
            <Link
              href="/lo-trinh"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Vào lộ trình →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Bài học từng bước"
            description="Mỗi bài có mục tiêu, bước tập, lỗi thường gặp và gợi ý để bạn tập đúng." 
            icon={<FontAwesomeIcon icon={faBookOpen} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Lưu tiến độ tự động"
            description="Bấm “Đánh dấu hoàn thành” để theo dõi bạn đã học tới đâu (lưu ngay trên máy)."
            icon={<FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Lịch tập 7 ngày"
            description="Tạo lịch theo cấp đai + số buổi/tuần + thời lượng. Dễ duy trì thói quen." 
            icon={<FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Thiết kế sáng rõ"
            description="UI sáng, chữ rõ, nút lớn dễ bấm. Nhìn lâu không mỏi và không rối mắt."
            icon={<FontAwesomeIcon icon={faGaugeHigh} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Tối ưu bảo mật"
            description="Bật security headers, tắt X-Powered-By, có robots/sitemap và trang chính sách." 
            icon={<FontAwesomeIcon icon={faLock} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Nhẹ và nhanh"
            description="Trang chủ chủ yếu render tĩnh; nội dung bài học nằm trong data nên tải nhanh." 
            icon={<FontAwesomeIcon icon={faBolt} className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="cach-hoc"
          title="Cách học hiệu quả (gợi ý)"
          description="Cách học này giúp bạn tiến bộ ổn, ít chấn thương, và không bị “tập cho có”."
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <StepCard
            step="1"
            title="Bắt đầu từ nền tảng"
            description="Đừng vội đá cao/nhanh. Nền tảng tốt giúp bạn lên cấp cao an toàn."
            bullets={[
              "Tập tấn + di chuyển trước",
              "Tập tay thủ và thở đều",
              "Quay video 10-20 giây để tự sửa",
            ]}
          />
          <StepCard
            step="2"
            title="Tập theo nhịp nhỏ"
            description="Chia nhỏ thời gian giúp bạn giữ kỹ thuật tốt và dễ duy trì." 
            bullets={[
              "3-4 hiệp ngắn mỗi buổi",
              "Nghỉ 30-60 giây giữa hiệp",
              "Ưu tiên đúng động tác hơn số lần",
            ]}
          />
          <StepCard
            step="3"
            title="Đều đặn + tăng dần"
            description="Tăng dần theo tuần: thời lượng, số buổi hoặc độ khó (mỗi lần tăng 1 thứ)."
            bullets={[
              "Tạo lịch tập 7 ngày",
              "Đánh dấu hoàn thành sau mỗi buổi",
              "Nếu đau: giảm cường độ, không cố",
            ]}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="bai-noi-bat"
          title="Bài học nổi bật"
          description="Một vài bài nên học sớm để nắm kỹ thuật và tự tin tập tiếp."
          right={
            <Link
              href="/lo-trinh"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Xem tất cả bài →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((lesson) => (
            <LessonPreviewCard
              key={lesson.slug}
              lesson={lesson}
              levelTitle={levelTitleById[lesson.level] || "Bài học"}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Lộ trình theo cấp đai</h2>
            <p className="mt-1 text-sm text-slate-300">
              Bắt đầu từ Lam đai tự vệ, tiến dần theo từng cấp đến Hồng đai tứ.
            </p>
          </div>
          <Link
            href="/lo-trinh"
            className="text-sm font-semibold text-cyan-200 hover:text-white transition"
          >
            Xem toàn bộ lộ trình →
          </Link>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {LEVELS.map((level) => (
            <LevelPreview key={level.id} level={level} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="ke-hoach"
          title="Kế hoạch 4 tuần (mẫu)"
          description="Nếu bạn chưa biết tập gì mỗi tuần, đây là gợi ý đơn giản để bám theo."
          right={
            <Link
              href="/lich-tap"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Tạo lịch 7 ngày →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              w: "Tuần 1",
              title: "Nền tảng",
              desc: "Tấn + di chuyển + đấm thẳng. Tập chậm, chuẩn trục cơ thể.",
              icon: faRoute,
            },
            {
              w: "Tuần 2",
              title: "Đòn chân",
              desc: "Đá tống trước + đỡ cơ bản. Thêm thăng bằng và nhịp thở.",
              icon: faPersonRunning,
            },
            {
              w: "Tuần 3",
              title: "Kết hợp",
              desc: "Phối hợp tay-chân, tăng độ bền. Nếu ổn có thể thử Hoàng đai.",
              icon: faDumbbell,
            },
            {
              w: "Tuần 4",
              title: "Ứng dụng",
              desc: "Tập chuỗi kỹ thuật, phản đòn nguyên tắc. Ưu tiên an toàn khi tập đôi.",
              icon: faUsers,
            },
          ].map((item) => (
            <div
              key={item.w}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 ui3d-card"
            >
              <div className="flex items-center justify-between gap-2">
                <Pill>{item.w}</Pill>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-cyan-300/15 to-blue-500/10 text-cyan-200">
                  <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 ui3d-card">
          <p className="text-sm leading-6 text-slate-300">
            Mẹo: Khi bạn cảm thấy “động tác đã sạch” (đúng và kiểm soát được),
            hãy tăng <strong>một</strong> yếu tố: thời lượng <em>hoặc</em> số
            buổi <em>hoặc</em> độ khó. Tránh tăng cùng lúc nhiều thứ.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="chuan-bi"
          title="Chuẩn bị & an toàn"
          description="Tập đúng là tốt, tập an toàn là quan trọng. Đây là checklist ngắn để bạn không bị chấn thương vặt."
          right={
            <Link
              href="/chinh-sach-bao-mat"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Xem chính sách →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Khởi động đúng"
            description="Ưu tiên cổ chân, gối, hông và vai. Khởi động nhẹ rồi tăng dần."
            icon={<FontAwesomeIcon icon={faHeartPulse} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Không gian & dụng cụ"
            description="Sàn không trơn, đủ rộng; có nước; có thảm/nệm mỏng nếu tập ngã."
            icon={<FontAwesomeIcon icon={faDumbbell} className="h-5 w-5" />}
          />
          <FeatureCard
            title="Tập đôi an toàn"
            description="Thống nhất tốc độ & tín hiệu dừng. Không dùng lực mạnh khi không có bảo hộ."
            icon={<FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />}
          />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 ui3d-card">
            <h3 className="text-base font-semibold text-white">Checklist trước buổi tập</h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Khởi động 5-10 phút (cổ chân, gối, hông, vai).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Tập chậm - đúng kỹ thuật trước khi tăng tốc.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Đau nhói/choáng: dừng lại và nghỉ, không cố.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Giãn cơ 3-5 phút sau buổi tập để đỡ đau nhức.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 ui3d-card">
            <h3 className="text-base font-semibold text-white">Dụng cụ gợi ý</h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Nước + khăn nhỏ (giữ nhịp thở và tránh mất nước).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Thảm/nệm mỏng nếu tập ngã an toàn.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Bảo hộ (nếu tập đôi): găng, ống quyển…</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Gương hoặc camera để tự sửa tư thế.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="faq"
          title="FAQ"
          description="Các câu hỏi thường gặp khi mới bắt đầu tự luyện."
          right={
            <Link
              href="/dieu-khoan"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Xem điều khoản →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <FaqItem
            q="Mình mới hoàn toàn thì bắt đầu từ đâu?"
            a="Vào trang Lộ trình, bắt đầu từ Lam đai tự vệ. Tập 2-3 bài đầu thật chắc trước khi học bài mới."
          />
          <FaqItem
            q="Mỗi buổi nên tập bao lâu?"
            a="Nếu mới: 20-30 phút là ổn (khởi động + tập + giãn cơ). Quan trọng là đều đặn và đúng kỹ thuật."
          />
          <FaqItem
            q="Có cần dụng cụ gì không?"
            a="Không bắt buộc. Nhưng nên có nước, không gian không trơn, và thảm/nệm mỏng nếu tập ngã an toàn."
          />
          <FaqItem
            q="Tập đau gối/đau hông thì làm sao?"
            a="Dừng lại, giảm độ hạ tấn/biên độ đá, kiểm tra hướng gối theo mũi chân. Nếu đau kéo dài, nên hỏi huấn luyện viên hoặc chuyên môn y tế."
          />
          <FaqItem
            q="Khi nào nên lên cấp đai tiếp theo?"
            a="Khi bạn kiểm soát được tư thế, thăng bằng và nhịp thở; tập chậm vẫn đúng động tác và không đau. Không cần vội."
          />
          <FaqItem
            q="Tiến độ lưu ở đâu? Có mất không?"
            a="Tiến độ và lịch tập lưu trong localStorage trên trình duyệt. Nếu bạn xóa dữ liệu trình duyệt hoặc đổi máy, dữ liệu sẽ mất."
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card relative overflow-hidden rounded-[2.25rem] p-7 sm:p-12">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Bắt đầu buổi tập đầu tiên ngay hôm nay
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Vào lộ trình, chọn bài phù hợp cấp đai và tập theo từng bước. Nhớ
              khởi động kỹ, tập chậm, và đánh dấu hoàn thành để theo dõi tiến độ.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lo-trinh"
                className="cta-primary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Vào lộ trình
              </Link>
              <Link
                href="/lich-tap"
                className="cta-secondary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                Tạo lịch tập
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MobileQuickActions startLabel="Bắt đầu học" scheduleLabel="Lịch 7 ngày" />
    </div>
  );
}

function getGlobalHomeCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heroPill: "Clear roadmap • Practical drills • Progress tracking",
      heroTitle: "Train Vovinam with a clear step-by-step path",
      heroDescription:
        "Follow a structured flow from fundamentals to advanced levels. Learn safely, track progress, and build consistency each week.",
      startLearning: "Start roadmap",
      createSchedule: "Create 7-day schedule",
      statLessons: "Total lessons",
      statBelts: "Belt levels",
      statGoal: "Goal",
      statGoalValue: "Clean technique",
      highlightsTitle: "Core highlights",
      highlightsDescription:
        "Everything you need for practical self-training: clear instructions, safety-first guidance, and measurable progress.",
      features: [
        {
          title: "Step-by-step lessons",
          description: "Each lesson includes goals, sequence, common mistakes, and practical tips.",
          icon: faBookOpen,
        },
        {
          title: "Automatic progress",
          description: "Mark lessons complete and keep your roadmap state saved on your device.",
          icon: faChartLine,
        },
        {
          title: "Weekly scheduling",
          description: "Plan training sessions by level, frequency, and duration to stay consistent.",
          icon: faCalendarDays,
        },
        {
          title: "Technique library",
          description: "Review movement details, common errors, and safety notes anytime.",
          icon: faShieldHalved,
        },
      ],
      quickLinksTitle: "Quick links",
      motivationTitle: "You do not need perfection, you need consistency",
      motivationMessage:
        "Even a short 15-20 minute session counts. A clean session with control is always more valuable than chaotic volume.",
      motivationChip1: "One completed lesson is a win",
      motivationChip2: "Protect form before speed",
      motivationChip3: "Scale down intensity, not commitment",
      ctaTitle: "Ready for your first focused session?",
      ctaDescription:
        "Open the roadmap, pick one suitable lesson, and train with clean form. Keep the pace controlled and safety-first.",
    };
  }

  if (id === "ja") {
    return {
      heroPill: "明確なロードマップ • 実践練習 • 進捗管理",
      heroTitle: "段階的な流れで Vovinam を練習する",
      heroDescription:
        "基礎から上位レベルまで、構造化された順序で学べます。安全を重視し、進捗を記録しながら毎週の習慣を作ります。",
      startLearning: "ロードマップ開始",
      createSchedule: "7日間スケジュール作成",
      statLessons: "総レッスン数",
      statBelts: "帯レベル",
      statGoal: "目標",
      statGoalValue: "正確な技術",
      highlightsTitle: "主な特長",
      highlightsDescription:
        "自主練に必要な要素をまとめています。分かりやすい手順、安全重視のガイド、測定可能な進捗。",
      features: [
        {
          title: "ステップ式レッスン",
          description: "各レッスンに目標、手順、よくあるミス、実践ヒントを用意。",
          icon: faBookOpen,
        },
        {
          title: "進捗の自動保存",
          description: "完了を記録すると端末にロードマップ状態が保存されます。",
          icon: faChartLine,
        },
        {
          title: "週間スケジュール",
          description: "レベルや頻度、時間に応じて練習計画を作成できます。",
          icon: faCalendarDays,
        },
        {
          title: "技術ライブラリ",
          description: "動作の細部、よくあるミス、安全ポイントをいつでも確認。",
          icon: faShieldHalved,
        },
      ],
      quickLinksTitle: "クイックリンク",
      motivationTitle: "完璧より、継続が強さを作る",
      motivationMessage:
        "15-20分の短い練習でも十分です。量より、コントロールされた質の高い1セッションを重ねましょう。",
      motivationChip1: "1レッスン完了は勝ち",
      motivationChip2: "速度よりフォームを守る",
      motivationChip3: "やめるより強度を調整する",
      ctaTitle: "最初の集中トレーニングを始めましょう",
      ctaDescription:
        "ロードマップから自分に合うレッスンを1つ選び、正確なフォームで練習しましょう。ペース管理と安全を最優先に。",
    };
  }

  return null;
}

function HomeGlobal({ copy, locale }) {
  return (
    <div className="ui3d-stage mobile-safe-bottom mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <RouteWarmup />
      <JsonLd data={buildHomeJsonLd(locale)} />
      <section className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card hero-noise hero-compact relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_58%)]" />
        <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl float-fast motion-gradient-orb" />
        <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl float-slower motion-gradient-orb" />
        <div className="relative">
          <div className="accent-line" />
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            {copy.heroPill}
          </p>

          <h1 className="headline-gradient motion-gradient-title hero-title-enterprise mt-3 max-w-3xl font-semibold">
            {copy.heroTitle}
          </h1>
          <p className="hero-subtitle-enterprise mt-2 max-w-2xl text-slate-300">
            {copy.heroDescription}
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/lo-trinh"
              className="cta-primary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              {copy.startLearning}
            </Link>
            <Link
              href="/lich-tap"
              className="cta-secondary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              {copy.createSchedule}
            </Link>
          </div>

        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          id="highlights"
          title={copy.highlightsTitle}
          description={copy.highlightsDescription}
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {copy.features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={<FontAwesomeIcon icon={feature.icon} className="h-5 w-5" />}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading id="quick-links" title={copy.quickLinksTitle} />
        <div className="mt-4 flex flex-wrap gap-2">
          <ChipLink href="/lo-trinh">Roadmap</ChipLink>
          <ChipLink href="/hoc-tap">Learning</ChipLink>
          <ChipLink href="/ky-thuat">Techniques</ChipLink>
          <ChipLink href="/video">Videos</ChipLink>
          <ChipLink href="/lich-tap">Schedule</ChipLink>
          <ChipLink href="/cong-dong">Community</ChipLink>
        </div>
      </section>

      <MotivationStrip
        title={copy.motivationTitle}
        message={copy.motivationMessage}
        chips={[copy.motivationChip1, copy.motivationChip2, copy.motivationChip3]}
      />

      <section className="mt-12">
        <div className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card relative overflow-hidden rounded-[2.25rem] p-7 sm:p-12">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.ctaTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {copy.ctaDescription}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lo-trinh"
                className="cta-primary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                {copy.startLearning}
              </Link>
              <Link
                href="/lich-tap"
                className="cta-secondary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {copy.createSchedule}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MobileQuickActions startLabel={copy.startLearning} scheduleLabel={copy.createSchedule} />
    </div>
  );
}

export default async function Home() {
  const locale = await getLocale();
  const globalCopy = getGlobalHomeCopy(locale);

  if (!globalCopy) {
    return <HomeVi />;
  }

  return <HomeGlobal copy={globalCopy} locale={locale} />;
}

