"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type Scene = "flat" | "angled" | "standing";

export default function MockupPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scene, setScene] = useState<Scene>("angled");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
  }

  const scenes: { id: Scene; label: string; style: React.CSSProperties }[] = [
    {
      id: "flat",
      label: "Flat",
      style: { transform: "none" },
    },
    {
      id: "angled",
      label: "Angled",
      style: { transform: "perspective(800px) rotateY(-20deg) rotateX(5deg)", boxShadow: "8px 12px 40px rgba(0,0,0,0.6)" },
    },
    {
      id: "standing",
      label: "Standing",
      style: { transform: "perspective(600px) rotateY(-35deg)", boxShadow: "12px 16px 48px rgba(0,0,0,0.7)" },
    },
  ];

  const currentScene = scenes.find(s => s.id === scene)!;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/tools" className="text-sm text-white/60 hover:text-white transition-colors">← Back to Tools</Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9"/><rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5"/></svg>
          </div>
          <span className="text-sm font-semibold">KDP<span className="text-violet-400">Cover</span>Tool</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">📖</div>
          <h1 className="text-3xl font-bold mb-2">Book Mockup Generator</h1>
          <p className="text-white/50">Upload your cover image and preview it as a 3D book mockup.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
              <h2 className="text-sm font-semibold">Upload Cover</h2>
              <label onClick={() => fileRef.current?.click()}
                className="block w-full rounded-xl border-2 border-dashed border-white/20 hover:border-violet-500/40 bg-white/[0.02] cursor-pointer p-8 text-center transition-all">
                <svg className="w-8 h-8 mx-auto mb-3 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-white/50">{image ? "Change image" : "Click to upload"}</p>
                <p className="text-xs text-white/25 mt-1">JPG or PNG</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
              </label>

              <div>
                <label className="text-xs text-white/50 block mb-2">Scene Style</label>
                <div className="flex gap-2">
                  {scenes.map(s => (
                    <button key={s.id} onClick={() => setScene(s.id)}
                      className={`flex-1 py-2 rounded-lg text-sm border transition-all ${scene === s.id ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {image && (
                <a
                  href={image}
                  download="book-mockup.png"
                  className="block w-full rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors py-2.5 text-sm font-semibold text-white text-center"
                >
                  Download PNG
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center min-h-64 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.02] to-white/[0.01] p-8">
            {image ? (
              <div style={{ perspective: "1000px" }}>
                <img
                  src={image}
                  alt="Book mockup"
                  style={{
                    width: "200px",
                    display: "block",
                    borderRadius: "2px",
                    ...currentScene.style,
                    transition: "transform 0.4s ease",
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-white/20">
                <div className="text-6xl mb-3">📗</div>
                <p className="text-sm">Upload a cover to preview</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
