/**
 * Canvas stand-in for a background video: slow bokeh through warm haze.
 * Shown until a video starts playing, and on its own when no video is configured.
 */

type Rgb = readonly [number, number, number];

interface SceneConfig {
  base: readonly [string, string];
  leak: Rgb;
  leakAlpha: number;
  leakX: number;
  leakY: number;
  discCount: number;
  palette: readonly Rgb[];
}

export type BokehSceneName = 'ember' | 'dusk';

const SCENES: Record<BokehSceneName, SceneConfig> = {
  ember: {
    base: ['#1b130b', '#040302'],
    leak: [255, 190, 120],
    leakAlpha: 0.3,
    leakX: 0.72,
    leakY: 0.14,
    discCount: 26,
    palette: [[255, 214, 160], [255, 236, 205], [232, 170, 105], [225, 224, 204]],
  },
  dusk: {
    base: ['#0b1c29', '#02070b'],
    leak: [140, 185, 220],
    leakAlpha: 0.24,
    leakX: 0.28,
    leakY: 0.1,
    discCount: 24,
    palette: [[170, 205, 235], [225, 224, 204], [120, 170, 195], [205, 222, 240]],
  },
};

/** Drawn at half resolution: the discs are soft, and it keeps each frame cheap. */
const RENDER_SCALE = 0.5;
const FRAME_INTERVAL_MS = 33;
const MAX_STEP_MS = 50;
/** Start mid-drift so the first (and, when paused, only) frame is already composed. */
const START_TIME_MS = 8000;
const SPECK_COUNT = 70;
const TAU = Math.PI * 2;

interface Disc {
  x: number; y: number; r: number; a: number; c: Rgb;
  ax: number; ay: number; sp: number; ph: number;
}

interface Speck {
  x: number; y: number; r: number; a: number; c: Rgb; sp: number; ph: number;
}

export interface BokehScene {
  setRunning(running: boolean): void;
  resize(): void;
  dispose(): void;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgba = (c: Rgb, alpha: number) => `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;

export function createBokehScene(canvas: HTMLCanvasElement, name: BokehSceneName, seed: number): BokehScene | null {
  const maybeContext = canvas.getContext('2d');
  if (!maybeContext) return null;
  const ctx: CanvasRenderingContext2D = maybeContext;

  const cfg = SCENES[name];
  const rnd = mulberry32(seed);
  const pick = () => cfg.palette[Math.floor(rnd() * cfg.palette.length)];
  const discs: Disc[] = Array.from({ length: cfg.discCount }, () => ({
    x: rnd(), y: 0.08 + rnd() * 0.85, r: 0.025 + rnd() ** 2 * 0.1, a: 0.07 + rnd() * 0.2, c: pick(),
    ax: 0.015 + rnd() * 0.05, ay: 0.01 + rnd() * 0.03, sp: 0.04 + rnd() * 0.1, ph: rnd() * TAU,
  }));
  const specks: Speck[] = Array.from({ length: SPECK_COUNT }, () => ({
    x: rnd(), y: rnd(), r: 0.0015 + rnd() * 0.004, a: 0.15 + rnd() * 0.5, c: pick(), sp: 0.2 + rnd() * 0.8, ph: rnd() * TAU,
  }));

  let width = 1;
  let height = 1;
  let elapsed = START_TIME_MS;
  let last = 0;
  let raf = 0;

  function fillBackground(s: number, size: number) {
    const base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, cfg.base[0]);
    base.addColorStop(1, cfg.base[1]);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const lx = width * (cfg.leakX + 0.06 * Math.sin(s * 0.05));
    const ly = height * cfg.leakY;
    const leak = ctx.createRadialGradient(lx, ly, 0, lx, ly, size * 0.75);
    leak.addColorStop(0, rgba(cfg.leak, cfg.leakAlpha));
    leak.addColorStop(1, rgba(cfg.leak, 0));
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, width, height);
  }

  function drawLights(s: number, size: number) {
    for (const d of discs) {
      const x = (d.x + Math.sin(s * d.sp + d.ph) * d.ax) * width;
      const y = (d.y + Math.cos(s * d.sp * 0.7 + d.ph) * d.ay) * height;
      const r = d.r * size;
      const disc = ctx.createRadialGradient(x, y, 0, x, y, r);
      disc.addColorStop(0, rgba(d.c, d.a * 0.55));
      disc.addColorStop(0.7, rgba(d.c, d.a));
      disc.addColorStop(0.84, rgba(d.c, d.a * 0.3));
      disc.addColorStop(1, rgba(d.c, 0));
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    for (const p of specks) {
      ctx.fillStyle = rgba(p.c, p.a * (0.55 + 0.45 * Math.sin(s * p.sp + p.ph)));
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.r * size, 0, TAU);
      ctx.fill();
    }
  }

  function draw() {
    const s = elapsed / 1000;
    const size = Math.max(width, height);
    ctx.globalCompositeOperation = 'source-over';
    fillBackground(s, size);
    ctx.globalCompositeOperation = 'lighter';
    drawLights(s, size);
    ctx.globalCompositeOperation = 'source-over';
    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.42, Math.min(width, height) * 0.15, width * 0.5, height * 0.5, size * 0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_INTERVAL_MS) return;
    elapsed += Math.min(now - last, MAX_STEP_MS);
    last = now;
    draw();
  }

  return {
    setRunning(running) {
      if (running && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!running && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    resize() {
      const box = canvas.getBoundingClientRect();
      width = canvas.width = Math.max(1, Math.round(box.width * RENDER_SCALE));
      height = canvas.height = Math.max(1, Math.round(box.height * RENDER_SCALE));
      draw();
    },
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
