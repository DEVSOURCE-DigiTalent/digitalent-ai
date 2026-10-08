import { PERMISSIONS } from '../../../../hooks/use-permission';
import { ROLES } from '../../../../lib/roles';
import type { SessionUser } from '../../../../types/session';
import { newId } from '../../mock-store';
import { badRequest, conflict, forbidden, notFound, paginate, pageRequest, matchesSearch } from '../http';
import { route } from '../router';
import type { EmployeeRecord, OrgData, PracticalTaskRecord } from '../types';
import { calculateRun, skillGapBlocker } from '../org-logic';
import { recordAudit } from './audit';

/** Practical tasks and evidence evaluation handlers (spec MGR-05..12, EMP-11..14). */

const P = PERMISSIONS;

function findCallerEmployee(data: OrgData, session: SessionUser): EmployeeRecord | undefined {
  return data.employees.find(
    (e) => e.userId === session.id || (e as unknown as { accountId?: string }).accountId === session.id || (e.workEmail && e.workEmail.toLowerCase() === session.email.toLowerCase())
  );
}

function getManagerInScopeEmployeeIds(data: OrgData, callerEmp: EmployeeRecord | undefined): Set<string> {
  if (!callerEmp) return new Set();
  const managedDeptIds = data.departments.filter((d) => d.managerEmployeeId === callerEmp.id).map((d) => d.id);
  const inScope = data.employees.filter(
    (e) => managedDeptIds.includes(e.departmentId) || e.departmentId === callerEmp.departmentId
  );
  return new Set(inScope.map((e) => e.id));
}

// 1. GET /tasks: Quản lý danh sách nhiệm vụ (chỉ OWNER / MANAGER)
route('GET', '/tasks', ({ org, query, session }) => {
  const data = org();
  const isOwner = session.roles.includes(ROLES.OWNER) || session.roles.includes(ROLES.PLATFORM_ADMIN);
  const isManager = session.roles.includes(ROLES.MANAGER);

  if (!isOwner && !isManager) {
    throw forbidden('Nhân viên không có quyền truy cập danh sách nhiệm vụ quản lý.');
  }

  const callerEmp = findCallerEmployee(data, session);
  const inScopeIds = isManager ? getManagerInScopeEmployeeIds(data, callerEmp) : null;
  const search = query.search?.trim().toLowerCase();

  const items = (data.tasks ?? [])
    .filter((t) => {
      if (isManager && inScopeIds) {
        const hasAssignedInScope = t.assignedEmployeeIds.some((id) => inScopeIds.has(id));
        const isCreatedBySelf = t.assignedByEmployeeId === callerEmp?.id;
        const isInManagedDept = t.departmentId && data.departments.some((d) => d.id === t.departmentId && d.managerEmployeeId === callerEmp?.id);
        if (!hasAssignedInScope && !isCreatedBySelf && !isInManagedDept) {
          return false;
        }
      }

      if (query.status && t.status !== query.status) return false;
      if (query.departmentId && t.departmentId !== query.departmentId) return false;
      if (search && !t.title.toLowerCase().includes(search) && !t.description.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    })
    .map((task) => {
      const submissions = (data.submissions ?? []).filter((s) => s.taskId === task.id && (isOwner || !inScopeIds || inScopeIds.has(s.employeeId)));
      const dept = data.departments.find((d) => d.id === task.departmentId);
      const pos = data.positions.find((p) => p.id === task.jobPositionId);

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        expectedOutput: task.expectedOutput,
        competencyIds: task.competencyIds,
        targetLevel: task.targetLevel,
        departmentId: task.departmentId,
        departmentName: dept?.name,
        jobPositionId: task.jobPositionId,
        jobPositionName: pos?.name,
        assignedEmployeeIds: task.assignedEmployeeIds,
        assignedEmployeesCount: task.assignedEmployeeIds.length,
        assignedByEmployeeId: task.assignedByEmployeeId,
        assignedByName: task.assignedByName,
        assignedAt: task.assignedAt,
        dueDate: task.dueDate,
        rubricCriteria: task.rubricCriteria,
        status: task.status,
        submissionsCount: submissions.length,
        pendingReviewCount: submissions.filter((s) => s.status === 'PENDING_REVIEW').length,
        approvedCount: submissions.filter((s) => s.status === 'APPROVED').length,
      };
    });

  return paginate(items, pageRequest(query));
}, { permission: P.TASK_READ, roles: [ROLES.OWNER, ROLES.MANAGER] });

