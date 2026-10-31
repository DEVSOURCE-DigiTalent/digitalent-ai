import type { TrialParticipantRow } from '@/services/trial-program.service';

export const EMPTY_ROW: TrialParticipantRow = { fullName: '', email: '', department: '', position: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isRowEmpty = (row: TrialParticipantRow) => !row.fullName.trim() && !row.email.trim() && !row.department.trim() && !row.position.trim();
export const rowError = (row: TrialParticipantRow): string | null =>
  !row.fullName.trim() ? 'Thiếu họ tên'
  : !EMAIL.test(row.email.trim()) ? 'Email chưa đúng'
  : !row.department.trim() ? 'Thiếu phòng ban'
  : !row.position.trim() ? 'Thiếu vị trí'
  : null;

export const emptyRows = (count = 3): TrialParticipantRow[] => Array.from({ length: count }, () => ({ ...EMPTY_ROW }));
