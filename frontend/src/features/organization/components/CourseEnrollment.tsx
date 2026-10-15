import { useNavigate } from 'react-router-dom';
import { UserCheck, Layers } from 'lucide-react';
import type { CourseDetailDto } from '@/services/assignment.service';

interface CourseEnrollmentProps {
  course: CourseDetailDto;
  isBasic: boolean;
  assignmentCount: number;
  completedCount: number;
}

export function CourseEnrollment({
  course,
  isBasic,
  assignmentCount,
  completedCount,
}: CourseEnrollmentProps) {
  const navigate = useNavigate();

  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-accent)' }}
      >
        Truy cập và phân công
      </span>
      <h2
        className="mt-2 text-xl font-semibold"
        style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
      >
        {isBasic ? 'Mở toàn bộ' : 'Phân công khi cần'}
      </h2>
      <p className="mt-1 text-xs" style={{ color: 'var(--po-muted)' }}>
        {isBasic
          ? 'Không cần phân công. Tất cả nhân viên có thể truy cập nội dung khóa Cơ bản.'
          : 'Nhân viên cần được phân công để mở khóa nội dung đầy đủ. Owner và Manager có thể giao khóa.'}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
          style={
            assignmentCount > 0
              ? { background: '#edf7dd', color: '#557327' }
              : { background: '#f0f2f6', color: '#66748d' }
          }
        >
          {assignmentCount > 0
            ? `${assignmentCount} nhân viên đã giao`
            : 'Chưa có phân công'}
        </span>
        {completedCount > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
            style={{ background: '#edf7dd', color: '#557327' }}
          >
            {completedCount} đã hoàn thành
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <button
          type="button"
          onClick={() => navigate(`/enterprise/assignments?courseId=${course.id}`)}
          className="inline-flex items-center gap-1.5 rounded-[11px] px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
          style={{
            background: 'var(--po-accent)',
            color: '#fff',
            boxShadow: '0 9px 18px rgba(52,72,207,.17)',
          }}
        >
          <UserCheck className="size-3.5" />
          Giao khóa học
        </button>
        <button
          type="button"
          onClick={() => navigate(`/enterprise/training-batches/new?courseId=${course.id}`)}
          className="inline-flex items-center gap-1.5 rounded-[11px] border px-3 py-2 text-xs font-bold transition-transform hover:-translate-y-0.5"
          style={{
            background: 'var(--po-surface)',
            color: 'var(--po-accent)',
            borderColor: '#cdd7f5',
          }}
        >
          <Layers className="size-3.5" />
          Thêm vào đợt đào tạo
        </button>
      </div>
    </section>
  );
}
