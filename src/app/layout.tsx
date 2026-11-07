import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalonHub Admin",
  description:
    "SalonHub administration workspace for platform operations, moderation, and reporting.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><Script id="admin-theme" strategy="beforeInteractive">{`(function(){try{var saved=localStorage.getItem('salon-hub-admin-theme');var theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var palette=localStorage.getItem('salon-hub-admin-palette')||'ocean';var background=localStorage.getItem('salon-hub-admin-background')||'aurora';var font=localStorage.getItem('salon-hub-admin-font')||'modern';document.documentElement.dataset.theme=theme;document.documentElement.dataset.palette=palette;document.documentElement.dataset.background=background;document.documentElement.dataset.font=font;}catch(e){}})();`}</Script></head>
      <body>{children}</body>
    </html>
  );
}

