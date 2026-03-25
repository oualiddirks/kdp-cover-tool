import type { FC } from "react";
import Link from "next/link";

// ─── Header ──────────────────────────────────────────────────────────────────

const Header: FC = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
    <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
            <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">
          KDP<span className="text-violet-400">Cover</span>Tool
        </span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
        <a href="#problem" className="hover:text-white transition-colors">Why Us</a>
        <a href="#solution" className="hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden sm:block rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-4 py-2 text-sm font-medium text-white"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 text-sm font-medium text-white"
        >
          Get Started
        </Link>
      </div>
    </div>
  </header>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero: FC = () => (
  <section className="relative pt-32 pb-24 px-6 overflow-hidden">
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
      <div className="w-[800px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] translate-y-[-30%]" />
    </div>

    <div className="relative mx-auto max-w-4xl text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        Built for Amazon KDP publishers
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
        KDP Coloring Book Covers
        <br />
        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          That Never Get Rejected
        </span>
      </h1>

      <p className="mx-auto max-w-2xl text-lg text-white/60 mb-10">
        Stop guessing spine widths and fighting PDF export settings.
        KDP Cover Tool generates perfectly-sized, print-ready covers in minutes —
        every spec met, first time.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25"
        >
          Generate My Cover Free
        </Link>
        <a
          href="#solution"
          className="rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-8 py-3.5 text-base font-semibold text-white"
        >
          See How It Works
        </a>
      </div>

      {/* Mock cover preview */}
      <div className="mt-16 mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="rounded-xl bg-[#13131a] border border-white/5 aspect-[3/1] flex items-center justify-center gap-4 p-6">
          <div className="flex-1 h-full rounded-lg border-2 border-dashed border-violet-500/40 bg-violet-500/5 flex items-center justify-center">
            <span className="text-xs text-violet-400 font-medium">Back Cover</span>
          </div>
          <div className="w-8 h-full rounded border-2 border-dashed border-indigo-500/60 bg-indigo-500/10 flex items-center justify-center">
            <span className="text-[8px] text-indigo-400 font-medium rotate-90 whitespace-nowrap">SPINE</span>
          </div>
          <div className="flex-1 h-full rounded-lg border-2 border-dashed border-violet-500/40 bg-violet-500/5 flex items-center justify-center">
            <span className="text-xs text-violet-400 font-medium">Front Cover</span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-white/30">
          Auto-calculated layout — bleed, spine, trim marks included
        </p>
      </div>
    </div>
  </section>
);

// ─── Problem ──────────────────────────────────────────────────────────────────

const problems = [
  {
    icon: "📐",
    title: "Wrong Spine Width = Instant Rejection",
    description:
      "KDP calculates spine width based on page count and paper type. One millimeter off and your cover gets rejected after days of waiting.",
  },
  {
    icon: "🎨",
    title: "Canva Can't Export KDP-Compliant PDFs",
    description:
      "Canva looks great on screen, but it doesn't support the exact bleed, resolution, and color profile Amazon requires. Your uploads keep failing.",
  },
  {
    icon: "⏰",
    title: "Hours Wasted on Templates and Re-Uploads",
    description:
      "Between measuring margins, resizing files, and resubmitting rejected covers, you're spending hours on technicalities instead of creating books.",
  },
];

const Problem: FC = () => (
  <section id="problem" className="py-24 px-6">
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sound Familiar?</h2>
        <p className="text-white/50 max-w-xl mx-auto">
          Every KDP publisher hits these walls. The platform is powerful, but the cover requirements are unforgiving.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 hover:border-red-500/20 hover:bg-red-500/5 transition-all group"
          >
            <div className="text-3xl mb-4">{p.icon}</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-red-400 transition-colors">
              {p.title}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Solution ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: "Auto Spine Calculation",
    description:
      "Enter your page count and paper type. We compute the exact spine width KDP expects — no guesswork, no spreadsheets.",
    badge: "KDP Formula Built-In",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "KDP-Compliant PDF Export",
    description:
      "Download a print-ready PDF with correct bleed (0.125\"), 300 DPI, CMYK-safe colors, and trim marks — approved on first upload.",
    badge: "300 DPI · 0.125\" Bleed",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Coloring Book Templates",
    description:
      "Start from professionally designed templates tailored for coloring books — mandala, nature, floral, and more — fully customizable.",
    badge: "20+ Templates",
  },
];

const Solution: FC = () => (
  <section id="solution" className="py-24 px-6">
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Everything You Need,{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Nothing You Don&apos;t
          </span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto">
          KDP Cover Tool handles every technical requirement so you can focus on design and publishing.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
          >
            <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
              {f.icon}
            </div>
            <span className="inline-block mb-3 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-400">
              {f.badge}
            </span>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Pricing ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Try it out with no commitment.",
    features: [
      "3 cover exports / month",
      "Basic templates",
      "Auto spine calculation",
      "PDF download (watermarked)",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€14.99",
    period: "per month",
    description: "For active publishers scaling their catalog.",
    features: [
      "Unlimited cover exports",
      "All 20+ templates",
      "Auto spine calculation",
      "PDF download (no watermark)",
      "Priority email support",
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "€29.99",
    period: "per month",
    description: "For teams and high-volume publishers.",
    features: [
      "Everything in Pro",
      "5 team seats",
      "Bulk export (CSV upload)",
      "Custom branding",
      "Dedicated support",
    ],
    cta: "Get Business",
    highlighted: false,
  },
];

const Pricing: FC = () => (
  <section id="pricing" className="py-24 px-6">
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-white/50 max-w-xl mx-auto">
          Start free and upgrade when you need more. No hidden fees, no long-term contracts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 flex flex-col ${
              plan.highlighted
                ? "border-violet-500/50 bg-violet-500/5 shadow-xl shadow-violet-500/10"
                : "border-white/[0.08] bg-white/[0.03]"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium text-white/50 mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-white/40">/ {plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-white/50">{plan.description}</p>
            </div>

            <ul className="mb-8 space-y-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <svg className="mt-0.5 w-4 h-4 flex-shrink-0 text-violet-400" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                plan.highlighted
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
                  : "border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer: FC = () => (
  <footer className="border-t border-white/5 py-10 px-6 mt-auto">
    <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
            <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-sm font-medium">
          KDP<span className="text-violet-400">Cover</span>Tool
        </span>
      </div>

      <p className="text-xs text-white/30">
        © {new Date().getFullYear()} KDPCoverTool. Not affiliated with Amazon KDP.
      </p>

      <div className="flex items-center gap-5 text-xs text-white/40">
        <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
        <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
        <a href="#" className="hover:text-white/70 transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
