import { V2Banner, V2Navbar } from '../components/V2Header';
import { V2Hero } from '../components/V2Hero';
import { V2CorePillars } from '../components/V2CorePillars';
import { V2MethodologySection } from '../components/V2MethodologySection';
import { V2DomainsOverview } from '../components/V2DomainsOverview';
import { V2CareerRolesSection } from '../components/V2CareerRolesSection';
import { V2CompetencyGrid } from '../components/V2CompetencyGrid';
import { V2StatsSection } from '../components/V2StatsSection';
import { V2MentorsSection, V2CtaFinale, V2Footer } from '../components/V2ClosingSections';
import '../theme/v2-theme.css';

export function V2LandingPage() {
  return (
    <div className="v2-theme min-h-screen flex flex-col font-sans antialiased text-[#1D252C] bg-[#FAF7F2] selection:bg-[#F3D5C0] selection:text-[#963C1E]">
      <V2Banner />
      <V2Navbar />
      
      <main className="flex-1">
        <V2Hero />
        <V2CorePillars />
        <V2MethodologySection />
        <V2DomainsOverview />
        <V2CareerRolesSection />
        <V2CompetencyGrid />
        <V2StatsSection />
        <V2MentorsSection />
        <V2CtaFinale />
      </main>

      <V2Footer />
    </div>
  );
}
export default V2LandingPage;
