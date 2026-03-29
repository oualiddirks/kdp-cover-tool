"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const toolsDropdown = [
  { href: "/tools/ai-generator", label: "AI Cover Generator" },
  { href: "/tools/calculator", label: "Cover Calculator" },
  { href: "/tools/pen-name-generator", label: "Pen Name Generator" },
  { href: "/tools/bsr-calculator", label: "BSR Calculator" },
  { href: "/tools/preflight", label: "KDP Preflight Checker" },
  { href: "/tools/converter", label: "Ebook Converter" },
  { href: "/tools/coloring-book", label: "Coloring Book Maker" },
  { href: "/tools/coloring-book-interior", label: "AI Coloring Book" },
  { href: "/tools/mockup", label: "Book Mockup" },
  { href: "/tools/templates", label: "Cover Templates" },
];

function Header() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
              <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">
            KDP<span className="text-violet-400">Cover</span>Tool
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-white/60">
          <Link href="/dashboard/new" className="hover:text-white transition-colors">Cover Creator</Link>
          <Link href="/tools/calculator" className="hover:text-white transition-colors">Calculator</Link>

          {/* Tools dropdown */}
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="flex items-center gap-1 hover:text-white transition-colors py-1">
              Tools
              <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 rounded-xl border border-white/10 bg-[#0d0d16] shadow-2xl py-1.5 z-50">
                {toolsDropdown.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="block px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>

        {/* Right Side */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-4 py-2 text-sm font-medium text-white">
            Sign In
          </Link>
          <Link href="/signup" className="rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 text-sm font-medium text-white">
            Start Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/5 bg-[#0d0d16] px-6 py-4 space-y-3">
          <Link href="/dashboard/new" className="block text-sm text-white/70 hover:text-white py-1" onClick={() => setMobileOpen(false)}>Cover Creator</Link>
          <Link href="/tools/calculator" className="block text-sm text-white/70 hover:text-white py-1" onClick={() => setMobileOpen(false)}>Calculator</Link>
          <div className="pt-1 pb-1">
            <p className="text-xs font-medium text-white/30 mb-2 uppercase tracking-wider">Tools</p>
            {toolsDropdown.map((t) => (
              <Link key={t.href} href={t.href} className="block text-sm text-white/60 hover:text-white py-1 pl-2" onClick={() => setMobileOpen(false)}>
                {t.label}
              </Link>
            ))}
          </div>
          <Link href="/guides" className="block text-sm text-white/70 hover:text-white py-1" onClick={() => setMobileOpen(false)}>Guides</Link>
          <Link href="/pricing" className="block text-sm text-white/70 hover:text-white py-1" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
            <Link href="/signup" className="flex-1 text-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white" onClick={() => setMobileOpen(false)}>Start Free</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { label: "Cover Creator", href: "/dashboard/new" },
                { label: "Templates", href: "/tools/templates" },
                { label: "Pricing", href: "/pricing" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((l) => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Tools</p>
            <ul className="space-y-2.5">
              {toolsDropdown.map((t) => (
                <li key={t.href}><Link href={t.href} className="text-sm text-white/50 hover:text-white transition-colors">{t.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {[
                { label: "About", href: "/about" },
                { label: "Guides", href: "/guides" },
                { label: "Contact", href: "/contact" },
                { label: "Blog", href: "/guides" },
              ].map((l) => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ].map((l) => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
                <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <span className="text-sm font-medium">KDP<span className="text-violet-400">Cover</span>Tool</span>
          </div>

          <p className="text-xs text-white/30">© 2026 KDP Cover Tool. All rights reserved. Not affiliated with Amazon KDP.</p>

          <div className="flex items-center gap-4">
            <a href="https://twitter.com" aria-label="Twitter" className="text-white/30 hover:text-white/70 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://youtube.com" aria-label="YouTube" className="text-white/30 hover:text-white/70 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="mailto:support@kdpcovertool.com" aria-label="Email" className="text-white/30 hover:text-white/70 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Dashboard has its own layout (sidebar), auth pages don't need header/footer
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname === "/login" || pathname === "/signup";

  if (isDashboard || isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="flex-1 pt-[65px]">
        {children}
      </div>
      <Footer />
    </>
  );
}

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
      <head>
        <title>KDP Cover Tool – Create KDP-Compliant Book Covers</title>
        <meta name="description" content="Create KDP-compliant book covers in minutes. Fix Canva KDP dimension errors, auto spine calculation, 300 DPI export. Free tools for indie authors." />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#f0f0f5]">
        <ToastProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
