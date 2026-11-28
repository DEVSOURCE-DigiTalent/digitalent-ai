import { Euler, Quaternion } from 'three';
import { blendPoses, restPose, sampleClip, type BonePose, type MotionClip } from './sign-rig';
import type { MotionFrame } from './motion-format';

/**
 * The 3D avatar's performance of a whole lesson video (docs/specs/2026-11-24-sign-language-video.md, "Nhân vật 3D"):
 * one character from start to end, every sign placed where its word is spoken, played whole (never cut), joined to
 * the next by a smooth movement, a rest with the arms down between sentences, and never frozen (breathing, blinking).
 * Pure: the same input gives the same frames, so the track rendered in the browser is reproducible and testable.
 */

export const AVATAR_TIMING = {
  /** Smallest pause between two signs: the hands move from the end of one to the start of the next. */
  gapMs: 180,
  /** A sign may start this much before its word (the hands are in place as the word is heard). */
  leadMs: 120,
  /** The last sentence may be signed this long after its caption ends. */
  tailMs: 1500,
  /** A pause longer than this between two signs: the arms go down to rest, then come up again. */
  restGapMs: 900,
  /** Time to bring the arms down to rest after a sign, and up into the first pose of a sign. */
  restInMs: 380,
  restOutMs: 420,
  /** A sign given a longer length than its motion is played at most this much slower. */
  minSpeed: 0.6,
} as const;

// ----- The signing part of a motion -----------------------------------------------------------

/** Hands raised above the waist by this share of the torso = signing. */
const RAISE_THRESHOLD = 0.28;
const PAD_FRAMES = 2;
const MIN_ACTIVE_MS = 300;

/** How high the higher wrist is above the hips, in torso lengths (0 = hands down at the hips, 1 = at the shoulders). */
export function handRaise(frame: MotionFrame): number {
  const w = frame.poseWorld;
  if (!w) return frame.leftHand || frame.rightHand ? 1 : 0;
  const hips = (w[23].y + w[24].y) / 2;
  const shoulders = (w[11].y + w[12].y) / 2;
  const torso = hips - shoulders; // y points down
  if (torso < 0.1) return 0;
  return Math.max(hips - w[15].y, hips - w[16].y) / torso;
}

/** Hands down for less than this inside a sign is part of the sign; longer is a rest between two performances. */
const SAME_SIGN_GAP_MS = 500;

/**
 * Frames [start, end) of one performance of the sign: a dictionary video starts and ends with the arms down, and often
 * shows the sign twice with a rest in between. Only the first performance is kept, without the idle parts (the avatar
 * makes its own movement into and out of the sign, timed on the speech) — playing the rest in the middle would freeze
 * the avatar inside a word. All frames when no part is clearly raised.
 */
export function activeRange(frames: MotionFrame[], fps: number): { start: number; end: number } {
  const n = frames.length;
  const mergeFrames = Math.max(1, Math.round((SAME_SIGN_GAP_MS * fps) / 1000));
  const minFrames = Math.max(1, Math.round((MIN_ACTIVE_MS * fps) / 1000));
  // Runs of raised frames, joined across short dips.
  const runs: { start: number; end: number }[] = [];
  frames.forEach((frame, i) => {
    if (handRaise(frame) < RAISE_THRESHOLD) return;
    const last = runs[runs.length - 1];
    if (last && i - last.end <= mergeFrames) last.end = i + 1;
    else runs.push({ start: i, end: i + 1 });
  });
  const first = runs.find((run) => run.end - run.start >= minFrames);
  if (!first) return { start: 0, end: n };
  return { start: Math.max(0, first.start - PAD_FRAMES), end: Math.min(n, first.end + PAD_FRAMES) };
}

// ----- Placing the signs on the speech --------------------------------------------------------

export interface TimelineItem {
  itemIndex: number;
  sourceText: string;
  /** null = nothing to sign (the word still takes speaking time). */
  glossId: string | null;
  /** Length the admin gave the sign; null = its motion's length. */
  durationMs: number | null;
}

export interface TimelineSegment {
  index: number;
  startMs: number;
  endMs: number;
  items: TimelineItem[];
}

export interface AvatarPlacement {
  segmentIndex: number;
  itemIndex: number;
  glossId: string;
  startMs: number;
  endMs: number;
  /** 1 = the signer's own pace. */
  speed: number;
  /** Length of the signing part of the motion. */
  sourceMs: number;
}

export interface AvatarTimeline {
  placements: AvatarPlacement[];
  warnings: string[];
}

