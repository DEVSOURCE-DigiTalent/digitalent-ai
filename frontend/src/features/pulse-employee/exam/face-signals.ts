/**
 * Biến kết quả nhận diện khuôn mặt từng khung hình thành các khoảng đáng ngờ (canonical v3.4, proctoring_events):
 *   - FACE_MISSING: không thấy khuôn mặt liên tục ≥ 3 giây;
 *   - MULTIPLE_FACES: từ hai khuôn mặt trở lên liên tục ≥ 1,5 giây;
 *   - LOOKING_AWAY: một khuôn mặt nhưng quay ngang / cúi / ngẩng quá ngưỡng liên tục ≥ 4 giây.
 * Một khung hình lẻ không đổi trạng thái (khoảng dung sai GRACE_MS), nên chớp mắt hay nhận diện hụt một lần không thành sự kiện.
 * Thuần TypeScript, không phụ thuộc trình duyệt — mô hình nằm ở face-detector.ts.
 */

export type FaceSignalKind = 'FACE_MISSING' | 'MULTIPLE_FACES' | 'LOOKING_AWAY';

/** Kết quả nhận diện của một khung hình camera. */
export interface FaceObservation {
  faces: number;
  /** Góc quay ngang của khuôn mặt chính (độ, trị tuyệt đối). */
  yaw?: number | null;
  /** Góc cúi / ngẩng của khuôn mặt chính (độ, trị tuyệt đối). */
  pitch?: number | null;
}

/** Một khoảng đáng ngờ đã khép: start theo đồng hồ của người gọi (ms). */
export interface FaceEpisode {
  kind: FaceSignalKind;
  start: number;
  durationMs: number;
  detail: string | null;
}

export const FACE_RULES = {
  /** Thời gian liên tục tối thiểu để thành sự kiện. */
  minMs: { FACE_MISSING: 3000, MULTIPLE_FACES: 1500, LOOKING_AWAY: 4000 } satisfies Record<FaceSignalKind, number>,
  /** Điều kiện tắt ngắn hơn khoảng này không khép khoảng đang theo dõi. */
  graceMs: 1000,
  yawDeg: 35,
  pitchDeg: 35,
  /** Số sự kiện tối đa một phiên (máy chủ giới hạn 2000 sự kiện mỗi phiên). */
  maxEpisodes: 300,
} as const;

const KINDS: FaceSignalKind[] = ['FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY'];

interface Open {
  start: number;
  lastTrue: number;
  maxFaces: number;
  sideways: number;
  vertical: number;
}

/**
 * Góc quay ngang (yaw) và cúi / ngẩng (pitch) từ ma trận biến đổi khuôn mặt 4×4 của MediaPipe (độ, trị tuyệt đối — không cần
 * biết ma trận lưu theo hàng hay theo cột).
 */
export function headPose(data: ArrayLike<number>): { yaw: number; pitch: number } | null {
  if (data.length < 16) return null;
  const deg = 180 / Math.PI;
  const yaw = Math.abs(Math.atan2(Math.abs(data[8]!) > Math.abs(data[2]!) ? data[8]! : data[2]!, data[10]!) * deg);
  const pitch = Math.abs(Math.atan2(Math.abs(data[9]!) > Math.abs(data[6]!) ? data[9]! : data[6]!, data[5]!) * deg);
  return { yaw: yaw > 90 ? 180 - yaw : yaw, pitch: pitch > 90 ? 180 - pitch : pitch };
}

function holds(kind: FaceSignalKind, o: FaceObservation): boolean {
  if (kind === 'FACE_MISSING') return o.faces === 0;
  if (kind === 'MULTIPLE_FACES') return o.faces >= 2;
  return o.faces === 1 && ((o.yaw ?? 0) > FACE_RULES.yawDeg || (o.pitch ?? 0) > FACE_RULES.pitchDeg);
}

export class FaceSignalTracker {
  private readonly open = new Map<FaceSignalKind, Open>();
  private emitted = 0;

  /** Đưa một khung hình (thời điểm now, ms); trả về các khoảng vừa khép. */
  observe(o: FaceObservation, now: number): FaceEpisode[] {
    const closed: FaceEpisode[] = [];
    for (const kind of KINDS) {
      const current = this.open.get(kind);
      if (holds(kind, o)) {
        const next = current ?? { start: now, lastTrue: now, maxFaces: 0, sideways: 0, vertical: 0 };
        next.lastTrue = now;
        next.maxFaces = Math.max(next.maxFaces, o.faces);
        if ((o.yaw ?? 0) > FACE_RULES.yawDeg) next.sideways++;
        else if ((o.pitch ?? 0) > FACE_RULES.pitchDeg) next.vertical++;
        this.open.set(kind, next);
      } else if (current && now - current.lastTrue >= FACE_RULES.graceMs) {
        this.close(kind, closed);
      }
    }
    return closed;
  }

  /** Không có khung hình (camera mất, phiên tạm khóa…): khép mọi khoảng tại lần cuối điều kiện còn đúng. */
  pause(): FaceEpisode[] {
    const closed: FaceEpisode[] = [];
    KINDS.forEach((kind) => this.close(kind, closed));
    return closed;
  }

  /** Khoảng đang diễn ra đã đủ lâu để coi là bất thường (để nhắc người làm bài). */
  active(now: number): FaceSignalKind | null {
    return KINDS.find((kind) => {
      const current = this.open.get(kind);
      return current != null && now - current.lastTrue < FACE_RULES.graceMs && current.lastTrue - current.start >= FACE_RULES.minMs[kind];
    }) ?? null;
  }

  private close(kind: FaceSignalKind, into: FaceEpisode[]) {
    const current = this.open.get(kind);
    this.open.delete(kind);
    if (!current) return;
    const durationMs = current.lastTrue - current.start;
    if (durationMs < FACE_RULES.minMs[kind] || this.emitted >= FACE_RULES.maxEpisodes) return;
    this.emitted++;
    into.push({ kind, start: current.start, durationMs, detail: detailOf(kind, current) });
  }
}

function detailOf(kind: FaceSignalKind, open: Open): string | null {
  if (kind === 'MULTIPLE_FACES') return `${open.maxFaces} khuôn mặt`;
  if (kind === 'LOOKING_AWAY') return open.sideways >= open.vertical ? 'Quay đầu sang ngang' : 'Cúi hoặc ngẩng đầu';
  return null;
}
