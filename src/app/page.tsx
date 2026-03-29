"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="relative pt-24 pb-20 px-6 overflow-hidden">
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
      <div className="w-[900px] h-[500px] rounded-full bg-violet-600/8 blur-[140px] translate-y-[-20%]" />
    </div>

    <div className="relative mx-auto max-w-5xl text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        Free tools for Amazon KDP publishers
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
        Create KDP-Compliant Book Covers
        <br />
        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          in 3 Minutes
        </span>
      </h1>

      <p className="mx-auto max-w-2xl text-lg text-white/60 mb-8">
        Fix Canva KDP dimension & size errors automatically. Professional covers that pass Amazon&apos;s review the first time.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
        <Link
          href="/dashboard/new"
          className="rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/25"
        >
          Auto-Size Cover Creator
        </Link>
        <Link
          href="/tools/converter"
          className="rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-8 py-3.5 text-base font-semibold text-white"
        >
          Fix My Canva Design
        </Link>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-14">
        {[
          "KDP Cover Preflight",
          "One-click Canva Fix",
          "Spine Width Calculator",
          "300 DPI Export",
        ].map((badge) => (
          <span key={badge} className="flex items-center gap-1.5 text-sm text-white/60">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {badge}
          </span>
        ))}
      </div>

      {/* Animated book mockup */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
        <div className="rounded-xl bg-[#0d0d16] border border-white/5 aspect-[3/1] flex items-center justify-center gap-3 p-6">
          <div className="flex-1 h-full rounded-lg border-2 border-dashed border-violet-500/40 bg-violet-500/5 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-1.5 bg-violet-500/30 rounded" />
            <div className="w-16 h-1 bg-violet-500/20 rounded" />
            <div className="w-10 h-1 bg-violet-500/20 rounded" />
            <span className="text-[10px] text-violet-400/60 font-medium mt-1">Back Cover</span>
          </div>
          <div className="w-10 h-full rounded border-2 border-dashed border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full h-px bg-indigo-500/10" />
              ))}
            </div>
            <span className="text-[7px] text-indigo-400 font-bold rotate-90 whitespace-nowrap relative">SPINE</span>
          </div>
          <div className="flex-1 h-full rounded-lg border-2 border-dashed border-violet-500/40 bg-gradient-to-b from-violet-500/10 to-indigo-500/5 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded bg-violet-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="w-14 h-1 bg-violet-400/40 rounded" />
            <div className="w-10 h-1 bg-violet-400/25 rounded" />
            <span className="text-[10px] text-violet-400/60 font-medium">Front Cover</span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-white/30">
          Auto-calculated layout — bleed, spine, trim marks all included
        </p>
      </div>
    </div>
  </section>
);

// ─── Problem / Solution Strip ─────────────────────────────────────────────────

const ProblemSolution = () => (
  <section className="py-16 px-6 bg-red-500/[0.03] border-y border-red-500/10">
    <div className="mx-auto max-w-6xl">
      <h2 className="text-center text-2xl font-bold mb-10">
        Stop getting KDP rejection emails
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            problem: "Wrong Spine Width",
            problemDesc: "KDP calculates spine based on page count and paper type. One mm off = instant rejection.",
            solution: "Auto-calculated spine width for every book",
          },
          {
            problem: "Missing Bleed",
            problemDesc: "KDP requires exactly 0.125\" bleed on all sides. Most designers forget or get it wrong.",
            solution: "Automatic bleed applied on all four sides",
          },
          {
            problem: "Wrong DPI",
            problemDesc: "KDP requires 300 DPI minimum. Canva exports at 96 DPI by default — causing blurry prints.",
            solution: "Export at 300 DPI with correct color profile",
          },
        ].map(({ problem, problemDesc, solution }) => (
          <div key={problem} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">✗</span>
              <h3 className="text-sm font-semibold text-red-400">{problem}</h3>
            </div>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">{problemDesc}</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-4 h-4 text-emerald-400 shrink-0 text-xs font-bold">✓</span>
              <p className="text-xs text-emerald-300 font-medium">{solution}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Feature Grid ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: "Precision Spine Calculator",
    description: "Calculate exact spine width based on paper type and page count. Always matches KDP's official formula.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    title: "Intelligent Bleed System",
    description: 'Automatic 0.125" bleed on all sides with safe zone guides visible in the editor. Never miss a margin.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "AI Cover Generation",
    description: "Generate professional cover concepts using AI in seconds. Choose from genre, style, and mood.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
      </svg>
    ),
    title: "One-click Canva Fix",
    description: "Upload your Canva design and fix dimensions automatically. Add bleed, correct DPI, generate full wrap.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "300 DPI Export",
    description: "Export print-ready PDFs that meet KDP's quality requirements. No blurry images, no rejection.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: "Real-time Preflight",
    description: "Instant checking against all KDP requirements before export. Know your cover will pass before uploading.",
  },
];

