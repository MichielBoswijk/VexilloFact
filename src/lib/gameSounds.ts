let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Short ascending chime — call after a user gesture for best autoplay behavior. */
export async function playCorrectSound(): Promise<void> {
  const ctx = getContext();
  if (!ctx) return;
  await ctx.resume();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(392, t);
  osc.frequency.linearRampToValueAtTime(523.25, t + 0.08);
  osc.frequency.linearRampToValueAtTime(659.25, t + 0.2);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.11, t + 0.02);
  gain.gain.linearRampToValueAtTime(0.0001, t + 0.32);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.34);
}

/** Brief low tone for a wrong guess. */
export async function playWrongSound(): Promise<void> {
  const ctx = getContext();
  if (!ctx) return;
  await ctx.resume();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.linearRampToValueAtTime(110, t + 0.14);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
  gain.gain.linearRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.18);
}

export function vibrateWin(): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate([18, 45, 22, 55, 28]);
}

export function vibrateWrong(): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(22);
}
