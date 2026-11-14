
import { useSyncExternalStore } from "react";
import gsap from "gsap";

export const MUSIC_SRC = "/audio/songg.mpeg";
const PREF_KEY = "aanandi-music-pref";
const TARGET_VOLUME = 0.55;

export type MusicState = {
  file: "unknown" | "ready" | "missing";
  playing: boolean;
  muted: boolean;
  userPaused: boolean;
  blocked: boolean;
};

type Pref = { muted: boolean; userPaused: boolean };
type Holder = {
  audio: HTMLAudioElement | null;
  state: MusicState;
  listeners: Set<() => void>;
  armed: boolean;
};

type W = Window & { __aanandiMusic?: Holder };

function readPref(): Pref {
  try {
    const raw = sessionStorage.getItem(PREF_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Pref>;
      return { muted: !!p.muted, userPaused: !!p.userPaused };
    }
  } catch {}
  return { muted: false, userPaused: false };
}

function writePref(p: Pref) {
  try {
    sessionStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {}
}

const SERVER_STATE: MusicState = {
  file: "unknown",
  playing: false,
  muted: false,
  userPaused: false,
  blocked: false,
};

function holder(): Holder | null {
  if (typeof window === "undefined") return null;

  const w = window as W;

  if (!w.__aanandiMusic) {
    const pref = readPref();
    w.__aanandiMusic = {
      audio: null,
      listeners: new Set(),
      armed: false,
      state: { ...SERVER_STATE, ...pref },
    };
  }

  return w.__aanandiMusic;
}

function set(patch: Partial<MusicState>) {
  const h = holder();
  if (!h) return;

  h.state = { ...h.state, ...patch };
  h.listeners.forEach((l) => l());
}

function ensureAudio(): HTMLAudioElement | null {
  const h = holder();
  if (!h) return null;
  if (h.audio) return h.audio;

  const a = new Audio();
  a.loop = true;
  a.preload = "auto";
  a.volume = 0;
  a.muted = h.state.muted;

  a.addEventListener("canplay", () => set({ file: "ready" }));
  a.addEventListener("loadedmetadata", () => set({ file: "ready" }));
  a.addEventListener("error", () => set({ file: "missing", playing: false }));
  a.addEventListener("playing", () => set({ playing: true, blocked: false }));
  a.addEventListener("pause", () => set({ playing: false }));

  a.src = MUSIC_SRC;
  h.audio = a;
  return a;
}

function fadeIn(a: HTMLAudioElement) {
  gsap.killTweensOf(a);
  gsap.to(a, {
    volume: TARGET_VOLUME,
    duration: 2.2,
    ease: "power1.out",
  });
}

async function play(): Promise<void> {
  const a = ensureAudio();
  if (!a) return;

  try {
    await a.play();
    fadeIn(a);
  } catch (error) {
    if ((error as DOMException)?.name === "NotAllowedError") {
      set({ blocked: true });
    }
  }
}

export const music = {
  init() {
    ensureAudio();
  },

  // Called directly by the ribbon click. Starts silently to satisfy browser gesture rules.
  prepareFromGesture() {
    const h = holder();
    if (!h || h.state.userPaused || h.state.muted) return;

    const a = ensureAudio();
    if (!a || !a.paused) return;

    a.volume = 0;
    void a.play().then(() => {
      gsap.killTweensOf(a);
      a.volume = 0;
    }).catch((error) => {
      if ((error as DOMException)?.name === "NotAllowedError") {
        set({ blocked: true });
      }
    });
  },

  // Called when the ribbon-cutting reveal reaches its finish.
  revealFromGesture() {
    const h = holder();
    const a = ensureAudio();
    if (!h || !a || h.state.userPaused || h.state.muted) return;

    if (a.paused) {
      void play();
    } else {
      fadeIn(a);
    }
  },

  startFromGesture() {
    const h = holder();
    if (!h || h.state.userPaused || h.state.muted) return;
    void play();
  },

  armFirstInteraction() {
    // Deliberately disabled: music must wait for ribbon cutting.
  },

  togglePlay() {
    const h = holder();
    const a = ensureAudio();
    if (!h || !a) return;

    if (h.state.playing) {
      set({ userPaused: true });
      writePref({ muted: h.state.muted, userPaused: true });

      gsap.killTweensOf(a);
      gsap.to(a, {
        volume: 0,
        duration: 0.35,
        onComplete: () => a.pause(),
      });
    } else {
      set({ userPaused: false });
      writePref({ muted: h.state.muted, userPaused: false });
      void play();
    }
  },

  toggleMute() {
    const h = holder();
    const a = ensureAudio();
    if (!h || !a) return;

    const muted = !h.state.muted;
    a.muted = muted;
    set({ muted });
    writePref({ muted, userPaused: h.state.userPaused });
  },
};

function subscribe(listener: () => void) {
  const h = holder();
  if (!h) return () => {};

  h.listeners.add(listener);
  return () => {
    h.listeners.delete(listener);
  };
}

export function useMusic(): MusicState {
  return useSyncExternalStore(
    subscribe,
    () => holder()?.state ?? SERVER_STATE,
    () => SERVER_STATE
  );
}
