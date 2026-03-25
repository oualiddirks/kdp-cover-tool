import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KDP Cover Tool – Print-Ready Coloring Book Covers",
  description:
    "Generate KDP-compliant, print-ready coloring book cover PDFs in minutes. Auto spine calculation, exact bleed setup, zero rejections.",
  keywords: ["KDP", "coloring book", "cover", "PDF", "Amazon KDP", "self-publishing"],
  openGraph: {
    title: "KDP Cover Tool",
    description: "Generate perfectly-sized, print-ready KDP covers in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#f0f0f5]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
