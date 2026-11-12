import { memo, useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  Shield,
  Sparkles,
  User,
  Users2,
} from 'lucide-react';
import './Scene7RegistrationCta.css';

export interface Scene7RegistrationCtaProps {
  id?: string;
}

export const Scene7RegistrationCta = memo(function Scene7RegistrationCta({
  id = 'dang-ky',
}: Scene7RegistrationCtaProps) {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [teamSize, setTeamSize] = useState('50-200');
  const [primaryInterest, setPrimaryInterest] = useState('assessment');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video reliably when loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      video.play().catch(() => {});
    };

    video.addEventListener('canplay', handleCanPlay);
    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
      video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!workEmail.trim()) return;

    setIsSubmitted(true);
    setTimeout(() => {
      navigate(
        `/business/try?email=${encodeURIComponent(workEmail.trim())}&company=${encodeURIComponent(
          companyName.trim()
        )}&name=${encodeURIComponent(contactName.trim())}`
      );
    }, 1200);
  };

  return (
    <section id={id} className="scene7-section" aria-label="Khởi tạo phiên trải nghiệm doanh nghiệp">
      {/* Background Video Layer */}
      <div className="scene7-video-backdrop" aria-hidden="true">
        <video
          ref={videoRef}
          className={`scene7-bg-video ${isVideoLoaded ? 'is-ready' : ''}`}
          src="/videos/gemini_generated_video_fb562644.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Top Daylight Scrim blending smoothly from Scene 6 */}
        <div className="scene7-scrim-top" />
        {/* Bottom Dark Scrim blending smoothly into the Footer */}
        <div className="scene7-scrim-bottom" />
        {/* Atmospheric contrast layer for text readability */}
        <div className="scene7-scrim-atmosphere" />
      </div>

      <div className="scene7-container">
        {/* Dual-Wing Composition framing the center mountaintop workspace */}
        <div className="scene7-wings-grid">
          {/* Left Wing: Ghi trực tiếp lên màn hình (Direct Editorial Typography) */}
          <div className="scene7-left-wing">
            <div className="scene7-direct-content">
              <div className="scene7-badge-row">
                <span className="scene7-badge">
                  <Sparkles size={13} className="scene7-badge-icon" />
                  <span>ĐĂNG KÝ TRẢI NGHIỆM</span>
                </span>
                <span className="scene7-edition-tag">B2B ENTERPRISE</span>
              </div>

              <h2 className="scene7-direct-title">
                Khởi Tạo Phiên Trải Nghiệm Doanh Nghiệp
              </h2>

              <p className="scene7-direct-desc">
                Trải nghiệm trực tiếp ma trận đánh giá năng lực số, đối soát kết quả khảo thí và báo cáo thiếu hụt kỹ năng cho tổ chức của bạn.
              </p>

              <div className="scene7-direct-checklist">
                <div className="scene7-direct-check-item">
                  <div className="scene7-check-icon-circle">
                    <CheckCircle2 size={17} className="scene7-check-icon" />
                  </div>
                  <div className="scene7-check-content">
                    <span className="scene7-check-bold">Dùng thử đầy đủ tính năng</span> với dữ liệu mẫu chuẩn hóa
                  </div>
                </div>

                <div className="scene7-direct-check-item">
                  <div className="scene7-check-icon-circle">
                    <CheckCircle2 size={17} className="scene7-check-icon" />
                  </div>
                  <div className="scene7-check-content">
                    <span className="scene7-check-bold">Không yêu cầu thẻ tín dụng</span>, kích hoạt ngay lập tức
                  </div>
                </div>

                <div className="scene7-direct-check-item">
                  <div className="scene7-check-icon-circle">
                    <CheckCircle2 size={17} className="scene7-check-icon" />
                  </div>
                  <div className="scene7-check-content">
                    <span className="scene7-check-bold">Hỗ trợ kỹ thuật</span> và tham vấn chiến lược 1:1
                  </div>
                </div>
              </div>

              {/* Minimal Trust Indicator Badges */}
              <div className="scene7-direct-trust-row">
                <div className="scene7-direct-trust-chip">
                  <Clock size={13} className="scene7-trust-icon" />
                  <span>Kích hoạt 2 phút</span>
                </div>
                <div className="scene7-direct-trust-chip">
                  <Shield size={13} className="scene7-trust-icon" />
                  <span>Bảo mật NĐ 13/2023</span>
                </div>
                <div className="scene7-direct-trust-chip">
                  <Users2 size={13} className="scene7-trust-icon" />
                  <span>50 - 10.000+ nhân sự</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Vista Spacer: Giữ thoáng tầm nhìn bàn làm việc và màn hình DigiTalent AI */}
          <div className="scene7-center-gap" aria-hidden="true" />

          {/* Right Wing: Thẻ Card Trong Suốt (Transparent Frosted Glass Card) */}
          <div className="scene7-right-wing">
            <div className="scene7-frosted-card">
              <div className="scene7-card-glow-edge" aria-hidden="true" />

              <div className="scene7-form-header">
                <div className="scene7-form-title-group">
                  <h3 className="scene7-form-title">Thông tin đăng ký</h3>
                  <p className="scene7-form-subtitle">
                    Khai báo thông tin để nhận quyền truy cập không gian làm việc thử nghiệm
                  </p>
                </div>
                <div className="scene7-status-pill">
                  <span className="scene7-status-glow-dot" />
                  <span className="scene7-status-label">Sẵn sàng kích hoạt</span>
                </div>
              </div>

              {isSubmitted ? (
                <div className="scene7-success-state" role="status" aria-live="polite">
                  <div className="scene7-success-icon-wrap">
                    <Check size={30} />
                  </div>
                  <h4 className="scene7-success-title">Yêu cầu đã được tiếp nhận</h4>
                  <p className="scene7-success-desc">
                    Hệ thống đang chuẩn bị dữ liệu và chuyển tiếp bạn đến không gian trải nghiệm...
                  </p>
                  <div className="scene7-success-progress-bar">
                    <div className="scene7-success-progress-fill" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="scene7-form">
                  <div className="scene7-field">
                    <label htmlFor="scene7-org-name" className="scene7-label">
                      Tên tổ chức / Doanh nghiệp <span className="scene7-required">*</span>
                    </label>
                    <div className="scene7-input-wrapper">
                      <Building2 size={15} className="scene7-input-icon" />
                      <input
                        id="scene7-org-name"
                        type="text"
                        required
                        placeholder="VD: Tập đoàn Công nghệ ABC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="scene7-glass-input has-icon"
                      />
                    </div>
                  </div>

                  <div className="scene7-field">
                    <label htmlFor="scene7-contact-name" className="scene7-label">
                      Họ và tên người liên hệ <span className="scene7-required">*</span>
                    </label>
                    <div className="scene7-input-wrapper">
                      <User size={15} className="scene7-input-icon" />
                      <input
                        id="scene7-contact-name"
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn A"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="scene7-glass-input has-icon"
                      />
                    </div>
                  </div>

                  <div className="scene7-field">
                    <label htmlFor="scene7-work-email" className="scene7-label">
                      Email công việc (Work Email) <span className="scene7-required">*</span>
                    </label>
                    <div className="scene7-input-wrapper">
                      <Mail size={15} className="scene7-input-icon" />
                      <input
                        id="scene7-work-email"
                        type="email"
                        required
                        placeholder="ten@doanhnghiep.com"
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        className="scene7-glass-input has-icon"
                      />
                    </div>
                  </div>

                  <div className="scene7-fields-row">
                    <div className="scene7-field">
                      <label htmlFor="scene7-team-size" className="scene7-label">
                        Quy mô nhân sự
                      </label>
                      <select
                        id="scene7-team-size"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="scene7-glass-select"
                      >
                        <option value="under-50">Dưới 50 nhân sự</option>
                        <option value="50-200">50 - 200 nhân sự</option>
                        <option value="200-500">200 - 500 nhân sự</option>
                        <option value="over-500">Trên 500 nhân sự</option>
                      </select>
                    </div>

                    <div className="scene7-field">
                      <label htmlFor="scene7-interest" className="scene7-label">
                        Nhu cầu trọng tâm
                      </label>
                      <select
                        id="scene7-interest"
                        value={primaryInterest}
                        onChange={(e) => setPrimaryInterest(e.target.value)}
                        className="scene7-glass-select"
                      >
                        <option value="assessment">Khảo thí &amp; Đánh giá</option>
                        <option value="training">Lộ trình đào tạo chuẩn</option>
                        <option value="consulting">Tham vấn chiến lược</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="scene7-submit-btn">
                    <span>Khởi tạo phiên trải nghiệm</span>
                    <ArrowRight size={17} className="scene7-submit-icon" />
                  </button>

                  <div className="scene7-form-footer-note">
                    <Shield size={13} className="scene7-footer-shield" />
                    <span>Cam kết bảo mật thông tin theo tiêu chuẩn doanh nghiệp. Không phát sinh chi phí.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
