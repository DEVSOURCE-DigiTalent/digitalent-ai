import type { TrialGapResultDto, TrialLearningPathDto } from '@/services/enterprise-trial.service';
import { StateBadge } from './trial-ui';

export function TrialResultDetails({ result }: { result: TrialGapResultDto }) {
  return <section className="space-y-3" aria-label="Kết quả theo yêu cầu vị trí"><p className="text-sm text-ent-fg-2">Chuẩn {result.requirementVersion} · rubric {result.rubricVersion} · phép tính {result.calculationVersion} · {new Date(result.measuredAt).toLocaleString('vi-VN')}</p>{result.items.map(item => <article key={item.competencyId} className="space-y-2 rounded-xl border border-ent-line p-4"><h3 className="font-medium">{item.name}</h3><StateBadge state={item.classification} /><p className="text-sm">Yêu cầu: {item.requiredLevel} · Hiện tại: {item.currentLevel ?? 'Chưa đo đủ'} · Chênh lệch: {item.gapSteps ?? 'Chưa xác định'}</p><p className="text-sm text-ent-fg-2">{item.basis}</p></article>)}</section>;
}
export function TrialPathSummary({ path }: { path: TrialLearningPathDto }) {
  return <section className="space-y-3" aria-label="Lộ trình được lưu"><StateBadge state={path.state} />{path.missingContentReasons.map(reason => <p key={reason} className="text-sm">{reason}</p>)}{path.items.map(item => <article key={item.id} className="rounded-xl border border-ent-line p-4"><h3 className="font-medium">{item.title}</h3><p className="text-sm">{item.version} · {item.progressPercent}%</p><StateBadge state={item.status} /><p className="mt-2 text-sm">{item.reasons.join(' · ')}</p>{item.prerequisites.length > 0 && <p className="text-sm">Tiên quyết: {item.prerequisites.join(' · ')}</p>}</article>)}</section>;
}
