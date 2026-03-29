"use client";

import Link from "next/link";
import { useState } from "react";

const subPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Try it with no commitment.",
    features: ["3 cover exports/month", "1 AI generation", "Basic templates", "Watermarked PDF export", "Spine calculator"],
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
    priceId: null,
    mode: "subscription" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For active indie publishers.",
    features: ["Unlimited covers", "10 AI generations/mo", "No watermark", "300 DPI PDF export", "All templates", "Priority email support"],
    cta: "Get Pro",
    href: null,
    highlighted: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "price_pro",
    mode: "subscription" as const,
  },
  {
    name: "Business",
    price: "$49",
    period: "/mo",
    description: "For high-volume publishers.",
    features: ["Everything in Pro", "Commercial license", "Priority support", "Bulk export", "Custom branding removal", "Dedicated account manager"],
    cta: "Get Business",
    href: null,
    highlighted: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID ?? "price_business",
    mode: "subscription" as const,
  },
];

const creditPacks = [
  {
    name: "Starter Pack",
    price: "$19.99",
    description: "One-time purchase",
    includes: ["1 PDF export", "3 AI generations", "300 DPI quality", "Valid forever"],
    cta: "Buy Starter",
    priceId: "price_starter_pack",
    mode: "payment" as const,
    color: "border-white/[0.08] bg-white/[0.03]",
  },
  {
    name: "Pro Export",
    price: "$39.99",
    description: "One-time purchase",
    includes: ["1 PDF export", "10 AI generations", "300 DPI quality", "Commercial license", "Valid forever"],
    cta: "Buy Pro Export",
    priceId: "price_pro_export",
    mode: "payment" as const,
    color: "border-violet-500/40 bg-violet-500/5",
    popular: true,
  },
  {
    name: "Author Suite",
    price: "$59.99",
    description: "One-time purchase",
    includes: ["All export formats", "15 AI generations", "No cover branding", "Commercial license", "Valid forever"],
    cta: "Buy Author Suite",
    priceId: "price_author_suite",
    mode: "payment" as const,
    color: "border-white/[0.08] bg-white/[0.03]",
  },
  {
    name: "Marketing Suite",
    price: "$89.99",
    description: "One-time purchase",
    includes: ["Everything in Author Suite", "20 AI generations", "20 social media creatives", "Priority processing", "Valid forever"],
    cta: "Buy Marketing Suite",
    priceId: "price_marketing_suite",
    mode: "payment" as const,
    color: "border-amber-500/30 bg-amber-500/[0.04]",
  },
];

export default function PricingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(priceId: string, mode: "subscription" | "payment") {
    setLoadingPriceId(priceId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "Unauthorized") {
        window.location.href = "/signup";
      } else {
        setError(data.error || "Failed to start checkout");
        setLoadingPriceId(null);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoadingPriceId(null);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-6 text-center border-b border-white/[0.05]">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free. Subscribe monthly or buy export credits one-time. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold mb-2 text-center">Monthly Subscriptions</h2>
          <p className="text-white/50 text-sm text-center mb-10">Best for regular publishers. Cancel anytime.</p>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {subPlans.map((plan) => (
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
                {plan.href ? (
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
                ) : (
                  <button
                    onClick={() => plan.priceId && handleCheckout(plan.priceId, plan.mode)}
                    disabled={loadingPriceId !== null}
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-60 ${
                      plan.highlighted
                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
                        : "border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    {loadingPriceId === plan.priceId ? "Loading..." : plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Packs */}
      <section className="py-16 px-6 bg-white/[0.01] border-t border-white/[0.05]">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold mb-2 text-center">Pay-Per-Export Credits</h2>
          <p className="text-white/50 text-sm text-center mb-10">One-time purchase. No subscription. Credits never expire.</p>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creditPacks.map((pack) => (
              <div key={pack.name} className={`relative rounded-2xl border p-6 flex flex-col ${pack.color}`}>
                {pack.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-[11px] font-semibold text-white">
                    Best Value
                  </div>
                )}
                <p className="text-sm font-semibold mb-1">{pack.name}</p>
                <p className="text-2xl font-bold mb-0.5">{pack.price}</p>
                <p className="text-xs text-white/40 mb-4">{pack.description}</p>
                <ul className="space-y-2 flex-1 mb-5">
                  {pack.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/60">
                      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(pack.priceId, pack.mode)}
                  disabled={loadingPriceId !== null}
                  className="w-full rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-60 transition-colors py-2.5 text-sm font-semibold text-violet-300"
                >
                  {loadingPriceId === pack.priceId ? "Loading..." : pack.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold mb-8 text-center">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, you can cancel at any time. Your subscription remains active until the end of the billing period.",
              },
              {
                q: "Do credit packs expire?",
                a: "No. Credit pack purchases never expire. Use them whenever you need them.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal through Stripe's secure payment system.",
              },
              {
                q: "Do I need a subscription to use the free tools?",
                a: "No. The calculator, BSR tool, preflight checker, pen name generator, and AI concept generator are all free with no account required.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-sm font-semibold mb-2">{q}</p>
                <p className="text-sm text-white/50 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
