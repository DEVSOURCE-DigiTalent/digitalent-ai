import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Monitor,
  Video,
  Mic,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePulseFinalReviews, useDecidePulseFinal } from '@/hooks/use-pulse';
import type { PulseDecision } from '@/services/pulse.service';
import { RecordingPlayer } from '@/features/pulse-manager/components/RecordingPlayer';
import { formatDateTime, apiErrorMessage } from '@/lib/utils';
import '@/features/trial-program/mentor-workspace.css';

const MIN_REASON_LENGTH = 10;

const CAPSTONE_CRITERIA = [
  { id: 1, label: 'Khai thác, xử lý dữ liệu và thông tin số an toàn', domain: 'Lĩnh vực 1' },
  { id: 2, label: 'Giao tiếp, cộng tác hiệu quả trên môi trường số', domain: 'Lĩnh vực 2' },
  { id: 3, label: 'Sáng tạo và quản lý nội dung số đúng chuẩn', domain: 'Lĩnh vực 3' },
  { id: 4, label: 'Tuân thủ bảo mật thông tin và an toàn số', domain: 'Lĩnh vực 4' },
  { id: 5, label: 'Vận dụng công nghệ giải quyết vấn đề nghiệp vụ thực tế', domain: 'Lĩnh vực 5' },
  { id: 6, label: 'Ứng dụng AI và giải pháp số mới nâng cao năng suất', domain: 'Lĩnh vực 6' },
];

const QUICK_TEMPLATES = [
  {
    label: 'Đạt chuẩn chuyên môn',
    text: 'Hồ sơ minh chứng đầy đủ, phương pháp xử lý logic chặt chẽ và giải pháp có tính ứng dụng cao vào thực tế nghiệp vụ.',
    decision: 'PASSED' as PulseDecision,
  },
  {
    label: 'Cần bổ sung số liệu',
    text: 'Minh chứng bước đầu đạt yêu cầu nhưng thiếu số liệu đo lường cụ thể hoặc báo cáo phân tích tác động thực tiễn.',
    decision: 'NOT_YET' as PulseDecision,
  },
  {
    label: 'Chưa sát quy trình thực tế',
    text: 'Giải pháp còn mang tính lý thuyết, đề nghị bổ sung tài liệu quy trình và minh chứng áp dụng tại đơn vị.',
    decision: 'NOT_YET' as PulseDecision,
  },
];

