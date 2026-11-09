import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Compass, Sparkles } from 'lucide-react';
import { CapabilityCeilingMatrix } from '../components/CapabilityCeilingMatrix';
import { PositionReferenceMatrix } from '../components/PositionReferenceMatrix';
import { PULSE_TOKENS } from '../owner-theme';
import './owner-setup-blueprint.css';

/** One course matrix for ceilings and position standards. Course cells open the position editor in context. */
export function OwnerSetupBlueprintPage() {
  useUiLanguage();
  const [isReferenceOpen, setIsReferenceOpen] = useState(true);

  return (
    <div
      className="po-owner blueprint-page -m-4 min-h-screen md:-m-6"
      style={{
        ...PULSE_TOKENS,
        background: 'radial-gradient(circle at 88% 2%, rgba(20,184,166,.10), transparent 32%), radial-gradient(circle at 7% 46%, rgba(56,189,248,.07), transparent 34%), #f7fafc',
      }}
    >
      <section className="blueprint-container pt-6 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="blueprint-eyebrow"><Sparkles className="size-3.5" />{translateUi(" KIẾN TRÚC NĂNG LỰC DOANH NGHIỆP")}</div>
            <h1 className="heading-gradient text-2xl font-black tracking-[-0.04em] sm:text-3xl">{translateUi("Khung năng lực số")}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/enterprise/framework" className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-2 text-xs font-bold text-teal-800 shadow-2xs transition-colors hover:bg-teal-50">
              <Compass className="size-3.5 text-teal-600" />{translateUi(" Từ điển 24 Chuẩn TT02 ↗")}</Link>
            <Link to="/enterprise/skill-gap" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50">{translateUi("Xem khoảng trống ")}<ArrowRight className="size-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      <div className="blueprint-container space-y-4 py-5 pb-16">
        <CapabilityCeilingMatrix />

        <section className="blueprint-panel overflow-hidden" aria-labelledby="position-reference-title">
          <h2 id="position-reference-title">
            <button
              type="button"
              onClick={() => setIsReferenceOpen((open) => !open)}
              aria-expanded={isReferenceOpen}
              aria-controls="position-reference-matrix"
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-5 text-left transition-colors hover:bg-teal-50/50 sm:px-6"
            >
              <span className="section-gradient text-lg font-bold tracking-[-0.02em]">{translateUi("Mức tham chiếu theo vị trí")}</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {isReferenceOpen ? translateUi('Thu gọn') : translateUi('Xem chi tiết')}
                <ChevronDown className={`size-4 transition-transform duration-200 ${isReferenceOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
          </h2>
          <div id="position-reference-matrix" hidden={!isReferenceOpen} className="mx-5 mb-5 border-t border-slate-100 pt-4 sm:mx-6">
            {isReferenceOpen && <PositionReferenceMatrix />}
          </div>
        </section>
      </div>
    </div>
  );
}

export default OwnerSetupBlueprintPage;
