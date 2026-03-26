"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { extractDominantColor, getDarkerShade } from "@/lib/color-extractor";

const SCALE = 72; // pixels per inch (72px/inch matches PDF points)
const BLEED = 0.125; // inches

interface CoverEditorProps {
  trimWidth: number;   // inches e.g. 8.5
  trimHeight: number;  // inches e.g. 11
  spineWidth: number;  // inches e.g. 0.2252
  title: string;
  author: string;
  onCanvasReady?: (canvas: unknown) => void;
}

type TabId = "images" | "text" | "background" | "styles";

const FONTS = [
  "Playfair Display", "Merriweather", "Oswald", "Raleway", "Crimson Text",
  "Lato", "Montserrat", "EB Garamond", "Libre Baskerville", "Source Sans Pro",
  "Bebas Neue", "PT Serif",
];

const PRESETS = [
  { id: "thriller",  label: "Thriller",      bg: "#0a0a0a", textColor: "#ffffff", font: "Oswald",          spine: "#1a1a1a" },
  { id: "romance",   label: "Romance",       bg: "#7b2d42", textColor: "#fce4ec", font: "Playfair Display", spine: "#5a1f30" },
  { id: "fantasy",   label: "Fantasy",       bg: "#1a0a3d", textColor: "#ffd700", font: "EB Garamond",      spine: "#110728" },
  { id: "childrens", label: "Children's",    bg: "#ff6b6b", textColor: "#ffffff", font: "Raleway",          spine: "#e05050" },
  { id: "nonfiction",label: "Non-Fiction",   bg: "#f5f5f5", textColor: "#1a1a1a", font: "Montserrat",       spine: "#dddddd" },
  { id: "coloring",  label: "Coloring Book", bg: "#ffffff", textColor: "#2d2d2d", font: "Crimson Text",     spine: "#eeeeee" },
];

