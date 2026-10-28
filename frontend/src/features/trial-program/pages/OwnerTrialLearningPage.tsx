import { useId, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/shared/PageContainer';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCourseCatalog } from '@/hooks/use-assignments';
import { useJoinTrialAsParticipant, useTrialProgram } from '@/hooks/use-trial-program';
import { ROLES, normalizeRoles } from '@/lib/roles';
import { apiErrorMessage } from '@/lib/utils';
import { LockedCourses, NoticeCard, TrialLearningHead, Upgrade } from '@/features/pulse-employee/components/TrialLearning';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { formatWhen } from '../lib/trial-format';
import '@/features/pulse-employee/pulse.css';
import '@/features/pulse-employee/pulse-roadmap.css';

/** Mã khóa Cơ bản của khung TT02 (M1-F … M6-F). */
const BASIC_CODE = /^[A-Z]\d+-F$/;

/**
 * OW-T2 · Học thử của chủ doanh nghiệp chưa tham gia: cảnh báo làm bài test trước khi học (tham gia như nhân viên với phòng
 * ban + vị trí), sáu khóa Cơ bản đang khóa và nút mua khóa. Đã tham gia → trang Học thử của cổng nhân viên (EM-02), nơi
 * cảnh báo tiếp tục tới khi mentor công bố kết quả.
 */
export function OwnerTrialLearningPage() {
  const participating = useCurrentUser((s) => normalizeRoles(s.user?.roles ?? []).includes(ROLES.EMPLOYEE));
  if (participating) return <Navigate to={PULSE_PATHS.path} replace />;
  return (
    <PageContainer>
      <div className="pu pu-in-shell">
        <JoinFirst />
      </div>
    </PageContainer>
  );
}

function JoinFirst() {
  const { data: program } = useTrialProgram();
  const { data: catalog } = useCourseCatalog({});
  const join = useJoinTrialAsParticipant();
  const listId = useId();
  const [placement, setPlacement] = useState({ department: '', position: '' });
  const reported = program?.stage === 'REPORTED';
  const courses = (catalog?.items ?? [])
    .filter((c) => c.level === 1 && c.status === 'PUBLISHED' && BASIC_CODE.test(c.code))
    .sort((a, b) => a.code.localeCompare(b.code));
  const ready = placement.department.trim() && placement.position.trim();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready || join.isPending) return;
    join.mutate(
      { department: placement.department.trim(), position: placement.position.trim() },
      {
        // Token mới có role Nhân viên → trang tự chuyển sang Học thử của cổng nhân viên.
        onSuccess: ({ refreshed }) =>
          refreshed
            ? toast.success(reported ? 'Bạn đã tham gia học thử.' : 'Bạn đã tham gia. Làm bài test để mở học thử.')
            : toast.warning('Bạn đã tham gia. Hãy đăng xuất rồi đăng nhập lại để vào bài test.'),
        onError: (err) => toast.error(apiErrorMessage(err, 'Chưa tham gia được.')),
      },
    );
  };

  return (
    <div className="pu-tl">
      <TrialLearningHead total={courses.length || 6} done={null} />
      <NoticeCard
        icon={<ClipboardList size={20} />}
        title={reported ? 'Tham gia để học thử' : 'Làm bài test trước khi học'}
        text={
          reported
            ? 'Kết quả đã công bố: tham gia là học được ngay.'
            : 'Tham gia như nhân viên: làm bài test, mentor chấm, rồi học thử.'
        }
        meta={program?.testDeadline && !reported ? `Hạn nộp ${formatWhen(program.testDeadline)}` : undefined}
      >
        <form className="pu-tl-join" onSubmit={submit}>
          <label>
            Phòng ban
            <input list={`${listId}-d`} required maxLength={150} value={placement.department} onChange={(e) => setPlacement({ ...placement, department: e.target.value })} />
          </label>
          <label>
            Vị trí
            <input list={`${listId}-p`} required maxLength={150} value={placement.position} onChange={(e) => setPlacement({ ...placement, position: e.target.value })} />
          </label>
          <datalist id={`${listId}-d`}>{program?.departments.map((d) => <option key={d} value={d} />)}</datalist>
          <datalist id={`${listId}-p`}>{program?.positions.map((p) => <option key={p} value={p} />)}</datalist>
          <button type="submit" className="pu-btn pu-btn-primary" disabled={!ready || join.isPending}>
            {join.isPending ? 'Đang xử lý…' : reported ? 'Tham gia học thử' : 'Tham gia làm bài test'} <ArrowRight size={15} aria-hidden />
          </button>
        </form>
      </NoticeCard>
      {courses.length > 0 && (
        <LockedCourses courses={courses.map((c) => ({ key: c.id, code: c.code, title: c.title, domainName: c.categoryName, moduleCount: c.modules }))} />
      )}
      <Upgrade owner finished={false} />
    </div>
  );
}
