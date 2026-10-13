/* Role profiles for the browser-local product preview. */
(function () {
  const previousHeader = header;
  const previousRender = render;
  const validRoles = new Set(['owner', 'manager', 'employee', 'admin']);
  const publicRoutes = new Set(['welcome', 'register', 'login', 'verify']);

  const initials = name => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('') || 'P';
  const fact = (label, value) => `<div class="profile-fact"><span>${esc(label)}</span><strong>${esc(value || 'Not provided in this preview')}</strong></div>`;
  const permission = (number, title, detail) => `<article class="profile-permission"><span>${number}</span><h3>${esc(title)}</h3><p>${esc(detail)}</p></article>`;
  const action = (path, label) => link(path, label, 'btn-outline btn-small');
  const status = person => person?.assessed ? `${gapCount(person)} confirmed gap${gapCount(person) === 1 ? '' : 's'}` : 'Baseline pending';

  function roleProfile() {
    const role = state.role;
    if (role === 'owner') {
      const active = state.enrollments.filter(item => item.status !== 'approved').length;
      return {
        label: 'Enterprise Owner', name: 'Business Owner',
        scope: state.org || 'Business workspace',
        summary: 'Shape the company capability blueprint, give people the right position path and see the outcome of each training cycle.',
        facts: [['Work email', state.ownerEmail], ['Organization', state.org], ['Access', 'Entire business'], ['Blueprint', state.published ? 'Published' : 'Draft']],
        metrics: [[state.departments.length, 'Departments'], [`${state.employees.length}/10`, 'Trial Employee seats'], [active, 'Course cycles underway']],
        permissions: [
          ['01', 'Set the standard', 'Choose business ceilings, then department and position targets within the Digital AI framework.'],
          ['02', 'Route the team', 'Assign department Managers, add Employees and allocate free or purchased courses.'],
          ['03', 'Read the outcome', 'Review current-versus-target gaps, Manager decisions and complete course-cycle reports.']
        ],
        routes: [['setup', 'Open blueprint'], ['people', 'Manage people'], ['report', 'View reports']],
        detail: `<span class="mini-label">Your decision boundary</span><h2>Business → department → position.</h2><p>Each level stays at or below its parent. A Manager may suggest a department change; the Owner decides whether to include it in the next published blueprint.</p>${action('setup', 'Review capability levels →')}`
      };
    }
    if (role === 'manager') {
      const dept = currentDept();
      const people = state.employees.filter(person => person.dept === dept?.name);
      const pending = state.enrollments.filter(item => people.some(person => person.id === item.employeeId) && item.status === 'pending').length;
      return {
        label: 'Team Manager', name: dept?.manager || 'Manager not assigned',
        scope: dept?.name || 'Department not assigned',
        summary: 'Guide one department: inspect each person’s target, review final course assignments and record a clear decision with evidence.',
        facts: [['Department', dept?.name], ['Organization', state.org], ['Access', 'Assigned department only'], ['Work email', 'Not provided in this preview']],
        metrics: [[people.length, 'Team Employees'], [pending, 'Assignments to review'], [people.filter(person => person.assessed).length, 'Baselines recorded']],
        permissions: [
          ['01', 'See the team', 'Compare each Employee’s measured level with the target of their assigned position.'],
          ['02', 'Grade the final work', 'Review one final assignment after each course. AI suggestions support your decision; you record the verdict and reason.'],
          ['03', 'Support progress', 'Follow the timed second submission, respond to support flags and propose capability changes to the Owner.']
        ],
        routes: [['gap', 'Team capability'], ['review', 'Final assignments'], ['team-training', 'Team training']],
        detail: `<span class="mini-label">Your team scope</span><h2>${esc(dept?.name || 'Department')} only.</h2><p>${people.length} Employee${people.length === 1 ? '' : 's'} in this department. Position targets are set by the Owner’s published blueprint. Your course decisions stay with this team.</p>${action('gap', 'See current → target →')}`
      };
    }
    if (role === 'employee') {
      const person = employee();
      const mine = state.enrollments.filter(item => item.employeeId === person?.id);
      const target = position(person)?.target || [];
      const comparison = person && target.length ? `<div class="profile-domain-list">${DOMAINS.map((domain, index) => `<div><span>${esc(domain)}</span><strong>${person.assessed && person.current?.[index] > 0 ? `L${person.current[index]}` : 'Pending'} <i aria-hidden="true">→</i> L${target[index] || 0}</strong></div>`).join('')}</div>` : '<p>Your position path appears after the Owner assigns a department and position.</p>';
      return {
        label: 'Employee', name: person?.name || 'Employee invitation pending',
        scope: person ? `${person.dept} · ${person.position}` : state.org || 'Learning workspace',
        summary: 'Your learning space follows the target for your own position. Start with the baseline, complete course modules and submit final work for Manager review.',
        facts: [['Work email', person?.email], ['Department', person?.dept], ['Position', person?.position], ['Baseline', person?.assessed ? 'Completed' : 'Pending']],
        metrics: [[status(person), 'Current → target'], [mine.length, 'Assigned courses'], [mine.filter(item => item.status === 'approved').length, 'Approved courses']],
        permissions: [
          ['01', 'Know your starting point', 'Complete the baseline test and see your current levels next to the target for your position.'],
          ['02', 'Follow your path', 'Learn through course modules, slides and quizzes. Basic courses are free in full.'],
          ['03', 'Show your work', 'Submit the final assignment and read your Manager’s decision and feedback.']
        ],
        routes: [[person?.assessed ? 'path' : 'assessment', person?.assessed ? 'My learning path' : 'Take baseline test'], ['employee', 'Today'], ['assignment', 'Practice']],
        detail: `<span class="mini-label">Your capability path</span><h2>Current level beside your position target.</h2><p>A pending baseline is shown as pending, so it is never mistaken for a confirmed gap.</p>${comparison}${action('path', 'Open full path →')}`
      };
    }
    return {
      label: 'Platform Admin', name: 'Platform Admin',
      scope: 'Digital AI platform',
      summary: 'Maintain the shared Digital AI framework, release curriculum and handle customer support actions with an audit reason.',
      facts: [['Workspace', 'Platform operations'], ['Scope', 'Shared standard and customer support'], ['Personal identity', 'Not provided in this preview'], ['Framework', `Published v${state.secondary?.frameworkVersion || 1}.0`]],
      metrics: [[DOMAINS.length, 'Capability domains'], [DOMAINS.length * TIERS.length, 'Standard courses'], [state.secondary?.audit?.length || 0, 'Audit entries']],
      permissions: [
        ['01', 'Publish the source', 'Maintain the six-domain standard that sets the outer ceiling for every business.'],
        ['02', 'Release courses', 'Manage curriculum drafts, questions, pricing and published versions.'],
        ['03', 'Support accounts', 'Inspect organizations and users. Record a reason for sensitive support actions.']
      ],
      routes: [['admin/framework', 'Shared framework'], ['admin/curriculum', 'Curriculum'], ['admin/audit', 'Audit log']],
      detail: `<span class="mini-label">Your decision boundary</span><h2>One shared source, many business blueprints.</h2><p>Platform Admin publishes the Digital AI ceiling and standard courses. Each Owner designs business, department and position targets within it.</p>${action('admin/framework', 'Open shared framework →')}`
    };
  }

  function profilePage() {
    const profile = roleProfile();
    return `<div class="profile-page">
      <section class="profile-hero">
        <div class="profile-hero-copy"><span class="eyebrow">My profile · ${esc(profile.label)}</span><div class="profile-intro"><div class="profile-avatar" aria-hidden="true">${esc(initials(profile.name))}</div><div><h1>${esc(profile.name)}</h1><strong>${esc(profile.scope)}</strong></div></div><p>${esc(profile.summary)}</p><div class="profile-hero-actions">${profile.routes.map(([path, label]) => action(path, label)).join('')}</div></div>
        <div class="profile-art" aria-hidden="true"><span class="profile-art-orbit"></span><span class="profile-art-mark">${esc(initials(profile.name))}</span><span class="profile-art-role">${esc(profile.label)}</span></div>
      </section>
      <section class="profile-facts" aria-label="Account details">${profile.facts.map(([label, value]) => fact(label, value)).join('')}</section>
      <section class="profile-metrics" aria-label="Your workspace at a glance">${profile.metrics.map(([value, label]) => `<div><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('')}</section>
      <div class="profile-main-grid"><section class="profile-panel"><span class="mini-label">Role and responsibilities</span><h2>What you can do here.</h2><div class="profile-permissions">${profile.permissions.map(parts => permission(...parts)).join('')}</div></section><section class="profile-panel profile-detail">${profile.detail}</section></div>
      <p class="profile-preview-note">This is a browser-local design preview. The displayed identity and activity come from the current sample workspace; profile changes require the live account system.</p>
    </div>`;
  }

  header = function (path) {
    const html = previousHeader(path);
    if (!state.verified || publicRoutes.has(path) || !validRoles.has(state.role)) return html;
    const profile = roleProfile();
    const entry = `<a class="profile-header-link profile-header-${state.role}${path === 'profile' ? ' active' : ''}" href="#/profile" aria-label="My profile: ${esc(profile.name)}, ${esc(profile.label)}" ${path === 'profile' ? 'aria-current="page"' : ''}><span class="profile-header-avatar" aria-hidden="true">${esc(initials(profile.name))}</span><span class="profile-header-text"><b>${esc(profile.name)}</b><small>${esc(profile.label)}</small></span></a>`;
    return html.replace('<label class="sr-only" for="role-switch">', `${entry}<label class="sr-only" for="role-switch">`);
  };

  render = function () {
    if (route() !== 'profile') return previousRender();
    if (!state.verified || !validRoles.has(state.role) || state.secondary?.suspended && state.role !== 'admin' || state.role === 'employee' && state.secondary?.lockedUsers?.[employee()?.id]) return previousRender();
    document.title = `DigiTalent Pulse · ${roleProfile().label} profile`;
    $('#app').innerHTML = shell('profile', profilePage());
    save();
  };
})();
