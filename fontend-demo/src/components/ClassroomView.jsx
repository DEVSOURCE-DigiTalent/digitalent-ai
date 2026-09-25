import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Lightbulb, PlayCircle, Video } from 'lucide-react';
import './workspaceRefresh.css';
import './learningFlow.css';

const VIDEO_LIBRARY_KEY = 'digcomp_lesson_videos';
const readVideoLibrary = () => {
  try { return JSON.parse(localStorage.getItem(VIDEO_LIBRARY_KEY) || '{}'); } catch { return {}; }
};
const isDirectVideo = url => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || '');
const youtubeId = url => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0];
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(parsed.hostname)) return parsed.searchParams.get('v') || parsed.pathname.match(/^\/embed\/([^/]+)/)?.[1];
  } catch {}
  return null;
};

function LessonVideo({ module, onProgress }) {
  const [library, setLibrary] = useState(readVideoLibrary);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const url = library[module.id] || module.videoUrl || '';
  const candidate = youtubeId(url);
  const youtube = /^[a-zA-Z0-9_-]{11}$/.test(candidate || '') ? candidate : null;
  function saveVideo(event) {
    event.preventDefault();
    const value = draft.trim();
    if (value && !/^https:\/\//i.test(value) && !value.startsWith('/videos/')) { setMessage('Dùng liên kết HTTPS hoặc tệp trong /videos/.'); return; }
    const updated = { ...library, [module.id]: value };
    setLibrary(updated);
    try { localStorage.setItem(VIDEO_LIBRARY_KEY, JSON.stringify(updated)); } catch {}
    setDraft('');
    setMessage(value ? 'Đã gắn video cho bài học trong bản demo.' : 'Đã bỏ video đã gắn.');
  }
  return <div className="rf-video-block"><div className="rf-video-heading"><div><span className="rf-eyebrow">HỌC BẰNG VIDEO</span><h3>Video bài học</h3></div><Video size={21}/></div>{url ? youtube ? <div className="rf-video-frame"><iframe title={`Video ${module.title}`} src={`https://www.youtube-nocookie.com/embed/${youtube}`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div> : isDirectVideo(url) || url.startsWith('/videos/') ? <video className="rf-video-player" controls preload="metadata" src={url} onTimeUpdate={event => { const player = event.currentTarget; if (player.duration) onProgress(Math.round(player.currentTime / player.duration * 100)); }}>Trình duyệt không hỗ trợ phát video.</video> : <a className="rf-secondary" href={url} target="_blank" rel="noreferrer">Mở video trong tab mới <ArrowRight size={15}/></a> : <div className="rf-video-empty"><PlayCircle size={29}/><strong>Chưa có video đính kèm</strong><span>Nội dung giáo trình, thực hành và câu hỏi vẫn dùng được ngay. Gắn video để xem thử trải nghiệm học đa phương tiện.</span></div>}<details className="rf-video-config"><summary>{url ? 'Đổi liên kết video' : 'Gắn video cho bản demo'}</summary><form onSubmit={saveVideo}><input type="text" value={draft} onChange={event => setDraft(event.target.value)} placeholder="https://.../bai-hoc.mp4, YouTube hoặc /videos/bai-hoc.mp4"/><button className="rf-secondary" type="submit">Lưu video</button>{url && <button className="rf-secondary" type="button" onClick={() => { const updated = { ...library, [module.id]: '' }; setLibrary(updated); localStorage.setItem(VIDEO_LIBRARY_KEY, JSON.stringify(updated)); }}>Bỏ video</button>}</form><small>Video MP4/WebM ghi tiến độ phát; video nhúng YouTube chỉ phát, chưa đo thời lượng xem trong bản demo.</small></details>{message && <div className="rf-note" role="status">{message}</div>}</div>;
}

function PromptBuilder() {
  const [goal, setGoal] = useState('video');
  const [audience, setAudience] = useState('khách hàng doanh nghiệp');
  const prompt = goal === 'video'
    ? `Vai trò: Chuyên viên nội dung số. Viết kịch bản video 45 giây cho ${audience}. Cấu trúc: mở đầu 3 giây, vấn đề, giải pháp, lời kêu gọi hành động. Nêu rõ nguồn dữ liệu cho mọi con số và chỉ dùng hình ảnh/âm thanh có quyền thương mại.`
    : `Vai trò: Chuyên viên tối ưu chuyển đổi. Viết tiêu đề và 3 đoạn cho trang giới thiệu hướng tới ${audience}. Nêu vấn đề, lợi ích có bằng chứng, lời kêu gọi hành động. Kiểm tra quyền sử dụng tài sản số.`;
  return <details className="rf-prompt"><summary>Trình tạo gợi ý nội dung</summary><div className="rf-form"><p>Mẫu hỗ trợ soạn yêu cầu cho công cụ AI; người học cần kiểm tra đầu ra.</p><label>Mục tiêu<select value={goal} onChange={event => setGoal(event.target.value)}><option value="video">Video ngắn</option><option value="landing">Trang giới thiệu</option></select></label><label>Đối tượng<input value={audience} onChange={event => setAudience(event.target.value)}/></label><label>Gợi ý<textarea readOnly value={prompt}/></label></div></details>;
}

function ABPractice() {
  const [visitors, setVisitors] = useState([5000, 5120]);
  const [conversions, setConversions] = useState([150, 215]);
  const rate = index => visitors[index] > 0 ? conversions[index] / visitors[index] * 100 : 0;
  return <details className="rf-prompt"><summary>Máy tính A/B cho bài thực hành</summary><div className="rf-form"><p>So sánh tỷ lệ chuyển đổi hai phiên bản. Kết quả này chưa chứng minh ý nghĩa thống kê.</p>{['A','B'].map((variant,index) => <div className="rf-ab-row" key={variant}><strong>Phiên bản {variant}</strong><label>Lượt truy cập<input type="number" min="1" value={visitors[index]} onChange={event => setVisitors(visitors.map((value,i) => i === index ? Number(event.target.value) : value))}/></label><label>Chuyển đổi<input type="number" min="0" value={conversions[index]} onChange={event => setConversions(conversions.map((value,i) => i === index ? Number(event.target.value) : value))}/></label></div>)}<div className="rf-note">A: {rate(0).toFixed(2)}% · B: {rate(1).toFixed(2)}% · chênh lệch {(rate(1)-rate(0)).toFixed(2)} điểm %</div></div></details>;
}

function TextList({ items }) { return items?.length ? <div className="rf-text-list">{items.map((item,index) => <p key={index}>{item}</p>)}</div> : null; }

export default function ClassroomView({ course, onBackToDashboard, onCourseCompleted, isAlreadyCompleted = false, savedProgress, onSaveProgress, onOpenCertificate, assignedInfo, onOpenTask }) {
  const initialIndex = Math.max(0, course?.modules?.findIndex(item => item.id === assignedInfo?.focusModuleCode) ?? 0);
  const [moduleIndex, setModuleIndex] = useState(initialIndex);
  const [view, setView] = useState('lesson');
  const [answers, setAnswers] = useState({});
  const [examAnswers, setExamAnswers] = useState({});
  const [feedback, setFeedback] = useState('');
  const [quizChecked, setQuizChecked] = useState(false);
  const [examScore, setExamScore] = useState(savedProgress?.score ?? null);
  const [completed, setCompleted] = useState(savedProgress?.completedModules || {});
  const [notes, setNotes] = useState(savedProgress?.notes || {});
  const [noteDraft, setNoteDraft] = useState(savedProgress?.notes?.[course?.modules?.[initialIndex]?.id] || '');
  const [practiceDrafts, setPracticeDrafts] = useState(savedProgress?.practiceDrafts || {});
  const [practiceDraft, setPracticeDraft] = useState(savedProgress?.practiceDrafts?.[course?.modules?.[initialIndex]?.id] || '');
  const [videoProgress, setVideoProgress] = useState(savedProgress?.videoProgress || {});
  if (!course?.modules?.length) return <div className="rf-panel"><p>Chưa có bài học cho khóa này.</p><button className="rf-secondary" onClick={onBackToDashboard}>Quay lại</button></div>;
  const module = course.modules[moduleIndex];
  const questions = module.quiz || [];
  const exam = course.modules.flatMap(item => [item.quiz?.[0], item.quiz?.[item.quiz?.length - 1]].filter(Boolean));
  const doneCount = course.modules.filter(item => completed[item.id]).length;
  const allDone = doneCount === course.modules.length;
  const isCompleted = isAlreadyCompleted || savedProgress?.isCompleted || (allDone && examScore >= 70);
  const focused = assignedInfo?.focusModuleCode === module.id;
  const progress = videoProgress[module.id] || 0;
  function save(update) { onSaveProgress?.(course.id, { completedModules: completed, notes, practiceDrafts, videoProgress, ...update }); }
  function selectModule(index) { setModuleIndex(index); setView('lesson'); setAnswers({}); setQuizChecked(false); setFeedback(''); setNoteDraft(notes[course.modules[index].id] || ''); setPracticeDraft(practiceDrafts[course.modules[index].id] || ''); }
  function checkModule() {
    if (questions.some((question,index) => answers[index] === undefined)) { setFeedback('Hãy trả lời đủ câu hỏi của bài.'); return; }
    const score = questions.length ? Math.round(questions.filter((question,index) => answers[index] === question.ans).length / questions.length * 100) : 0;
    setQuizChecked(true);
    if (score < 80) { setFeedback(`Đúng ${score}%. Cần ít nhất 80% để hoàn thành bài; xem giải thích rồi thử lại.`); return; }
    const updated = { ...completed, [module.id]: true };
    setCompleted(updated);
    save({ completedModules: updated });
    setFeedback(`Đạt ${score}%. Đã ghi nhận bài học.`);
  }
  function submitExam() {
    if (!allDone) { setFeedback('Hãy hoàn thành tất cả bài học trước.'); return; }
    if (exam.some((question,index) => examAnswers[index] === undefined)) { setFeedback('Hãy trả lời đủ câu hỏi ôn tập cuối khóa.'); return; }
    const score = Math.round(exam.filter((question,index) => examAnswers[index] === question.ans).length / exam.length * 100);
    setExamScore(score);
    if (score >= 70) { save({ score, isCompleted: true }); onCourseCompleted?.(course.id, score); setFeedback(`Đạt ${score}/100. Đã ghi nhận hoàn thành phần học trong bản demo.`); }
    else setFeedback(`Đạt ${score}/100. Cần ít nhất 70 điểm; bạn có thể ôn và làm lại.`);
  }
  function saveNote() { const updated = { ...notes, [module.id]: noteDraft.trim() }; setNotes(updated); save({ notes: updated }); setFeedback('Đã lưu ghi chú.'); }
  function savePractice() { const updated = { ...practiceDrafts, [module.id]: practiceDraft.trim() }; setPracticeDrafts(updated); save({ practiceDrafts: updated }); setFeedback('Đã lưu bản nháp thực hành.'); }
  function updateVideoProgress(value) { if (value <= (videoProgress[module.id] || 0)) return; const updated = { ...videoProgress, [module.id]: value }; setVideoProgress(updated); onSaveProgress?.(course.id, { videoProgress: updated }); }

  return <div className="rf classroom-refresh"><button className="rf-back" onClick={onBackToDashboard}><ArrowLeft size={16}/> Về lộ trình</button><div className="rf-hero"><div><span className="rf-eyebrow">PHÒNG HỌC · {course.id} · {course.reviewStatus === 'draft_review' ? 'GIÁO TRÌNH CẦN THẨM ĐỊNH' : 'BẢN DEMO'}</span><h1>{course.title}</h1><p>{course.introduction || course.objective}</p></div><div className="rf-progress"><strong>{doneCount}/{course.modules.length}</strong><span>bài học hoàn thành</span><div><i style={{width:`${doneCount/course.modules.length*100}%`}}/></div></div></div>
    <div className="rf-class-grid"><aside className="rf-panel rf-class-menu"><h2>Nội dung khóa học</h2>{course.modules.map((item,index) => <button key={item.id} className={moduleIndex === index && view !== 'exam' ? 'active' : ''} onClick={() => selectModule(index)}><span>{completed[item.id] ? <CheckCircle2 size={17}/> : String(index+1).padStart(2,'0')}</span><span>{item.title}<small>{item.duration} · {item.competenceCode} {assignedInfo?.focusModuleCode === item.id ? '· bài cần chú ý' : ''}</small></span></button>)}<button className={view === 'exam' ? 'active' : ''} onClick={() => { setView('exam'); setFeedback(''); }}><span><ClipboardCheck size={17}/></span><span>Ôn tập cuối khóa<small>{exam.length} câu · đạt từ 70 điểm</small></span></button></aside>
      <section className="rf-panel rf-class-main">{view === 'exam' ? <><span className="rf-eyebrow">BƯỚC CUỐI</span><h2>Ôn tập và bài thực hành cuối khóa</h2><p>Bài ôn tập tổng hợp ghi nhận việc học trong bản demo. Giáo trình còn có sản phẩm thực hành để người hướng dẫn đánh giá.</p><details className="rf-prompt" open><summary>Đề bài thực hành theo giáo trình</summary><TextList items={course.finalAssessment}/></details>{!allDone && <div className="rf-note">Còn {course.modules.length - doneCount} bài học chưa hoàn thành.</div>}{exam.map((question,index) => <fieldset className="rf-question" key={index} disabled={!allDone}><legend>{index+1}. {question.q}</legend>{question.opts.map((option,optionIndex) => <label key={optionIndex}><input type="radio" name={`exam-${index}`} checked={examAnswers[index] === optionIndex} onChange={() => setExamAnswers({ ...examAnswers, [index]: optionIndex })}/>{option}</label>)}</fieldset>)}<button className="rf-primary" onClick={submitExam} disabled={!allDone}>{isCompleted ? 'Làm lại để cải thiện' : 'Nộp bài ôn tập'}</button>{examScore !== null && <div className="rf-note">Điểm gần nhất: {examScore}/100 {examScore >= 70 ? '· Đạt' : '· Cần ôn lại'}</div>}{isCompleted && <div className="rf-actions"><button className="rf-secondary" onClick={onOpenCertificate}>Xem xác nhận học tập</button>{onOpenTask && <button className="rf-primary" onClick={() => onOpenTask(course)}>Nộp minh chứng thực hành</button>}</div>}<p className="pw-caption">Điểm ôn tập không tự xác nhận mức năng lực. Bài thực hành cần được người quản lý hoặc mentor thẩm định.</p></> : <><span className="rf-eyebrow">BÀI {moduleIndex+1}/{course.modules.length} · NĂNG LỰC {module.competenceCode} {focused ? '· CẦN CỦNG CỐ' : ''}</span><h2>{module.title}</h2><div className="rf-class-tabs"><button className={view === 'lesson' ? 'active' : ''} onClick={() => setView('lesson')}><BookOpen size={15}/> Bài giảng</button><button className={view === 'practice' ? 'active' : ''} onClick={() => setView('practice')}><Lightbulb size={15}/> Thực hành</button><button className={view === 'quiz' ? 'active' : ''} onClick={() => setView('quiz')}><ClipboardCheck size={15}/> Kiểm tra</button><button className={view === 'notes' ? 'active' : ''} onClick={() => setView('notes')}>Ghi chú</button></div>
      {view === 'lesson' && <><LessonVideo module={module} onProgress={updateVideoProgress}/>{progress > 0 && <div className="rf-note">Đã phát khoảng {progress}% thời lượng video của bài này trên thiết bị hiện tại.</div>}<div className="rf-lesson"><h3>Mục tiêu học tập</h3><ul>{module.objectives?.map((item,index) => <li key={index}>{item}</li>)}</ul><h3>Nội dung chính</h3><TextList items={module.theory}/><details className="rf-prompt"><summary>Thuật ngữ và định nghĩa</summary><TextList items={module.definitions}/></details><button className="rf-primary" onClick={() => setView('practice')}>Sang phần thực hành <ArrowRight size={15}/></button></div></>}
      {view === 'practice' && <div className="rf-form"><h3>Tình huống thực hành</h3><TextList items={module.practice}/>{module.product && <div className="rf-note"><strong>Sản phẩm đầu ra:</strong> {module.product}</div>}<label>Nháp làm bài của bạn<textarea value={practiceDraft} onChange={event => setPracticeDraft(event.target.value)} placeholder="Ghi cách bạn sẽ thực hiện, kết quả hoặc liên kết tài liệu"/></label><button className="rf-secondary" onClick={savePractice}>Lưu nháp thực hành</button>{course.id === 'A3-A' && <><ABPractice/><PromptBuilder/></>}<button className="rf-primary" onClick={() => setView('quiz')}>Làm câu hỏi ôn tập <ArrowRight size={15}/></button></div>}
      {view === 'quiz' && <><p>Trả lời đúng ít nhất 80% câu hỏi để hoàn thành bài học. Nội dung lấy từ giáo trình của lĩnh vực này.</p>{questions.map((question,index) => <fieldset className="rf-question" key={index}><legend>{index+1}. {question.q}</legend>{question.opts.map((option,optionIndex) => <label key={optionIndex}><input type="radio" name={`module-${module.id}-${index}`} checked={answers[index] === optionIndex} onChange={() => { setAnswers({ ...answers, [index]: optionIndex }); setQuizChecked(false); }}/>{option}</label>)}{quizChecked && <small>{question.exp}</small>}</fieldset>)}<button className="rf-primary" onClick={checkModule}>Kiểm tra câu trả lời</button>{completed[module.id] && moduleIndex < course.modules.length-1 && <button className="rf-secondary" onClick={() => selectModule(moduleIndex+1)}>Bài tiếp theo <ArrowRight size={15}/></button>}</>}
      {view === 'notes' && <div className="rf-form"><p>Ghi ý chính, câu hỏi muốn trao đổi với mentor hoặc cách áp dụng vào công việc.</p><textarea value={noteDraft} onChange={event => setNoteDraft(event.target.value)} placeholder="Ghi chú cá nhân cho bài học này"/><button className="rf-primary" onClick={saveNote}>Lưu ghi chú</button></div>}</>}{feedback && <div className="rf-message" role="status">{feedback}</div>}</section></div></div>;
}
