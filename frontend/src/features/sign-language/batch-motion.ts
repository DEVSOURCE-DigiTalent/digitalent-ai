import { signDictionaryService, type SignGloss } from '@/services/sign-dictionary.service';
import { bytesToBase64, encodeMotion, motionCoverage, MOTION_LAYOUT_V1 } from './motion-format';
import { percentOf } from '@/lib/progress';
import { formatBytes } from '@/lib/sign-video';

/**
 * Takes the motion of several signs from their dictionary videos, one after the other, in the browser (MediaPipe, like
 * "Lấy chuyển động" of one sign) and saves it. Only videos whose source, licence and consent are recorded are used:
 * the avatar may perform a person's signing only within the rights given for that video.
 */

export const BATCH_MOTION_FPS = 20;
const MAX_SIGN_MS = 20_000;

export interface BatchMotionProgress {
  index: number;
  total: number;
  gloss: string;
  /** Frames analysed of the current sign. */
  frame: number;
  frames: number;
  /**
   * What runs now: the recognition model download (first use only), the sign's video download, or its frames. The
   * model has its own percent (bytes); video and frames share the batch percent (each sign counts the same).
   */
  phase: 'model' | 'video' | 'frames';
  /** Bytes downloaded / total of the model (phase "model") or of the sign's video (phase "video"). */
  loaded: number;
  bytes: number;
  /** 0–100 of the current phase: the model download, or the whole batch. */
  percent: number;
}

/** What a batch shows: one phase at a time, each with its own percent (and so its own time left). */
export interface BatchProgressView {
  phase: 'find' | 'model' | 'run';
  label: string;
  detail: string;
  percent: number;
}

export function batchProgressView(p: BatchMotionProgress): BatchProgressView {
  if (p.phase === 'model') {
    return { phase: 'model', label: 'Tải mô hình nhận dạng (chỉ lần đầu)', detail: `${formatBytes(p.loaded)} / ${formatBytes(p.bytes)}`, percent: p.percent };
  }
  const detail = p.phase === 'video'
    ? `Tải video${p.bytes > 0 ? ` ${percentOf(p.loaded, p.bytes)}%` : '…'}`
    : `Phân tích khung ${p.frame}/${p.frames}`;
  return { phase: 'run', label: `Ký hiệu ${p.index + 1}/${p.total}: “${p.gloss}”`, detail, percent: p.percent };
}

export interface BatchMotionResult {
  saved: SignGloss[];
  failed: { gloss: string; reason: string }[];
}

/** Signs whose motion can be taken: a video with recorded rights, not archived. */
export const canTakeMotion = (gloss: SignGloss) => Boolean(gloss.video) && gloss.usableForVideo && gloss.status !== 'ARCHIVED';

function loadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    // Kept in the page (invisible): some browsers do not decode frames of a detached video.
    video.style.cssText = 'position:fixed;left:-10px;top:-10px;width:2px;height:2px;opacity:0;pointer-events:none';
    video.onloadeddata = () => resolve(video);
    video.onerror = () => { video.remove(); reject(new Error('Không đọc được video của ký hiệu.')); };
    document.body.appendChild(video);
    video.src = url;
  });
}

export async function takeMotions(
  glosses: SignGloss[],
  options: { onProgress?: (progress: BatchMotionProgress) => void; signal?: AbortSignal } = {},
): Promise<BatchMotionResult> {
  const { onProgress, signal } = options;
  const { extractMotion } = await import('./extract-motion');
  const result: BatchMotionResult = { saved: [], failed: [] };
  const usable = glosses.filter(canTakeMotion);
  for (const gloss of glosses.filter((g) => !canTakeMotion(g))) {
    result.failed.push({ gloss: gloss.gloss, reason: gloss.video ? 'Video chưa ghi đủ nguồn, giấy phép hoặc sự đồng ý' : 'Chưa có video' });
  }

  for (let index = 0; index < usable.length; index += 1) {
    if (signal?.aborted) throw new DOMException('Đã dừng.', 'AbortError');
    const gloss = usable[index];
    const batch = (share: number) => Math.min(99, Math.floor(((index + share) / usable.length) * 100));
    onProgress?.({ index, total: usable.length, gloss: gloss.gloss, frame: 0, frames: 1, phase: 'video', loaded: 0, bytes: 0, percent: batch(0) });
    let objectUrl: string | null = null;
    let video: HTMLVideoElement | null = null;
    try {
      const blob = await signDictionaryService.videoBlob(gloss.video!.url, (loaded, bytes) =>
        onProgress?.({ index, total: usable.length, gloss: gloss.gloss, frame: 0, frames: 1, phase: 'video', loaded, bytes, percent: batch(0) }));
      objectUrl = URL.createObjectURL(blob);
      video = await loadVideo(objectUrl);
      const videoMs = Math.round((video.duration || 0) * 1000);
      const startMs = Math.max(0, gloss.motionStartMs ?? 0);
      const endMs = Math.min(videoMs, gloss.motionEndMs ?? Math.min(videoMs, startMs + MAX_SIGN_MS));
      if (endMs - startMs < 200) throw new Error('Video quá ngắn.');
      const frames = await extractMotion(video, {
        fps: BATCH_MOTION_FPS, startMs, endMs, signal,
        onProgress: (frame, total) => onProgress?.({
          index, total: usable.length, gloss: gloss.gloss, frame, frames: total, phase: 'frames', loaded: 0, bytes: 0, percent: batch(frame / total),
        }),
        onLoad: (loaded, bytes) => {
          if (loaded < bytes) onProgress?.({ index, total: usable.length, gloss: gloss.gloss, frame: 0, frames: 1, phase: 'model', loaded, bytes, percent: percentOf(loaded, bytes) });
        },
      });
      const coverage = motionCoverage(frames);
      if (coverage.pose < 0.5 || Math.max(coverage.leftHand, coverage.rightHand) < 0.2) {
        throw new Error('Không nhìn rõ người ra dấu hoặc bàn tay trong video.');
      }
      result.saved.push(await signDictionaryService.saveMotion(gloss.id, {
        layout: MOTION_LAYOUT_V1, fps: BATCH_MOTION_FPS, frames: frames.length, startMs, endMs, data: bytesToBase64(encodeMotion(frames)),
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      result.failed.push({ gloss: gloss.gloss, reason: (error as Error).message || 'Không lấy được chuyển động' });
    } finally {
      video?.remove();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }
  return result;
}
