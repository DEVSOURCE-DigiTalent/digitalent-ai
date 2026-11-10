import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Send,
  Calendar,
  Clock,
  Sparkles,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import {
  DepartmentAudienceSelector,
  type AudienceSelection,
} from './DepartmentAudienceSelector';
import { notificationService } from '@/services/notification.service';
import { apiErrorMessage } from '@/lib/utils';
import './send-announcement.css';

interface SendAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TemplateOption {
  label: string;
  type: string;
  title: string;
  message: string;
  days: number;
}

const TEMPLATES: TemplateOption[] = [
  {
    label: 'Đánh giá năng lực',
    type: 'ASSESSMENT',
    title: 'Thông báo: Tham gia đợt đánh giá năng lực định kỳ',
    message:
      'Ban Quản trị yêu cầu bạn hoàn thành bài đánh giá khung năng lực số để làm cơ sở xây dựng lộ trình phát triển và đào tạo phù hợp. Vui lòng truy cập hệ thống và hoàn thành trước thời hạn quy định.',
    days: 7,
  },
  {
    label: 'Khóa học bắt buộc',
    type: 'COURSE',
    title: 'Yêu cầu: Hoàn thành khóa đào tạo chuyên môn bắt buộc',
    message:
      'Bạn vừa được phân công khóa học mới trong chương trình đào tạo của doanh nghiệp. Đề nghị bạn sắp xếp thời gian biểu để học tập và làm bài kiểm tra cuối khóa đúng hạn.',
    days: 14,
  },
  {
    label: 'Khảo sát doanh nghiệp',
    type: 'GENERAL',
    title: 'Khảo sát: Thu thập ý kiến và mức độ gắn kết nhân sự',
    message:
      'Nhằm nâng cao trải nghiệm làm việc và môi trường doanh nghiệp, Ban Lãnh đạo kính mời bạn dành ít phút đóng góp ý kiến trung thực qua phiếu khảo sát trên hệ thống.',
    days: 3,
  },
];

const localDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function SendAnnouncementModal({
  open,
  onClose,
  onSuccess,
}: SendAnnouncementModalProps) {
  useUiLanguage();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [autoRemind, setAutoRemind] = useState(true);
  const [audience, setAudience] = useState<AudienceSelection>({
    mode: 'all',
    departmentIds: [],
    employeeIds: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [result, setResult] = useState<{
    totalRecipients: number;
    inAppNotificationCount: number;
    emailsSentCount: number;
  }>();

  // Apply template
  const applyTemplate = (t: TemplateOption) => {
    setTitle(t.title);
    setType(t.type);
    setMessage(t.message);

    const d = new Date();
    d.setDate(d.getDate() + t.days);
    setDueDate(localDateValue(d));
  };

  // Quick deadline setter
  const setQuickDeadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(localDateValue(d));
  };

  const setEndOfMonth = () => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    setDueDate(localDateValue(lastDay));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setSubmitError('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!message.trim()) {
      setSubmitError('Vui lòng nhập nội dung thông báo.');
      return;
    }

    setSubmitting(true);
    setSubmitError(undefined);

    try {
      const response = await notificationService.broadcast({
        title: title.trim(),
        message: message.trim(),
        type,
        dueDate: dueDate || undefined,
        sendEmail,
        autoRemind,
        targetDepartmentIds:
          audience.mode === 'departments' ? audience.departmentIds : undefined,
        targetEmployeeIds:
          audience.mode !== 'all' ? audience.employeeIds : undefined,
      });

      const outcome = response.data.data;
      if (outcome) {
        setResult(outcome);
        toast.success(`Đã gửi thông báo thành công tới ${outcome.totalRecipients} nhân sự!`);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Không thể gửi thông báo. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setType('ANNOUNCEMENT');
    setMessage('');
    setDueDate('');
    setSendEmail(true);
    setAutoRemind(true);
    setAudience({ mode: 'all', departmentIds: [], employeeIds: [] });
    setResult(undefined);
    setSubmitError(undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleReset}
      size="xl"
      className="announcement-modal"
      title={translateUi("Gửi thông báo & Giao hạn hoàn thành")}
      description={translateUi("Gửi thông điệp, yêu cầu hoàn thành bài đánh giá/khóa học và đặt deadline đồng loạt cho nhân viên.")}
      footer={
        <>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {result ? translateUi('Đóng') : translateUi('Hủy bỏ')}
          </button>

          {!result && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#137b84] hover:bg-[#0e5968] text-white text-sm font-bold transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xs"
            >
              <Send className="size-3.5" />
              {submitting ? 'Đang gửi thông báo…' : translateUi('Gửi thông báo ngay')}
            </button>
          )}
        </>
      }
    >
      {result ? (
        <div className="space-y-4 py-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="size-5 text-emerald-600" />{translateUi("Đã gửi thông báo thành công tới ")}{result.totalRecipients}{translateUi(" nhân sự!")}</div>
            <p className="text-xs text-slate-600 leading-relaxed">{translateUi("Thông báo đã được ghi nhận trên hệ thống và hiển thị tức thì trên chuông thông báo cá nhân của nhân viên.")}{sendEmail && (
                <span>{translateUi(" Đã phát lệnh gửi email thông báo chi tiết đến hòm thư của nhân sự.")}</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="text-slate-500 block">{translateUi("Thông báo in-app (chuông)")}</span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{result.inAppNotificationCount}{translateUi(" đã tạo")}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <span className="text-slate-500 block">{translateUi("Email hộp thư thật")}</span>
              <strong className="text-slate-900 text-sm mt-0.5 block">{result.emailsSentCount}{translateUi(" đã gửi")}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="announcement-content">
          {/* MẪU GỢI Ý NHANH (TEMPLATES) */}
          <div className="announcement-templates space-y-2">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />{translateUi("Chọn nhanh mẫu nội dung:")}</span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/60 hover:border-teal-200 hover:text-[#137b84] text-sm font-medium text-slate-700 transition-all"
                >
                  <FileText className="size-3 text-slate-400" />
                  {translateUi(tpl.label)}
                </button>
              ))}
            </div>
          </div>

          {/* TIÊU ĐỀ & LOẠI THÔNG BÁO */}
          <div className="announcement-title grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-3 space-y-1">
              <label htmlFor="announcement-title" className="text-sm font-bold text-slate-800 block">{translateUi("Tiêu đề thông báo ")}<span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={translateUi("Ví dụ: Thông báo hoàn thành đợt đánh giá năng lực Q4")}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="announcement-type" className="text-sm font-bold text-slate-800 block">{translateUi("Phân loại")}</label>
              <select
                id="announcement-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                <option value="ANNOUNCEMENT">{translateUi("Thông báo chung")}</option>
                <option value="ASSESSMENT">{translateUi("Đánh giá / Test")}</option>
                <option value="COURSE">{translateUi("Khóa học")}</option>
                <option value="TASK">{translateUi("Nhiệm vụ")}</option>
              </select>
            </div>
          </div>

          {/* NỘI DUNG THÔNG BÁO */}
          <div className="announcement-message space-y-1.5">
            <label htmlFor="announcement-message" className="text-sm font-bold text-slate-800 block">{translateUi("Nội dung thông điệp ")}<span className="text-red-500">*</span>
            </label>
            <textarea
              id="announcement-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={translateUi("Nhập nội dung yêu cầu, mục đích và hướng dẫn nhân viên hoàn thành...")}
              className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 leading-relaxed"
            />
          </div>

          {/* HẠN HOÀN THÀNH (DEADLINE) */}
          <div className="announcement-deadline rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-[var(--po-accent)]" />{translateUi("Thời hạn hoàn thành (Deadline):")}</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDeadline(3)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-200"
                >{translateUi("3 ngày")}</button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(7)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-200"
                >{translateUi("7 ngày")}</button>
                <button
                  type="button"
                  onClick={setEndOfMonth}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-200"
                >{translateUi("Cuối tháng")}</button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                aria-label={translateUi("Thời hạn hoàn thành")}
                value={dueDate}
                min={localDateValue(new Date())}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
              <span className="text-xs text-slate-500">
                {dueDate
                  ? translateUi(`Hạn nộp: ${dueDate.split('-').reverse().join('/')}`)
                  : translateUi('Không đặt hạn chót (thông báo thường)')}
              </span>
            </div>
          </div>

          {/* BỘ CHỌN ĐỐI TƯỢNG (AUDIENCE SELECTOR) */}
          <div className="announcement-audience space-y-2">
            <span className="text-sm font-bold text-slate-900 block">{translateUi("Đối tượng nhận thông báo:")}</span>
            <DepartmentAudienceSelector
              value={audience}
              onChange={setAudience}
            />
          </div>

          {/* CÁC TÙY CHỌN GỬI THÊM */}
          <div className="announcement-options grid gap-3 sm:grid-cols-2 text-sm">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="size-4 text-[var(--po-accent)] rounded-sm focus:ring-[var(--po-accent)]"
              />
              <div>
                <span className="font-semibold text-slate-900 block flex items-center gap-1">
                  <Mail className="size-3.5 text-[var(--po-accent)]" />{translateUi(" Gửi email thông báo")}</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Bắn email định dạng chuẩn vào hòm thư nhân viên
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRemind}
                onChange={(e) => setAutoRemind(e.target.checked)}
                className="size-4 text-[var(--po-accent)] rounded-sm focus:ring-[var(--po-accent)]"
              />
              <div>
                <span className="font-semibold text-slate-900 block flex items-center gap-1">
                  <Clock className="size-3.5 text-amber-500" />{translateUi(" Tự động nhắc nhở")}</span>
                <span className="text-xs text-slate-500 block mt-0.5">{translateUi("Tự động gửi mail nhắc trước khi hết hạn 24 giờ")}</span>
              </div>
            </label>
          </div>

          {submitError && (
            <div className="announcement-error rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