// 2. POST /tasks: Giao bài thực hành mới (chỉ OWNER / MANAGER)
route('POST', '/tasks', ({ update, body, session }) => {
  const b = body as Partial<PracticalTaskRecord>;

  if (!b.title || !b.expectedOutput || !b.dueDate) {
    throw badRequest('Tiêu đề, sản phẩm đầu ra yêu cầu và hạn nộp là bắt buộc.');
  }

  return update((data) => {
    const callerEmp = findCallerEmployee(data, session);
    const isOwner = session.roles.includes(ROLES.OWNER) || session.roles.includes(ROLES.PLATFORM_ADMIN);
    const isManager = session.roles.includes(ROLES.MANAGER);

    const assignedEmployeeIds = b.assignedEmployeeIds ?? [];

    if (isManager && !isOwner) {
      const inScopeIds = getManagerInScopeEmployeeIds(data, callerEmp);
      const outsideEmployees = assignedEmployeeIds.filter((id) => !inScopeIds.has(id));
      if (outsideEmployees.length > 0) {
        throw forbidden('Quản lý chỉ có thể giao bài thực hành cho nhân sự trong phạm vi quản lý.');
      }
    }

    const now = new Date().toISOString();

    const newTask: PracticalTaskRecord = {
      id: newId('tsk'),
      title: b.title!.trim(),
      description: b.description?.trim() ?? '',
      expectedOutput: b.expectedOutput!.trim(),
      competencyIds: b.competencyIds ?? [],
      targetLevel: b.targetLevel ?? 1,
      departmentId: b.departmentId,
      jobPositionId: b.jobPositionId,
      assignedEmployeeIds,
      assignedByEmployeeId: callerEmp?.id ?? session.id,
      assignedByName: callerEmp?.fullName ?? session.fullName ?? session.email,
      assignedAt: now,
      dueDate: b.dueDate!,
      rubricCriteria: b.rubricCriteria ?? [
        { id: 'rc-1', label: 'Chất lượng giải pháp', maxPoints: 50, description: 'Đạt đúng yêu cầu đầu ra' },
        { id: 'rc-2', label: 'Khả năng ứng dụng thực tế', maxPoints: 50, description: 'Rõ ràng, khả thi' },
      ],
      status: 'ACTIVE',
    };

    data.tasks = data.tasks ?? [];
    data.tasks.unshift(newTask);

    recordAudit(data, session, 'PRACTICAL_TASK_CREATED', 'TASK', newTask.id, `Giao bài tập: ${newTask.title}`);
    return newTask;
  });
}, { permission: P.TASK_CREATE, roles: [ROLES.OWNER, ROLES.MANAGER], status: 201 });

