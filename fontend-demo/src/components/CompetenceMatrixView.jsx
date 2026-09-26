import React, { useState } from 'react';
import { Database, MessageSquareShare, FileEdit, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2, AlertCircle, Briefcase, BookOpen, Layers, Info } from 'lucide-react';
import { POSITION_REQUIREMENTS, JOB_ROLE_BENCHMARKS, DIGCOMP_LEVEL_GUIDE } from '../data/mockMarketingFlow';

export default function CompetenceMatrixView({
  scores,
  onSelectAreaToLearn,
  selectedRole,
  diagnosticDone = false,
  onStartDiagnostic
}) {
  const activeRoleObj = selectedRole || POSITION_REQUIREMENTS;
  const [selectedBenchmarkRole, setSelectedBenchmarkRole] = useState(JOB_ROLE_BENCHMARKS[0]);
  const [activeTab, setActiveTab] = useState('current_role'); // 'current_role' | 'compare_roles' | 'level_guide'

  const safeScores = scores || {};

  const iconMap = {
    area_1: <Database size={22} />,
    area_2: <MessageSquareShare size={22} />,
    area_3: <FileEdit size={22} />,
    area_4: <ShieldCheck size={22} />,
    area_5: <Cpu size={22} />
  };

  const getLevelLabel = (score) => {
    if (!score && score !== 0) return "Chưa khảo sát";
    if (score >= 80) return "Level 5-6 (Nâng cao)";
    if (score >= 55) return "Level 3-4 (Trung cấp)";
    return "Level 1-2 (Cơ bản)";
  };

  const competencies = activeRoleObj.competencies || POSITION_REQUIREMENTS.competencies;

  return (
    <div className="animate-fade-in">
      {/* Intro banner */}
      <div
        className="card"
        style={{
          marginBottom: 'var(--spacing-xl)',
          background: 'linear-gradient(135deg, var(--brand-primary-50) 0%, var(--surface-bg-card) 100%)',
          borderColor: 'var(--brand-primary-light)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">
                Khung Năng Lực Số Chuẩn Quốc Tế DigComp 3.0 & Thông tư VN
              </span>
              <span className="badge badge-accent">
                ⚖️ {activeRoleObj.vnStandardReference}
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--font-xl)', color: 'var(--text-primary)', marginTop: '4px' }}>
              Chuẩn Năng Lực Số Theo Vị Trí Việc Làm (Job Role Benchmark)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '6px', maxWidth: '820px', lineHeight: 1.6 }}>
              Trong doanh nghiệp, <strong>không cào bằng mọi nhân sự đều phải học Level 5-6</strong>. Mỗi vị trí việc làm có một Hồ sơ Chuẩn năng lực riêng. Vị trí <strong>{activeRoleObj.roleTitle}</strong> yêu cầu chuẩn hóa từng lĩnh vực phù hợp với nghiệp vụ thực tế. Lộ trình đào tạo chỉ kích hoạt khi có khoảng cách Gap so với chuẩn vị trí.
            </p>
          </div>
          <div style={{ textAlign: 'right', minWidth: '160px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Vị trí đang chọn</span>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--brand-primary)' }}>{activeRoleObj.roleCode}</div>
            <span style={{ fontSize: '12px', color: 'var(--semantic-success)', fontWeight: 600 }}>{activeRoleObj.roleTitle.split('(')[0]}</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <button
            className={`btn-sm ${activeTab === 'current_role' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('current_role')}
            style={{ borderRadius: 'var(--radius-pill)', gap: '6px' }}
          >
            <Briefcase size={15} />
            <span>Chuẩn Vị Trí Hiện Tại ({activeRoleObj.roleCode})</span>
          </button>
          <button
            className={`btn-sm ${activeTab === 'compare_roles' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('compare_roles')}
            style={{ borderRadius: 'var(--radius-pill)', gap: '6px' }}
          >
            <Layers size={15} />
            <span>So Sánh Chuẩn Giữa Các Vị Trí Việc Làm</span>
          </button>
          <button
            className={`btn-sm ${activeTab === 'level_guide' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('level_guide')}
            style={{ borderRadius: 'var(--radius-pill)', gap: '6px' }}
          >
            <BookOpen size={15} />
            <span>Tiêu Chí 8 Cấp Độ DigComp (Tự chủ & Nhận thức)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Current Selected Role Cards */}
      {activeTab === 'current_role' && (
        <>
          {!diagnosticDone ? (
            <div
              className="card"
              style={{
                marginBottom: 'var(--spacing-lg)',
                background: 'var(--surface-bg-page)',
                border: '1.5px dashed var(--brand-accent)',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={24} color="var(--brand-accent)" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-accent-dark)' }}>
                      CHƯA KHẢO SÁT NĂNG LỰC CHO VỊ TRÍ {activeRoleObj.roleTitle.toUpperCase()}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                      Điểm năng lực số chưa được tự động gán. Hãy thực hiện bài khảo sát đầu vào để đối soát trình độ của bạn với chuẩn ma trận vị trí.
                    </p>
                  </div>
                </div>

                {onStartDiagnostic && (
                  <button className="btn-cta" style={{ width: 'auto', padding: '8px 20px', fontSize: '13px' }} onClick={onStartDiagnostic}>
                    <span>Làm bài test vị trí {activeRoleObj.roleCode}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: 'var(--brand-primary-50)', borderLeft: '4px solid var(--brand-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Info size={20} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>
                  <strong>Quy tắc định chuẩn cho vị trí {activeRoleObj.roleTitle}:</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    {competencies.map(c => (
                      <li key={c.id}>
                        <strong>{c.name}:</strong> Yêu cầu {c.reqLevelLabel} {c.isCore ? '(Năng lực cốt lõi trọng tâm)' : ''} - {c.benchmarkNote || c.note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="competence-grid">
            {competencies.map((comp) => {
              const currentScore = safeScores[comp.id] !== undefined && safeScores[comp.id] !== null ? safeScores[comp.id] : 0;
              const reqNum = comp.reqLevelNumber || comp.requiredLevelNumber || 6;
              const passThreshold = reqNum <= 2 ? 40 : (reqNum <= 4 ? 60 : 75);
              const isPassed = diagnosticDone && (currentScore >= passThreshold);

              return (
                <div key={comp.id} className="area-card">
                  <div>
                    <div className="area-card-header">
                      <div className="area-icon-wrap" style={{
                        background: comp.isCore ? 'var(--brand-accent-50)' : undefined,
                        color: comp.isCore ? 'var(--brand-accent)' : undefined
                      }}>
                        {iconMap[comp.id]}
                      </div>
                      <span className={`badge ${!diagnosticDone ? 'badge-neutral' : (isPassed ? 'badge-success' : 'badge-warning')}`}>
                        {!diagnosticDone ? <Info size={12} /> : (isPassed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />)}
                        {!diagnosticDone ? 'Chưa khảo sát' : (isPassed ? 'Đạt chuẩn vị trí' : 'Dưới chuẩn vị trí')}
                      </span>
                    </div>

                    <h3 className="area-title">
                      {comp.name} {comp.isCore && <span className="badge badge-accent" style={{ fontSize: '10px' }}>Trọng tâm</span>}
                    </h3>
                    <p className="area-desc">{comp.benchmarkNote || comp.note}</p>

                    {/* Benchmark comparison box */}
                    <div className="level-compare">
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Vị trí yêu cầu:</span>
                        <div style={{ fontWeight: 700, color: 'var(--brand-primary)', marginTop: '2px' }}>
                          {comp.reqLevelLabel || `Level ${reqNum}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Năng lực hiện tại:</span>
                        <div style={{ fontWeight: 700, color: !diagnosticDone ? 'var(--text-muted)' : (isPassed ? 'var(--semantic-success)' : 'var(--brand-accent)'), marginTop: '2px' }}>
                          {!diagnosticDone ? "Chưa làm bài test" : `${getLevelLabel(currentScore)} (${currentScore}%)`}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar with position threshold indicator */}
                    <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
                      <div className="progress-track" style={{ height: '8px' }}>
                        <div
                          className={`progress-fill ${!diagnosticDone ? 'neutral' : (isPassed ? 'success' : 'accent')}`}
                          style={{ width: `${diagnosticDone ? currentScore : 0}%` }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>Điểm: {diagnosticDone ? `${currentScore}/100` : '--/100'}</span>
                        <span>Ngưỡng đạt vị trí: {passThreshold}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    className="btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      if (!diagnosticDone && onStartDiagnostic) {
                        onStartDiagnostic();
                      } else if (onSelectAreaToLearn) {
                        onSelectAreaToLearn(comp.id);
                      }
                    }}
                  >
                    <span>{!diagnosticDone ? "Bắt đầu bài test vị trí" : "Xem mô-đun đào tạo"}</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* TAB 2: Compare Roles in Company */}
      {activeTab === 'compare_roles' && (
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Từ Điển Chuẩn Năng Lực Số Giữa Các Vị Trí Việc Làm Tiêu Biểu
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              Nhấp chọn một vị trí việc làm để xem hồ sơ chuẩn hóa các cấp độ DigComp 3.0 tương ứng:
            </p>

            {/* Role selector buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'var(--spacing-md)' }}>
              {JOB_ROLE_BENCHMARKS.map((role) => {
                const isSelected = selectedBenchmarkRole.roleId === role.roleId;
                return (
                  <button
                    key={role.roleId}
                    onClick={() => setSelectedBenchmarkRole(role)}
                    className={`btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                      borderRadius: 'var(--radius-pill)',
                      borderColor: isSelected ? 'var(--brand-primary)' : 'var(--surface-border)',
                      padding: '8px 16px',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    <span>{role.roleTitle}</span>
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>({role.roleCode})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active selected role profile */}
          <div
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-bg-page)',
              border: '1px solid var(--surface-border)',
              marginBottom: 'var(--spacing-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span className="badge badge-primary">
                    {selectedBenchmarkRole.department}
                  </span>
                  <span className="badge badge-accent">
                    ⚖️ Đối soát Tiêu chuẩn VN: {selectedBenchmarkRole.vnStandardReference}
                  </span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedBenchmarkRole.roleTitle} ({selectedBenchmarkRole.roleCode})
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
                  {selectedBenchmarkRole.description}
                </p>
              </div>
            </div>

            {/* Matrix comparison table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--brand-primary-50)', borderBottom: '2px solid var(--surface-border)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left' }}>Lĩnh vực DigComp</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Mức Level đòi hỏi</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Loại năng lực</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left' }}>Nhiệm vụ nghiệp vụ số tương ứng</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBenchmarkRole.competencies.map((c, idx) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--surface-border)', background: idx % 2 === 0 ? 'var(--surface-bg-card)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span className={`badge ${c.reqLevelNumber === 6 ? 'badge-primary' : (c.reqLevelNumber === 4 ? 'badge-accent' : 'badge-neutral')}`}>
                          {c.reqLevelLabel}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {c.isCore ? (
                          <span className="badge badge-accent" style={{ fontWeight: 700 }}>Trọng tâm vị trí</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Hỗ trợ nghiệp vụ</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {c.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Summary comparison card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ background: 'var(--surface-bg-card)', borderLeft: '4px solid var(--brand-accent)' }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Tại sao Marketing cần Level 6 ở Nội dung?
              </h5>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Chuyên viên Marketing phải chịu trách nhiệm về thông điệp thương hiệu, chiến lược video, AI Prompting và pháp lý bản quyền quảng cáo. Đây là năng lực sinh lời trực tiếp của phòng Marketing.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--surface-bg-card)', borderLeft: '4px solid var(--semantic-success)' }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Tại sao Marketing chỉ cần Level 4 ở An toàn?
              </h5>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Marketer không phải kỹ sư an ninh mạng. Họ chỉ cần đạt mức Trung cấp (Level 3-4) để độc lập bảo mật tài khoản mạng xã hội 2FA, tránh lộ tệp khách hàng và tuân thủ Nghị định 13 khi tạo landing page.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--surface-bg-card)', borderLeft: '4px solid var(--brand-primary)' }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Sự khác biệt khi chuyển sang Kế toán:
              </h5>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Kế toán cần Level 5-6 ở An toàn thông tin (chữ ký số, bảo mật giao dịch, chống tấn công mã độc tài chính) nhưng chỉ cần Level 1-2 ở Sáng tạo nội dung (không cần sản xuất video hay đồ họa).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 8 Levels Guide */}
      {activeTab === 'level_guide' && (
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Khung Phân Định 8 Cấp Độ Năng Lực Số (European DigComp 3.0 & Thông tư VN)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--spacing-lg)' }}>
            Theo DigComp 3.0 & Thông tư 03/2014/TT-BTTTT, năng lực số được xác định dựa trên 2 tiêu chí cốt lõi: <strong>Mức độ Tự chủ (Autonomy)</strong> và <strong>Độ phức tạp nhận thức của nhiệm vụ (Cognitive Task Complexity)</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {DIGCOMP_LEVEL_GUIDE.map((tier, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: 'var(--surface-bg-card)',
                  borderColor: idx === 2 ? 'var(--brand-primary)' : 'var(--surface-border)',
                  boxShadow: idx === 2 ? '0 4px 16px rgba(27, 79, 156, 0.12)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className={`badge ${idx === 0 ? 'badge-neutral' : (idx === 1 ? 'badge-accent' : (idx === 2 ? 'badge-primary' : 'badge-success'))}`}>
                      {tier.levels}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Mã: {tier.code}</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {tier.tier}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                    {tier.description}
                  </p>

                  <div style={{ fontSize: '12px', background: 'var(--surface-bg-page)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                    <div style={{ color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '2px' }}>Mức độ tự chủ:</div>
                    <div style={{ color: 'var(--text-primary)' }}>{tier.autonomy}</div>
                  </div>

                  <div style={{ fontSize: '12px', background: 'var(--surface-bg-page)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ color: 'var(--brand-accent)', fontWeight: 600, marginBottom: '2px' }}>Độ phức tạp nhiệm vụ:</div>
                    <div style={{ color: 'var(--text-primary)' }}>{tier.complexity}</div>
                  </div>

                  {tier.vnStandardMapping && (
                    <div style={{ fontSize: '11.5px', background: 'var(--brand-accent-50)', border: '1px solid var(--brand-accent)', padding: '10px', borderRadius: 'var(--radius-md)', marginTop: '8px', color: 'var(--brand-accent-dark)', fontWeight: 600 }}>
                      ⚖️ {tier.vnStandardMapping}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--surface-border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Khóa học tương ứng: <strong>Khóa {tier.code} (1-5)</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
