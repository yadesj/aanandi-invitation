import { useCallback, useEffect, useRef, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, Minus, Plus, RotateCcw, X } from "lucide-react";
import { AanandiLogo } from "@/components/aanandi-logo";

type Photo = { src: string; title: string; caption: string; w: number; h: number };
const P = {
  exterior: { src: "/brochure/exterior.jpg", title: "Exterior elevation", caption: "Front elevation of the villa row", w: 805, h: 455 },
  street: { src: "/brochure/street.jpg", title: "Residential street view", caption: "The lane at dusk, from the brochure", w: 1365, h: 795 },
  groundIso: { src: "/brochure/ground-iso.jpg", title: "Ground floor isometric", caption: "Isometric view of the ground floor", w: 840, h: 690 },
  firstIso: { src: "/brochure/first-iso.jpg", title: "First floor isometric", caption: "Isometric view of the first floor", w: 845, h: 730 },
  secondIso: { src: "/brochure/second-iso.jpg", title: "Second floor isometric", caption: "Isometric view of the second floor", w: 960, h: 855 },
} satisfies Record<string, Photo>;
const GALLERY: Photo[] = [P.exterior, P.street, P.groundIso, P.firstIso, P.secondIso];

const FLOORS = [
  {
    id: "ground",
    label: "Ground Floor",
    note: "Living room, kitchen & dining, a bedroom, puja cabinet and covered parking.",
    iso: P.groundIso,
  },
  {
    id: "first",
    label: "First Floor",
    note: "Two bedrooms with attached toilets, a balcony and an open balcony.",
    iso: P.firstIso,
  },
  {
    id: "second",
    label: "Second Floor",
    note: "A bedroom with attached toilet and a generous open terrace.",
    iso: P.secondIso,
  },
];

/* ───────────── Zoom + pan viewer (wheel with Ctrl/⌘, pinch, drag, double-tap, buttons, full screen) ───────────── */
const MAX = 5;
function ZoomPan({ photo, label }: { photo: Photo; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const clamp = useCallback((s: number, x: number, y: number) => {
    const r = box.current?.getBoundingClientRect(); const w = r?.width ?? 0, h = r?.height ?? 0;
    const ns = Math.min(MAX, Math.max(1, s)); const mx = ((ns - 1) * w) / 2, my = ((ns - 1) * h) / 2;
    return { s: ns, x: ns === 1 ? 0 : Math.min(mx, Math.max(-mx, x)), y: ns === 1 ? 0 : Math.min(my, Math.max(-my, y)) };
  }, []);
  const zoomTo = useCallback((ns: number, cx = 0, cy = 0) => setView(v => { const k = Math.min(MAX, Math.max(1, ns)) / v.s; return clamp(v.s * k, cx - (cx - v.x) * k, cy - (cy - v.y) * k); }), [clamp]);
  const local = (e: { clientX: number; clientY: number }) => { const r = box.current!.getBoundingClientRect(); return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 }; };

  useEffect(() => { // Ctrl/⌘ + wheel (also trackpad pinch) zooms; plain scrolling still scrolls the page
    const el = box.current; if (!el) return;
    const onWheel = (e: WheelEvent) => { if (!e.ctrlKey && !e.metaKey && !full) return; e.preventDefault(); const p = local(e); setView(v => { const ns = Math.min(MAX, Math.max(1, v.s * Math.exp(-e.deltaY * .0025))); const k = ns / v.s; return clamp(ns, p.x - (p.x - v.x) * k, p.y - (p.y - v.y) * k); }); };
    el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel);
  }, [clamp, full]);
  useEffect(() => { // full screen: Esc closes, page scroll locks
    if (!full) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setFull(false); };
    window.addEventListener("keydown", key); const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [full]);
  useEffect(() => { setView(v => clamp(v.s, v.x, v.y)); }, [full, clamp]);

  const down = (e: React.PointerEvent) => {
    box.current?.setPointerCapture(e.pointerId); pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 2) { const [a, b] = [...pts.current.values()] as [{ x: number; y: number }, { x: number; y: number }]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.s }; drag.current = null; }
    else drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  };
  const move = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return; pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 2 && pinch.current) { const [a, b] = [...pts.current.values()] as [{ x: number; y: number }, { x: number; y: number }]; const mid = local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }); zoomTo(pinch.current.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d), mid.x, mid.y); }
    else if (drag.current && view.s > 1) { const d = drag.current; setView(v => clamp(v.s, d.vx + e.clientX - d.x, d.vy + e.clientY - d.y)); }
  };
  const up = (e: React.PointerEvent) => { pts.current.delete(e.pointerId); pinch.current = null; if (pts.current.size === 0) drag.current = null; };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "+" || e.key === "=") zoomTo(view.s * 1.4); else if (e.key === "-") zoomTo(view.s / 1.4); else if (e.key === "0") setView({ s: 1, x: 0, y: 0 });
    else if (view.s > 1 && e.key.startsWith("Arrow")) { e.preventDefault(); const st = 40; setView(v => clamp(v.s, v.x + (e.key === "ArrowLeft" ? st : e.key === "ArrowRight" ? -st : 0), v.y + (e.key === "ArrowUp" ? st : e.key === "ArrowDown" ? -st : 0))); }
  };
  return (
    <figure className={`zoomer ${full ? "is-full" : ""}`}>
      <div ref={box} className="zoom-stage" tabIndex={0} role="group" aria-label={`${label}. Use plus and minus to zoom, arrow keys to pan.`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
        onDoubleClick={e => { const p = local(e); view.s > 1 ? setView({ s: 1, x: 0, y: 0 }) : zoomTo(2.6, p.x, p.y); }} style={{ cursor: view.s > 1 ? "grab" : "zoom-in", touchAction: view.s > 1 ? "none" : "pan-y" }}>
        <img src={photo.src} alt={label} width={photo.w} height={photo.h} draggable={false} loading="lazy" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }} />
      </div>
      <div className="zoom-tools" role="toolbar" aria-label={`${label} controls`}>
        <button type="button" onClick={() => zoomTo(view.s / 1.5)} aria-label="Zoom out" disabled={view.s <= 1}><Minus size={16} /></button>
        <span className="zoom-level" aria-live="polite">{Math.round(view.s * 100)}%</span>
        <button type="button" onClick={() => zoomTo(view.s * 1.5)} aria-label="Zoom in" disabled={view.s >= MAX}><Plus size={16} /></button>
        <button type="button" onClick={() => setView({ s: 1, x: 0, y: 0 })} aria-label="Reset zoom"><RotateCcw size={15} /></button>
        <button type="button" onClick={() => setFull(f => !f)} aria-label={full ? "Exit full screen" : "View full screen"} aria-pressed={full}>{full ? <X size={16} /> : <Expand size={15} />}</button>
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

