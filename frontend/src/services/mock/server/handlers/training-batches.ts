import { PERMISSIONS } from '../../../../hooks/use-permission';
import { newId } from '../../mock-store';
import { CATEGORY_BY_ID, COURSE_BY_ID } from '../catalog';
import { badRequest, conflict, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { route } from '../router';
import type { OrgData, TrainingBatchRecord, TrainingBatchStatus } from '../types';
import { recordAudit } from './audit';
import { employeesInScope } from './structure';

const P = PERMISSIONS;

export interface TrainingBatchListItemDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: TrainingBatchStatus;
  startDate: string;
  endDate: string;
  coursesCount: number;
  participantsCount: number;
  completedParticipantsCount: number;
  averageProgressPercent: number;
  createdAt: string;
  createdByName?: string;
}

export interface TrainingBatchDetailDto extends TrainingBatchRecord {
  courses: {
    id: string;
    code: string;
    title: string;
    domain: string;
    level: number;
    durationMinutes: number;
    passingScore: number;
    activeLearnersCount: number;
    completionRate: number;
  }[];
  participants: {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    departmentName?: string;
    positionName?: string;
    jobGrade?: string;
    progressPercent: number;
    completedCoursesCount: number;
    totalCoursesCount: number;
    isFullyCompleted: boolean;
  }[];
  overallProgressPercent: number;
}

export interface TrainingBatchSummaryDto {
  totalBatches: number;
  runningBatches: number;
  scheduledBatches: number;
  completedBatches: number;
  totalParticipants: number;
  totalCompletedCertificates: number;
}

interface CreateTrainingBatchBody {
  code?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: TrainingBatchStatus;
  courseIds?: string[];
  participantEmployeeIds?: string[];
  targetCriteria?: {
    departmentIds?: string[];
    jobPositionIds?: string[];
    jobGrades?: string[];
    employeeIds?: string[];
  };
  autoAssign?: boolean;
}

interface UpdateTrainingBatchBody {
  code?: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: TrainingBatchStatus;
  courseIds?: string[];
  participantEmployeeIds?: string[];
  targetCriteria?: {
    departmentIds?: string[];
    jobPositionIds?: string[];
    jobGrades?: string[];
    employeeIds?: string[];
  };
}

interface CancelTrainingBatchBody {
  reason?: string;
}

function calculateBatchProgress(data: OrgData, batch: TrainingBatchRecord) {
  if (!batch.participantEmployeeIds || batch.participantEmployeeIds.length === 0) {
    return { completedCount: 0, averageProgress: 0 };
  }

  let totalProgress = 0;
  let fullyCompletedCount = 0;

  for (const empId of batch.participantEmployeeIds) {
    let empProgressSum = 0;
    let empCompletedCount = 0;

    for (const courseId of batch.courseIds) {
      const assignment = data.assignments.find(
        (a) => a.employeeId === empId && a.courseId === courseId && a.status !== 'CANCELLED'
      );
      const prg = assignment?.progressPercent ?? 0;
      empProgressSum += prg;
      if (assignment?.status === 'COMPLETED' || prg === 100) {
        empCompletedCount++;
      }
    }

    const empAvg = batch.courseIds.length > 0 ? empProgressSum / batch.courseIds.length : 0;
    totalProgress += empAvg;
    if (empCompletedCount === batch.courseIds.length && batch.courseIds.length > 0) {
      fullyCompletedCount++;
    }
  }

  const averageProgress = Math.round(totalProgress / batch.participantEmployeeIds.length);
  return { completedCount: fullyCompletedCount, averageProgress };
}

route('GET', '/training-batches', ({ org, query }) => {
  const data = org();
  const batches = data.trainingBatches ?? [];

  let filtered = [...batches];

  if (query.status) {
    filtered = filtered.filter((b) => b.status === query.status);
  }

  if (query.search) {
    filtered = filtered.filter((b) =>
      matchesSearch(b.name, query.search) ||
      matchesSearch(b.code, query.search) ||
      matchesSearch(b.description, query.search)
    );
  }

  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const items: TrainingBatchListItemDto[] = filtered.map((b) => {
    const { completedCount, averageProgress } = calculateBatchProgress(data, b);
    return {
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
      coursesCount: b.courseIds.length,
      participantsCount: b.participantEmployeeIds.length,
      completedParticipantsCount: completedCount,
      averageProgressPercent: averageProgress,
      createdAt: b.createdAt,
      createdByName: b.createdByName,
    };
  });

  return paginate(items, pageRequest(query));
}, { permission: P.TRAINING_BATCH_READ });

route('GET', '/training-batches/summary', ({ org }) => {
  const data = org();
  const batches = data.trainingBatches ?? [];

  const allParticipantIds = new Set<string>();
  batches.forEach((b) => b.participantEmployeeIds.forEach((id) => allParticipantIds.add(id)));

  const summary: TrainingBatchSummaryDto = {
    totalBatches: batches.length,
    runningBatches: batches.filter((b) => b.status === 'RUNNING').length,
    scheduledBatches: batches.filter((b) => b.status === 'SCHEDULED').length,
    completedBatches: batches.filter((b) => b.status === 'COMPLETED').length,
    totalParticipants: allParticipantIds.size,
    totalCompletedCertificates: data.certificates?.length ?? 0,
  };

  return summary;
}, { permission: P.TRAINING_BATCH_READ });

