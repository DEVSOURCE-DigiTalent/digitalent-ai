import type { CoursePathwayConfig } from '../features/courses/types/pathway';

const STORAGE_PREFIX = 'digitalent_pathway_config_';

function getStorageKey(courseId: string, batchId?: string): string {
  return `${STORAGE_PREFIX}${courseId}${batchId ? `_batch_${batchId}` : ''}`;
}

export const coursePathwayService = {
  getPathwayConfig(courseId: string, courseCode: string, currentLevel: number = 1, batchId?: string): CoursePathwayConfig {
    const key = getStorageKey(courseId, batchId);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse pathway config from localStorage', e);
    }

    // Default configuration
    return {
      courseId,
      courseCode,
      selectedLevel: currentLevel,
      customizedLessons: {},
      updatedAt: new Date().toISOString(),
    };
  },

  savePathwayConfig(config: CoursePathwayConfig, batchId?: string): CoursePathwayConfig {
    const updated: CoursePathwayConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    const key = getStorageKey(config.courseId, batchId);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      // Dispatch a custom event so other components (e.g., LessonViewerPage) can react immediately
      window.dispatchEvent(new CustomEvent('digitalent:pathway-updated', { detail: { courseId: config.courseId, batchId } }));
    } catch (e) {
      console.warn('Failed to save pathway config to localStorage', e);
    }
    return updated;
  },

  resetPathwayConfig(courseId: string, courseCode: string, defaultLevel: number = 1, batchId?: string): CoursePathwayConfig {
    const key = getStorageKey(courseId, batchId);
    localStorage.removeItem(key);
    const initial: CoursePathwayConfig = {
      courseId,
      courseCode,
      selectedLevel: defaultLevel,
      customizedLessons: {},
      updatedAt: new Date().toISOString(),
    };
    window.dispatchEvent(new CustomEvent('digitalent:pathway-updated', { detail: { courseId, batchId } }));
    return initial;
  },

  /**
   * Helper to format video URLs into embeddable URLs for previews.
   */
  getEmbedUrl(url?: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // YouTube
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }

    // Loom
    const loomMatch = trimmed.match(/loom\.com\/share\/([\w-]+)/);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }

    return trimmed;
  }
};
