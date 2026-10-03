export interface CustomAttachment {
  id: string;
  title: string;
  url: string;
  type?: 'pdf' | 'doc' | 'link';
}

export interface LessonCustomization {
  lessonId: string;
  videoSourceType: 'default' | 'custom';
  customVideoUrl?: string;
  customVideoTitle?: string;
  customVideoDuration?: number;
  enterpriseNotes?: string;
  attachments?: CustomAttachment[];
  customPracticeTask?: string;
}

export interface CoursePathwayConfig {
  courseId: string;
  courseCode: string;
  selectedLevel: number; // 1: Foundation (Cơ bản), 2: Intermediate (Trung cấp), 3: Advanced (Nâng cao)
  customizedLessons: Record<string, LessonCustomization>;
  updatedAt: string;
}
