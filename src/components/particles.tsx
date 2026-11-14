import { useEffect, useRef } from "react";
import roseImage from "@/assets/falling-rose.png";
import marigoldImage from "@/assets/falling-marigold.png";
import { fx } from "@/lib/fx";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = () => innerWidth < 640;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Shared canvas plumbing: DPR-aware sizing, resize handling, rAF that pauses with the tab. */
function useCanvasLoop(setup: (ctx: CanvasRenderingContext2D, size: () => { w: number; h: number }) => (t: number, dt: number) => void, active = true, maxDpr = 2) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = innerWidth, h = innerHeight, raf = 0, last = 0;
    const resize = () => { w = innerWidth; h = innerHeight; const dpr = Math.min(devicePixelRatio || 1, maxDpr); canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const step = setup(ctx, () => ({ w, h }));
    const frame = (t: number) => { const dt = Math.min((t - last) / 1000 || .016, .05); last = t; step(t, dt); raf = requestAnimationFrame(frame); };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const visibility = () => (document.hidden ? stop() : start());
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => { stop(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", visibility); };
  }, [active, maxDpr]);
  return ref;
}

/* ───────────────────────── Petals (rose, marigold, fragments) ───────────────────────── */

type Petal = { x: number; y: number; size: number; speed: number; sway: number; swayAmp: number; flutter: number; angle: number; spin: number; alpha: number; sprite: number; on: boolean };

function petalSprite(draw: (c: CanvasRenderingContext2D, s: number) => void, size = 64) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"); if (g) draw(g, size);
  return c;
}
function fragment(fill: string, edge: string) {
  return petalSprite((g, s) => {
    const grad = g.createLinearGradient(0, 0, s, s); grad.addColorStop(0, fill); grad.addColorStop(1, edge);
    g.fillStyle = grad; g.beginPath(); g.moveTo(s * .5, s * .06);
    g.bezierCurveTo(s * .98, s * .1, s * .92, s * .8, s * .5, s * .95);
    g.bezierCurveTo(s * .1, s * .78, s * .02, s * .1, s * .5, s * .06); g.fill();
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(s * .5, s * .15); g.lineTo(s * .5, s * .85); g.stroke();
  });
}
function fromImage(src: string, into: HTMLCanvasElement) {
  const img = new Image(); img.decoding = "async";
  img.onload = () => { const g = into.getContext("2d"); if (!g) return; g.clearRect(0, 0, into.width, into.height); const r = Math.min(into.width / img.naturalWidth, into.height / img.naturalHeight); const w = img.naturalWidth * r, h = img.naturalHeight * r; g.drawImage(img, (into.width - w) / 2, (into.height - h) / 2, w, h); };
  img.src = src;
}

export function PetalField() {
  const ref = useCanvasLoop((ctx, size) => {
    const rose = petalSprite(() => {}), marigold = petalSprite(() => {});
    fromImage(roseImage, rose); fromImage(marigoldImage, marigold);
    const sprites = [rose, marigold, fragment("#c2203f", "#7a0f2b"), fragment("#ffb52e", "#e07a10"), fragment("#f4a6b4", "#d9607a"), fragment("#ffd36b", "#f29b1d")];
    const pool = isSmall() ? 22 : 46;
    const petals: Petal[] = Array.from({ length: pool }, (_, i) => {
      const { w, h } = size();
      return { x: rand(0, w), y: rand(-h, h), size: rand(11, 27), speed: rand(24, 58), sway: rand(0, 6.28), swayAmp: rand(10, 34), flutter: rand(0, 6.28), angle: rand(0, 6.28), spin: rand(-1.1, 1.1), alpha: rand(.55, .95), sprite: i % sprites.length, on: true };
    });
    let wind = 0, level = 1;
    return (t, dt) => {
      const { w, h } = size();
      level += (fx.level() - level) * Math.min(1, dt * 1.4);
      const active = Math.round(pool * Math.min(1, .2 + level * .5));
      wind = Math.sin(t / 5200) * 16 + Math.sin(t / 1900) * 7 + Math.max(0, Math.sin(t / 9000)) * 12;
      ctx.clearRect(0, 0, w, h);
      petals.forEach((p, i) => {
        if (!p.on) { if (i < active) { p.on = true; p.y = -rand(20, 90); p.x = rand(-40, w); } else return; }
        p.y += p.speed * dt * (.8 + level * .25);
        p.x += (Math.sin(t / 1300 + p.sway) * p.swayAmp + wind) * dt;
        p.angle += p.spin * dt; p.flutter += dt * 2.4;
        if (p.y > h + 30 || p.x > w + 60 || p.x < -80) { if (i < active) { p.y = -rand(20, 60); p.x = rand(-40, w); } else { p.on = false; return; } }
        const sc = p.size / 32;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.scale(sc, sc * (.45 + .55 * Math.abs(Math.cos(p.flutter))));
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprites[p.sprite] as HTMLCanvasElement, -32, -32);
        ctx.restore();
      });
    };
  }, typeof window !== "undefined" && !reduced(), 1);
  return <canvas ref={ref} className="fx-canvas fx-petals" aria-hidden="true" />;
}

/* ───────────────────────── Golden sparkles & glitter ───────────────────────── */

type Spark = { x: number; y: number; r: number; vx: number; vy: number; phase: number; speed: number; glitter: boolean; hue: number };

