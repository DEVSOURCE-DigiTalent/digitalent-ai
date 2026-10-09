import { V2_STATS } from '../data/v2-data';
import { Award, CheckCircle, BarChart3, Users } from 'lucide-react';

export function V2StatsSection() {
  const statIcons = [BarChart3, Award, Users, CheckCircle];

  return (
    <section className="py-14 sm:py-16 bg-[#152238] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#D96B43]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#537565]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {V2_STATS.map((stat, idx) => {
            const Icon = statIcons[idx % statIcons.length];
            return (
              <div
                key={idx}
                className={`pt-6 lg:pt-0 ${idx !== 0 ? 'lg:pl-8' : ''} text-center lg:text-left flex flex-col items-center lg:items-start`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#F3D5C0] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FAF7F2] tracking-tight mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base font-bold text-[#F3D5C0] mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[#95A5B8] leading-relaxed max-w-[200px]">
                  {stat.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
