import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useJoinTrialAsParticipant } from '@/hooks/use-trial-program';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { TrialProgram } from '@/services/trial-program.service';
import { apiErrorMessage } from '@/lib/utils';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import { OwnerFilterSelect } from '@/features/organization/components/OwnerFilterSelect';
import { TrialDisclosure } from './TrialDisclosure';

export function OwnerSurveyAction({ program }: { program: TrialProgram }) {
  useUiLanguage();
  const navigate = useNavigate();
  const roles = useCurrentUser((state) => state.user?.roles ?? []);
  const join = useJoinTrialAsParticipant();
  const owner = program.participants.find((participant) => participant.isOwner);
  const [open, setOpen] = useState(false);
  const [department, setDepartment] = useState(program.departments[0] ?? 'Ban lãnh đạo');
  const [position, setPosition] = useState(program.positions[0] ?? 'Giám đốc');
  const submitted = owner?.status === 'SUBMITTED' || owner?.status === 'REVIEWED';
  const ended = program.stage === 'REPORTED' || Boolean(program.testDeadline && Date.parse(program.testDeadline) <= Date.now());
  const enter = async () => {
    if (owner && roles.includes('EMPLOYEE')) { navigate(PULSE_PATHS.trialTest); return; }
    try {
      const { refreshed } = await join.mutateAsync({ department: owner?.departmentName ?? department, position: owner?.positionName ?? position });
      if (refreshed) navigate(PULSE_PATHS.trialTest);
      else toast.warning('Đã đăng ký tham gia. Đăng nhập lại để cập nhật quyền làm bài.');
    } catch (error) { toast.error(apiErrorMessage(error, 'Chưa vào được bài khảo sát.')); }
  };
  if (ended && !owner) return null;
  return <section className="trial-owner-action">
    <div className="trial-owner-action__bar"><span className="trial-owner-action__icon"><ClipboardCheck size={23} /></span><div><h2>{submitted ? translateUi('Bài khảo sát của bạn đã hoàn thành') : 'Cùng đội ngũ làm khảo sát'}</h2><p>{translateUi("Cùng đề bài, cùng cách đánh giá với nhân viên.")}</p></div><button type="button" disabled={join.isPending || (ended && !submitted)} onClick={() => owner ? void enter() : setOpen(!open)} aria-expanded={!owner ? open : undefined}>{join.isPending ? 'Đang chuẩn bị…' : submitted ? translateUi('Xem kết quả của tôi') : ended ? translateUi('Đã hết hạn') : owner ? translateUi('Làm bài khảo sát') : 'Tôi cũng tham gia'}<ArrowRight size={16} /></button></div>
    <TrialDisclosure open={open}><div className="trial-owner-action__placement"><OwnerFilterSelect label={translateUi("Phòng ban của bạn")} value={department} options={(program.departments.length ? program.departments : ['Ban lãnh đạo']).map((name) => ({value:name,label:name}))} onChange={setDepartment}/><OwnerFilterSelect label="Vị trí của bạn" value={position} options={(program.positions.length ? program.positions : ['Giám đốc']).map((name) => ({value:name,label:name}))} onChange={setPosition}/><button type="button" disabled={join.isPending} onClick={() => void enter()}>Đăng ký & vào bài khảo sát <ArrowRight size={16}/></button></div></TrialDisclosure>
  </section>;
}
