import { translateUi, useUiLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { CapabilityCeilingMatrix } from '../components/CapabilityCeilingMatrix';
import { PULSE_TOKENS } from '../owner-theme';
import './owner-setup-blueprint.css';

/** OW-05 · Khung năng lực số: courses the company owns, then the levels each department must reach. */
export function OwnerSetupBlueprintPage() {
  useUiLanguage();

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
            <h1 className="heading-gradient text-2xl font-black tracking-[-0.04em] sm:text-3xl">{translateUi("Khung năng lực số")}</h1>
            <p className="mt-1 text-sm text-slate-600">{translateUi("Xem khóa học doanh nghiệp đã có, rồi đặt mức năng lực cần đạt cho từng phòng ban.")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/enterprise/framework" className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-2 text-xs font-bold text-teal-800 shadow-2xs transition-colors hover:bg-teal-50">
              <Compass className="size-3.5 text-teal-600" />{translateUi(" Từ điển 24 chuẩn TT02")}</Link>
            <Link to="/enterprise/skill-gap" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50">{translateUi("Xem khoảng trống ")}<ArrowRight className="size-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      <div className="blueprint-container space-y-4 py-5 pb-16">
        <CapabilityCeilingMatrix />
      </div>
    </div>
  );
}

export default OwnerSetupBlueprintPage;
