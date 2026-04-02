'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { extractDominantColor, getDarkerShade } from '@/lib/color-extractor';

const SCALE = 72;
const BLEED = 0.125;

export interface CoverEditorRef {
  exportCanvas: () => string | null;
  uploadImage: (file: File, zone: 'front' | 'back' | 'full') => void;
  fitToSafeZone: () => void;
  addText: (text: string, role: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  autoFit: () => void;
  getZoom: () => number;
}

interface CoverEditorProps {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  title: string;
  author: string;
  backText?: string;
  frontBg: string;
  backBg: string;
  spineBg: string;
  textColor: string;
  selectedFont: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  onCanvasReady?: (canvas: unknown) => void;
  onExportReady?: (fn: () => string | null) => void;
  onPreflightChange?: (issues: string[]) => void;
  onZoomChange?: (zoom: number) => void;
  onColorsExtracted?: (colors: { front: string; back: string; spine: string }) => void;
}

const CoverEditor = forwardRef<CoverEditorRef, CoverEditorProps>(function CoverEditor(
  {
    trimWidth, trimHeight, spineWidth, title, author, backText = '',
    frontBg, backBg, spineBg, textColor, selectedFont, fontSize, bold, italic,
    onCanvasReady, onExportReady, onPreflightChange, onZoomChange, onColorsExtracted,
  },
  ref
) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef    = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricModRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [zoom,  setZoomState] = useState(1);
  const zoomRef = useRef(1);

  // ── Derived pixel dimensions ──────────────────────────────────────────────
  const canvasW  = Math.round((trimWidth * 2 + spineWidth + BLEED * 2) * SCALE);
  const canvasH  = Math.round((trimHeight + BLEED * 2) * SCALE);
  const bleedPx  = Math.round(BLEED * SCALE);
  const trimWPx  = Math.round(trimWidth * SCALE);
  const trimHPx  = Math.round(trimHeight * SCALE);
  const spineWPx = Math.max(Math.round(spineWidth * SCALE), 1);
  const backX    = bleedPx;
  const spineX   = backX + trimWPx;
  const frontX   = spineX + spineWPx;
  const safeInset = Math.round(0.25 * SCALE);

  const barcodeW = Math.round(2 * SCALE);
  const barcodeH = Math.round(1.2 * SCALE);
  const barcodeX = backX + trimWPx - Math.round(0.15 * SCALE) - barcodeW;
  const barcodeY = bleedPx + trimHPx - Math.round(0.15 * SCALE) - barcodeH;

  // ── Draw zone guides ──────────────────────────────────────────────────────
  const drawGuides = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fc: any) => {
      const F = fabricModRef.current;
      if (!F) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.getObjects().filter((o: any) => o.data?.guide).forEach((o: any) => fc.remove(o));

      const isLight = (hex: string) => {
        try {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return 0.299 * r + 0.587 * g + 0.114 * b > 128;
        } catch { return false; }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addRect = (opts: any) =>
        fc.add(new F.Rect({ selectable: false, evented: false, data: { guide: true }, ...opts }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addText = (str: string, opts: any) =>
        fc.add(new F.Text(str, { selectable: false, evented: false, data: { guide: true }, fontFamily: 'monospace', ...opts }));

      // Bleed background
      addRect({ left: 0, top: 0, width: canvasW, height: canvasH, fill: '#1a1a2e' });

      // Zone fills
      addRect({ left: backX, top: bleedPx, width: trimWPx, height: trimHPx, fill: backBg, stroke: '#ff6b6b', strokeDashArray: [5, 5], strokeWidth: 1 });
      addRect({ left: spineX, top: bleedPx, width: spineWPx, height: trimHPx, fill: spineBg });
      addRect({ left: frontX, top: bleedPx, width: trimWPx, height: trimHPx, fill: frontBg, stroke: '#51cf66', strokeDashArray: [5, 5], strokeWidth: 1 });

      // Safe zones
      addRect({ left: frontX + safeInset, top: bleedPx + safeInset, width: trimWPx - safeInset * 2, height: trimHPx - safeInset * 2, fill: 'transparent', stroke: '#44bb66', strokeWidth: 1, strokeDashArray: [5, 4] });
      addRect({ left: backX + safeInset, top: bleedPx + safeInset, width: trimWPx - safeInset * 2, height: trimHPx - safeInset * 2, fill: 'transparent', stroke: '#44bb66', strokeWidth: 1, strokeDashArray: [5, 4] });

      // Zone labels
      addText('FRONT COVER', { left: frontX + trimWPx / 2, top: bleedPx + trimHPx / 2, originX: 'center', originY: 'center', fontSize: Math.min(14, Math.round(trimWPx * 0.035)), fill: isLight(frontBg) ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)', charSpacing: 100 });
      addText('BACK COVER',  { left: backX  + trimWPx / 2, top: bleedPx + trimHPx / 2, originX: 'center', originY: 'center', fontSize: Math.min(14, Math.round(trimWPx * 0.035)), fill: isLight(backBg)  ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)', charSpacing: 100 });

      if (spineWPx >= 12) {
        const spineLabel = spineWPx >= 45 ? `SPINE  ${spineWidth.toFixed(4)}"` : 'SPINE';
        fc.add(new F.Text(spineLabel, { left: spineX + spineWPx / 2, top: bleedPx + trimHPx / 2, angle: -90, originX: 'center', originY: 'center', fontSize: Math.min(10, Math.round(spineWPx * 0.45)), fill: isLight(spineBg) ? 'rgba(0,0,80,0.45)' : 'rgba(255,255,255,0.45)', fontFamily: 'monospace', selectable: false, evented: false, data: { guide: true } }));
      }

      // Barcode placeholder
      addRect({ left: barcodeX, top: barcodeY, width: barcodeW, height: barcodeH, fill: '#ffffff', stroke: '#bbbbbb', strokeWidth: 1, strokeDashArray: [3, 3] });
      addText('BARCODE\nAREA', { left: barcodeX + barcodeW / 2, top: barcodeY + barcodeH / 2, originX: 'center', originY: 'center', fill: '#aaaaaa', fontSize: 9 });

      // Send guides to back
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [...fc.getObjects().filter((o: any) => o.data?.guide)].reverse().forEach((g: any) => fc.sendToBack(g));
      fc.renderAll();
    },
    [canvasW, canvasH, bleedPx, backX, spineX, frontX, trimWPx, trimHPx, spineWPx,
      backBg, spineBg, frontBg, safeInset, barcodeX, barcodeY, barcodeW, barcodeH, spineWidth]
  );

  // ── Add default template (placeholders) ──────────────────────────────────
  const addDefaultTemplate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fc: any, F: any) => {
      const titleSize  = Math.min(48, Math.round(trimWPx * 0.1));
      const authorSize = Math.min(24, Math.round(trimWPx * 0.05));
      const backSize   = Math.min(14, Math.round(trimWPx * 0.032));

      fc.add(new F.IText('YOUR BOOK TITLE', {
        left: frontX + trimWPx / 2, top: bleedPx + trimHPx * 0.38,
        originX: 'center', originY: 'center',
        fontSize: titleSize, fill: '#ffffff',
        fontFamily: 'Playfair Display', fontWeight: 'bold',
        data: { textRole: 'title', isPlaceholder: true },
      }));

      fc.add(new F.IText('Author Name', {
        left: frontX + trimWPx / 2, top: bleedPx + trimHPx * 0.62,
        originX: 'center', originY: 'center',
        fontSize: authorSize, fill: '#e0e0e0',
        fontFamily: 'Lato',
        data: { textRole: 'author', isPlaceholder: true },
      }));

      fc.add(new F.IText('Write a blurb, endorsements\nor author bio here...', {
        left: backX + trimWPx / 2, top: bleedPx + trimHPx * 0.4,
        originX: 'center', originY: 'center',
        fontSize: backSize,
        fill: 'rgba(255,255,255,0.35)',
        fontFamily: 'Lato',
        data: { textRole: 'back-text', isPlaceholder: true },
      }));

      if (spineWPx >= 30) {
        fc.add(new F.Text('YOUR BOOK TITLE', {
          left: spineX + spineWPx / 2, top: bleedPx + trimHPx / 2,
          angle: 90, originX: 'center', originY: 'center',
          fontSize: Math.min(12, spineWPx * 0.55),
          fill: '#ffffff', fontFamily: 'Playfair Display',
          selectable: true, data: { textRole: 'spine-title', isPlaceholder: true },
        }));
      }

      fc.renderAll();
    },
    [trimWPx, trimHPx, frontX, backX, spineX, bleedPx, spineWPx]
  );

  // ── Initialize Fabric canvas ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    import('fabric').then((mod) => {
      if (!mounted || !canvasRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const F = (mod as { fabric?: unknown }).fabric ?? mod;
      fabricModRef.current = F;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fc = new (F as any).Canvas(canvasRef.current, {
        width: canvasW, height: canvasH,
        backgroundColor: '#1a1a2e',
        preserveObjectStacking: true,
      });
      fabricRef.current = fc;

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = fc.getActiveObject() as any;
          if (obj && !obj.data?.locked && !obj.data?.guide) {
            fc.remove(obj); fc.discardActiveObject(); fc.renderAll();
          }
        }
      };
      document.addEventListener('keydown', handleKey);

      drawGuides(fc);
      addDefaultTemplate(fc, F);
      setReady(true);
      onCanvasReady?.(fc);

      const exportFn = () => {
        try { return fc.toDataURL({ format: 'png', quality: 1, multiplier: 2 }) as string; }
        catch { return null; }
      };
      onExportReady?.(exportFn);

      return () => {
        mounted = false;
        document.removeEventListener('keydown', handleKey);
        fc.dispose();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild guides when dimensions or colors change ───────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    fc.setWidth(canvasW);
    fc.setHeight(canvasH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = fc.wrapperEl as HTMLElement | undefined;
    if (wrapper) { wrapper.style.width = `${canvasW}px`; wrapper.style.height = `${canvasH}px`; }
    drawGuides(fc);
  }, [canvasW, canvasH, frontBg, backBg, spineBg, drawGuides, ready]);

  // ── Sync title / author text ──────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    const F  = fabricModRef.current;
    if (!F) return;

    const titleSize  = Math.min(fontSize, Math.round(trimWPx * 0.08));
    const authorSize = Math.min(Math.round(fontSize * 0.55), Math.round(trimWPx * 0.05));

    const updateOrAdd = (
      role: string,
      displayText: string,
      placeholder: string,
      x: number, y: number,
      size: number,
      color: string,
      weight = 'normal',
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = fc.getObjects().filter((o: any) => o.data?.textRole === role);
      const isPlaceholder = !displayText;
      const text = displayText || placeholder;
      const fill = isPlaceholder ? 'rgba(255,255,255,0.35)' : color;

      if (existing.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        existing.forEach((o: any) => o.set({ text, fill, fontFamily: selectedFont, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', fontSize: size, data: { ...o.data, isPlaceholder } }));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.add(new (F as any).IText(text, { left: x, top: y, originX: 'center', originY: 'center', fontSize: size, fill, fontFamily: selectedFont, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', data: { textRole: role, isPlaceholder } }));
      }
    };

    updateOrAdd('title',  title,  'YOUR BOOK TITLE', frontX + trimWPx / 2, bleedPx + trimHPx * 0.38, titleSize,  textColor, bold ? 'bold' : 'normal');
    updateOrAdd('author', author, 'Author Name',      frontX + trimWPx / 2, bleedPx + trimHPx * 0.62, authorSize, textColor);

    if (spineWPx >= 30) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spineObjs = fc.getObjects().filter((o: any) => o.data?.textRole === 'spine-title');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spineObjs.forEach((o: any) => o.set({ text: title || 'YOUR BOOK TITLE' }));
    }

