import { useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, CalendarDays, CircleAlert, UserRound, X } from 'lucide-react';
import { Modal } from '@/components/shared';
import { useCancelAssignment } from '@/hooks/use-assignments';
import { apiErrorMessage, formatDate } from '@/lib/utils';
import type { AssignmentRow } from '@/services/assignment.service';
import './cancel-assignment-dialog.css';

export function CancelAssignmentDialog({ assignment, onClose }: { assignment: AssignmentRow; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const cancel = useCancelAssignment();
  const pending = cancel.isPending;
  const close = () => { if (!pending) onClose(); };
  const submit = async () => {
    const cleanReason = reason.trim();
    if (!cleanReason || pending) return;
    setError('');
    try {
      await cancel.mutateAsync({ id: assignment.id, reason: cleanReason });
      toast.success('Đã hủy lượt giao khóa học.');
      onClose();
    } catch (failure) {
      setError(apiErrorMessage(failure, failure instanceof Error ? failure.message : 'Không hủy được lượt giao. Vui lòng thử lại.'));
    }
  };

  return <Modal open onClose={close} size="md" className="cancel-assignment-dialog" title="Hủy giao khóa học" description="Kiểm tra lượt giao trước khi xác nhận.">
    <div className="cancel-assignment-body">
      <div className="cancel-assignment-context">
        <span className="cancel-assignment-context-icon"><BookOpen size={22} /></span>
        <div><small>KHÓA HỌC ĐANG GIAO</small><strong>{assignment.courseTitle}</strong><span>{assignment.courseCode}</span></div>
      </div>
      <div className="cancel-assignment-info">
        <div><UserRound size={17} /><span>Nhân viên</span><strong>{assignment.employeeName}</strong></div>
        <div><CalendarDays size={17} /><span>Hạn hoàn thành</span><strong>{assignment.dueDate ? formatDate(assignment.dueDate) : 'Theo thiết lập'}</strong></div>
      </div>
      <div className="cancel-assignment-note"><CircleAlert size={18} /><span>Lượt giao sẽ được hủy. Tiến độ đã học vẫn được giữ lại nếu giao lại sau này.</span></div>
      <div className="cancel-assignment-reason">
        <label htmlFor="cancel-assignment-reason">Lý do hủy <span>*</span></label>
        <textarea id="cancel-assignment-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhập lý do hủy lượt giao…" rows={3} disabled={pending} maxLength={500} />
        <small>{reason.length}/500 ký tự</small>
      </div>
      {error && <p role="alert" className="cancel-assignment-error">{error}</p>}
      <div className="cancel-assignment-actions">
        <button type="button" onClick={close} disabled={pending}>Giữ lượt giao</button>
        <button type="button" onClick={submit} disabled={!reason.trim() || pending}><X size={16} />{pending ? 'Đang hủy…' : 'Xác nhận hủy'}</button>
      </div>
    </div>
  </Modal>;
}