export function SparkleField() {
  const ref = useCanvasLoop((ctx, size) => {
    const glow = petalSprite((g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, "rgba(255,248,205,1)"); r.addColorStop(.25, "rgba(255,214,110,.85)"); r.addColorStop(.6, "rgba(222,168,52,.25)"); r.addColorStop(1, "rgba(222,168,52,0)"); g.fillStyle = r; g.fillRect(0, 0, s, s); });
    const pool = isSmall() ? 28 : 60;
    const sparks: Spark[] = Array.from({ length: pool }, () => { const { w, h } = size(); const up = Math.random() > .5; return { x: rand(0, w), y: rand(0, h), r: rand(2.2, 6.5), vx: rand(-5, 5), vy: (up ? -1 : 1) * rand(3, 15), phase: rand(0, 6.28), speed: rand(.8, 2.6), glitter: Math.random() < .14, hue: Math.random() };});
    let level = 1;
    return (t, dt) => {
      const { w, h } = size();
      level += (fx.level() - level) * Math.min(1, dt * 1.4);
      const active = Math.round(pool * Math.min(1, .25 + level * .55));
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < active; i++) {
        const s = sparks[i] as Spark;
        s.x += (s.vx + Math.sin(t / 2300 + s.phase) * 6) * dt; s.y += s.vy * dt;
        if (s.y < -20) s.y = h + 20; else if (s.y > h + 20) s.y = -20;
        if (s.x < -20) s.x = w + 20; else if (s.x > w + 20) s.x = -20;
        const tw = .5 + .5 * Math.sin(t / 1000 * s.speed + s.phase);
        const a = (s.glitter ? .35 + .65 * Math.pow(tw, 3) : .25 + .6 * tw);
        ctx.globalAlpha = a;
        if (s.vy !== 0 && !s.glitter) { ctx.strokeStyle = "rgba(240,196,92,.5)"; ctx.lineWidth = s.r * .35; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * .35, s.y - s.vy * .9); ctx.stroke(); }
        const d = s.r * (s.glitter ? 6 : 3.6);
        ctx.drawImage(glow, s.x - d / 2, s.y - d / 2, d, d);
        if (s.glitter && tw > .6) { // four-point glitter flare
          ctx.strokeStyle = "rgba(255,238,170,.95)"; ctx.lineWidth = 1; const l = s.r * 3.2 * tw;
          ctx.beginPath(); ctx.moveTo(s.x - l, s.y); ctx.lineTo(s.x + l, s.y); ctx.moveTo(s.x, s.y - l); ctx.lineTo(s.x, s.y + l); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };
  }, typeof window !== "undefined" && !reduced(), 1);
  return <canvas ref={ref} className="fx-canvas fx-sparkles" aria-hidden="true" />;
}

/* ───────────────────────── Ribbon-cut spark burst ───────────────────────── */

type Burst = { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; max: number; r: number; hot: boolean; g: number };

export function SparkBurst() {
  const sparks = useRef<Burst[]>([]);
  const rings = useRef<{ x: number; y: number; t: number }[]>([]);
  const ref = useCanvasLoop((ctx, size) => {
    let dirty = false;
    return (_t, dt) => {
      const { w, h } = size();
      if (!sparks.current.length && !rings.current.length) { if (dirty) { ctx.clearRect(0, 0, w, h); dirty = false; } return; }
      dirty = true; ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
      rings.current = rings.current.filter(r => (r.t += dt) < .9);
      rings.current.forEach(r => { const k = r.t / .9; ctx.strokeStyle = `rgba(255,222,140,${(1 - k) * .8})`; ctx.lineWidth = 3 * (1 - k) + .5; ctx.beginPath(); ctx.arc(r.x, r.y, 10 + k * Math.min(w, 700) * .42, 0, 6.283); ctx.stroke(); });
      sparks.current = sparks.current.filter(s => (s.life += dt) < s.max);
      sparks.current.forEach(s => {
        s.px = s.x; s.py = s.y; s.vx *= 1 - dt * 1.1; s.vy = s.vy * (1 - dt * 1.1) + s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
        const k = 1 - s.life / s.max;
        ctx.strokeStyle = s.hot ? `rgba(255,250,222,${k})` : `rgba(255,196,84,${k * .9})`; ctx.lineWidth = s.r * (.4 + k);
        ctx.beginPath(); ctx.moveTo(s.px - s.vx * .02, s.py - s.vy * .02); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.fillStyle = s.hot ? `rgba(255,255,235,${k})` : `rgba(255,210,110,${k * .85})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (.5 + k * .7), 0, 6.283); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    };
  });
  useEffect(() => fx.onBurst(({ x, y }) => {
    const n = isSmall() ? 110 : 190;
    for (let i = 0; i < n; i++) {
      const a = rand(0, 6.283), v = rand(120, i % 5 === 0 ? 860 : 560), upward = i % 3 === 0;
      sparks.current.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (upward ? rand(150, 420) : 0), life: 0, max: rand(.9, 2.3), r: rand(1.2, 3.8), hot: Math.random() < .3, g: upward ? 260 : rand(380, 620) });
    }
    rings.current.push({ x, y, t: 0 });
  }), []);
  return <canvas ref={ref} className="fx-canvas fx-burst" aria-hidden="true" />;
}
