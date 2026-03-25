import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free KDP Tools – KDP Cover Tool",
  description: "Free tools for Amazon KDP publishers: spine calculator, mockup generator, AI cover ideas, and ebook converter.",
};

const tools = [
  {
    href: "/tools/calculator",
    icon: "📐",
    title: "KDP Cover Size Calculator",
    description: "Enter page count, trim size, and paper type to instantly get the exact spine width and full cover dimensions KDP requires.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/mockup",
    icon: "📖",
    title: "Book Mockup Generator",
    description: "Upload your cover image and generate a professional 3D book mockup. Choose from flat, angled, or standing scenes.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/ai-generator",
    icon: "✨",
    title: "AI Cover Idea Generator",
    description: "Describe your book and get AI-generated cover concept descriptions with color palette suggestions for any genre.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/tools/converter",
    icon: "🔄",
    title: "Ebook to Paperback Converter",
    description: "Upload your front cover, enter your page count, and instantly generate a full-wrap paperback cover with spine and back.",
    badge: "Free",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    href: "/dashboard/new",
    icon: "🎨",
    title: "Cover Creator",
    description: "Full canvas cover editor with real-time preview, image upload, text tools, and one-click PDF export.",
    badge: "Account",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
              <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold">KDP<span className="text-violet-400">Cover</span>Tool</span>
        </Link>
        <Link href="/dashboard" className="rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 text-sm font-medium text-white">
          Dashboard
        </Link>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Free KDP Publisher Tools</h1>
          <p className="text-white/50 max-w-xl mx-auto">Everything you need to publish on Amazon KDP — no account required for the free tools.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
              <div className="text-3xl mb-4">{tool.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold group-hover:text-violet-300 transition-colors">{tool.title}</h2>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tool.badgeColor}`}>{tool.badge}</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{tool.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
