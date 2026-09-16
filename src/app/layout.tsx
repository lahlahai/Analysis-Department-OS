import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SO / Engineer — Architecture Workspace",
  description: "مساحة هندسة برمجيات متصلة بـ GitHub.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
