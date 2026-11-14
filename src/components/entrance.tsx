import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowDown, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Botanicals } from "@/components/invitation-art";
import { AanandiLogo } from "@/components/aanandi-logo";
import { fx } from "@/lib/fx";
import { music } from "@/lib/music";
import entrance from "@/assets/ceremonial-entrance.jpg";
import bow from "@/assets/satin-bow.png";
import bell from "@/assets/brass-bell.png";

/* Scissors point DOWN and hang over the ribbon so the blades close across its width.
   Pivot screw is at (70,95); the point where the blades meet the ribbon is (70,190). */
const CUT_Y = 190 / 300;
function GoldenScissors() {
  const blade = "M62 98 C61 160 64 240 70 296 L78 98 Z";
  const shank = "M62 40 H78 V102 H62 Z";
  return (
    <svg className="golden-scissors" viewBox="0 0 140 300" role="img" aria-label="Golden ceremonial scissors">
      <defs>
        <linearGradient id="scissor-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8f6a25" /><stop offset=".3" stopColor="#f6e29c" /><stop offset=".55" stopColor="#c9a24a" /><stop offset="1" stopColor="#7d5a1c" /></linearGradient>
        <linearGradient id="scissor-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7d5a1c" /><stop offset=".45" stopColor="#ffeeb0" /><stop offset=".7" stopColor="#d8b25a" /><stop offset="1" stopColor="#8f6a25" /></linearGradient>
      </defs>
      <g className="blade-a"><g transform="translate(-1.5 0)"><ellipse cx="70" cy="30" rx="21" ry="27" fill="none" stroke="url(#scissor-gold)" strokeWidth="8" /><path d={shank} fill="url(#scissor-gold)" /><path d={blade} fill="url(#scissor-steel)" /><path d="M64 110 C64 170 67 240 70 288" stroke="#fff6cf" strokeOpacity=".7" strokeWidth="1.2" fill="none" /></g></g>
      <g className="blade-b"><g transform="translate(1.5 0)"><ellipse cx="70" cy="30" rx="21" ry="27" fill="none" stroke="url(#scissor-gold)" strokeWidth="8" /><path d={shank} fill="url(#scissor-gold)" /><path d={blade} fill="url(#scissor-steel)" transform="translate(140 0) scale(-1 1)" /><path d="M76 110 C76 170 73 240 70 288" stroke="#fff6cf" strokeOpacity=".7" strokeWidth="1.2" fill="none" /></g></g>
      <circle cx="70" cy="95" r="8" fill="#e9cf80" stroke="#7d5a1c" strokeWidth="1.5" /><circle cx="70" cy="95" r="3" fill="#7d5a1c" />
    </svg>
  );
}

function Seal() {
  return (
    <svg className="knot-seal" viewBox="0 0 100 100" aria-hidden="true">
      <defs><radialGradient id="seal-g" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#fff2b8" /><stop offset=".45" stopColor="#d3ab4e" /><stop offset="1" stopColor="#7d5a1c" /></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill="url(#seal-g)" stroke="#6b4a14" strokeWidth="2" /><circle cx="50" cy="50" r="46" fill="none" stroke="#fff0b0" strokeWidth="1.5" strokeDasharray="2 4" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#6b4a14" strokeOpacity=".7" strokeWidth="1.5" />
      <text x="50" y="64" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontWeight="700" fontSize="44" fill="#5b3c0d">A</text>
    </svg>
  );
}
/** The bow and seal are rendered twice and clipped to each half, so the knot truly splits in two. */
function Knot({ side }: { side: "left" | "right" }) {
  return <div className={`knot knot-${side}`} aria-hidden="true"><img src={bow} alt="" draggable={false} /><Seal /></div>;
}

type Phase = "ready" | "cutting" | "open";

