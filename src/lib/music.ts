import { useSyncExternalStore } from "react";
import gsap from "gsap";

/**
 * One central audio controller for the whole invitation.
 * - Exactly one HTMLAudioElement exists (kept on `window` so hot reloads cannot create a second one).
 * - React components only *read* this store; re-rendering never touches playback.
 * The audio file lives at public/audio/song.mp3.
 */
export const MUSIC_SRC = "/audio/songg.mp3";
const PREF_KEY = "aanandi-music-pref";
const TARGET_VOLUME = 0.55;

export type MusicState = {
  /** "unknown" until the browser has tried to load the file. "missing" = no usable MP3 at MUSIC_SRC. */
  file: "unknown" | "ready" | "missing";
  playing: boolean;
  muted: boolean;
  /** The visitor explicitly paused; the ribbon cut and other gestures must not restart it. */
  userPaused: boolean;
  /** Browser refused autoplay (needs a tap). */
  blocked: boolean;
};

type Pref = { muted: boolean; userPaused: boolean };
type Holder = { audio: HTMLAudioElement | null; state: MusicState; listeners: Set<() => void>; armed: boolean };
type W = Window & { __aanandiMusic?: Holder };

function readPref(): Pref {
  try {
    const raw = sessionStorage.getItem(PREF_KEY);
    if (raw) { const p = JSON.parse(raw) as Partial<Pref>; return { muted: !!p.muted, userPaused: !!p.userPaused }; }
  } catch { /* storage unavailable */ }
  return { muted: false, userPaused: false };
}
function writePref(p: Pref) { try { sessionStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ } }

const SERVER_STATE: MusicState = { file: "unknown", playing: false, muted: false, userPaused: false, blocked: false };

function holder(): Holder | null {
  if (typeof window === "undefined") return null;
  const w = window as W;
  if (!w.__aanandiMusic) {
    const pref = readPref();
    w.__aanandiMusic = { audio: null, listeners: new Set(), armed: false, state: { ...SERVER_STATE, ...pref } };
  }
  return w.__aanandiMusic;
}

function set(patch: Partial<MusicState>) {
  const h = holder(); if (!h) return;
  h.state = { ...h.state, ...patch };
  h.listeners.forEach(l => l());
}

function ensureAudio(): HTMLAudioElement | null {
  const h = holder(); if (!h) return null;
  if (h.audio) return h.audio;
  const a = new Audio();
  a.loop = true; a.preload = "auto"; a.volume = 0; a.muted = h.state.muted;
  a.addEventListener("canplay", () => set({ file: "ready" }));
  a.addEventListener("loadedmetadata", () => set({ file: "ready" }));
  a.addEventListener("error", () => set({ file: "missing", playing: false }));
  a.addEventListener("playing", () => set({ playing: true, blocked: false }));
  a.addEventListener("pause", () => set({ playing: false }));
  a.src = MUSIC_SRC;
  h.audio = a;
  return a;
}

async function play(): Promise<void> {
  const a = ensureAudio(); if (!a) return;
  try {
    await a.play();
    gsap.killTweensOf(a);
    gsap.to(a, { volume: TARGET_VOLUME, duration: 2.2, ease: "power1.out" });
  } catch (error) {
    if ((error as DOMException)?.name === "NotAllowedError") set({ blocked: true });
    // Any other failure (missing / undecodable file) is reported through the "error" event.
  }
}

export const music = {
  /** Call once on mount: starts loading the file so we know whether it exists. */
  init() { ensureAudio(); },
  /** Called from a user gesture (ribbon cut, first tap). Respects an explicit pause or mute. */
  startFromGesture() {
    const h = holder(); if (!h) return;
    if (h.state.userPaused || h.state.muted) return;
    if (h.audio && !h.audio.paused) return; // never create a second playback
    void play();
  },
  /** Start on the first interaction anywhere, in case the ribbon is not the first thing touched. */
  armFirstInteraction() {
    const h = holder(); if (!h || h.armed) return;
    h.armed = true;
    const go = () => { music.startFromGesture(); remove(); };
    const remove = () => { window.removeEventListener("pointerdown", go); window.removeEventListener("keydown", go); };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
  },
  togglePlay() {
    const h = holder(); const a = ensureAudio(); if (!h || !a) return;
    if (h.state.playing) {
      set({ userPaused: true }); writePref({ muted: h.state.muted, userPaused: true });
      gsap.killTweensOf(a); gsap.to(a, { volume: 0, duration: .35, onComplete: () => a.pause() });
    } else {
      set({ userPaused: false }); writePref({ muted: h.state.muted, userPaused: false });
      void play();
    }
  },
  toggleMute() {
    const h = holder(); const a = ensureAudio(); if (!h || !a) return;
    const muted = !h.state.muted;
    a.muted = muted; set({ muted }); writePref({ muted, userPaused: h.state.userPaused });
  },
};

function subscribe(listener: () => void) {
  const h = holder(); if (!h) return () => {};
  h.listeners.add(listener);
  return () => { h.listeners.delete(listener); };
}
export function useMusic(): MusicState {
  return useSyncExternalStore(subscribe, () => holder()?.state ?? SERVER_STATE, () => SERVER_STATE);
}
