import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import * as meHooks from '@/hooks/use-me';
import type { MyCourseCard, MyCourseDetail, MyLesson } from '@/services/me.service';
import { MyLearningPage } from '@/features/employee/pages/MyLearningPage';
import { EmployeeCourseDetailPage } from '../pages/EmployeeCourseDetailPage';
import { EmployeeLessonViewerPage } from '../pages/EmployeeLessonViewerPage';
import { assessmentCard, mutation, query, renderPage, signInAsEmployee } from '@/features/employee/__tests__/em-test-utils';

/** EM-06 Khóa học của tôi, EM-07 Chi tiết khóa học, EM-08 Nội dung bài học. */

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(toast.info).mockClear();
  signInAsEmployee();
});

const card = (overrides: Partial<MyCourseCard>): MyCourseCard => ({
  enrollmentId: 'e-1', courseId: 'crs-1', courseCode: 'A4-I', courseTitle: 'An toàn thông tin trong công việc', level: 2,
  status: 'IN_PROGRESS', progressPercent: 25, totalLessons: 4, completedLessons: 1, isOverdue: false, source: 'ASSIGNED', ...overrides,
});

describe('EM-06 Khóa học của tôi', () => {
  const courses = {
    items: [
      card({}),
      card({ enrollmentId: 'e-2', courseId: 'crs-2', courseCode: 'A1-I', courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin', status: 'NOT_STARTED', progressPercent: 0, completedLessons: 0 }),
      card({ enrollmentId: 'e-3', courseId: 'crs-3', courseCode: 'A2-F', courseTitle: 'Giao tiếp số cơ bản nơi công sở', status: 'COMPLETED', progressPercent: 100, source: 'SELF_ENROLLED' }),
    ],
    summary: { total: 3, notStarted: 1, inProgress: 1, readyForAssessment: 0, completed: 1, overdue: 0 },
  };

  it('filters courses by status tab and by search text', () => {
    vi.spyOn(meHooks, 'useMyCourses').mockReturnValue(query(courses));

    renderPage(<MyLearningPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Chưa bắt đầu (1)' }));

    expect(screen.getByText('Chiến lược tìm kiếm và quản lý thông tin')).toBeInTheDocument();
    expect(screen.queryByText('An toàn thông tin trong công việc')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tất cả (3)' }));
    fireEvent.change(screen.getByLabelText('Tìm khóa học'), { target: { value: 'A2-F' } });
    expect(screen.getByText('Giao tiếp số cơ bản nơi công sở')).toBeInTheDocument();
    expect(screen.queryByText('Chiến lược tìm kiếm và quản lý thông tin')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tìm khóa học'), { target: { value: 'không có khóa này' } });
    expect(screen.getByText('Không có khóa học phù hợp bộ lọc')).toBeInTheDocument();
  });

  it('points a new employee to the learning path', () => {
    vi.spyOn(meHooks, 'useMyCourses').mockReturnValue(query({ items: [], summary: { total: 0, notStarted: 0, inProgress: 0, readyForAssessment: 0, completed: 0, overdue: 0 } }));

    renderPage(<MyLearningPage />);

    expect(screen.getByText('Bạn chưa tham gia khóa học nào')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem lộ trình học tập/ })).toHaveAttribute('href', '/enterprise/me/learning-path');
  });
});

describe('EM-07 Chi tiết khóa học', () => {
  const course: MyCourseDetail = {
    id: 'crs-1', code: 'A4-I', title: 'An toàn thông tin trong công việc', level: 2, certificateEnabled: true,
    competencies: [], outcomes: [], prerequisites: [],
    enrollment: { id: 'e-1', status: 'IN_PROGRESS', progressPercent: 50, isOverdue: false, source: 'ASSIGNED', assignedByName: 'Trần Quản Lý' },
    modules: [{
      id: 'm1', title: 'Học phần 1: Mật khẩu & xác thực', isRequired: true,
      lessons: [
        { id: 'l1', title: 'Bài 1: Mật khẩu mạnh', lessonType: 'TEXT', isRequired: true, completionRule: 'VIEW', selfCompletable: true, progressStatus: 'COMPLETED' },
        { id: 'l2', title: 'Bài 2: Xác thực hai lớp', lessonType: 'TEXT', isRequired: true, completionRule: 'VIEW', selfCompletable: true, progressStatus: 'NOT_STARTED' },
      ],
    }],
    totalLessons: 2, completedLessons: 1, nextLessonId: 'l2',
    assessments: [{ ...assessmentCard, status: 'LOCKED', canStart: false, lockedReason: 'Hoàn thành các bài học bắt buộc của khóa để mở bài đánh giá cuối khóa.' }],
    canEnroll: false,
  };

  it('shows lesson progress, continues at the next lesson and links the final assessment', () => {
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyCourse').mockReturnValue(query(course));

    renderPage(<EmployeeCourseDetailPage />, { path: '/enterprise/me/courses/:id', at: '/enterprise/me/courses/crs-1' });

    expect(screen.getByLabelText('Đã hoàn thành')).toBeInTheDocument();
    expect(screen.getByLabelText('Chưa học')).toBeInTheDocument();
    expect(screen.getByText('Tiến độ (1/2 bài)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tiếp tục bài học/ })).toHaveAttribute('href', '/enterprise/me/courses/crs-1/lessons/l2');
    expect(screen.getByRole('link', { name: /Bài đánh giá cuối khóa A4-I/ })).toHaveAttribute('href', '/enterprise/me/assessments/asm-1');
  });

  it('shows an error when the course cannot be loaded', () => {
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyCourse').mockReturnValue(query(undefined, { isError: true }));

    renderPage(<EmployeeCourseDetailPage />, { path: '/enterprise/me/courses/:id', at: '/enterprise/me/courses/khong-co' });

    expect(screen.getByText('Không thể tải thông tin khóa học.')).toBeInTheDocument();
  });
});

describe('EM-08 Nội dung bài học', () => {
  const lesson = (overrides: Partial<MyLesson>): MyLesson => ({
    courseId: 'crs-1', courseCode: 'A4-I', courseTitle: 'An toàn thông tin trong công việc', moduleId: 'm1', moduleTitle: 'Học phần 1',
    id: 'l2', title: 'Bài 2: Xác thực hai lớp', lessonType: 'TEXT', contentBody: 'Bật xác thực hai lớp cho tài khoản công việc.',
    isRequired: true, completionRule: 'VIEW', selfCompletable: true, materials: [], progressStatus: 'IN_PROGRESS',
    lessonIndex: 2, totalLessons: 2, prevLessonId: 'l1', nextLessonId: null, enrollmentStatus: 'IN_PROGRESS', courseProgressPercent: 50,
    ...overrides,
  });
  const at = '/enterprise/me/courses/crs-1/lessons/l2';
  const path = '/enterprise/me/courses/:id/lessons/:lessonId';

  it('explains that a check lesson is completed by passing the check, without a complete button', () => {
    vi.spyOn(meHooks, 'useStartLesson').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useCompleteMyLesson').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyLesson').mockReturnValue(query(lesson({ completionRule: 'PASS_CHECK', selfCompletable: false, lessonType: 'QUIZ' })));

    renderPage(<EmployeeLessonViewerPage />, { path, at });

    expect(screen.getByText(/Bài học này được tính hoàn thành khi bạn đạt bài kiểm tra/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hoàn thành/ })).not.toBeInTheDocument();
  });

  it('embeds a YouTube video lesson through the privacy-friendly player', () => {
    vi.spyOn(meHooks, 'useStartLesson').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useCompleteMyLesson').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyLesson').mockReturnValue(query(lesson({ lessonType: 'VIDEO', contentBody: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })));

    renderPage(<EmployeeLessonViewerPage />, { path, at });

    expect(screen.getByTitle('Video bài học: Bài 2: Xác thực hai lớp')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('sends the employee to the final assessment after the last counted lesson', async () => {
    const complete = vi.fn().mockResolvedValue({
      lessonId: 'l2', lessonStatus: 'COMPLETED', courseProgressPercent: 100, enrollmentStatus: 'READY_FOR_ASSESSMENT',
      nextLessonId: null, readyForAssessment: true, finalAssessmentId: 'asm-1',
    });
    vi.spyOn(meHooks, 'useStartLesson').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useCompleteMyLesson').mockReturnValue(mutation(complete));
    vi.spyOn(meHooks, 'useMyLesson').mockReturnValue(query(lesson({})));

    renderPage(<EmployeeLessonViewerPage />, { path, at });
    fireEvent.click(screen.getByRole('button', { name: /Hoàn thành bài học/ }));

    await waitFor(() => expect(complete).toHaveBeenCalledWith({ courseId: 'crs-1', lessonId: 'l2' }));
    expect(toast.info).toHaveBeenCalledWith('Bạn đã học xong các bài bắt buộc. Hãy làm bài đánh giá cuối khóa!');
    expect(await screen.findByTestId('navigated')).toBeInTheDocument();
  });
});
