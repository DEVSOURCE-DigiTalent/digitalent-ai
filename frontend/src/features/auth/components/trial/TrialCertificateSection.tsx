import { Award, CheckCircle2, QrCode, Share2, ShieldCheck, Lock } from 'lucide-react';

export function TrialCertificateSection() {
  return (
    <section id="certificate" className="relative py-20 border-t border-cream/10 bg-[#06141a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5CA65]">
                GIÁ TRỊ BỀN VỮNG
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-cream">
                Chứng chỉ số có <span className="font-landing-serif italic text-cream-soft">mã xác thực vĩnh viễn</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                Hoàn thành bài kiểm tra cuối khóa trong 7 ngày dùng thử đạt từ 75% trở lên để mở khóa chứng chỉ số. Chứng chỉ thuộc sở hữu của bạn và được bảo lưu vĩnh viễn ngay cả khi không tiếp tục đăng ký gói trả phí.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-[#F5CA65]">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-cream">Tra cứu và kiểm định công khai</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Mỗi chứng chỉ đi kèm mã định danh duy nhất và đường dẫn tra cứu công khai cho nhà tuyển dụng hoặc tổ chức.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-400/15 text-teal-300">
                  <Share2 className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-cream">Tích hợp 1-click vào LinkedIn &amp; CV</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Dễ dàng đính kèm vào mục Licenses &amp; Certifications trên hồ sơ LinkedIn với đầy đủ metadata chuẩn hóa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-cream">Không bao giờ bị thu hồi khi hết trial</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Toàn bộ thành quả bạn nỗ lực đạt được trong tuần dùng thử thuộc về bạn, không có ràng buộc thanh toán ẩn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Column: Realistic Mock Certificate */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#0b242c] via-[#081a20] to-[#040e12] p-7 sm:p-9 shadow-2xl shadow-black/80 text-cream">
              {/* Corner decorative accents */}
              <div className="absolute top-3 left-3 size-6 border-t-2 border-l-2 border-amber-400/40 rounded-tl-lg" />
              <div className="absolute top-3 right-3 size-6 border-t-2 border-r-2 border-amber-400/40 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-amber-400/40 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-amber-400/40 rounded-br-lg" />

              {/* Certificate Inner Content */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="size-8 text-[#F5CA65]" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#F5CA65]">
                    DIGITALENT AI ACADEMY
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                    CHỨNG NHẬN HOÀN THÀNH LỘ TRÌNH NĂNG LỰC
                  </p>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-cream">
                    Nguyễn Văn Thử
                  </p>
                  <p className="text-xs text-stone-300">
                    Đã hoàn thành xuất sắc các yêu cầu đánh giá chuẩn đầu ra cho vị trí:
                  </p>
                  <p className="text-sm font-semibold text-amber-300 pt-1">
                    Kỹ sư Trí tuệ nhân tạo (AI Engineer)
                  </p>
                </div>

                {/* Score & Validation Strip */}
                <div className="w-full rounded-2xl bg-white/[0.03] p-3.5 border border-white/5 flex items-center justify-between text-xs">
                  <div className="text-left space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Mã xác thực</span>
                    <span className="font-mono text-xs text-amber-300 font-medium">DT-CERT-2026-8892</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
                    <CheckCircle2 className="size-4" />
                    <span>Điểm đạt: 88/100</span>
                  </div>

                  <div className="grid size-9 place-items-center rounded-lg bg-white/10 text-stone-200">
                    <QrCode className="size-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full pt-2 text-[11px] text-stone-400 border-t border-white/5">
                  <span>Hội đồng Đánh giá DigiTalent AI</span>
                  <span>Thời hạn: Vĩnh viễn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
