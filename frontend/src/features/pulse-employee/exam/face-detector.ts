import { headPose, type FaceObservation } from './face-signals';

/**
 * Nhận diện khuôn mặt ngay trên trình duyệt bằng MediaPipe Face Landmarker. Chỉ tải mô hình (WASM + tệp .task) về máy; khung
 * hình camera không rời máy người làm bài để phân tích — chỉ kết quả (số khuôn mặt, hướng đầu) được dùng.
 * Thư viện được nạp động khi bắt đầu bài làm nên không nằm trong gói chính.
 */

export interface FaceDetector {
  /** Nhận diện một khung hình; timestamp (ms) phải tăng dần. */
  detect(video: HTMLVideoElement, timestamp: number): FaceObservation;
  close(): void;
}

const MEDIAPIPE_VERSION = '1.1.1';
const WASM_URL = import.meta.env.VITE_FACE_WASM_URL || `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL = import.meta.env.VITE_FACE_MODEL_URL
  || 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

/** Tối đa số khuôn mặt cần đếm — đủ để biết "có người khác". */
const MAX_FACES = 3;

export async function loadFaceDetector(): Promise<FaceDetector> {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  const create = (delegate: 'GPU' | 'CPU') => FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numFaces: MAX_FACES,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFacialTransformationMatrixes: true,
  });
  const landmarker = await create('GPU').catch(() => create('CPU'));

  return {
    detect(video, timestamp) {
      const result = landmarker.detectForVideo(video, timestamp);
      const faces = result.faceLandmarks.length;
      const pose = faces > 0 && result.facialTransformationMatrixes[0] ? headPose(result.facialTransformationMatrixes[0].data) : null;
      return { faces, yaw: pose?.yaw ?? null, pitch: pose?.pitch ?? null };
    },
    close() {
      landmarker.close();
    },
  };
}