// 3. GET /tasks/:id: Xem chi tiết nhiệm vụ (lọc phạm vi theo vai trò)
route('GET', '/tasks/:id', ({ org, params, session }) => {
  const data = org();
  const task = (data.tasks ?? []).find((t) => t.id === params.id);
  if (!task) throw notFound('Không tìm thấy bài thực hành.');

  const isOwner = session.roles.includes(ROLES.OWNER) || session.roles.includes(ROLES.PLATFORM_ADMIN);
  const isManager = session.roles.includes(ROLES.MANAGER);
  const callerEmp = findCallerEmployee(data, session);

  if (!isOwner) {
    if (isManager) {
      const inScopeIds = getManagerInScopeEmployeeIds(data, callerEmp);
      const hasAssignedInScope = task.assignedEmployeeIds.some((id) => inScopeIds.has(id));
      const isCreatedBySelf = task.assignedByEmployeeId === callerEmp?.id;
      const isInManagedDept = task.departmentId && data.departments.some((d) => d.id === task.departmentId && d.managerEmployeeId === callerEmp?.id);
      if (!hasAssignedInScope && !isCreatedBySelf && !isInManagedDept) {
        throw notFound('Không tìm thấy bài thực hành trong phạm vi quản lý.');
      }
    } else {
      // EMPLOYEE: chỉ xem nếu mình là người được giao
      if (!callerEmp || !task.assignedEmployeeIds.includes(callerEmp.id)) {
        throw notFound('Không tìm thấy bài thực hành được phân công cho bạn.');
      }
    }
  }

  const dept = data.departments.find((d) => d.id === task.departmentId);
  const pos = data.positions.find((p) => p.id === task.jobPositionId);
  const assignedEmployees = data.employees
    .filter((e) => task.assignedEmployeeIds.includes(e.id))
    .map((e) => ({
      id: e.id,
      fullName: e.fullName,
      employeeCode: e.employeeCode,
      workEmail: e.workEmail,
    }));

  const submissions = (data.submissions ?? [])
    .filter((s) => {
      if (s.taskId !== task.id) return false;
      if (isOwner) return true;
      if (isManager) {
        const inScopeIds = getManagerInScopeEmployeeIds(data, callerEmp);
        return inScopeIds.has(s.employeeId) || task.assignedByEmployeeId === callerEmp?.id;
      }
      return callerEmp ? s.employeeId === callerEmp.id : false;
    })
    .map((s) => {
      const emp = data.employees.find((e) => e.id === s.employeeId);
      return {
        ...s,
        employeeName: emp?.fullName ?? s.employeeName,
        employeeCode: emp?.employeeCode,
      };
    });

  return {
    ...task,
    departmentName: dept?.name,
    jobPositionName: pos?.name,
    assignedEmployees,
    submissions,
  };
}, { permission: P.TASK_READ });

// 4. GET /review-queue: Danh sách bài nộp chờ duyệt (chỉ OWNER / MANAGER)
route('GET', '/review-queue', ({ org, query, session }) => {
  const data = org();
  const isOwner = session.roles.includes(ROLES.OWNER) || session.roles.includes(ROLES.PLATFORM_ADMIN);
  const isManager = session.roles.includes(ROLES.MANAGER);

  if (!isOwner && !isManager) {
    throw forbidden('Chỉ Quản lý hoặc Chủ doanh nghiệp mới có quyền truy cập hàng đợi duyệt.');
  }

  const callerEmp = findCallerEmployee(data, session);
  const inScopeIds = isManager ? getManagerInScopeEmployeeIds(data, callerEmp) : null;
  const search = query.search?.trim().toLowerCase();

  const pendingSubmissions = (data.submissions ?? [])
    .filter((s) => {
      if (s.status !== 'PENDING_REVIEW') return false;
      if (isManager && inScopeIds && !inScopeIds.has(s.employeeId)) return false;
      return true;
    })
    .map((sub) => {
      const task = (data.tasks ?? []).find((t) => t.id === sub.taskId);
      const emp = data.employees.find((e) => e.id === sub.employeeId);
      const dept = emp ? data.departments.find((d) => d.id === emp.departmentId) : undefined;

      return {
        id: sub.id,
        taskId: sub.taskId,
        taskTitle: task?.title ?? 'Bài thực hành',
        taskDueDate: task?.dueDate,
        targetLevel: task?.targetLevel ?? 1,
        employeeId: sub.employeeId,
        employeeName: emp?.fullName ?? sub.employeeName,
        employeeCode: emp?.employeeCode ?? '',
        departmentName: dept?.name ?? '',
        submittedAt: sub.submittedAt,
        content: sub.content,
        linkUrls: sub.linkUrls ?? [],
        status: sub.status,
      };
    })
    .filter((item) => {
      if (search && !matchesSearch(item.employeeName, search) && !matchesSearch(item.taskTitle, search)) {
        return false;
      }
      return true;
    });

  return paginate(pendingSubmissions, pageRequest(query));
}, { permission: P.TASK_EVALUATE, roles: [ROLES.OWNER, ROLES.MANAGER] });

