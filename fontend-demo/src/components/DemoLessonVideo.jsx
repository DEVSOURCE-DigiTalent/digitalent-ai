import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, CheckCircle2, Captions, Maximize, Minimize, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import './demoLessonVideo.css';

const DURATION = 90;
const formatTime = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

export default function DemoLessonVideo({ module }) {
  const container = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  const title = module.title.replace(/^Module\s*\d+\s*:\s*/i, '');
  const objectives = module.objectives?.slice(0, 3) || [title];
  const scenes = [
    { label: 'Mục tiêu', title, text: objectives[0], icon: BookOpen },
    { label: 'Kiến thức chính', title: 'Hiểu đúng, áp dụng đúng', text: module.theory?.[0] || objectives[0], icon: CheckCircle2 },
    { label: 'Áp dụng', title: 'Đưa kiến thức vào công việc', text: module.product || module.practice?.[0] || objectives.at(-1), icon: ArrowRight },
  ];
  const sceneIndex = Math.min(2, Math.floor(time / 30));
  const scene = scenes[sceneIndex];
  const SceneIcon = scene.icon;
  const ended = time >= DURATION;

  useEffect(() => {
    if (!playing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = (now - previous) / 1000;
      previous = now;
      setTime(value => Math.min(DURATION, value + elapsed * speed));
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  useEffect(() => { if (ended) setPlaying(false); }, [ended]);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  function togglePlay() { if (ended) setTime(0); setPlaying(value => !value); }
  function seek(value) { setTime(Math.max(0, Math.min(DURATION, value))); }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === container.current) await document.exitFullscreen();
      else await container.current.requestFullscreen();
    } catch { setMessage('Trình duyệt chưa hỗ trợ toàn màn hình. Bạn vẫn có thể xem tại đây.'); }
  }

  return <div className="demo-video-wrap">
    <div className={`demo-video ${playing ? 'is-playing' : ''}`} ref={container} role="region" aria-label={`Video mô phỏng: ${title}`}>
      <div className="demo-video-stage">
        <div className="demo-video-top"><span className="demo-video-brand"><BookOpen size={17}/> DigiTalent <span>ACADEMY</span></span><span className="demo-video-badge">MÔ PHỎNG · 01:30</span></div>
        <div className="demo-video-scene" key={sceneIndex}>
          <div className="demo-video-copy"><span className="demo-video-kicker">NĂNG LỰC {module.competenceCode} / {scene.label}</span><h3>{scene.title}</h3><span className="demo-video-rule"/><p>{sceneIndex === 0 ? 'Từng bước nhỏ. Kỹ năng vững vàng.' : sceneIndex === 1 ? 'Đọc · Hiểu · Kiểm chứng' : 'Sẵn sàng cho bài thực hành của bạn.'}</p></div>
          <div className="demo-video-illustration"><div className="demo-video-orbit"/><div className="demo-video-symbol"><SceneIcon size={46} strokeWidth={1.5}/></div><span className="demo-video-float"><Check size={14}/> {sceneIndex === 0 ? 'Học theo vị trí' : sceneIndex === 1 ? 'Nắm vững kiến thức' : 'Ứng dụng thực tế'}</span>{!playing && <button className="demo-video-big-play" onClick={togglePlay} aria-label={ended ? 'Phát lại video mô phỏng' : 'Phát video mô phỏng'}>{ended ? <RotateCcw size={25}/> : <Play size={25} fill="currentColor"/>}</button>}<div className="demo-video-mini-bars" aria-hidden="true"><i/><i/><i/><i/><i/></div></div>
        </div>
        
        <div className="demo-video-caption">{captions && <p>{scene.text}</p>}</div>
      </div>
      <div className="demo-video-controls">
        <input type="range" min="0" max={DURATION} step="0.1" value={time} aria-label="Tua video mô phỏng" aria-valuetext={`${formatTime(time)} / 1:30`} onChange={event => seek(Number(event.target.value))} style={{ '--played': `${time / DURATION * 100}%` }}/>
        <div className="demo-video-toolbar">
          <button onClick={togglePlay} aria-label={playing ? 'Tạm dừng video mô phỏng' : ended ? 'Phát lại video mô phỏng' : 'Tiếp tục video mô phỏng'} title={playing ? 'Tạm dừng' : 'Phát'}>{playing ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}</button>
          <button onClick={() => seek(time - 10)} aria-label="Lùi 10 giây" title="Lùi 10 giây"><SkipBack size={18}/></button>
          <button onClick={() => seek(time + 10)} aria-label="Tiến 10 giây" title="Tiến 10 giây"><SkipForward size={18}/></button>
          <span className="demo-video-time">{formatTime(time)} <span>/ 1:30</span></span>
          <span className="demo-video-spacer"/>
          <select aria-label="Tốc độ phát" value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>
          <button onClick={() => setCaptions(value => !value)} aria-label="Phụ đề minh họa" aria-pressed={captions} title="Bật/tắt phụ đề"><Captions size={21}/></button>
          <button onClick={toggleFullscreen} aria-label={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'} title="Toàn màn hình">{fullscreen ? <Minimize size={19}/> : <Maximize size={19}/>}</button>
        </div>
      </div>
    </div>
    <div className="demo-video-chapters" aria-label="Các phần của video">{scenes.map((item, index) => <button key={item.label} aria-current={sceneIndex === index ? 'step' : undefined} onClick={() => seek(index * 30)}><span>{formatTime(index * 30)}</span>{item.label}</button>)}</div>
    <p className="demo-video-note">Video minh họa không lời từ nội dung bài học · Không dùng để chấm hoàn thành khóa.</p>
    {message && <p className="rf-note" role="status">{message}</p>}
  </div>;
}
