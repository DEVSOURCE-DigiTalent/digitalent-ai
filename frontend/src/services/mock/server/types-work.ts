/**
 * Work-related mock types: Assessments, Certifications, Practical Tasks, and Submissions.
 * Shared between Owner and Manager/Employee (spec v2.1 §1.6).
 */

export interface AssessmentQuestionAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface AssessmentAttemptRecord {
  id: string;
  assessmentId: string;
  courseId: string;
  courseTitle: string;
  employeeId: string;
  employeeName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  answers: AssessmentQuestionAnswer[];
  /** Submitted by the server when the time ran out (trang EM-12). */
  autoSubmitted?: boolean;
}

export interface CertificateRecord {
  id: string;
  certificateCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  courseId: string;
  courseTitle: string;
  courseLevel: number;
  frameworkCompetencyCodes: string[];
  issueDate: string;
  expiryDate?: string;
  score: number;
  status: 'ACTIVE' | 'REVOKED';
}

export interface PracticalTaskRecord {
  id: string;
  title: string;
  description: string;
  expectedOutput: string;
  competencyIds: string[];
  targetLevel: number;
  departmentId?: string;
  jobPositionId?: string;
  assignedEmployeeIds: string[];
  assignedByEmployeeId: string;
  assignedByName: string;
  assignedAt: string;
  dueDate: string;
  rubricCriteria: {
    id: string;
    label: string;
    maxPoints: number;
    description: string;
  }[];
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface TaskSubmissionRecord {
  id: string;
  taskId: string;
  employeeId: string;
  employeeName: string;
  submittedAt: string;
  content: string;
  fileUrls?: string[];
  linkUrls?: string[];
  status: 'PENDING_REVIEW' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED';
  evaluation?: {
    evaluatedBy: string;
    evaluatedAt: string;
    score: number;
    feedback: string;
    rubricScores: Record<string, number>;
    decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';
  };
  /** Earlier versions of this submission, oldest first (trang EM-15/EM-17 hiển thị lịch sử nộp lại). */
  previousVersions?: Omit<TaskSubmissionRecord, 'id' | 'taskId' | 'employeeId' | 'employeeName' | 'previousVersions'>[];
}

/** Lượt làm bài đang mở của trang EM-11 (chưa nộp nên chưa nằm trong `attempts`). */
export interface OpenAttemptRecord {
  id: string;
  assessmentId: string;
  courseId: string;
  employeeId: string;
  attemptNo: number;
  startedAt: string;
  deadline: string;
  answers: Record<string, string | null>;
}

/** Metadata of a file an employee attached to a practical task (the mock keeps no file content). */
export interface TaskFileRecord {
  id: string;
  taskId: string;
  employeeId: string;
  fileName: string;
  contentType?: string;
  sizeBytes: number;
  uploadedAt: string;
}
