import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { useLearningNeeds, useSkillGapRun, useSkillGapRuns } from '@/hooks/use-skill-gaps';
import { EmployeeLearningPlan } from '../components/EmployeeLearningPlan';
import { ConfirmLevelDialog } from '../components/ConfirmLevelDialog';

export function SkillGapDetailPage() {
  useUiLanguage();
  const { employeeId } = useParams();
  const needs = useLearningNeeds({ employeeId, pageIndex: 1, pageSize: 1 });
  const employee = needs.data?.items[0];
  const { can } = usePermission();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDomainNumber, setSelectedDomainNumber] = useState<number>();
  // Snapshot is only used by the existing evidence confirmation dialog, not the comparison.
  const latest = useSkillGapRuns({ employeeId, pageIndex: 1, pageSize: 1 }, confirmOpen);
  const run = useSkillGapRun(confirmOpen ? latest.data?.items[0]?.runId : undefined);
  return <div className="employee-plan-page">
    {employee ? <EmployeeLearningPlan employee={employee} canConfirm={can(PERMISSIONS.EVIDENCE_CREATE_MANUAL)} onConfirm={() => setConfirmOpen(true)} onRefresh={() => void needs.refetch()} refreshing={needs.isFetching} onDomainChange={setSelectedDomainNumber} /> : <><nav className="employee-plan-breadcrumb"><Link to="/enterprise/skill-gap"><ArrowLeft size={15} />{translateUi(" Tổng quan năng lực")}</Link></nav>{needs.isLoading ? <p className="employee-plan-feedback" role="status">{translateUi("Đang đối chiếu năng lực…")}</p> : <p className="employee-plan-feedback" role="alert">{needs.isError ? 'Không tải được thông tin năng lực. Vui lòng thử làm mới.' : 'Không tìm thấy nhân viên.'}</p>}</>}
    {confirmOpen && run.data && <ConfirmLevelDialog run={run.data} open initialCategoryNumber={selectedDomainNumber} onClose={() => setConfirmOpen(false)} onConfirmed={() => { setConfirmOpen(false); void needs.refetch(); }} />}
    {confirmOpen && !run.data && <div className="employee-plan-feedback" role="status"><p>{latest.isError || run.isError || (latest.isSuccess && !latest.data?.items.length) ? 'Chưa có hồ sơ để xác nhận. Hãy cập nhật đánh giá trong hồ sơ nhân viên.' : 'Đang mở hồ sơ xác nhận…'}</p><button type="button" onClick={() => setConfirmOpen(false)}>{translateUi("Đóng")}</button></div>}
  </div>;
}