/* ───────────── Full-screen lightbox ───────────── */
function Lightbox({ index, onChange }: { index: number | null; onChange: (i: number | null) => void }) {
  const swipe = useRef<number | null>(null);
  const open = index !== null; const i = index ?? 0; const photo = GALLERY[i] as Photo;
  const go = useCallback((d: number) => onChange((i + d + GALLERY.length) % GALLERY.length), [i, onChange]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [open, go]);
  return (
    <Dialog.Root open={open} onOpenChange={o => !o && onChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="lightbox-overlay" />
        <Dialog.Content className="lightbox" aria-describedby={undefined} onPointerDown={e => { swipe.current = e.clientX; }} onPointerUp={e => { if (swipe.current !== null && Math.abs(e.clientX - swipe.current) > 60) go(e.clientX < swipe.current ? 1 : -1); swipe.current = null; }}>
          <Dialog.Title className="sr-only">{photo.title}</Dialog.Title>
          <Dialog.Close className="lightbox-close" aria-label="Close gallery"><X size={22} /></Dialog.Close>
          <button type="button" className="lightbox-nav prev" onClick={() => go(-1)} aria-label="Previous photo"><ChevronLeft size={28} /></button>
          <motion.img key={photo.src} src={photo.src} alt={photo.title} className="lightbox-img" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45 }} draggable={false} />
          <button type="button" className="lightbox-nav next" onClick={() => go(1)} aria-label="Next photo"><ChevronRight size={28} /></button>
          <p className="lightbox-caption">{photo.title} <span>{i + 1} / {GALLERY.length}</span></p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───────────── 2.5D exterior hero: curtain reveal, scroll parallax, pointer depth ───────────── */
function ExteriorHero({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const px = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 }), py = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const rx = useTransform(py, v => v * -4), ry = useTransform(px, v => v * 5), tx = useTransform(px, v => v * -14);
  return (
    <motion.div className="hero-wrap" initial="hidden" whileInView="shown" viewport={{ once: true, amount: .2 }}>
      <motion.button ref={ref} type="button" className="exterior-hero" onClick={onOpen} aria-label="Open the photo gallery at the exterior elevation"
        variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, shown: { clipPath: "inset(0 0% 0 0)" } }} transition={{ duration: 1.5, ease: [.22, 1, .36, 1] }}
        onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); px.set((e.clientX - r.left) / r.width - .5); py.set((e.clientY - r.top) / r.height - .5); }} onPointerLeave={() => { px.set(0); py.set(0); }}>
        <motion.img src={P.exterior.src} alt="Exterior elevation of the villa row" width={P.exterior.w} height={P.exterior.h} style={{ y, x: tx, rotateX: rx, rotateY: ry, transformPerspective: 1100 }} />
        <span className="hero-badge">Exterior elevation</span>
      </motion.button>
    </motion.div>
  );
}

export function Showcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <section id="explore" className="invitation-section showcase-section" data-fx=".5">
      
      <h2 className="showcase-title">Explore AANANDI</h2>
      <p className="calligraphy showcase-sub">A Glimpse of Our New Home</p>
      <Tabs.Root defaultValue="exterior" className="showcase-tabs">
        <Tabs.List className="tab-list" aria-label="Explore the home">
          <Tabs.Trigger value="exterior" className="tab-trigger">Exterior</Tabs.Trigger>
          {FLOORS.map(f => <Tabs.Trigger key={f.id} value={f.id} className="tab-trigger">{f.label}</Tabs.Trigger>)}
        </Tabs.List>
        <Tabs.Content value="exterior" className="tab-panel">
          <ExteriorHero onOpen={() => setLightbox(0)} />
          <ul className="gallery" aria-label="Property gallery">
            {GALLERY.map((ph, i) => <li key={ph.src}><button type="button" onClick={() => setLightbox(i)} aria-label={`Open ${ph.title}`}><img src={ph.src} alt={ph.title} width={ph.w} height={ph.h} loading="lazy" /><span>{ph.title}</span></button></li>)}
          </ul>
        </Tabs.Content>
        {FLOORS.map(f => (
          <Tabs.Content key={f.id} value={f.id} className="tab-panel">
            <p className="floor-note">{f.note}</p>
           <div className="floor-grid floor-photo-only">
  <ZoomPan photo={f.iso} label={`${f.label} — isometric view`} />
</div>
            <p className="zoom-hint">Pinch, double-tap or use the buttons to zoom · Ctrl + scroll on desktop · drag to pan</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <p className="source-note">Plans and views are photographed from the Shreenathji Villa brochure, shown unaltered.</p>
      <Lightbox index={lightbox} onChange={setLightbox} />
    </section>
  );
}
