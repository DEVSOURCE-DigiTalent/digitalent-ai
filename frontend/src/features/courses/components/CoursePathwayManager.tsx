import { useState, useEffect } from 'react';
import {
  Lock, CheckCircle2, Play, Eye, Settings2, RotateCcw,
  Save, AlertCircle, FileText, Plus, Trash2, ExternalLink,
  ChevronRight, Sparkles, Video, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { CURRICULUM_DATA } from '../../learning/data/standard-curriculum';
import { getCourseModules, type CourseModuleContent, type LessonItem } from '../../learning/data/course-content';
import { coursePathwayService } from '@/services/course-pathway.service';
import type { CoursePathwayConfig, LessonCustomization, CustomAttachment } from '../types/pathway';

interface CoursePathwayManagerProps {
  course: {
    id: string;
    code: string;
    title: string;
    level: number;
    estimatedDurationMinutes?: number;
    categoryName?: string;
  };
  batchId?: string;
  batchName?: string;
}

export function CoursePathwayManager({ course, batchId, batchName }: CoursePathwayManagerProps) {
  // Determine domain number from code, e.g. "A1-F" -> 1
  const domainNumberMatch = course.code.match(/A(\d+)/i);
  const domainNumber = domainNumberMatch ? parseInt(domainNumberMatch[1], 10) : 1;

  // Sibling codes for levels 1, 2, 3
  const levelCodes: Record<number, string> = {
    1: `A${domainNumber}-F`,
    2: `A${domainNumber}-I`,
    3: `A${domainNumber}-A`,
  };

  // State
  const [config, setConfig] = useState<CoursePathwayConfig>(() =>
    coursePathwayService.getPathwayConfig(course.id, course.code, course.level, batchId)
  );

  const [activeLevel, setActiveLevel] = useState<number>(config.selectedLevel || course.level || 1);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'preview' | 'customize'>('preview');

  // Compute modules based on selected level
  const activeCourseCode = levelCodes[activeLevel] || course.code;
  const rawCurriculum = CURRICULUM_DATA[activeCourseCode];
  const activeCourseTitle = rawCurriculum?.title || course.title;

  const modules: CourseModuleContent[] = getCourseModules(
    course.id,
    activeCourseCode,
    activeCourseTitle,
    rawCurriculum?.modules.length || 3
  );

  const allLessons: LessonItem[] = modules.flatMap((m) => m.lessons);

  // Set default selected lesson if none
  useEffect(() => {
    if (allLessons.length > 0 && (!selectedLessonId || !allLessons.some((l) => l.id === selectedLessonId))) {
      setSelectedLessonId(allLessons[0].id);
    }
  }, [activeLevel, allLessons.length]);

  const currentLesson: LessonItem | undefined = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];

  const currentCustomization: LessonCustomization = (currentLesson && config.customizedLessons[currentLesson.id]) || {
    lessonId: currentLesson?.id || '',
    videoSourceType: 'default',
    customVideoUrl: '',
    customVideoTitle: '',
    enterpriseNotes: '',
    attachments: [],
    customPracticeTask: '',
  };

  // Handlers
  const handleLevelChange = (lvl: number) => {
    setActiveLevel(lvl);
    setConfig((prev) => ({
      ...prev,
      selectedLevel: lvl,
    }));
    toast.info(`Đã chuyển đổi sang Mức ${lvl} (${lvl === 1 ? 'Cơ bản' : lvl === 2 ? 'Trung cấp' : 'Nâng cao'}). Khung nội dung được đồng bộ.`);
  };

  const handleUpdateCustomization = (updates: Partial<LessonCustomization>) => {
    if (!currentLesson) return;
    setConfig((prev) => ({
      ...prev,
      customizedLessons: {
        ...prev.customizedLessons,
        [currentLesson.id]: {
          ...currentCustomization,
          ...updates,
          lessonId: currentLesson.id,
        },
      },
    }));
  };

  const handleSave = () => {
    const updated = coursePathwayService.savePathwayConfig(
      {
        ...config,
        selectedLevel: activeLevel,
      },
      batchId
    );
    setConfig(updated);
    toast.success('Đã lưu cấu hình luồng đào tạo cho Doanh nghiệp thành công!');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục toàn bộ luồng bài học về chuẩn ban đầu của DigiTalent?')) {
      const reset = coursePathwayService.resetPathwayConfig(course.id, course.code, course.level, batchId);
      setConfig(reset);
      setActiveLevel(course.level || 1);
      toast.success('Đã đặt lại cấu hình mặc định ban đầu.');
    }
  };

  // Add attachment
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  const handleAddAttachment = () => {
    if (!newDocTitle.trim() || !newDocUrl.trim()) {
      toast.error('Vui lòng nhập tên tài liệu và liên kết.');
      return;
    }
    const newDoc: CustomAttachment = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      url: newDocUrl.trim(),
      type: 'link',
    };
    const currentList = currentCustomization.attachments || [];
    handleUpdateCustomization({
      attachments: [...currentList, newDoc],
    });
    setNewDocTitle('');
    setNewDocUrl('');
    toast.success('Đã thêm tài liệu nội bộ!');
  };

  const handleRemoveAttachment = (docId: string) => {
    const currentList = currentCustomization.attachments || [];
    handleUpdateCustomization({
      attachments: currentList.filter((d) => d.id !== docId),
    });
  };

  // Video embed preview URL
  const embedPreviewUrl = coursePathwayService.getEmbedUrl(currentCustomization.customVideoUrl);
  const isCustomVideo = currentCustomization.videoSourceType === 'custom' && Boolean(currentCustomization.customVideoUrl);

  const customLessonsCount = Object.values(config.customizedLessons).filter(
    (c) => c.videoSourceType === 'custom' || c.enterpriseNotes || (c.attachments && c.attachments.length > 0)
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded">
                Mã chuẩn: {activeCourseCode}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="size-3.5" /> Chuẩn Thông tư 02/2025/TT-BGDĐT
              </span>
              {batchName && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Áp dụng riêng cho đợt: {batchName}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Luồng triển khai đào tạo: {activeCourseTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Chủ doanh nghiệp xem trước toàn bộ trải nghiệm học tập của nhân sự và tùy biến video, tài liệu nội bộ, cấp độ chuẩn hóa.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RotateCcw className="size-3.5" />
              Khôi phục mặc định
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Save className="size-3.5" />
              Lưu cấu hình luồng đào tạo
            </button>
          </div>
        </div>

        {/* Level Switcher & Stats Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Cấp độ chuẩn hóa áp dụng:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {[
                { lvl: 1, label: 'Mức 1: Cơ bản (Bậc 1-2)', code: levelCodes[1] },
                { lvl: 2, label: 'Mức 2: Trung cấp (Bậc 3-4)', code: levelCodes[2] },
                { lvl: 3, label: 'Mức 3: Nâng cao (Bậc 5-6)', code: levelCodes[3] },
              ].map(({ lvl, label, code }) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelChange(lvl)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeLevel === lvl
                      ? 'bg-white text-primary-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                  <span className="ml-1 opacity-70 font-mono text-[10px]">({code})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Tổng số: <strong className="text-slate-800">{modules.length}</strong> module ·{' '}
              <strong className="text-slate-800">{allLessons.length}</strong> bài học
            </span>
            <span className="w-px h-3.5 bg-slate-200" />
            <span>
              Đã tùy biến:{' '}
              <strong className={customLessonsCount > 0 ? 'text-primary-700 font-bold' : 'text-slate-800'}>
                {customLessonsCount}
              </strong>{' '}
              bài
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pathway Navigation Tree (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Lộ trình bài học của nhân viên</span>
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {allLessons.length} bài
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {modules.map((m, mIdx) => (
              <div key={m.id || mIdx} className="p-2 space-y-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100/70 rounded flex items-center justify-between">
                  <span className="line-clamp-1">{m.title}</span>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-1">{m.lessons.length} bài</span>
                </div>

                <div className="space-y-1 pl-1 pt-0.5">
                  {m.lessons.map((lesson) => {
                    const isSelected = lesson.id === currentLesson?.id;
                    const cust = config.customizedLessons[lesson.id];
                    const hasCustomVideo = cust?.videoSourceType === 'custom' && cust?.customVideoUrl;
                    const hasCustomNotes = Boolean(cust?.enterpriseNotes || (cust?.attachments && cust.attachments.length > 0));

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                          isSelected
                            ? 'bg-primary-50 text-primary-900 font-medium ring-1 ring-primary-300'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5">
                          {hasCustomVideo ? (
                            <Video className="size-3.5 text-indigo-600" />
                          ) : (
                            <Play className="size-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`line-clamp-1 ${isSelected ? 'font-semibold text-primary-900' : 'text-slate-800'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <span>{lesson.durationMinutes} phút</span>
                            {hasCustomVideo && (
                              <span className="text-indigo-600 font-medium bg-indigo-50 px-1 rounded">
                                Video DN
                              </span>
                            )}
                            {hasCustomNotes && (
                              <span className="text-amber-700 font-medium bg-amber-50 px-1 rounded">
                                Tài liệu cty
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={`size-3.5 shrink-0 mt-1 transition-transform ${isSelected ? 'text-primary-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Capstone Final Task Box */}
            {rawCurriculum?.finalTask && (
              <div className="p-3 bg-amber-50/50 border-t border-amber-100 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <Sparkles className="size-3.5 text-amber-600" />
                  <span>Nhiệm vụ thực hành tổng kết (Capstone)</span>
                </div>
                <p className="text-slate-600 line-clamp-2 text-[11px]">
                  {rawCurriculum.finalTask.title}: {rawCurriculum.finalTask.brief}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Preview & Customization (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub-Tabs: Preview as Employee vs Customize for Enterprise */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="size-3.5" />
                Xem trước như Học viên
              </button>
              <button
                type="button"
                onClick={() => setViewMode('customize')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'customize'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings2 className="size-3.5" />
                Tùy biến nội dung Doanh nghiệp
              </button>
            </div>

            <div className="text-xs text-slate-500 pr-2">
              Đang xem: <strong className="text-slate-800">{currentLesson?.title}</strong>
            </div>
          </div>

          {/* VIEW MODE 1: PREVIEW AS EMPLOYEE */}
          {viewMode === 'preview' && currentLesson && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Top Banner Notice */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <Eye className="size-4 text-primary-600" />
                  <span>Giao diện mô phỏng chính xác nội dung nhân viên nhìn thấy khi vào học.</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Thời lượng: {currentLesson.durationMinutes} phút
                </span>
              </div>

              {/* Lesson Title */}
              <div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                  {currentLesson.moduleTitle}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {currentLesson.title}
                </h3>
              </div>

              {/* Video Player Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Play className="size-3.5 text-primary-600" />
                    Video bài giảng:
                  </span>
                  {isCustomVideo ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Sparkles className="size-3" /> Video chuyên biệt của Doanh nghiệp
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">
                      Video chuẩn nền tảng DigiTalent
                    </span>
                  )}
                </div>

                {isCustomVideo && embedPreviewUrl ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
                    <iframe
                      src={embedPreviewUrl}
                      title="Custom Enterprise Video"
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-800 to-primary-950 border border-slate-800 flex items-center justify-center shadow-md group">
                    <div className="relative text-center p-6 space-y-2">
                      <div className="size-14 rounded-full bg-primary-600/90 text-white flex items-center justify-center mx-auto shadow-lg shadow-primary-500/30 group-hover:scale-105 transition cursor-pointer">
                        <Play className="size-6 fill-white ml-0.5" />
                      </div>
                      <p className="text-white font-medium text-sm">
                        {currentCustomization.customVideoTitle || `Video bài giảng: ${currentLesson.title}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isCustomVideo ? 'Nguồn video nội bộ doanh nghiệp' : 'Học liệu số chuẩn hóa TT02 · Thời lượng 15-20 phút'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enterprise Directives / Internal Notes if present */}
              {currentCustomization.enterpriseNotes && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                    <Sparkles className="size-3.5 text-amber-600" />
                    <span>Chỉ đạo & Lưu ý nội bộ từ Doanh nghiệp</span>
                  </div>
                  <p className="text-xs text-amber-950 whitespace-pre-line leading-relaxed">
                    {currentCustomization.enterpriseNotes}
                  </p>
                </div>
              )}

              {/* Objective Box */}
              <div className="bg-primary-50/60 border border-primary-100 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-primary-900 uppercase tracking-wider">
                      Mục tiêu chuẩn đầu ra TT02
                    </h4>
                    <p className="text-xs text-primary-800 mt-1 leading-relaxed">
                      {currentLesson.objective}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Content Box with TT02 Verification Stamp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Nội dung lý thuyết & Quy chuẩn nghiệp vụ
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <Lock className="size-3 text-slate-400" /> Chuẩn hóa TT02 (Đã duyệt)
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  {currentLesson.content.map((p, idx) => (
                    <p key={idx} className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Điểm cốt lõi cần ghi nhớ
                </h4>
                <ul className="space-y-1.5">
                  {currentLesson.keyTakeaways.map((k, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Task (Standard + Custom) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Bài tập tình huống & Nhiệm vụ thực tế
                </h4>

                {currentCustomization.customPracticeTask && (
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-3 text-xs">
                    <span className="font-bold text-indigo-900 block mb-1">
                      Nhiệm vụ nội bộ giao bởi Doanh nghiệp:
                    </span>
                    <p className="text-indigo-950">{currentCustomization.customPracticeTask}</p>
                  </div>
                )}

                {currentLesson.practiceTask && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Đề bài tình huống chuẩn hóa TT02:
                    </span>
                    <p>{currentLesson.practiceTask}</p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {currentCustomization.attachments && currentCustomization.attachments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Tài liệu nội bộ đính kèm ({currentCustomization.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentCustomization.attachments.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-800 transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="size-4 text-primary-600 shrink-0" />
                          <span className="truncate font-medium">{doc.title}</span>
                        </span>
                        <ExternalLink className="size-3 text-slate-400 shrink-0 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: CUSTOMIZE FOR ENTERPRISE */}
          {viewMode === 'customize' && currentLesson && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold text-primary-600">
                  Cấu hình triển khai bài học
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {currentLesson.title}
                </h3>
              </div>

              {/* SECTION 1: VIDEO SOURCE CUSTOMIZATION */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="size-4 text-primary-600" />
                      <span>Nguồn Video bài giảng</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Doanh nghiệp có thể giữ video chuẩn nền tảng hoặc thay bằng video bài giảng riêng của cty.
                    </p>
                  </div>

                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                    <button
                      type="button"
                      onClick={() => handleUpdateCustomization({ videoSourceType: 'default' })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        currentCustomization.videoSourceType !== 'custom'
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Video chuẩn nền tảng
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCustomization({ videoSourceType: 'custom' })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        currentCustomization.videoSourceType === 'custom'
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Video riêng của Doanh nghiệp
                    </button>
                  </div>
                </div>

                {currentCustomization.videoSourceType === 'custom' && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Đường dẫn video (YouTube, Vimeo, Loom, link MP4...)
                        </label>
                        <input
                          type="url"
                          value={currentCustomization.customVideoUrl || ''}
                          onChange={(e) => handleUpdateCustomization({ customVideoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... hoặc Loom/Vimeo link"
                          className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Thời lượng ước tính (phút)
                        </label>
                        <input
                          type="number"
                          value={currentCustomization.customVideoDuration || currentLesson.durationMinutes}
                          onChange={(e) =>
                            handleUpdateCustomization({ customVideoDuration: parseInt(e.target.value, 10) || 15 })
                          }
                          className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Tiêu đề video hiển thị (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={currentCustomization.customVideoTitle || ''}
                        onChange={(e) => handleUpdateCustomization({ customVideoTitle: e.target.value })}
                        placeholder="VD: Hướng dẫn nghiệp vụ nội bộ bởi Trưởng phòng Kỹ thuật"
                        className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    {embedPreviewUrl && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-medium text-slate-600">Xem trước video nhúng:</span>
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-800">
                          <iframe
                            src={embedPreviewUrl}
                            title="Video Preview"
                            className="absolute inset-0 w-full h-full border-0"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: ADMIN SEALED CORE THEORY (LOCKED / READ ONLY) */}
              <div className="space-y-2 p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Khung lý thuyết & Định nghĩa chuẩn TT02 (Đã duyệt)
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    <ShieldCheck className="size-3 text-emerald-600" /> Niêm phong chuẩn quốc gia
                  </span>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2">
                  <div className="text-xs text-slate-500 flex items-start gap-2">
                    <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      Nội dung học thuật và chuẩn đầu ra Thông tư 02 được bảo chứng bởi Hội đồng Chuyên gia DigiTalent.
                      Chủ doanh nghiệp <strong>không được chỉnh sửa</strong> phần này nhằm bảo đảm tính pháp lý và giá trị của chứng chỉ cấp cho nhân viên.
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 text-xs text-slate-700 space-y-1 font-mono text-[11px] max-h-36 overflow-y-auto">
                    {currentLesson.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3: ENTERPRISE DIRECTIVES & INTERNAL GUIDELINES */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Chỉ đạo & Lưu ý nội bộ từ Doanh nghiệp</span>
                  <span className="text-[11px] text-slate-400 font-normal lowercase">(nhân viên sẽ thấy khi học bài này)</span>
                </label>
                <textarea
                  rows={3}
                  value={currentCustomization.enterpriseNotes || ''}
                  onChange={(e) => handleUpdateCustomization({ enterpriseNotes: e.target.value })}
                  placeholder="VD: Yêu cầu nhân viên tuân thủ đúng quy trình bảo mật tại mục 3.2 sổ tay nhân sự công ty..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* SECTION 4: INTERNAL PRACTICE TASK */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Nhiệm vụ thực tế nội bộ</span>
                  <span className="text-[11px] text-slate-400 font-normal lowercase">(thực hành trên hệ thống riêng của cty)</span>
                </label>
                <textarea
                  rows={2}
                  value={currentCustomization.customPracticeTask || ''}
                  onChange={(e) => handleUpdateCustomization({ customPracticeTask: e.target.value })}
                  placeholder="VD: Hãy đăng nhập vào cổng nội bộ ERP và xuất báo cáo doanh số theo phân quyền phòng ban của bạn..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* SECTION 5: INTERNAL ATTACHMENTS & SOPS */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Tài liệu & Quy chế nội bộ đính kèm
                </label>

                {currentCustomization.attachments && currentCustomization.attachments.length > 0 && (
                  <div className="space-y-2">
                    {currentCustomization.attachments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="size-4 text-primary-600" />
                          <span className="font-medium text-slate-800">{doc.title}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({doc.url})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(doc.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Tên tài liệu (VD: Quy chế an toàn thông tin 2026.pdf)"
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="url"
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    placeholder="URL tài liệu (Google Drive, SharePoint, PDF...)"
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors shrink-0"
                  >
                    <Plus className="size-3.5" /> Thêm tài liệu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