route('GET', '/training-batches/:id', ({ org, params }) => {
  const data = org();
  const batch = (data.trainingBatches ?? []).find((b) => b.id === params.id);
  if (!batch) throw notFound('Không tìm thấy đợt đào tạo.');

  const courses = batch.courseIds.map((cid) => {
    const catalogItem = COURSE_BY_ID.get(cid);
    const domainName = catalogItem ? CATEGORY_BY_ID.get(catalogItem.categoryId)?.name ?? 'Năng lực số' : 'Năng lực số';
    const enrolledCount = batch.participantEmployeeIds.filter((empId) =>
      data.assignments.some((a) => a.employeeId === empId && a.courseId === cid && a.status !== 'CANCELLED')
    ).length;
    const completedCount = batch.participantEmployeeIds.filter((empId) =>
      data.assignments.some(
        (a) => a.employeeId === empId && a.courseId === cid && (a.status === 'COMPLETED' || a.progressPercent === 100)
      )
    ).length;
    const completionRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

    return {
      id: cid,
      code: catalogItem?.code ?? cid,
      title: catalogItem?.title ?? cid,
      domain: domainName,
      level: catalogItem?.level ?? 1,
      durationMinutes: catalogItem?.estimatedDurationMinutes ?? 120,
      passingScore: 80,
      activeLearnersCount: enrolledCount,
      completionRate,
    };
  });

  const employeesMap = new Map(data.employees.map((e) => [e.id, e]));
  const departmentsMap = new Map(data.departments.map((d) => [d.id, d.name]));
  const positionsMap = new Map(data.positions.map((p) => [p.id, p.name]));
  const positionGradeMap = new Map(data.positions.map((p) => [p.id, p.jobGrade]));

  const participants = batch.participantEmployeeIds.map((empId) => {
    const emp = employeesMap.get(empId);
    let completedCourses = 0;
    let progressSum = 0;

    for (const cid of batch.courseIds) {
      const a = data.assignments.find(
        (asg) => asg.employeeId === empId && asg.courseId === cid && asg.status !== 'CANCELLED'
      );
      const prg = a?.progressPercent ?? 0;
      progressSum += prg;
      if (a?.status === 'COMPLETED' || prg === 100) {
        completedCourses++;
      }
    }

    const avgPrg = batch.courseIds.length > 0 ? Math.round(progressSum / batch.courseIds.length) : 0;
    return {
      employeeId: empId,
      employeeName: emp?.fullName ?? 'Nhân viên',
      employeeCode: emp?.employeeCode ?? '',
      departmentName: emp?.departmentId ? departmentsMap.get(emp.departmentId) : undefined,
      positionName: emp?.jobPositionId ? positionsMap.get(emp.jobPositionId) : undefined,
      jobGrade: emp?.jobPositionId ? positionGradeMap.get(emp.jobPositionId) : undefined,
      progressPercent: avgPrg,
      completedCoursesCount: completedCourses,
      totalCoursesCount: batch.courseIds.length,
      isFullyCompleted: completedCourses === batch.courseIds.length,
    };
  });

  const { averageProgress } = calculateBatchProgress(data, batch);

  const detail: TrainingBatchDetailDto = {
    ...batch,
    courses,
    participants,
    overallProgressPercent: averageProgress,
  };

  return detail;
}, { permission: P.TRAINING_BATCH_READ });

