"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PaperType } from "@/lib/kdp-calculator";
import { calculateSpineWidth, calculateFullCoverWidth, calculateFullCoverHeight } from "@/lib/kdp-calculator";
import { extractDominantColor, getDarkerShade } from "@/lib/color-extractor";

const PX = 96; // pixels per inch for canvas display
const BLEED = 0.125; // inches

interface CoverEditorProps {
  trimWidth: number;
  trimHeight: number;
  pages: number;
  paperType: PaperType;
  title: string;
  author: string;
  onCanvasReady?: (canvas: unknown) => void;
}

type TabId = "images" | "text" | "background" | "styles";

const FONTS = [
  "Playfair Display","Merriweather","Oswald","Raleway","Crimson Text",
  "Lato","Montserrat","EB Garamond","Libre Baskerville","Source Sans Pro",
  "Bebas Neue","PT Serif",
];

const PRESETS = [
  { id:"thriller", label:"Thriller", bg:"#0a0a0a", textColor:"#ffffff", font:"Oswald", spine:"#1a1a1a" },
  { id:"romance",  label:"Romance",  bg:"#7b2d42", textColor:"#fce4ec", font:"Playfair Display", spine:"#5a1f30" },
  { id:"fantasy",  label:"Fantasy",  bg:"#1a0a3d", textColor:"#ffd700", font:"EB Garamond", spine:"#110728" },
  { id:"childrens",label:"Children's",bg:"#ff6b6b",textColor:"#ffffff",  font:"Raleway",        spine:"#e05050" },
  { id:"nonfiction",label:"Non-Fiction",bg:"#f5f5f5",textColor:"#1a1a1a",font:"Montserrat",     spine:"#dddddd" },
  { id:"coloring", label:"Coloring Book",bg:"#ffffff",textColor:"#2d2d2d",font:"Crimson Text",  spine:"#eeeeee" },
];