// 5. GET /submissions/:id: Xem chi tiết bài nộp minh chứng (lọc phạm vi theo vai trò)
route('GET', '/submissions/:id', ({ org, params, session }) => {
  const data = org();
  const sub = (data.submissions ?? []).find((s) => s.id === params.id);
  if (!sub) throw notFound('Không tìm thấy bài nộp minh chứng.');

  const isOwner = session.roles.includes(ROLES.OWNER) || session.roles.includes(ROLES.PLATFORM_ADMIN);
  const isManager = session.roles.includes(ROLES.MANAGER);
  const callerEmp = findCallerEmployee(data, session);

  if (!isOwner) {
    if (isManager) {
      const inScopeIds = getManagerInScopeEmployeeIds(data, callerEmp);
      if (!inScopeIds.has(sub.employeeId)) {
        throw notFound('Không tìm thấy bài nộp minh chứng trong phạm vi quản lý.');
      }
    } else {
      // EMPLOYEE: chỉ xem bài của chính mình
      if (!callerEmp || sub.employeeId !== callerEmp.id) {
        throw notFound('Không tìm thấy bài nộp minh chứng của bạn.');
      }
    }
  }

  const task = (data.tasks ?? []).find((t) => t.id === sub.taskId);
  const emp = data.employees.find((e) => e.id === sub.employeeId);
  const dept = emp ? data.departments.find((d) => d.id === emp.departmentId) : undefined;

  return {
    ...sub,
    taskTitle: task?.title,
    taskDescription: task?.description,
    taskExpectedOutput: task?.expectedOutput,
    taskDueDate: task?.dueDate,
    rubricCriteria: task?.rubricCriteria ?? [],
    targetLevel: task?.targetLevel,
    employeeName: emp?.fullName ?? sub.employeeName,
    employeeCode: emp?.employeeCode,
    departmentName: dept?.name,
  };
}, { permission: P.TASK_READ });