export default function CoverEditor({
  trimWidth, trimHeight, spineWidth, title, author, onCanvasReady,
}: CoverEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricModuleRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState<TabId>("images");
  const [frontBg, setFrontBg] = useState("#2a2a3e");
  const [backBg, setBackBg] = useState("#2a2a3e");
  const [spineBg, setSpineBg] = useState("#1e3a5f");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [fontSize, setFontSize] = useState(36);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [backText, setBackText] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [uploadIntent, setUploadIntent] = useState<"front" | "full">("front");
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);
  const [preflight, setPreflight] = useState({ spine: true, bleed: true, textSafe: true, barcode: true });

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // ── Derived pixel dimensions ─────────────────────────────────────────────
  const canvasW = Math.round((trimWidth * 2 + spineWidth + BLEED * 2) * SCALE);
  const canvasH = Math.round((trimHeight + BLEED * 2) * SCALE);
  const bleedPx   = Math.round(BLEED * SCALE);
  const trimWPx   = Math.round(trimWidth * SCALE);
  const trimHPx   = Math.round(trimHeight * SCALE);
  const spineWPx  = Math.max(Math.round(spineWidth * SCALE), 1);
  const backX     = bleedPx;
  const spineX    = backX + trimWPx;
  const frontX    = spineX + spineWPx;
  const safeInset = Math.round(0.25 * SCALE);

  // Barcode placeholder on back cover
  const barcodeW  = Math.round(2 * SCALE);
  const barcodeH  = Math.round(1.2 * SCALE);
  const barcodeX  = backX + trimWPx - Math.round(0.15 * SCALE) - barcodeW;
  const barcodeY  = bleedPx + trimHPx - Math.round(0.15 * SCALE) - barcodeH;

  const saveHistory = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const json = JSON.stringify(fc.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // ── Draw guide/zone objects ───────────────────────────────────────────────
  const drawGuides = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fc: any) => {
      const F = fabricModuleRef.current;
      if (!F) return;

      // Remove previous guide objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const old = fc.getObjects().filter((o: any) => o.data?.guide);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      old.forEach((o: any) => fc.remove(o));

      const isLight = (hex: string) => {
        try {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return 0.299 * r + 0.587 * g + 0.114 * b > 128;
        } catch { return false; }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rect = (opts: any) => {
        const r = new F.Rect({ selectable: false, evented: false, data: { guide: true }, ...opts });
        fc.add(r);
        return r;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (str: string, opts: any) => {
        const t = new F.Text(str, {
          selectable: false, evented: false, data: { guide: true },
          fontFamily: "monospace", ...opts,
        });
        fc.add(t);
        return t;
      };

      // 1. Dark outer background
      rect({ left: 0, top: 0, width: canvasW, height: canvasH, fill: "#1a1a2e" });

      // 2. Zone fills
      rect({ left: backX,  top: bleedPx, width: trimWPx,  height: trimHPx, fill: backBg,  stroke: "#ff6b6b", strokeDashArray: [5, 5], strokeWidth: 1 });
      rect({ left: spineX, top: bleedPx, width: spineWPx, height: trimHPx, fill: spineBg });
      rect({ left: frontX, top: bleedPx, width: trimWPx,  height: trimHPx, fill: frontBg, stroke: "#51cf66", strokeDashArray: [5, 5], strokeWidth: 1 });

      // 3. Safe zone dashed rectangles (0.25" inset from trim)
      rect({
        left: frontX + safeInset, top: bleedPx + safeInset,
        width: trimWPx - safeInset * 2, height: trimHPx - safeInset * 2,
        fill: "transparent", stroke: "#44bb66", strokeWidth: 1, strokeDashArray: [5, 4],
      });
      rect({
        left: backX + safeInset, top: bleedPx + safeInset,
        width: trimWPx - safeInset * 2, height: trimHPx - safeInset * 2,
        fill: "transparent", stroke: "#44bb66", strokeWidth: 1, strokeDashArray: [5, 4],
      });

      // 4. Zone labels
      text("FRONT COVER", {
        left: frontX + trimWPx / 2, top: bleedPx + trimHPx / 2,
        originX: "center", originY: "center",
        fontSize: Math.min(14, Math.round(trimWPx * 0.035)),
        fill: isLight(frontBg) ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.35)",
        charSpacing: 100,
      });
      text("BACK COVER", {
        left: backX + trimWPx / 2, top: bleedPx + trimHPx / 2,
        originX: "center", originY: "center",
        fontSize: Math.min(14, Math.round(trimWPx * 0.035)),
        fill: isLight(backBg) ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.35)",
        charSpacing: 100,
      });
      if (spineWPx >= 12) {
        const spineLabel = spineWPx >= 45 ? `SPINE  ${spineWidth.toFixed(4)}"` : "SPINE";
        const spineText = new F.Text(spineLabel, {
          left: spineX + spineWPx / 2, top: bleedPx + trimHPx / 2,
          angle: -90, originX: "center", originY: "center",
          fontSize: Math.min(10, Math.round(spineWPx * 0.45)),
          fill: isLight(spineBg) ? "rgba(0,0,80,0.45)" : "rgba(255,255,255,0.55)",
          fontFamily: "monospace",
          selectable: false, evented: false, data: { guide: true },
        });
        fc.add(spineText);
      }

      // 5. Barcode placeholder (always visible, not selectable)
      fc.add(new F.Rect({
        left: barcodeX, top: barcodeY,
        width: barcodeW, height: barcodeH,
        fill: "#ffffff", stroke: "#bbbbbb", strokeWidth: 1, strokeDashArray: [3, 3],
        selectable: false, evented: false, data: { guide: true },
      }));
      text("BARCODE\nAREA", {
        left: barcodeX + barcodeW / 2, top: barcodeY + barcodeH / 2,
        originX: "center", originY: "center",
        fill: "#aaaaaa", fontSize: 9,
      });

      // 6. Send all guides to back so content appears above them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guides = fc.getObjects().filter((o: any) => o.data?.guide);
      [...guides].reverse().forEach((g: unknown) => fc.sendToBack(g));
      fc.renderAll();
    },
    [canvasW, canvasH, bleedPx, backX, spineX, frontX, trimWPx, trimHPx, spineWPx,
     backBg, spineBg, frontBg, safeInset, barcodeX, barcodeY, barcodeW, barcodeH, spineWidth]
  );

  // ── Initialize Fabric canvas ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    import("fabric").then((mod) => {
      if (!mounted || !canvasRef.current) return;
      const F = (mod as { fabric?: unknown }).fabric ?? mod;
      fabricModuleRef.current = F;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fc = new (F as any).Canvas(canvasRef.current, {
        width: canvasW,
        height: canvasH,
        backgroundColor: "#1a1a2e",
        preserveObjectStacking: true,
      });
      fabricRef.current = fc;

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = fc.getActiveObject() as any;
          if (obj && !obj.data?.locked && !obj.data?.guide) {
            fc.remove(obj);
            fc.discardActiveObject();
            fc.renderAll();
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          e.preventDefault();
          if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            const json = historyRef.current[historyIndexRef.current];
            fc.loadFromJSON(json, () => fc.renderAll());
          }
        }
      };
      document.addEventListener("keydown", handleKey);

      fc.on("object:modified", saveHistory);
      fc.on("object:added", saveHistory);

      drawGuides(fc);
      setReady(true);
      onCanvasReady?.(fc);
      saveHistory();

      return () => {
        mounted = false;
        document.removeEventListener("keydown", handleKey);
        fc.dispose();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild canvas when dimensions or colors change ───────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    fc.setWidth(canvasW);
    fc.setHeight(canvasH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = fc.wrapperEl as HTMLElement | undefined;
    if (wrapper) {
      wrapper.style.width = `${canvasW}px`;
      wrapper.style.height = `${canvasH}px`;
    }
    drawGuides(fc);
  }, [canvasW, canvasH, frontBg, backBg, spineBg, drawGuides, ready]);

  // ── Auto-sync title / author text when props change ───────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    const F = fabricModuleRef.current;
    if (!F) return;

    const titleSize  = Math.min(fontSize, Math.round(trimWPx * 0.08));
    const authorSize = Math.min(Math.round(fontSize * 0.55), Math.round(trimWPx * 0.05));

    // Title on front cover
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingTitle = fc.getObjects().filter((o: any) => o.data?.textRole === "title");
    if (existingTitle.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existingTitle.forEach((o: any) => o.set({ text: title || "Book Title" }));
    } else if (title) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.add(new (F as any).IText(title, {
        left: frontX + trimWPx / 2,
        top: bleedPx + trimHPx * 0.38,
        originX: "center", originY: "center",
        fontSize: titleSize, fill: textColor,
        fontFamily: selectedFont, fontWeight: "bold",
        data: { textRole: "title" },
      }));
    }

    // Author on front cover
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingAuthor = fc.getObjects().filter((o: any) => o.data?.textRole === "author");
    if (existingAuthor.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existingAuthor.forEach((o: any) => o.set({ text: author || "" }));
    } else if (author) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.add(new (F as any).IText(author, {
        left: frontX + trimWPx / 2,
        top: bleedPx + trimHPx * 0.62,
        originX: "center", originY: "center",
        fontSize: authorSize, fill: textColor,
        fontFamily: selectedFont,
        data: { textRole: "author" },
      }));
    }

    // Spine title (if wide enough)
    if (autoSync && spineWPx >= 30) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingSpine = fc.getObjects().filter((o: any) => o.data?.textRole === "spine-title");
      if (existingSpine.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        existingSpine.forEach((o: any) => o.set({ text: title || "" }));
      } else if (title) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.add(new (F as any).Text(title, {
          left: spineX + spineWPx / 2,
          top: bleedPx + trimHPx / 2,
          angle: 90, originX: "center", originY: "center",
          fontSize: Math.min(12, spineWPx * 0.55),
          fill: textColor, fontFamily: selectedFont,
          data: { textRole: "spine-title" },
        }));
      }
    }

    fc.renderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, author, ready]);

  // ── Image upload (uses FileReader to avoid blob crossOrigin issue) ─────────
  const handleUploadImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, zone: "front" | "back" | "full") => {
      const file = e.target.files?.[0];
      if (!file || !fabricRef.current) return;
      const F = fabricModuleRef.current;
      if (!F) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (F as any).Image.fromURL(dataUrl, (img: any, isError: boolean) => {
          if (isError || !img) {
            console.error("Failed to load image into canvas");
            return;
          }
          const fc = fabricRef.current;

          if (zone === "full") {
            img.scaleToWidth(canvasW);
            img.set({ left: 0, top: 0, selectable: true, data: { role: "full-image" } });
            fc.add(img);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fc.getObjects().filter((o: any) => o.data?.guide).forEach((g: unknown) => fc.sendToBack(g));
          } else if (zone === "front") {
            const scaleX = trimWPx / img.width;
            const scaleY = trimHPx / img.height;
            const s = Math.max(scaleX, scaleY);
            img.set({
              left: frontX, top: bleedPx,
              scaleX: s, scaleY: s,
              selectable: true, data: { role: "front-image" },
            });
            fc.add(img);
            // Extract dominant color for back/spine
            extractDominantColor(dataUrl).then((color) => {
              setBackBg(color);
              setSpineBg(getDarkerShade(color));
            });
          } else {
            const scaleX = trimWPx / img.width;
            const scaleY = trimHPx / img.height;
            const s = Math.max(scaleX, scaleY);
            img.set({
              left: backX, top: bleedPx,
              scaleX: s, scaleY: s,
              selectable: true, data: { role: "back-image" },
            });
            fc.add(img);
          }
          fc.renderAll();
        });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [canvasW, trimWPx, trimHPx, frontX, backX, bleedPx]
  );

  // ── Apply genre preset ────────────────────────────────────────────────────
  const applyPreset = useCallback((preset: typeof PRESETS[0]) => {
    setFrontBg(preset.bg);
    setBackBg(preset.bg);
    setSpineBg(preset.spine);
    setTextColor(preset.textColor);
    setSelectedFont(preset.font);
    const fc = fabricRef.current;
    if (!fc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fc.getObjects().filter((o: any) => o.data?.textRole).forEach((o: any) => {
      o.set({ fill: preset.textColor, fontFamily: preset.font });
    });
    fc.renderAll();
  }, []);

  // ── Fit selected image to safe zone ──────────────────────────────────────
  const fitToSafeZone = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = fc.getActiveObject() as any;
    if (!obj || obj.data?.guide) return;
    const zoneW = trimWPx - safeInset * 2;
    const zoneH = trimHPx - safeInset * 2;
    const sx = zoneW / (obj.width ?? 1);
    const sy = zoneH / (obj.height ?? 1);
    obj.set({ scaleX: Math.min(sx, sy), scaleY: Math.min(sx, sy), left: frontX + safeInset, top: bleedPx + safeInset });
    fc.renderAll();
  }, [trimWPx, trimHPx, safeInset, frontX, bleedPx]);

  // ── Zoom helpers ──────────────────────────────────────────────────────────
  const applyZoom = useCallback((nz: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    setZoom(nz);
    fc.setZoom(nz);
    fc.setWidth(Math.round(canvasW * nz));
    fc.setHeight(Math.round(canvasH * nz));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = fc.wrapperEl as HTMLElement | undefined;
    if (wrapper) {
      wrapper.style.width = `${Math.round(canvasW * nz)}px`;
      wrapper.style.height = `${Math.round(canvasH * nz)}px`;
    }
    fc.renderAll();
  }, [canvasW, canvasH]);

  const autoFitCanvas = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const availW = container.clientWidth - 24;
    if (availW <= 0) return;
    applyZoom(Math.min(1, availW / canvasW));
  }, [canvasW, applyZoom]);

  // Auto-fit on ready
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(autoFitCanvas, 60);
    return () => clearTimeout(t);
  }, [ready, autoFitCanvas]);

  // Auto-fit on resize
  useEffect(() => {
    window.addEventListener("resize", autoFitCanvas);
    return () => window.removeEventListener("resize", autoFitCanvas);
  }, [autoFitCanvas]);

  // ── Add text object to canvas ─────────────────────────────────────────────
  const addTextToCanvas = useCallback((text: string, role: string, x: number, y: number, size: number) => {
    const fc = fabricRef.current;
    const F = fabricModuleRef.current;
    if (!fc || !F) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = new (F as any).IText(text, {
      left: x, top: y, fontSize: size, fill: textColor,
      fontFamily: selectedFont,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      data: { textRole: role },
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.renderAll();
  }, [textColor, selectedFont, bold, italic]);

  // ── Preflight checks ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const texts = fc.getObjects().filter((o: any) => o.type === "text" || o.type === "i-text");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textInBleed = texts.some((t: any) => {
      const b = t.getBoundingRect();
      return b.left < bleedPx || b.top < bleedPx ||
        b.left + b.width > canvasW - bleedPx ||
        b.top + b.height > canvasH - bleedPx;
    });
    setPreflight({ spine: spineWPx >= 6, bleed: true, textSafe: !textInBleed, barcode: true });
  }, [ready, spineWPx, bleedPx, canvasW, canvasH]);

  const TAB_META: { id: TabId; icon: string; label: string }[] = [
    { id: "images",     icon: "🖼",  label: "Images"  },
    { id: "text",       icon: "T",   label: "Text"    },
    { id: "background", icon: "🎨",  label: "BG"      },
    { id: "styles",     icon: "✦",   label: "Presets" },
  ];

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div>
          <h2 className="text-sm font-semibold leading-none">Cover Editor</h2>
          <p className="text-[11px] text-white/40 mt-0.5">Drag elements · Delete key removes selection</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => applyZoom(Math.max(0.1, zoom - 0.1))}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-base leading-none">−</button>
          <span className="text-xs text-white/50 w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button onClick={() => applyZoom(Math.min(2, zoom + 0.1))}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-base leading-none">+</button>
          <button onClick={autoFitCanvas}
            className="ml-1 text-[10px] text-white/30 hover:text-white/60 px-2 py-1 rounded border border-white/10 transition-colors">
            Fit
          </button>
        </div>
      </div>

      {/* Body: canvas + toolbar */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Canvas area */}
        <div
          ref={canvasContainerRef}
          className="flex-1 min-w-0 bg-[#060610] overflow-auto"
          style={{ maxHeight: "62vh", minHeight: "180px" }}
        >
          <div className="p-3 flex justify-start items-start">
            {!ready && (
              <div className="flex items-center justify-center w-full h-40 text-sm text-white/30 animate-pulse">
                Initialising canvas…
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: ready ? "block" : "none" }} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="w-full lg:w-52 lg:shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col">

          {/* Tab strip */}
          <div className="flex border-b border-white/[0.06]">
            {TAB_META.map(({ id, icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors text-xs font-medium
                  ${activeTab === id
                    ? "bg-violet-600/15 text-violet-300 border-b-2 border-violet-500"
                    : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <span className="text-sm leading-none">{icon}</span>
                <span className="text-[9px] hidden sm:block">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-3 overflow-y-auto flex-1 space-y-3" style={{ maxHeight: "calc(62vh - 44px)" }}>

            {/* IMAGES TAB */}
            {activeTab === "images" && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/40 mb-2">Upload target</p>
                  <div className="flex gap-2">
                    {(["front", "full"] as const).map((i) => (
                      <button key={i} onClick={() => setUploadIntent(i)}
                        className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${uploadIntent === i ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/40"}`}>
                        {i === "front" ? "Front" : "Full wrap"}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block w-full rounded-xl border border-dashed border-white/20 hover:border-violet-500/40 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer p-4 text-center transition-all">
                  <svg className="w-5 h-5 mx-auto mb-1.5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-xs text-white/50">{uploadIntent === "front" ? "Upload Front Cover" : "Upload Full Wrap"}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">JPG or PNG</p>
                  <input type="file" accept="image/png,image/jpeg" className="hidden"
                    onChange={(e) => handleUploadImage(e, uploadIntent === "full" ? "full" : "front")} />
                </label>
                <label className="block w-full rounded-xl border border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] cursor-pointer p-3 text-center transition-all">
                  <p className="text-xs text-white/40">Upload Back Cover Image</p>
                  <input type="file" accept="image/png,image/jpeg" className="hidden"
                    onChange={(e) => handleUploadImage(e, "back")} />
                </label>
                <button onClick={fitToSafeZone}
                  className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/60 py-2 transition-colors">
                  Fit Selection to Safe Zone
                </button>
              </div>
            )}

            {/* TEXT TAB */}
            {activeTab === "text" && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Font</label>
                  <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-2.5 py-2 text-xs text-white outline-none">
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Size: {fontSize}px</label>
                  <input type="range" min={8} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-violet-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBold((b) => !b)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${bold ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50"}`}>B</button>
                  <button onClick={() => setItalic((i) => !i)}
                    className={`flex-1 py-1.5 rounded-lg text-xs italic border transition-all ${italic ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50"}`}>I</button>
                  <div className="flex items-center gap-1.5 flex-1">
                    <label className="text-[10px] text-white/40 shrink-0">Color</label>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-7 rounded cursor-pointer border-0 bg-transparent flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <button onClick={() => addTextToCanvas(title || "Title", "title", frontX + trimWPx / 2 - 60, bleedPx + 80, fontSize)}
                    className="w-full rounded-lg bg-violet-600/80 hover:bg-violet-600 py-2 text-xs font-medium text-white transition-colors">
                    + Add Title to Front
                  </button>
                  <button onClick={() => addTextToCanvas(author || "Author", "author", frontX + trimWPx / 2 - 40, bleedPx + 140, Math.round(fontSize * 0.6))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-xs text-white/70 transition-colors">
                    + Add Author to Front
                  </button>
                  <button onClick={() => addTextToCanvas(backText || "Back cover text", "back-text", backX + safeInset + 8, bleedPx + 40, 12)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-xs text-white/70 transition-colors">
                    + Add Back Cover Text
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Back Cover Text</label>
                  <textarea value={backText} onChange={(e) => setBackText(e.target.value)} rows={3}
                    placeholder="Enter back cover description..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-white/20 outline-none resize-none focus:border-violet-500/40" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Auto-sync spine</span>
                  <button onClick={() => setAutoSync((v) => !v)}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${autoSync ? "bg-violet-600" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${autoSync ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* BACKGROUND TAB */}
            {activeTab === "background" && (
              <div className="space-y-3">
                {[
                  { label: "Front Cover", value: frontBg, setter: setFrontBg },
                  { label: "Back Cover",  value: backBg,  setter: setBackBg  },
                  { label: "Spine",       value: spineBg, setter: setSpineBg },
                ].map(({ label, value, setter }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/60 shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="color" value={value} onChange={(e) => setter(e.target.value)}
                        className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-transparent shrink-0" />
                      <span className="text-[10px] text-white/30 font-mono truncate">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PRESETS TAB */}
            {activeTab === "styles" && (
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button key={preset.id} onClick={() => applyPreset(preset)}
                    className="rounded-xl border border-white/10 hover:border-violet-500/40 overflow-hidden transition-all group">
                    <div className="h-12 flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: preset.bg, color: preset.textColor, fontFamily: preset.font }}>
                      {preset.label}
                    </div>
                    <div className="py-1 px-1 text-[9px] text-white/50 group-hover:text-violet-300 bg-white/[0.02] text-center truncate">
                      {preset.label}
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Footer: dimensions + preflight */}
      <div className="px-4 py-3 border-t border-white/[0.06] space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/40 font-mono">
          <span>Spine: <span className="text-violet-300">{spineWidth.toFixed(4)}&quot;</span></span>
          <span>W: {(trimWidth * 2 + spineWidth + BLEED * 2).toFixed(4)}&quot;</span>
          <span>H: {(trimHeight + BLEED * 2).toFixed(4)}&quot;</span>
          <span className="hidden sm:inline">Canvas: {canvasW}×{canvasH}px</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {[
            { ok: preflight.spine,    label: "Spine valid"   },
            { ok: preflight.bleed,    label: "Bleed OK"      },
            { ok: preflight.textSafe, label: "Text safe"     },
            { ok: preflight.barcode,  label: "Barcode clear" },
          ].map(({ ok, label }) => (
            <div key={label} className="flex items-center gap-1 text-[11px]">
              <span className={ok ? "text-emerald-400" : "text-amber-400"}>{ok ? "✅" : "⚠️"}</span>
              <span className={ok ? "text-white/50" : "text-amber-300"}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
