/* Purchased-course sample and group assignment for the local design preview. */
(function () {
  const previousLanding = landing;
  const previousOwner = ownerHome;
  const previousCourse = coursePage;
  const previousRender = render;
  const paidCourse = '0-2';

  function purchasedSample() {
    const demo = sample();
    demo.org = 'Northstar Growth';
    demo.ownerEmail = 'owner@northstar-growth.example';
    demo.demoAccess = 'purchased-course';
    demo.purchases[paidCourse] = 3;
    const completed = personId => ({
      employeeId: personId, courseId: '0-1', lessons: [true, true, true], finalCheck: true,
      attempts: [{ at: Date.now() - 3 * 86400000, evidence: 'A traceable source, a checked calculation and a supported next action.', decision: 'pass', reason: 'The source, calculation and next action are clear.', reviewedAt: Date.now() - 2 * 86400000 }],
      status: 'approved', releaseAt: null, deadlineAt: null, assignedAt: Date.now() - 5 * 86400000
    });
    demo.enrollments = [completed('mia'), completed('ben'), {
      employeeId: 'mia', courseId: paidCourse, lessons: [false, false, false], finalCheck: false,
      attempts: [], status: 'learning', releaseAt: null, deadlineAt: null, assignedAt: Date.now() - 86400000
    }];
    demo.events.unshift(
      { at: Date.now() - 86400000, title: 'Purchased course seat assigned', detail: 'Mia Nguyen can study the complete Data & information · Intermediate course.' },
      { at: Date.now() - 2 * 86400000, title: 'Paid course seats purchased in preview', detail: 'Three sample seats were added. No payment was taken.' }
    );
    return demo;
  }

  landing = function () {
    return previousLanding().replace(
      '<button class="btn btn-outline" data-action="sample">Explore sample business</button>',
      '<button class="btn btn-outline" data-action="sample">Explore free trial</button><button class="btn btn-paid-demo" data-action="sample-paid">Explore purchased course →</button>'
    );
  };

  ownerHome = function () {
    const html = previousOwner();
    if (state.demoAccess !== 'purchased-course') return html;
    return `${html}<section class="paid-demo-banner"><div><span class="mini-label">Purchased course sample</span><h2>Full Intermediate content is ready to review.</h2><p>Three simulated seats for Data & information · Intermediate: Mia is learning, two seats remain. Basic prerequisites for Mia and Ben are already approved. No payment was taken.</p></div><div>${link('course/0-2', 'Review full course →', 'btn-primary')}${link('cohorts', 'Assign a group', 'btn-outline')}</div></section>`;
  };

  coursePage = function (value) {
    let html = previousCourse(value);
    if (state.role !== 'owner') return html;
    const cid = courseId(parseCourse(value).domain, parseCourse(value).tier);
    const purchased = Number(state.purchases[cid] || 0);
    if (parseCourse(cid).tier > 1 && purchased) {
      const used = state.enrollments.filter(item => item.courseId === cid).length;
      const available = Math.max(0, purchased - used);
      html = html.replace('The outline and first sample lesson are visible before purchase.', 'The Owner can review the complete purchased course. Assigned Employees can study all modules and submit the final assignment.');
      html = html.replace('Review this outline and sample before buying. A simulated seat is available to assign.', `${purchased} purchased seat${purchased === 1 ? '' : 's'} in this sample · ${available} available to assign. No payment was taken.`);
    }
    return `${html}<section class="course-group-link"><div><span class="mini-label">Assign at scale</span><h2>One course. The right people.</h2><p>Send this course to an entire department or select several Employees. The assignment preview checks position targets, prerequisites and available seats.</p></div>${link('cohorts', 'Assign department or group →', 'btn-outline')}</section>`;
  };

  const allCourses = () => DOMAINS.flatMap((_, domain) => TIERS.map((_, tier) => courseId(domain, tier + 1)));
  const dateValue = timestamp => new Date(timestamp).toISOString().slice(0, 10);
  const dayFromNow = days => dateValue(now() + days * 86400000);

  function assignmentForm() {
    const departments = state.departments.map(dept => `<option value="${esc(dept.name)}">${esc(dept.name)}</option>`).join('');
    const employees = state.employees.map(person => `<label class="bulk-person"><input type="checkbox" name="person" value="${esc(person.id)}"><span><strong>${esc(person.name)}</strong><small>${esc(person.dept)} · ${esc(person.position)}</small></span></label>`).join('');
    return `<section class="bulk-assignment" id="bulk-assignment"><div class="bulk-assignment-head"><span class="mini-label">Group enrollment</span><h2>Assign a department or a chosen group.</h2><p>Each Employee already inherits the learning target of their position. This action starts one course for a group, or starts each person’s next eligible course on that path.</p></div>
      <form id="bulk-assignment-form" data-form="bulk-assignment">
        <div class="bulk-assignment-grid"><label class="field">Cohort name<input name="name" required maxlength="80" value="Team learning cycle"></label><label class="field">Audience<select name="audience"><option value="department">Everyone in a department</option><option value="people">Choose multiple Employees</option></select></label><label class="field bulk-department-field">Department<select name="department">${departments}</select></label><div class="bulk-people-field" hidden><span class="bulk-field-label">Select Employees</span><div class="bulk-person-list">${employees || '<p>Add Employees before creating a group.</p>'}</div></div><label class="field">Assign<select name="learning"><option value="course">One selected course</option><option value="path">Each person’s next path course</option></select></label><label class="field bulk-course-field">Course<select name="course">${allCourses().map(cid => `<option value="${cid}" ${state.demoAccess === 'purchased-course' && cid === paidCourse ? 'selected' : ''}>${esc(courseName(cid))}${parseCourse(cid).tier === 1 ? ' · free' : ' · paid seat'}</option>`).join('')}</select></label><label class="field">Finish by<input name="due" type="date" min="${dayFromNow(0)}" value="${dayFromNow(14)}" required></label></div>
        <div id="bulk-assignment-preview" class="bulk-assignment-preview" aria-live="polite"></div><button class="btn btn-primary" type="submit">Assign eligible learners →</button><p class="field-hint">The preview excludes people whose baseline, position target or prerequisite is not ready. Paid courses require enough purchased seats for everyone in the ready group.</p>
      </form></section>`;
  }

  function nextPathCourse(person) {
    const target = position(person)?.target || [];
    for (let domain = 0; domain < DOMAINS.length; domain++) {
      if (!person.assessed || !person.current?.[domain] || target[domain] <= person.current[domain]) continue;
      for (let tier = 1; tier <= target[domain]; tier++) {
        const cid = courseId(domain, tier);
        if (enrollment(cid, person)?.status !== 'approved') return cid;
      }
    }
    return null;
  }

  function plan(form) {
    const data = new FormData(form);
    const audience = String(data.get('audience'));
    const selected = audience === 'department'
      ? state.employees.filter(person => person.dept === data.get('department'))
      : state.employees.filter(person => data.getAll('person').includes(person.id));
    const mode = String(data.get('learning'));
    const singleCourse = String(data.get('course'));
    const ready = [], excluded = [];
    for (const person of selected) {
      const cid = mode === 'path' ? nextPathCourse(person) : singleCourse;
      let reason = '';
      if (!state.published) reason = 'Publish the blueprint first';
      else if (!person.assessed) reason = 'Baseline pending';
      else if (!cid) reason = 'No confirmed gap awaiting a course';
      else if (enrollment(cid, person)) reason = 'Already assigned or completed';
      else if ((position(person)?.target?.[parseCourse(cid).domain] || 0) < parseCourse(cid).tier) reason = 'Outside this position target';
      else if (!courseEligible(cid, person)) reason = 'Prior course level not approved';
      else if (parseCourse(cid).tier > 1 && state.secondary?.courseMeta?.[cid]?.open === false) reason = 'Paid course paused';
      (reason ? excluded : ready).push({ person, cid, reason });
    }
    const needed = new Map();
    for (const item of ready) if (parseCourse(item.cid).tier > 1) needed.set(item.cid, (needed.get(item.cid) || 0) + 1);
    const shortages = [...needed].map(([cid, count]) => {
      const used = state.enrollments.filter(item => item.courseId === cid).length;
      const available = Math.max(0, Number(state.purchases[cid] || 0) - used);
      return { cid, count, available };
    }).filter(item => item.available < item.count);
    return { selected, ready, excluded, shortages };
  }

  function preview(form) {
    const result = plan(form);
    const host = form.querySelector('#bulk-assignment-preview');
    host.innerHTML = `<div class="bulk-preview-top"><strong>${result.ready.length} ready · ${result.excluded.length} excluded</strong><span>${result.selected.length} selected Employee${result.selected.length === 1 ? '' : 's'}</span></div>
      ${result.ready.length ? `<div class="bulk-preview-list">${result.ready.map(item => `<div><span>${esc(item.person.name)} <small>${esc(item.person.dept)} / ${esc(item.person.position)}</small></span><b>${esc(courseName(item.cid))}</b></div>`).join('')}</div>` : '<p>Select Employees with a confirmed baseline and eligible path to preview assignment.</p>'}
      ${result.excluded.length ? `<div class="bulk-preview-excluded"><strong>Not assigned in this batch</strong>${result.excluded.map(item => `<span>${esc(item.person.name)} · ${esc(item.reason)}</span>`).join('')}</div>` : ''}
      ${result.shortages.length ? `<div class="bulk-preview-shortage">${result.shortages.map(item => `${esc(courseName(item.cid))}: ${item.count} seat${item.count === 1 ? '' : 's'} needed, ${item.available} available`).join('<br>')}</div>` : ''}`;
    form.querySelector('button[type="submit"]').disabled = !result.ready.length || Boolean(result.shortages.length);
    return result;
  }

  function showForm() {
    if (!state.verified || state.secondary?.suspended || state.role !== 'owner' || route() !== 'cohorts') return;
    const pageHead = document.querySelector('.main-area .page-head');
    if (!pageHead || document.querySelector('#bulk-assignment')) return;
    pageHead.insertAdjacentHTML('afterend', assignmentForm());
    pageHead.querySelector('p').textContent = 'Assign one course to a department or chosen Employees, or start each person’s next eligible path course. Baselines, position targets, prerequisites and seats are checked before enrollment.';
    const quickLabel = document.querySelector('.sideflow-layout .mini-label');
    if (quickLabel) quickLabel.textContent = 'Quick assignment · one position or Employee';
    preview(document.querySelector('#bulk-assignment-form'));
  }

  function tuneSingleCourseAssignment() {
    if (state.role !== 'owner' || !route().startsWith('course/')) return;
    const form = document.querySelector('form[data-form="assign-paid"]');
    const cid = route().split('/')[1];
    if (!form || parseCourse(cid).tier === 1) return;
    const select = form.querySelector('select[name="employee"]');
    for (const option of select.options) {
      const person = state.employees.find(item => item.id === option.value);
      const reason = !person?.assessed ? 'baseline pending'
        : enrollment(cid, person) ? 'already assigned'
        : (position(person)?.target?.[parseCourse(cid).domain] || 0) < parseCourse(cid).tier ? 'outside position target'
        : !courseEligible(cid, person) ? 'prior course not approved' : '';
      option.disabled = Boolean(reason);
      if (reason) option.textContent += ` · ${reason}`;
    }
    const first = [...select.options].find(option => !option.disabled);
    const button = form.querySelector('button[type="submit"]');
    if (first) select.value = first.value;
    else button.disabled = true;
    form.insertAdjacentHTML('beforeend', `<p class="field-hint">${first ? 'Only eligible Employees without this course are selectable.' : 'No eligible Employee is waiting for this course. Review your department or position targets.'}</p>`);
  }

  render = function () {
    previousRender();
    showForm();
    tuneSingleCourseAssignment();
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action="sample-paid"]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    state = purchasedSample();
    save();
    go('owner');
  }, true);

  document.addEventListener('change', event => {
    const form = event.target.closest('#bulk-assignment-form');
    if (!form) return;
    const audience = form.elements.audience.value;
    const learning = form.elements.learning.value;
    form.querySelector('.bulk-department-field').hidden = audience !== 'department';
    form.querySelector('.bulk-people-field').hidden = audience !== 'people';
    form.querySelector('.bulk-course-field').hidden = learning !== 'course';
    preview(form);
  });

  document.addEventListener('submit', browserEvent => {
    const form = browserEvent.target.closest('#bulk-assignment-form');
    if (!form) return;
    browserEvent.preventDefault();
    browserEvent.stopImmediatePropagation();
    if (state.role !== 'owner' || route() !== 'cohorts' || !form.reportValidity()) return;
    const result = preview(form);
    if (!result.ready.length || result.shortages.length) return toast('Resolve the assignment preview before continuing.');
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const due = Date.parse(`${data.get('due')}T23:59:59`);
    if (!name || !Number.isFinite(due) || due < now()) return toast('Choose a cohort name and a future due date.');
    const groups = new Map();
    for (const item of result.ready) {
      if (!groups.has(item.cid)) groups.set(item.cid, []);
      groups.get(item.cid).push(item.person);
    }
    for (const [cid, people] of groups) {
      for (const person of people) startEnrollment(cid, person);
      state.secondary.cohorts.unshift({ id: id(), name: groups.size === 1 ? name : `${name} · ${courseName(cid)}`, courseId: cid, people: people.map(person => person.id), due, createdAt: now() });
    }
    event('Group learning assigned', `${result.ready.length} Employee(s) across ${groups.size} course(s); ${result.excluded.length} excluded after eligibility checks.`);
    save();
    render();
    toast(`${result.ready.length} Employee${result.ready.length === 1 ? '' : 's'} assigned. ${result.excluded.length} excluded with reasons shown before confirmation.`);
  }, true);
})();
