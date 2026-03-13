import Link from "next/link";

import { BELTS } from "@/data/belts";
import { LEVELS, LESSONS, getLessonsByLevel } from "@/data/lessons";
import { NEWS } from "@/data/news";

function ChipLink({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
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

function FeatureCard({ title, description }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />
      <div className="relative flex items-start gap-4">
        <div className="mt-0.5 h-10 w-10 shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/15 to-blue-500/10" />
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 text-sm font-extrabold text-slate-950">
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
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

function LessonPreviewCard({ lesson, levelTitle }) {
  return (
    <Link
      href={`/bai-hoc/${lesson.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
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
    <details className="group rounded-3xl border border-white/10 bg-white/5 p-5 open:bg-white/10">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-300">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

function LevelPreview({ level }) {
  const lessons = getLessonsByLevel(level.id);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
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
  return (
    <Link
      href="/hoc-tap"
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{belt.title}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
            {belt.short}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{belt.description}</p>
        <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-white">
          Xem khóa học →
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ item }) {
  return (
    <Link
      href={item.href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_55%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Pill>Tin tức</Pill>
          <Pill>{item.date}</Pill>
        </div>
        <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{item.summary}</p>
        <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-white">
          Xem thêm →
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const featured = [
    ...getLessonsByLevel("co-ban").slice(0, 2),
    ...getLessonsByLevel("trung-cap").slice(0, 2),
    ...getLessonsByLevel("nang-cao").slice(0, 2),
  ];

  const levelTitleById = Object.fromEntries(
    LEVELS.map((l) => [l.id, l.title])
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-7 sm:p-12">
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            Lộ trình rõ ràng • Từng bước dễ tập • Lưu tiến độ
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Học Vovinam theo cấp Lam → Hoàng → Huyền đai
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Mỗi bài có mục tiêu, hướng dẫn từng bước, lỗi thường gặp và gợi ý tự
            luyện. Bạn có thể đánh dấu hoàn thành để theo dõi tiến độ.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/lo-trinh"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              Bắt đầu học
            </Link>
            <Link
              href="/lich-tap"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            >
              Tạo lịch tập 7 ngày
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Tổng bài học" value={LESSONS.length} />
            <Stat label="Cấp đai" value={LEVELS.length} />
            <Stat label="Mục tiêu" value="Đúng kỹ thuật" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ChipLink href="#tinh-nang">Tính năng</ChipLink>
            <ChipLink href="#vo-dao">Võ đạo</ChipLink>
            <ChipLink href="#khoa-hoc">Khóa học</ChipLink>
            <ChipLink href="#tin-tuc">Tin tức</ChipLink>
            <ChipLink href="#cach-hoc">Cách học</ChipLink>
            <ChipLink href="#bai-noi-bat">Bài nổi bật</ChipLink>
            <ChipLink href="#ke-hoach">Kế hoạch 4 tuần</ChipLink>
            <ChipLink href="#faq">FAQ</ChipLink>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          id="vo-dao"
          title="Tinh thần võ đạo"
          description="Tập để khỏe – tự tin – kỷ luật. Tập đúng kỹ thuật và giữ tâm thế bình tĩnh." 
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <FeatureCard
            title="Kỷ luật & đều đặn"
            description="Tập đều quan trọng hơn tập nặng. Tăng dần nhẹ mỗi tuần để bền." 
          />
          <FeatureCard
            title="Tôn trọng & tự vệ"
            description="Mục tiêu là tự bảo vệ và kiểm soát bản thân, không phô trương hay gây hấn." 
          />
          <FeatureCard
            title="An toàn là ưu tiên"
            description="Khởi động kỹ, tập chậm, dừng khi đau nhói. Kỹ thuật khó nên có HLV." 
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="khoa-hoc"
          title="Khóa học theo cấp đai"
          description="Chia theo Lam/Hoàng/Huyền để bạn biết đang ở giai đoạn nào và học gì tiếp theo." 
          right={
            <Link
              href="/hoc-tap"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Vào dashboard →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {BELTS.map((b) => (
            <BeltPreview key={b.id} belt={b} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="tin-tuc"
          title="Bảng tin mới nhất"
          description="Cập nhật nhanh các tip an toàn, kế hoạch tập và dinh dưỡng." 
          right={
            <Link
              href="/dinh-duong"
              className="text-sm font-semibold text-cyan-200 hover:text-white transition"
            >
              Xem dinh dưỡng →
            </Link>
          }
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
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

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <FeatureCard
            title="Bài học từng bước"
            description="Mỗi bài có mục tiêu, bước tập, lỗi thường gặp và gợi ý để bạn tập đúng." 
          />
          <FeatureCard
            title="Lưu tiến độ tự động"
            description="Bấm “Đánh dấu hoàn thành” để theo dõi bạn đã học tới đâu (lưu ngay trên máy)."
          />
          <FeatureCard
            title="Lịch tập 7 ngày"
            description="Tạo lịch theo cấp đai + số buổi/tuần + thời lượng. Dễ duy trì thói quen." 
          />
          <FeatureCard
            title="Thiết kế tập trung"
            description="UI tối, chữ rõ, nút lớn dễ bấm. Nhìn lâu không mỏi và không rối mắt."
          />
          <FeatureCard
            title="Tối ưu bảo mật"
            description="Bật security headers, tắt X-Powered-By, có robots/sitemap và trang chính sách." 
          />
          <FeatureCard
            title="Nhẹ và nhanh"
            description="Trang chủ chủ yếu render tĩnh; nội dung bài học nằm trong data nên tải nhanh." 
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          id="cach-hoc"
          title="Cách học hiệu quả (gợi ý)"
          description="Cách học này giúp bạn tiến bộ ổn, ít chấn thương, và không bị “tập cho có”."
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <StepCard
            step="1"
            title="Bắt đầu từ nền tảng"
            description="Đừng vội đá cao/nhanh. Nền tảng tốt giúp bạn lên Huyền đai an toàn."
            bullets={[
              "Tập tấn + di chuyển trước",
              "Tập tay thủ và thở đều",
              "Quay video 10–20 giây để tự sửa",
            ]}
          />
          <StepCard
            step="2"
            title="Tập theo nhịp nhỏ"
            description="Chia nhỏ thời gian giúp bạn giữ kỹ thuật tốt và dễ duy trì." 
            bullets={[
              "3–4 hiệp ngắn mỗi buổi",
              "Nghỉ 30–60 giây giữa hiệp",
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

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
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
              Bắt đầu từ “Lam đai”, khi ổn thì lên “Hoàng đai”, rồi “Huyền đai”.
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

        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {[
            {
              w: "Tuần 1",
              title: "Nền tảng",
              desc: "Tấn + di chuyển + đấm thẳng. Tập chậm, chuẩn trục cơ thể.",
            },
            {
              w: "Tuần 2",
              title: "Đòn chân",
              desc: "Đá tống trước + đỡ cơ bản. Thêm thăng bằng và nhịp thở.",
            },
            {
              w: "Tuần 3",
              title: "Kết hợp",
              desc: "Phối hợp tay–chân, tăng độ bền. Nếu ổn có thể thử Hoàng đai.",
            },
            {
              w: "Tuần 4",
              title: "Ứng dụng",
              desc: "Tập chuỗi kỹ thuật, phản đòn nguyên tắc. Ưu tiên an toàn khi tập đôi.",
            },
          ].map((item) => (
            <div
              key={item.w}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <Pill>{item.w}</Pill>
                <span className="h-10 w-10 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/15 to-blue-500/10" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
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

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <FeatureCard
            title="Khởi động đúng"
            description="Ưu tiên cổ chân, gối, hông và vai. Khởi động nhẹ rồi tăng dần."
          />
          <FeatureCard
            title="Không gian & dụng cụ"
            description="Sàn không trơn, đủ rộng; có nước; có thảm/nệm mỏng nếu tập ngã."
          />
          <FeatureCard
            title="Tập đôi an toàn"
            description="Thống nhất tốc độ & tín hiệu dừng. Không dùng lực mạnh khi không có bảo hộ."
          />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h3 className="text-base font-semibold text-white">Checklist trước buổi tập</h3>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Khởi động 5–10 phút (cổ chân, gối, hông, vai).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Tập chậm – đúng kỹ thuật trước khi tăng tốc.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Đau nhói/choáng: dừng lại và nghỉ, không cố.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                <span>Giãn cơ 3–5 phút sau buổi tập để đỡ đau nhức.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
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
            a="Vào trang Lộ trình, bắt đầu Lam đai. Tập 2–3 bài đầu thật chắc trước khi học bài mới."
          />
          <FaqItem
            q="Mỗi buổi nên tập bao lâu?"
            a="Nếu mới: 20–30 phút là ổn (khởi động + tập + giãn cơ). Quan trọng là đều đặn và đúng kỹ thuật."
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
            q="Khi nào nên lên Hoàng/Huyền đai?"
            a="Khi bạn kiểm soát được tư thế, thăng bằng và nhịp thở; tập chậm vẫn đúng động tác và không đau. Không cần vội."
          />
          <FaqItem
            q="Tiến độ lưu ở đâu? Có mất không?"
            a="Tiến độ và lịch tập lưu trong localStorage trên trình duyệt. Nếu bạn xóa dữ liệu trình duyệt hoặc đổi máy, dữ liệu sẽ mất."
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-7 sm:p-12">
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
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Vào lộ trình
              </Link>
              <Link
                href="/lich-tap"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                Tạo lịch tập
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