export function Entrance({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLElement>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const busy = useRef(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const [phase, setPhase] = useState<Phase>("ready");

  /* Phase A: entrance, ambient motion, pointer parallax. Everything lives in one gsap.context. */
  useEffect(() => {
    const el = root.current; if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = gsap.context(() => {
      const q = gsap.utils.selector(el);
      requestAnimationFrame(() => el.classList.add("is-ready"));
      gsap.set(q(".golden-scissors"), { autoAlpha: 0, xPercent: -50, yPercent: -CUT_Y * 100, transformOrigin: `50% ${CUT_Y * 100}%` });
      gsap.set(q(".blade-a"), { svgOrigin: "70 95", rotation: 6 });
      gsap.set(q(".blade-b"), { svgOrigin: "70 95", rotation: -6 });
      gsap.set(q(".knot-left"), { transformOrigin: "50% 50%" }); gsap.set(q(".knot-right"), { transformOrigin: "50% 50%" });
      gsap.set(q(".ribbon-left"), { transformOrigin: "0% 50%" }); gsap.set(q(".ribbon-right"), { transformOrigin: "100% 50%" });
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } }); intro.current = tl;
      tl.fromTo(q(".ent-bg"), { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1.04, duration: 2.2 }, 0)
        .fromTo(q(".ent-title .logo-flourish"), { autoAlpha: 0, scaleX: .4 }, { autoAlpha: 1, scaleX: 1, duration: 1.1 }, .5)
        .fromTo(q(".ent-title .devanagari,.ent-title .aanandi-tagline,.ent-sub"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, stagger: .18 }, .7)
        .fromTo(q(".ent-title .aanandi-letter"), { autoAlpha: 0, y: 36, rotateX: -70 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.1, stagger: .09, ease: "back.out(1.6)" }, .55)
        .fromTo(q(".hanging-bell"), { y: -90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: .2 }, .6)
        .fromTo(q(".ribbon-stage"), { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 1.3, ease: "power3.out", transformOrigin: "50% 50%" }, 1.2)
        .fromTo(q(".knot"), { autoAlpha: 0, y: -26 }, { autoAlpha: 1, y: 0, duration: .9, ease: "back.out(2)" }, 2)
        .fromTo(q(".entrance-action"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .9 }, 2.2);
      gsap.to(q(".ent-bg"), { scale: 1.09, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2, overwrite: "auto" });
      gsap.to(q(".ribbon-sheen"), { backgroundPositionX: "170%", duration: 4.5, ease: "none", repeat: -1 });
      gsap.to(q(".knot-seal"), { filter: "drop-shadow(0 0 7px rgba(255,214,110,.95))", duration: 1.3, yoyo: true, repeat: -1, ease: "sine.inOut" });
      // subtle pointer parallax: each depth layer moves a different amount
      const layers: [string, number][] = [[".ent-bg-wrap", 16], [".hanging-bell", -8], [".ent-foreground", -30], [".ent-title", 5]];
      const movers = layers.map(([s, d]) => ({ x: gsap.quickTo(q(s), "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(q(s), "y", { duration: 1.2, ease: "power3.out" }), d }));
      const move = (e: PointerEvent) => { const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; movers.forEach(m => { m.x(nx * m.d); m.y(ny * m.d * .6); }); };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }, el);
    ctx.current = c;
    return () => { intro.current = null; ctx.current = null; busy.current = false; c.revert(); };
  }, []);

  /* Phases B–D: the ribbon cutting. Guarded so it can only ever start once. */
  const cut = () => {
    const el = root.current; const c = ctx.current;
    if (!el || !c || busy.current || phase !== "ready") return;
    busy.current = true; setPhase("cutting");
     music.startFromGesture();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelectorAll(".ribbon-stage"), { autoAlpha: 0 });
      setPhase("open"); onOpenRef.current(); return;
    }
    c.add(() => {
      intro.current?.progress(1).kill();
      const q = gsap.utils.selector(el);
      const W = innerWidth;
      const point = el.querySelector<HTMLElement>(".cut-flash")!.getBoundingClientRect();
      const cx = point.left + point.width / 2, cy = point.top + point.height / 2;
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      const bladeA = q(".blade-a"), bladeB = q(".blade-b");
      // B — scissors sweep in from the side, swing upright over the cutting point, then the blades open independently
      tl.set(q(".golden-scissors"), { autoAlpha: 1, x: W * .62, y: -50, rotation: 78 })
        .to(q(".ribbon-hit"), { scaleY: .94, duration: .25, yoyo: true, repeat: 1 }, 0)
        .to(q(".golden-scissors"), { x: 0, y: 0, rotation: 0, duration: 1.5, ease: "power3.inOut" }, .1)
        .to(bladeA, { rotation: 16, duration: 1.4 }, .1).to(bladeB, { rotation: -16, duration: 1.4 }, .1)
        .to(q(".golden-scissors"), { y: 8, duration: .22, yoyo: true, repeat: 1, ease: "sine.inOut" }, "+=.05") // align on the ribbon
        .to(bladeA, { rotation: 31, duration: .55, ease: "power2.out" }, "<").to(bladeB, { rotation: -33, duration: .62, ease: "power2.out" }, "<.04")
        .addLabel("ready", "+=.3")
      // C — the blades close, the ribbon splits, flash and sparks
        .to(bladeA, { rotation: 0, duration: .72, ease: "power3.in" }, "ready").to(bladeB, { rotation: 0, duration: .72, ease: "power3.in" }, "ready+=.03")
        .addLabel("cut", "ready+=.66")
        .add(() => { fx.burst(cx, cy); fx.boost(2.3, 5); }, "cut")
        .fromTo(q(".cut-flash"), { scale: .15, autoAlpha: 1 }, { scale: 9, autoAlpha: 0, duration: 1, ease: "power2.out", immediateRender: false }, "cut")
        .fromTo(q(".screen-flash"), { autoAlpha: .85 }, { autoAlpha: 0, duration: .7, ease: "power2.out", immediateRender: false }, "cut")
        .to(q(".ribbon-left"), { rotation: 7, x: -22, duration: .3, ease: "power2.out" }, "cut").to(q(".ribbon-right"), { rotation: -7, x: 22, duration: .3, ease: "power2.out" }, "cut")
        .to(q(".ribbon-left"), { rotation: 72, x: -40, duration: 1.2, ease: "power2.in" }, "cut+=.3").to(q(".ribbon-right"), { rotation: -72, x: 40, duration: 1.2, ease: "power2.in" }, "cut+=.3")
        .to(q(".knot-left"), { y: -34, x: -26, rotation: -14, duration: .28, ease: "power2.out" }, "cut").to(q(".knot-right"), { y: -34, x: 26, rotation: 14, duration: .28, ease: "power2.out" }, "cut")
        .to(q(".knot-left"), { y: innerHeight * .5, x: -W * .08, rotation: -48, duration: 1.1, ease: "power2.in" }, "cut+=.28").to(q(".knot-right"), { y: innerHeight * .55, x: W * .08, rotation: 52, duration: 1.1, ease: "power2.in" }, "cut+=.28")
        .to(q(".hanging-bell"), { rotation: (i: number) => (i ? -11 : 11), duration: .5, yoyo: true, repeat: 1, transformOrigin: "50% 0%" }, "cut")
        .fromTo(q(".ent-title .aanandi-word"), { scale: 1 }, { scale: 1.035, duration: .5, yoyo: true, repeat: 1, immediateRender: false }, "cut")
        .to(q(".golden-scissors"), { x: W * .55, y: -120, rotation: 38, duration: 1.1, ease: "power2.in" }, "cut+=.5")
      // D — warm golden light expands, the invitation is revealed
        .set(q(".gold-wash"), { autoAlpha: 1, clipPath: `circle(0% at ${(cx / W) * 100}% ${(cy / innerHeight) * 100}%)` }, "cut+=.55")
        .to(q(".gold-wash"), { clipPath: `circle(150% at ${(cx / W) * 100}% ${(cy / innerHeight) * 100}%)`, duration: 1.15, ease: "power2.in" }, "cut+=.55")
       .add(() => {
  music.revealFromGesture();
  setPhase("open");
  onOpenRef.current();
  gsap.set(q(".ribbon-stage"), { autoAlpha: 0 });
}, "cut+=1.75")
        .to(q(".gold-wash"), { autoAlpha: 0, duration: 1.3, ease: "power1.out" }, "cut+=1.85");
    });
  };

  return (
    <section ref={root} id="welcome" className="entrance" aria-label="Welcome to AANANDI" data-fx=".8">
      <div className="ent-bg-wrap"><div className="ent-bg"><img className="door-scene" src={entrance} alt="A traditional flower-garlanded wooden entrance with brass lamps, plants, seating and a floral rangoli" fetchPriority="high" /></div></div>
      <div className="ent-light" aria-hidden="true" /><div className="ent-vignette" aria-hidden="true" />
      <div className="ent-title">
        <p className="devanagari">॥ शुभ गृहप्रवेश ॥</p>
        <AanandiLogo size="hero" as="h1" />
        <p className="ent-sub">Vastu Pooja &amp; Griha Pravesh Ceremony</p>
      </div>
      <div className="hanging-bell bell-left" aria-hidden="true"><img src={bell} alt="" /></div><div className="hanging-bell bell-right" aria-hidden="true"><img src={bell} alt="" /></div>
      <div className="ribbon-stage">
        <div className="ribbon-half ribbon-left"><div className="ribbon-face"><i className="ribbon-sheen" /></div></div><div className="ribbon-half ribbon-right"><div className="ribbon-face"><i className="ribbon-sheen" /></div></div>
        <Knot side="left" /><Knot side="right" />
        <button type="button" className="ribbon-hit" onClick={cut} disabled={phase !== "ready"} aria-label="Cut the ribbon" />
        <div className="cut-flash" aria-hidden="true" />
        <GoldenScissors />
      </div>
      <div className="entrance-action">
        <Button variant="ceremonial" size="lg" onClick={phase === "open" ? () => document.getElementById("invitation")?.scrollIntoView({ behavior: "smooth" }) : cut} disabled={phase === "cutting"}>
          {phase === "open" ? <ArrowDown /> : <Scissors />}{phase === "cutting" ? "A beautiful beginning…" : phase === "open" ? "View the invitation" : "Cut the ribbon"}
        </Button>
        <p className="small-caption">Tap the ribbon to begin</p>
      </div>
      <div className="ent-foreground" aria-hidden="true"><Botanicals bottom /></div>
      <div className="screen-flash" aria-hidden="true" /><div className="gold-wash" aria-hidden="true" />
    </section>
  );
}
