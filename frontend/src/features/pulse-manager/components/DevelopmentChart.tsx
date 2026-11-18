import { useId, useState } from 'react';
import { BrainCircuit, Database, Lightbulb, MessagesSquare, Palette, ShieldCheck } from 'lucide-react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SectionLoading } from '@/components/shared/LoadingState';
import { LoadError } from '@/features/pulse-employee/components/ui';
import { useWorkforceDevelopment } from '@/hooks/use-workforce';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import type { WorkforceDevelopmentLevelCounts, WorkforceDevelopmentScope } from '@/services/workforce.service';
import './development-chart.css';

const LEVELS = ['Chưa đạt', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
const DISTRIBUTION = [
  { key: 'belowBasic', label: LEVELS[0] },
  { key: 'basic', label: LEVELS[1] },
  { key: 'intermediate', label: LEVELS[2] },
  { key: 'advanced', label: LEVELS[3] },
  { key: 'noData', label: 'Chưa có dữ liệu' },
] as const;
const DOMAIN_TABS = {
  D1: { label: 'Dữ liệu', icon: Database },
  D2: { label: 'Giao tiếp', icon: MessagesSquare },
  D3: { label: 'Sáng tạo nội dung', icon: Palette },
  D4: { label: 'An toàn', icon: ShieldCheck },
  D5: { label: 'Giải quyết vấn đề', icon: Lightbulb },
  D6: { label: 'Ứng dụng AI', icon: BrainCircuit },
} as const;

const SERIES = [
  { key: 'baseline', color: 'var(--development-baseline)', dash: '3 4', width: 2.5, radius: 3, label: 'Đầu vào' },
  { key: 'current', color: 'var(--development-current)', dash: undefined, width: 5, radius: 5, label: 'Hiện tại' },
  { key: 'target', color: 'var(--development-target)', dash: '9 5', width: 3.5, radius: 4, label: 'Mức áp dụng phòng ban' },
] as const;
const PLOT_ORDER = ['current', 'target', 'baseline'] as const;
type SeriesKey = typeof SERIES[number]['key'];

const domainCode = (code: string) => code.replace('TT02_', '');
const domainTab = (code: string) => DOMAIN_TABS[domainCode(code) as keyof typeof DOMAIN_TABS];
function describeLevel(value: number | null, key: SeriesKey = 'current') {
  if (value == null) return translateUi('Chưa có dữ liệu');
  if (key === 'target' && value === 0) return translateUi('Không áp dụng');
  const level = LEVELS[value];
  if (level) return translateUi(level);

  const lower = LEVELS[Math.floor(value)];
  const higher = LEVELS[Math.ceil(value)];
  return lower && higher
    ? `${translateUi(lower)} – ${translateUi(higher)}`
    : translateUi('Mức trung bình');
}

function LevelDistribution({ counts, format }: {
  counts: WorkforceDevelopmentLevelCounts;
  format: Intl.NumberFormat;
}) {
  return (
    <div className="manager-development__distribution">
      <p>{translateUi('Số người theo mức hiện tại')}</p>
      <div className="manager-development__distribution-bar" aria-hidden="true">
        {DISTRIBUTION.map(({ key }) => counts[key] > 0 && (
          <span key={key} data-level={key} style={{ flexGrow: counts[key] }} />
        ))}
      </div>
      <dl>
        {DISTRIBUTION.map(({ key, label }) => (
          <div key={key} data-level={key}>
            <dt>{translateUi(label)}</dt>
            <dd>{format.format(counts[key])}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function DevelopmentChart({ scope }: { scope: WorkforceDevelopmentScope }) {
  const locale = useUiLanguage();
  const headingId = useId();
  const rangeId = useId();
  const [selected, setSelected] = useState('');
  const [hidden, setHidden] = useState<SeriesKey[]>([]);
  const query = useWorkforceDevelopment(scope);
  const member = 'employeeId' in scope;
  const series = SERIES.map((item) => item.key === 'target' && member ? { ...item, label: 'Mức cần đạt' } : item);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const domains = query.data?.domains ?? [];
  const active = domains.find((domain) => domain.code === selected) ?? domains[0];
  const count = query.data?.employeeCount ?? 0;
  const showBand = !hidden.includes('current') && !hidden.includes('target');
  const chartData = domains.map((domain) => ({
    ...domain,
    comparison: domain.current == null || domain.target == null ? null : [domain.current, domain.target],
  }));
  const difference = active?.target == null || active.current == null
    ? null
    : Math.round((active.target - active.current) * 100) / 100;

  function toggleSeries(key: SeriesKey) {
    setHidden((previous) => previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]);
  }

  return (
    <section className="manager-development" aria-labelledby={headingId}>
      <header>
        <h2 id={headingId}>{translateUi(member ? 'Năng lực qua sáu lĩnh vực' : 'Năng lực số của phòng ban')}</h2>
        {!member && query.isSuccess && <span className="manager-development__headcount"><strong>{format.format(count)}</strong> {translateUi('nhân viên đang làm việc')}</span>}
      </header>
      {query.isLoading ? <SectionLoading label="Đang tải năng lực…" />
        : query.isError ? <LoadError message="Không tải được dữ liệu năng lực." onRetry={query.refetch} />
        : !active ? <p>{translateUi('Chưa có dữ liệu lĩnh vực năng lực.')}</p>
        : <>
          <div className="manager-development__plot">
            <div className="manager-development__legend" role="group" aria-label={translateUi('Hiện hoặc ẩn đường biểu đồ')}>
              {series.map(({ key, color, dash, label }) => (
                <button key={key} type="button" aria-pressed={!hidden.includes(key)}
                  disabled={hidden.length === series.length - 1 && !hidden.includes(key)}
                  onClick={() => toggleSeries(key)}>
                  <span aria-hidden="true" style={{ borderColor: color, borderTopStyle: dash ? 'dashed' : 'solid' }} />
                  {translateUi(label)}
                </button>
              ))}
              {showBand && <span className="manager-development__band-key">{translateUi('Chênh lệch với mục tiêu')}</span>}
            </div>
            <div className="manager-development__canvas">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height: 275 }}>
                <ComposedChart data={chartData} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}
                  onClick={({ activeLabel }) => {
                    if (typeof activeLabel === 'string' && domains.some(({ code }) => code === activeLabel)) setSelected(activeLabel);
                  }}>
                  <defs>
                    <linearGradient id={rangeId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--development-band)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--development-band)" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--po-line)" strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="code" tickFormatter={domainCode} tick={{ fill: 'var(--po-ink)', fontSize: 13, fontWeight: 600 }}
                    tickLine={false} axisLine={false} tickMargin={9} padding={{ left: 12, right: 6 }} />
                  <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} width={113} tickLine={false} axisLine={false}
                    tickMargin={8} tickFormatter={(value: number) => describeLevel(value)}
                    tick={{ fill: 'var(--po-ink)', fontSize: 12, fontWeight: 550 }} />
                  {showBand && <Area type="monotone" dataKey="comparison" stroke="none" fill={`url(#${rangeId})`}
                    tooltipType="none" connectNulls={false} activeDot={false} isAnimationActive={false} />}
                  <ReferenceLine x={active.code} stroke="var(--development-current)" strokeOpacity={0.55} strokeDasharray="3 5" />
                  <Tooltip cursor={{ stroke: 'var(--development-current)', strokeWidth: 2, strokeOpacity: 0.5 }}
                    content={({ active: isHovered, label }) => {
                      const hovered = isHovered && domains.find(({ code }) => code === label);
                      if (!hovered) return null;
                      return (
                        <div className="manager-development__tooltip" role="tooltip">
                          <strong>{translateUi(hovered.name)}</strong>
                          <dl className="manager-development__tooltip-levels">
                            {series.filter(({ key }) => !hidden.includes(key)).map(({ key, label: name, color }) => (
                              <div key={key}>
                                <dt><span aria-hidden="true" style={{ background: color }} />{translateUi(name)}</dt>
                                <dd>{describeLevel(hovered[key], key)}</dd>
                              </div>
                            ))}
                          </dl>
                          {!member && hovered.currentLevels && <LevelDistribution counts={hovered.currentLevels} format={format} />}
                        </div>
                      );
                    }} />
                  {PLOT_ORDER.map((key) => {
                    const item = series.find((definition) => definition.key === key)!;
                    return <Line key={key} type="monotone" dataKey={key} name={translateUi(item.label)} hide={hidden.includes(key)}
                      stroke={item.color} strokeWidth={item.width} strokeDasharray={item.dash}
                      dot={{ r: item.radius, fill: 'var(--po-surface)', strokeWidth: 2 }}
                      activeDot={{ r: item.radius + 2, fill: item.color, stroke: item.color, strokeWidth: 5, strokeOpacity: 0.28 }}
                      connectNulls={false} isAnimationActive={false} />;
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="manager-development__domains" role="group" aria-label={translateUi('Chọn lĩnh vực để xem chi tiết')}>
            {domains.map(({ code, name }) => {
              const tab = domainTab(code);
              const Icon = tab?.icon;
              return (
                <button key={code} type="button" aria-pressed={code === active.code} aria-label={translateUi(name)}
                  aria-controls={`${headingId}-domain`} onClick={() => setSelected(code)}>
                  <span className="manager-development__domain-icon" aria-hidden="true">{Icon && <Icon size={15} />}</span>
                  <span><small>{domainCode(code)}</small><strong>{translateUi(tab?.label ?? name)}</strong></span>
                </button>
              );
            })}
          </div>

          <div id={`${headingId}-domain`} className="manager-development__detail" aria-live="polite">
            <div className="manager-development__summary" key={active.code}>
              <div className="manager-development__summary-title">
                <h3>{translateUi(active.name)}</h3>
              </div>
              <dl>
                {series.map(({ key, label, color }) => (
                  <div key={key}>
                    <dt><span aria-hidden="true" style={{ background: color }} />{translateUi(label)}</dt>
                    <dd><strong>{describeLevel(active[key], key)}</strong>
                      {!member && key !== 'target' && <small>
                        {format.format(key === 'baseline' ? active.baselineCount : active.currentCount)}/{format.format(count)} {translateUi('có dữ liệu')}
                      </small>}
                    </dd>
                  </div>
                ))}
              </dl>
              {difference != null && <div className="manager-development__comparison" data-gap={difference > 0}>
                <span>{translateUi(difference > 0 ? 'Còn thiếu' : difference < 0 ? 'Vượt mục tiêu' : 'Đạt mục tiêu')}</span>
              </div>}
            </div>
            {!member && active.currentLevels && <LevelDistribution key={active.code + '-distribution'} counts={active.currentLevels} format={format} />}
          </div>
        </>}
    </section>
  );
}
