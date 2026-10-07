import { afterEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../api-client';
import { taskService } from '../task.service';
import { trainingBatchService } from '../training-batch.service';
import { organizationService } from '../organization.service';
import { assignmentService } from '../assignment.service';
import { analyticsService } from '../analytics.service';
import { learningService } from '../learning.service';

function response<T>(data: T) {
  return { data: { success: true, message: 'OK', errors: [], data } };
}

afterEach(() => { vi.restoreAllMocks(); });

describe('BE2 wire contracts', () => {
  it('serializes task rubrics and evaluation scores as JSON strings', async () => {
    const post = vi.spyOn(apiClient, 'post')
      .mockResolvedValueOnce(response({ id: 'task-1', rubricCriteria: '[{"id":"quality","label":"Chất lượng","maxPoints":100}]' }))
      .mockResolvedValueOnce(response({ id: 'submission-1', evaluation: { rubricScores: '{"quality":80}' } }));

    const task = await taskService.createTask({
      title: 'Báo cáo', description: 'Mô tả', expectedOutput: 'Tệp',
      competencyIds: ['competency-1'], targetLevel: 3,
      assignedEmployeeIds: ['employee-1'], dueDate: '2026-11-01',
      rubricCriteria: [{ id: 'quality', label: 'Chất lượng', maxPoints: 100, description: '' }],
    });
    expect(post.mock.calls[0][0]).toBe('/tasks');
    expect(post.mock.calls[0][1]).toMatchObject({
      dueDate: '2026-11-01T00:00:00Z',
      rubricCriteria: '[{"id":"quality","label":"Chất lượng","maxPoints":100,"description":""}]',
    });
    expect(task.data.data?.rubricCriteria).toHaveLength(1);

    const evaluated = await taskService.evaluateSubmission('submission-1', {
      score: 80, feedback: 'Đạt', decision: 'APPROVED', rubricScores: { quality: 80 },
    });
    expect(post.mock.calls[1][0]).toBe('/submissions/submission-1/evaluate');
    expect(post.mock.calls[1][1]).toMatchObject({ rubricScores: '{"quality":80}', decision: 'APPROVED' });
    expect(evaluated.data.data?.evaluation?.rubricScores).toEqual({ quality: 80 });
  });

  it('creates one-course batches with the BE2 field names', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue(response({ id: 'batch-1', employeesAdded: 1 }));
    await trainingBatchService.createBatch({
      code: 'BATCH-1', name: 'Đợt đào tạo', startDate: '2026-10-10', endDate: '2026-11-10',
      courseIds: ['course-1'], participantEmployeeIds: ['employee-1'], autoAssign: true,
    });
    expect(post.mock.calls[0][0]).toBe('/training-batches');
    expect(post.mock.calls[0][1]).toEqual({
      code: 'BATCH-1', title: 'Đợt đào tạo', description: undefined,
      courseId: 'course-1', departmentId: undefined, jobPositionId: undefined,
      startDate: '2026-10-10T00:00:00Z', endDate: '2026-11-10T00:00:00Z', dueDate: '2026-11-10T00:00:00Z',
      employeeIds: ['employee-1'],
    });
    expect(() => trainingBatchService.createBatch({
      name: 'Sai', startDate: '2026-10-10', endDate: '2026-11-10', courseIds: ['a', 'b'],
    })).toThrow(/một khóa học/);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('uses the new batch summary API and maps list status', async () => {
    const item = {
      id: 'batch-1', code: 'BATCH-1', title: 'Đợt đào tạo', courseId: 'course-1',
      startDate: '2026-10-10T00:00:00Z', endDate: '2026-11-10T00:00:00Z',
      status: 'ACTIVE', totalEmployees: 2, completedCount: 1, createdAt: '2026-10-01T00:00:00Z',
    };
    const get = vi.spyOn(apiClient, 'get')
      .mockResolvedValueOnce(response({ items: [item], totalItems: 1, pageIndex: 1, pageSize: 100, totalPages: 1 }))
      .mockResolvedValueOnce(response({ total: 1, running: 1, scheduled: 0, completed: 0, cancelled: 0, totalParticipants: 2 }));
    const list = await trainingBatchService.getBatches({ status: 'RUNNING' });
    expect(get.mock.calls[0][0]).toBe('/training-batches');
    expect(get.mock.calls[0][1]).toEqual({ params: { status: 'ACTIVE' } });
    expect(list.data.data?.items[0]).toMatchObject({ name: 'Đợt đào tạo', status: 'RUNNING' });

    const summary = await trainingBatchService.getSummary();
    expect(get.mock.calls[1][0]).toBe('/training-batches/summary');
    expect(summary.data.data).toMatchObject({ total: 1, running: 1, totalParticipants: 2 });
  });

  it('activates draft batches through the new BE2 endpoint', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue(response({ success: true }));
    await trainingBatchService.activateBatch('batch-1');
    expect(post.mock.calls[0][0]).toBe('/training-batches/batch-1/activate');
  });

  it('sends organization settings inside the BE2 settings dictionary', async () => {
    const put = vi.spyOn(apiClient, 'put').mockResolvedValue(response({ success: true }));
    await organizationService.updateSettings({
      name: 'Tên chỉ đọc', industry: 'Giáo dục', size: '50',
      timezone: 'Asia/Ho_Chi_Minh', defaultAssignmentDays: 14,
    });
    expect(put.mock.calls[0][0]).toBe('/organization/settings');
    expect(put.mock.calls[0][1]).toEqual({ settings: {
      industry: 'Giáo dục', size: '50', timezone: 'Asia/Ho_Chi_Minh', defaultAssignmentDays: '14',
    } });
  });

  it('loads Manager assignment detail through the new BE2 detail endpoint', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue(response({ id: 'assignment-2', courseTitle: 'An toàn dữ liệu', status: 'ACTIVE' }));
    const assignment = await assignmentService.getById('assignment-2');
    expect(assignment.courseTitle).toBe('An toàn dữ liệu');
    expect(assignment.status).toBe('ACTIVE');
    expect(get.mock.calls.map((call) => call[0])).toEqual(['/course-assignments/assignment-2']);
  });

  it('reads the review action status returned by BE2', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue(response({ status: 'ACCEPTED' }));
    const accepted = await analyticsService.acceptReview({ employeeId: 'employee-1', courseId: 'course-1' });
    expect(post.mock.calls[0][0]).toBe('/intelligence/recommendation-reviews/accept');
    expect(accepted.data.data?.status).toBe('ACCEPTED');
  });

  it('updates internal course metadata using PUT instead of creating another course', async () => {
    const put = vi.spyOn(apiClient, 'put').mockResolvedValue(response({ id: 'course-1', title: 'Quy trình mới' }));
    const post = vi.spyOn(apiClient, 'post');
    await learningService.updateInternalCourse('course-1', {
      title: 'Quy trình mới', description: 'Mô tả', category: 'Nội bộ', durationMinutes: 30, status: 'DRAFT',
    });
    expect(put.mock.calls[0][0]).toBe('/internal-courses/course-1');
    expect(put.mock.calls[0][1]).toMatchObject({ title: 'Quy trình mới', durationMinutes: 30 });
    expect(post).not.toHaveBeenCalled();
  });
});
