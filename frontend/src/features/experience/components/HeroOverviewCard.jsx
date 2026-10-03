import React from 'react';
import { CheckCircle2, Clock, ArrowRight, Sparkles, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react';
import { POSITION_REQUIREMENTS } from '../data/mockMarketingFlow';

export default function HeroOverviewCard({
  scores = {},
  onContinueStudy,
  personalizedRoadmap,
  completedCourses = {},
  selectedRole = POSITION_REQUIREMENTS,
  diagnosticDone = false,
  onStartDiagnostic
}) {
  const activeRoleObj = selectedRole || POSITION_REQUIREMENTS;
  const competencies = activeRoleObj.competencies || POSITION_REQUIREMENTS.competencies;

  // Build dynamic skill bars matching the selected role
  const skillBars = competencies.map((c) => {
    const val = scores ? (scores[c.id] || 0) : 0;
    const reqNum = c.reqLevelNumber || c.requiredLevelNumber || 6;
    // Calculate percentage threshold: Level 6 -> 75%, Level 4 -> 60%, Level 2 -> 40%
    const reqPercent = reqNum >= 5 ? 75 : reqNum >= 3 ? 60 : 40;
    const isMet = diagnosticDone && (val >= reqPercent);

    return {
      key: c.id,
      name: `${c.id.replace('area_', '')}. ${c.name} ${c.isCore ? '(Trọng tâm)' : ''}`,
      reqLabel: c.reqLevelLabel || c.requiredLabel || `Chuẩn: Level ${reqNum}`,
      value: val,
      isMet,
      reqPercent
    };
  });

  const metCount = skillBars.filter(b => b.isMet).length;
  const needCount = 5 - metCount;
  const hasRemainingAssigned = personalizedRoadmap?.assigned && personalizedRoadmap.assigned.length > 0;

  return (
    <div className="hero-mockup-card animate-fade-in">
      {/* Left side: Job Role & Skill Bars with Position Benchmark Labels */}
      <div className="hero-job-info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span className="label">Vị trí công việc đã chọn</span>
          <span className="badge badge-accent" style={{ fontSize: '11px' }}>
            <Sparkles size={12} /> {activeRoleObj.roleCode} • {activeRoleObj.department}
          </span>
        </div>

        <h1 className="title">
          <span>🚀</span>
          <span>{activeRoleObj.roleTitle}</span>
        </h1>

        {!diagnosticDone ? (
          /* Uncalculated State Notice */
          <div
            style={{
              background: 'var(--surface-bg-page)',
              border: '1.5px dashed var(--brand-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginTop: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <AlertCircle size={22} color="var(--brand-accent)" />
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--brand-accent-dark)' }}>
                NĂNG LỰC SỐ CHƯA ĐƯỢC TÍNH TOÁN
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Hệ thống không tự ý tính điểm mặc định. Để xác định chính xác trình độ và khoảng cách Gap cho vị trí <strong>{activeRoleObj.roleTitle}</strong>, bạn cần hoàn thành bài test khảo sát ma trận năng lực đầu vào.
            </p>
            <button
              className="btn-cta"
              style={{ marginTop: '16px', width: 'auto', padding: '10px 24px', fontSize: '13px' }}
              onClick={onStartDiagnostic}
            >
              <span>Bắt Đầu Làm Bài Test Vị Trí {activeRoleObj.roleCode}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Live Calculated Skill Bars */
          <div className="skill-bars-container" style={{ marginTop: '16px' }}>
            {skillBars.map((bar) => (
              <div key={bar.key} className="skill-bar-row">
                <div className="skill-bar-header">
                  <span className="skill-bar-label">
                    {bar.name} <span style={{ color: 'var(--brand-primary)', fontSize: '11px', fontWeight: 600 }}>({bar.reqLabel})</span>
                  </span>
                  <span className="skill-bar-percentage" style={{ color: bar.isMet ? 'var(--semantic-success)' : 'var(--brand-accent)' }}>
                    {bar.value}% {bar.isMet ? "✓ Đạt chuẩn vị trí" : "⚠️ Cần nâng cao"}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${bar.isMet ? 'success' : 'accent'}`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Status Box & CTA Button (Reflecting Personalization) */}
      <div className="hero-status-box">
        <div>
          <h3 className="status-title">Trạng thái Năng lực Vị trí</h3>
          <div className="status-list">
            <div className={`status-item ${diagnosticDone && metCount > 0 ? 'success' : 'muted'}`}>
              <CheckCircle2 size={18} />
              <span>
                {diagnosticDone
                  ? `Đạt chuẩn vị trí: ${metCount}/5 lĩnh vực`
                  : "Chưa khảo sát đầu vào"}
              </span>
            </div>
            <div className={`status-item ${diagnosticDone && needCount > 0 ? 'accent' : 'muted'}`}>
              <Clock size={18} />
              <span>
                {diagnosticDone
                  ? (needCount > 0 ? `Cần nâng cao: ${needCount} lĩnh vực` : "100% Đạt chuẩn vị trí")
                  : "Chưa phân tích GAP"}
              </span>
            </div>
            <div className="status-item muted" style={{ marginTop: '8px', fontSize: '13px' }}>
              <TrendingUp size={16} />
              <span>
                {diagnosticDone
                  ? (Object.keys(completedCourses).length > 0
                    ? `Đã hoàn thành ${Object.keys(completedCourses).length} khóa học bù đắp`
                    : "Lộ trình cá nhân hóa theo khoảng cách kỹ năng")
                  : "Cần chọn vị trí & làm bài test"}
              </span>
            </div>
          </div>
        </div>

        <div>
          {!diagnosticDone ? (
            <button className="btn-cta" onClick={onStartDiagnostic} id="btn-start-diagnostic">
              <span>Khảo Sát & Phân Tích GAP</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn-cta" onClick={onContinueStudy} id="btn-continue-study">
              <span>
                {hasRemainingAssigned
                  ? `Tiếp tục học (${personalizedRoadmap.assigned[0].id})`
                  : "Xem Lại Bài Giảng / Ôn Tập"}
              </span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
