import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://slgs-ai-innovation-web-portal.vercel.app")
  ),
  title:
    "KNS and SLGS AI Innovation Programme 2026",
  description:
    "Facilitated by KNS in partnership with Sierra Leone Grammar School. Selected students work with mentors to build web apps that solve Sierra Leone problems.",
  icons: {
    icon: "/images/brand/Logo.png",
    apple: "/images/brand/Logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

const themeInitScript = `
(function() {
  try {
    var path = (location.pathname || '/').split('?')[0];
    var portalPrefixes = [
      '/dashboard','/team','/team-chat','/mentor-chat','/workspace','/kanban',
      '/announcements','/leaderboard','/submit','/settings','/notifications',
      '/onboarding','/mentor','/admin'
    ];
    var isPortal = portalPrefixes.some(function(p) {
      return path === p || path.indexOf(p + '/') === 0;
    });
    var key = isPortal ? 'ghs-portal-theme' : 'ghs-site-theme';
    var stored = localStorage.getItem(key);
    if (!(stored === 'light' || stored === 'dark') && isPortal) {
      stored = localStorage.getItem('ghs-theme');
    }
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} min-h-screen overflow-x-hidden font-sans antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
