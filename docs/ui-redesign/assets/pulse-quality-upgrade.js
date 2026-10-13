/* Reviewable design improvements. Sample data only; no product API calls. */
(function () {
  const statusText = {met:'Meets target',gap:'Confirmed gap',unknown:'Unconfirmed',optional:'Not required'};
  const domainOffsets = omDomainOffsets();

  ownerManagerHeader = function (p) {
    const owner = p.role === 'owner';
    return `<header class="qu-page-heading ${owner?'qu-owner':'qu-manager'}">
      <h1 class="qu-visually-hidden">${esc(p.title)}</h1><span class="om-kicker">${owner?'ENTERPRISE OWNER':'TEAM MANAGER'} <span class="qu-screen-code">/ ${p.id} · ${esc(p.title)}</span></span>
    </header>`;
  };

  signature = function (p) {
    if(p.role==='owner'||p.role==='manager')return ownerManagerHeader(p);
    const feature=FEATURES[p.id]||[p.title,'Open the relevant details and complete the next step.',p.id];
    if(p.id==='CK-01')return `<section class="qu-public-hero"><div class="qu-public-copy"><span class="om-kicker">DIGITAL LEARNING / SIX DOMAINS</span><h1>Find a course your team can use.</h1><p>Explore all 18 courses. Basic is free to view and learn; Intermediate and Advanced open after purchase.</p><button class="btn" onclick="document.getElementById('page-content').scrollIntoView({behavior:'smooth'})">Browse courses ↓</button></div><div class="qu-public-art"><img src="assets/competency-architecture.png" alt="Abstract glass forms connected along a learning path"></div></section>`;
    if(p.id==='PA-01')return `<section class="qu-admin-hero"><div><span class="om-kicker">PLATFORM ADMIN / CONTROL ROOM</span><h1>Keep every release traceable.</h1><p>Review draft content, the shared standard and customer access before a change goes live.</p></div><div class="qu-admin-state"><span><b>V1.0</b> live framework</span><span><b>1</b> draft awaiting review</span>${link('PA-08','Inspect curriculum','secondary')}</div></section>`;
    return `<header class="qu-role-heading role-${p.role}"><span class="om-kicker">${p.role==='platform'?'PLATFORM ADMIN':'EXPLORE'} / ${p.id}</span><h1>${esc(p.title)}</h1><p>${esc(feature[1])}</p></header>`;
  };
  const originalCourseMatrix=courseMatrix;
  courseMatrix=function(){return `<p class="qu-matrix-hint">Scroll sideways to compare Basic, Intermediate and Advanced →</p>${originalCourseMatrix()}`;};

  omSelectDomain = function (index) {
    state.domain = index;
    render();
    const selected = document.querySelector('.om-domain-line.selected');
    const detail = document.getElementById('qu-skill-detail');
    if (matchMedia('(max-width: 900px)').matches && detail) {
      detail.scrollIntoView({behavior:'smooth',block:'start'});
      detail.focus({preventScroll:true});
    } else selected?.focus({preventScroll:true});
  };

  omHeatmap = function (personIndex, interactive = true) {
    const person = PEOPLE[personIndex];
    return `<div class="om-heatmap qu-heatmap" role="group" aria-label="Six domains and 24 competencies">
      ${DOMAINS.map((domain,d) => {
        const statuses = domain[1].map((_,j) => omStatus(person,domainOffsets[d]+j));
        const gaps = statuses.filter(x => x === 'gap').length;
        const unknown = statuses.filter(x => x === 'unknown').length;
        const summary = `${gaps} gaps · ${unknown} unconfirmed`;
        const action = interactive ? `omSelectDomain(${d})` : `state.person=${personIndex};state.domain=${d};go('${state.role==='manager'?'MG-02':'OW-08'}')`;
        return `<button type="button" class="om-domain-line ${state.domain===d?'selected':''}" onclick="${action}" aria-label="${esc(domain[0])}: ${summary}. Open skill details" ${interactive?`aria-pressed="${state.domain===d}"`:''}>
          <span class="om-domain-index">0${d+1}</span><span class="qu-domain-name"><strong>${esc(SHORT[d])}</strong><small>${summary}</small></span>
          <span class="om-cell-strip" aria-hidden="true">${statuses.map((status,j) => `<i class="om-skill-cell ${status}" title="${esc(domain[1][j][0]+' '+domain[1][j][1]+': '+statusText[status])}"></i>`).join('')}</span>
          <span class="om-domain-arrow" aria-hidden="true">↗</span></button>`;
      }).join('')}</div>`;
  };

  function summaryCounts(person) {
    const counts = omCounts(person);
    return `<div class="qu-count-strip" aria-label="Capability status">
      <div><strong>${counts.met}<small> / ${counts.required}</small></strong><span>Meet job target</span></div>
      <div><strong>${counts.gaps}</strong><span>Confirmed gaps</span></div>
      <div><strong>${counts.unknown}</strong><span>Unconfirmed</span></div>
    </div>`;
  }

  function skillDetails(person, domainIndex) {
    const domain = DOMAINS[domainIndex], offset = domainOffsets[domainIndex];
    return `<section class="om-surface qu-skill-detail" id="qu-skill-detail" tabindex="-1" aria-label="Selected competency details">
      <div class="om-panel-top"><div><span class="om-kicker">DOMAIN 0${domainIndex+1} · ${domain[1].length} COMPETENCIES</span><h3>${esc(domain[0])}</h3></div></div>
      <p class="qu-detail-intro">Confirmed level, job target and evidence source for each skill.</p>
      <div class="qu-skill-list">${domain[1].map(([code,name],j) => {
        const index=offset+j, current=person.levels[index], target=REQUIRED[index], status=omStatus(person,index);
        const source=current>0?(index%4===0?'Course and evidence':'Initial assessment'):'No confirmed source';
        return `<div class="qu-skill-item"><div class="qu-skill-item-top"><span class="om-code">${esc(code)}</span><strong>${esc(name)}</strong><span class="om-status ${status}">${statusText[status]}</span></div>
          <div class="qu-level-flow"><span>Current <b>${current>0?levelName(current):'Unconfirmed'}</b></span><span aria-hidden="true">→</span><span>Job target <b>${target?levelName(target):'Not required'}</b></span></div>
          <small>Source: ${source}</small></div>`;
      }).join('')}</div>
    </section>`;
  }

  ownerManagerCapability = function (role) {
    const person=PEOPLE[state.person], owner=role==='owner';
    return `<section class="om-capability qu-capability">
      <div class="qu-cap-heading"><div><span class="om-kicker">${owner?'ORGANIZATION':'TEAM'} / INDIVIDUAL PROFILE</span><h2>Every skill has a clear status.</h2><p>Compare a confirmed level with the target set for this position.</p></div>${omPersonPicker()}</div>
      ${summaryCounts(person)}
      <div class="qu-cap-grid"><div class="om-surface om-map-surface"><div class="om-panel-top"><div><span class="om-kicker">${esc(person.position.toUpperCase())} · 24 COMPETENCIES</span><h3>${esc(person.name)}'s skill map</h3></div></div>
        <p class="qu-map-instruction">Choose a domain to inspect its skills. Each row names its gaps and missing assessments.</p>${omHeatmap(state.person)}${omLegend()}
      </div>${skillDetails(person,state.domain)}</div>
      <div class="qu-cap-actions">${link(owner?'OW-06':'MG-03',owner?'Edit job targets':'Review evidence')}${link(owner?'OW-13':'MG-05',owner?'Find learning':'Track learning','secondary')}</div>
      <p class="om-under-note">Sample levels and sources are illustrative. An unconfirmed level is separate from a confirmed gap.</p>
    </section>`;
  };

  ownerManagerDashboard = function () {
    const person=PEOPLE[state.person], counts=omCounts(person);
    return `<section class="om-dashboard qu-owner-dashboard">
      <div class="qu-dashboard-intro"><div><span class="om-kicker">ORGANIZATION / CAPABILITY DECISIONS</span><h2>See the gap. Choose the next move.</h2><p>The 24-skill profile connects a job target to a person's confirmed evidence.</p></div>${link('OW-08','Open full profile')}</div>
      <div class="qu-owner-grid"><div class="om-surface om-dashboard-map"><div class="om-panel-top"><div><span class="om-kicker">${esc(person.position.toUpperCase())} / SIX DOMAINS</span><h3>${esc(person.name)}'s skill map</h3></div><label class="qu-dark-person-picker">Employee <select aria-label="Choose employee" onchange="state.person=Number(this.value);render()">${PEOPLE.map((x,i)=>`<option value="${i}" ${i===state.person?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label></div>
        ${omHeatmap(state.person,false)}${omLegend()}<div class="qu-map-counts"><span><b>${counts.met}/${counts.required}</b> targets met</span><span><b>${counts.gaps}</b> confirmed gaps</span><span><b>${counts.unknown}</b> unconfirmed</span></div>
      </div><aside class="qu-owner-decisions"><div class="qu-decision-heading"><span class="om-kicker">NEXT DECISIONS</span><strong>Turn insight into action</strong></div>
        <button onclick="go('OW-06')"><span>01</span><strong>Set job targets</strong><small>Choose the skills this position requires.</small><em>Open requirements ↗</em></button>
        <button onclick="go('OW-09')"><span>02</span><strong>Inspect confirmed gaps</strong><small>${counts.gaps} gaps for ${esc(person.name)}.</small><em>See the evidence ↗</em></button>
        <button onclick="go('OW-13')"><span>03</span><strong>Choose learning access</strong><small>Basic is free; higher courses use purchased seats.</small><em>Review courses ↗</em></button>
      </aside></div>
      <p class="om-under-note">Profile values are sample data. Missing assessment and a confirmed gap remain distinct.</p>
    </section>`;
  };

  managerDashboardVisual = function () {
    return `<section class="om-dashboard qu-manager-dashboard">
      <div class="qu-dashboard-intro"><div><span class="om-kicker">TODAY / MANAGER</span><h2>One decision at a time.</h2><p>Start with evidence due soon, then check resubmissions and team learning.</p></div>${link('MG-03','Open full review queue','secondary')}</div>
      <div class="qu-manager-grid"><article class="qu-priority-card"><div class="qu-priority-top"><span class="qu-urgent-tag">01 · DUE TOMORROW</span><span>DATA 1.3 · PRACTICAL EVIDENCE</span></div>
        <div class="qu-priority-art" aria-hidden="true"><i></i><i></i><i></i></div><h3>Review Alex's tracking report.</h3><p>Check the source, calculation and conclusion against the shared rubric before deciding.</p>
        <div class="qu-priority-meta"><span><b>Alex Tran</b> · Sales (CRM)</span><span>Due tomorrow</span></div><div class="actions">${link('MG-04','Open evidence and rubric')}${link('MG-03','See all submissions','secondary')}</div>
      </article><aside class="om-surface qu-team-signal"><div class="om-panel-top"><div><span class="om-kicker">TEAM CAPABILITY</span><h3>Look behind the work.</h3></div></div>
        <p>Open a person's full 24-skill profile to see current level, target, gap and evidence.</p>
        ${PEOPLE.map((x,i)=>{const count=omCounts(x);return `<button class="qu-person-row" onclick="state.person=${i};go('MG-02')"><span class="om-initials">${x.name.split(' ').map(v=>v[0]).join('')}</span><span><strong>${esc(x.name)}</strong><small>${count.met}/${count.required} meet target · ${count.gaps} gaps · ${count.unknown} unconfirmed</small></span><b aria-hidden="true">↗</b></button>`}).join('')}
      </aside></div>
      <div class="qu-next-heading"><div><span class="om-kicker">UP NEXT</span><h3>Keep the team moving.</h3></div>${link('MG-05','Team learning','secondary')}</div>
      <div class="qu-next-grid"><button class="qu-next-card" onclick="go('MG-03')"><span class="qu-rework-tag">RESUBMITTED TODAY</span><strong>Linh revised the report.</strong><small>Compare the new source and calculation with your previous feedback.</small><em>Open review queue ↗</em></button>
        <button class="qu-next-card" onclick="state.person=2;go('MG-02')"><span class="qu-learning-tag">LEARNING NEAR DUE</span><strong>Minh may need support.</strong><small>One course is at 20%. Check the competency gap before sending a reminder.</small><em>Open skill profile ↗</em></button></div>
      <p class="om-under-note">Names, deadlines and skill levels are illustrative; this preview makes no review decision or reminder.</p>
    </section>`;
  };

  const renderBeforeUpgrade=render;
  render=function(){renderBeforeUpgrade();enhanceNavigation();enhanceControlReadability();};
  function enhanceNavigation(){
    const roleTabs=document.querySelector('.sidebar .role-tabs');
    if(roleTabs&&!document.getElementById('qu-role-select')){
      roleTabs.insertAdjacentHTML('beforebegin',`<label class="qu-mobile-role">Workspace <select id="qu-role-select" aria-label="Choose workspace" onchange="setRole(this.value)">${Object.entries(ROLE_NAME).map(([role,name])=>`<option value="${role}" ${state.role===role?'selected':''}>${name}</option>`).join('')}</select></label>`);
    }
    const mobileNav=document.querySelector('main .mobile-nav');
    const sidebar=document.querySelector('.sidebar');
    if(mobileNav&&sidebar){
      const wrapper=document.createElement('label');
      wrapper.className='qu-mobile-screen';
      wrapper.textContent='Screen';
      wrapper.appendChild(mobileNav);
      sidebar.appendChild(wrapper);
    }
  }
  function enhanceControlReadability(){
    document.querySelectorAll('main button,main a,main select,main input,main textarea').forEach(element=>{
      if(parseFloat(getComputedStyle(element).fontSize)<12)element.classList.add('qu-small-control');
    });
    document.querySelectorAll('main p,main small,main span,main strong,main b,main label,main li,main th,main em').forEach(element=>{
      if(!element.getClientRects().length||![...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim()))return;
      if(parseFloat(getComputedStyle(element).fontSize)<12)element.classList.add(element.tagName==='P'?'qu-small-paragraph':'qu-small-text');
    });
  }
  render();
})();
