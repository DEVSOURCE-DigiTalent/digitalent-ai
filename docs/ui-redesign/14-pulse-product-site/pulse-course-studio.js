/* Course presentation in the Pulse preview: modules, slide lessons, module quizzes, final assignment. */
(function(){
  const previousCourse=coursePage;
  const previousAssignment=assignmentPage;
  const art='../assets/learning-journey-abstract.png';
  const architecture='../assets/competency-architecture.png';
  const contexts=[
    {source:'báo cáo dữ liệu gốc',scenario:'Hai tổng số trong báo cáo tài chính không khớp nhau.',action:'đối chiếu từng tổng số với báo cáo gốc và trình bày phép tính',deliverable:'báo cáo có chú thích nguồn, phép tính và kết luận có căn cứ'},
    {source:'yêu cầu của khách hàng và nhóm người nhận',scenario:'Bản cập nhật của đội khiến người phụ trách tiếp theo chưa biết cần làm gì.',action:'làm rõ người nhận, mục đích và bước tiếp theo cần thực hiện',deliverable:'bản cập nhật ngắn nêu rõ người nhận, quyết định và hành động tiếp theo'},
    {source:'bản định hướng nội dung đã duyệt',scenario:'Bản nháp dùng mẫu cũ và khó đọc.',action:'kiểm tra định hướng, dùng mẫu hiện tại và cải thiện khả năng tiếp cận',deliverable:'sản phẩm nội dung một trang dễ tiếp cận kèm lý do thiết kế ngắn gọn'},
    {source:'chính sách an toàn và tin nhắn gốc',scenario:'Một tin nhắn yêu cầu bạn mở gấp liên kết lạ.',action:'xác minh người gửi qua kênh tin cậy và báo cáo yêu cầu đáng ngờ',deliverable:'ghi chú sự cố ngắn nêu dấu hiệu, hành động an toàn và bước báo cáo'},
    {source:'nhật ký quy trình và những người liên quan',scenario:'Việc bàn giao chậm lặp lại hằng tuần ở cùng một nhiệm vụ.',action:'tách biểu hiện khỏi nguyên nhân rồi thử một phương án thực tế',deliverable:'bảng so sánh nguyên nhân, phương án thử và kết quả quan sát'},
    {source:'tài liệu nguồn của câu trả lời AI',scenario:'Bản tóm tắt AI có một thông tin không xuất hiện trong nguồn.',action:'đối chiếu thông tin với nguồn rồi sửa hoặc bỏ nội dung thiếu căn cứ',deliverable:'ghi chú sử dụng AI có câu lệnh, bước kiểm chứng và quyết định cuối'}
  ];
  const moduleDetails=(cid)=>{
    const {domain,tier}=parseCourse(cid),topic=DOMAINS[domain],level=TIERS[tier-1],context=contexts[domain],lessons=lessonsFor(cid);
    return lessons.map((lesson,index)=>{
      const slides=index===0?[
        {tag:'01 / Quan sát',title:`${topic} trong vị trí của bạn`,body:`Ở mức ${level}, hãy bắt đầu bằng nhiệm vụ thật và nguồn mà người khác có thể kiểm tra. Trong khóa này, dùng ${context.source}.`,prompt:'Hiểu mục tiêu trước khi chọn công cụ.'},
        {tag:'02 / Kết nối',title:'Xác định bối cảnh',body:`Tình huống: ${context.scenario} Hãy xác định ai cần kết quả, điều gì đã thay đổi và hồ sơ nào cho biết điểm khởi đầu.`,prompt:'Bối cảnh giúp hành động số có ý nghĩa.'},
        {tag:'03 / Chuẩn bị',title:'Nêu kết quả có thể kiểm tra',body:`Kết quả cần tạo: ${context.deliverable}. Giữ nguồn đi cùng kết quả để người tiếp theo hiểu cách bạn lập luận.`,prompt:'Bạn đã sẵn sàng làm câu hỏi ôn tập mô đun.'}
      ]:index===1?[
        {tag:'01 / Tình huống',title:'Bắt đầu quyết định từ minh chứng',body:context.scenario,prompt:`Tìm ${context.source} trước khi chọn hành động.`},
        {tag:'02 / Cách làm',title:'Chọn hành động tiếp theo',body:`Trong tình huống này, hãy ${context.action}. Giải thích vì sao cách làm đó an toàn hoặc hữu ích hơn phỏng đoán.`,prompt:'Quyết định cần dễ kiểm tra.'},
        {tag:'03 / Lý do',title:'Làm rõ cách lập luận',body:'Kết nối nguồn, cách làm và kết luận. Quản lý cần bối cảnh để kiểm tra công việc, không chỉ xem kết quả cuối.',prompt:'Dùng câu hỏi ôn tập để kiểm tra cách làm.'}
      ]:[
        {tag:'01 / Áp dụng',title:'Tạo kết quả cho vị trí của bạn',body:`Dùng ${context.source} để tạo ${context.deliverable}. Giữ phạm vi đủ nhỏ để hoàn thành và đủ rõ để đánh giá.`,prompt:'Đây là bước luyện tập cho bài cuối khóa.'},
        {tag:'02 / Rà soát',title:'Kiểm tra trước khi nộp',body:'Xác nhận đã nêu nguồn, mô tả được cách làm và có kết luận có căn cứ. Sửa lại chi tiết chưa thể kiểm tra.',prompt:'Dấu vết rõ ràng giúp người chấm đánh giá.'},
        {tag:'03 / Bàn giao',title:'Chuẩn bị bài cuối khóa',body:'Bài cuối khóa yêu cầu bạn giải thích đã làm gì và vì sao. Quản lý phòng ban ghi quyết định cuối với gợi ý AI hỗ trợ.',prompt:'Đạt câu hỏi mô đun để mở bài cuối khóa.'}
      ];
      const questions=index===0?[
        {text:`Với ${topic}, bạn cần kiểm tra nguồn nào trước?`,options:['Một phỏng đoán chưa có căn cứ',context.source,'Chỉ kết luận cuối cùng'],answer:1,reason:'Bắt đầu từ nguồn hoặc bối cảnh mà người khác có thể kiểm tra.'},
        {text:'Điều gì giúp kỹ năng có ích trong công việc?',options:['Gắn nhiệm vụ thật với cách làm và kết quả','Dùng công cụ khi chưa có mục đích','Sao chép kết quả mà không kiểm tra'],answer:0,reason:'Kỹ năng cần có bối cảnh, cách làm và kết quả rõ ràng.'}
      ]:index===1?[
        {text:`Bạn nên xử lý tình huống này thế nào? ${context.scenario}`,options:['Duyệt kết quả đầu tiên mà không kiểm tra',context.action,'Tránh đưa ra quyết định'],answer:1,reason:'Cách làm kiểm tra được phải giải quyết đúng tình huống và nguồn.'},
        {text:'Ghi chú nào giúp người chấm hiểu quyết định?',options:['Chỉ câu trả lời cuối','Nguồn, cách làm và lý do','Khẳng định chắc chắn nhưng không có minh chứng'],answer:1,reason:'Người chấm cần thấy nguồn, cách làm và lý do.'}
      ]:[
        {text:`Sản phẩm nào phù hợp với khóa ${topic}?`,options:['Kết quả không giải thích được',context.deliverable,'Ghi chú không nêu nguồn'],answer:1,reason:'Sản phẩm cần cho phép truy vết công việc.'},
        {text:'Bài cuối khóa cần có gì?',options:['Nguồn, cách làm kiểm tra được và kết luận có căn cứ','Chỉ ý kiến cá nhân','Ảnh chụp màn hình không có giải thích'],answer:0,reason:'Quản lý chấm minh chứng có thể kiểm tra.'}
      ];
      return {...lesson,slides,questions,minutes:index===2?8:6};
    });
  };
  const accessible=(cid,person)=>{
    const c=parseCourse(cid),en=enrollment(cid,person),basic=c.tier===1;
    return {en,basic,full:basic||Boolean(en),inPath:Boolean(person&&(position(person)?.target?.[c.domain]||0)>=c.tier)};
  };
  const courseProgress=(en)=>en?.lessons?.filter(Boolean).length||0;

  coursePage=function(value){
    if(state.role!=='employee')return previousCourse(value);
    const c=parseCourse(value),cid=courseId(c.domain,c.tier),person=employee(),meta=state.secondary?.courseMeta?.[cid],modules=moduleDetails(cid);
    const {en,basic,full,inPath}=accessible(cid,person),done=courseProgress(en),next=en?.lessons.findIndex(v=>!v)??0;
    const nextIndex=next<0?2:next,canWork=Boolean(person?.assessed&&inPath&&full),assignmentReady=Boolean(en?.lessons.every(Boolean));
    const startPath=!person?.assessed?'assessment':assignmentReady?`assignment/${cid}`:full?`lesson/${cid}/${nextIndex}`:`lesson/${cid}/0`;
    const startLabel=!person?.assessed?'Take baseline check →':assignmentReady?'Open final assignment →':full?en?'Continue modules →':'Start module 01 →':'Preview first module →';
    return `<div class="pulse-course-page">
      <section class="pulse-course-cover"><div><span class="eyebrow">${basic?'Free foundation':`${TIERS[c.tier-1]} · assigned seat`}</span><h1>${esc(meta?.title||DOMAINS[c.domain])}</h1><p>Learn through three focused modules. Each module has slides and a short quiz; after all three quizzes, submit one final assignment for your department Manager to review.</p><div class="pulse-course-cover-meta"><span>03 modules</span><span>03 module quizzes</span><span>01 final assignment</span></div>${link(startPath,startLabel,'btn-primary')}</div><img src="${architecture}" alt="Abstract blue glass structures connected along a route"></section>
      ${!person?.assessed?notice('Complete your baseline check first. Course slides are readable, but path progress begins after your starting level is recorded.','warning'):!inPath?notice('This course is outside your assigned position target. Basic slides remain readable, but it will not record path progress.','warning'):!basic&&!en?notice('This level needs an Owner-assigned seat. You can review the outline and first sample slide before access opens.','warning'):basic?notice('All Basic modules and quizzes are included in the free business trial.','success'):notice('Your purchased seat opens the full module sequence.','success')}
      <div class="pulse-course-overview"><section class="pulse-course-outcome"><span class="mini-label">The outcome</span><h2>Learn it. Check it. Use it at work.</h2><p>${esc(meta?.outcome||`Apply ${DOMAINS[c.domain].toLowerCase()} at ${TIERS[c.tier-1].toLowerCase()} level with a result your Manager can inspect.`)}</p><div class="pulse-course-outcome-points"><span><b>01</b> Understand a real context</span><span><b>02</b> Make a checkable decision</span><span><b>03</b> Show evidence in your role</span></div></section><section class="pulse-course-access"><span class="mini-label">Your progress</span><strong>${done}<small>/3 modules</small></strong><div class="bar"><i style="width:${done/3*100}%"></i></div><p>${!person?.assessed?'Begin with the baseline check.':assignmentReady?'All module quizzes passed. Your final assignment is ready.':full?'Pass each module quiz to move toward the final assignment.':'Full access opens when the Owner assigns a paid seat.'}</p>${badge(assignmentReady?'Ready for assignment':basic?'Free in full':en?'Seat assigned':'Preview only',assignmentReady?'green':'gray')}</section></div>
      <section class="pulse-course-modules" aria-labelledby="pulse-module-heading"><div class="pulse-course-section-head"><div><span class="mini-label">Course content</span><h2 id="pulse-module-heading">Follow the modules in order.</h2><p>Open a slide lesson, apply the idea and pass its two-question quiz.</p></div><span class="pulse-course-total">${done} of 3 quizzes passed</span></div><div class="pulse-course-module-grid">${modules.map((module,i)=>{const passed=Boolean(en?.lessons[i]),locked=!full&&i>0,priorReady=i===0||Boolean(en?.lessons[i-1]);return `<article class="pulse-course-module ${passed?'passed':''}"><div class="pulse-course-module-top"><span>MODULE 0${i+1}</span>${badge(passed?'Quiz passed':locked?'Locked':!priorReady?'Next in order':!canWork?'Preview':'Ready',passed?'green':locked?'gray':'')}</div><h3>${esc(module.title)}</h3><p>${esc(module.body)}</p><div class="pulse-course-module-format"><span>▤ Slides · ${module.minutes} min</span><span>◇ 2 quiz questions</span></div>${locked?`<span class="pulse-course-locked">Outline visible · seat required</span>`:link(`lesson/${cid}/${i}`,!full?'View sample slide →':passed?'Review module →':'Open module →','btn-outline btn-small')}</article>`}).join('')}</div></section>
      <section class="pulse-course-final"><div class="pulse-course-final-symbol">✓</div><div><span class="mini-label">After the modules</span><h2>The final assignment</h2><p>Use the source, show a checkable action and explain the next step. Your Manager reviews the work and gives a reasoned decision; the same course report records the outcome.</p><div class="pulse-course-final-criteria"><span>Traceable source</span><span>Checkable action</span><span>Supported conclusion</span></div></div>${link(`assignment/${cid}`,assignmentReady?'Open final assignment →':'View assignment criteria →','btn-outline')}</section>
      <div class="pulse-course-footer">${link('path','← Back to my path','btn-ghost btn-small')}<small>Published course ${meta?.version?`v${meta.version}.0`:'v1.0'} · ${esc(DOMAINS[c.domain])} / ${TIERS[c.tier-1]}</small></div>
    </div>`;
  };

  lessonPage=function(value,index){
    const c=parseCourse(value),cid=courseId(c.domain,c.tier),n=Math.min(2,Math.max(0,Number(index)||0)),person=employee(),modules=moduleDetails(cid),module=modules[n];
    const {en,basic,full,inPath}=accessible(cid,person),owner=state.role==='owner',purchased=Number(state.purchases[cid]||0)>0;
    const fullAccess=full||owner&&purchased,canView=fullAccess||n===0;
    if(!canView)return `${page('Module locked','A course seat is needed.','The outline and first sample slide are available before purchase.')}${link(`course/${cid}`,'Back to course','btn-outline')}`;
    const slides=fullAccess?module.slides:module.slides.slice(0,1),passed=Boolean(en?.lessons[n]),priorReady=n===0||Boolean(en?.lessons[n-1]);
    const viewKey=`${person?.id}|${cid}|${n}`,slidesViewed=Boolean(state.courseSlideViews?.[viewKey]);
    const canQuiz=state.role==='employee'&&Boolean(person?.assessed&&inPath&&fullAccess&&priorReady);
    const status=passed?'Quiz passed':!fullAccess?'Sample only':!priorReady?'Previous quiz first':'Ready for quiz';
    const quizArea=passed?`<div class="pulse-module-passed"><span aria-hidden="true">✓</span><div><strong>Module quiz passed · 2/2 correct</strong><p>Your progress is saved. ${n<2?'The next module is ready.':'All modules are complete; the final assignment is open.'}</p></div>${link(n<2?`lesson/${cid}/${n+1}`:`assignment/${cid}`,n<2?'Next module →':'Final assignment →','btn-primary btn-small')}</div>`
      :canQuiz?`<section class="pulse-module-quiz"><div class="pulse-module-section-head"><span class="mini-label">Check your understanding</span><h2>Module 0${n+1} quiz</h2><p>Answer both questions correctly to complete this module. You can try again.</p></div><p class="pulse-quiz-intro" ${slidesViewed?'hidden':''}>Read all three slides to open this quiz.</p><form data-form="module-quiz" data-course="${cid}" data-index="${n}" ${slidesViewed?'':'hidden'}>${module.questions.map((question,q)=>`<fieldset><legend><span>0${q+1}</span>${esc(question.text)}</legend>${question.options.map((option,i)=>`<label><input type="radio" name="q${q}" value="${i}" required><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('')}<div class="pulse-quiz-feedback" role="alert" aria-live="polite"></div><button class="btn btn-primary" type="submit">Check my answers →</button></form></section>`
      :`<div class="pulse-module-gate">${notice(!person?.assessed?'Take your baseline check before recording course progress.':!inPath?'This course is outside your position target, so the slides do not record progress.':!fullAccess?'This is the first sample slide. Full slides and quizzes need an assigned paid seat.':!priorReady?'Pass the previous module quiz to unlock this check.':'Only the Employee completes module quizzes.','warning')}${!person?.assessed?link('assessment','Take baseline check →','btn-outline btn-small'):''}</div>`;
    return `<div class="pulse-module-page"><div class="pulse-module-breadcrumb">${link(`course/${cid}`,'← Course overview','btn-ghost btn-small')}<span>${esc(courseName(cid))}</span></div><div class="pulse-module-progress"><span>Module 0${n+1} / 03</span><div class="bar"><i style="width:${(n+(passed?1:0))/3*100}%"></i></div><strong>${status}</strong></div><div class="pulse-module-layout"><nav class="pulse-module-nav" aria-label="Course modules"><span class="mini-label">In this course</span>${modules.map((item,i)=>`<a class="${i===n?'active':''} ${en?.lessons[i]?'passed':''}" href="#/${fullAccess||i===0?`lesson/${cid}/${i}`:`course/${cid}`}"><b>0${i+1}</b><span><strong>${esc(item.title)}</strong><small>${en?.lessons[i]?'Quiz passed':!fullAccess&&i>0?'Seat required':i===n?'You are here':'Slides + quiz'}</small></span></a>`).join('')}<div class="pulse-module-nav-final"><b>04</b><span><strong>Final assignment</strong><small>Manager reviewed</small></span></div>${link(`assignment/${cid}`,'See final task →','btn-outline btn-small')}</nav><main class="pulse-module-main"><div class="pulse-module-title"><span class="eyebrow">${esc(DOMAINS[c.domain])} · ${TIERS[c.tier-1]} ${!fullAccess?'· sample preview':''}</span><h1>${esc(module.title)}</h1><p>${esc(module.body)}</p></div><div class="pulse-slide-player" aria-label="Module slides"><div class="pulse-slide-toolbar"><span>▤ Slide lesson</span><span class="pulse-slide-count">01 / 0${slides.length}</span></div>${slides.map((slide,i)=>`<section class="pulse-slide" data-slide="${i}" ${i?'hidden':''}><div><span>${esc(slide.tag)}</span><h2>${esc(slide.title)}</h2><p>${esc(slide.body)}</p><small>${esc(slide.prompt)}</small></div><img src="${art}" alt="Abstract learning journey artwork"></section>`).join('')}<div class="pulse-slide-controls"><div class="pulse-slide-dots">${slides.map((_,i)=>`<i class="${i===0?'active':''}"></i>`).join('')}</div><div><button type="button" class="btn btn-outline btn-small" data-action="slide-prev" disabled>← Previous</button><button type="button" class="btn btn-outline btn-small" data-action="slide-next" ${slides.length===1?'disabled':''}>Next slide →</button></div></div></div><div class="pulse-module-reflection"><span>Try it in your role</span><p>${esc(module.callout)} Think of one task in ${esc(person?.position||'your position')} where you could show the source, action and result.</p></div>${quizArea}</main></div></div>`;
  };

  assignmentPage=function(){
    const person=employee(),items=state.enrollments.filter(e=>e.employeeId===person?.id),requested=route().split('/')[1],en=items.find(e=>e.courseId===requested)||items.find(e=>!['approved','flagged'].includes(e.status))||items[items.length-1];
    if(state.role==='employee'&&requested&&!items.some(e=>e.courseId===requested))return `<div class="pulse-module-page">${page('Final assignment',courseName(requested),'This task opens after all three module quizzes in your assigned course.')}<section class="pulse-course-final"><div class="pulse-course-final-symbol">✓</div><div><span class="mini-label">The review criteria</span><h2>Make your work easy to verify.</h2><p>Describe a real task in your role. Identify the source, show the action or calculation, then explain the conclusion and next step. Your department Manager reviews the evidence and records the decision.</p><div class="pulse-course-final-criteria"><span>Traceable source</span><span>Checkable action</span><span>Supported conclusion</span></div></div>${link(`course/${requested}`,'Start the modules →','btn-outline')}</section></div>`;
    if(state.role==='employee'&&en?.lessons.every(Boolean)&&!en.finalCheck){en.finalCheck=true;save()}
    const html=previousAssignment();
    if(state.role!=='employee'||!en)return html;
    const bridge=`<section class="pulse-assignment-sequence" aria-label="Course sequence"><div class="done"><b>01</b><span>Study modules<small>${en.lessons.filter(Boolean).length}/3 quizzes passed</small></span></div><div class="${en.lessons.every(Boolean)?'done':''}"><b>02</b><span>Final assignment<small>${en.attempts.length}/2 submissions</small></span></div><div class="${en.status==='approved'?'done':''}"><b>03</b><span>Manager decision<small>${en.status==='approved'?'Approved':'Evidence reviewed with a reason'}</small></span></div></section>`;
    return html.replace('<div class="stack">',`<div class="stack">${bridge}`);
  };

  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action!=='slide-prev'&&action!=='slide-next')return;
    const player=e.target.closest('.pulse-slide-player');if(!player)return;
    const slides=[...player.querySelectorAll('.pulse-slide')],current=slides.findIndex(slide=>!slide.hidden),next=Math.max(0,Math.min(slides.length-1,current+(action==='slide-next'?1:-1)));
    slides.forEach((slide,i)=>{slide.hidden=i!==next});
    player.querySelectorAll('.pulse-slide-dots i').forEach((dot,i)=>dot.classList.toggle('active',i===next));
    player.querySelector('.pulse-slide-count').textContent=`0${next+1} / 0${slides.length}`;
    player.querySelector('[data-action="slide-prev"]').disabled=next===0;
    player.querySelector('[data-action="slide-next"]').disabled=next===slides.length-1;
    if(next===slides.length-1&&slides.length>1&&state.role==='employee'){
      const [,cid,index]=route().split('/'),person=employee(),key=`${person?.id}|${cid}|${index}`;
      state.courseSlideViews??={};state.courseSlideViews[key]=true;save();
      const quiz=player.closest('.pulse-module-main')?.querySelector('.pulse-module-quiz');
      if(quiz){quiz.querySelector('.pulse-quiz-intro').hidden=true;quiz.querySelector('form[data-form="module-quiz"]').hidden=false}
    }
  });
  document.addEventListener('submit',e=>{
    const form=e.target.closest('form[data-form="module-quiz"]');if(!form)return;e.preventDefault();
    const cid=form.dataset.course,n=Number(form.dataset.index),person=employee(),module=moduleDetails(cid)[n],answers=new FormData(form),score=module.questions.reduce((total,question,i)=>total+(Number(answers.get(`q${i}`))===question.answer?1:0),0);
    if(!state.courseSlideViews?.[`${person?.id}|${cid}|${n}`])return toast('Read the three slides before taking this quiz.');
    if(score<module.questions.length){form.querySelector('.pulse-quiz-feedback').textContent=`${score}/${module.questions.length} correct. Review the slide examples and try again: ${module.questions.filter((q,i)=>Number(answers.get(`q${i}`))!==q.answer).map(q=>q.reason).join(' ')}`;return}
    let en=enrollment(cid,person);if(!en){startEnrollment(cid,person);en=enrollment(cid,person)}
    if(!en)return;
    if(n>0&&!en.lessons[n-1])return toast('Pass the previous module quiz first.');
    en.lessons[n]=true;en.moduleQuizzes??={};en.moduleQuizzes[n]={score,total:module.questions.length,passedAt:now()};
    if(en.lessons.every(Boolean))en.finalCheck=true;
    event('Module quiz passed',`${person.name} passed module ${n+1} in ${courseName(cid)}.`);
    save();render();toast(n===2?'All modules passed. The final assignment is ready.':'Quiz passed. The next module is ready.');
  });
})();
