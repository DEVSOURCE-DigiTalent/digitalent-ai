import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Clock, GraduationCap, Hourglass, Mic, Monitor, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { PULSE_PATHS } from '@/features/pulse-employee/lib/paths';
import type { PulseOverview } from '@/services/pulse.service';
import type { MyTrialAssessment } from '@/services/trial-program.service';
import { TIER_LABELS, formatWhen } from '../lib/trial-format';
import { TrialEmployeeResults } from './TrialEmployeeResults';
import '../trial-test.css';

const TT02_DOMAINS_SUMMARY = [
  { num: 1, name: 'Khai thác dữ liệu và thông tin', desc: 'Tìm kiếm, đánh giá và quản lý dữ liệu số an toàn' },
  { num: 2, name: 'Giao tiếp và hợp tác số', desc: 'Tương tác, chia sẻ và làm việc nhóm qua công cụ số' },
  { num: 3, name: 'Sáng tạo nội dung số', desc: 'Xây dựng, biên tập tài liệu, media và tuân thủ bản quyền' },
  { num: 4, name: 'An toàn & Bảo mật', desc: 'Bảo vệ thiết bị, dữ liệu cá nhân và an toàn trên không gian mạng' },
  { num: 5, name: 'Giải quyết vấn đề', desc: 'Ứng dụng công nghệ xử lý sự cố kỹ thuật và tối ưu công việc' },
  { num: 6, name: 'Ứng dụng Trí tuệ nhân tạo (AI)', desc: 'Sử dụng AI tạo sinh, prompt engineering và tuân thủ đạo đức AI' },
];

/* ── DOMAIN ACCORDION ITEM ───────────────────────────────────────────────── */

type EmployeeSurveyProps = {
  data: MyTrialAssessment;
  overview?: PulseOverview;
  refresh: () => void;
  refreshing: boolean;
};

