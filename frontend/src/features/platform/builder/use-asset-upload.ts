import { useState } from 'react';
import { platformCatalogService, type PlatformAsset } from '@/services/platform-catalog.service';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 500 * 1024 * 1024;

export const IMAGE_ACCEPT = IMAGE_TYPES.join(',');
export const VIDEO_ACCEPT = VIDEO_TYPES.join(',');
export const MEDIA_ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES].join(',');

/** Why a file cannot be uploaded (same limits as the server), or null. */
export function fileProblem(file: File, kind: 'IMAGE' | 'VIDEO' | 'ANY'): string | null {
  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type);
  if (kind === 'IMAGE' && !isImage) return 'Chọn ảnh JPG, PNG, WebP hoặc GIF.';
  if (kind === 'VIDEO' && !isVideo) return 'Chọn video MP4, WebM hoặc MOV.';
  if (kind === 'ANY' && !isImage && !isVideo) return 'Chỉ nhận ảnh JPG, PNG, WebP, GIF hoặc video MP4, WebM, MOV.';
  if (isImage && file.size > MAX_IMAGE) return 'Ảnh tối đa 10 MB.';
  if (isVideo && file.size > MAX_VIDEO) return 'Video tối đa 500 MB.';
  return null;
}

export const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Uploads one file at a time and reports its progress (0..100). */
export function useAssetUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const upload = async (file: File): Promise<PlatformAsset> => {
    setFileName(file.name);
    setProgress(0);
    try {
      return await platformCatalogService.uploadAsset(file, setProgress);
    } finally {
      setProgress(null);
      setFileName(null);
    }
  };

  return { upload, progress, fileName, uploading: progress !== null };
}
