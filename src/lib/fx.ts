/**
 * Tiny shared bus for the particle systems. The petal field, sparkle field and spark burst
 * are independent canvases; they only *listen* here, so the ribbon animation never owns them.
 */
type Burst = { x: number; y: number };
const bus = new EventTarget();
const state = { intensity: 1, boostUntil: 0, boost: 1 };

export const fx = {
  /** Ambient level for the current section (0.35 quiet … 1.4 lively). Smoothly followed by the canvases. */
  setIntensity(value: number) { state.intensity = value; },
  /** Temporarily multiply the ambient level (e.g. at the ribbon cut). */
  boost(multiplier: number, seconds: number) {
    state.boost = multiplier; state.boostUntil = performance.now() + seconds * 1000;
  },
  level(now = performance.now()) { return state.intensity * (now < state.boostUntil ? state.boost : 1); },
  burst(x: number, y: number) { bus.dispatchEvent(new CustomEvent<Burst>("burst", { detail: { x, y } })); },
  onBurst(cb: (b: Burst) => void) {
    const handler = (e: Event) => cb((e as CustomEvent<Burst>).detail);
    bus.addEventListener("burst", handler);
    return () => bus.removeEventListener("burst", handler);
  },
};