    fc.renderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, author, textColor, selectedFont, fontSize, bold, italic, ready]);

  // ── Zoom helpers ──────────────────────────────────────────────────────────
  const applyZoom = useCallback((nz: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const clamped = Math.max(0.1, Math.min(2, nz));
    zoomRef.current = clamped;
    setZoomState(clamped);
    onZoomChange?.(clamped);
    fc.setZoom(clamped);
    fc.setWidth(Math.round(canvasW * clamped));
    fc.setHeight(Math.round(canvasH * clamped));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = fc.wrapperEl as HTMLElement | undefined;
    if (wrapper) { wrapper.style.width = `${Math.round(canvasW * clamped)}px`; wrapper.style.height = `${Math.round(canvasH * clamped)}px`; }
    fc.renderAll();
  }, [canvasW, canvasH, onZoomChange]);

  const autoFit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const availW = container.clientWidth  - 48;
    const availH = container.clientHeight - 48;
    if (availW <= 0 || availH <= 0) return;
    applyZoom(Math.min(1, availW / canvasW, availH / canvasH));
  }, [canvasW, canvasH, applyZoom]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(autoFit, 80);
    return () => clearTimeout(t);
  }, [ready, autoFit]);

  useEffect(() => {
    window.addEventListener('resize', autoFit);
    return () => window.removeEventListener('resize', autoFit);
  }, [autoFit]);

  // ── Image upload ──────────────────────────────────────────────────────────
  const uploadImage = useCallback((file: File, zone: 'front' | 'back' | 'full') => {
    const F = fabricModRef.current;
    if (!fabricRef.current || !F) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      const imgEl = new window.Image();
      imgEl.onload = () => {
        const fc = fabricRef.current;
        if (!fc) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fabricImg = new (F as any).Image(imgEl);

        if (zone === 'full') {
          fabricImg.scaleToWidth(canvasW);
          fabricImg.set({ left: 0, top: 0, selectable: true, data: { role: 'full-image' } });
          fc.add(fabricImg);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fc.getObjects().filter((o: any) => o.data?.guide).forEach((g: any) => fc.sendToBack(g));
        } else if (zone === 'front') {
          const s = Math.min(trimWPx / (fabricImg.width || 1), trimHPx / (fabricImg.height || 1));
          fabricImg.set({ left: frontX + (trimWPx - (fabricImg.width || 0) * s) / 2, top: bleedPx, scaleX: s, scaleY: s, selectable: true, data: { role: 'front-image' } });
          fc.add(fabricImg);
          extractDominantColor(dataUrl).then((color) => {
            onColorsExtracted?.({ front: color, back: color, spine: getDarkerShade(color) });
          });
        } else {
          const s = Math.min(trimWPx / (fabricImg.width || 1), trimHPx / (fabricImg.height || 1));
          fabricImg.set({ left: backX, top: bleedPx, scaleX: s, scaleY: s, selectable: true, data: { role: 'back-image' } });
          fc.add(fabricImg);
        }
        fc.renderAll();
      };
      imgEl.onerror = () => console.error('CoverEditor: failed to load image');
      imgEl.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [canvasW, trimWPx, trimHPx, frontX, backX, bleedPx, onColorsExtracted]);

  // ── Fit to safe zone ──────────────────────────────────────────────────────
  const fitToSafeZone = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = fc.getActiveObject() as any;
    if (!obj || obj.data?.guide) return;
    const zoneW = trimWPx - safeInset * 2;
    const zoneH = trimHPx - safeInset * 2;
    const s = Math.min(zoneW / (obj.width ?? 1), zoneH / (obj.height ?? 1));
    obj.set({ scaleX: s, scaleY: s, left: frontX + safeInset, top: bleedPx + safeInset });
    fc.renderAll();
  }, [trimWPx, trimHPx, safeInset, frontX, bleedPx]);

  // ── Add text object ───────────────────────────────────────────────────────
  const addText = useCallback((text: string, role: string) => {
    const fc = fabricRef.current;
    const F  = fabricModRef.current;
    if (!fc || !F) return;
    const x = role === 'back-text' ? backX + trimWPx / 2 : frontX + trimWPx / 2;
    const y = role === 'back-text' ? bleedPx + trimHPx * 0.4 : bleedPx + trimHPx * 0.5;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = new (F as any).IText(text, {
      left: x, top: y, originX: 'center', originY: 'center',
      fontSize, fill: textColor, fontFamily: selectedFont,
      fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal',
      data: { textRole: role },
    });
    fc.add(t); fc.setActiveObject(t); fc.renderAll();
  }, [fontSize, textColor, selectedFont, bold, italic, frontX, backX, trimWPx, trimHPx, bleedPx]);

  // ── Preflight ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const texts = fc.getObjects().filter((o: any) => (o.type === 'text' || o.type === 'i-text') && !o.data?.guide);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textInBleed = texts.some((t: any) => {
      const b = t.getBoundingRect();
      return b.left < bleedPx || b.top < bleedPx || b.left + b.width > canvasW - bleedPx || b.top + b.height > canvasH - bleedPx;
    });
    const issues: string[] = [];
    if (spineWPx < 6)  issues.push('Spine too narrow — need more pages for visible spine text');
    if (textInBleed)   issues.push('Text extends into bleed area — keep text 0.25" from trim edge');
    onPreflightChange?.(issues);
  }, [ready, spineWPx, bleedPx, canvasW, canvasH, onPreflightChange]);

  // ── Expose ref API ────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      try { return fabricRef.current?.toDataURL({ format: 'png', quality: 1, multiplier: 2 }) ?? null; }
      catch { return null; }
    },
    uploadImage,
    fitToSafeZone,
    addText,
    zoomIn:  () => applyZoom(zoomRef.current + 0.1),
    zoomOut: () => applyZoom(zoomRef.current - 0.1),
    autoFit,
    getZoom: () => zoomRef.current,
  }), [uploadImage, fitToSafeZone, addText, applyZoom, autoFit]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-auto"
      style={{ backgroundColor: '#0f0f1a' }}
    >
      {!ready && (
        <div className="text-[#555] text-sm animate-pulse select-none">Initialising canvas…</div>
      )}
      <div className="p-6 flex items-center justify-center">
        <canvas ref={canvasRef} style={{ display: ready ? 'block' : 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
      </div>
    </div>
  );
});

export default CoverEditor;
