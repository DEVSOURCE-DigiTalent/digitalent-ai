/* Verified capability is derived from the baseline and Manager-approved evidence. */
(function () {
  const previousRender = render;
  const previousGapPanel = gapPanel;
  const previousGapPage = gapPage;
  const previousReportPage = reportPage;
  const previousEmployeeHome = employeeHome;
  const previousPathPage = pathPage;
  const previousActivePerson = activePerson;

  const level = value => Math.max(0, Math.min(3, Number(value) || 0));
  const label = value => level(value) ? `L${level(value)}` : 'Pending';

  function syncVerifiedCapability() {
    let changed = false;
    for (const person of state.employees) {
      if (!person.assessed) continue;
      if (!Array.isArray(person.baselineCurrent)) {
        person.baselineCurrent = [...(person.current || Array(6).fill(0))];
        changed = true;
      }
      person.courseLevels ||= {};
      person.current ||= Array(6).fill(0);
      for (const record of state.enrollments) {
        if (record.employeeId !== person.id || record.status !== 'approved') continue;
        const { domain, tier } = parseCourse(record.courseId);
        if (person.courseLevels[domain] < tier || !person.courseLevels[domain]) {
          person.courseLevels[domain] = tier;
          changed = true;
        }
      }
      for (let domain = 0; domain < DOMAINS.length; domain++) {
        const verified = Math.max(level(person.current[domain]), level(person.courseLevels[domain]), level(person.evidenceLevels?.[domain]));
        if (verified > level(person.current[domain])) {
          person.current[domain] = verified;
          changed = true;
          event('Capability level confirmed', `${person.name} · ${DOMAINS[domain]} ${label(person.baselineCurrent[domain])} baseline → ${label(verified)} verified. The baseline remains unchanged.`);
        }
      }
    }
    if (changed) save();
  }

  function comparison(person) {
    if (!person?.assessed) return '';
    const target = position(person)?.target || [];
    const baseline = person.baselineCurrent || person.current || [];
    return `<section class="capability-progress" aria-label="Baseline, verified level and position target"><div class="capability-progress-head"><strong>Capability progress</strong><span>Baseline → verified now → position target</span></div><div class="capability-progress-list">${DOMAINS.map((name, domain) => {
      if (!target[domain]) return '';
      const start = level(baseline[domain]);
      const current = level(person.current?.[domain]);
      const goal = level(target[domain]);
      const gain = Math.max(0, current - start);
      const remaining = Math.max(0, goal - current);
      const course = level(person.courseLevels?.[domain]);
      const practical = level(person.evidenceLevels?.[domain]);
      const source = course >= current && course > start ? 'Manager-approved course' : practical >= current && practical > start ? 'Approved practical evidence' : 'Entry assessment';
      const result = !current ? 'Level not confirmed' : `${gain ? `+${gain} level${gain === 1 ? '' : 's'} · ` : ''}${remaining ? `${remaining} to go` : 'Target met'}`;
      return `<div class="capability-progress-row"><div class="capability-progress-name"><strong>${esc(name)}</strong><small>${esc(source)}</small></div><div class="capability-progress-levels"><span>Start <b>${label(start)}</b></span><i aria-hidden="true">→</i><span>Now <b>${label(current)}</b></span><i aria-hidden="true">→</i><span>Target <b>${label(goal)}</b></span></div><span class="capability-progress-result ${!current ? 'pending' : remaining ? 'open' : 'met'}">${result}</span></div>`;
    }).join('')}</div></section>`;
  }

  function latestCourseOutcome(person) {
    if (!person?.assessed) return '';
    const approvedCourses = state.enrollments
      .filter(record => record.employeeId === person.id && record.status === 'approved')
      .sort((a, b) => (b.attempts?.at(-1)?.reviewedAt || b.assignedAt || 0) - (a.attempts?.at(-1)?.reviewedAt || a.assignedAt || 0));
    const latest = approvedCourses[0];
    if (!latest) return '';
    const { domain, tier } = parseCourse(latest.courseId);
    const baseline = level(person.baselineCurrent?.[domain]);
    const verified = level(person.current?.[domain]);
    const target = level(position(person)?.target?.[domain]);
    const gained = tier > baseline && verified === tier && level(person.courseLevels?.[domain]) >= tier;
    return `<section class="pulse-level-outcome ${gained ? 'advanced' : 'confirmed'}" aria-label="Latest Manager-approved course outcome">
      <div><span class="mini-label">Latest Manager-approved outcome</span><h2>${esc(DOMAINS[domain])} <strong>${label(baseline)} <i aria-hidden="true">→</i> ${label(verified)}</strong></h2><p>${esc(TIERS[tier - 1])} assignment approved. ${gained ? `Your verified capability reached ${label(verified)}; your position target is ${label(target)}.` : `This course confirms ${label(tier)}, which is already within your verified level. The entry baseline remains ${label(baseline)}.`}</p></div>
      <div class="pulse-level-outcome-actions"><span>${gained ? `+${verified - baseline} level${verified - baseline === 1 ? '' : 's'} since baseline` : 'Course complete · level confirmed'}</span>${link('path', 'See my capability path →', 'btn-outline btn-small')}</div>
    </section>`;
  }

  // A Manager can only approve a final assignment inside their department.
  document.addEventListener('submit', eventObject => {
    const form = eventObject.target.closest('form[data-form="review"]');
    if (!form) return;
    const data = new FormData(form);
    const person = state.employees.find(item => item.id === data.get('employee'));
    if (state.role === 'manager' && person?.dept === currentDept()?.name) return;
    eventObject.preventDefault();
    eventObject.stopImmediatePropagation();
    toast('This final assignment is outside your Manager review queue.');
  }, true);

  render = function () {
    syncVerifiedCapability();
    return previousRender();
  };

  // The Employee baseline must belong to the same account shown on Today and Path.
  activePerson = function () {
    return state.role === 'employee' ? employee() : previousActivePerson();
  };

  gapPanel = function (person) {
    const html = previousGapPanel(person)
      .replace('Tested current', 'Verified current')
      .replaceAll('tested current', 'verified now');
    return `${comparison(person)}${html}`;
  };

  gapPage = function () {
    return previousGapPage()
      .replace('See the starting point beside the goal.', 'See verified progress beside the goal.')
      .replace('Measured levels and position targets stay side by side, so the next course has a reason.', 'Entry baseline, verified capability and position target stay visible together.')
      .replace('MEASURED NOW', 'VERIFIED NOW')
      .replace('Measured now', 'Verified now')
      .replace('Baseline measured</span>', 'Baseline recorded</span>');
  };

  employeeHome = function () {
    const html = previousEmployeeHome()
      .replace('your tested ', 'your verified ')
      .replace('Each marker compares your confirmed starting level with your position target.', 'Each marker compares your verified level with your position target. The entry baseline stays recorded.');
    return html.replace('<div class="pulse-employee-intro">', `${latestCourseOutcome(employee())}<div class="pulse-employee-intro">`);
  };

  pathPage = function () {
    return previousPathPage()
      .replaceAll('measured now', 'verified now')
      .replace('connect your measured baseline to the target', 'connect your verified level to the target')
      .replace('Every measured level beside its target.', 'Your verified level beside its target.')
      .replace('Course completion and Manager approval do not silently change your measured baseline.', 'The entry baseline stays fixed. A Manager-approved final course assignment or practical task can raise the verified level.');
  };

  reportPage = function () {
    const visible = state.role === 'manager'
      ? state.enrollments.filter(record => state.employees.find(person => person.id === record.employeeId)?.dept === currentDept()?.name)
      : state.enrollments;
    const completed = visible.filter(record => record.status === 'approved');
    let baselineIndex = 0;
    const allEvents = state.events;
    let html;
    try {
      if (state.role === 'manager') {
        const names = state.employees.filter(person => person.dept === currentDept()?.name).map(person => person.name);
        state.events = allEvents.filter(item => names.some(name => item.detail?.includes(name)));
      }
      html = previousReportPage();
    } finally {
      state.events = allEvents;
    }
    return html
      .replace('<th>Baseline</th><th>Learning</th>', '<th>Remaining gap</th><th>Learning</th>')
      .replace(/Baseline measured: \d+\/6 domains confirmed\./g, () => {
        const person = state.employees.find(item => item.id === completed[baselineIndex++]?.employeeId);
        return `Baseline measured: ${(person?.baselineCurrent || person?.current || []).filter(value => value > 0).length}/6 domains confirmed.`;
      })
      .replaceAll('A passed course assignment confirms course evidence. A new assessment is required to claim that a capability gap closed.', 'A Manager-approved final assignment confirms that course level. Verified capability and the remaining gap update; the entry baseline stays fixed.')
      .replaceAll('This is evidence of course completion, not a new measured baseline.', 'This confirms the course level as verified capability. The entry baseline remains unchanged.')
      .replaceAll('A course pass does not overwrite a baseline test result.', 'Manager approval can raise the verified level and close a gap. The entry baseline remains available for comparison.')
      .replaceAll('Reassess the target skill after workplace practice.', 'Apply the confirmed skill in workplace practice.');
  };
})();
