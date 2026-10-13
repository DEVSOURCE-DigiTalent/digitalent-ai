/* Final business-flow checks for the connected, browser-local design preview. */
(function(){
  const previousDept=currentDept;
  const previousSide=side;
  const previousHeader=header;
  const previousPeople=peoplePage;
  const previousAssessment=assessmentPage;
  const previousEnrollment=startEnrollment;
  const previousReview=reviewPage;
  const previousManager=managerHome;
  const previousGapPanel=gapPanel;
  const previousCourse=coursePage;

  // The role switcher is a prototype control. This selection simulates a
  // different department Manager account; a live account would be fixed by auth.
  currentDept=function(){
    return state.departments.find(d=>d.name===state.previewManagerDept&&d.manager)
      ||state.departments.find(d=>d.manager)||previousDept();
  };
  header=function(path){
    const html=previousHeader(path);
    return state.role==='manager'?html.replace('<a href="#/owner">Overview</a>','<a href="#/manager">Overview</a>'):html;
  };
  side=function(path){
    const html=previousSide(path);
    if(state.role!=='manager')return html;
    const assigned=state.departments.filter(d=>d.manager);
    const picker=`<label class="flow-manager-picker">Preview Manager account<select id="manager-department" aria-label="Preview Manager department">${assigned.map(d=>`<option value="${esc(d.name)}" ${currentDept()?.name===d.name?'selected':''}>${esc(d.manager)} · ${esc(d.name)}</option>`).join('')}</select><small>Each account sees one department at a time.</small></label>`;
    return html.replace('<div class="side-foot">',`${picker}<div class="side-foot">`);
  };

  peoplePage=function(){
    let html=previousPeople();
    if(!state.published){
      html=html.replace('Assign a Manager first.','Publish the blueprint first.');
      html=html.replace('<button class="btn btn-outline" type="submit">Save Manager</button>','<button class="btn btn-outline" type="submit" disabled>Publish blueprint first</button>');
    }
    return html;
  };
  assessmentPage=function(){
    if(state.role==='employee')return previousAssessment();
    const person=activePerson();
    return `${page('Baseline assessment','The Employee confirms their starting level.','The Owner and department Manager can inspect results here after the Employee completes the test.')}${box(`<span class="mini-label">${person?esc(person.name)+' · '+esc(person.position):'No Employee selected'}</span><h2 class="panel-title" style="margin-top:10px">${person?.assessed?'Baseline recorded':'Assessment pending'}</h2><p class="panel-desc">This design preview represents the test with level selections. In the live product, Employee answers and scoring must produce the measured level.</p><div class="button-row">${link('gap','View current → target','btn-outline')}${link('people','See invitations','btn-outline')}</div>`)} `;
  };

  // A recommendation must be inside the Employee's own position path.
  recommended=function(person){
    const target=position(person)?.target||[];
    const domains=target.map((level,i)=>({level,i})).filter(x=>x.level>0);
    const measuredGap=domains.find(x=>person?.assessed&&person.current?.[x.i]>0&&person.current[x.i]<x.level);
    const ordered=measuredGap?[measuredGap,...domains.filter(x=>x.i!==measuredGap.i)]:domains;
    for(const {level,i} of ordered){
      for(let tier=1;tier<=level;tier++){
        const cid=courseId(i,tier);
        if(!approved(cid,person))return cid;
      }
    }
    return courseId(domains[0]?.i||0,1);
  };
  startEnrollment=function(cid,person){
    if(!state.published)return toast('Publish the capability blueprint before assigning learning.');
    if(!person?.assessed)return toast('The Employee must finish the baseline assessment before receiving a course path.');
    const c=parseCourse(cid),target=position(person)?.target?.[c.domain]||0;
    if(c.tier>target)return toast(`${person.name}'s ${person.position} path ends below this course. Update and publish the position target first.`);
    if(state.role==='employee'&&c.tier>1&&!enrollment(cid,person))return toast('The Owner must assign a purchased seat before this level opens.');
    return previousEnrollment(cid,person);
  };
  coursePage=function(value){
    const html=previousCourse(value);
    if(state.role!=='employee')return html;
    const person=employee(),c=parseCourse(value);
    if(!person||(position(person)?.target?.[c.domain]||0)<c.tier){
      const explanation=c.tier===1
        ?'This free Basic course remains readable, but it is outside your assigned position path and does not record path progress.'
        :'This paid course is outside your assigned position path. Its outline and sample are available, but a seat cannot be assigned to this position.';
      return html.replace('<div class="stack">',`<div class="stack">${notice(explanation,'warning')}`);
    }
    return html;
  };

  gapPanel=function(person){
    let html=previousGapPanel(person);
    if(!person)return html;
    const departmentCap=department(person.dept)?.ceiling||[];
    let domain=0;
    return html.replace(/<small class="pulse-cap-caption">[^<]*<\/small>/g,()=>{
      const i=domain++;
      return `<small class="pulse-cap-caption">Digital AI L3 ≥ Business L${state.business[i]||0} ≥ ${esc(person.dept)} L${departmentCap[i]||0} ≥ ${esc(person.position)} L${position(person)?.target?.[i]||0}</small>`;
    });
  };

  const missedInDepartment=()=>state.enrollments.filter(e=>
    effectiveStatus(e)==='deadline-missed'&&
    state.employees.find(p=>p.id===e.employeeId)?.dept===currentDept()?.name
  );
  managerHome=function(){
    const html=previousManager(),missed=missedInDepartment();
    if(!missed.length)return html;
    return html.replace('<section class="pu-overview',`${notice(`${missed.length} final submission deadline${missed.length===1?' has':'s have'} passed. Open the course review queue to arrange support. No next level is released.`, 'warning')}<section class="pu-overview`);
  };
  reviewPage=function(){
    const missed=missedInDepartment();
    if(!missed.length)return previousReview();
    const all=state.enrollments;
    let html;
    try{
      state.enrollments=all.filter(e=>!missed.includes(e));
      html=previousReview();
    }finally{state.enrollments=all}
    const cards=missed.map(e=>{
      const person=state.employees.find(p=>p.id===e.employeeId);
      return box(`<span class="mini-label">DEADLINE MISSED · ${esc(person?.name||'Employee')} · ${esc(courseName(e.courseId))}</span><h2 class="panel-title" style="margin-top:10px">Arrange support after the first unsuccessful submission.</h2><p class="panel-desc">The second submission was due ${date(e.deadlineAt)}. ${e.attempts.length}/2 submissions used. It is now closed; the Manager can coach, recommend a fresh learning cycle or pause. This is distinct from a two-fail flag.</p><p class="small">Latest feedback: ${esc(e.attempts.at(-1)?.reason||'No feedback recorded.')}</p><div class="button-row"><button class="btn btn-outline btn-small" data-action="support" data-id="${e.employeeId}|${e.courseId}" data-kind="Coaching after missed deadline">Arrange coaching</button><button class="btn btn-outline btn-small" data-action="support" data-id="${e.employeeId}|${e.courseId}" data-kind="Fresh cycle after missed deadline">Recommend fresh cycle</button><button class="btn btn-outline btn-small" data-action="support" data-id="${e.employeeId}|${e.courseId}" data-kind="Paused after missed deadline">Pause path</button></div>${e.support?notice(`Manager action: ${esc(e.support)}`,'success'):''}`);
    }).join('');
    return html.replace('<div class="stack">',`<div class="stack">${cards}`);
  };

  document.addEventListener('change',e=>{
    if(e.target.id!=='manager-department')return;
    state.previewManagerDept=e.target.value;
    selectedEmployeeId='';
    save();render();
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-action="assign-course"]');
    if(!button)return;
    e.preventDefault();e.stopImmediatePropagation();
    const chooser=document.querySelector('.basic-course-assignment select, form[data-form="assign-paid"] select');
    if(chooser){chooser.scrollIntoView({behavior:'smooth',block:'center'});chooser.focus();toast('Choose the Employee before assigning this course.');}
    else toast('Add an Employee to this position path first.');
  },true);
  document.addEventListener('submit',e=>{
    const form=e.target.closest('form[data-form]');
    if(!form)return;
    const type=form.dataset.form;
    if(type==='manager'&&!state.published){e.preventDefault();e.stopImmediatePropagation();return toast('Publish the blueprint before creating a Manager.');}
    if(type==='assessment'&&state.role!=='employee'){e.preventDefault();e.stopImmediatePropagation();return toast('The Employee completes their own baseline assessment.');}
    if(type==='review'){
      const data=new FormData(form),person=state.employees.find(p=>p.id===data.get('employee'));
      if(state.role!=='manager'||person?.dept!==currentDept()?.name){e.preventDefault();e.stopImmediatePropagation();return toast('This course decision belongs to its department Manager.');}
    }
  },true);
})();