function WaitingWorkbench({ data, refresh, refreshing }: EmployeeSurveyProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Hero Card: Trạng thái tiếp nhận & Quy trình 3 bước */}
      <section className="tt-waiting-hero">
        <div className="tt-waiting-header-row">
          <div className="tt-waiting-status-lead">
            <div className="tt-waiting-icon-pulse">
              <Hourglass size={22} />
            </div>
            <div>
              <h2 className="tt-waiting-title">Đã nộp bài đánh giá năng lực số</h2>
              <p className="tt-waiting-meta">
                Tiếp nhận lúc <strong>{formatWhen(data.submittedAt)}</strong>. Dữ liệu bài làm đã được lưu trữ an toàn.
              </p>
            </div>
          </div>
          <span className="tt-badge tt-badge--amber" style={{ padding: '6px 14px', fontSize: 12.5, fontWeight: 700 }}>
            <Clock size={14} /> Đang xử lý
          </span>
        </div>

        {/* Quy trình tiến độ 3 chặng chuẩn hóa */}
        <div className="tt-workflow-tracker">
          <div className="tt-workflow-step tt-step--done">
            <div className="tt-step-num">✓</div>
            <div className="tt-step-text">
              <span className="tt-step-title">1. Nộp bài trắc nghiệm</span>
              <span className="tt-step-sub">{data.submittedAt ? formatWhen(data.submittedAt) : 'Đã hoàn thành'}</span>
            </div>
          </div>

          <div className="tt-workflow-step tt-step--done">
            <div className="tt-step-num">✓</div>
            <div className="tt-step-text">
              <span className="tt-step-title">2. Tiếp nhận bài làm</span>
              <span className="tt-step-sub">Hệ thống đang tổng hợp kết quả</span>
            </div>
          </div>

          <div className="tt-workflow-step tt-step--active">
            <div className="tt-step-num">
              <Clock size={13} />
            </div>
            <div className="tt-step-text">
              <span className="tt-step-title">3. Công bố kết quả</span>
              <span className="tt-step-sub">Xem kết quả khảo sát</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Grid 2 Khối cân đối: 6 Lĩnh vực & Tóm tắt các bước tiếp theo */}
      <section className="tt-bento-grid">
        {/* Khối 1: 6 Lĩnh vực khảo sát */}
        <div className="tt-bento-card">
          <div className="tt-bento-card-top">
            <div className="tt-bento-card-icon tt-bento-card-icon--teal">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="tt-bento-card-title">6 Lĩnh vực năng lực số đã làm</h3>
              <p className="tt-bento-card-desc">Khung đánh giá năng lực số chuẩn hóa</p>
            </div>
          </div>

          <div className="tt-domains-preview-grid">
            {TT02_DOMAINS_SUMMARY.map((dom) => (
              <div key={dom.num} className="tt-domain-chip" title={dom.desc}>
                <span className="tt-domain-chip-num">{dom.num}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dom.name}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 'auto', background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Zap size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
            <span>
              Kết quả cho biết mức năng lực hiện tại theo từng lĩnh vực.
            </span>
          </div>
        </div>

        {/* Khối 2: Tóm tắt các bước tiếp theo */}
        <div className="tt-bento-card">
          <div className="tt-bento-card-top">
            <div className="tt-bento-card-icon tt-bento-card-icon--purple">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="tt-bento-card-title">Các bước tiếp theo</h3>
              <p className="tt-bento-card-desc">Tóm tắt tiến trình sau khi nộp</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: '#334155', lineHeight: 1.55 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', marginTop: 8, flexShrink: 0 }} />
              <div>
                <strong>Kết quả khảo sát:</strong> Hệ thống chấm trắc nghiệm và ghi nhận mức đạt theo lĩnh vực.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: '#334155', lineHeight: 1.55 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginTop: 8, flexShrink: 0 }} />
              <div>
                <strong>Lộ trình học tập:</strong> Các khóa học phù hợp sẽ hiển thị khi doanh nghiệp thiết lập khung năng lực.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: 10 }}>
            <button
              type="button"
              onClick={refresh}
              className="tt-btn-primary"
              disabled={refreshing}
              style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Đang làm mới...' : 'Làm mới trạng thái'}
            </button>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
              Bạn có thể quay lại trang này để xem kết quả.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function NotStartedIntro({ data }: { data: MyTrialAssessment }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section className="tt-intro-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="pu-path-badge-pill">
            <GraduationCap size={13} className="text-blue-700" />
            <span>Khảo sát năng lực số đầu vào</span>
          </div>
          <h2 className="tt-intro-card-title">
            Đánh giá 6 lĩnh vực năng lực số đầu vào
          </h2>
          <p className="tt-intro-card-desc">
            Bài khảo sát xác định mức năng lực hiện tại theo từng lĩnh vực.
          </p>
        </div>

        {/* 3 Cấp độ bài thi */}
        <div className="tt-tier-grid">
          {[1, 2, 3].map((tier) => (
            <div key={tier} className="tt-tier-card">
              <span className="tt-tier-tag">Phần {tier}</span>
              <span className="tt-tier-name">{TIER_LABELS[tier]}</span>
              <span className="tt-tier-meta">
                {data.choiceCount > 0 && data.choiceCount % 3 === 0 ? data.choiceCount / 3 + ' câu trắc nghiệm' : 'Trắc nghiệm'}
              </span>
            </div>
          ))}
        </div>

        {/* Pre-flight checklist */}
        <div className="tt-preflight-box">
          <div className="tt-preflight-items">
            <div className="tt-preflight-item">
              <Monitor size={16} style={{ color: '#3448cf' }} /> Toàn màn hình
            </div>
            <div className="tt-preflight-item">
              <Camera size={16} style={{ color: '#3448cf' }} /> Camera
            </div>
            <div className="tt-preflight-item">
              <Mic size={16} style={{ color: '#3448cf' }} /> Micro
            </div>
            <div className="tt-preflight-item">
              <Clock size={16} style={{ color: '#3448cf' }} /> Thực hiện 1 lần
            </div>
          </div>

          {data.canStart ? (
            <Link to={PULSE_PATHS.trialExam} className="tt-btn-primary">
              Vào phòng thi có giám sát <ArrowRight size={15} />
            </Link>
          ) : (
            <span className="tt-badge tt-badge--amber">{data.closedMessage || 'Chưa mở phòng thi'}</span>
          )}
        </div>
      </section>
    </div>
  );
}

export function TrialEmployeeSurvey({ data, overview, refresh, refreshing }: EmployeeSurveyProps) {
  return (
    <div className="tt-container">
      <header className="tt-head">
        <div className="pu-path-title-block">
          <div className="pu-path-badge-pill">
            <Sparkles size={13} className="text-blue-700" />
            <span>{data.organizationName} · Chương trình dùng thử</span>
          </div>
          <h1 className="pu-path-main-title">
            {data.status === 'REVIEWED' ? 'Kết quả khảo sát của tôi' : 'Khảo sát Năng lực Số Đầu vào'}
          </h1>
          <p className="pu-path-sub-title">
            {data.status === 'REVIEWED'
              ? 'Kết quả đánh giá năng lực số theo từng lĩnh vực.'
              : 'Hệ thống chuẩn hóa và phát triển khung năng lực số chuyên môn doanh nghiệp.'}
          </p>
        </div>

        {data.testDeadline && data.status === 'NOT_STARTED' && (
          <span className="tt-badge tt-badge--amber" style={{ padding: '6px 14px', fontSize: 13 }}>
            <Clock size={14} /> Hạn chót: {formatWhen(data.testDeadline)}
          </span>
        )}
      </header>
      {data.status === 'NOT_STARTED' && <NotStartedIntro data={data} />}
      {data.status === 'SUBMITTED' && <WaitingWorkbench data={data} refresh={refresh} refreshing={refreshing} />}
      {data.status === 'REVIEWED' && data.levels && <TrialEmployeeResults assessment={data} overview={overview} />}
    </div>
  );
}
