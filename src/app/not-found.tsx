import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found – KDP Cover Tool",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
            <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-violet-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-white/50 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 text-sm font-semibold text-white"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-6 py-3 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
