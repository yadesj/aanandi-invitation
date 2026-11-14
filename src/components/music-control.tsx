
import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { music, useMusic } from "@/lib/music";

export function MusicControl() {
  const m = useMusic();
  const [hint, setHint] = useState(false);

  useEffect(() => {
    music.init();
    
  }, []);

  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(false), 7000);
    return () => clearTimeout(t);
  }, [hint]);

  const missing = m.file === "missing";

  const label = missing
    ? "Music file not found"
    : m.playing
      ? m.muted
        ? "Unmute music"
        : "Pause music"
      : "Play music";

  const status = missing
    ? "No music file"
    : m.playing
      ? m.muted
        ? "Playing, muted"
        : "Playing"
      : m.blocked
        ? "Tap to play"
        : "Paused";

  const handleMusicClick = () => {
    if (missing) {
      setHint(true);
      return;
    }

    if (m.playing) {
      if (m.muted) {
        music.toggleMute();
      } else {
        music.togglePlay();
      }
      return;
    }

    if (m.muted) music.toggleMute();
    music.togglePlay();
  };

  return (
    <div className="music-dock">
      {hint && (
        <p className="music-hint" role="status">
          Add your MP3 as{" "}
          <code>public/audio/songg.mp3</code>{" "}
          to turn the music on.
        </p>
      )}

      <button
        type="button"
        className={`music-button ${m.playing && !m.muted ? "is-playing" : ""} ${missing ? "is-missing" : ""}`}
        onClick={handleMusicClick}
        aria-label={label}
        aria-pressed={m.playing && !m.muted}
        title={`${label} — ${status}`}
      >
        <Music size={21} strokeWidth={1.6} />

        {m.playing && !m.muted && (
          <span className="music-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}

        <span
          className="music-dot"
          data-state={
            missing
              ? "missing"
              : m.playing && !m.muted
                ? "on"
                : "off"
          }
          aria-hidden="true"
        />

        {missing && (
          <span className="music-slash" aria-hidden="true" />
        )}
      </button>

      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
