import ganpati from "@/assets/ganpati-blessings.png";
import kalash from "@/assets/auspicious-kalash.png";
import havan from "@/assets/sacred-havan.png";
import diya from "@/assets/brass-diya.png";
import botanical from "@/assets/botanical-corner.png";

const artworks = { ganpati, kalash, havan, diya };
export function Artwork({ kind, className = "" }: { kind: keyof typeof artworks; className?: string }) {
  return <img className={`ceremony-art ${className}`} src={artworks[kind]} alt={kind === "ganpati" ? "Lord Ganesh adorned with flowers" : kind === "kalash" ? "Traditional auspicious kalash" : kind === "havan" ? "Sacred havan fire" : "Brass diya"} loading="lazy" />;
}
export function Divider() {
  return <svg className="gold-divider" viewBox="0 0 180 32" aria-hidden="true"><path d="M0 16h70m40 0h70M76 16q8-12 14 0q6-12 14 0q-8 12-14 0q-6 12-14 0Z" fill="none" stroke="currentColor" strokeWidth=".7" /><path d="m90 9 4 7-4 7-4-7Z" fill="currentColor" /></svg>;
}
export function Botanicals({ bottom = false }: { bottom?: boolean }) {
  return <div className={`botanicals ${bottom ? "botanicals-bottom" : ""}`} aria-hidden="true"><img src={botanical} alt="" /><img src={botanical} alt="" /></div>;
}