// 6. POST /submissions/:id/evaluate: Chấm điểm bài nộp (chỉ OWNER / MANAGER, cấm tự duyệt, cấm ngoài phạm vi, chỉ PENDING_REVIEW)
route('POST', '/submissions/:id/evaluate', ({ update, params, body, session }) => {
  const b = body as {
    score: number;
    feedback: string;
    rubricScores: Record<string, number>;
    decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
  };

  if (typeof b.score !== 'number' || !b.decision) {
    throw badRequest('Điểm số và quyết định đánh giá là bắt buộc.');
  }

  return update((data) => {
    const sub = (data.submissions ?? []).find((s) => s.id === params.id);
    if (!sub) throw notFound('Không tìm thấy bài nộp minh chứng.');

    const callerEmp = findCallerEmployee(data, session);
    const isOwner = session.roles.includes(ROLES.OWNER) || session.roles.includes(ROLES.PLATFORM_ADMIN);
    const isManager = session.roles.includes(ROLES.MANAGER);

    // Không ai được tự duyệt bài nộp của chính mình
    if (callerEmp && sub.employeeId === callerEmp.id) {
      throw forbidden('Bạn không thể tự đánh giá bài nộp của chính mình.');
    }

    // MANAGER chỉ duyệt bài nộp trong phạm vi quản lý
    if (isManager && !isOwner) {
      const inScopeIds = getManagerInScopeEmployeeIds(data, callerEmp);
      if (!inScopeIds.has(sub.employeeId)) {
        throw forbidden('Bạn chỉ có thể đánh giá bài nộp của nhân sự trong phạm vi quản lý.');
      }
    }

    // Chỉ đánh giá được bài đang ở trạng thái chờ chấm
    if (sub.status !== 'PENDING_REVIEW') {
      throw conflict('Chỉ có thể đánh giá bài nộp đang ở trạng thái chờ chấm (PENDING_REVIEW).');
    }

    const task = (data.tasks ?? []).find((t) => t.id === sub.taskId);
    const now = new Date().toISOString();

    sub.status = b.decision;
    sub.evaluation = {
      evaluatedBy: callerEmp?.fullName ?? session.fullName ?? session.email,
      evaluatedAt: now,
      score: b.score,
      feedback: b.feedback ?? '',
      rubricScores: b.rubricScores ?? {},
      decision: b.decision,
    };

    if (b.decision === 'APPROVED' && task) {
      data.profiles = data.profiles ?? {};
      data.profiles[sub.employeeId] = data.profiles[sub.employeeId] ?? {};
      for (const competencyId of task.competencyIds) {
        const currentEntry = data.profiles[sub.employeeId][competencyId];
        const newLevel = Math.max(currentEntry?.level ?? 0, task.targetLevel);
        data.profiles[sub.employeeId][competencyId] = {
          level: newLevel,
          source: 'TASK',
          confirmedAt: now,
        };
      }
      if (!skillGapBlocker(data, sub.employeeId)) {
        calculateRun(data, sub.employeeId, 'SYSTEM', now);
      }
    }

    recordAudit(data, session, 'PRACTICAL_EVALUATION_SUBMITTED', 'TASK_SUBMISSION', sub.id, `Đánh giá: ${b.score}đ - ${b.decision}`);
    return sub;
  });
}, { permission: P.TASK_EVALUATE, roles: [ROLES.OWNER, ROLES.MANAGER] });

// 8. POST /tasks/:id/submit: Nhân viên nộp bài thực hành (chỉ người được giao)
route('POST', '/tasks/:id/submit', ({ update, params, body, session }) => {
  const b = body as { content: string; linkUrls?: string[]; fileUrls?: string[] };
  if (!b.content?.trim()) {
    throw badRequest('Nội dung trình bày giải pháp / báo cáo không được để trống.');
  }

  return update((data) => {
    const task = (data.tasks ?? []).find((t) => t.id === params.id);
    if (!task) throw notFound('Không tìm thấy bài thực hành.');
    if (task.status !== 'ACTIVE') throw badRequest('Bài thực hành này không ở trạng thái mở nhận bài.');

    const callerEmp = findCallerEmployee(data, session);
    if (!callerEmp) {
      throw forbidden('Không tìm thấy hồ sơ nhân viên gắn với tài khoản của bạn.');
    }

    if (!task.assignedEmployeeIds.includes(callerEmp.id)) {
      throw forbidden('Bạn không được phân công thực hiện bài thực hành này.');
    }

    const now = new Date().toISOString();
    data.submissions = data.submissions ?? [];
    let existingSub = data.submissions.find((s) => s.taskId === task.id && s.employeeId === callerEmp.id);

    if (existingSub) {
      existingSub.content = b.content.trim();
      existingSub.linkUrls = b.linkUrls ?? [];
      existingSub.fileUrls = b.fileUrls ?? [];
      existingSub.submittedAt = now;
      existingSub.status = 'PENDING_REVIEW';
    } else {
      existingSub = {
        id: newId('sub'),
        taskId: task.id,
        employeeId: callerEmp.id,
        employeeName: callerEmp.fullName,
        submittedAt: now,
        content: b.content.trim(),
        linkUrls: b.linkUrls ?? [],
        fileUrls: b.fileUrls ?? [],
        status: 'PENDING_REVIEW',
      };
      data.submissions.unshift(existingSub);
    }

    recordAudit(data, session, 'PRACTICAL_EVIDENCE_SUBMITTED', 'TASK_SUBMISSION', existingSub.id, `Nộp bài cho: ${task.title}`);
    return existingSub;
  });
}, { permission: P.TASK_SUBMIT });
