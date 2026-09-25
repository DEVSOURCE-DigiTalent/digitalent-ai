import React from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, Clock3, Play, X } from 'lucide-react';

export default function CourseOverviewModal({ course, onClose, onEnterClassroom, isAlreadyCompleted = false, savedProgress = null, assignedInfo = null }) {
  if (!course) return null;
  const modules = course.modules || [];
  const completed = isAlreadyCompleted ? modules.length : modules.filter(module => savedProgress?.completedModules?.[module.id]).length;
  const progress = modules.length ? Math.round(completed / modules.length * 100) : 0;

  return <div className="modal-overlay" onClick={onClose}>
    <div className="dt-modal" role="dialog" aria-modal="true" aria-labelledby="dt-modal-title" onClick={event => event.stopPropagation()}>
      <div className="dt-modal-cover"><div className="dt-modal-top"><span className="dt-modal-code">{course.id}</span><button onClick={onClose} aria-label="Đóng cửa sổ"><X size={19}/></button></div><div className="dt-modal-icon"><BookOpen size={29}/></div><span className="dt-modal-eyebrow">{course.isCommerciallyReady ? 'KHÓA HỌC NĂNG LỰC SỐ' : 'GIÁO TRÌNH HỌC THỬ · CHỜ THẨM ĐỊNH'}</span><h2 id="dt-modal-title">{course.title}</h2><div className="dt-modal-chips"><span>{course.level}</span><span><Clock3 size={14}/> {course.duration}</span><span>{modules.length} bài học</span></div></div>
      <div className="dt-modal-body">{assignedInfo && <div className="dt-modal-assigned"><span className="dt-modal-pip"/><div><strong>Được gợi ý theo khoảng thiếu</strong><p>{assignedInfo.reason}</p></div></div>}
        <div className="dt-modal-progress"><div><strong>{isAlreadyCompleted ? 'Đã hoàn thành' : completed ? 'Tiếp tục học' : 'Sẵn sàng bắt đầu'}</strong><span>{completed}/{modules.length} bài học</span></div><div className="dt-track"><span className="dt-fill" style={{width:`${progress}%`}}/></div></div>
        <details className="dt-modal-section"><summary>Bạn sẽ học gì? <ChevronDown size={16}/></summary><p>{course.objective || course.description || 'Nội dung thực hành theo cấp độ và lĩnh vực của khóa học.'}</p></details>
        <details className="dt-modal-section"><summary>Danh sách bài học <span>{modules.length} bài</span><ChevronDown size={16}/></summary><ol>{modules.map((module, index) => <li key={module.id || index}><span>{String(index+1).padStart(2,'0')}</span><strong>{module.title}</strong>{savedProgress?.completedModules?.[module.id] && <Check size={16}/>}</li>)}</ol></details>
        <div className="dt-modal-actions"><button className="dt-button ghost" onClick={onClose}>Để sau</button><button className="dt-button primary" onClick={() => onEnterClassroom(course)}><Play size={16} fill="currentColor"/>{isAlreadyCompleted ? 'Ôn tập khóa học' : completed ? 'Tiếp tục học' : 'Vào lớp học'}<ArrowRight size={16}/></button></div>
      </div>
    </div>
  </div>;
}
