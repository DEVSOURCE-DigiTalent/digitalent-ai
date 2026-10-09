import { V2_DOMAINS } from '../data/v2-data';
import { Database, Users, FileEdit, ShieldCheck, Cpu, Sparkles, ArrowRight } from 'lucide-react';

export function V2DomainsOverview() {
  const iconMap: Record<string, any> = {
    Database,
    Users,
    FileEdit,
    ShieldCheck,
    Cpu,
    Sparkles,
  };

  return (
    <section id="lo-trinh-ky-nang" className="py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#476757] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            CĂN CỨ THÔNG TƯ 02/2025/TT-BGDĐT
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1D252C]">
            6 Miền Năng Lực Số Cốt Lõi
          </h2>
          <p className="text-base sm:text-lg text-[#5E6A77] mt-3 leading-relaxed">
            Hệ thống khung chuẩn gồm 6 miền, 24 năng lực thành phần, xếp theo 8 bậc để đo lường và thiết kế chương trình học chính xác.
          </p>
        </div>

        {/* 6 Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {V2_DOMAINS.map((domain) => {
            const Icon = iconMap[domain.iconName] || Sparkles;
            return (
              <div
                key={domain.id}
                className="bg-white rounded-3xl p-7 border border-[#EFE4D6] v2-card-shadow v2-card-hover flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: domain.tagColor }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF1E8] text-[#D96B43]">
                      Miền {domain.code} • {domain.competencyCount} năng lực
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1D252C] mb-2 group-hover:text-[#D96B43] transition-colors">
                    {domain.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5E6A77] leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F5EFE6] flex items-center justify-between text-xs font-semibold text-[#537565]">
                  <span>Đánh giá chẩn đoán</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
