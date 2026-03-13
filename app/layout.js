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
    "App học Vovinam theo Lam/Hoàng/Huyền đai: lộ trình rõ ràng, bài tập từng bước, lưu tiến độ và lịch tập 7 ngày.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#020617",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        id="top"
        className={`${beVietnam.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-[color:var(--app-bg)] text-[color:var(--app-fg)]`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AnimatedBackground />
          <PwaRegister />
          <SifuReminderAgent />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <AiCoachBubble />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
