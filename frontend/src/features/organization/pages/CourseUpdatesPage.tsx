import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, History, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { PERMISSIONS, usePermission } from '@/hooks/use-permission';
import { Modal, PageHeader } from '@/components/shared';
import { ChangeSizeChoice } from '@/components/shared/ChangeSizeChoice';
import { GraceDaysChoice } from '@/components/shared/GraceDaysChoice';
import { DEFAULT_GRACE_DAYS, switchDay, type GraceDays } from '@/lib/grace-days';
import { PageLoading } from '@/components/shared/LoadingState';
import { useApplyCourseUpdate, useCourseUpdates, useKeepCourseVersion } from '@/hooks/use-course-updates';
import { organizationErrorMessage } from '@/lib/organization-errors';
import { INPUT_CLASS, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/features/onboarding/components/styles';
import type { CourseUpdateCourse, CourseUpdates } from '@/services/course-update.service';
import { levelName } from '../components/course-tree';

const MIN_REASON = 10;

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

/**
 * OW-COURSE-UPDATES "Cập nhật khóa học": a course version DigiTalent published reaches the company's employees only
 * when it is applied. The company's R&D decides when it has one (the owner only reads), the owner otherwise.
 */
export function CourseUpdatesPage() {
  useUiLanguage();
  const { data, isLoading, isError } = useCourseUpdates();
  const { can } = usePermission();
  const [confirming, setConfirming] = useState(false);
  const [keeping, setKeeping] = useState(false);
  // R&D has no access to the owner's course page: its way back is its own workspace.
  const back = can(PERMISSIONS.COURSE_READ_CATALOG)
    ? { to: '/enterprise/courses', label: 'Khóa học' }
    : { to: '/enterprise/rnd/courses', label: 'Tùy chỉnh khóa học' };

  if (isLoading) return <PageLoading label={translateUi('Đang tải bản cập nhật khóa học')} variant="detail" />;
  if (isError || !data) {
    return <p role="alert" className="text-sm text-ent-bad">{translateUi('Không tải được bản cập nhật khóa học.')}</p>;
  }

  const pending = data.status !== 'UP_TO_DATE';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to={back.to} className="inline-flex items-center gap-1.5 text-sm text-ent-fg-2 hover:text-ent-fg">
        <ArrowLeft className="size-4" aria-hidden="true" />{translateUi(back.label)}
      </Link>

      <PageHeader
        title={translateUi('Cập nhật khóa học')}
        subtitle={translateUi('Bản DigiTalent mới công bố chỉ đến với nhân viên khi doanh nghiệp áp dụng.')}
      />

      {pending && !data.canDecide && (
        <p className="flex items-start gap-2 rounded-xl border border-ent-line bg-ent-raised px-3 py-2.5 text-sm text-ent-fg-2" role="note">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {data.decidedBy === 'RND'
            ? translateUi('Công ty đã có R&D: R&D xem và quyết định áp dụng hay giữ bản đang dùng. Bạn xem được, không cần thao tác.')
            : translateUi('Tính năng R&D đang tắt nên chủ doanh nghiệp quyết định bản cập nhật này.')}
        </p>
      )}

      {!pending ? <UpToDate data={data} /> : (
        <>
          <section className="rounded-2xl border border-ent-line bg-ent-card p-5 md:p-6" aria-labelledby="cu-offer">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-ent-accent/10 px-2.5 py-1 text-xs font-semibold text-ent-accent">
                  <Sparkles className="size-3.5" aria-hidden="true" />{translateUi(`Bản mới v${data.latestVersionNo}`)}
                </p>
                <h2 id="cu-offer" className="mt-3 text-lg font-semibold text-ent-fg">
                  {translateUi(`${data.courses.length} khóa thay đổi so với bản công ty đang dùng (v${data.currentVersionNo})`)}
                </h2>
                {data.latestPublishedAt && (
                  <p className="mt-1 text-sm text-ent-fg-2">{translateUi(`DigiTalent công bố ngày ${formatDate(data.latestPublishedAt)}`)}</p>
                )}
                {data.releaseNote && (
                  <blockquote className="mt-3 border-l-2 border-ent-accent pl-3 text-sm text-ent-fg-2">{data.releaseNote}</blockquote>
                )}
              </div>
              {data.canDecide && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={PRIMARY_BUTTON} onClick={() => setConfirming(true)}>
                    {translateUi(`Áp dụng v${data.latestVersionNo}`)}
                  </button>
                  {data.status === 'AVAILABLE' && (
                    <button type="button" className={SECONDARY_BUTTON} onClick={() => setKeeping(true)}>
                      {translateUi('Giữ bản hiện tại')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {data.kept && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-ent-line bg-ent-raised px-3 py-2.5 text-sm text-ent-fg-2" role="status">
                <History className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {translateUi(`Đang giữ v${data.currentVersionNo}: `)}<span className="text-ent-fg">{data.kept.reason}</span>
                  <span className="text-ent-fg-3">{` · ${[data.kept.keptBy, formatDate(data.kept.keptAt)].filter(Boolean).join(', ')}`}</span>
                  {data.canDecide && (
                    <span className="mt-1 block">{translateUi(`Bấm nhầm hoặc đổi ý? Bấm "Áp dụng v${data.latestVersionNo}" để nhân viên học bản mới.`)}</span>
                  )}
                </span>
              </p>
            )}

            <ul className="mt-5 divide-y divide-ent-line border-y border-ent-line">
              {data.courses.map((course) => <CourseRow key={course.courseId} course={course} />)}
            </ul>

            <p className="mt-4 flex items-start gap-2 text-sm text-ent-fg-2">
              <Users className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {translateUi('Áp dụng xong: mọi người học lại các khóa này từ đầu theo nội dung mới, kể cả người đã đạt. Chứng nhận đã cấp vẫn được giữ.')}
            </p>
          </section>

          {data.canDecide && (
            <>
              <ApplyDialog data={data} open={confirming} onClose={() => setConfirming(false)} />
              <KeepDialog data={data} open={keeping} onClose={() => setKeeping(false)} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function UpToDate({ data }: { data: CourseUpdates }) {
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-ent-line bg-ent-card p-5" role="status">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ent-ok" aria-hidden="true" />
      <div>
        <h2 className="font-semibold text-ent-fg">
          {data.latestVersionNo > 0
            ? translateUi(`Công ty đang dùng bản mới nhất (v${data.latestVersionNo})`)
            : translateUi('Chưa có bản khóa học nào được công bố')}
        </h2>
        <p className="mt-1 text-sm text-ent-fg-2">{translateUi('Khi DigiTalent công bố bản mới, bạn sẽ nhận thông báo và quyết định ở đây.')}</p>
      </div>
    </section>
  );
}

function CourseRow({ course }: { course: CourseUpdateCourse }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-3">
      <div className="min-w-0">
        <p className="font-medium text-ent-fg">{course.title}</p>
        <p className="text-xs text-ent-fg-3">
          {translateUi(levelName(course.level))}
          {!course.owned && <> · {translateUi('Chưa mua: áp dụng để khi mua có sẵn bản mới')}</>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {course.learnersInProgress + course.learnersPassed > 0 && (
          <span className="rounded-full border border-ent-line px-2 py-0.5 text-ent-fg-2">
            {translateUi(`${course.learnersInProgress + course.learnersPassed} người sẽ học lại từ đầu`)}
          </span>
        )}
        {course.companyVersion && (
          <span className="rounded-full border border-ent-warn/40 px-2 py-0.5 font-medium text-ent-warn">
            {translateUi('Đang dùng bản doanh nghiệp')}
          </span>
        )}
        <span className="rounded-full bg-ent-raised px-2 py-0.5 font-medium text-ent-fg-2">
          {translateUi(course.kind === 'ADDED' ? 'Khóa mới' : 'Nội dung mới')}
        </span>
      </div>
    </li>
  );
}

function ApplyDialog({ data, open, onClose }: { data: CourseUpdates; open: boolean; onClose: () => void }) {
  const apply = useApplyCourseUpdate();
  const learning = data.courses.reduce((sum, course) => sum + course.learnersInProgress, 0);
  const passed = data.courses.reduce((sum, course) => sum + course.learnersPassed, 0);
  const companyVersions = data.courses.filter((course) => course.companyVersion).length;
  const [graceDays, setGraceDays] = useState<GraceDays>(DEFAULT_GRACE_DAYS);
  const [majorChange, setMajorChange] = useState(false);
  const submit = async () => {
    try {
      await apply.mutateAsync({ versionNo: data.latestVersionNo, graceDays, majorChange });
      toast.success(learning > 0 && graceDays > 0
        ? translateUi(`Đã áp dụng v${data.latestVersionNo}. Người đang học có tới ${switchDay(graceDays)} để học xong bản cũ.`)
        : translateUi(`Đã áp dụng v${data.latestVersionNo} cho công ty`));
      onClose();
    } catch (error) {
      toast.error(organizationErrorMessage(error, translateUi('Không áp dụng được bản cập nhật')));
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !apply.isPending && onClose()}
      size="sm"
      title={translateUi(`Áp dụng v${data.latestVersionNo} cho cả công ty?`)}
      footer={(
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose} disabled={apply.isPending}>{translateUi('Hủy')}</button>
          <button type="button" className={PRIMARY_BUTTON} onClick={submit} disabled={apply.isPending}>
            {apply.isPending ? <><RefreshCw className="size-4 animate-spin" aria-hidden="true" />{translateUi('Đang áp dụng…')}</> : translateUi('Áp dụng')}
          </button>
        </>
      )}
    >
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-ent-fg-2">
        <li>{translateUi(`${data.courses.length} khóa đổi sang nội dung mới: người bắt đầu học từ giờ học bản mới.`)}</li>
        <li>
          {learning > 0
            ? translateUi(`${learning} người đang học dở: chọn bên dưới họ có bao lâu để học xong bản cũ.`)
            : translateUi('Không ai đang học dở các khóa này.')}
        </li>
        <li>
          {passed === 0 ? translateUi('Chưa ai học xong các khóa này.')
            : majorChange ? translateUi(`${passed} người đã học xong học lại để lấy chứng nhận mới; chứng nhận cũ vẫn giữ.`)
            : translateUi(`${passed} người đã học xong vẫn giữ kết quả.`)}
        </li>
        {companyVersions > 0 && (
          <li>{translateUi(`${companyVersions} khóa đang dùng bản doanh nghiệp sẽ đổi sang nội dung DigiTalent mới; bản doanh nghiệp được giữ làm bản nháp để R&D xem lại.`)}</li>
        )}
      </ul>
      <ChangeSizeChoice major={majorChange} onChange={setMajorChange} disabled={apply.isPending} />
      <GraceDaysChoice value={graceDays} onChange={setGraceDays} disabled={apply.isPending} major={majorChange} />
      <p className="mt-3 text-xs text-ent-fg-2">{translateUi('Mọi nhân viên nhận thông báo về nội dung mới.')}</p>
    </Modal>
  );
}

function KeepDialog({ data, open, onClose }: { data: CourseUpdates; open: boolean; onClose: () => void }) {
  const keep = useKeepCourseVersion();
  const reasonId = useId();
  const [reason, setReason] = useState('');
  const length = reason.trim().length;
  const close = () => {
    if (keep.isPending) return;
    setReason('');
    onClose();
  };
  const submit = async () => {
    try {
      await keep.mutateAsync({ versionNo: data.latestVersionNo, reason: reason.trim() });
      toast.success(translateUi(`Đã giữ v${data.currentVersionNo}. Bạn vẫn áp dụng bản mới được lúc khác.`));
      setReason('');
      onClose();
    } catch (error) {
      toast.error(organizationErrorMessage(error, translateUi('Không lưu được quyết định')));
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title={translateUi(`Giữ v${data.currentVersionNo}, chưa áp dụng v${data.latestVersionNo}?`)}
      description={<p>{translateUi('Nhân viên tiếp tục học bản đang dùng. Lý do được lưu lại để DigiTalent biết vì sao công ty chưa dùng bản mới.')}</p>}
      footer={(
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={close} disabled={keep.isPending}>{translateUi('Hủy')}</button>
          <button type="button" className={PRIMARY_BUTTON} onClick={submit} disabled={keep.isPending || length < MIN_REASON}>
            {keep.isPending ? translateUi('Đang lưu…') : translateUi('Giữ bản hiện tại')}
          </button>
        </>
      )}
    >
      <label htmlFor={reasonId} className="mb-1 block text-sm font-medium text-ent-fg">
        {translateUi('Lý do')} <span className="text-ent-bad" aria-hidden="true">*</span>
      </label>
      <textarea
        id={reasonId}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        maxLength={500}
        placeholder={translateUi('VD: Bản mới đổi ví dụ không hợp ngành của công ty, chờ R&D xem lại.')}
        className={INPUT_CLASS}
        aria-describedby={`${reasonId}-hint`}
        disabled={keep.isPending}
      />
      <p id={`${reasonId}-hint`} className={`mt-1 text-xs ${length > 0 && length < MIN_REASON ? 'text-ent-bad' : 'text-ent-fg-3'}`}>
        {translateUi(`Ít nhất ${MIN_REASON} ký tự (${length}/${MIN_REASON}).`)}
      </p>
    </Modal>
  );
}