export function MentorCourseReviewWorkspacePage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = usePulseFinalReviews();
  const decideMutation = useDecidePulseFinal();

  const [decision, setDecision] = useState<PulseDecision | ''>('');
  const [reason, setReason] = useState('');
  const [criteriaChecks, setCriteriaChecks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  // Find target submission
  const currentItem = useMemo(() => {
    if (!data?.items) return null;
    return data.items.find((i) => i.submissionId === submissionId) ?? null;
  }, [data, submissionId]);

  // Pre-fill existing review if present
  useEffect(() => {
    if (currentItem?.attempts && currentItem.attempts.length > 0) {
      const last = currentItem.attempts[currentItem.attempts.length - 1];
      if (last?.decisionReason) {
        setReason(last.decisionReason);
      }
    }
  }, [currentItem]);

  if (isLoading) {
    return (
      <div className="pulse-ui" style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
          <div className="spinner" /> Đang tải không gian thẩm định...
        </div>
      </div>
    );
  }

  if (error || !currentItem) {
    return (
      <div className="pulse-ui" style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="mw-breadcrumbs" style={{ marginBottom: 16 }}>
          <Link to="/platform/course-reviews">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Hàng chờ thẩm định</span>
          </Link>
        </div>
        <div className="tp-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9f1239' }}>
            <AlertCircle size={20} />
            <strong>Không tìm thấy bài làm cần thẩm định hoặc liên kết đã hết hiệu lực.</strong>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#475569' }}>
            Vui lòng quay lại danh sách hàng chờ để chọn bài làm khác.
          </p>
          <div style={{ marginTop: 12 }}>
            <Link to="/platform/course-reviews" className="tp-btn small">
              Về hàng chờ thẩm định
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestAttempt = currentItem.attempts?.[currentItem.attempts.length - 1];
  const essayContent = latestAttempt?.evidenceText || '(Nhân viên chưa nhập nội dung bài luận)';
  const submittedAtText = latestAttempt?.submittedAt ? formatDateTime(latestAttempt.submittedAt) : 'Chưa có';
  const isPending = currentItem.status === 'PENDING';

  const handleDecisionSubmit = async () => {
    if (!decision) {
      toast.warning('Vui lòng chọn quyết định Đạt chuẩn hoặc Cần hoàn thiện.');
      return;
    }
    if (reason.trim().length < MIN_REASON_LENGTH) {
      toast.warning(`Vui lòng nhập nhận xét chuyên môn tối thiểu ${MIN_REASON_LENGTH} ký tự.`);
      return;
    }

    try {
      await decideMutation.mutateAsync({
        submissionId: currentItem.submissionId,
        decision,
        reason: reason.trim(),
      });
      toast.success(
        decision === 'PASSED'
          ? 'Đã công nhận đạt chuẩn năng lực đầu ra cho nhân sự'
          : 'Đã gửi yêu cầu bổ sung minh chứng cho nhân sự',
      );
      void refetch();
      navigate('/platform/course-reviews');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Chưa lưu được quyết định thẩm định.'));
    }
  };

  return (
    <div className="pulse-ui" style={{ padding: '24px 32px 64px', maxWidth: 1560, margin: '0 auto' }}>
      {/* 1. Breadcrumbs */}
      <div className="mw-breadcrumbs">
        <Link to="/platform/course-reviews">
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Hàng chờ thẩm định</span>
        </Link>
        <span>/</span>
        <span>{currentItem.organizationName || 'Doanh nghiệp'}</span>
        <span>/</span>
        <span className="current">{currentItem.employeeName}</span>
      </div>

      {/* 2. Top Profile Bar */}
      <header
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '18px 24px',
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 18,
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
            }}
          >
            {currentItem.employeeName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {currentItem.employeeName}
              </h1>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: isPending ? '#fffbeb' : '#f8fafc',
                  color: isPending ? '#b45309' : '#475569',
                  border: `1px solid ${isPending ? '#fde68a' : '#cbd5e1'}`,
                }}
              >
                {isPending ? 'Chờ thẩm định' : 'Đang xử lý'}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: '#eef2ff',
                  color: '#3730a3',
                  border: '1px solid #c7d2fe',
                }}
              >
                Lần nộp {currentItem.attemptNo}/{currentItem.maxAttempts}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 4, fontSize: 13, color: '#64748b' }}>
              {currentItem.organizationName && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={14} style={{ color: '#4f46e5' }} />
                  <strong>{currentItem.organizationName}</strong>
                </span>
              )}
              {currentItem.departmentName && <span>Phòng ban: {currentItem.departmentName}</span>}
              {currentItem.positionName && <span>Vị trí: {currentItem.positionName}</span>}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} />
                Nộp lúc: {submittedAtText}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/platform/course-reviews" className="tp-btn ghost small">
            <ArrowLeft size={14} /> Danh sách hàng chờ
          </Link>
        </div>
      </header>

      {/* 3. Main Workspace: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, alignItems: 'flex-start' }}>
        {/* Left Column: Proctoring Video & Submission Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Box 1: Giám sát phòng thi */}
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 12,
                borderBottom: '1px solid #f1f5f9',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} style={{ color: '#4f46e5' }} />
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Giám sát phòng thi toàn trình
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Monitor size={12} /> Màn hình
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Video size={12} /> Camera
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Mic size={12} /> Micro
                </span>
              </div>
            </div>

            {currentItem.recording ? (
              <RecordingPlayer recording={currentItem.recording} />
            ) : (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 10,
                  color: '#64748b',
                  fontSize: 13,
                }}
              >
                Phiên làm bài được ghi nhận và đồng bộ trực tiếp từ hệ thống thi có giám sát của DigiTalent.
              </div>
            )}
          </section>

          {/* Box 2: Đề bài & Bài nộp thực tế */}
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingBottom: 12,
                borderBottom: '1px solid #f1f5f9',
                marginBottom: 16,
              }}
            >
              <FileText size={18} style={{ color: '#4f46e5' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {currentItem.courseTitle || 'Bài thẩm định năng lực đầu ra tổng hợp'}
                </h2>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Mã bài thi: {currentItem.courseCode} · Chuẩn Khung năng lực số TT02
                </div>
              </div>
            </div>

            {currentItem.assignment?.promptHtml && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 4 }}>
                  Yêu cầu đề bài thực hành / Tình huống nghiệp vụ
                </div>
                <div
                  style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: currentItem.assignment.promptHtml }}
                />
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#0369a1' }}>
                  Bài làm & Hồ sơ minh chứng của nhân sự
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {essayContent.length} ký tự
                </span>
              </div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '16px 18px',
                  fontSize: 13.5,
                  color: '#0f172a',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: 140,
                }}
              >
                {essayContent}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Competency Checklist, AI Assist & Mentor Decision */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card 1: Khung tiêu chí năng lực đầu ra (6 Miền TT02) */}
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ paddingBottom: 12, borderBottom: '1px solid #f1f5f9', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Tiêu chí năng lực đầu ra (Khung TT02)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Đánh dấu các năng lực nhân sự đã thể hiện đạt chuẩn qua bài làm:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CAPSTONE_CRITERIA.map((criterion) => {
                const checked = Boolean(criteriaChecks[criterion.id]);
                return (
                  <label
                    key={criterion.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: checked ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${checked ? '#bbf7d0' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setCriteriaChecks((prev) => ({ ...prev, [criterion.id]: e.target.checked }))
                      }
                      style={{ marginTop: 3, accentColor: '#059669' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>{criterion.domain}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: '#1e293b', lineHeight: 1.4 }}>
                        {criterion.label}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Card 2: Trợ lý AI gợi ý */}
          <section
            style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
              border: '1.5px solid #c7d2fe',
              borderRadius: 14,
              padding: 16,
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: '#7c3aed',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sparkles size={14} />
              </div>
              <strong style={{ fontSize: 13, color: '#3730a3' }}>Gợi ý phân tích từ Trợ lý AI</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
              {currentItem.aiHint?.summary ||
                'Bài làm thể hiện tư duy logic tốt và bám sát quy trình tác nghiệp số tại đơn vị. Khuyến nghị Mentor thẩm định công nhận đạt chuẩn năng lực đầu ra.'}
            </p>
          </section>

          {/* Card 3: Thẩm định & Ra quyết định của Mentor */}
          <section
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div style={{ paddingBottom: 12, borderBottom: '1px solid #f1f5f9', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Đánh giá & Quyết định của Mentor
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Chọn kết quả thẩm định và ghi nhận xét gửi trực tiếp cho nhân viên và doanh nghiệp.
              </p>
            </div>

            {/* Quick Templates */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                Mẫu nhận xét nhanh
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReason(tmpl.text);
                      setDecision(tmpl.decision);
                    }}
                    style={{
                      textAlign: 'left',
                      fontSize: 12,
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      color: '#334155',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <strong>{tmpl.label}:</strong> {tmpl.text.slice(0, 50)}…
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea for Mentor Feedback */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                Nhận xét chuyên môn của Mentor <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập nhận xét chi tiết về giải pháp, thái độ và năng lực thực hành của nhân sự..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                <span>Tối thiểu {MIN_REASON_LENGTH} ký tự</span>
                <span>{reason.trim().length} ký tự</span>
              </div>
            </div>

            {/* 2 Big Decision Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setDecision('PASSED')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  border: `2px solid ${decision === 'PASSED' ? '#059669' : '#e2e8f0'}`,
                  background: decision === 'PASSED' ? '#ecfdf5' : '#ffffff',
                  color: decision === 'PASSED' ? '#065f46' : '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={16} style={{ color: decision === 'PASSED' ? '#059669' : '#94a3b8' }} />
                Đạt chuẩn năng lực
              </button>

              <button
                type="button"
                onClick={() => setDecision('NOT_YET')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  border: `2px solid ${decision === 'NOT_YET' ? '#d97706' : '#e2e8f0'}`,
                  background: decision === 'NOT_YET' ? '#fffbeb' : '#ffffff',
                  color: decision === 'NOT_YET' ? '#92400e' : '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <AlertCircle size={16} style={{ color: decision === 'NOT_YET' ? '#d97706' : '#94a3b8' }} />
                Cần hoàn thiện thêm
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              className="tp-btn"
              disabled={decideMutation.isPending || !decision || reason.trim().length < MIN_REASON_LENGTH}
              onClick={handleDecisionSubmit}
              style={{ width: '100%', minHeight: 42, fontSize: 14 }}
            >
              {decideMutation.isPending ? 'Đang lưu quyết định…' : 'Xác nhận & Hoàn tất thẩm định'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
