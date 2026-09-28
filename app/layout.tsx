import type {
  Metadata,
  Viewport,
} from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "سپهرینو | مدیریت پروژه و وظایف",
    template: "%s | سپهرینو",
  },
  description:
    "سامانه مدیریت پروژه، وظایف، کارمندان و گزارش‌های سپهرینو",
  applicationName: "سپهرینو",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <body className="app-background min-h-screen">
        {children}
      </body>
    </html>
  );
}