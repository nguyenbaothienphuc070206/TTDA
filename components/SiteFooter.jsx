import Link from "next/link";

import { LEVELS } from "@/data/lessons";

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-lg"
    >
      {children}
    </Link>
  );
}

function FooterTitle({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
      {children}
    </p>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                Sẵn sàng luyện đều mỗi tuần?
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Chọn lộ trình và bắt đầu từ bài dễ nhất. Tiến độ sẽ tự lưu trên
                máy của bạn.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/lo-trinh"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-4 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                Bắt đầu học
              </Link>
              <Link
                href="/lich-tap"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
              >
                Tạo lịch tập
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 font-extrabold shadow-sm">
                V
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">Vovinam Learning</p>
                <p className="text-xs text-slate-300">Cơ bản → nâng cao</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              App học theo lộ trình, hướng dẫn từng bước, dễ theo dõi tiến độ.
            </p>
          </div>

          <div>
            <FooterTitle>Điều hướng</FooterTitle>
            <div className="mt-3 grid gap-2">
              <FooterLink href="/">Trang chủ</FooterLink>
              <FooterLink href="/lo-trinh">Lộ trình</FooterLink>
              <FooterLink href="/lich-tap">Lịch tập</FooterLink>
              <FooterLink href="/chinh-sach-bao-mat">Chính sách bảo mật</FooterLink>
              <FooterLink href="/dieu-khoan">Điều khoản</FooterLink>
            </div>
          </div>

          <div>
            <FooterTitle>Cấp độ</FooterTitle>
            <div className="mt-3 grid gap-2">
              {LEVELS.map((level) => (
                <FooterLink key={level.id} href={`/lo-trinh#${level.id}`}>
                  {level.title}
                </FooterLink>
              ))}
            </div>
          </div>

          <div>
            <FooterTitle>Lưu ý an toàn</FooterTitle>
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
                <span>Kỹ thuật khó: nên có huấn luyện viên hướng dẫn.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {year} Vovinam Learning • Built with Next.js
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href="#top"
              className="text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/30 rounded-lg"
            >
              Lên đầu trang ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
