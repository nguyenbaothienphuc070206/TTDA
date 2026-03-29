import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import AnimatedBackground from "@/components/AnimatedBackground";
import AiCoachBubble from "@/components/AiCoachBubble";
import PwaRegister from "@/components/PwaRegister";
import SifuReminderAgent from "@/components/SifuReminderAgent";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import ViewportReveal from "@/components/ViewportReveal";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Vovinam Learning",
    template: "%s | Vovinam Learning",
  },
  description:
    "App học Vovinam theo hệ 14 cấp đai: lộ trình rõ ràng, bài tập từng bước, lưu tiến độ và lịch tập 7 ngày.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#f1f5f9",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="light">
      <head>
        <script
          // Set theme early to avoid visual flicker while client JS hydrates.
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var k='vovinam_theme_v1';var t=localStorage.getItem(k);if(t==='light'||t==='dark'||t==='vodo'){document.documentElement.dataset.theme=t;}}catch(_){}})();",
          }}
        />
      </head>
      <body
        id="top"
        className={`${beVietnam.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-(--app-bg) text-(--app-fg)`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only fixed left-4 top-4 z-100 rounded-xl border border-white/20 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white"
          >
            Bỏ qua menu, tới nội dung chính
          </a>
          <AnimatedBackground />
          <ViewportReveal />
          <PwaRegister />
          <SifuReminderAgent />
          <SiteHeader />
          <main id="main-content" className="flex-1">{children}</main>
          <SiteFooter />
          <AiCoachBubble />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
