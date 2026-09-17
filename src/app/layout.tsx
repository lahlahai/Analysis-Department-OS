import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "قسم فريق تحليل المشاريع | Analysis Department OS",
  description: "منصة موحدة لملفات وروابط ومراجع فريق تحليل المشاريع.",
  icons: {
    icon: [
      { url: "/brand/site-logo.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/png" },
    ],
    shortcut: "/brand/site-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body suppressHydrationWarning>{children}</body></html>;
}
