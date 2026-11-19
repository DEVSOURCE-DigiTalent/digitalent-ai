import { useUiLanguage } from '@/lib/i18n';
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
      <div className="blueprint-container space-y-4 pt-6 pb-16">
        <CapabilityCeilingMatrix />
      </div>
    </div>
  );
}

export default OwnerSetupBlueprintPage;
