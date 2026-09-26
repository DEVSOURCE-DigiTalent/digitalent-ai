import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog';
import { getDemoCompletionCode } from '../utils/demoCompletion';
import './workspaceRefresh.css';

export default function CertificateModal({ onClose, onOpenPublicVerification, completedCourses = {}, user, activeCourseId }) {
  const entries = Object.entries(completedCourses).filter(([,data])=>data?.completed);
  const selected = entries.find(([id])=>id===activeCourseId) || entries[0];
  const course = selected && ALL_DIGCOMP_COURSES[selected[0]];
  return <div className="modal-overlay" onClick={onClose}><div className="modal-content rf" style={{maxWidth:620}} onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="rf-eyebrow">XÁC NHẬN HỌC TẬP · BẢN DEMO</span><h2>Kết quả hoàn thành khóa học</h2></div><button onClick={onClose} aria-label="Đóng"><X size={20}/></button></div><div className="modal-body">{selected?<div className="rf-panel"><CheckCircle2 size={30} color="var(--semantic-success)"/><h2>{course?.title || selected[0]}</h2><div className="rf-rows"><div className="rf-row"><span>Người học</span><strong>{user?.name}</strong></div><div className="rf-row"><span>Điểm cuối khóa</span><strong>{selected[1].score}/100</strong></div><div className="rf-row"><span>Hoàn thành</span><strong>{selected[1].completedAt}</strong></div><div className="rf-row"><span>Mã tra cứu demo</span><strong>{getDemoCompletionCode(user?.id,selected[0])}</strong></div></div><p className="rf-note">Đây là kết quả học tập trong bản demo, không phải chứng chỉ điện tử có chữ ký số. Năng lực tại công việc cần minh chứng được quản lý đánh giá riêng.</p></div>:<div className="rf-panel"><p>Chưa có khóa học hoàn thành. Hãy làm bài kiểm tra cuối khóa để nhận mã tra cứu demo.</p></div>}</div><div className="modal-footer"><button className="rf-secondary" onClick={onClose}>Đóng</button>{selected && <button className="rf-primary" onClick={() => onOpenPublicVerification(getDemoCompletionCode(user?.id, selected[0]))}>Tra cứu mã</button>}</div></div></div>;
}
