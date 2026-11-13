import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, Network } from 'lucide-react';
import { OwnerBusinessMap } from './OwnerBusinessMap';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { OwnerAssessmentHeatmap } from './OwnerAssessmentHeatmap';
import './owner-progress-tabs.css';

const tabs = [
  { id: 'assessment', label: 'Tiến độ đánh giá', Icon: ClipboardList },
  { id: 'learning', label: 'Bản đồ doanh nghiệp', Icon: Network },
] as const;
type TabId = typeof tabs[number]['id'];

export function OwnerProgressTabs() {
  useUiLanguage();
  const [active, setActive] = useState<TabId>('assessment');
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const swipeStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const next = active === 'assessment' ? tabs[1] : tabs[0];

  function handleKeys(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : next;
    setActive(target.id);
    buttons.current[tabs.indexOf(target)]?.focus();
  }

  function startSwipe(event: PointerEvent<HTMLElement>) {
    swipeStart.current = null;
    if (!event.isPrimary || event.button !== 0 || !(event.target instanceof Element)) return;
    if (event.target.closest('a, button, input, select, textarea, label, [role="combobox"]')) return;
    const table = event.target.closest('.owner-heatmap__scroll');
    if (table && table.scrollWidth > table.clientWidth) return;
    swipeStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function finishSwipe(event: PointerEvent<HTMLElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) < 65 || Math.abs(x) < Math.abs(y) * 1.5) return;
    setActive(x < 0 ? 'learning' : 'assessment');
  }

  return (
    <div className="owner-progress">
      <div className="owner-progress__nav">
        <div role="tablist" aria-label={translateUi('Theo dõi đội ngũ')} onKeyDown={handleKeys}>
          {tabs.map(({ id, label, Icon }, index) => (
            <button key={id} ref={(node) => { buttons.current[index] = node; }} type="button" role="tab"
              id={`owner-progress-tab-${id}`} aria-controls={`owner-progress-panel-${id}`}
              aria-selected={active === id} tabIndex={active === id ? 0 : -1} onClick={() => setActive(id)}>
              <Icon size={17} aria-hidden="true" />{translateUi(label)}
            </button>
          ))}
        </div>
        <button className="owner-progress__switch" type="button" aria-label={translateUi(next.label)} onClick={() => setActive(next.id)}>
          {active === 'assessment' ? <ChevronRight size={20} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
        </button>
      </div>
      <div className="owner-progress__panels" onPointerDown={startSwipe} onPointerUp={finishSwipe}
        onPointerLeave={() => { swipeStart.current = null; }}
        onPointerCancel={() => { swipeStart.current = null; }}>
        <div role="tabpanel" id="owner-progress-panel-assessment" aria-labelledby="owner-progress-tab-assessment" hidden={active !== 'assessment'}>
          <OwnerAssessmentHeatmap />
        </div>
        <div role="tabpanel" id="owner-progress-panel-learning" aria-labelledby="owner-progress-tab-learning" hidden={active !== 'learning'}>
          {active === 'learning' && <OwnerBusinessMap />}
        </div>
      </div>
    </div>
  );
}
