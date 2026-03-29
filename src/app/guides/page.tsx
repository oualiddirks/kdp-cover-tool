import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KDP Publishing Guides – KDP Cover Tool",
  description: "Free guides for Amazon KDP publishers. Learn about cover specs, spine width, bleed settings, Canva fixes, and more.",
};

const guides = [
  {
    slug: "kdp-cover-rejection-checklist",
    title: "KDP Cover Rejection Checklist 2026",
    excerpt: "The complete checklist to ensure your KDP cover passes first time. Covers every common rejection reason with fixes.",
    readTime: "8 min read",
    date: "Jan 15, 2026",
    category: "Checklists",
  },
  {
    slug: "spine-width-calculation",
    title: "How to Calculate KDP Spine Width",
    excerpt: "A complete guide to KDP's spine width formula. Learn why page count and paper type affect your spine, and how to get it exactly right.",
    readTime: "6 min read",
    date: "Jan 22, 2026",
    category: "Technical",
  },
  {
    slug: "canva-to-kdp-guide",
    title: "Canva to KDP: The Complete Fix Guide",
    excerpt: "Everything that goes wrong when you export from Canva to KDP, and exactly how to fix each issue.",
    readTime: "10 min read",
    date: "Feb 3, 2026",
    category: "Canva",
  },
  {
    slug: "kdp-cover-size-requirements",
    title: "KDP Cover Size Requirements 2026",
    excerpt: "All KDP trim sizes, required bleed, safe zones, DPI requirements, and file specifications in one comprehensive guide.",
    readTime: "7 min read",
    date: "Feb 10, 2026",
    category: "Specifications",
  },
  {
    slug: "bleed-and-safe-zone-guide",
    title: "Bleed and Safe Zone Guide for KDP",
    excerpt: "What is bleed? What is a safe zone? Why does KDP require them? A beginner-friendly guide with visual examples.",
    readTime: "5 min read",
    date: "Feb 18, 2026",
    category: "Basics",
  },
  {
    slug: "hardcover-vs-paperback",
    title: "Hardcover vs Paperback Cover Differences",
    excerpt: "KDP hardcover and paperback covers have different specifications. Learn the key differences and what to watch out for.",
    readTime: "6 min read",
    date: "Feb 25, 2026",
    category: "Formats",
  },
  {
    slug: "ai-cover-art-for-kdp",
    title: "AI Cover Art for KDP: What Works",
    excerpt: "How to use AI image generators for KDP book covers, what styles work, what to avoid, and how to stay compliant.",
    readTime: "9 min read",
    date: "Mar 4, 2026",
    category: "AI & Design",
  },
  {
    slug: "first-time-author-cover-guide",
    title: "First-Time KDP Author Cover Guide",
    excerpt: "A complete beginner's guide to creating your first KDP cover. Step-by-step with no assumed knowledge.",
    readTime: "12 min read",
    date: "Mar 11, 2026",
    category: "Beginner",
  },
];

const categoryColors: Record<string, string> = {
  "Checklists": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Technical": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Canva": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Specifications": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Basics": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Formats": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "AI & Design": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Beginner": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">KDP Publishing Guides</h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Free, in-depth guides to help you publish professional books on Amazon KDP. No fluff, just actionable advice.
          </p>
        </div>

        <div className="space-y-5">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${categoryColors[guide.category] ?? "bg-white/10 text-white/40 border-white/10"}`}>
                      {guide.category}
                    </span>
                    <span className="text-xs text-white/30">{guide.date}</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/30">{guide.readTime}</span>
                  </div>
                  <h2 className="text-base font-semibold group-hover:text-violet-300 transition-colors mb-2">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed">{guide.excerpt}</p>
                </div>
                <svg className="w-5 h-5 text-white/20 group-hover:text-violet-400 transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8">
          <h3 className="text-lg font-semibold mb-2">Want more KDP tips?</h3>
          <p className="text-white/50 text-sm mb-5">Join 12,000+ indie authors. Get weekly guides and tool updates.</p>
          <Link href="/#newsletter" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 text-sm font-semibold text-white">
            Subscribe Free
          </Link>
        </div>
      </div>
    </main>
  );
}
