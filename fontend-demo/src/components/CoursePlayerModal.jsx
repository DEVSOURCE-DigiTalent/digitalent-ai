import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, Award, Sparkles, BookOpen, Clock, ArrowRight, RotateCcw, AlertCircle, RefreshCw, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoursePlayerModal({
  course,
  onClose,
  onCourseCompleted,
  isAlreadyCompleted = false,
  savedProgress = null,
  onSaveProgress = null,
  onOpenCertificate = null
}) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(45);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'quiz' | 'final_exam'

  // Initialize completed modules based on saved state or completion
  const [completedModules, setCompletedModules] = useState(() => {
    if (isAlreadyCompleted || savedProgress?.isCompleted) {
      const allDone = {};
      course?.modules?.forEach(m => {
        allDone[m.id] = true;
      });
      return allDone;
    }
    return savedProgress?.completedModules || {};
  });

  // Quiz states
  const [moduleAnswer, setModuleAnswer] = useState(null);
  const [moduleSubmitted, setModuleSubmitted] = useState(false);
  const [moduleCorrect, setModuleCorrect] = useState(false);

  // Final exam states
  const [finalAnswers, setFinalAnswers] = useState(() => {
    if (isAlreadyCompleted || savedProgress?.isCompleted) {
      // Pre-fill with correct answers for review mode
      const preFilled = {};
      const allQuestions = course?.modules?.flatMap(m => m.quiz || []) || [];
      allQuestions.forEach((q, idx) => {
        preFilled[idx] = q.ans;
      });
      return preFilled;
    }
    return savedProgress?.finalAnswers || {};
  });

  const [finalExamSubmitted, setFinalExamSubmitted] = useState(
    isAlreadyCompleted || savedProgress?.isCompleted || false
  );
  const [finalExamScore, setFinalExamScore] = useState(
    savedProgress?.score || (isAlreadyCompleted ? 95 : 0)
  );

  const [isRetestingModule, setIsRetestingModule] = useState(false);

  if (!course || !course.modules || course.modules.length === 0) {
    return null;
  }

  const currentMod = course.modules[activeModuleIndex] || course.modules[0];
  const modQuiz = currentMod.quiz && currentMod.quiz[0];
  const isCurrentModuleCompleted = !!completedModules[currentMod.id];
  const totalModulesCount = course.modules.length;
  const completedCount = Object.keys(completedModules).length;
  const isCourseFullyCompleted = isAlreadyCompleted || completedCount === totalModulesCount && finalExamSubmitted && finalExamScore >= 60;

  const handleSelectModule = (idx) => {
    setActiveModuleIndex(idx);
    setActiveTab('video');
    setModuleAnswer(null);
    setModuleSubmitted(false);
    setModuleCorrect(false);
    setIsRetestingModule(false);
    setVideoProgress(20);
  };

  const handleCheckModuleQuiz = () => {
    if (moduleAnswer === null) return;
    const isCorrect = moduleAnswer === modQuiz.ans;
    setModuleSubmitted(true);
    setModuleCorrect(isCorrect);

    if (isCorrect) {
      const updated = {
        ...completedModules,
        [currentMod.id]: true
      };
      setCompletedModules(updated);
      setIsRetestingModule(false);
      if (onSaveProgress) {
        onSaveProgress(course.id, {
          completedModules: updated,
          score: finalExamScore,
          isCompleted: Object.keys(updated).length === totalModulesCount && finalExamSubmitted
        });
      }
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleNextStep = () => {
    if (activeModuleIndex < course.modules.length - 1) {
      handleSelectModule(activeModuleIndex + 1);
    } else {
      setActiveTab('final_exam');
    }
  };

  // Compile final exam questions from all modules in this course
  const allExamQuestions = course.modules.flatMap(m => m.quiz || []);

  const handleSubmitFinalExam = () => {
    let correctCount = 0;
    allExamQuestions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.ans) {
        correctCount++;
      }
    });

    const pct = Math.round((correctCount / allExamQuestions.length) * 100);
    setFinalExamScore(pct);
    setFinalExamSubmitted(true);

    if (pct >= 60) {
      // Mark all modules as completed if final exam passed
      const allModsDone = {};
      course.modules.forEach(m => { allModsDone[m.id] = true; });
      setCompletedModules(allModsDone);

      if (onSaveProgress) {
        onSaveProgress(course.id, {
          completedModules: allModsDone,
          score: pct,
          isCompleted: true
        });
      }

      try {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      } catch (e) {}

      if (onCourseCompleted) {
        onCourseCompleted(course.id, pct);
      }
    }
  };

  // Quick Complete helper for demo / instant testing
  const handleQuickCompleteDemo = () => {
    const allModsDone = {};
    course.modules.forEach(m => { allModsDone[m.id] = true; });
    const preFilled = {};
    allExamQuestions.forEach((q, idx) => { preFilled[idx] = q.ans; });

    setCompletedModules(allModsDone);
    setFinalAnswers(preFilled);
    setFinalExamScore(95);
    setFinalExamSubmitted(true);

    if (onSaveProgress) {
      onSaveProgress(course.id, {
        completedModules: allModsDone,
        score: 95,
        isCompleted: true
      });
    }

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    } catch (e) {}

    if (onCourseCompleted) {
      onCourseCompleted(course.id, 95);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '1020px', maxHeight: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary">Khóa {course.id}</span>
              <span className="badge badge-accent">{course.level}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {course.duration}
              </span>
              {isCourseFullyCompleted && (
                <span className="badge badge-success" style={{ fontWeight: 700 }}>
                  ✓ ĐÃ HOÀN THÀNH (ĐIỂM: {finalExamScore}%)
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {course.title}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Mục tiêu khóa học: {course.objective}
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* REVIEW MODE BANNER (If completed) */}
        {isCourseFullyCompleted && (
          <div
            style={{
              background: 'linear-gradient(135deg, var(--semantic-success-50) 0%, var(--surface-bg-card) 100%)',
              borderBottom: '1px solid var(--semantic-success)',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--semantic-success)', color: '#fff', padding: '6px', borderRadius: '50%' }}>
                <Award size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--semantic-success)' }}>
                  CHẾ ĐỘ ÔN TẬP & XEM LẠI KIẾN THỨC (REVIEW MODE)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Bạn đã vượt qua khóa học này. Bạn có thể tự do mở mọi video bài giảng, xem lại các bài tập thực hành hoặc kiểm tra lại kiến thức bất kỳ lúc nào.
                </div>
              </div>
            </div>

            {onOpenCertificate && (
              <button
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px', gap: '6px' }}
                onClick={() => {
                  onClose();
                  onOpenCertificate();
                }}
              >
                <FileCheck size={14} />
                <span>Xem Chứng Chỉ Đã Cấp</span>
              </button>
            )}
          </div>
        )}

        {/* Modules Stepper Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-bg-page)',
            padding: '10px 24px',
            borderBottom: '1px solid var(--surface-border)',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {course.modules.map((m, idx) => {
              const isCurrent = idx === activeModuleIndex && activeTab !== 'final_exam';
              const isDone = completedModules[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectModule(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid var(--surface-border)',
                    background: isCurrent ? 'var(--brand-primary)' : isDone ? 'var(--semantic-success-50)' : 'var(--surface-bg-card)',
                    color: isCurrent ? '#FFFFFF' : isDone ? 'var(--semantic-success)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                  title={m.title}
                >
                  {isDone ? <CheckCircle2 size={13} color={isCurrent ? '#fff' : 'var(--semantic-success)'} /> : idx + 1}
                  <span>{m.code.split('-').slice(2).join('-') || `M${idx + 1}`}</span>
                </button>
              );
            })}

            <button
              onClick={() => setActiveTab('final_exam')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid var(--surface-border)',
                background: activeTab === 'final_exam' ? 'var(--brand-accent)' : finalExamSubmitted ? 'var(--semantic-success-50)' : 'var(--surface-bg-card)',
                color: activeTab === 'final_exam' ? '#FFFFFF' : finalExamSubmitted ? 'var(--semantic-success)' : 'var(--brand-accent-dark)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {finalExamSubmitted ? <CheckCircle2 size={14} /> : <Award size={14} />}
              <span>Bài Thi Đánh Giá Cuối Khóa</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Tiến độ: <strong>{completedCount}/{course.modules.length} Module</strong>
              {isCourseFullyCompleted && <span style={{ color: 'var(--semantic-success)', marginLeft: '6px', fontWeight: 700 }}>(100% Hoàn tất)</span>}
            </span>

            {!isCourseFullyCompleted && (
              <button
                className="btn-outline"
                style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--brand-primary)', gap: '4px' }}
                onClick={handleQuickCompleteDemo}
                title="Mô phỏng hoàn thành nhanh để vào Chế độ Ôn tập"
              >
                <Sparkles size={12} />
                <span>Hoàn thành nhanh (Demo)</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switch inside Module */}
        {activeTab !== 'final_exam' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-bg-card)' }}>
            <button
              onClick={() => setActiveTab('video')}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === 'video' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'video' ? '2px solid var(--brand-primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              📹 Video Bài Giảng: {currentMod.title.split(':')[0]}
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: activeTab === 'quiz' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'quiz' ? '2px solid var(--brand-primary)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📝 Bài Kiểm Tra Module ({currentMod.code})</span>
              {isCurrentModuleCompleted && <CheckCircle2 size={14} color="var(--semantic-success)" />}
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="modal-body">
          {activeTab === 'final_exam' ? (
            /* Final Course Exam */
            <div className="animate-fade-in">
              <div style={{ background: 'var(--brand-primary-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-primary-dark)' }}>
                  Bài Đánh Giá Tổng Hợp Cuối Khóa: {course.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Bài thi tổng hợp kiến thức của toàn bộ {course.modules.length} module thành phần để xác nhận bạn đã làm chủ trọn vẹn mức độ này. Đạt từ <strong>60% trở lên</strong> để hoàn thành khóa.
                </p>
              </div>

              {finalExamSubmitted && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    background: finalExamScore >= 60 ? 'var(--semantic-success-50)' : 'var(--semantic-danger-50)',
                    border: `1px solid ${finalExamScore >= 60 ? 'var(--semantic-success)' : 'var(--semantic-danger)'}`,
                    textAlign: 'center'
                  }}
                >
                  <Award size={36} color={finalExamScore >= 60 ? 'var(--semantic-success)' : 'var(--semantic-danger)'} style={{ margin: '0 auto 6px' }} />
                  <h4 style={{ fontWeight: 700, fontSize: '17px', color: finalExamScore >= 60 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                    {finalExamScore >= 60 ? "✓ Bạn Đã Hoàn Thành Bài Đánh Giá Cuối Khóa" : "Bạn Chưa Đạt Điểm Yêu Cầu"}
                  </h4>
                  <p style={{ fontSize: '13px', marginTop: '2px', color: 'var(--text-primary)' }}>
                    Kết quả đánh giá: <strong>{finalExamScore}%</strong> • Mức độ năng lực số của vị trí đã được hệ thống cập nhật Đạt Chuẩn!
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {allExamQuestions.map((q, idx) => {
                  const isAnswerSelected = finalAnswers[idx] !== undefined;
                  const selectedOpt = finalAnswers[idx];
                  const isCorrect = selectedOpt === q.ans;

                  return (
                    <div key={idx} style={{ padding: '16px', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>
                          Câu {idx + 1}: {q.q}
                        </p>
                        {finalExamSubmitted && (
                          <span className={`badge ${isCorrect ? 'badge-success' : 'badge-warning'}`}>
                            {isCorrect ? "✓ Đúng" : "Chưa chính xác"}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.opts.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const isTheCorrectAns = optIdx === q.ans;

                          let borderStyle = '1px solid var(--surface-border)';
                          let bgStyle = 'var(--surface-bg-card)';
                          if (finalExamSubmitted) {
                            if (isTheCorrectAns) {
                              borderStyle = '2px solid var(--semantic-success)';
                              bgStyle = 'var(--semantic-success-50)';
                            } else if (isSelected && !isCorrect) {
                              borderStyle = '2px solid var(--semantic-danger)';
                              bgStyle = 'var(--semantic-danger-50)';
                            }
                          } else if (isSelected) {
                            borderStyle = '2px solid var(--brand-primary)';
                            bgStyle = 'var(--brand-primary-50)';
                          }

                          return (
                            <div
                              key={optIdx}
                              className="quiz-option"
                              style={{ border: borderStyle, background: bgStyle }}
                              onClick={() => {
                                if (!finalExamSubmitted) {
                                  setFinalAnswers({ ...finalAnswers, [idx]: optIdx });
                                }
                              }}
                            >
                              <span style={{ fontWeight: 700, marginRight: '8px' }}>{String.fromCharCode(65 + optIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {finalExamSubmitted && q.exp && (
                        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--surface-bg-page)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                          <strong>Giải thích:</strong> {q.exp}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                {!finalExamSubmitted ? (
                  <button
                    className="btn-cta"
                    style={{ width: 'auto', padding: '12px 36px' }}
                    onClick={handleSubmitFinalExam}
                    disabled={Object.keys(finalAnswers).length < allExamQuestions.length}
                  >
                    <span>Nộp Bài Thi Cuối Khóa</span>
                    <Award size={18} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-outline"
                      onClick={() => {
                        setFinalExamSubmitted(false);
                        setFinalAnswers({});
                      }}
                    >
                      <RotateCcw size={16} /> Làm lại bài thi để ôn luyện
                    </button>
                    {onOpenCertificate && (
                      <button
                        className="btn-primary"
                        onClick={() => {
                          onClose();
                          onOpenCertificate();
                        }}
                      >
                        <FileCheck size={16} /> Xem Chứng Chỉ Điện Tử
                      </button>
                    )}
                    <button className="btn-cta" onClick={onClose} style={{ width: 'auto' }}>
                      <span>Hoàn Tất & Quay Lại Dashboard</span>
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'video' ? (
            /* Video Lecture Tab */
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentMod.title}
                </h3>
                <span className="badge badge-primary">{currentMod.duration}</span>
              </div>

              {/* Simulated Interactive Video Screen */}
              <div
                style={{
                  background: '#0B132B',
                  borderRadius: 'var(--radius-md)',
                  aspectRatio: '16 / 9',
                  maxHeight: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '16px',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-accent" style={{ background: 'rgba(255, 122, 0, 0.9)', color: '#fff' }}>
                    {currentMod.code} • Chuẩn DigComp
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.85 }}>Độ phân giải: 1080p HD</span>
                </div>

                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
                    {currentMod.title}
                  </div>
                  <p style={{ fontSize: '13px', opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
                    {currentMod.description}
                  </p>
                </div>

                {/* Video controls */}
                <div>
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      marginBottom: '10px',
                      overflow: 'hidden'
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      setVideoProgress(Math.round(clickPos * 100));
                    }}
                  >
                    <div style={{ width: `${videoProgress}%`, height: '100%', background: 'var(--brand-accent)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <span style={{ fontSize: '12px', opacity: 0.9 }}>
                        {Math.floor((videoProgress * 15) / 100)}:30 / 15:00
                      </span>
                    </div>

                    <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                      Tốc độ: 1.25x
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Description & Practice Guide */}
              <div style={{ marginTop: '20px', background: 'var(--surface-bg-page)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: 'var(--brand-primary-dark)' }}>
                  📖 Nội Dung Lý Thuyết & Yêu Cầu Thực Hành:
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {currentMod.description}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button className="btn-cta" style={{ width: 'auto', padding: '8px 20px', fontSize: '13px' }} onClick={() => setActiveTab('quiz')}>
                    <span>{isCurrentModuleCompleted ? "Xem Lại Bài Kiểm Tra Module" : "Làm Bài Kiểm Tra Module"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Module Quiz Tab */
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Kiểm Tra Năng Lực Thành Phần: {currentMod.title}
                </h3>
                <span className="badge badge-primary">{currentMod.code}</span>
              </div>

              {/* Already Completed Notice in Review Mode */}
              {isCurrentModuleCompleted && !isRetestingModule && (
                <div
                  style={{
                    background: 'var(--semantic-success-50)',
                    border: '1px solid var(--semantic-success)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="var(--semantic-success)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--semantic-success)' }}>
                      Module này đã được bạn hoàn thành trước đó (100% Chính xác).
                    </span>
                  </div>
                  <button
                    className="btn-outline"
                    style={{ fontSize: '12px', padding: '4px 12px', color: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' }}
                    onClick={() => {
                      setIsRetestingModule(true);
                      setModuleSubmitted(false);
                      setModuleAnswer(null);
                    }}
                  >
                    <RotateCcw size={13} /> Làm lại để ôn tập
                  </button>
                </div>
              )}

              {modQuiz ? (
                <div style={{ padding: '18px', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-bg-card)', marginBottom: '20px' }}>
                  <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '14px' }}>
                    {modQuiz.q}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {modQuiz.opts.map((opt, idx) => {
                      const isSelected = isRetestingModule
                        ? moduleAnswer === idx
                        : isCurrentModuleCompleted
                          ? idx === modQuiz.ans
                          : moduleAnswer === idx;

                      const isTheRightOne = idx === modQuiz.ans;
                      const showAsSuccess = (isCurrentModuleCompleted && !isRetestingModule && isTheRightOne) || (moduleSubmitted && isTheRightOne);

                      return (
                        <div
                          key={idx}
                          className={`quiz-option ${isSelected ? 'selected' : ''}`}
                          style={{
                            borderColor: showAsSuccess ? 'var(--semantic-success)' : undefined,
                            background: showAsSuccess ? 'var(--semantic-success-50)' : undefined
                          }}
                          onClick={() => {
                            if (!moduleSubmitted && (!isCurrentModuleCompleted || isRetestingModule)) {
                              setModuleAnswer(idx);
                            }
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: '8px' }}>{String.fromCharCode(65 + idx)}.</span>
                          <span>{opt}</span>
                          {showAsSuccess && <span style={{ marginLeft: 'auto', color: 'var(--semantic-success)', fontSize: '12px', fontWeight: 700 }}>✓ Đáp án đúng</span>}
                        </div>
                      );
                    })}
                  </div>

                  {(moduleSubmitted || (isCurrentModuleCompleted && !isRetestingModule)) && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: (moduleCorrect || isCurrentModuleCompleted) ? 'var(--semantic-success-50)' : 'var(--semantic-danger-50)',
                        border: `1px solid ${(moduleCorrect || isCurrentModuleCompleted) ? 'var(--semantic-success)' : 'var(--semantic-danger)'}`,
                        fontSize: '13px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <strong>{(moduleCorrect || isCurrentModuleCompleted) ? "✓ Chính xác!" : "✗ Chưa chính xác!"} </strong>
                      {modQuiz.exp}
                    </div>
                  )}
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {(!isCurrentModuleCompleted || isRetestingModule) && !moduleSubmitted ? (
                  <button
                    className="btn-primary"
                    onClick={handleCheckModuleQuiz}
                    disabled={moduleAnswer === null}
                  >
                    Xác Nhận Đáp Án
                  </button>
                ) : (
                  <>
                    {!moduleCorrect && !isCurrentModuleCompleted && (
                      <button
                        className="btn-outline"
                        onClick={() => {
                          setModuleSubmitted(false);
                          setModuleAnswer(null);
                        }}
                      >
                        <RotateCcw size={15} /> Thử lại
                      </button>
                    )}
                    <button className="btn-cta" style={{ width: 'auto' }} onClick={handleNextStep}>
                      <span>{activeModuleIndex < course.modules.length - 1 ? "Module Tiếp Theo" : "Đi Tới Bài Thi Cuối Khóa"}</span>
                      <ArrowRight size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
