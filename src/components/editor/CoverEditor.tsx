'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { extractDominantColor, getDarkerShade } from '@/lib/color-extractor';

const SCALE = 72;
const BLEED = 0.125;

export interface SelectedTextInfo {
  role: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  lineHeight: number;
  charSpacing: number;
  visible: boolean;
}

export interface BestsellerPreset {
  id: string;
  label: string;
  font: string;
  color: string;
  bgColor: string;
  size: number;
  weight: string;
  spacing: number;
  lineH: number;
  genre: string;
}

export interface CoverEditorRef {
  exportCanvas: () => string | null;
  uploadImage: (file: File, zone: 'front' | 'back' | 'full') => void;
  fitToSafeZone: () => void;
  addText: (text: string, role: string) => void;
  updateSelected: (props: Partial<SelectedTextInfo>) => void;
  toggleObjectVisibility: (role: string) => void;
  applyBestsellerPreset: (preset: BestsellerPreset) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  autoFit: () => void;
  getZoom: () => number;
  undo: () => void;
  redo: () => void;
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
  onObjectSelected?: (info: SelectedTextInfo | null) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeMetallicGradient(w: number, h: number): string {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const g = ctx.createRadialGradient(w * 0.42, h * 0.38, 0, w / 2, h / 2, Math.max(w, h) * 0.9);
  g.addColorStop(0,    '#eaeaea');
  g.addColorStop(0.25, '#d2d2d2');
  g.addColorStop(0.55, '#b8b8b8');
  g.addColorStop(0.8,  '#a0a0a0');
  g.addColorStop(1,    '#878787');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return c.toDataURL('image/png');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextInfo(obj: any): SelectedTextInfo {
  return {
    role:        obj.data?.textRole || 'text',
    text:        obj.text   || '',
    fontSize:    obj.fontSize  || 20,
    fontFamily:  obj.fontFamily || 'Playfair Display',
    fill:        typeof obj.fill === 'string' ? obj.fill : '#ffffff',
    fontWeight:  obj.fontWeight  || 'normal',
    fontStyle:   obj.fontStyle   || 'normal',
    textAlign:   obj.textAlign   || 'center',
    lineHeight:  obj.lineHeight  || 1.16,
    charSpacing: obj.charSpacing || 0,
    visible:     obj.visible !== false,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const CoverEditor = forwardRef<CoverEditorRef, CoverEditorProps>(function CoverEditor(
  {
    trimWidth, trimHeight, spineWidth, title, author, backText = '',
    frontBg, backBg, spineBg, textColor, selectedFont, fontSize, bold, italic,
    onCanvasReady, onExportReady, onPreflightChange, onZoomChange,
    onColorsExtracted, onObjectSelected,
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
  const readyRef = useRef(false);
  const zoomRef  = useRef(1);
  const [zoom, setZoomState] = useState(1);

  // History for undo/redo
  const historyRef      = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const suppressHistoryRef = useRef(false);

  // ── Derived dimensions ────────────────────────────────────────────────────
  const canvasW   = Math.round((trimWidth * 2 + spineWidth + BLEED * 2) * SCALE);
  const canvasH   = Math.round((trimHeight + BLEED * 2) * SCALE);
  const bleedPx   = Math.round(BLEED * SCALE);
  const trimWPx   = Math.round(trimWidth * SCALE);
  const trimHPx   = Math.round(trimHeight * SCALE);
  const spineWPx  = Math.max(Math.round(spineWidth * SCALE), 1);
  const backX     = bleedPx;
  const spineX    = backX + trimWPx;
  const frontX    = spineX + spineWPx;
  const safeInset = Math.round(0.25 * SCALE);

  const barcodeW  = Math.round(2 * SCALE);
  const barcodeH  = Math.round(1.2 * SCALE);
  const barcodeX  = backX + Math.round(0.25 * SCALE);
  const barcodeY  = bleedPx + trimHPx - Math.round(0.25 * SCALE) - barcodeH;

  // ── Snapshot for undo/redo ────────────────────────────────────────────────
  const snapshot = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc || suppressHistoryRef.current) return;
    const json = JSON.stringify(fc.toJSON(['data']));
    const hist = historyRef.current;
    // Trim forward history
    historyRef.current = hist.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > 30) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // ── Draw guide/zone objects ───────────────────────────────────────────────
  const drawGuides = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fc: any) => {
      const F = fabricModRef.current;
      if (!F) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.getObjects().filter((o: any) => o.data?.guide).forEach((o: any) => fc.remove(o));

      const isLight = (hex: string) => {
        try {
          const r = parseInt(hex.slice(1,3), 16);
          const g = parseInt(hex.slice(3,5), 16);
          const b = parseInt(hex.slice(5,7), 16);
          return 0.299*r + 0.587*g + 0.114*b > 128;
        } catch { return false; }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addRect = (opts: any) =>
        fc.add(new F.Rect({ selectable: false, evented: false, data: { guide: true }, ...opts }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addTxt = (str: string, opts: any) =>
        fc.add(new F.Text(str, { selectable: false, evented: false, data: { guide: true }, fontFamily: 'monospace', ...opts }));

      // Outer bleed bg
      addRect({ left: 0, top: 0, width: canvasW, height: canvasH, fill: '#111118' });

      // Zone fills
      addRect({ left: backX,  top: bleedPx, width: trimWPx,  height: trimHPx, fill: backBg,  stroke: '#ff6b6b', strokeDashArray: [5,5], strokeWidth: 1 });
      addRect({ left: spineX, top: bleedPx, width: spineWPx, height: trimHPx, fill: spineBg });
      addRect({ left: frontX, top: bleedPx, width: trimWPx,  height: trimHPx, fill: frontBg, stroke: '#51cf66', strokeDashArray: [5,5], strokeWidth: 1 });

      // Safe zones
      addRect({ left: frontX + safeInset, top: bleedPx + safeInset, width: trimWPx - safeInset*2, height: trimHPx - safeInset*2, fill: 'transparent', stroke: '#44bb66', strokeWidth: 1, strokeDashArray: [5,4] });
      addRect({ left: backX  + safeInset, top: bleedPx + safeInset, width: trimWPx - safeInset*2, height: trimHPx - safeInset*2, fill: 'transparent', stroke: '#44bb66', strokeWidth: 1, strokeDashArray: [5,4] });

      // Zone labels
      addTxt('FRONT COVER', { left: frontX + trimWPx/2, top: bleedPx + trimHPx/2, originX: 'center', originY: 'center', fontSize: Math.min(14, Math.round(trimWPx*0.035)), fill: isLight(frontBg) ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.18)', charSpacing: 120 });
      addTxt('BACK COVER',  { left: backX  + trimWPx/2, top: bleedPx + trimHPx/2, originX: 'center', originY: 'center', fontSize: Math.min(14, Math.round(trimWPx*0.035)), fill: isLight(backBg)  ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.18)', charSpacing: 120 });

      if (spineWPx >= 12) {
        const spineLabel = spineWPx >= 45 ? `SPINE  ${spineWidth.toFixed(4)}"` : 'SPINE';
        fc.add(new F.Text(spineLabel, {
          left: spineX + spineWPx/2, top: bleedPx + trimHPx/2,
          angle: -90, originX: 'center', originY: 'center',
          fontSize: Math.min(10, Math.round(spineWPx*0.45)),
          fill: isLight(spineBg) ? 'rgba(0,0,80,0.35)' : 'rgba(255,255,255,0.4)',
          fontFamily: 'monospace', selectable: false, evented: false, data: { guide: true },
        }));
      }

      // Barcode placeholder
      addRect({ left: barcodeX, top: barcodeY, width: barcodeW, height: barcodeH, fill: '#ffffff', stroke: '#aaaaaa', strokeWidth: 1 });
      addTxt('BARCODE', { left: barcodeX + barcodeW/2, top: barcodeY + barcodeH/2, originX: 'center', originY: 'center', fill: '#888888', fontSize: 9 });

      // Guides to back
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [...fc.getObjects().filter((o: any) => o.data?.guide)].reverse().forEach((g: any) => fc.sendToBack(g));
      fc.renderAll();
    },
    [canvasW, canvasH, bleedPx, backX, spineX, frontX, trimWPx, trimHPx, spineWPx,
     backBg, spineBg, frontBg, safeInset, barcodeX, barcodeY, barcodeW, barcodeH, spineWidth]
  );

  // ── Add default metallic template ─────────────────────────────────────────
  const addDefaultTemplate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fc: any, F: any) => {
      const titleSize  = Math.min(52, Math.round(trimWPx * 0.1));
      const authorSize = Math.min(22, Math.round(trimWPx * 0.045));
      const backSize   = Math.min(13, Math.round(trimWPx * 0.028));

      // Metallic gradient overlay on front and back zones
      const gradUrl = makeMetallicGradient(trimWPx, trimHPx);
      const loadGrad = (url: string, left: number, role: string, cb?: () => void) => {
        const img = new window.Image();
        img.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fi = new (F as any).Image(img);
          fi.set({ left, top: bleedPx, selectable: false, evented: false, opacity: 0.9, data: { templateGradient: true, role } });
          fc.add(fi);
          fc.sendToBack(fi);
          // re-send guides further back
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [...fc.getObjects().filter((o: any) => o.data?.guide)].reverse().forEach((g: any) => fc.sendToBack(g));
          fc.renderAll();
          cb?.();
        };
        img.src = url;
      };

      loadGrad(gradUrl, frontX, 'grad-front', () => {
        loadGrad(gradUrl, backX, 'grad-back');
      });

      // Title placeholder
      fc.add(new F.IText('YOUR BOOK TITLE', {
        left: frontX + trimWPx/2, top: bleedPx + trimHPx * 0.36,
        originX: 'center', originY: 'center',
        fontSize: titleSize, fill: '#1a1a2e',
        fontFamily: 'Playfair Display', fontWeight: 'bold',
        textAlign: 'center',
        charSpacing: 50,
        data: { textRole: 'title', isPlaceholder: true },
      }));

      // Author placeholder
      fc.add(new F.IText('Author Name', {
        left: frontX + trimWPx/2, top: bleedPx + trimHPx * 0.62,
        originX: 'center', originY: 'center',
        fontSize: authorSize, fill: '#4a9eff',
        fontFamily: 'Playfair Display',
        textAlign: 'center',
        data: { textRole: 'author', isPlaceholder: true },
      }));

      // Back cover placeholder
      fc.add(new F.IText('Write a blurb, endorsements\nor author bio here...', {
        left: backX + trimWPx/2, top: bleedPx + trimHPx * 0.42,
        originX: 'center', originY: 'center',
        fontSize: backSize, fill: '#444455',
        fontFamily: 'Lato', textAlign: 'center',
        data: { textRole: 'back-text', isPlaceholder: true },
      }));

      // Spine title if wide enough
      if (spineWPx >= 30) {
        fc.add(new F.Text('YOUR BOOK TITLE', {
          left: spineX + spineWPx/2, top: bleedPx + trimHPx/2,
          angle: 90, originX: 'center', originY: 'center',
          fontSize: Math.min(11, spineWPx * 0.5),
          fill: '#1a1a2e', fontFamily: 'Playfair Display',
          selectable: true, data: { textRole: 'spine-title', isPlaceholder: true },
        }));
      }

      fc.renderAll();
    },
    [trimWPx, trimHPx, frontX, backX, spineX, bleedPx, spineWPx]
  );

  // ── Initialize Fabric ─────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    // Load Google Fonts for canvas use
    if (!document.getElementById('kdp-gfonts')) {
      const link = document.createElement('link');
      link.id   = 'kdp-gfonts';
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Oswald:wght@400;700&family=EB+Garamond:wght@400;700&family=Raleway:wght@400;700&family=Crimson+Text:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Merriweather:wght@400;700&family=PT+Serif:wght@400;700&display=swap';
      document.head.appendChild(link);
    }

    import('fabric').then((mod) => {
      if (!mounted || !canvasRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const F = (mod as { fabric?: unknown }).fabric ?? mod;
      fabricModRef.current = F;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fc = new (F as any).Canvas(canvasRef.current, {
        width: canvasW, height: canvasH,
        backgroundColor: '#111118',
        preserveObjectStacking: true,
      });
      fabricRef.current = fc;

      // Keyboard delete
      const handleKey = (e: KeyboardEvent) => {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = fc.getActiveObject() as any;
          if (obj && !obj.data?.guide) { fc.remove(obj); fc.discardActiveObject(); fc.renderAll(); snapshot(); }
        }
      };
      document.addEventListener('keydown', handleKey);

      // Selection events → notify parent
      const emitSelection = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = fc.getActiveObject() as any;
        if (!obj || obj.data?.guide) { onObjectSelected?.(null); return; }
        if (obj.type === 'text' || obj.type === 'i-text') {
          onObjectSelected?.(extractTextInfo(obj));
        } else {
          onObjectSelected?.(null);
        }
      };
      fc.on('selection:created', emitSelection);
      fc.on('selection:updated', emitSelection);
      fc.on('selection:cleared', () => onObjectSelected?.(null));

      // Snapshot on modifications
      fc.on('object:modified', () => { if (readyRef.current) snapshot(); });

      drawGuides(fc);
      addDefaultTemplate(fc, F);

      // Initial snapshot after template loads
      setTimeout(() => { if (mounted) { snapshot(); } }, 400);

      readyRef.current = true;
      setReady(true);
      onCanvasReady?.(fc);

      const exportFn = () => {
        try { return fc.toDataURL({ format: 'png', quality: 1, multiplier: 3 }) as string; }
        catch { return null; }
      };
      onExportReady?.(exportFn);

      return () => {
        mounted = false;
        readyRef.current = false;
        document.removeEventListener('keydown', handleKey);
        fc.dispose();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild guides on dimension/color change ───────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    fc.setWidth(canvasW);
    fc.setHeight(canvasH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = fc.wrapperEl as HTMLElement | undefined;
    if (wrapper) { wrapper.style.width = `${canvasW}px`; wrapper.style.height = `${canvasH}px`; }
    drawGuides(fc);

    // When zone bg changed from default, remove metallic gradient overlays
    const isDefault = frontBg === '#c0c0c0' && backBg === '#b0b0b0';
    if (!isDefault) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.getObjects().filter((o: any) => o.data?.templateGradient).forEach((o: any) => fc.remove(o));
      fc.renderAll();
    }
  }, [canvasW, canvasH, frontBg, backBg, spineBg, drawGuides, ready]);

  // ── Sync title/author text ────────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    const F  = fabricModRef.current;
    if (!F) return;

    const titleSize  = Math.min(fontSize, Math.round(trimWPx * 0.08));
    const authorSize = Math.min(Math.round(fontSize * 0.55), Math.round(trimWPx * 0.05));

    const syncRole = (role: string, display: string, placeholder: string, x: number, y: number, size: number, defaultColor: string) => {
      const isPlaceholder = !display;
      const text = display || placeholder;
      const fill = isPlaceholder ? (role === 'author' ? 'rgba(74,158,255,0.45)' : 'rgba(26,26,46,0.55)') : (role === 'author' ? '#4a9eff' : textColor);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = fc.getObjects().filter((o: any) => o.data?.textRole === role);
      if (existing.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        existing.forEach((o: any) => {
          o.set({ text, fill: isPlaceholder ? fill : (role === 'author' ? o.fill : textColor), fontFamily: selectedFont, fontWeight: bold && !isPlaceholder ? 'bold' : (role === 'title' && isPlaceholder ? 'bold' : 'normal'), fontStyle: italic && !isPlaceholder ? 'italic' : 'normal', fontSize: size, data: { ...o.data, isPlaceholder } });
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fc.add(new (F as any).IText(text, { left: x, top: y, originX: 'center', originY: 'center', fontSize: size, fill: defaultColor, fontFamily: selectedFont, textAlign: 'center', data: { textRole: role, isPlaceholder } }));
      }
    };

    syncRole('title',  title,  'YOUR BOOK TITLE', frontX + trimWPx/2, bleedPx + trimHPx*0.36, titleSize,  '#1a1a2e');
    syncRole('author', author, 'Author Name',      frontX + trimWPx/2, bleedPx + trimHPx*0.62, authorSize, '#4a9eff');

    if (spineWPx >= 30) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fc.getObjects().filter((o: any) => o.data?.textRole === 'spine-title')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .forEach((o: any) => o.set({ text: title || 'YOUR BOOK TITLE' }));
    }

    fc.renderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, author, textColor, selectedFont, fontSize, bold, italic, ready]);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const applyZoom = useCallback((nz: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const z = Math.max(0.1, Math.min(2, nz));
    zoomRef.current = z;
    setZoomState(z);
    onZoomChange?.(z);
    fc.setZoom(z);
    fc.setWidth(Math.round(canvasW * z));
    fc.setHeight(Math.round(canvasH * z));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = fc.wrapperEl as HTMLElement | undefined;
    if (wrapper) { wrapper.style.width = `${Math.round(canvasW*z)}px`; wrapper.style.height = `${Math.round(canvasH*z)}px`; }
    fc.renderAll();
  }, [canvasW, canvasH, onZoomChange]);

  const autoFit = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const aw = el.clientWidth  - 64;
    const ah = el.clientHeight - 64;
    if (aw <= 0 || ah <= 0) return;
    applyZoom(Math.min(1, aw / canvasW, ah / canvasH));
  }, [canvasW, canvasH, applyZoom]);

  useEffect(() => { if (!ready) return; const t = setTimeout(autoFit, 80); return () => clearTimeout(t); }, [ready, autoFit]);
  useEffect(() => { window.addEventListener('resize', autoFit); return () => window.removeEventListener('resize', autoFit); }, [autoFit]);

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
        const fi = new (F as any).Image(imgEl);
        if (zone === 'full') {
          fi.scaleToWidth(canvasW);
          fi.set({ left: 0, top: 0, selectable: true, data: { role: 'full-image' } });
          fc.add(fi);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fc.getObjects().filter((o: any) => o.data?.guide).forEach((g: any) => fc.sendToBack(g));
        } else if (zone === 'front') {
          const s = Math.min(trimWPx/(fi.width||1), trimHPx/(fi.height||1));
          fi.set({ left: frontX + (trimWPx - (fi.width||0)*s)/2, top: bleedPx, scaleX: s, scaleY: s, selectable: true, data: { role: 'front-image' } });
          fc.add(fi);
          extractDominantColor(dataUrl).then((color) => { onColorsExtracted?.({ front: color, back: color, spine: getDarkerShade(color) }); });
        } else {
          const s = Math.min(trimWPx/(fi.width||1), trimHPx/(fi.height||1));
          fi.set({ left: backX, top: bleedPx, scaleX: s, scaleY: s, selectable: true, data: { role: 'back-image' } });
          fc.add(fi);
        }
        fc.renderAll();
        snapshot();
      };
      imgEl.onerror = () => console.error('image load failed');
      imgEl.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [canvasW, trimWPx, trimHPx, frontX, backX, bleedPx, onColorsExtracted, snapshot]);

  // ── Fit to safe zone ──────────────────────────────────────────────────────
  const fitToSafeZone = useCallback(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = fc.getActiveObject() as any;
    if (!obj || obj.data?.guide) return;
    const s = Math.min((trimWPx - safeInset*2)/(obj.width??1), (trimHPx - safeInset*2)/(obj.height??1));
    obj.set({ scaleX: s, scaleY: s, left: frontX + safeInset, top: bleedPx + safeInset });
    fc.renderAll(); snapshot();
  }, [trimWPx, trimHPx, safeInset, frontX, bleedPx, snapshot]);

  // ── Add text ──────────────────────────────────────────────────────────────
  const addText = useCallback((text: string, role: string) => {
    const fc = fabricRef.current;
    const F  = fabricModRef.current;
    if (!fc || !F) return;
    const x = role === 'back-text' ? backX + trimWPx/2 : frontX + trimWPx/2;
    const y = role === 'back-text' ? bleedPx + trimHPx*0.42 : bleedPx + trimHPx*0.5;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = new (F as any).IText(text, {
      left: x, top: y, originX: 'center', originY: 'center',
      fontSize, fill: textColor, fontFamily: selectedFont,
      fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal',
      textAlign: 'center', data: { textRole: role },
    });
    fc.add(t); fc.setActiveObject(t); fc.renderAll(); snapshot();
  }, [fontSize, textColor, selectedFont, bold, italic, frontX, backX, trimWPx, trimHPx, bleedPx, snapshot]);

  // ── Update selected object ────────────────────────────────────────────────
  const updateSelected = useCallback((props: Partial<SelectedTextInfo>) => {
    const fc = fabricRef.current;
    if (!fc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = fc.getActiveObject() as any;
    if (!obj) return;
    const upd: Record<string, unknown> = {};
    if (props.text        !== undefined) upd.text        = props.text;
    if (props.fontSize    !== undefined) upd.fontSize    = props.fontSize;
    if (props.fontFamily  !== undefined) upd.fontFamily  = props.fontFamily;
    if (props.fill        !== undefined) upd.fill        = props.fill;
    if (props.fontWeight  !== undefined) upd.fontWeight  = props.fontWeight;
    if (props.fontStyle   !== undefined) upd.fontStyle   = props.fontStyle;
    if (props.textAlign   !== undefined) upd.textAlign   = props.textAlign;
    if (props.lineHeight  !== undefined) upd.lineHeight  = props.lineHeight;
    if (props.charSpacing !== undefined) upd.charSpacing = props.charSpacing;
    if (props.visible     !== undefined) upd.visible     = props.visible;
    obj.set(upd);
    fc.renderAll();
  }, []);

  // ── Toggle object visibility ──────────────────────────────────────────────
  const toggleObjectVisibility = useCallback((role: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fc.getObjects().filter((o: any) => o.data?.textRole === role).forEach((o: any) => o.set({ visible: !o.visible }));
    fc.renderAll();
  }, []);

  // ── Apply bestseller preset ───────────────────────────────────────────────
  const applyBestsellerPreset = useCallback((preset: BestsellerPreset) => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.getObjects()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((o: any) => (o.type === 'text' || o.type === 'i-text') && !o.data?.guide)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .forEach((o: any) => {
        o.set({ fontFamily: preset.font, fill: preset.color, fontSize: preset.size, fontWeight: preset.weight, charSpacing: preset.spacing, lineHeight: preset.lineH });
      });
    fc.renderAll();
    snapshot();
    onColorsExtracted?.({ front: preset.bgColor, back: preset.bgColor, spine: getDarkerShade(preset.bgColor) });
  }, [onColorsExtracted, snapshot]);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const json = historyRef.current[historyIndexRef.current];
    const fc = fabricRef.current;
    if (!fc || !json) return;
    suppressHistoryRef.current = true;
    fc.loadFromJSON(JSON.parse(json), () => {
      fc.renderAll();
      suppressHistoryRef.current = false;
    });
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const json = historyRef.current[historyIndexRef.current];
    const fc = fabricRef.current;
    if (!fc || !json) return;
    suppressHistoryRef.current = true;
    fc.loadFromJSON(JSON.parse(json), () => {
      fc.renderAll();
      suppressHistoryRef.current = false;
    });
  }, []);

  // ── Preflight ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current || !ready) return;
    const fc = fabricRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const texts = fc.getObjects().filter((o: any) => (o.type === 'text' || o.type === 'i-text') && !o.data?.guide);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textInBleed = texts.some((t: any) => { const b = t.getBoundingRect(); return b.left < bleedPx || b.top < bleedPx || b.left+b.width > canvasW-bleedPx || b.top+b.height > canvasH-bleedPx; });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasContent = fc.getObjects().some((o: any) => !o.data?.guide && !o.data?.templateGradient);
    const issues: string[] = [];
    if (!hasContent)  issues.push('No content on canvas');
    if (spineWPx < 6) issues.push('Spine too narrow — increase page count for visible spine text');
    if (textInBleed)  issues.push('Text extends into bleed area — keep content 0.25" inside trim');
    onPreflightChange?.(issues);
  }, [ready, spineWPx, bleedPx, canvasW, canvasH, onPreflightChange]);

  // ── Imperative handle ────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    exportCanvas: () => { try { return fabricRef.current?.toDataURL({ format: 'png', quality: 1, multiplier: 3 }) ?? null; } catch { return null; } },
    uploadImage, fitToSafeZone, addText, updateSelected, toggleObjectVisibility,
    applyBestsellerPreset,
    zoomIn:  () => applyZoom(zoomRef.current + 0.1),
    zoomOut: () => applyZoom(zoomRef.current - 0.1),
    autoFit, getZoom: () => zoomRef.current,
    undo, redo,
  }), [uploadImage, fitToSafeZone, addText, updateSelected, toggleObjectVisibility,
       applyBestsellerPreset, applyZoom, autoFit, undo, redo]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-auto" style={{ backgroundColor: '#0a0a0f' }}>
      {!ready && <div className="text-[#444] text-sm animate-pulse select-none">Initialising canvas…</div>}
      <div className="p-8 flex items-center justify-center">
        <canvas ref={canvasRef} style={{ display: ready ? 'block' : 'none', boxShadow: '0 12px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)' }} />
      </div>
    </div>
  );
});

export default CoverEditor;
