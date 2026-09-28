import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Clock, PlayCircle, Award, Sparkles, AlertCircle, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { DIGCOMP_AREAS_FULL } from '../data/digcomp15Courses';
import { ALL_DIGCOMP_COURSES as DIGCOMP_15_COURSES } from '../data/courseCatalog';

export default function LearningPathView({ onOpenCourse, personalizedRoadmap, diagnosticDone, onStartDiagnostic, completedCourses = {} }) {
  const [activeViewMode, setActiveViewMode] = useState('personalized'); // 'personalized' | 'catalog'
  const [selectedCatalogArea, setSelectedCatalogArea] = useState('all');

  const assigned = personalizedRoadmap?.assigned || [];
  const exempted = personalizedRoadmap?.exempted || [];

  return (
    <div className="animate-fade-in">
      {/* Top Banner */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)', background: 'linear-gradient(135deg, var(--brand-primary-50) 0%, var(--surface-bg-card) 100%)', borderColor: 'var(--brand-primary-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-primary">Khung Năng Lực Chuẩn Vị Trí</span>
              <span className="badge badge-accent">Vị trí: Digital Marketing Specialist</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Lộ Trình Đào Tạo Cá Nhân Hóa Dựa Trên Ma Trận Yêu Cầu Vị Trí
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '820px', lineHeight: 1.5 }}>
              🎯 <strong>Nguyên tắc cá nhân hóa theo vị trí:</strong> Hệ thống đối soát trình độ thực tế với chuẩn yêu cầu của từng lĩnh vực. Các lĩnh vực đã đạt chuẩn (ví dụ: Lĩnh vực 4 chỉ cần Level 3-4 và bạn đã đạt) sẽ được <strong>miễn học lý thuyết</strong>; hệ thống chỉ chỉ định các khóa học thực sự cần thiết để bù đắp khoảng cách kỹ năng (Skill Gap).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`badge ${activeViewMode === 'personalized' ? 'badge-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setActiveViewMode('personalized')}
            >
              <Sparkles size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Lộ Trình Cá Nhân Hóa Của Tôi
            </button>
            <button
              className={`badge ${activeViewMode === 'catalog' ? 'badge-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setActiveViewMode('catalog')}
            >
              <BookOpen size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
              Toàn Bộ Khung 15 Khóa Học
            </button>
          </div>
        </div>
      </div>

      {activeViewMode === 'personalized' ? (
        /* PERSONALIZED VIEW */
        <div className="animate-fade-in">
          {/* Summary Status of Personalization */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <div className="card" style={{ borderLeft: '4px solid var(--brand-accent)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>KHÓA HỌC BẮT BUỘC ĐƯỢC CHỈ ĐỊNH</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand-accent)', marginTop: '4px' }}>
                {assigned.length} Khóa Học
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Thời lượng học tập: ~{personalizedRoadmap?.totalAssignedHours || 12} giờ
              </span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--semantic-success)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>KHÓA HỌC ĐÃ MIỄN (ĐÃ ĐẠT CHUẨN)</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--semantic-success)', marginTop: '4px' }}>
                {exempted.length} Khóa Học
              </div>
              <span style={{ fontSize: '12px', color: 'var(--semantic-success)' }}>
                ✓ Tiết kiệm ~{personalizedRoadmap?.totalSavedHours || 20} giờ đào tạo
              </span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TRẠNG THÁI SÁT HẠCH ĐẦU VÀO</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '8px' }}>
                {diagnosticDone ? "Đã Khảo Sát & Xác Định Gap" : "Chưa Khảo Sát Đầu Vào"}
              </div>
              {!diagnosticDone ? (
                <button
                  className="btn-primary"
                  style={{ fontSize: '11px', padding: '4px 10px', marginTop: '6px' }}
                  onClick={onStartDiagnostic}
                >
                  Làm bài test ngay
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Đối soát ma trận DigComp 3.0 & Thông tư Tiêu chuẩn VN
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Assigned Courses (Must learn) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-primary-dark)' }}>
                1. Các Khóa Học Chỉ Định Cần Bổ Sung Năng Lực ({assigned.length} khóa):
              </span>
              <span className="badge badge-accent">Bắt buộc để đạt chuẩn</span>
            </div>

            {assigned.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {assigned.map((course) => (
                  <div
                    key={course.id}
                    className="card"
                    style={{
                      border: course.isCore ? '2px solid var(--brand-accent)' : '1px solid var(--brand-primary-light)',
                      background: 'var(--surface-bg-card)',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '20px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-accent">{course.priorityLabel}</span>
                        <span className="badge badge-primary">Khóa {course.id}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Clock size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                          {course.duration} ({course.modules.length} Module)
                        </span>
                      </div>

                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {course.title}
                      </h3>

                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        {course.reason}
                      </p>

                      {/* Module breakdown with highlighted focus */}
                      <div style={{ background: 'var(--surface-bg-page)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                          CÁC MODULE TRỌN GÓI CỦA CẤP ĐỘ NÀY:
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '6px' }}>
                          {course.modules.map((m) => {
                            const isMissedFocus = course.focusModuleCode === m.code;
                            return (
                              <div
                                key={m.id}
                                style={{
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: isMissedFocus ? 'var(--brand-accent-50)' : 'transparent',
                                  border: isMissedFocus ? '1px solid var(--brand-accent)' : 'none',
                                  color: isMissedFocus ? 'var(--brand-accent-dark)' : 'var(--text-primary)',
                                  fontWeight: isMissedFocus ? 700 : 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <span>{isMissedFocus ? "⚠️" : "•"}</span>
                                <span>{m.code}: {m.title.replace(/^Module \d+:\s*/, '')}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '160px' }}>
                      <button
                        className="btn-cta"
                        style={{ width: '100%', padding: '10px 18px', fontSize: '13px' }}
                        onClick={() => onOpenCourse(course)}
                      >
                        <PlayCircle size={16} />
                        <span>Vào Học Khóa Này</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <CheckCircle2 size={36} color="var(--semantic-success)" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Không Có Khóa Học Nào Cần Học Thêm!</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Bạn đã đạt chuẩn toàn bộ các lĩnh vực mà vị trí Digital Marketing yêu cầu. Hãy chuyển sang nộp Bài tập thực hành (Practical Task).
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Exempted Courses (Requirements Met) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--semantic-success)' }}>
                2. Các Khóa Học Đã Đạt Chuẩn Vị Trí & Được Miễn Học ({exempted.length} khóa):
              </span>
              <span className="badge badge-success">Không cần học lại</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {exempted.map((course) => (
                <div
                  key={course.id}
                  className="card"
                  style={{
                    background: 'var(--surface-bg-card)',
                    border: '1px solid var(--semantic-success)',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge ${completedCourses[course.id] ? 'badge-primary' : 'badge-success'}`}>
                      {completedCourses[course.id] ? `✓ Đã Hoàn Thành (${completedCourses[course.id].score || 95}%)` : '✓ Miễn Học Lý Thuyết'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Khóa {course.id}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {course.title}
                  </h4>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {course.reason}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--semantic-success)', fontWeight: 600 }}>
                      Năng lực đã xác nhận: {course.currentLevel}
                    </span>
                    <button
                      className="btn-outline"
                      style={{ fontSize: '11px', padding: '4px 10px', color: completedCourses[course.id] ? 'var(--brand-primary)' : undefined, fontWeight: 600 }}
                      onClick={() => onOpenCourse(course)}
                    >
                      {completedCourses[course.id] ? 'Ôn tập & Xem lại bài học' : 'Ôn tập nếu muốn'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CATALOG VIEW OF 15 COURSES */
        <div className="animate-fade-in">
          {/* Catalog Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              className={`badge ${selectedCatalogArea === 'all' ? 'badge-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setSelectedCatalogArea('all')}
            >
              Tất cả 5 Lĩnh vực
            </button>
            {DIGCOMP_AREAS_FULL.map((area) => (
              <button
                key={area.id}
                className={`badge ${selectedCatalogArea === area.id ? 'badge-primary' : 'btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
                onClick={() => setSelectedCatalogArea(area.id)}
              >
                Lĩnh vực {area.code}: {area.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(selectedCatalogArea === 'all' ? DIGCOMP_AREAS_FULL : DIGCOMP_AREAS_FULL.filter(a => a.id === selectedCatalogArea)).map((area) => {
              const fCourse = DIGCOMP_15_COURSES[`A${area.code}-F`];
              const iCourse = DIGCOMP_15_COURSES[`A${area.code}-I`];
              const aCourse = DIGCOMP_15_COURSES[`A${area.code}-A`];
              const courses = [fCourse, iCourse, aCourse].filter(Boolean);

              return (
                <div key={area.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        LĨNH VỰC {area.code} • {area.enName}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{area.name}</h3>
                    </div>
                    <span className="badge badge-accent">
                      Vị trí Marketing yêu cầu: {area.marketingTarget} ({area.marketingTargetLabel})
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {courses.map((c) => (
                      <div key={c.id} style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: c.id === area.marketingTarget ? '2px solid var(--brand-primary)' : '1px solid var(--surface-border)', background: c.id === area.marketingTarget ? 'var(--brand-primary-50)' : 'var(--surface-bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span className="badge badge-primary">{c.id}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>{c.level}</span>
                          </div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{c.title}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{c.objective}</p>
                        </div>
                        <button className="btn-outline" style={{ width: '100%', fontSize: '11px', justifyContent: 'center' }} onClick={() => onOpenCourse(c)}>
                          Xem chi tiết khóa học
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
