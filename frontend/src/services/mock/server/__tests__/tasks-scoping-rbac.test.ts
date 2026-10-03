import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../../../api-client';
import { resetMockDb } from '../../mock-store';
import { resetOrgStore, getOrgData } from '../org-store';
import { mockAdapter } from '../mock-adapter';
import type { PracticalTaskRecord, TaskSubmissionRecord } from '../types';

beforeAll(() => {
  apiClient.defaults.adapter = mockAdapter;
});

beforeEach(() => {
  localStorage.clear();
  resetMockDb();
  resetOrgStore();
  vi.stubGlobal('location', { pathname: '/login', search: '', href: '' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Who = 'employee' | 'manager' | 'owner' | 'owner2';
const asUser = (who: Who) => {
  const accountId =
    who === 'owner'
      ? 'mock-owner'
      : who === 'owner2'
        ? 'mock-owner2'
        : who === 'manager'
          ? 'mock-manager'
          : 'mock-employee';
  localStorage.setItem('accessToken', `mock-token:${accountId}`);
};

async function call<T = any>(method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: unknown): Promise<T> {
  const response = await apiClient.request({
    method,
    url,
    ...(method === 'get' ? { params: payload } : { data: payload }),
  });
  return response.data.data as T;
}

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    const response = (error as { response: { status: number; data: { message: string; errors: { message: string }[] } } }).response;
    return { status: response.status, message: response.data.message };
  }
  throw new Error('Expected the request to fail');
}

describe('Practical Tasks RBAC & Scoping Matrix', () => {
  describe('EMPLOYEE role restrictions', () => {
    it('returns 403 when employee tries to access management task lists or review queue', async () => {
      asUser('employee');
      // GET /tasks: quản lý
      expect(await failure(call('get', '/tasks'))).toMatchObject({ status: 403 });
      // GET /review-queue: quản lý
      expect(await failure(call('get', '/review-queue'))).toMatchObject({ status: 403 });
      // POST /tasks: tạo nhiệm vụ
      expect(await failure(call('post', '/tasks', { title: 'Test', expectedOutput: 'Out', dueDate: '2026-12-31' }))).toMatchObject({ status: 403 });
      // POST /submissions/:id/evaluate: đánh giá minh chứng
      expect(await failure(call('post', '/submissions/sub-001/evaluate', { score: 90, decision: 'APPROVED' }))).toMatchObject({ status: 403 });
    });

    it('returns 404 when employee views a task not assigned to them, but 200 when assigned', async () => {
      asUser('employee'); // emp-01 (Hoàng Văn Nhân Viên, dep-kt)
      // tsk-001 được giao cho emp-06, emp-07 -> employee không được giao -> 404
      expect(await failure(call('get', '/tasks/tsk-001'))).toMatchObject({ status: 404 });

      // tsk-002 được giao cho emp-01 -> 200 OK
      const task = await call<PracticalTaskRecord>('get', '/tasks/tsk-002');
      expect(task).toBeDefined();
      expect(task.id).toBe('tsk-002');
    });

    it('returns 404 when employee views submission of another employee, but 200 for own submission', async () => {
      asUser('employee'); // emp-01
      // sub-001 thuộc emp-06 -> 404
      expect(await failure(call('get', '/submissions/sub-001'))).toMatchObject({ status: 404 });

      // sub-002 thuộc emp-01 -> 200 OK
      const sub = await call<TaskSubmissionRecord>('get', '/submissions/sub-002');
      expect(sub).toBeDefined();
      expect(sub.id).toBe('sub-002');
      expect(sub.employeeId).toBe('emp-01');
    });

    it('returns 403 when employee attempts to submit for an unassigned task', async () => {
      asUser('employee'); // emp-01
      // tsk-001 giao cho emp-06, emp-07
      expect(
        await failure(
          call('post', '/tasks/tsk-001/submit', {
            content: 'Nội dung nộp không hợp lệ',
          })
        )
      ).toMatchObject({ status: 403 });
    });

    it('allows employee to submit for their assigned task and view in /me/tasks and /me/evidence', async () => {
      asUser('employee'); // emp-01
      const myTasks = await call<{ items: any[]; total: number }>('get', '/me/tasks');
      expect(myTasks.items.some((t) => t.id === 'tsk-002')).toBe(true);

      const submitted = await call<TaskSubmissionRecord>('post', '/tasks/tsk-002/submit', {
        content: 'Bản nộp cập nhật cho tsk-002',
        linkUrls: ['https://drive.google.com/test-link'],
      });
      expect(submitted.status).toBe('PENDING_REVIEW');
      expect(submitted.employeeId).toBe('emp-01');

      const myEvidence = await call<{ items: any[]; total: number }>('get', '/me/evidence');
      expect(myEvidence.items.some((e) => e.taskId === 'tsk-002')).toBe(true);
    });
  });

  describe('MANAGER role scoping and evaluation rules', () => {
    it('filters tasks to only those in manager department scope', async () => {
      asUser('manager'); // emp-02 (Phạm Thị Quản Lý, quản lý phòng dep-kd)
      const tasksRes = await call<{ items: PracticalTaskRecord[] }>('get', '/tasks');
      // tsk-001 thuộc dep-kd -> thấy
      expect(tasksRes.items.some((t) => t.id === 'tsk-001')).toBe(true);
      // tsk-002 thuộc dep-kt -> KHÔNG thấy
      expect(tasksRes.items.some((t) => t.id === 'tsk-002')).toBe(false);
    });

    it('filters review queue to submissions of employees in manager scope', async () => {
      asUser('manager'); // emp-02 (quản lý dep-kd gồm emp-06, emp-07)
      const queueRes = await call<{ items: any[] }>('get', '/review-queue');
      // sub-001 của emp-06 (dep-kd) đang PENDING_REVIEW -> thấy
      expect(queueRes.items.some((s) => s.id === 'sub-001')).toBe(true);
      // không có bài nào ngoài phòng dep-kd
      for (const item of queueRes.items) {
        expect(['emp-02', 'emp-06', 'emp-07', 'emp-12']).toContain(item.employeeId);
      }
    });

    it('returns 404 when manager accesses task or submission outside their scope', async () => {
      asUser('manager'); // dep-kd
      // tsk-002 thuộc dep-kt
      expect(await failure(call('get', '/tasks/tsk-002'))).toMatchObject({ status: 404 });
      // sub-002 thuộc emp-01 (dep-kt)
      expect(await failure(call('get', '/submissions/sub-002'))).toMatchObject({ status: 404 });
    });

    it('returns 403 when manager tries to assign task to employees outside their scope', async () => {
      asUser('manager'); // dep-kd
      expect(
        await failure(
          call('post', '/tasks', {
            title: 'Nhiệm vụ ngoài phạm vi',
            expectedOutput: 'Báo cáo',
            dueDate: '2026-11-30',
            assignedEmployeeIds: ['emp-01'], // emp-01 thuộc dep-kt
          })
        )
      ).toMatchObject({ status: 403 });
    });

    it('allows manager to assign task to employees inside their scope with correct creator info', async () => {
      asUser('manager'); // emp-02 (Phạm Thị Quản Lý)
      const created = await call<PracticalTaskRecord>('post', '/tasks', {
        title: 'Thực hành bảo mật dữ liệu khách hàng mới',
        expectedOutput: 'Tài liệu hướng dẫn',
        dueDate: '2026-12-15',
        departmentId: 'dep-kd',
        assignedEmployeeIds: ['emp-06'],
      });
      expect(created.id).toBeDefined();
      expect(created.assignedByEmployeeId).toBe('emp-02');
      expect(created.assignedByName).toBe('Phạm Thị Quản Lý');
    });

    it('returns 403 when manager evaluates a submission outside their scope', async () => {
      asUser('manager'); // dep-kd
      // sub-002 thuộc emp-01 (dep-kt)
      expect(
        await failure(
          call('post', '/submissions/sub-002/evaluate', {
            score: 85,
            decision: 'APPROVED',
          })
        )
      ).toMatchObject({ status: 403 });
    });

    it('prevents self-evaluation (cannot evaluate own submission)', async () => {
      // Giả sử có 1 bài nộp của emp-02 (manager)
      const org = getOrgData('org-acme');
      org.submissions = org.submissions ?? [];
      org.submissions.push({
        id: 'sub-mgr-self',
        taskId: 'tsk-001',
        employeeId: 'emp-02',
        employeeName: 'Phạm Thị Quản Lý',
        submittedAt: new Date().toISOString(),
        content: 'Bài nộp tự làm',
        status: 'PENDING_REVIEW',
      });

      asUser('manager'); // emp-02
      expect(
        await failure(
          call('post', '/submissions/sub-mgr-self/evaluate', {
            score: 100,
            decision: 'APPROVED',
          })
        )
      ).toMatchObject({ status: 403 });
    });

    it('returns 409 conflict when evaluating a submission that is not PENDING_REVIEW', async () => {
      asUser('manager'); // dep-kd
      // sub-005 thuộc emp-07 (dep-kd) nhưng đã có trạng thái APPROVED
      expect(
        await failure(
          call('post', '/submissions/sub-005/evaluate', {
            score: 90,
            decision: 'APPROVED',
          })
        )
      ).toMatchObject({ status: 409 });
    });

    it('successfully evaluates pending submission in scope and records evaluator name', async () => {
      asUser('manager'); // emp-02
      const evaluated = await call<TaskSubmissionRecord>('post', '/submissions/sub-001/evaluate', {
        score: 92,
        feedback: 'Bài làm rất tốt, phân quyền CRM chặt chẽ.',
        decision: 'APPROVED',
        rubricScores: { 'rc-1': 28, 'rc-2': 38, 'rc-3': 26 },
      });
      expect(evaluated.status).toBe('APPROVED');
      expect(evaluated.evaluation?.evaluatedBy).toBe('Phạm Thị Quản Lý');
      expect(evaluated.evaluation?.score).toBe(92);
    });
  });

  describe('OWNER role & End-to-end task flow', () => {
    it('allows owner to see tasks and submissions across all departments', async () => {
      asUser('owner'); // Acme owner
      const tasksRes = await call<{ items: PracticalTaskRecord[] }>('get', '/tasks');
      expect(tasksRes.items.some((t) => t.id === 'tsk-001')).toBe(true);
      expect(tasksRes.items.some((t) => t.id === 'tsk-002')).toBe(true);

      const queueRes = await call<{ items: any[] }>('get', '/review-queue');
      expect(queueRes.items.some((s) => s.id === 'sub-001')).toBe(true);
    });

    it('end-to-end flow: Owner creates task -> employee submits -> owner evaluates -> profile & skill gap updated', async () => {
      // 1. Owner tạo task yêu cầu cmp-4-2 targetLevel 2
      asUser('owner');
      const newTask = await call<PracticalTaskRecord>('post', '/tasks', {
        title: 'Nhiệm vụ kiểm thử kỹ năng an toàn dữ liệu',
        description: 'Đánh giá năng lực bảo vệ dữ liệu cá nhân',
        expectedOutput: 'Bản checklist tuân thủ',
        dueDate: '2026-11-20',
        competencyIds: ['cmp-4-2'],
        targetLevel: 2,
        assignedEmployeeIds: ['emp-01'],
      });
      expect(newTask.id).toBeDefined();

      // 2. Employee nộp bài
      asUser('employee');
      const submission = await call<TaskSubmissionRecord>('post', `/tasks/${newTask.id}/submit`, {
        content: 'Em xin nộp bản checklist bảo vệ dữ liệu cá nhân.',
        linkUrls: ['https://storage.acme.vn/checklist.pdf'],
      });
      expect(submission.status).toBe('PENDING_REVIEW');
      expect(submission.employeeId).toBe('emp-01');

      // 3. Owner duyệt bài nộp
      asUser('owner');
      const evaluated = await call<TaskSubmissionRecord>('post', `/submissions/${submission.id}/evaluate`, {
        score: 95,
        feedback: 'Xuất sắc, đáp ứng chuẩn bảo mật.',
        decision: 'APPROVED',
        rubricScores: { 'rc-1': 48, 'rc-2': 47 },
      });
      expect(evaluated.status).toBe('APPROVED');

      // 4. Kiểm tra profile và skill gap
      const org = getOrgData('org-acme');
      const empProfile = org.profiles['emp-01'];
      expect(empProfile).toBeDefined();
      expect(empProfile['cmp-4-2']).toBeDefined();
      expect(empProfile['cmp-4-2'].level).toBe(2);
      expect(empProfile['cmp-4-2'].source).toBe('TASK');
    });
  });
});
