import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText } from 'lucide-react';
import './enterpriseWorkspace.css';

export default function CourseOutlineView({ course, onBackToDashboard, savedProgress, onSaveProgress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewed = savedProgress?.outlineViewed || {};
  const module = course.modules[activeIndex];
  const count = course.modules.filter(item => viewed[item.id]).length;
  const markViewed = () => {
    const updated = { ...viewed, [module.id]: true };
    onSaveProgress?.(course.id, { outlineViewed: updated });
    if (activeIndex < course.modules.length - 1) setActiveIndex(activeIndex + 1);
  };

  return <div className="dt dt-outline"><button className="dt-inline-link" onClick={onBackToDashboard}><ArrowLeft size={16}/> Quay lại lộ trình</button><div className="dt-outline-hero"><span className="dt-kicker">ĐỀ CƯƠNG KHÓA HỌC</span><h1>{course.title}</h1><p>{course.level} · {course.duration} · {course.modules.length} chủ đề</p></div><div className="dt-grid-2"><section className="dt-panel"><div className="dt-panel-head"><div><span className="dt-kicker">DANH SÁCH CHỦ ĐỀ</span><h3>{count}/{course.modules.length} đã xem</h3></div></div><div className="dt-outline-modules">{course.modules.map((item,index) => <button key={item.id} className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)}><span>{viewed[item.id] ? <Check size={16}/> : String(index+1).padStart(2,'0')}</span><strong>{item.title}</strong><ArrowRight size={15}/></button>)}</div></section><section className="dt-panel dt-outline-content"><span className="dt-kicker">CHỦ ĐỀ {activeIndex+1}</span><div className="dt-outline-icon"><FileText size={25}/></div><h2>{module.title}</h2><p>{module.description}</p><div className="dt-soft-note"><BookOpen size={16}/> Đây là đề cương từ chương trình 15 khóa. Bài giảng, thực hành và đánh giá của khóa này đang được chuẩn bị. Việc xem đề cương không tính là hoàn thành khóa hoặc cấp chứng chỉ.</div><button className="dt-button primary" onClick={markViewed}>{viewed[module.id] ? 'Xem chủ đề tiếp' : 'Đã xem chủ đề'} <ArrowRight size={16}/></button></section></div></div>;
}
