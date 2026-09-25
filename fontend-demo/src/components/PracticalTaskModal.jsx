import React, { useState } from 'react';
import { X } from 'lucide-react';
import './workspaceRefresh.css';

export default function PracticalTaskModal({ onClose, onSubmitTask, existingSubmission, selectedRole, course }) {
  const [title, setTitle] = useState(existingSubmission?.campaignTitle || '');
  const [link, setLink] = useState(existingSubmission?.driveLink || '');
  const [outcome, setOutcome] = useState(existingSubmission?.assetNotes || '');
  const [validation, setValidation] = useState(existingSubmission?.abTestHypothesis || '');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !link.trim() || !outcome.trim()) { setError('Vui lòng điền tên công việc, minh chứng và kết quả.'); return; }
    if (!agreed) { setError('Vui lòng xác nhận quyền chia sẻ minh chứng.'); return; }
    onSubmitTask({ courseId: course?.id, courseTitle: course?.title, campaignTitle:title.trim(), driveLink:link.trim(), assetNotes:outcome.trim(), abTestHypothesis:validation.trim(), submittedAt:new Date().toLocaleString('vi-VN'), status:'pending_manager', score:null, managerFeedback:null });
    onClose();
  }
  return <div className="modal-overlay" onClick={onClose}><div className="modal-content rf" style={{maxWidth:660}} onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="rf-eyebrow">MINH CHỨNG CÔNG VIỆC · {selectedRole?.roleTitle || 'VỊ TRÍ ĐÃ CHỌN'}</span><h2>Nộp bài thực hành</h2></div><button onClick={onClose} aria-label="Đóng"><X size={20}/></button></div><form onSubmit={submit}><div className="modal-body rf-form"><p>{course ? `Khóa ${course.id}: ${course.title}. ` : ''}Chọn một công việc thực tế có thể chứng minh cách bạn dùng công cụ số. Trưởng phòng sẽ xem nội dung và chấm theo thang 100 điểm.</p>{course?.finalAssessment?.length > 0 && <details className="rf-prompt"><summary>Yêu cầu thực hành của khóa</summary><div className="rf-text-list">{course.finalAssessment.map((item,index)=><p key={index}>{item}</p>)}</div></details>}<label>Tên công việc hoặc dự án<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ví dụ: Cải thiện quy trình báo cáo tuần" required/></label><label>Liên kết minh chứng<input type="url" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..." required/></label><label>Kết quả và đóng góp của bạn<textarea value={outcome} onChange={e=>setOutcome(e.target.value)} placeholder="Mô tả sản phẩm, số liệu trước và sau, phần việc của bạn" required/></label><label>Cách kiểm tra kết quả và bảo vệ dữ liệu<textarea value={validation} onChange={e=>setValidation(e.target.value)} placeholder="Cách kiểm thử, kiểm tra chất lượng hoặc xử lý dữ liệu nhạy cảm"/></label><label className="rf-checkbox"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/> Tôi có quyền chia sẻ liên kết và đã kiểm tra dữ liệu nhạy cảm.</label>{error && <div className="rf-note rf-danger" role="alert">{error}</div>}</div><div className="modal-footer"><button className="rf-secondary" type="button" onClick={onClose}>Hủy</button><button className="rf-primary" type="submit">Gửi trưởng phòng đánh giá</button></div></form></div></div>;
}
