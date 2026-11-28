/**
 * The transcript of a lesson video — what is said and when — the input of its sign-language video
 * (docs/specs/2026-11-24-ai-video-captions.md); learners do not see it. Pure helpers of the course builder
 * (TranscriptEditor); the rules mirror the backend PlatformCaptionRules.CheckSaved so lines the editor accepts are lines
 * the API saves.
 */

export interface CaptionCue {
  /** Milliseconds from the start of the video. */
  startMs: number;
  endMs: number;
  text: string;
}

export const CAPTION_LIMITS = {
  maxCues: 2000,
  maxTextLength: 200,
  maxCueDurationMs: 60_000,
  maxTimeMs: 6 * 60 * 60 * 1000,
} as const;

/** "1:05.2" for the editor and the transcript: minutes:seconds, tenths when asked, hours past one hour. */
export function formatCueTime(ms: number, withTenths = true): string {
  const safe = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safe % 1000) / 100);
  const ss = String(seconds).padStart(2, '0');
  const base = hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${ss}` : `${minutes}:${ss}`;
  return withTenths ? `${base}.${tenths}` : base;
}

/** Milliseconds of "1:05.2", "01:05,25", "1:02:03" or "65.5"; null when it cannot be read. */
export function parseCueTime(value: string): number | null {
  const parts = value.trim().replace(',', '.').split(':');
  if (parts.length === 0 || parts.length > 3 || parts.some((part) => part.trim() === '')) return null;
  const last = Number(parts[parts.length - 1]);
  if (!Number.isFinite(last) || last < 0) return null;
  let total = last;
  let multiplier = 60;
  for (let i = parts.length - 2; i >= 0; i -= 1) {
    if (!/^\d+$/.test(parts[i].trim())) return null;
    total += Number(parts[i]) * multiplier;
    multiplier *= 60;
  }
  return Math.round(total * 1000);
}

/** The text as the API stores it: lines kept, spaces inside a line collapsed. */
export function cleanCueText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/** The first problem of a draft, worded like the API ("Câu 2: …"), or null when it can be saved. */
export function captionProblem(cues: CaptionCue[]): { index: number | null; message: string } | null {
  if (cues.length > CAPTION_LIMITS.maxCues) return { index: null, message: `Tối đa ${CAPTION_LIMITS.maxCues} câu lời thoại cho một video.` };
  for (let i = 0; i < cues.length; i += 1) {
    const cue = cues[i];
    const label = `Câu ${i + 1}`;
    const text = cleanCueText(cue.text);
    if (!text) return { index: i, message: `${label}: chưa có chữ.` };
    if (text.length > CAPTION_LIMITS.maxTextLength) return { index: i, message: `${label}: dài quá ${CAPTION_LIMITS.maxTextLength} ký tự, hãy tách thành hai câu.` };
    if (cue.startMs < 0) return { index: i, message: `${label}: giờ bắt đầu không được âm.` };
    if (cue.endMs <= cue.startMs) return { index: i, message: `${label}: giờ kết thúc phải sau giờ bắt đầu.` };
    if (cue.endMs - cue.startMs > CAPTION_LIMITS.maxCueDurationMs) return { index: i, message: `${label}: hiện lâu quá ${CAPTION_LIMITS.maxCueDurationMs / 1000} giây, hãy tách thành nhiều câu.` };
    if (cue.endMs > CAPTION_LIMITS.maxTimeMs) return { index: i, message: `${label}: giờ kết thúc vượt quá 6 giờ.` };
    if (i > 0 && cue.startMs < cues[i - 1].endMs) return { index: i, message: `${label}: bắt đầu trước khi câu ${i} kết thúc.` };
  }
  return null;
}

/** Index of the cue on screen at `timeMs` (cues in time order), or -1 between cues. */
export function activeCueIndex(cues: CaptionCue[], timeMs: number): number {
  let low = 0;
  let high = cues.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (timeMs < cues[mid].startMs) high = mid - 1;
    else if (timeMs >= cues[mid].endMs) low = mid + 1;
    else return mid;
  }
  return -1;
}
