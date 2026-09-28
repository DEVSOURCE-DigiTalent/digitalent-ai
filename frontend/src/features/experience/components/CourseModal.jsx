import React, { useState } from 'react';
import { X, BookOpen, HelpCircle, CheckCircle2, XCircle, ArrowRight, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CourseModal({ course, onClose, onCompleteQuiz }) {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'quiz'
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    course.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / course.quiz.length) * 100);
    setScoreResult({
      correctCount,
      total: course.quiz.length,
      percentage,
      passed: percentage >= 50
    });
    setSubmitted(true);

    if (percentage >= 50) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully
      }
      onCompleteQuiz(course.areaId, percentage);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScoreResult(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary">{course.code}</span>
              <span className="badge badge-accent">{course.level}</span>
            </div>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher: Lý thuyết bài học vs Đánh giá năng lực */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-border)', padding: '0 var(--spacing-lg)', background: 'var(--surface-bg-page)' }}>
          <button
            onClick={() => setActiveTab('lessons')}
            style={{
              padding: '12px 16px',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'lessons' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'lessons' ? '2px solid var(--brand-primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={16} />
            <span>Nội dung bài học ({course.lessons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            style={{
              padding: '12px 16px',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'quiz' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'quiz' ? '2px solid var(--brand-primary)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={16} />
            <span>Kiểm tra năng lực thực hành ({course.quiz.length} câu)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'lessons' ? (
            <div>
              <div style={{ background: 'var(--brand-primary-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '6px' }}>Mục tiêu học tập</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{course.description}</p>
              </div>

              <h4 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px' }}>Danh sách bài giảng chuyên sâu:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {course.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--surface-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--surface-bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--brand-primary)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{lesson.title}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lesson.duration}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  className="btn-cta"
                  style={{ width: 'auto', padding: '12px 32px' }}
                  onClick={() => setActiveTab('quiz')}
                >
                  <span>Chuyển sang làm bài kiểm tra</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Quiz section */}
              {submitted && scoreResult && (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    background: scoreResult.passed ? 'var(--semantic-success-50)' : 'var(--semantic-warning-50)',
                    border: `1px solid ${scoreResult.passed ? 'var(--semantic-success)' : 'var(--semantic-warning)'}`,
                    textAlign: 'center'
                  }}
                >
                  <Award
                    size={36}
                    color={scoreResult.passed ? 'var(--semantic-success)' : 'var(--semantic-warning)'}
                    style={{ margin: '0 auto 8px' }}
                  />
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                    {scoreResult.passed ? "Chúc mừng! Bạn đã đạt chuẩn năng lực!" : "Bạn chưa đạt chuẩn yêu cầu"}
                  </h3>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>
                    Kết quả: {scoreResult.correctCount}/{scoreResult.total} câu đúng ({scoreResult.percentage}%) - Mức năng lực của bạn đã được cập nhật trên hệ thống.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {course.quiz.map((q, qIndex) => {
                  return (
                    <div key={q.id} style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px' }}>
                      <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                        Câu {qIndex + 1}: {q.question}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selectedAnswers[qIndex] === optIndex;
                          let optClass = 'quiz-option';
                          if (submitted) {
                            if (optIndex === q.correct) optClass += ' correct';
                            else if (isSelected) optClass += ' incorrect';
                          } else if (isSelected) {
                            optClass += ' selected';
                          }

                          return (
                            <div
                              key={optIndex}
                              className={optClass}
                              onClick={() => handleSelectOption(qIndex, optIndex)}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '1px solid currentColor',
                                marginRight: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {submitted && optIndex === q.correct && (
                                <CheckCircle2 size={16} color="var(--semantic-success)" />
                              )}
                              {submitted && isSelected && optIndex !== q.correct && (
                                <XCircle size={16} color="var(--semantic-danger)" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {submitted && (
                        <div style={{
                          marginTop: '10px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--surface-bg-page)',
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          borderLeft: '3px solid var(--brand-primary)'
                        }}>
                          <strong>Giải thích chuẩn năng lực: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
          {activeTab === 'quiz' && (
            submitted ? (
              <button className="btn-primary" onClick={handleRetry}>
                <RotateCcw size={16} />
                <span>Làm lại bài kiểm tra</span>
              </button>
            ) : (
              <button
                className="btn-cta"
                style={{ width: 'auto' }}
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
              >
                <span>Nộp bài đánh giá</span>
                <CheckCircle2 size={16} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
