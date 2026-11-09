import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useMemo, useState } from 'react';
import { Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useJobPositions } from '@/hooks/use-job-positions';
import { useActivatePositionRequirements, useAllActiveCompetencies, useCreateDraftPositionRequirements, usePositionRequirements, useUpdateDraftPositionRequirements } from '@/hooks/use-competencies';
import { TT02_COMPETENCY_CODES } from '@/features/competency/utils/requirement-domains';
import { apiErrorMessage } from '@/lib/utils';
import type { CeilingDomain } from '@/services/capability-ceiling.service';
import { OwnerFilterSelect } from './OwnerFilterSelect';
import { courseCoverageIssue, courseStandardIssue, itemsFromCourseLevels, levelsFromRequirements } from './course-position-standard';
import './course-position-standard.css';

const TT02_CODES = new Set<string>(TT02_COMPETENCY_CODES);
const LEVEL_NAMES = ['—', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

interface Props {
  domain: CeilingDomain;
  domains: CeilingDomain[];
  departmentId: string | null;
  initialPositionId?: string | null;
  canEdit: boolean;
}

/** A domain has three sellable courses. Position standards choose one course without requiring a seat purchase. */
export function DomainPositionStandardPanel({ domain, domains, departmentId, initialPositionId, canEdit }: Props) {
  useUiLanguage();
  const { data: positionsData, isLoading: positionsLoading } = useJobPositions({ pageSize: 100, status: 'ACTIVE' });
  const { data: competencyData } = useAllActiveCompetencies();
  const positions = useMemo(() => (positionsData?.items ?? []).filter((position) => !departmentId || position.departmentId === departmentId), [positionsData, departmentId]);
  const competencies = useMemo(() => (competencyData ?? []).filter((item) => TT02_CODES.has(item.frameworkCode ?? '')), [competencyData]);
  const [positionId, setPositionId] = useState(initialPositionId ?? '');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const { data: requirement, isLoading: requirementLoading } = usePositionRequirements(positionId);
  const createDraft = useCreateDraftPositionRequirements();
  const updateDraft = useUpdateDraftPositionRequirements();
  const activate = useActivatePositionRequirements();
  const busy = createDraft.isPending || updateDraft.isPending || activate.isPending;
  const savedLevels = useMemo(() => levelsFromRequirements(competencies, requirement?.items ?? []), [competencies, requirement]);
  const currentLevel = requirement?.id ? (savedLevels[domain.categoryId] ?? 0) : 0;
  const selectedCourse = domain.courses.find((course) => course.level === selectedLevel);
  const currentCourse = domain.courses.find((course) => course.level === currentLevel);
  const proposedLevels = { ...savedLevels, [domain.categoryId]: selectedLevel };
  const saveIssue = selectedLevel ? courseStandardIssue(competencies, proposedLevels) ?? courseCoverageIssue(competencies, domains, proposedLevels) : null;
  const canApply = Boolean(requirement && requirement.jobPositionId === positionId && selectedCourse?.courseId && (!requirement.id || currentLevel !== selectedLevel));

  useEffect(() => {
    if (positions.length && !positions.some((position) => position.id === positionId)) {
      setPositionId(positions.find((position) => position.id === initialPositionId)?.id ?? positions[0].id);
    }
  }, [positions, positionId, initialPositionId]);

  useEffect(() => {
    if (!requirement || requirement.jobPositionId !== positionId || !competencies.length) return;
    setSelectedLevel(requirement.id ? (savedLevels[domain.categoryId] ?? 0) : 0);
  }, [requirement, positionId, domain.categoryId, competencies, savedLevels]);

  const save = async () => {
    if (!positionId || !requirement || !canApply || saveIssue) return;
    const items = itemsFromCourseLevels(competencies, proposedLevels);
    try {
      let draftId: string;
      if (requirement.id && requirement.status === 'DRAFT') {
        await updateDraft.mutateAsync({ id: requirement.id, data: { items, changeReason: 'Cập nhật chuẩn vị trí theo khóa học' } });
        draftId = requirement.id;
      } else {
        const response = await createDraft.mutateAsync({ jobPositionId: positionId, items, changeReason: 'Cập nhật chuẩn vị trí theo khóa học' });
        draftId = response.data.data?.id ?? '';
      }
      if (!draftId) throw new Error('Không tìm thấy bản nháp vừa tạo.');
      await activate.mutateAsync(draftId);
      toast.success(`Đã đặt ${selectedCourse?.code ?? 'khóa học'} làm chuẩn cho ${positions.find((item) => item.id === positionId)?.name ?? 'vị trí'}.`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Chưa lưu được chuẩn vị trí.'));
    }
  };

  return <section className="cp-standard cp-standard--domain" aria-label={translateUi(`Chuẩn vị trí theo lĩnh vực ${domain.name}`)}>
    <div className="cp-standard__position-heading">
      <div>
        <h3>{translateUi("Chọn cấp cho vị trí")}</h3>
      </div>
      <div className="cp-standard__position-picker">
        <span>{translateUi("Vị trí áp dụng")}</span>
        <OwnerFilterSelect
          label={translateUi("Chọn vị trí công việc")}
          value={positionId}
          disabled={positionsLoading || busy || !positions.length}
          onChange={setPositionId}
          options={positions.length ? positions.map((position) => ({
            value: position.id,
            label: !departmentId && position.departmentName && position.departmentName.toLocaleLowerCase('vi') !== position.name.toLocaleLowerCase('vi')
              ? `${position.name} · ${position.departmentName}`
              : position.name,
          })) : [{ value: '', label: 'Chưa có vị trí' }]}
          className="cp-standard__position-select"
        />
      </div>
    </div>
    {positions.length ? <>
      <div className="cp-standard__course-options" role="group" aria-label={translateUi(`Chọn khóa học cho lĩnh vực ${domain.name}`)}>
        {domain.courses.map((course) => <button key={course.level} type="button" className={`cp-standard__course-option${selectedLevel === course.level ? ' is-active' : ''}`} aria-pressed={selectedLevel === course.level} disabled={!canEdit || busy || requirementLoading || !course.courseId} onClick={() => setSelectedLevel(course.level)}>
          <span className="cp-standard__course-option-head"><strong>{translateUi(LEVEL_NAMES[course.level])}</strong><small>{course.code ?? translateUi(`Cấp ${course.level}`)}</small></span>
          <span>{translateUi(course.title) ?? translateUi('Chưa có khóa học')}</span>
          <em>{course.level === 1 ? translateUi('Miễn phí') : course.isUnlocked === false ? 'Chưa mua suất học' : 'Đã mở quyền học'}</em>
          {selectedLevel === course.level && <Check size={15} className="cp-standard__course-option-check" aria-hidden="true" />}
        </button>)}
      </div>
      <div className="cp-standard__footer">
        <span>{saveIssue ?? (selectedLevel === 0 ? 'Chọn một cấp để đặt chuẩn.' : translateUi(`Đang áp dụng: ${currentCourse?.code ?? 'Chưa thiết lập'} · Đã chọn: ${selectedCourse?.code ?? '—'}`))}</span>
        <button type="button" className="cp-standard__save" disabled={!canEdit || busy || requirementLoading || !canApply || !!saveIssue} onClick={save}>
          <Save size={15} /> {busy ? translateUi('Đang lưu…') : canApply ? translateUi('Lưu chuẩn vị trí') : selectedLevel && currentLevel === selectedLevel ? translateUi('Đang áp dụng') : translateUi('Chọn khóa học')}
        </button>
      </div>
    </> : <p className="cp-standard__empty">{positionsLoading ? translateUi('Đang tải vị trí…') : 'Tạo vị trí công việc trong phòng ban để đặt chuẩn.'}</p>}
  </section>;
}
