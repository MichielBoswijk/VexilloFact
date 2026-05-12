import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vexillo",
  description: "A mobile-first country flag quiz",
  applicationName: "Vexillo",
  appleWebApp: {
    capable: true,
    title: "Vexillo",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors duration-200 dark:bg-slate-950">
            <AppNav />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
