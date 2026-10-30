import { useState } from 'react';
import { BookOpen, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

export interface AskReviewerModalProps {
  open: boolean;
  onClose: () => void;
  reviewerName: string;
  reviewerRole?: string;
  courseCode: string;
  courseTitle: string;
  moduleTitle: string;
  slideIndex: number;
  slideTitle?: string;
}

const QUICK_SUGGESTIONS = [
  'Quy định này áp dụng thực tế tại phòng ban mình thế nào?',
  'Minh chứng nào là hợp lệ cho bài thi cuối khóa?',
  'Tôi chưa rõ tình huống xử lý ở slide này.',
];

export function AskReviewerModal({
  open,
  onClose,
  reviewerName,
  reviewerRole = 'Quản lý phòng ban · Người đánh giá',
  courseCode,
  courseTitle,
  moduleTitle,
  slideIndex,
  slideTitle,
}: AskReviewerModalProps) {
  const [question, setQuestion] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    setIsSent(true);
    setTimeout(() => {
      toast.success(
        `Đã gửi câu hỏi tới ${reviewerName}. Phản hồi sẽ hiển thị tại mục Nhật ký hoạt động.`
      );
      setIsSent(false);
      setQuestion('');
      onClose();
    }, 400);
  };

  return (
    <div className="pu-modal-portal" role="dialog" aria-modal="true" aria-labelledby="pu-ask-title">
      <div className="pu-modal-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="pu-ask-modal-card">
        {/* Header */}
        <header className="pu-ask-header">
          <div className="pu-ask-header-icon">
            <MessageSquare size={20} className="text-blue-700" />
          </div>
          <div className="pu-ask-header-text">
            <h3 id="pu-ask-title" className="pu-ask-title">
              Hỏi Quản lý {reviewerName}
            </h3>
            <p className="pu-ask-sub">{reviewerRole}</p>
          </div>
          <button
            type="button"
            className="pu-modal-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        {/* Lesson Context Pill */}
        <div className="pu-ask-context">
          <BookOpen size={14} className="text-slate-500 shrink-0" />
          <div className="pu-ask-context-text">
            <strong>{courseCode} · {courseTitle}</strong>
            <span>
              Mô-đun: {moduleTitle} {slideTitle ? `· Trang ${slideIndex + 1}: ${slideTitle}` : `· Trang ${slideIndex + 1}`}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pu-ask-form">
          <div className="pu-ask-prompts-label">
            <Sparkles size={13} className="text-blue-700" />
            <span>Gợi ý câu hỏi thường gặp:</span>
          </div>
          <div className="pu-ask-chips">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="pu-ask-chip"
                onClick={() => setQuestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <label htmlFor="pu-ask-input" className="pu-ask-label">
            Nội dung câu hỏi hoặc vướng mắc thực tế:
          </label>
          <textarea
            id="pu-ask-input"
            rows={4}
            className="pu-ask-textarea"
            placeholder="Mô tả cụ thể thắc mắc của bạn về kiến thức bài học hoặc nghiệp vụ thực tế tại cơ quan..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={1000}
            required
          />
          <div className="pu-ask-meta-row">
            <small className="pu-ask-sla">⏱ Cam kết phản hồi trong 24h - 48h làm việc</small>
            <small className="pu-ask-count">{question.length}/1000</small>
          </div>

          {/* Footer Actions */}
          <footer className="pu-ask-footer">
            <button
              type="button"
              className="pu-ask-cancel-btn"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="pu-ask-submit-btn"
              disabled={isSent || !question.trim()}
            >
              <Send size={15} />
              <span>{isSent ? 'Đang gửi...' : 'Gửi câu hỏi'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
