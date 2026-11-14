import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, Copy, Heart, MapPin, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Entrance } from "@/components/entrance";
import { PetalField, SparkleField, SparkBurst } from "@/components/particles";
import { MusicControl } from "@/components/music-control";
import { Showcase } from "@/components/showcase";
import { AanandiLogo } from "@/components/aanandi-logo";
import { Artwork, Botanicals, Divider } from "@/components/invitation-art";
import { EVENT, HOME, calendarUrl, directionsUrl, getCountdown, mapsEmbedUrl, mapsOpenUrl, sharingUrl } from "@/lib/invitation";
import { fx } from "@/lib/fx";
import bell from "@/assets/brass-bell.png";

export const Route = createFileRoute("/")({
head: () => ({
  meta: [
    {
      title: "AANANDI — Griha Pravesh Invitation",
    },
    {
      name: "description",
      content:
        "Join Mr. Arpan & Mrs. Krishna Doshi for the Vastu Pooja & Griha Pravesh Ceremony at AANANDI, Umreth, on Friday, November 27, 2026.",
    },
    {
      property: "og:title",
      content: "AANANDI — You're Cordially Invited",
    },
    {
      property: "og:description",
      content:
        "Where Happiness Begins. Celebrate our new home with the Doshi family on November 27, 2026.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:image",
      content: "https://YOUR-DOMAIN/thumbnail.png",
    },
    {
      property: "og:image:width",
      content: "1648",
    },
    {
      property: "og:image:height",
      content: "900",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:image",
      content: "https://YOUR-DOMAIN/thumbnail.png",
    },
  ],
}),
component: Index,
});
function Reveal({ children, className = "", id, fx: level }: { children: ReactNode; className?: string; id?: string; fx?: number }) {
  return <motion.section id={id} data-fx={level} className={`invitation-section ${className}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .8 }}>{children}</motion.section>;
}


function Countdown() {
  const [time, setTime] = useState<number[] | null>(null);

  useEffect(() => {
    const update = () => setTime(getCountdown(Date.now()));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const labels = ["Days", "Hours", "Minutes", "Seconds"];

  return (
    <div className="countdown-grid" role="timer" aria-label="Countdown to November 27, 2026">
      <div className="countdown-inner">
        {labels.map((label, i) => {
          const value = time ? String(time[i]).padStart(2, "0") : "00";

          return (
            <div className="countdown-unit" key={label}>
              <div className="countdown-card">
                <motion.span
                  key={value}
                  className="countdown-number"
                  initial={{ opacity: 0, rotateX: -75, y: 12 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  {value}
                </motion.span>
              </div>
              <span className="countdown-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function Diya({ className = "" }: { className?: string }) {
  return <div className={`diya-vignette ${className}`}><Artwork kind="diya" /><span className="diya-glow" /></div>;
}

/** Changes how lively the ambient petals and sparkles are, depending on the section in view. */
function useSectionIntensity(enabled: boolean) {
  useEffect(() => {
    if (!enabled) { fx.setIntensity(.8); return; }
    const sections = document.querySelectorAll<HTMLElement>("[data-fx]");
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) fx.setIntensity(Number((e.target as HTMLElement).dataset["fx"]) || 1); }), { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [enabled]);
}

function Index() {
  const [opened, setOpened] = useState(false);
  const [entranceKey, setEntranceKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const justOpened = useRef(false);

  // The invitation is locked until the ribbon is cut.
  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [opened]);
  useEffect(() => {
    if (opened && justOpened.current) { justOpened.current = false; document.getElementById("invitation")?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" }); }
  }, [opened]);
  useSectionIntensity(opened);

  const handleOpen = useCallback(() => { justOpened.current = true; setOpened(true); }, []);
  const copy = async () => { try { await navigator.clipboard.writeText(EVENT.address); setCopied(true); setCopyError(false); setTimeout(() => setCopied(false), 3000); } catch { setCopyError(true); } };
  const restart = () => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); setOpened(false); setEntranceKey(k => k + 1); };
  const share = () => window.open(sharingUrl(window.location.href.split("#")[0] ?? window.location.href), "_blank", "noopener,noreferrer");

  return <div className="invitation-page">
    <PetalField /><SparkleField /><SparkBurst /><MusicControl />
    <header className="page-masthead"><a href="#welcome" className="monogram" aria-label="AANANDI welcome">A</a><span className="masthead-caption">GRIHA PRAVESH · 27 NOVEMBER 2026</span><Button variant="ghost" size="icon" className="masthead-share" aria-label="Share invitation on WhatsApp" title="Share invitation" onClick={share}><Send /></Button></header>
    <Entrance key={entranceKey} onOpen={handleOpen} />
    <main hidden={!opened}>
      <Reveal id="invitation" className="welcome-invitation" fx={1}><span className="section-scroll"><ArrowDown size={15} /></span><p className="eyebrow">WITH JOY IN OUR HEARTS</p><h2 className="calligraphy">Welcome to our new home</h2><AanandiLogo size="lg" as="p" /><Divider /><p className="intro-copy">A new threshold. A cherished dream.<br />A home made complete by your blessings.</p></Reveal>

      <Reveal className="blessings-section" fx={1.15}>
        <Botanicals />
        <div className="ganpati-frame"><img className="frame-bell fb-l" src={bell} alt="" aria-hidden="true" /><img className="frame-bell fb-r" src={bell} alt="" aria-hidden="true" /><Artwork kind="ganpati" className="ganpati-art" /></div>
        <p className="invocation">{EVENT.invocation}</p><Divider /><p className="blessings-copy">{EVENT.blessings}</p>
       <p className="calligraphy hosts">{EVENT.hosts}</p>
<p className="blessings-copy">Warmly welcome you.</p>

<div className="hosts-countdown">
  <p className="eyebrow">EVERY MOMENT BRINGS US CLOSER</p>
  <h2 className="calligraphy">Until our new beginning</h2>
  <Countdown />
  <Diya />
</div>
      </Reveal>

      <Reveal className="main-invitation" fx={1}><div className="ornamental-invitation"><span className="ornament-corner corner-tl" /><span className="ornament-corner corner-tr" /><span className="ornament-corner corner-bl" /><span className="ornament-corner corner-br" />
        <p className="eyebrow">WELCOME TO OUR NEW HOME</p><AanandiLogo size="lg" as="h2" /><Divider />
        <p className="invitation-copy">{EVENT.invitation}</p>
        <h3 className="occasion">{EVENT.occasion}</h3>
        <p className="date-weekday">FRIDAY</p><div className="ceremony-date"><span>NOVEMBER</span><strong>27</strong><span>2026</span></div>
        <p className="date-footnote">{EVENT.date}</p>
        <Button variant="invitation" asChild><a href={calendarUrl} target="_blank" rel="noopener noreferrer"><CalendarDays />Add to calendar</a></Button>
      </div></Reveal>

      <Reveal className="schedule-section" fx={.7}><p className="eyebrow">THE AUSPICIOUS DAY</p><h2>A celebration of blessings</h2><Divider /><div className="ceremony-schedule">{EVENT.schedule.map((event, i) => <article className="schedule-event" key={event.title}><span className="event-number">0{i + 1}</span><Artwork kind={event.asset} /><p className="event-time">{event.time}</p><h3>{event.title}</h3><p className="event-note">{event.note}</p></article>)}</div><p className="schedule-date"><CalendarDays size={15} />{EVENT.date}</p></Reveal>

    

      <Showcase />

      <Reveal className="residence-section" fx={.6}><Botanicals bottom /><div className="residence-symbol"><MapPin /></div><p className="eyebrow">OUR NEW RESIDENCE</p><AanandiLogo size="md" as="h2" tagline={false} /><Divider />
        <address>6, Shreenathji Villa,<br />Opp. Panetar Park,<br />Near Girirajji Temple,<br /><strong>Umreth.</strong></address>
        <div className="action-row"><Button variant="botanical" asChild><a href={directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin />Get directions<ArrowUpRight /></a></Button><Button variant="invitation" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Address copied" : "Copy address"}</Button></div>
        <p className="copy-status" role="status">{copyError ? `Please copy: ${EVENT.address}` : copied ? "Address copied to your clipboard." : ""}</p>
        <div className="map-frame"><iframe title="Map showing the venue in Umreth" src={mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
        <a className="map-link" href={mapsOpenUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps<ArrowUpRight size={14} /></a>
      </Reveal>

      <Reveal className="family-section" fx={.8}><p className="eyebrow">INVITED BY</p><h2 className="calligraphy">With love &amp; warm wishes</h2><Divider /><div className="family-names">{EVENT.family.map(name => <p key={name}>{name}</p>)}</div><Heart className="family-heart" size={20} strokeWidth={1} /></Reveal>

      <Reveal className="closing-section" fx={1.5}><Botanicals bottom />
        <div className="closing-diyas"><Diya className="diya-side" /><Diya className="diya-side" /></div>
        <p className="eyebrow">YOUR PRESENCE IS OUR GREATEST GIFT</p><AanandiLogo size="hero" tone="gold" as="p" />
        <p className="closing-copy">Your presence and blessings will make our new home truly special.</p>
        <div className="action-row"><Button variant="botanical" onClick={share}><Send />Share on WhatsApp</Button><Button variant="invitation" onClick={restart}><RotateCcw />Replay invitation</Button></div>
        <Divider /><p className="small-caption">WITH LOVE, THE DOSHI FAMILY</p>
      </Reveal>
    </main>
    <footer className="page-footer" hidden={!opened}><span>{HOME.name}</span><span>27 NOVEMBER 2026 · UMRETH</span></footer>
  </div>;
}