route('POST', '/training-batches', (context) => context.update((data) => {
  const body = (context.body || {}) as CreateTrainingBatchBody;
  const { session } = context;
  if (!body.name?.trim()) throw badRequest('Tên đợt đào tạo là bắt buộc.');
  if (!body.startDate || !body.endDate) throw badRequest('Thời gian bắt đầu và kết thúc là bắt buộc.');
  if (!Array.isArray(body.courseIds) || body.courseIds.length === 0) {
    throw badRequest('Phải chọn ít nhất một khóa học cho đợt đào tạo.');
  }

  const now = new Date().toISOString();
  const id = newId('tb');
  const code = body.code?.trim() || `DOT-${new Date().getFullYear()}-${String((data.trainingBatches?.length ?? 0) + 1).padStart(2, '0')}`;
  
  let participants: string[] = Array.isArray(body.participantEmployeeIds) ? [...body.participantEmployeeIds] : [];
  
  // Auto-resolve participants if target criteria given and list empty
  if (participants.length === 0 && body.targetCriteria) {
    const { departmentIds, jobPositionIds, jobGrades } = body.targetCriteria;
    const candidates = employeesInScope(context).filter((e) => e.status === 'ACTIVE');
    const posGradeMap = new Map(data.positions.map((p) => [p.id, p.jobGrade]));

    participants = candidates
      .filter((e) => {
        if (departmentIds?.length && (!e.departmentId || !departmentIds.includes(e.departmentId))) return false;
        if (jobPositionIds?.length && (!e.jobPositionId || !jobPositionIds.includes(e.jobPositionId))) return false;
        if (jobGrades?.length) {
          const g = e.jobPositionId ? posGradeMap.get(e.jobPositionId) : undefined;
          if (!g || !jobGrades.includes(g)) return false;
        }
        return true;
      })
      .map((e) => e.id);
  }

  const batchStatus: TrainingBatchStatus = body.status ?? (body.startDate <= now.slice(0, 10) ? 'RUNNING' : 'SCHEDULED');

  const newBatch: TrainingBatchRecord = {
    id,
    code,
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    status: batchStatus,
    startDate: body.startDate,
    endDate: body.endDate,
    courseIds: body.courseIds,
    targetCriteria: body.targetCriteria,
    participantEmployeeIds: participants,
    createdAt: now,
    createdByName: session.fullName,
  };

  if (!data.trainingBatches) data.trainingBatches = [];
  data.trainingBatches.push(newBatch);

  // Auto-create assignments for participants if status is RUNNING or SCHEDULED
  if (batchStatus === 'RUNNING' || batchStatus === 'SCHEDULED' || body.autoAssign) {
    for (const empId of participants) {
      for (const crsId of body.courseIds) {
        const existing = data.assignments.find(
          (a) => a.employeeId === empId && a.courseId === crsId && a.status !== 'CANCELLED'
        );
        if (!existing) {
          data.assignments.push({
            id: newId('asg'),
            employeeId: empId,
            courseId: crsId,
            assignedByName: session.fullName,
            assignedAt: now,
            dueDate: body.endDate,
            source: 'MANUAL',
            status: 'NOT_STARTED',
            progressPercent: 0,
          });
        }
      }
    }
  }

  recordAudit(data, session, 'TRAINING_BATCH_CREATED', 'Đợt đào tạo', newBatch.code, `${newBatch.name} (${participants.length} học viên)`);

  return { id: newBatch.id, code: newBatch.code };
}), { permission: P.TRAINING_BATCH_CREATE, status: 201 });

route('PUT', '/training-batches/:id', (context) => context.update((data) => {
  const body = (context.body || {}) as UpdateTrainingBatchBody;
  const { params, session } = context;
  const batch = (data.trainingBatches ?? []).find((b) => b.id === params.id);
  if (!batch) throw notFound('Không tìm thấy đợt đào tạo.');
  if (batch.status === 'COMPLETED' || batch.status === 'CANCELLED') {
    throw conflict('Không thể chỉnh sửa đợt đào tạo đã kết thúc hoặc đã hủy.');
  }

  if (body.name?.trim()) batch.name = body.name.trim();
  if (body.description !== undefined) batch.description = body.description?.trim() || undefined;
  if (body.startDate) batch.startDate = body.startDate;
  if (body.endDate) batch.endDate = body.endDate;
  if (Array.isArray(body.courseIds) && body.courseIds.length > 0) batch.courseIds = body.courseIds;
  if (Array.isArray(body.participantEmployeeIds)) batch.participantEmployeeIds = body.participantEmployeeIds;
  if (body.status) batch.status = body.status;

  recordAudit(data, session, 'TRAINING_BATCH_UPDATED', 'Đợt đào tạo', batch.code, `Cập nhật đợt ${batch.name}`);

  return { id: batch.id };
}), { permission: P.TRAINING_BATCH_UPDATE });

route('POST', '/training-batches/:id/cancel', (context) => context.update((data) => {
  const { params, session } = context;
  const body = (context.body || {}) as CancelTrainingBatchBody;
  const batch = (data.trainingBatches ?? []).find((b) => b.id === params.id);
  if (!batch) throw notFound('Không tìm thấy đợt đào tạo.');
  if (batch.status === 'COMPLETED') throw conflict('Đợt đào tạo đã hoàn thành.');
  batch.status = 'CANCELLED';

  recordAudit(data, session, 'TRAINING_BATCH_CANCELLED', 'Đợt đào tạo', batch.code, body.reason || 'Hủy đợt đào tạo');

  return { id: batch.id, status: batch.status };
}), { permission: P.TRAINING_BATCH_CANCEL });

route('POST', '/training-batches/:id/complete', (context) => context.update((data) => {
  const { params, session } = context;
  const batch = (data.trainingBatches ?? []).find((b) => b.id === params.id);
  if (!batch) throw notFound('Không tìm thấy đợt đào tạo.');
  batch.status = 'COMPLETED';

  recordAudit(data, session, 'TRAINING_BATCH_COMPLETED', 'Đợt đào tạo', batch.code, `Hoàn thành đợt ${batch.name}`);

  return { id: batch.id, status: batch.status };
}), { permission: P.TRAINING_BATCH_UPDATE });
