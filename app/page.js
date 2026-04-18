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
import { isPitchModeEnabled } from "@/lib/pitchMode";

export const metadata = {
  title: "Vovinam Learning - Học Vovinam Theo Lộ Trình",
  description:
    "Nền tảng học Vovinam tập trung vào học tập, cộng đồng và cửa hàng: bài học rõ ràng, chấm chữa kỹ thuật và theo dõi tiến độ.",
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
      "Học Vovinam theo từng bước rõ ràng, luyện tập cùng cộng đồng và trang bị đúng để tập hiệu quả.",
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

function ProblemStatement({ title, description }) {
  return (
    <section className="surface-card enterprise-shell mb-4 rounded-3xl p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Problem</p>
      <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
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
          href="/hoc-tap"
          className="cta-primary inline-flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold"
        >
          {startLabel}
        </Link>
        <Link
          href="/cong-dong"
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
          "Trang chủ Vovinam Learning tập trung vào học tập theo hệ thống, cộng đồng luyện tập và cửa hàng trang bị.",
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
  return (
    <div className="ui3d-stage mobile-safe-bottom stagger-fade mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <JsonLd data={buildHomeJsonLd("vi")} />
      <section
        className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card hero-noise hero-compact relative overflow-hidden rounded-4xl p-5 fade-in-up sm:p-8"
      >
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_58%)]" />
        <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl float-fast motion-gradient-orb" />
        <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl float-slower motion-gradient-orb" />

        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              Học tập • Cộng đồng • Cửa hàng
            </p>
            <h1 className="headline-gradient motion-gradient-title hero-title-enterprise mt-3 max-w-xl font-semibold">
              Học Vovinam đúng cách, theo từng bước rõ ràng
            </h1>
            <p className="hero-subtitle-enterprise mt-3 max-w-lg text-slate-300">
              Từ Lam đai tự vệ đến Hồng đai tứ. Không học lan man. Không tập mù mờ.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/hoc-tap"
                className="cta-primary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Bắt đầu học
              </Link>
              <Link
                href="/cong-dong"
                className="cta-secondary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                Xem cộng đồng
              </Link>
            </div>
          </div>

          <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Learning dashboard</p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-200">
              <span>Tiến độ</span>
              <span>1 / 56 bài (2%)</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div className="h-2 w-[2%] rounded-full bg-emerald-400" />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">Bài hôm nay: Quyền Lam đai tự vệ</p>
              <p className="mt-1 text-xs text-slate-300">18 phút • 1 video + 1 kỹ thuật</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mt-6 rounded-3xl border border-emerald-300/25 bg-emerald-400/10 px-5 py-4 text-center fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <p className="text-base font-semibold text-emerald-50 sm:text-lg">
          Không chỉ học - bạn biết mình sai ở đâu
        </p>
      </section>

      <section
        className="mt-10 grid items-center gap-5 md:grid-cols-2 fade-in-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Học tập</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Học tập theo hệ thống rõ ràng</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Học theo từng cấp đai, mỗi bài có video và kỹ thuật đi kèm để tập đúng ngay từ đầu.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200">
            <li>• Học theo từng cấp đai, từng bước rõ ràng</li>
            <li>• Video và kỹ thuật đi kèm trong mỗi bài</li>
            <li>• Nội dung bám sát thực tế luyện tập</li>
          </ul>

          <h3 className="mt-5 text-base font-semibold text-emerald-200">Chấm chữa kỹ thuật</h3>
          <p className="mt-1 text-sm text-slate-300">
            Nhận diện lỗi cơ bản để biết mình sai ở đâu và sửa đơn giản, dễ hiểu.
          </p>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Phản hồi bài tập</p>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="rounded-2xl border border-red-300/35 bg-red-400/10 px-3 py-2 text-red-100">
              Lệch trục nhẹ - giữ thân người thẳng hơn.
            </div>
            <div className="rounded-2xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-amber-100">
              Nhịp chưa đều - tập chậm lại theo từng nhịp.
            </div>
            <div className="rounded-2xl border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-emerald-100">
              Guard ổn - duy trì như hiện tại.
            </div>
          </div>
        </div>
      </section>

      <section
        className="mt-8 grid items-center gap-5 md:grid-cols-2 fade-in-up"
        style={{ animationDelay: "260ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Cộng đồng</p>
          <div className="mt-3 space-y-2">
            {[
              { name: "Nguyễn A", level: "Lam đai tự vệ", progress: 2 },
              { name: "Trần B", level: "Lam đai", progress: 15 },
              { name: "Lê C", level: "Lam đai nhất", progress: 25 },
            ].map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2"
              >
                <p className="text-sm font-semibold text-white">{member.name}</p>
                <p className="mt-0.5 text-xs text-slate-300">
                  {member.level} • {member.progress}%
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Cộng đồng</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Luyện tập cùng cộng đồng</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Không tập một mình. Xem người khác đang học gì và tiến bộ ra sao để giữ động lực mỗi ngày.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200">
            <li>• Học viên theo từng cấp đai</li>
            <li>• Theo dõi tiến độ của nhau</li>
            <li>• Tạo động lực luyện tập đều đặn</li>
          </ul>
          <Link
            href="/cong-dong"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15"
          >
            Khám phá cộng đồng →
          </Link>
        </div>
      </section>

      <section
        className="mt-8 grid items-center gap-5 md:grid-cols-2 fade-in-up"
        style={{ animationDelay: "340ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Cửa hàng</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Trang bị đúng để tập hiệu quả</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Không cần mua nhiều. Chỉ cần đúng theo cấp đai để tập an toàn và bắt đầu nhanh hơn.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200">
            <li>• Gợi ý đồ tập theo cấp đai</li>
            <li>• Combo cho người mới bắt đầu</li>
            <li>• Mua trực tiếp tại đối tác</li>
          </ul>
          <Link
            href="/cua-hang"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
          >
            Xem cửa hàng →
          </Link>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Combo người mới</p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-base font-semibold text-white">Võ phục + Đai Lam + Bảo hộ</p>
            <p className="mt-1 text-sm text-slate-300">Gọn, đủ dùng và ưu tiên an toàn.</p>
            <p className="mt-3 text-lg font-semibold text-emerald-200">590.000đ</p>
          </div>
        </div>
      </section>

      <section
        className="mt-12 grid gap-5 lg:grid-cols-3 fade-in-up"
        style={{ animationDelay: "420ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Learning preview</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Bắt đầu từ Lam đai tự vệ</h3>
          <ul className="mt-3 grid gap-1 text-sm text-slate-300">
            <li>• Quyền cơ bản</li>
            <li>• Phản xạ an toàn</li>
            <li>• Tư thế phòng vệ</li>
          </ul>
          <Link href="/hoc-tap" className="mt-4 inline-flex text-sm font-semibold text-cyan-200 hover:text-white">
            Xem khóa học →
          </Link>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Community preview</p>
          <h3 className="mt-2 text-lg font-semibold text-white">84 học viên đang luyện tập</h3>
          <ul className="mt-3 grid gap-1 text-sm text-slate-300">
            <li>• Lam đai tự vệ: 6 người</li>
            <li>• Lam đai: 6 người</li>
            <li>• Lam đai nhất: 6 người</li>
          </ul>
          <Link href="/cong-dong" className="mt-4 inline-flex text-sm font-semibold text-amber-200 hover:text-white">
            Xem cộng đồng →
          </Link>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Store preview</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Combo cho người mới</h3>
          <p className="mt-2 text-sm text-slate-300">Võ phục, đai Lam, bảo hộ cơ bản.</p>
          <p className="mt-3 text-lg font-semibold text-emerald-200">590.000đ</p>
          <Link href="/cua-hang" className="mt-4 inline-flex text-sm font-semibold text-emerald-200 hover:text-white">
            Xem cửa hàng →
          </Link>
        </div>
      </section>

      <section className="mt-12 fade-in-up" style={{ animationDelay: "500ms" }}>
        <div className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card relative overflow-hidden rounded-[2.25rem] p-7 text-center sm:p-12">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Bắt đầu buổi tập đầu tiên hôm nay
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Chỉ cần 1 bài. Là đủ để bắt đầu.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/hoc-tap"
                className="cta-primary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Bắt đầu học
              </Link>
              <Link
                href="/cong-dong"
                className="cta-secondary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                Xem cộng đồng
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MobileQuickActions startLabel="Bắt đầu học" scheduleLabel="Xem cộng đồng" />
    </div>
  );
}

function getGlobalHomeCopy(locale) {
  const id = String(locale || "vi").toLowerCase();

  if (id === "en") {
    return {
      heroPill: "Learning • Community • Store",
      heroTitle: "Learn Vovinam with a clear, step-by-step system",
      heroDescription:
        "From beginner basics to advanced levels. No random drills, no confusion.",
      startLearning: "Start Learning",
      exploreCommunity: "Explore Community",
      valueStrip: "Do not just learn - know exactly what to fix",
      learningTitle: "Structured learning by belt level",
      learningDescription:
        "Every lesson includes video, technique notes, and practical guidance you can use immediately.",
      learningBullet1: "Clear belt-by-belt progression",
      learningBullet2: "Video and technique in every lesson",
      learningBullet3: "Practical content, no fluff",
      coachingTitle: "Technique feedback",
      coachingDescription:
        "Catch common mistakes early and fix them with simple, actionable suggestions.",
      communityTitle: "Train with the community",
      communityDescription:
        "See what others practice, follow shared progress, and stay motivated.",
      communityBullet1: "Grouped by belt level",
      communityBullet2: "Progress visibility",
      communityBullet3: "Daily motivation loop",
      storeTitle: "Get the right gear to train better",
      storeDescription:
        "Choose what fits your level. Start with essentials and avoid unnecessary purchases.",
      storeBullet1: "Gear suggestions by belt",
      storeBullet2: "Starter bundles",
      storeBullet3: "Buy from trusted partners",
      ctaTitle: "Start your first session today",
      ctaDescription:
        "One lesson is enough to start. Keep it simple and stay consistent.",
    };
  }

  if (id === "ja") {
    return {
      heroPill: "学習 • コミュニティ • ストア",
      heroTitle: "段階的で分かりやすい Vovinam 学習",
      heroDescription:
        "初心者の基礎から上位レベルまで。迷わず、ムダなく練習できます。",
      startLearning: "学習を始める",
      exploreCommunity: "コミュニティを見る",
      valueStrip: "学ぶだけでなく、どこを直すべきかが分かる",
      learningTitle: "帯レベル別の体系学習",
      learningDescription:
        "各レッスンに動画と技術ポイントがあり、すぐ実践できます。",
      learningBullet1: "帯ごとの明確なステップ",
      learningBullet2: "毎レッスンに動画と技術解説",
      learningBullet3: "実践重視で分かりやすい",
      coachingTitle: "技術フィードバック",
      coachingDescription:
        "基本ミスを早く見つけ、シンプルな提案で修正できます。",
      communityTitle: "コミュニティと一緒に練習",
      communityDescription:
        "他の学習者の進捗を見ながら、刺激を受けて継続できます。",
      communityBullet1: "帯レベルごとの学習者",
      communityBullet2: "進捗を見える化",
      communityBullet3: "継続のモチベーション",
      storeTitle: "必要な装備を正しく選ぶ",
      storeDescription:
        "レベルに合った装備を提案。初心者は必要なものから始められます。",
      storeBullet1: "帯に合わせた装備提案",
      storeBullet2: "初心者向けセット",
      storeBullet3: "提携先から購入可能",
      ctaTitle: "今日から最初の練習を始めよう",
      ctaDescription:
        "まずは1レッスンで十分。シンプルに始めて、継続して上達しましょう。",
    };
  }

  return null;
}

function HomeGlobal({ copy, locale }) {
  return (
    <div className="ui3d-stage mobile-safe-bottom stagger-fade mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <JsonLd data={buildHomeJsonLd(locale)} />
      <section
        className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card hero-noise hero-compact relative overflow-hidden rounded-4xl p-5 fade-in-up sm:p-8"
      >
        <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_58%)]" />
        <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl float-fast motion-gradient-orb" />
        <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl float-slower motion-gradient-orb" />

        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              {copy.heroPill}
            </p>
            <h1 className="headline-gradient motion-gradient-title hero-title-enterprise mt-3 max-w-xl font-semibold">
              {copy.heroTitle}
            </h1>
            <p className="hero-subtitle-enterprise mt-3 max-w-lg text-slate-300">
              {copy.heroDescription}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/hoc-tap"
                className="cta-primary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                {copy.startLearning}
              </Link>
              <Link
                href="/cong-dong"
                className="cta-secondary motion-gradient-btn inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {copy.exploreCommunity}
              </Link>
            </div>
          </div>

          <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Learning dashboard</p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-200">
              <span>Progress</span>
              <span>1 / 56 (2%)</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div className="h-2 w-[2%] rounded-full bg-emerald-400" />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">Today: Foundation Form</p>
              <p className="mt-1 text-xs text-slate-300">18 min • 1 video + 1 technique</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mt-6 rounded-3xl border border-emerald-300/25 bg-emerald-400/10 px-5 py-4 text-center fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <p className="text-base font-semibold text-emerald-50 sm:text-lg">{copy.valueStrip}</p>
      </section>

      <section
        className="mt-10 grid items-center gap-5 md:grid-cols-2 fade-in-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Learning</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{copy.learningTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{copy.learningDescription}</p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200">
            <li>• {copy.learningBullet1}</li>
            <li>• {copy.learningBullet2}</li>
            <li>• {copy.learningBullet3}</li>
          </ul>
          <h3 className="mt-5 text-base font-semibold text-emerald-200">{copy.coachingTitle}</h3>
          <p className="mt-1 text-sm text-slate-300">{copy.coachingDescription}</p>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Technique feedback</p>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="rounded-2xl border border-red-300/35 bg-red-400/10 px-3 py-2 text-red-100">Axis drift detected - keep your torso aligned.</div>
            <div className="rounded-2xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-amber-100">Rhythm unstable - slow down and reset timing.</div>
            <div className="rounded-2xl border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-emerald-100">Guard stable - keep this posture.</div>
          </div>
        </div>
      </section>

      <section
        className="mt-8 grid items-center gap-5 md:grid-cols-2 fade-in-up"
        style={{ animationDelay: "260ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Community</p>
          <div className="mt-3 space-y-2">
            {[
              { name: "Nguyen A", level: "Blue Belt Intro", progress: 2 },
              { name: "Tran B", level: "Blue Belt", progress: 15 },
              { name: "Le C", level: "Blue Belt 1", progress: 25 },
            ].map((member) => (
              <div key={member.name} className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <p className="text-sm font-semibold text-white">{member.name}</p>
                <p className="mt-0.5 text-xs text-slate-300">{member.level} • {member.progress}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6 md:order-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Community</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{copy.communityTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{copy.communityDescription}</p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200">
            <li>• {copy.communityBullet1}</li>
            <li>• {copy.communityBullet2}</li>
            <li>• {copy.communityBullet3}</li>
          </ul>
          <Link
            href="/cong-dong"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15"
          >
            {copy.exploreCommunity} →
          </Link>
        </div>
      </section>

      <section
        className="mt-8 grid items-center gap-5 md:grid-cols-2 fade-in-up"
        style={{ animationDelay: "340ms" }}
      >
        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Store</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{copy.storeTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{copy.storeDescription}</p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-200">
            <li>• {copy.storeBullet1}</li>
            <li>• {copy.storeBullet2}</li>
            <li>• {copy.storeBullet3}</li>
          </ul>
          <Link
            href="/cua-hang"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
          >
            View Store →
          </Link>
        </div>

        <div className="surface-card enterprise-shell ui3d-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Starter bundle</p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-base font-semibold text-white">Uniform + Blue belt + Protection</p>
            <p className="mt-1 text-sm text-slate-300">Simple, essential, and beginner-safe.</p>
            <p className="mt-3 text-lg font-semibold text-emerald-200">590,000 VND</p>
          </div>
        </div>
      </section>

      <section className="mt-12 fade-in-up" style={{ animationDelay: "420ms" }}>
        <div className="surface-card-strong enterprise-shell motion-gradient-surface ui3d-card relative overflow-hidden rounded-[2.25rem] p-7 text-center sm:p-12">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.ctaTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {copy.ctaDescription}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/hoc-tap"
                className="cta-primary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                {copy.startLearning}
              </Link>
              <Link
                href="/cong-dong"
                className="cta-secondary motion-gradient-btn inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                {copy.exploreCommunity}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MobileQuickActions startLabel={copy.startLearning} scheduleLabel={copy.exploreCommunity} />
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

