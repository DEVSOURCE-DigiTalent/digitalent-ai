import React, { useState } from 'react';
import {
  Zap, Award, CheckCircle2, ArrowRight, Sparkles, BookOpen, Clock,
  ShieldCheck, FileText, Target, Users, BarChart3, Layers, ChevronRight,
  BrainCircuit, Check, PlayCircle, HelpCircle, Lock, Star
} from 'lucide-react';
import { JOB_ROLE_BENCHMARKS } from '../data/mockMarketingFlow';
import { DIGCOMP_AREAS_FULL } from '../data/digcomp15Courses';

export default function LandingPageView({ onSelectRoleAndStartTest, onNavigateToTab }) {
  const [selectedRoleId, setSelectedRoleId] = useState('marketing_specialist');
  const activeRoleObj = JOB_ROLE_BENCHMARKS.find(r => r.roleId === selectedRoleId) || JOB_ROLE_BENCHMARKS[0];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* 1. HERO SECTION */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0F3670 0%, #1B4F9C 50%, #0F2850 100%)',
          color: '#FFFFFF',
          padding: '48px 36px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-xl)',
          boxShadow: '0 12px 36px rgba(15, 54, 112, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255,122,0,0.25) 0%, rgba(255,122,0,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: 700, backdropFilter: 'blur(8px)', marginBottom: '20px' }}>
            <Sparkles size={16} color="var(--brand-accent)" />
            <span>Nền Tảng Đào Tạo & Chuẩn Hóa Năng Lực Số Doanh Nghiệp (DigComp 3.0 & Thông tư VN)</span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Phát Triển Năng Lực Số Cá Nhân Hóa<br />Theo Đúng Vị Trí Việc Làm
          </h1>

          <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: 1.6, maxWidth: '780px', margin: '0 auto 32px' }}>
            Hệ thống không đánh giá cảm tính. Năng lực số chỉ được tính khi người học <strong>chọn đúng vị trí công việc</strong>, tham gia <strong>bài test khảo sát ma trận đầu vào</strong> và hệ thống tự động phân tích <strong>khoảng cách Skill Gap</strong> để phân bổ lộ trình bù đắp chính xác nhất.
          </p>

          {/* Quick Interactive Role Selector Widget */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              maxWidth: '860px',
              margin: '0 auto',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} />
              <span>Bước 1: Chọn vị trí công việc bạn muốn khảo sát & nâng cao năng lực số:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {JOB_ROLE_BENCHMARKS.map((r) => {
                const isSelected = r.roleId === selectedRoleId;
                return (
                  <button
                    key={r.roleId}
                    type="button"
                    onClick={() => setSelectedRoleId(r.roleId)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--brand-accent)' : '1px solid var(--surface-border)',
                      background: isSelected ? 'var(--brand-accent-50)' : 'var(--surface-bg-card)',
                      color: isSelected ? 'var(--brand-accent-dark)' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(255, 122, 0, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85, marginBottom: '2px' }}>
                      {r.roleCode}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                      {r.roleTitle.split('(')[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Role Summary Preview */}
            <div style={{ background: 'var(--surface-bg-page)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span className="badge badge-accent" style={{ fontSize: '11px', fontWeight: 700 }}>
                    ⚖️ Đối soát Tiêu chuẩn Việt Nam: {activeRoleObj.vnStandardReference}
                  </span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-primary-dark)', marginTop: '2px' }}>
                  {activeRoleObj.roleTitle} ({activeRoleObj.department})
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {activeRoleObj.description}
                </div>
              </div>

              <button
                className="btn-cta"
                style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}
                onClick={() => onSelectRoleAndStartTest(activeRoleObj)}
              >
                <span>Vào Khảo Sát & Phân Tích GAP Vị Trí Này</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLATFORM STATS BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: 'var(--spacing-xl)'
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--brand-primary-50)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary)' }}>8 Cấp Độ</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Chuẩn DigComp 3.0 & Thông tư VN</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--brand-accent-50)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-accent)' }}>5 Vị Trí</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tiêu biểu trong doanh nghiệp</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--semantic-success-50)', color: 'var(--semantic-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--semantic-success)' }}>100% Miễn Học</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cho các lĩnh vực đã đạt chuẩn</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--brand-primary-50)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-primary)' }}>Cấp Chứng Chỉ</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kèm mã QR xác thực công khai</div>
          </div>
        </div>
      </div>

      {/* 3. 5-STEP TRAINING WORKFLOW SHOWCASE */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', padding: '32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 32px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Quy Trình Khép Kín Chuẩn Doanh Nghiệp</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Quá Trình Đào Tạo & Chuẩn Hóa 5 Bước
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Từ bước xác định vị trí công việc ban đầu đến khi hoàn thành khóa chỉ định và nhận chứng chỉ phê duyệt.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Step 1 */}
          <div style={{ background: 'var(--surface-bg-page)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>
              1
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Chọn Vị Trí Công Việc
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Lựa chọn vị trí nghiệp vụ (Marketing, Kế toán, HR, Sales). Mỗi vị trí có khung chuẩn năng lực yêu cầu riêng biệt.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ background: 'var(--surface-bg-page)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>
              2
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Khảo Sát Khởi Điểm
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Thực hiện bài test trắc nghiệm đối soát tình huống để hệ thống đo lường trình độ thực tế hiện tại.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ background: 'var(--surface-bg-page)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--brand-accent)', position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>
              3
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-accent-dark)', marginBottom: '6px' }}>
              Phân Tích GAP & Miễn Học
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Hệ thống tự động miễn khóa học ở lĩnh vực đã đạt chuẩn, chỉ giao các khóa học bù đắp cho các kỹ năng thiếu hụt.
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ background: 'var(--surface-bg-page)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)', position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>
              4
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Học & Thực Hành Sandbox
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Vào phòng học riêng 1080p, lưu ghi chú cá nhân và áp dụng thực hành trên công cụ mô phỏng Sandbox (A/B testing, AI Prompt).
            </p>
          </div>

          {/* Step 5 */}
          <div style={{ background: 'var(--surface-bg-page)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--semantic-success)', position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--semantic-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>
              5
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--semantic-success)', marginBottom: '6px' }}>
              Nộp Bài & Nhận Chứng Chỉ
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Nộp bài tập minh chứng thực tế (Practical Task), Trưởng phòng duyệt 94/100đ và phát hành chứng chỉ PDF + Mã QR công khai.
            </p>
          </div>
        </div>
      </div>

      {/* 4. ROLE DIRECTORY SHOWCASE */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-accent">Từ Điển Vị Trí Việc Làm</span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              Khung Chuẩn Năng Lực Theo Từng Vị Trí Công Việc
            </h2>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Mỗi vị trí có yêu cầu cấp độ (Level 1-6) khác nhau cho 5 lĩnh vực
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
          {JOB_ROLE_BENCHMARKS.map((r) => (
            <div
              key={r.roleId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className={`badge badge-${r.badgeColor}`}>{r.roleCode}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.department}</span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {r.roleTitle}
                </h3>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {r.description}
                </p>

                {/* Key Area Breakdown List */}
                <div style={{ background: 'var(--surface-bg-page)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '11.5px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Mức Yêu Cầu Từng Lĩnh Vực:
                  </div>
                  {r.competencies.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: c.isCore ? 'var(--brand-accent-dark)' : 'var(--text-primary)', fontWeight: c.isCore ? 700 : 500 }}>
                        {c.name} {c.isCore ? '★' : ''}:
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                        {c.reqLevelLabel.split('(')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12.5px', padding: '10px' }}
                onClick={() => onSelectRoleAndStartTest(r)}
              >
                <span>Khảo sát vị trí {r.roleCode}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. DIGCOMP 3.0 FRAMEWORK GUIDE */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-primary">Khung Tham Chiếu Năng Lực Số Châu Âu & Thông tư 03</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
              5 Lĩnh Vực Kỹ Năng Số Tiêu Chuẩn (DigComp 3.0 & Thông tư 03/2014/TT-BTTTT)
            </h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {DIGCOMP_AREAS_FULL.map((area) => (
            <div
              key={area.id}
              style={{
                background: 'var(--surface-bg-page)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--surface-border)'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '4px' }}>
                Lĩnh vực {area.code}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {area.name}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
