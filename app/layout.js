import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AnimatedBackground from "@/components/AnimatedBackground";
import PwaRegister from "@/components/PwaRegister";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    "App học Vovinam từ cơ bản đến nâng cao: lộ trình rõ ràng, bài tập từng bước, lưu tiến độ và lịch tập 7 ngày.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body
        id="top"
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-slate-950 text-slate-50`}
      >
        <AnimatedBackground />
        <PwaRegister />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