const FeatureGrid = () => (
  <section className="py-24 px-6">
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Everything to Get Your Cover{" "}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Approved
          </span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto">
          KDP Cover Tool handles every technical requirement so you can focus on design and publishing.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all"
          >
            <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400">
              {f.icon}
            </div>
            <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Comparison Table ─────────────────────────────────────────────────────────

const comparisonRows = [
  { feature: "Automatic KDP dimensions", us: true, them: false },
  { feature: "Spine width calculation", us: true, them: "Manual" },
  { feature: "Preflight checking", us: true, them: false },
  { feature: "Canva fix tool", us: true, them: false },
  { feature: "AI cover generation", us: true, them: "$$$" },
  { feature: "Free to start", us: true, them: "Limited" },
];

const ComparisonTable = () => (
  <section className="py-20 px-6 bg-white/[0.01] border-y border-white/[0.05]">
    <div className="mx-auto max-w-4xl">
      <h2 className="text-center text-2xl sm:text-3xl font-bold mb-10">How We Compare</h2>
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="grid grid-cols-3 bg-white/[0.04] px-6 py-3.5 text-xs font-semibold text-white/50 uppercase tracking-wider">
          <span>Feature</span>
          <span className="text-center text-violet-400">KDP Cover Tool</span>
          <span className="text-center">Generic Design Tools</span>
        </div>
        {comparisonRows.map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-3 px-6 py-4 items-center ${i % 2 === 0 ? "" : "bg-white/[0.015]"} border-t border-white/[0.04]`}>
            <span className="text-sm text-white/70">{row.feature}</span>
            <div className="text-center">
              {row.us === true ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">✓</span>
              ) : (
                <span className="text-sm text-red-400">✗</span>
              )}
            </div>
            <div className="text-center">
              {row.them === false ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">✗</span>
              ) : (
                <span className="text-sm text-white/40">{row.them}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── How It Works ─────────────────────────────────────────────────────────────

const HowItWorks = () => (
  <section className="py-24 px-6">
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold mb-3">How It Works</h2>
        <p className="text-white/50">From book details to approved KDP cover in three simple steps.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {[
          {
            step: "1",
            title: "Enter Your Book Details",
            desc: "Input page count, trim size, and paper type. We calculate the exact spine width instantly using KDP's formula.",
          },
          {
            step: "2",
            title: "Design Your Cover",
            desc: "Use our canvas editor or upload your existing design. Add text, images, and customize every element.",
          },
          {
            step: "3",
            title: "Export & Publish",
            desc: "Download a print-ready PDF with 300 DPI, correct bleed, and all KDP specs met. Upload and publish.",
          },
        ].map(({ step, title, desc }) => (
          <div key={step} className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white mb-5 shadow-lg shadow-violet-600/25">
              {step}
            </div>
            <h3 className="text-base font-semibold mb-2">{title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/dashboard/new" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25">
          Start Creating Free
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
);

// ─── Pricing ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Try it with no commitment.",
    features: ["3 cover exports/month", "1 AI generation", "Basic templates", "Watermarked PDF"],
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For active publishers.",
    features: ["Unlimited covers", "10 AI generations/mo", "No watermark", "300 DPI export", "All templates"],
    cta: "Get Pro",
    href: "/pricing",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "/mo",
    description: "For high-volume publishers.",
    features: ["Everything in Pro", "Commercial license", "Priority support", "Bulk export", "Custom branding"],
    cta: "Get Business",
    href: "/pricing",
    highlighted: false,
  },
];

const PricingSection = () => (
  <section className="py-24 px-6 bg-white/[0.01] border-t border-white/[0.04]" id="pricing">
    <div className="mx-auto max-w-5xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold mb-3">Simple Pricing</h2>
        <p className="text-white/50 max-w-md mx-auto">Start free. Upgrade when you need more. No hidden fees.</p>
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
              <div className="flex items-baseline gap-0.5">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-white/50">{plan.description}</p>
            </div>
            <ul className="mb-8 space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
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

      <p className="text-center mt-6 text-sm text-white/40">
        Need one-time exports?{" "}
        <Link href="/pricing" className="text-violet-400 hover:text-violet-300 transition-colors">
          View pay-per-export packs →
        </Link>
      </p>
    </div>
  </section>
);

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Sarah Mitchell",
    title: "Children's Book Author",
    quote: "I was getting rejected every time on KDP. KDP Cover Tool fixed my spine width issue instantly — my cover went through first try!",
    avatar: "SM",
  },
  {
    name: "James Caldwell",
    title: "Thriller Novelist",
    quote: "The Canva fix tool is a game changer. I design in Canva then run it through here to get a proper print-ready PDF. Saves hours.",
    avatar: "JC",
  },
  {
    name: "Patricia Wong",
    title: "Coloring Book Publisher",
    quote: "I've published 23 coloring books and this tool has been essential for every single one. The spine calculator alone is worth it.",
    avatar: "PW",
  },
  {
    name: "David Hernandez",
    title: "Self-Help Author",
    quote: "As a first-time author I was completely lost on cover specs. This tool explained everything and did the hard work for me.",
    avatar: "DH",
  },
  {
    name: "Rachel Barnes",
    title: "Romance Writer",
    quote: "The AI cover generator gave me three amazing concepts in 10 seconds. I used one as the basis for my bestseller cover.",
    avatar: "RB",
  },
  {
    name: "Michael Torres",
    title: "Business Book Author",
    quote: "The preflight checker caught a safe zone violation I would have completely missed. Saved me from another rejection cycle.",
    avatar: "MT",
  },
];

const Testimonials = () => (
  <section className="py-24 px-6">
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold mb-3">Loved by Indie Authors</h2>
        <p className="text-white/50">Join 12,000+ authors who publish with confidence.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-sm text-white/70 leading-relaxed mb-5">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-white/40">{t.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "What KDP cover formats does this tool support?",
    a: "We support all KDP paperback trim sizes including 5x8, 5.5x8.5, 6x9, 8x10, and 8.5x11. We export PDF files that meet KDP's exact specifications.",
  },
  {
    q: "Why does KDP reject covers from Canva?",
    a: "Canva exports at 96 DPI instead of the required 300 DPI. It also doesn't handle bleed correctly for KDP, and the PDF compression can be too aggressive. Our Canva Fix tool corrects all of these issues.",
  },
  {
    q: "How is spine width calculated?",
    a: "KDP's spine width formula is: page count × paper thickness multiplier. White paper uses 0.002252 inches per page, cream paper uses 0.0025 inches per page, and color paper uses 0.002347 inches per page.",
  },
  {
    q: "Do I need an account to use the tools?",
    a: "No! All calculator, preflight, BSR, and AI concept tools are completely free with no account required. Creating and exporting full-resolution covers requires an account.",
  },
  {
    q: "What file formats can I export?",
    a: "Free plan exports watermarked PDFs. Pro and Business plans export full 300 DPI print-ready PDFs suitable for direct KDP upload.",
  },
  {
    q: "Can I use this for hardcover books?",
    a: "Currently we focus on KDP paperback covers. Hardcover cover wrap dimensions are different and we plan to add hardcover support soon.",
  },
  {
    q: "What is a cover preflight check?",
    a: "Preflight is a professional printing term for checking a file before it goes to print. Our tool checks your cover for DPI, dimensions, bleed, safe zones, and other KDP requirements.",
  },
  {
    q: "Is the AI generator free?",
    a: "The AI cover concept generator is free for 1 generation per day without an account. Pro accounts get 10 generations per month, Business gets unlimited.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-white/[0.01] border-t border-white/[0.04]">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-white/50">Everything you need to know about KDP Cover Tool.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-white/[0.08] overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-white/[0.03] transition-colors"
              >
                {faq.q}
                <svg
                  className={`w-4 h-4 text-white/40 shrink-0 ml-3 transition-transform ${open === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/[0.06]">
                  <div className="pt-3">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Newsletter CTA ───────────────────────────────────────────────────────────

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-xl text-center">
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-10">
          <h2 className="text-2xl font-bold mb-2">KDP Tips & Updates</h2>
          <p className="text-white/50 mb-6">
            Join 12,000+ indie authors. Get weekly KDP publishing tips, tool updates, and cover design inspiration.
          </p>
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              You&apos;re subscribed! Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all"
              />
              <button type="submit" className="rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors px-5 py-2.5 text-sm font-semibold text-white shrink-0">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSolution />
      <FeatureGrid />
      <ComparisonTable />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </main>
  );
}
