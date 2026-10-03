import { BookOpen, Hammer, PlayCircle } from 'lucide-react';
import type { LessonKind } from '@/services/personal-learning.service';

export const LESSON_KIND: Record<LessonKind, { label: string; icon: typeof PlayCircle }> = {
  VIDEO: { label: 'Video', icon: PlayCircle },
  READING: { label: 'Tình huống', icon: BookOpen },
  PRACTICE: { label: 'Thực hành', icon: Hammer },
};
