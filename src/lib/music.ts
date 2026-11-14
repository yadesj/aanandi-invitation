
import { useSyncExternalStore } from "react";

export const MUSIC_SRC = "/audio/songg.mp3";
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

  const a = new Audio(MUSIC_SRC);
  a.loop = true;
  a.preload = "auto";
  a.volume = TARGET_VOLUME;
  a.muted = h.state.muted;

  a.addEventListener("canplay", () => set({ file: "ready" }));
  a.addEventListener("loadedmetadata", () => set({ file: "ready" }));
  a.addEventListener("error", () =>
    set({ file: "missing", playing: false })
  );
  a.addEventListener("playing", () =>
    set({ playing: true, blocked: false })
  );
  a.addEventListener("pause", () => set({ playing: false }));

  h.audio = a;
  return a;
}

function playFromGesture() {
  const h = holder();
  const a = ensureAudio();

  if (!h || !a || h.state.userPaused || h.state.muted) return;

  // Start immediately from the beginning.
  a.currentTime = 0;

  const promise = a.play();

  promise?.catch((error) => {
    if ((error as DOMException)?.name === "NotAllowedError") {
      set({ blocked: true });
    }
  });
}

export const music = {
  init() {
    ensureAudio();
  },

  startFromGesture() {
    playFromGesture();
  },

  prepareFromGesture() {},

  revealFromGesture() {},

  armFirstInteraction() {},

  togglePlay() {
    const h = holder();
    const a = ensureAudio();
    if (!h || !a) return;

    if (!a.paused) {
      a.pause();
      set({ userPaused: true });
      writePref({ muted: h.state.muted, userPaused: true });
    } else {
      set({ userPaused: false });
      writePref({ muted: h.state.muted, userPaused: false });

      const promise = a.play();
      promise?.catch((error) => {
        if ((error as DOMException)?.name === "NotAllowedError") {
          set({ blocked: true });
        }
      });
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
  return () => h.listeners.delete(listener);
}

export function useMusic(): MusicState {
  return useSyncExternalStore(
    subscribe,
    () => holder()?.state ?? SERVER_STATE,
    () => SERVER_STATE
  );
}
