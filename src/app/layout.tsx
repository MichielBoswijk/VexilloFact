import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
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
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
