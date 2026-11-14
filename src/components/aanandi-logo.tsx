import { HOME } from "@/lib/invitation";

export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg className={`logo-flourish ${className}`} viewBox="0 0 320 28" aria-hidden="true">
      <defs><linearGradient id="fl-gold" x1="0" x2="1"><stop offset="0" stopColor="currentColor" stopOpacity="0" /><stop offset=".25" stopColor="currentColor" /><stop offset=".75" stopColor="currentColor" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
      <path d="M6 14h118M196 14h118" stroke="url(#fl-gold)" strokeWidth="1" fill="none" />
      <path d="M124 14c10-12 20-12 26 0M196 14c-10-12-20-12-26 0M124 14c10 12 20 12 26 0M196 14c-10 12-20 12-26 0" stroke="currentColor" strokeWidth=".9" fill="none" />
      <path d="M160 4l7 10-7 10-7-10z" fill="currentColor" />
      <circle cx="140" cy="14" r="1.8" fill="currentColor" /><circle cx="180" cy="14" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** The AANANDI wordmark. `tone` picks lettering for the background it sits on. */
export function AanandiLogo({ size = "md", tone = "burgundy", tagline = true, as: Tag = "p", className = "" }: { size?: "hero" | "lg" | "md" | "sm"; tone?: "burgundy" | "gold"; tagline?: boolean; as?: "h1" | "h2" | "p"; className?: string }) {
  return (
    <div className={`aanandi-logo logo-${size} tone-${tone} ${className}`}>
      <Flourish />
      <Tag className="aanandi-word" aria-label={HOME.name}>{HOME.name.split("").map((letter, i) => <span key={i} className="aanandi-letter" aria-hidden="true">{letter}</span>)}</Tag>
      <Flourish className="flip" />
      {tagline && <p className="aanandi-tagline">{HOME.tagline}</p>}
    </div>
  );
}
