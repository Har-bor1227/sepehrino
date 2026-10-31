import type {
  Metadata,
  Viewport,
} from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/estedad/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "فرتاک تسکینگ | مدیریت پروژه و وظایف",
    template: "%s | فرتاک تسکینگ",
  },
  description:
    "سامانه مدیریت پروژه، وظایف، کارمندان و گزارش‌های فرتاک تسکینگ",
  applicationName: "فرتاک تسکینگ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f2f8f9",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#151818",
    },
  ],
};

/*
  تم را قبل از اولین رندر تنظیم می‌کند تا هنگام بارگذاری
  صفحه‌ی روشن برای لحظه‌ای دیده نشود.
  اگر کاربر تمی انتخاب نکرده باشد، تنظیم سیستم‌عامل ملاک است.
*/
const themeInitScript =
  '(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="min-h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>

      <body className="app-background min-h-screen">
        <a
          href="#main-content"
          className="skip-link"
        >
          پرش به محتوای اصلی
        </a>

        {children}
      </body>
    </html>
  );
}