/** A token with a letter outside ASCII is Vietnamese (one syllable). */
const isVietnamese = (token: string) => [...token].some((c) => c.charCodeAt(0) > 127);

/** Rough number of syllables of a caption word: a Vietnamese word is one; a foreign word counts its vowel groups. */
export function spokenWeight(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).reduce((sum, token) => {
    if (isVietnamese(token) || token.length <= 3) return sum + 1;
    return sum + Math.max(1, token.match(/[aeiouy]+/gi)?.length ?? 1);
  }, 0);
}

const sec = (ms: number) => (ms / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });

/**
 * Where each sign goes. A word is spoken at a time proportional to its syllables within its caption; its sign starts
 * then (a little before), after the previous sign and a short movement. Too many signs for the sentence and its pause:
 * all are played faster (up to `maxSpeedup`) and pulled back from the next sentence; still too long, the signing runs
 * on into the next sentence (with a warning) rather than cutting a sign — a cut sign is unreadable.
 */
export function planAvatarTimeline(
  segments: TimelineSegment[],
  activeMs: (glossId: string) => number,
  options: { durationMs: number; maxSpeedup: number },
): AvatarTimeline {
  const { durationMs, maxSpeedup } = options;
  const { gapMs, leadMs, tailMs, minSpeed } = AVATAR_TIMING;
  const sorted = [...segments].sort((a, b) => a.startMs - b.startMs);
  const placements: AvatarPlacement[] = [];
  const warnings: string[] = [];
  let cursor = 0;

  sorted.forEach((segment, si) => {
    const weights = segment.items.map((item) => spokenWeight(item.sourceText));
    const total = weights.reduce((sum, w) => sum + w, 0) || 1;
    const span = Math.max(0, segment.endMs - segment.startMs);
    let before = 0;
    const signs: { item: TimelineItem; anchor: number; natural: number; speed: number }[] = [];
    segment.items.forEach((item, k) => {
      const anchor = segment.startMs + (before / total) * span;
      before += weights[k];
      if (!item.glossId) return;
      const natural = Math.max(1, activeMs(item.glossId));
      const target = item.durationMs && item.durationMs > 0 ? item.durationMs : natural;
      signs.push({ item, anchor, natural, speed: Math.min(maxSpeedup, Math.max(minSpeed, natural / target)) });
    });
    if (signs.length === 0) return;

    const next = sorted.slice(si + 1).find((s) => s.items.some((item) => item.glossId));
    const limit = Math.max(segment.startMs, Math.min(durationMs, next ? next.startMs : segment.endMs + tailMs));
    const earliest = Math.max(0, cursor, segment.startMs - leadMs);
    const gaps = gapMs * (signs.length - 1);
    let lengths = signs.map((s) => s.natural / s.speed);
    const needed = lengths.reduce((sum, l) => sum + l, 0);
    const room = limit - earliest - gaps;
    if (needed > room) {
      const factor = needed / Math.max(1, room);
      signs.forEach((s) => { s.speed = Math.min(maxSpeedup, s.speed * factor); });
      lengths = signs.map((s) => s.natural / s.speed);
    }

    // At the word, after the previous sign.
    const start: number[] = [];
    const end: number[] = [];
    signs.forEach((s, k) => {
      start[k] = Math.max(s.anchor - leadMs, k === 0 ? earliest : end[k - 1] + gapMs);
      end[k] = start[k] + lengths[k];
    });
    // Past the next sentence: pull the signs back toward their sentence, never before it may start.
    const n = signs.length;
    if (end[n - 1] > limit) {
      let latest = limit;
      for (let k = n - 1; k >= 0; k -= 1) {
        end[k] = Math.min(end[k], latest);
        start[k] = end[k] - lengths[k];
        latest = start[k] - gapMs;
      }
      for (let k = 0; k < n; k += 1) {
        const min = k === 0 ? earliest : end[k - 1] + gapMs;
        if (start[k] < min) {
          start[k] = min;
          end[k] = min + lengths[k];
        }
      }
    }

    const over = end[n - 1] - limit;
    if (over > 250) {
      warnings.push(`Câu ${segment.index + 1}: các ký hiệu dài hơn lời nói ${sec(over)} giây dù đã ra dấu nhanh nhất (${maxSpeedup}×); nhân vật ra dấu nối sang câu sau.`);
    }

    signs.forEach((s, k) => {
      const previous = placements[placements.length - 1];
      const from = Math.max(Math.round(start[k]), previous ? previous.endMs + 1 : 0);
      const to = Math.round(end[k]);
      // A sign the end of the video would cut in half is left out: a fragment of a sign means nothing.
      if (from >= durationMs || to <= from || durationMs - from < (to - from) / 2) {
        warnings.push(`Câu ${segment.index + 1}: không còn đủ thời gian trước khi video kết thúc để ra dấu “${s.item.sourceText}”, ký hiệu này được bỏ.`);
        return;
      }
      placements.push({
        segmentIndex: segment.index, itemIndex: s.item.itemIndex, glossId: s.item.glossId!,
        startMs: from, endMs: Math.min(to, durationMs), speed: Math.round(s.speed * 1000) / 1000, sourceMs: Math.round(s.natural),
      });
    });
    cursor = end[n - 1] + gapMs;
  });

  return { placements, warnings };
}

