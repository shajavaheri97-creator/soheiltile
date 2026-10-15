import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "پنل مدیریت", template: "%s | بازرگانی سهیل" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#18c3c6" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
