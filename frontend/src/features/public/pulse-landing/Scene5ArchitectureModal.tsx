import { useEffect } from 'react';
import {
  X,
  Layers,
  ShieldCheck,
  Target,
  Cpu,
  FileCheck2,
  BarChart3,
  Lock,
  ArrowRight,
  Database,
  Radio,
} from 'lucide-react';

interface Scene5ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Scene5ArchitectureModal({ isOpen, onClose }: Scene5ArchitectureModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="s5-arch-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="s5-arch-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="s5-arch-modal-card">
        {/* Modal Header */}
        <div className="s5-arch-modal-header">
          <div className="s5-arch-modal-badge-group">
            <span className="s5-arch-modal-badge">
              <Layers size={13} aria-hidden="true" />
              <span>SƠ ĐỒ HỆ THỐNG DOANH NGHIỆP</span>
            </span>
            <span className="s5-arch-modal-edition">KIẾN TRÚC LIÊN THÔNG 5 LỚP</span>
          </div>
          <button
            type="button"
            className="s5-arch-modal-close"
            onClick={onClose}
            aria-label="Đóng sơ đồ kiến trúc"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Title & Intro */}
        <div className="s5-arch-modal-title-wrap">
          <h2 id="s5-arch-modal-title" className="s5-arch-modal-title">
            Kiến Trúc Nền Tảng Hệ Thống DigiTalent AI
          </h2>
          <p className="s5-arch-modal-desc">
            Luồng dữ liệu khép kín từ khâu khảo thí đầu vào, bóc tách khoảng trống kỹ năng, cấp phát bài học vi mô đến kiểm định cấp chứng nhận số và báo cáo quản trị tập trung.
          </p>
        </div>

        {/* Architecture Visual Grid (The 5 Interconnected Core Engines) */}
        <div className="s5-arch-flow-container">
          <div className="s5-arch-engines-grid">
            {/* Engine 1 */}
            <div className="s5-arch-engine-box box-sky">
              <div className="s5-arch-box-top">
                <div className="s5-arch-box-icon sky">
                  <ShieldCheck size={18} aria-hidden="true" />
                </div>
                <span className="s5-arch-box-num">01</span>
              </div>
              <h4 className="s5-arch-box-name">Khảo Thí Thích Ứng</h4>
              <p className="s5-arch-box-role">Phân phối đề theo vị trí việc làm và giám sát phiên thi qua camera AI.</p>
              <div className="s5-arch-box-tag">Input: Đề thi thực tế</div>
            </div>

            <div className="s5-arch-flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </div>

            {/* Engine 2 */}
            <div className="s5-arch-engine-box box-emerald">
              <div className="s5-arch-box-top">
                <div className="s5-arch-box-icon emerald">
                  <Target size={18} aria-hidden="true" />
                </div>
                <span className="s5-arch-box-num">02</span>
              </div>
              <h4 className="s5-arch-box-name">Ma Trận Kỹ Năng</h4>
              <p className="s5-arch-box-role">Đối chiếu 6 miền năng lực và định vị khoảng trống cần bù đắp.</p>
              <div className="s5-arch-box-tag">Gap Analysis: 6 Miền</div>
            </div>

            <div className="s5-arch-flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </div>

            {/* Engine 3 */}
            <div className="s5-arch-engine-box box-purple">
              <div className="s5-arch-box-top">
                <div className="s5-arch-box-icon purple">
                  <Cpu size={18} aria-hidden="true" />
                </div>
                <span className="s5-arch-box-num">03</span>
              </div>
              <h4 className="s5-arch-box-name">Đào Tạo Vi Mô</h4>
              <p className="s5-arch-box-role">Miễn trừ phần kiến thức đã vững, chỉ cung cấp trạm học 15 phút bù đắp.</p>
              <div className="s5-arch-box-tag">Micro: 15-25 phút</div>
            </div>

            <div className="s5-arch-flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </div>

            {/* Engine 4 */}
            <div className="s5-arch-engine-box box-amber">
              <div className="s5-arch-box-top">
                <div className="s5-arch-box-icon amber">
                  <FileCheck2 size={18} aria-hidden="true" />
                </div>
                <span className="s5-arch-box-num">04</span>
              </div>
              <h4 className="s5-arch-box-name">Kiểm Định Chứng Nhận</h4>
              <p className="s5-arch-box-role">Đánh giá độc lập đầu ra, ký số chứng nhận điện tử và lưu nhật ký kiểm toán.</p>
              <div className="s5-arch-box-tag">Verify: Mã SHA-256</div>
            </div>

            <div className="s5-arch-flow-arrow" aria-hidden="true">
              <ArrowRight size={16} />
            </div>

            {/* Engine 5 */}
            <div className="s5-arch-engine-box box-blue">
              <div className="s5-arch-box-top">
                <div className="s5-arch-box-icon blue">
                  <BarChart3 size={18} aria-hidden="true" />
                </div>
                <span className="s5-arch-box-num">05</span>
              </div>
              <h4 className="s5-arch-box-name">Chỉ Huy Quản Trị</h4>
              <p className="s5-arch-box-role">Báo cáo trực quan mức độ sẵn sàng công nghệ theo từng khối phòng ban.</p>
              <div className="s5-arch-box-tag">Telemetry: Thời gian thực</div>
            </div>
          </div>

          {/* Underpinning Security & Infrastructure Bus */}
          <div className="s5-arch-infrastructure-bus">
            <div className="s5-arch-bus-item">
              <Lock size={15} className="text-sky" aria-hidden="true" />
              <span>Phân vùng dữ liệu độc lập chuẩn Nghị định 13/2023/NĐ-CP</span>
            </div>
            <div className="s5-arch-bus-item">
              <Database size={15} className="text-emerald" aria-hidden="true" />
              <span>Mã hóa AES-256 và nhật ký kiểm toán bất biến</span>
            </div>
            <div className="s5-arch-bus-item">
              <Radio size={15} className="text-amber" aria-hidden="true" />
              <span>Đồng bộ luồng dữ liệu hai chiều tốc độ cao</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="s5-arch-modal-footer">
          <span className="s5-arch-modal-footnote">
            Kiến trúc hệ thống vận hành theo chu trình khép kín, bảo đảm dữ liệu luôn nhất quán giữa khảo thí và đào tạo.
          </span>
          <button type="button" className="s5-arch-modal-confirm-btn" onClick={onClose}>
            Đóng xem sơ đồ
          </button>
        </div>
      </div>
    </div>
  );
}
