import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Tools – KDP Cover Tool",
  description: "Free tools for Amazon KDP publishers: spine calculator, AI generator, pen name generator, BSR calculator, preflight checker, and more.",
};

const tools = [
  {
    href: "/tools/ai-generator",
    icon: "✨",
    title: "AI Cover Generator",
    description: "Generate professional cover concepts using AI. Choose genre, style, and mood to get 4 unique design ideas.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/calculator",
    icon: "📐",
    title: "Cover Calculator",
    description: "Enter page count, trim size, and paper type to instantly get exact spine width and full cover dimensions.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/pen-name-generator",
    icon: "✍️",
    title: "Pen Name Generator",
    description: "Generate 10 unique pen name suggestions tailored to your genre and writing style.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/bsr-calculator",
    icon: "📊",
    title: "BSR Calculator",
    description: "Convert Amazon Best Seller Rank to estimated daily sales and monthly royalties instantly.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/preflight",
    icon: "🔍",
    title: "KDP Preflight Checker",
    description: "Upload your cover image and check it against KDP requirements: DPI, dimensions, safe zones, and more.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/converter",
    icon: "🔄",
    title: "Ebook Converter",
    description: "Upload your front cover, enter your page count, and generate a full-wrap paperback cover instantly.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/coloring-book",
    icon: "🖍️",
    title: "Coloring Book Maker",
    description: "Specialized cover maker for 8.5×11 coloring books. Auto spine, instant preview, PDF export.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/coloring-book-interior",
    icon: "🎨",
    title: "AI Coloring Book Concepts",
    description: "Generate 4 detailed coloring book page concepts with descriptions, difficulty levels, and style tags.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/mockup",
    icon: "📖",
    title: "Book Mockup Generator",
    description: "Upload your cover and generate a professional 3D book mockup for marketing and social media.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/templates",
    icon: "🗂️",
    title: "Cover Templates",
    description: "Browse 16+ professionally designed templates for coloring books, fiction, non-fiction, journals, and more.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16 px-6 border-b border-white/[0.05]">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Free KDP Publisher Tools</h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Everything you need to publish professionally on Amazon KDP. No account required for any of these tools.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all"
              >
                <div className="text-3xl mb-4">{tool.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-semibold group-hover:text-violet-300 transition-colors">{tool.title}</h2>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Need a Full Cover?</h3>
            <p className="text-white/50 text-sm mb-5">
              Our Cover Creator gives you a full canvas editor with real-time preview, all the right dimensions, and one-click PDF export.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 text-sm font-semibold text-white"
            >
              Open Cover Creator
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