export default function CoverEditor({ trimWidth, trimHeight, pages, paperType, title, author, onCanvasReady }: CoverEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricModuleRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>("images");
  const [frontBg, setFrontBg] = useState("#ffffff");
  const [backBg, setBackBg] = useState("#6d28d9");
  const [spineBg, setSpineBg] = useState("#4c1d95");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [fontSize, setFontSize] = useState(36);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [backText, setBackText] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [uploadIntent, setUploadIntent] = useState<"front"|"full">("front");
  const [preflight, setPreflight] = useState({ spine: true, bleed: true, textSafe: true, barcode: true });
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // Derived dimensions
  const spineWidth = calculateSpineWidth(pages, paperType);
  const fullWidthIn = calculateFullCoverWidth(trimWidth, pages, paperType);
  const fullHeightIn = calculateFullCoverHeight(trimHeight);

  const canvasWidthPx  = Math.round(fullWidthIn  * PX);
  const canvasHeightPx = Math.round(fullHeightIn * PX);
  const bleedPx   = Math.round(BLEED * PX);
  const frontX    = bleedPx;
  const backWidth = Math.round(trimWidth * PX);
  const spineWidthPx = Math.round(spineWidth * PX);
  const spineX    = frontX + backWidth;
  const frontCoverX = spineX + spineWidthPx;
  const safeInset = Math.round(0.25 * PX);

  // Barcode placement on back cover
  const barcodeW = Math.round(2   * PX);
  const barcodeH = Math.round(1.2 * PX);
  const barcodeX = frontX + backWidth - safeInset - barcodeW;
  const barcodeY = canvasHeightPx - bleedPx - safeInset - barcodeH;

  const saveHistory = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const json = JSON.stringify(fc.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const drawGuides = useCallback((fc: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = fc as any;
    const F = fabricModuleRef.current;
    if (!F) return;

    // Remove old guide objects (tagged evented:false, selectable:false, data:{guide:true})
    const toRemove = canvas.getObjects().filter((o: any) => o.data?.guide);
    toRemove.forEach((o: any) => canvas.remove(o));

    const addRect = (opts: object) => {
      const r = new F.Rect({ selectable: false, evented: false, data: { guide: true }, ...opts });
      canvas.add(r);
      return r;
    };
    const addText = (text: string, opts: object) => {
      const t = new F.Text(text, { selectable: false, evented: false, data: { guide: true }, fontSize: 11, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace", ...opts });
      canvas.add(t);
      return t;
    };

    // Background zones
    addRect({ left: 0, top: 0, width: canvasWidthPx, height: canvasHeightPx, fill: "#f0f0f0" });
    addRect({ left: frontX, top: bleedPx, width: backWidth, height: Math.round(trimHeight * PX), fill: backBg });
    addRect({ left: spineX, top: bleedPx, width: Math.max(spineWidthPx, 4), height: Math.round(trimHeight * PX), fill: spineBg });
    addRect({ left: frontCoverX, top: bleedPx, width: backWidth, height: Math.round(trimHeight * PX), fill: frontBg });

    // Bleed border overlay (faint pink)
    addRect({ left: 0, top: 0, width: canvasWidthPx, height: bleedPx, fill: "rgba(255,80,80,0.15)" });
    addRect({ left: 0, top: canvasHeightPx - bleedPx, width: canvasWidthPx, height: bleedPx, fill: "rgba(255,80,80,0.15)" });
    addRect({ left: 0, top: 0, width: bleedPx, height: canvasHeightPx, fill: "rgba(255,80,80,0.15)" });
    addRect({ left: canvasWidthPx - bleedPx, top: 0, width: bleedPx, height: canvasHeightPx, fill: "rgba(255,80,80,0.15)" });

    // Trim lines (semi-opaque dark)
    addRect({ left: frontX, top: bleedPx, width: 1, height: Math.round(trimHeight * PX), fill: "rgba(0,0,0,0.4)" });
    addRect({ left: spineX, top: bleedPx, width: 1, height: Math.round(trimHeight * PX), fill: "rgba(0,0,0,0.4)" });
    addRect({ left: frontCoverX, top: bleedPx, width: 1, height: Math.round(trimHeight * PX), fill: "rgba(0,0,0,0.4)" });
    addRect({ left: frontCoverX + backWidth, top: bleedPx, width: 1, height: Math.round(trimHeight * PX), fill: "rgba(0,0,0,0.4)" });

    // Safe zone dashes - back
    addRect({ left: frontX + safeInset, top: bleedPx + safeInset, width: backWidth - safeInset * 2, height: 1, fill: "rgba(0,150,0,0.5)" });
    addRect({ left: frontX + safeInset, top: bleedPx + Math.round(trimHeight * PX) - safeInset, width: backWidth - safeInset * 2, height: 1, fill: "rgba(0,150,0,0.5)" });
    addRect({ left: frontX + safeInset, top: bleedPx + safeInset, width: 1, height: Math.round(trimHeight * PX) - safeInset * 2, fill: "rgba(0,150,0,0.5)" });
    addRect({ left: frontX + backWidth - safeInset, top: bleedPx + safeInset, width: 1, height: Math.round(trimHeight * PX) - safeInset * 2, fill: "rgba(0,150,0,0.5)" });

    // Safe zone dashes - front
    addRect({ left: frontCoverX + safeInset, top: bleedPx + safeInset, width: backWidth - safeInset * 2, height: 1, fill: "rgba(0,150,0,0.5)" });
    addRect({ left: frontCoverX + safeInset, top: bleedPx + Math.round(trimHeight * PX) - safeInset, width: backWidth - safeInset * 2, height: 1, fill: "rgba(0,150,0,0.5)" });
    addRect({ left: frontCoverX + safeInset, top: bleedPx + safeInset, width: 1, height: Math.round(trimHeight * PX) - safeInset * 2, fill: "rgba(0,150,0,0.5)" });
    addRect({ left: frontCoverX + backWidth - safeInset, top: bleedPx + safeInset, width: 1, height: Math.round(trimHeight * PX) - safeInset * 2, fill: "rgba(0,150,0,0.5)" });

    // Barcode area (white, locked)
    const barcodeRect = new F.Rect({
      left: barcodeX, top: barcodeY,
      width: barcodeW, height: barcodeH,
      fill: "#ffffff", stroke: "#999", strokeWidth: 1,
      selectable: false, evented: false, data: { guide: true },
    });
    canvas.add(barcodeRect);
    addText("BARCODE\nAREA", {
      left: barcodeX + barcodeW / 2 - 24,
      top: barcodeY + barcodeH / 2 - 14,
      fill: "#aaa", fontSize: 10,
    });

    // Zone labels
    addText("BACK COVER", {
      left: frontX + backWidth / 2 - 32,
      top: bleedPx + 6,
      fill: "rgba(255,255,255,0.4)", fontSize: 10,
    });
    addText("FRONT COVER", {
      left: frontCoverX + backWidth / 2 - 36,
      top: bleedPx + 6,
      fill: "rgba(255,255,255,0.4)", fontSize: 10,
    });
    if (spineWidthPx > 20) {
      const spineLabelText = new F.Text("SPINE", {
        left: spineX + spineWidthPx / 2,
        top: bleedPx + Math.round(trimHeight * PX) / 2,
        angle: 90, fontSize: 9,
        fill: "rgba(255,255,255,0.5)", fontFamily: "monospace",
        selectable: false, evented: false, data: { guide: true },
        originX: "center", originY: "center",
      });
      canvas.add(spineLabelText);
    }

    canvas.sendToBack(canvas.getObjects()[0]);
    // Move all guides behind content objects
    const guides = canvas.getObjects().filter((o: any) => o.data?.guide);
    guides.forEach((g: any) => canvas.sendToBack(g));
    canvas.renderAll();
  }, [canvasWidthPx, canvasHeightPx, bleedPx, frontX, backWidth, spineX, spineWidthPx, frontCoverX, trimHeight, frontBg, backBg, spineBg, safeInset, barcodeX, barcodeY, barcodeW, barcodeH]);

  // Initialize Fabric canvas
  useEffect(() => {
    let mounted = true;
    import("fabric").then((mod) => {
      if (!mounted || !canvasRef.current) return;
      const F = mod.fabric ?? mod;
      fabricModuleRef.current = F;

      const fc = new F.Canvas(canvasRef.current, {
        width: canvasWidthPx,
        height: canvasHeightPx,
        backgroundColor: "#e5e5e5",
        preserveObjectStacking: true,
      });
      fabricRef.current = fc;

      // Keyboard shortcuts
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const obj = fc.getActiveObject();
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

  // Redraw guides when dimensions/colors change
  useEffect(() => {
    if (fabricRef.current && ready) {
      const fc = fabricRef.current;
      fc.setWidth(canvasWidthPx);
      fc.setHeight(canvasHeightPx);
      drawGuides(fc);
    }
  }, [canvasWidthPx, canvasHeightPx, frontBg, backBg, spineBg, drawGuides, ready]);

  // Sync title/author text objects
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    const F = fabricModuleRef.current;
    if (!F) return;

    const existing = fc.getObjects().filter((o: any) => o.data?.textRole === "title");
    if (existing.length > 0) {
      existing.forEach((o: any) => { o.set({ text: title || "Book Title" }); });
    } else if (title) {
      const t = new F.Text(title || "Book Title", {
        left: frontCoverX + backWidth / 2,
        top: bleedPx + Math.round(trimHeight * PX) * 0.35,
        originX: "center", originY: "center",
        fontSize: fontSize, fill: textColor,
        fontFamily: selectedFont,
        fontWeight: bold ? "bold" : "normal",
        fontStyle: italic ? "italic" : "normal",
        data: { textRole: "title" },
      });
      fc.add(t);
    }

    const existingAuthor = fc.getObjects().filter((o: any) => o.data?.textRole === "author");
    if (existingAuthor.length > 0) {
      existingAuthor.forEach((o: any) => { o.set({ text: author || "" }); });
    } else if (author) {
      const a = new F.Text(author || "", {
        left: frontCoverX + backWidth / 2,
        top: bleedPx + Math.round(trimHeight * PX) * 0.55,
        originX: "center", originY: "center",
        fontSize: Math.round(fontSize * 0.6), fill: textColor,
        fontFamily: selectedFont,
        data: { textRole: "author" },
      });
      fc.add(a);
    }

    // Spine text
    if (autoSync && spineWidthPx >= 30) {
      const existingSpineTitle = fc.getObjects().filter((o: any) => o.data?.textRole === "spine-title");
      if (existingSpineTitle.length > 0) {
        existingSpineTitle.forEach((o: any) => { o.set({ text: title || "" }); });
      } else if (title) {
        const st = new F.Text(title, {
          left: spineX + spineWidthPx / 2,
          top: bleedPx + Math.round(trimHeight * PX) / 2,
          angle: 90, originX: "center", originY: "center",
          fontSize: Math.min(12, spineWidthPx * 0.6), fill: textColor,
          fontFamily: selectedFont,
          data: { textRole: "spine-title" },
        });
        fc.add(st);
      }
    }

    fc.renderAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, author, ready]);

  const handleUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>, zone: "front" | "back" | "full") => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    const F = fabricModuleRef.current;
    if (!F) return;
    const url = URL.createObjectURL(file);

    F.Image.fromURL(url, (img: any) => {
      const fc = fabricRef.current;
      if (zone === "full") {
        img.scaleToWidth(canvasWidthPx);
        img.set({ left: 0, top: 0, selectable: true, data: { role: "full-image" } });
        fc.add(img);
        // Send behind text/guides but above background
        const guides = fc.getObjects().filter((o: any) => o.data?.guide);
        guides.forEach((_: any) => fc.sendToBack(_));
      } else if (zone === "front") {
        const zoneW = backWidth;
        const zoneH = Math.round(trimHeight * PX);
        img.scaleToWidth(zoneW);
        if (img.getScaledHeight() < zoneH) img.scaleToHeight(zoneH);
        img.set({ left: frontCoverX, top: bleedPx, selectable: true, data: { role: "front-image" } });
        fc.add(img);
        // Extract color
        extractDominantColor(url).then(color => {
          setBackBg(color);
          setSpineBg(getDarkerShade(color));
        });
      } else {
        const zoneW = backWidth;
        const zoneH = Math.round(trimHeight * PX);
        img.scaleToWidth(zoneW);
        if (img.getScaledHeight() < zoneH) img.scaleToHeight(zoneH);
        img.set({ left: frontX, top: bleedPx, selectable: true, data: { role: "back-image" } });
        fc.add(img);
      }
      fc.renderAll();
    }, { crossOrigin: "anonymous" });
    e.target.value = "";
  }, [canvasWidthPx, backWidth, trimHeight, frontCoverX, bleedPx, frontX]);

  const applyPreset = useCallback((preset: typeof PRESETS[0]) => {
    setFrontBg(preset.bg);
    setBackBg(preset.bg);
    setSpineBg(preset.spine);
    setTextColor(preset.textColor);
    setSelectedFont(preset.font);

    const fc = fabricRef.current;
    if (!fc) return;
    fc.getObjects().filter((o: any) => o.data?.textRole).forEach((o: any) => {
      o.set({ fill: preset.textColor, fontFamily: preset.font });
    });
    fc.renderAll();
  }, []);

  const fitToSafeZone = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj || obj.data?.guide) return;
    const zoneW = backWidth - safeInset * 2;
    const zoneH = Math.round(trimHeight * PX) - safeInset * 2;
    const sx = zoneW / (obj.width ?? 1);
    const sy = zoneH / (obj.height ?? 1);
    const s = Math.min(sx, sy);
    obj.set({ scaleX: s, scaleY: s, left: frontCoverX + safeInset, top: bleedPx + safeInset });
    fc.renderAll();
  }, [backWidth, safeInset, trimHeight, frontCoverX, bleedPx]);

  // Auto-fit canvas to its container width
  const autoFitCanvas = useCallback(() => {
    const fc = fabricRef.current;
    const container = canvasContainerRef.current;
    if (!fc || !container) return;
    const availW = container.clientWidth - 24; // 12px padding each side
    if (availW <= 0) return;
    const fitZoom = Math.min(1, availW / canvasWidthPx);
    setZoom(fitZoom);
    fc.setZoom(fitZoom);
    fc.setWidth(Math.round(canvasWidthPx * fitZoom));
    fc.setHeight(Math.round(canvasHeightPx * fitZoom));
    fc.renderAll();
  }, [canvasWidthPx, canvasHeightPx]);

  // Adjust zoom by delta and resize canvas DOM element accordingly
  const adjustZoom = useCallback((delta: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const nz = Math.min(2, Math.max(0.1, zoom + delta));
    setZoom(nz);
    fc.setZoom(nz);
    fc.setWidth(Math.round(canvasWidthPx * nz));
    fc.setHeight(Math.round(canvasHeightPx * nz));
    fc.renderAll();
  }, [zoom, canvasWidthPx, canvasHeightPx]);

  // Auto-fit on ready (initial load)
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(autoFitCanvas, 60);
    return () => clearTimeout(t);
  }, [ready, autoFitCanvas]);

  // Auto-fit on window resize
  useEffect(() => {
    window.addEventListener("resize", autoFitCanvas);
    return () => window.removeEventListener("resize", autoFitCanvas);
  }, [autoFitCanvas]);

  // Run preflight checks
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    const texts = fc.getObjects().filter((o: any) => o.type === "text" || o.type === "i-text");
    const textInBleed = texts.some((t: any) => {
      const b = t.getBoundingRect();
      return b.left < bleedPx || b.top < bleedPx ||
             b.left + b.width > canvasWidthPx - bleedPx ||
             b.top + b.height > canvasHeightPx - bleedPx;
    });
    setPreflight({
      spine: spineWidthPx >= 6,
      bleed: true,
      textSafe: !textInBleed,
      barcode: true,
    });
  }, [ready, spineWidthPx, bleedPx, canvasWidthPx, canvasHeightPx]);

  const addTextToCanvas = useCallback((text: string, role: string, x: number, y: number, size: number) => {
    const fc = fabricRef.current;
    const F = fabricModuleRef.current;
    if (!fc || !F) return;
    const t = new F.IText(text, {
      left: x, top: y,
      fontSize: size, fill: textColor,
      fontFamily: selectedFont,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      data: { textRole: role },
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.renderAll();
  }, [textColor, selectedFont, bold, italic]);

  const TAB_META: { id: TabId; icon: string; label: string }[] = [
    { id: "images",     icon: "🖼",  label: "Images" },
    { id: "text",       icon: "T",   label: "Text" },
    { id: "background", icon: "🎨",  label: "BG" },
    { id: "styles",     icon: "✦",   label: "Presets" },
  ];

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden flex flex-col">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div>
          <h2 className="text-sm font-semibold leading-none">Cover Editor</h2>
          <p className="text-[11px] text-white/40 mt-0.5">Drag elements · Delete key removes selection</p>
        </div>
        {/* Zoom bar */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => adjustZoom(-0.1)}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-base leading-none">−</button>
          <span className="text-xs text-white/50 w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button onClick={() => adjustZoom(+0.1)}
            className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-base leading-none">+</button>
          <button onClick={autoFitCanvas}
            className="ml-1 text-[10px] text-white/30 hover:text-white/60 px-2 py-1 rounded border border-white/10 transition-colors">
            Fit
          </button>
        </div>
      </div>

      {/* ── Body: canvas + toolbar (side-by-side on lg+) ──────── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Canvas area — full width on mobile/tablet, flex-1 on desktop */}
        <div
          ref={canvasContainerRef}
          className="flex-1 min-w-0 bg-[#060610] overflow-auto"
          style={{ maxHeight: "62vh", minHeight: "180px" }}
        >
          <div className="p-3 flex justify-start items-start min-w-fit">
            {!ready && (
              <div className="flex items-center justify-center w-full h-40 text-sm text-white/30 animate-pulse">
                Initialising canvas…
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: ready ? "block" : "none" }} />
          </div>
        </div>

        {/* Toolbar — full-width below canvas on mobile/tablet, 208px sidebar on desktop */}
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
                    {(["front","full"] as const).map(i => (
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
                    onChange={e => handleUploadImage(e, uploadIntent === "full" ? "full" : "front")} />
                </label>
                <label className="block w-full rounded-xl border border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] cursor-pointer p-3 text-center transition-all">
                  <p className="text-xs text-white/40">Upload Back Cover Image</p>
                  <input type="file" accept="image/png,image/jpeg" className="hidden"
                    onChange={e => handleUploadImage(e, "back")} />
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
                  <select value={selectedFont} onChange={e => setSelectedFont(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-2.5 py-2 text-xs text-white outline-none">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Size: {fontSize}px</label>
                  <input type="range" min={8} max={120} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-violet-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBold(b => !b)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${bold ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50"}`}>B</button>
                  <button onClick={() => setItalic(i => !i)}
                    className={`flex-1 py-1.5 rounded-lg text-xs italic border transition-all ${italic ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50"}`}>I</button>
                  <div className="flex items-center gap-1.5 flex-1">
                    <label className="text-[10px] text-white/40 shrink-0">Color</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      className="w-8 h-7 rounded cursor-pointer border-0 bg-transparent flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <button onClick={() => addTextToCanvas(title || "Title", "title", frontCoverX + backWidth/2 - 60, bleedPx + 80, fontSize)}
                    className="w-full rounded-lg bg-violet-600/80 hover:bg-violet-600 py-2 text-xs font-medium text-white transition-colors">
                    + Add Title to Front
                  </button>
                  <button onClick={() => addTextToCanvas(author || "Author", "author", frontCoverX + backWidth/2 - 40, bleedPx + 140, Math.round(fontSize*0.6))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-xs text-white/70 transition-colors">
                    + Add Author to Front
                  </button>
                  <button onClick={() => addTextToCanvas(backText || "Back cover text", "back-text", frontX + safeInset + 8, bleedPx + 40, 12)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-2 text-xs text-white/70 transition-colors">
                    + Add Back Cover Text
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Back Cover Text</label>
                  <textarea value={backText} onChange={e => setBackText(e.target.value)} rows={3}
                    placeholder="Enter back cover description..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-white/20 outline-none resize-none focus:border-violet-500/40" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Auto-sync spine</span>
                  <button onClick={() => setAutoSync(v => !v)}
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
                  { label: "Back Cover",  value: backBg,  setter: setBackBg },
                  { label: "Spine",       value: spineBg, setter: setSpineBg },
                ].map(({ label, value, setter }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/60 shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="color" value={value} onChange={e => setter(e.target.value)}
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
                {PRESETS.map(preset => (
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

      {/* ── Footer: dimensions + preflight ────────────────────── */}
      <div className="px-4 py-3 border-t border-white/[0.06] space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/40 font-mono">
          <span>Spine: <span className="text-violet-300">{spineWidth.toFixed(4)}&quot;</span></span>
          <span>W: {fullWidthIn.toFixed(4)}&quot;</span>
          <span>H: {fullHeightIn.toFixed(4)}&quot;</span>
          <span className="hidden sm:inline">Canvas: {canvasWidthPx}×{canvasHeightPx}px</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {[
            { ok: preflight.spine,    label: "Spine valid" },
            { ok: preflight.bleed,    label: "Bleed OK" },
            { ok: preflight.textSafe, label: "Text safe" },
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
