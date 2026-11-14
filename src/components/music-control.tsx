import { useEffect, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { music, useMusic } from "@/lib/music";

export function MusicControl() {
  const m = useMusic();
  const [hint, setHint] = useState(false);
  useEffect(() => { music.init(); music.armFirstInteraction(); }, []);
  useEffect(() => { if (!hint) return; const t = setTimeout(() => setHint(false), 7000); return () => clearTimeout(t); }, [hint]);
  const missing = m.file === "missing";
  const label = missing ? "Music file not found" : m.playing ? "Pause music" : "Play music";
  const status = missing ? "No music file" : m.playing ? (m.muted ? "Playing, muted" : "Playing") : m.blocked ? "Tap to play" : "Paused";
  return (
    <div className="music-dock" role="group" aria-label="Background music">
      {hint && <p className="music-hint" role="status">Add your MP3 as <code>public/audio/background-music.mp3</code> to turn the music on.</p>}
      <button type="button" className="music-mute" onClick={() => (missing ? setHint(true) : music.toggleMute())} aria-label={m.muted ? "Unmute music" : "Mute music"} aria-pressed={m.muted} disabled={false} title={m.muted ? "Unmute" : "Mute"}>
        {m.muted || missing ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      <button type="button" className={`music-button ${m.playing ? "is-playing" : ""} ${missing ? "is-missing" : ""}`} onClick={() => (missing ? setHint(true) : music.togglePlay())} aria-label={label} aria-pressed={m.playing} title={`${label} — ${status}`}>
        <Music size={20} strokeWidth={1.6} />
        {m.playing && !m.muted && <span className="music-bars" aria-hidden="true"><i /><i /><i /></span>}
        <span className="music-dot" data-state={missing ? "missing" : m.playing ? "on" : "off"} aria-hidden="true" />
        {missing && <span className="music-slash" aria-hidden="true" />}
      </button>
      <span className="sr-only" role="status">{status}</span>
    </div>
  );
}
