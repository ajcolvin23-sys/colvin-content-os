import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/ui/Analytics";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colvin Content OS",
  description: "Content Automation Dashboard — Colvin Enterprises",
};

// Root layout — no sidebar here.
// Sidebar lives in app/(app)/layout.tsx so login/auth pages are sidebar-free.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