// ----- The pose at any time -------------------------------------------------------------------

/** Ease in and out (no jerk when a movement starts or stops). */
export const ease = (u: number) => {
  const t = Math.min(1, Math.max(0, u));
  return t * t * t * (t * (6 * t - 15) + 10);
};

export interface PlacedSign extends AvatarPlacement {
  /** The signing part of the motion (see {@link activeRange}). */
  clip: MotionClip;
}

/**
 * The avatar's pose at any time of the lesson video: inside a sign its motion (at its speed); between two close signs a
 * smooth movement from the end of one to the start of the next; across a longer pause the arms go down to rest and
 * come up again in time for the next sign.
 */
export function createPoseSampler(signs: PlacedSign[]): (timeMs: number) => BonePose {
  const list = [...signs].sort((a, b) => a.startMs - b.startMs);
  const firstPose = list.map((p) => sampleClip(p.clip, 0));
  const lastPose = list.map((p) => sampleClip(p.clip, (p.endMs - p.startMs) * p.speed));
  const rest = restPose();
  const { restGapMs, restInMs, restOutMs } = AVATAR_TIMING;

  const towardsRest = (from: BonePose, elapsed: number) => (elapsed >= restInMs ? rest : blendPoses(from, rest, ease(elapsed / restInMs)));
  const fromRest = (to: BonePose, remaining: number) => (remaining >= restOutMs ? rest : blendPoses(rest, to, ease(1 - remaining / restOutMs)));

  return (t: number) => {
    // Last sign started at or before t.
    let lo = 0;
    let hi = list.length - 1;
    let k = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (list[mid].startMs <= t) {
        k = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    const current = k >= 0 ? list[k] : null;
    if (current && t < current.endMs) return sampleClip(current.clip, (t - current.startMs) * current.speed);
    const next = k + 1 < list.length ? list[k + 1] : null;
    if (current && next) {
      const gap = next.startMs - current.endMs;
      if (gap <= restGapMs) return blendPoses(lastPose[k], firstPose[k + 1], ease((t - current.endMs) / Math.max(1, gap)));
      const remaining = next.startMs - t;
      return remaining < restOutMs ? fromRest(firstPose[k + 1], remaining) : towardsRest(lastPose[k], t - current.endMs);
    }
    if (current) return towardsRest(lastPose[k], t - current.endMs);
    if (next) return fromRest(firstPose[0], next.startMs - t);
    return rest;
  };
}

/** Breathing: the chest rises and falls slowly, so the avatar never looks frozen while it rests. */
export function breathing(timeMs: number): Quaternion {
  const phase = (2 * Math.PI * timeMs) / 4200;
  return new Quaternion().setFromEuler(new Euler(0.02 * Math.sin(phase), 0, 0.006 * Math.sin((2 * Math.PI * timeMs) / 6900)));
}

/** Eyelids (0 open – 1 closed): a short blink every 3–4.5 s, at times that do not look mechanical. */
export function blinkAt(timeMs: number): number {
  const period = 3800;
  const cycle = Math.floor(timeMs / period);
  const offset = ((cycle * 7919) % 11) * 70; // 0–700 ms, repeatable
  const t = timeMs - cycle * period - offset;
  const length = 160;
  if (t < 0 || t > length) return 0;
  return 1 - Math.abs(t - length / 2) / (length / 2);
}

/** The full pose of a frame: the signing and the idle life of the body. */
export function withIdle(pose: BonePose, timeMs: number): BonePose {
  const chest = breathing(timeMs);
  return { ...pose, chest: pose.chest ? pose.chest.clone().multiply(chest) : chest };
}
