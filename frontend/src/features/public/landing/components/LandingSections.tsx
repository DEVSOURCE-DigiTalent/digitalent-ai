import type { LandingSectionConfig } from '../landing-content';
import { AboutSection } from './AboutSection';
import { BridgeSection } from './BridgeSection';
import { CareerExplorerSection } from './CareerExplorerSection';
import { DeploymentSection } from './DeploymentSection';
import { EnterprisePricingSection } from './EnterprisePricingSection';
import { EvidenceSection } from './EvidenceSection';
import { FeaturesSection } from './FeaturesSection';
import { FaqSection } from './FaqSection';
import { FinaleSection } from './FinaleSection';
import { LearningPreviewSection } from './LearningPreviewSection';
import { PillarsSection } from './PillarsSection';
import { PricingPreviewSection } from './PricingPreviewSection';
import { ProcessSection } from './ProcessSection';
import { ProgressSection } from './ProgressSection';
import { RolesSection } from './RolesSection';
import { SkillPathSection } from './SkillPathSection';
import { TeamGapSection } from './TeamGapSection';
import { WorkflowSection } from './WorkflowSection';

/** Renders the sections a product lists, in order. Adding a section kind means adding one case here. */
export function LandingSections({ sections }: { sections: LandingSectionConfig[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.kind) {
          case 'about':
            return <AboutSection key={section.kind} />;
          case 'features':
            return <FeaturesSection key={section.kind} />;
          case 'finale':
            return <FinaleSection key={section.kind} />;
          case 'careers':
            return <CareerExplorerSection key={section.kind} section={section} />;
          case 'process':
            return <ProcessSection key={section.kind} section={section} />;
          case 'skill-path':
            return <SkillPathSection key={section.kind} section={section} />;
          case 'progress':
            return <ProgressSection key={section.kind} section={section} />;
          case 'learning-preview':
            return <LearningPreviewSection key={section.kind} section={section} />;
          case 'pricing':
            return section.audience === 'enterprise' ? (
              <EnterprisePricingSection key={section.kind} section={section} />
            ) : (
              <PricingPreviewSection key={section.kind} section={section} />
            );
          case 'faq':
            return <FaqSection key={section.kind} section={section} />;
          case 'bridge':
            return <BridgeSection key={section.kind} section={section} />;
          case 'pillars':
            return <PillarsSection key={section.kind} section={section} />;
          case 'workflow':
            return <WorkflowSection key={section.kind} section={section} />;
          case 'team-gap':
            return <TeamGapSection key={section.kind} section={section} />;
          case 'evidence':
            return <EvidenceSection key={section.kind} section={section} />;
          case 'roles':
            return <RolesSection key={section.kind} section={section} />;
          case 'deployment':
            return <DeploymentSection key={section.kind} section={section} />;
        }
      })}
    </>
  );
}
