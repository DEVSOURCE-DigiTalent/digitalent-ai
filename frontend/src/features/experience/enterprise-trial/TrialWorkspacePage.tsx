import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCurrentUser } from '@/hooks/use-current-user';
import { enterpriseTrialService as service } from '@/services/enterprise-trial.service';
import { useTrialMutation, useTrialQuery } from './trial-queries';
import { ErrorText, Panel, StateBadge, buttonClass } from './trial-ui';
import { OwnerTrialPanel } from './OwnerTrialPanel';
import { EmployeeTrialPanel } from './EmployeeTrialPanel';
import { TrialResultDetails, TrialPathSummary } from './TrialResultDetails';

function ResultsPanel() {
  const results = useTrialQuery('results', service.results);
  return <Panel title="Kết quả người tham gia"><ErrorText error={results.error} />{results.isPending && <p role="status">Đang tải kết quả…</p>}{results.data?.length === 0 && <EmptyState title="Chưa có kết quả nhóm" description="Kiểm tra lời mời và chờ người tham gia đánh giá." />}{results.data?.map(row => <article key={row.invitationId} className="space-y-4 rounded-xl border border-ent-line p-4"><h3 className="font-semibold">{row.name}</h3><p>{row.role}</p><StateBadge state={row.state} />{row.result ? <TrialResultDetails result={row.result} /> : <p className="text-sm">Chưa có phép đo đã nộp.</p>}{row.path && <TrialPathSummary path={row.path} />}</article>)}</Panel>;
}

export function TrialWorkspacePage() {
  const context = useTrialQuery('context', service.context); const user = useCurrentUser(state => state.user); const [guideOpen, setGuideOpen] = useState(true); const conversion = useTrialMutation(() => service.requestConversion());
  if (context.isPending) return <p role="status">Đang tải không gian trial…</p>;
  if (context.error || !context.data) return <div className="space-y-4"><ErrorText error={context.error || new Error('Không có dữ liệu trial.')} /><button className={buttonClass} onClick={() => void context.refetch()}>Thử tải lại trial</button></div>;
  const value = context.data; const owner = user?.roles.includes('OWNER') === true; const employee = user?.roles.includes('EMPLOYEE') === true && !owner; const reporter = owner || user?.roles.includes('MANAGER') === true;
  const writable = value.status !== 'trial_read_only' && (value.status === 'converted' || Date.now() < Date.parse(value.endsAt));
  return <div className="mx-auto max-w-6xl space-y-6 text-ent-fg"><PageHeader title="Dùng thử doanh nghiệp" description="Không gian của doanh nghiệp bạn · tiếp tục theo trạng thái đã lưu." />
    {value.publicationReadiness.developmentOnly && <p className="rounded-xl border border-ent-warn p-4 text-sm">Development/demo · Dữ liệu minh họa · Chưa sẵn sàng production</p>}
    <Panel title={writable ? 'Đang dùng thử' : 'Chỉ đọc · trial đã hết hạn'}><p className="text-sm">Hạn ghi dữ liệu: {new Date(value.endsAt).toLocaleString('vi-VN')} · Chính sách: {value.policyVersion}</p><p className="text-sm">{value.limits.dataPolicyNotice ?? 'Chính sách dữ liệu chưa được công bố; liên hệ chủ tổ chức.'}</p><p className="text-sm">{value.usage.accounts} tài khoản + {value.usage.pendingInvitations} lời mời đang chờ / {value.limits.maxAccounts} ghế.</p>{!writable && <p className="text-sm">Lịch sử còn xem được. Các thao tác thay đổi đã dừng.</p>}<div className="flex flex-wrap gap-3"><Link className="underline" to="/business/pricing">Xem gói phù hợp</Link>{owner && value.allowedActions.includes('request_conversion') && <button className={buttonClass} disabled={conversion.isPending} onClick={() => conversion.mutate(undefined)}>Trao đổi triển khai</button>}<button className={buttonClass} onClick={() => setGuideOpen(open => !open)} aria-expanded={guideOpen}>{guideOpen ? 'Đóng hướng dẫn' : 'Xem hướng dẫn'}</button><button className={buttonClass} onClick={() => void context.refetch()}>Làm mới trạng thái</button></div><ErrorText error={conversion.error} />{conversion.isSuccess && <p role="status">Đã ghi nhận yêu cầu. Quyền truy cập chỉ thay đổi sau khi nâng cấp được xác nhận.</p>}</Panel>
    {guideOpen && <Panel title="Bốn việc trong vòng thử"><ol className="grid gap-3 sm:grid-cols-2">{value.checklist.map(item => <li key={item.key} className="rounded-xl border border-ent-line p-3 text-sm">{({ position: 'Chọn vị trí', invite: 'Mời người tham gia', assessment: 'Đánh giá & lộ trình', results: 'Xem kết quả' } as Record<string, string>)[item.key] ?? item.key}: {item.complete ? 'Đã xong' : 'Chưa xong'}<p className="mt-1 text-ent-fg-2">Bước tiếp: {item.nextAction}</p></li>)}</ol></Panel>}
    {owner && <OwnerTrialPanel context={value} writable={writable} />}{employee && <EmployeeTrialPanel context={value} writable={writable} />}{reporter && <ResultsPanel />}
    {!employee && !reporter && <p role="alert">Vai trò hiện tại không có màn trial phù hợp.</p>}
    <Panel title="Đánh giá khả năng triển khai"><p className="text-sm">Đã thực hiện: {value.checklist.filter(item => item.complete).length}/{value.checklist.length} việc theo trạng thái đã lưu.</p><p className="text-sm">Chưa thể kết luận cho toàn doanh nghiệp hoặc so sánh trước/sau khi chưa có đủ phép đo.</p><p className="text-sm">Mở rộng cần xác nhận vị trí, học liệu, số ghế, vai trò và tích hợp phù hợp.</p></Panel>
  </div>;
}
