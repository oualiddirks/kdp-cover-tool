"use client";

import { useState } from "react";
import Link from "next/link";

const BSR_TABLE = [
  { bsr: 1, daily: 3500 },
  { bsr: 10, daily: 800 },
  { bsr: 100, daily: 200 },
  { bsr: 1000, daily: 50 },
  { bsr: 5000, daily: 18 },
  { bsr: 10000, daily: 9 },
  { bsr: 50000, daily: 3 },
  { bsr: 100000, daily: 1.5 },
  { bsr: 500000, daily: 0.3 },
  { bsr: 1000000, daily: 0.1 },
];

function interpolateDailySales(bsr: number): number {
  if (bsr <= BSR_TABLE[0].bsr) return BSR_TABLE[0].daily;
  if (bsr >= BSR_TABLE[BSR_TABLE.length - 1].bsr) return BSR_TABLE[BSR_TABLE.length - 1].daily;

  for (let i = 0; i < BSR_TABLE.length - 1; i++) {
    const lower = BSR_TABLE[i];
    const upper = BSR_TABLE[i + 1];
    if (bsr >= lower.bsr && bsr <= upper.bsr) {
      // Logarithmic interpolation
      const logLower = Math.log(lower.bsr);
      const logUpper = Math.log(upper.bsr);
      const logBsr = Math.log(bsr);
      const t = (logBsr - logLower) / (logUpper - logLower);
      return lower.daily + (upper.daily - lower.daily) * t;
    }
  }
  return 0;
}

const ROYALTY_PER_SALE = 3.49;

export default function BSRCalculatorPage() {
  const [bsr, setBsr] = useState(50000);
  const [inputValue, setInputValue] = useState("50000");

  const handleInput = (val: string) => {
    setInputValue(val);
    const num = parseInt(val.replace(/,/g, ""), 10);
    if (!isNaN(num) && num > 0) setBsr(num);
  };

  const daily = interpolateDailySales(bsr);
  const monthly = daily * 30;
  const monthlyRoyalty = monthly * ROYALTY_PER_SALE;

  const maxBarDaily = 3500;
  const barWidth = Math.max(3, Math.min(100, (daily / maxBarDaily) * 100));

  const getRankLabel = () => {
    if (bsr <= 1000) return { label: "Bestseller", color: "text-emerald-400" };
    if (bsr <= 10000) return { label: "Strong Seller", color: "text-violet-400" };
    if (bsr <= 100000) return { label: "Steady Seller", color: "text-blue-400" };
    if (bsr <= 500000) return { label: "Occasional Sales", color: "text-amber-400" };
    return { label: "Low Activity", color: "text-red-400" };
  };

  const { label, color } = getRankLabel();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/tools" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Tools
        </Link>
        <span className="text-sm font-semibold">KDP<span className="text-violet-400">Cover</span>Tool</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-2">BSR Sales Calculator</h1>
          <p className="text-white/50">Convert Amazon Best Seller Rank (BSR) to estimated daily and monthly sales. No account required.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">
              Amazon BSR (Best Seller Rank)
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"
            />
            <p className="mt-1 text-xs text-white/30">Enter the BSR number shown on an Amazon product page</p>
          </div>

          <div>
            <input
              type="range"
              min={1}
              max={1000000}
              value={Math.min(bsr, 1000000)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setBsr(v);
                setInputValue(String(v));
              }}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1">
              <span>#1</span>
              <span>#1,000,000</span>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center">
              <p className="text-[10px] text-white/40 mb-1">Daily Sales</p>
              <p className="text-2xl font-bold text-violet-300">{daily.toFixed(1)}</p>
              <p className="text-[10px] text-white/30">books/day</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
              <p className="text-[10px] text-white/40 mb-1">Monthly Sales</p>
              <p className="text-2xl font-bold">{monthly.toFixed(0)}</p>
              <p className="text-[10px] text-white/30">books/month</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-[10px] text-white/40 mb-1">Est. Royalties</p>
              <p className="text-2xl font-bold text-emerald-400">${monthlyRoyalty.toFixed(0)}</p>
              <p className="text-[10px] text-white/30">per month</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">Sales Rate</p>
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/30">
              <span>Low</span>
              <span>Bestseller</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-white/50 leading-relaxed">
            <strong className="text-white/70">Assumptions:</strong> Based on Amazon Books category BSR data. Royalty estimate uses $3.49/book (70% royalty on ~$4.99 price point). Actual royalties depend on your price, file size, and delivery costs.
          </div>
        </div>

        {/* BSR reference table */}
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold">BSR Reference Table</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {BSR_TABLE.map((row) => (
              <div key={row.bsr} className="grid grid-cols-3 px-5 py-3 text-sm">
                <span className="text-white/50">BSR #{row.bsr.toLocaleString()}</span>
                <span className="text-center text-white/70">{row.daily} sales/day</span>
                <span className="text-right text-emerald-400">${(row.daily * 30 * ROYALTY_PER_SALE).toFixed(0)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
