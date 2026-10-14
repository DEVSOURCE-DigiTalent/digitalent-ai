/* Department-scoped purchased seats follow the published position path. */
(function () {
  const previousRender = render;
  const previousCoursePage = coursePage;
  const previousSetupPage = setupPage;
  const previousAssessmentPage = assessmentPage;
  const previousPathPage = pathPage;
  const previousEnrollment = startEnrollment;
  let syncing = false;

  function plans() {
    state.seatPlans ||= [];
    return state.seatPlans;
  }

  function eligibleDepartments(cid) {
    const { domain, tier } = parseCourse(cid);
    return state.departments.filter(dept =>
      dept.positions.some(pos => (pos.target?.[domain] || 0) >= tier)
    );
  }

  function migratePurchases() {
    let changed = false;
    for (const [cid, amount] of Object.entries(state.purchases || {})) {
      if (parseCourse(cid).tier === 1) continue;
      const accounted = plans().filter(plan => plan.cid === cid)
        .reduce((sum, plan) => sum + plan.seats, 0);
      if (amount <= accounted) continue;
      const matching = state.published ? eligibleDepartments(cid) : [];
      plans().push({
        id: id(), cid, seats: amount - accounted,
        department: matching.length === 1 ? matching[0].name : '',
        people: [], createdAt: now()
      });
      changed = true;
    }
    return changed;
  }

  function planCandidates(plan) {
    const { domain, tier } = parseCourse(plan.cid);
    return state.employees.filter(person =>
      person.dept === plan.department &&
      (position(person)?.target?.[domain] || 0) >= tier
    );
  }

  function reconcileSeats() {
    if (syncing) return;
    syncing = true;
    try {
      let changed = migratePurchases();
      if (!state.published) {
        if (changed) save();
        return;
      }
      for (const plan of plans()) {
        const matching = eligibleDepartments(plan.cid);
        if (!plan.department && matching.length === 1) {
          plan.department = matching[0].name;
          changed = true;
        }
        if (!plan.department || !matching.some(dept => dept.name === plan.department)) continue;
        const candidates = planCandidates(plan);
        const candidateIds = new Set(candidates.map(person => person.id));
        const kept = (plan.people || []).filter(pid => candidateIds.has(pid) &&
          !plans().some(other => other !== plan && other.cid === plan.cid && other.people?.includes(pid)));
        const enrolledFirst = candidates.filter(person => enrollment(plan.cid, person));
        const ordered = [...enrolledFirst, ...candidates.filter(person => !enrollment(plan.cid, person))];
        for (const person of ordered) {
          if (kept.length >= plan.seats) break;
          if (!kept.includes(person.id) && !plans().some(other =>
            other !== plan && other.cid === plan.cid && other.people?.includes(person.id))) kept.push(person.id);
        }
        if (JSON.stringify(kept) !== JSON.stringify(plan.people || [])) {
          plan.people = kept;
          changed = true;
        }
        for (const pid of plan.people) {
          const person = state.employees.find(item => item.id === pid);
          if (!person?.assessed || enrollment(plan.cid, person) || !courseEligible(plan.cid, person)) continue;
          const used = state.enrollments.filter(item => item.courseId === plan.cid).length;
          if (used >= Number(state.purchases[plan.cid] || 0)) continue;
          state.enrollments.push({
            employeeId: pid, courseId: plan.cid, lessons: [false, false, false],
            finalCheck: false, attempts: [], status: 'learning',
            releaseAt: null, deadlineAt: null, assignedAt: now(),
            seatPlanId: plan.id
          });
          event('Suất học tự động kích hoạt',
            `${person.name} · ${courseName(plan.cid)} sau khi đạt mức trước đó.`);
          changed = true;
        }
      }
      if (changed) save();
    } finally {
      syncing = false;
    }
  }

  startEnrollment = function (cid, person) {
    const { domain, tier } = parseCourse(cid);
    if (tier > 1 && plans().some(plan => plan.cid === cid) &&
        !enrollment(cid, person)) {
      if (state.role !== 'owner' || !state.published || !person?.assessed ||
          (position(person)?.target?.[domain] || 0) < tier || !courseEligible(cid, person))
        return previousEnrollment(cid, person);
      const matching = plans().filter(plan =>
        plan.cid === cid && plan.department === person?.dept);
      if (!matching.length)
        return toast('Khóa đã mua chưa được phân bổ cho phòng ban của nhân viên này.');
      if (!matching.some(plan => plan.people?.includes(person.id))) {
        const plan = matching.find(item =>
          (item.people || []).length < item.seats ||
          item.people.some(pid => !enrollment(cid, state.employees.find(p => p.id === pid))));
        if (!plan) return toast('Các suất của phòng ban đã được sử dụng. Hãy mua thêm suất.');
        const replaceId = (plan.people || []).find(pid =>
          !enrollment(cid, state.employees.find(p => p.id === pid)));
        if ((plan.people || []).length >= plan.seats && replaceId)
          plan.people = plan.people.filter(pid => pid !== replaceId);
        plan.people.push(person.id);
        event('Đổi người giữ suất', `${person.name} được ưu tiên suất ${courseName(cid)}.`);
        save();
      }
    }
    return previousEnrollment(cid, person);
  };

  function seatSummary(cid) {
    const related = plans().filter(plan => plan.cid === cid);
    if (!related.length) return '';
    return `<section class="surface pad seat-plan-panel"><span class="mini-label">Suất học theo lộ trình</span>
      <h2 class="panel-title">Mua một lần, tự mở đúng lúc.</h2>
      <p class="panel-desc">Sau khi công bố lộ trình, hệ thống giữ suất cho nhân viên thuộc phòng ban và vị trí phù hợp. Khóa nâng cao chỉ mở khi nhân viên hoàn thành bài đầu vào và được duyệt mức học trước đó.</p>
      ${related.map(plan => {
        const members = (plan.people || []).map(pid => state.employees.find(p => p.id === pid)).filter(Boolean);
        const candidates = plan.department ? planCandidates(plan) : [];
        const departmentSeats = related.filter(item => item.department === plan.department)
          .reduce((sum, item) => sum + item.seats, 0);
        const shortage = Math.max(0, candidates.length - departmentSeats);
        const activated = members.filter(person => enrollment(plan.cid, person));
        return `<div class="seat-plan-row"><div><strong>${plan.department ? esc(plan.department) : 'Chưa chọn phòng ban'}</strong>
          <small>${plan.seats} suất · ${members.length} đã giữ · ${shortage} chưa có suất</small>
          ${members.length ? `<p>${members.map(person => `${esc(person.name)}: ${enrollment(plan.cid, person) ? 'đã mở khóa' : 'đã giữ suất, chờ bài đầu vào hoặc mức trước'}`).join(' · ')}</p>` : ''}
          ${shortage ? '<p class="seat-shortage">Số nhân viên phù hợp vượt số suất đã mua. Mua thêm suất hoặc chọn người ưu tiên.</p>' : ''}</div>
          <form data-form="seat-plan-scope"><input type="hidden" name="plan" value="${plan.id}">
            <label class="field">Phòng ban nhận suất<select name="department">
              <option value="">Chọn sau</option>
              ${state.departments.map(dept => `<option value="${esc(dept.name)}" ${plan.department === dept.name ? 'selected' : ''}>${esc(dept.name)}</option>`).join('')}
            </select></label>
            ${plan.department && candidates.length ? `<details class="seat-priority"><summary>Chọn người ưu tiên (${plan.seats} suất)</summary>
              <p>Người đã mở khóa giữ nguyên suất. Chọn tối đa ${plan.seats} nhân viên.</p>
              ${candidates.map(person => {
                const locked = activated.some(item => item.id === person.id);
                return `<label><input type="checkbox" name="priority" value="${esc(person.id)}" ${plan.people?.includes(person.id) ? 'checked' : ''} ${locked ? 'disabled' : ''}> ${esc(person.name)}${locked ? ' · đã mở khóa' : ''}</label>`;
              }).join('')}</details>` : ''}
            <button class="btn btn-outline btn-small" type="submit">Lưu phân bổ</button></form></div>`;
      }).join('')}</section>`;
  }

  function purchaseForm(cid) {
    if (state.secondary?.courseMeta?.[cid]?.open === false)
      return `<section class="surface pad seat-purchase"><span class="mini-label">Khóa học có phí</span>
        <h2 class="panel-title">Đang tạm dừng mua mới.</h2>
        <p class="panel-desc">Suất đã mua vẫn có thể dùng theo lộ trình đã công bố.</p></section>`;
    return `<section class="surface pad seat-purchase" id="seat-purchase">
      <span class="mini-label">Khóa học có phí · bản mô phỏng</span>
      <h2 class="panel-title">Mua suất cho phòng ban.</h2>
      <p class="panel-desc">Mỗi suất dành cho một nhân viên. Bạn có thể mua trước khi thiết lập lộ trình; khi chỉ một phòng ban phù hợp được công bố, hệ thống sẽ tự phân bổ. Nếu nhiều phòng ban phù hợp, hãy chọn phòng ban nhận suất.</p>
      <form data-form="seat-purchase" class="seat-purchase-form">
        <input type="hidden" name="course" value="${cid}">
        <label class="field">Số suất<input name="count" type="number" min="1" max="1000" value="1" required></label>
        <label class="field">Phòng ban<select name="department"><option value="">Tự xác định sau khi công bố</option>
          ${state.departments.map(dept => `<option value="${esc(dept.name)}">${esc(dept.name)}</option>`).join('')}
        </select></label>
        <button class="btn btn-primary" type="submit">Mô phỏng mua suất →</button>
      </form><p class="field-hint">Bản xem trước không thực hiện thanh toán.</p></section>`;
  }

  coursePage = function (value) {
    const cid = courseId(parseCourse(value).domain, parseCourse(value).tier);
    let html = previousCoursePage(value);
    if (parseCourse(cid).tier === 1) return html;
    const person = state.role === 'employee' ? employee() : null;
    if (person) {
      const plan = plans().find(item => item.cid === cid && item.people?.includes(person.id));
      if (plan && !enrollment(cid, person)) {
        const message = !person.assessed
          ? 'Bạn đã được giữ suất. Hoàn thành bài kiểm tra đầu vào để nhận lộ trình.'
          : !courseEligible(cid, person)
            ? 'Bạn đã được giữ suất. Hoàn thành và được duyệt khóa ở mức trước để mở toàn bộ nội dung.'
            : 'Suất đã được giữ và sẽ tự mở khi lộ trình được cập nhật.';
        html = html.replace('<div class="pulse-course-page">', `<div class="pulse-course-page">${notice(message, 'success')}`)
          .replace('This level needs an Owner-assigned seat. You can review the outline and first sample slide before access opens.', message)
          .replace('Full access opens when the Owner assigns a paid seat.', message);
      }
      return html;
    }
    if (state.role !== 'owner') return html;
    html = html.replace(/<button class="btn btn-primary" data-action="buy-seat"[^>]*>[^<]*<\/button>/,
      '<a class="btn btn-primary" href="#seat-purchase">Mua suất cho phòng ban →</a>');
    html = html.replace(/<button class="btn btn-primary" data-action="assign-course"[^>]*>Assign purchased seat →<\/button>/,
      '<a class="btn btn-primary" href="#seat-purchase">Quản lý suất học →</a>');
    html = html.replace(/<form data-form="assign-paid"[\s\S]*?<\/form>/, '');
    return `${html}${purchaseForm(cid)}${seatSummary(cid)}`;
  };

  setupPage = function () {
    const html = previousSetupPage();
    const waiting = plans().filter(plan => !plan.department);
    return waiting.length ? `${html}${box(`<span class="mini-label">Suất học đã mua</span><h2 class="panel-title">Hoàn tất lộ trình để phân bổ suất.</h2><p class="panel-desc">${waiting.map(p => `${esc(courseName(p.cid))}: ${p.seats} suất`).join(' · ')}. Khi bạn công bố, hệ thống tự chọn phòng ban nếu chỉ có một phòng ban phù hợp; nếu có nhiều, hãy phân bổ tại trang khóa học.</p>`)}` : html;
  };

  const questions = [
    [
      ['Trước khi dùng bảng dữ liệu, bạn kiểm tra điều gì?', 'Nguồn và độ cập nhật của dữ liệu', 'Chỉ màu của bảng'],
      ['Hai nguồn cho số liệu khác nhau. Bạn làm gì?', 'Đối chiếu định nghĩa và kỳ đo', 'Chọn số lớn hơn'],
      ['Khi chia sẻ dữ liệu nhạy cảm, bạn làm gì?', 'Giới hạn quyền và ghi rõ nguồn', 'Gửi cho tất cả']
    ],
    [
      ['Một yêu cầu chưa rõ. Bạn làm gì trước?', 'Xác nhận mục tiêu và người nhận', 'Trả lời theo phỏng đoán'],
      ['Nhóm hiểu khác nhau về tiến độ. Bạn làm gì?', 'Thống nhất đầu việc, hạn và người phụ trách', 'Chờ cuộc họp kế tiếp'],
      ['Phản hồi có nhiều ý kiến trái chiều. Bạn làm gì?', 'Tóm tắt bằng chứng và quyết định tiếp theo', 'Chọn ý kiến nói to nhất']
    ],
    [
      ['Trước khi đăng nội dung số, bạn kiểm tra gì?', 'Mục tiêu, nguồn và quyền sử dụng', 'Chỉ kích thước ảnh'],
      ['Bài đăng chưa đạt mục tiêu. Bạn làm gì?', 'Xem chỉ số và thử điều chỉnh có kiểm soát', 'Đăng lại y nguyên'],
      ['Nhiều kênh có kết quả khác nhau. Bạn làm gì?', 'So sánh theo cùng mục tiêu và nhóm người xem', 'Chọn kênh có nhiều lượt xem nhất']
    ],
    [
      ['Nhận liên kết lạ yêu cầu mật khẩu. Bạn làm gì?', 'Kiểm tra nguồn và không nhập thông tin', 'Mở ngay để kịp hạn'],
      ['Tài liệu có dữ liệu cá nhân. Bạn làm gì?', 'Chỉ cấp quyền cho người cần dùng', 'Đặt liên kết công khai'],
      ['Phát hiện truy cập bất thường. Bạn làm gì?', 'Báo cáo theo quy trình và bảo toàn dấu vết', 'Tự xóa mọi nhật ký']
    ],
    [
      ['Khi gặp một vấn đề mới, bước đầu là gì?', 'Mô tả vấn đề và kết quả mong muốn', 'Chọn giải pháp quen thuộc'],
      ['Giải pháp chưa hiệu quả. Bạn làm gì?', 'Đo kết quả và xem lại giả định', 'Bỏ qua số liệu'],
      ['Có nhiều phương án. Bạn chọn thế nào?', 'So sánh tác động, rủi ro và bằng chứng', 'Chọn phương án nhanh nhất']
    ],
    [
      ['Kết quả AI trông hợp lý. Bạn làm gì?', 'Kiểm chứng trước khi sử dụng', 'Dùng ngay không cần kiểm tra'],
      ['Bạn đưa dữ liệu vào công cụ AI. Cần lưu ý gì?', 'Quyền riêng tư và chính sách dữ liệu', 'Chỉ tốc độ trả lời'],
      ['AI gợi ý quyết định có tác động lớn. Ai chịu trách nhiệm?', 'Người có thẩm quyền kiểm tra và quyết định', 'Công cụ AI']
    ]
  ];

  assessmentPage = function () {
    if (state.role !== 'employee') return previousAssessmentPage();
    const person = activePerson();
    if (!person) return previousAssessmentPage();
    if (person.assessed) return `${page('Kiểm tra đầu vào', 'Đã ghi nhận mức khởi điểm.', 'Mức đã xác nhận và mục tiêu của vị trí được so sánh trong lộ trình cá nhân.')}${box(`<p>${esc(person.name)} đã hoàn thành bài kiểm tra đầu vào.</p>${link('path', 'Xem khoảng cách và lộ trình →', 'btn-primary')}`)}`;
    const target = position(person)?.target || [];
    const cards = DOMAINS.map((domain, index) => {
      const count = Math.max(0, Math.min(3, target[index] || 0));
      if (!count) return `<input type="hidden" name="domain-${index}" value="0">`;
      return `<fieldset class="assessment-domain"><legend>${esc(domain)} <small>· mục tiêu L${count}</small></legend>
        ${questions[index].slice(0, count).map(([prompt, right, wrong], tier) => `<div class="assessment-question">
          <strong>${tier + 1}. ${esc(prompt)}</strong>
          <label><input type="radio" name="quiz-${index}-${tier}" value="1" required> ${esc(right)}</label>
          <label><input type="radio" name="quiz-${index}-${tier}" value="0" required> ${esc(wrong)}</label>
        </div>`).join('')}<input type="hidden" name="domain-${index}" value="0"></fieldset>`;
    }).join('');
    return `${page('Kiểm tra đầu vào', 'Đo năng lực theo đúng vị trí.', `Bài kiểm tra chỉ hỏi những năng lực trong lộ trình ${esc(person.position)} của phòng ban ${esc(person.dept)}. Kết quả tạo mức khởi điểm để so với mục tiêu doanh nghiệp.`)}
      ${box(`<span class="mini-label">${esc(person.name)} · ${esc(person.position)}</span><h2 class="panel-title">Trả lời từng tình huống ngắn.</h2>
        <p class="panel-desc">Mỗi mức tiếp theo chỉ được ghi nhận khi các mức trước trả lời đúng. Đây là câu hỏi minh họa cho bản xem trước.</p>
        <form data-form="assessment" class="assessment-quiz">${cards}<button class="btn btn-primary" type="submit">Xem khoảng cách năng lực →</button></form>`)}`;
  };

  pathPage = function () {
    let html = previousPathPage();
    if (state.role !== 'employee') return html;
    const person = employee();
    if (!person) return html;
    const held = plans().filter(plan => plan.people?.includes(person.id) && !enrollment(plan.cid, person));
    if (held.length) html += box(`<span class="mini-label">Suất đã giữ trên lộ trình</span><h2 class="panel-title">Khóa tiếp theo đã sẵn sàng cho bạn.</h2>
      <p class="panel-desc">${held.map(plan => esc(courseName(plan.cid))).join(' · ')}. Hoàn thành bài đầu vào và được duyệt khóa mức trước để hệ thống tự mở toàn bộ nội dung.</p>`);
    return html;
  };

  render = function () {
    reconcileSeats();
    return previousRender();
  };

  document.addEventListener('submit', ev => {
    const form = ev.target.closest('form[data-form="assessment"]');
    if (!form || state.role !== 'employee') return;
    const target = position(activePerson())?.target || [];
    const data = new FormData(form);
    for (let index = 0; index < DOMAINS.length; index++) {
      let level = 0;
      for (let tier = 0; tier < Math.min(3, target[index] || 0); tier++) {
        if (data.get(`quiz-${index}-${tier}`) === '1' && level === tier) level++;
      }
      form.elements.namedItem(`domain-${index}`).value = String(level);
    }
  }, true);

  document.addEventListener('submit', ev => {
    const form = ev.target.closest('form[data-form="seat-purchase"], form[data-form="seat-plan-scope"]');
    if (!form) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    if (state.role !== 'owner' || !form.reportValidity()) return;
    const data = new FormData(form);
    const dept = String(data.get('department') || '');
    if (dept && !department(dept)) return toast('Phòng ban không còn tồn tại.');
    if (form.dataset.form === 'seat-purchase') {
      const cid = String(data.get('course') || '');
      const count = Number(data.get('count'));
      if (parseCourse(cid).tier === 1 || !Number.isInteger(count) || count < 1 || count > 1000) return;
      if (state.secondary?.courseMeta?.[cid]?.open === false)
        return toast('Khóa này đang tạm dừng mua mới. Suất đã mua vẫn dùng được.');
      state.purchases[cid] = Number(state.purchases[cid] || 0) + count;
      plans().push({ id: id(), cid, seats: count, department: dept, people: [], createdAt: now() });
      event('Mô phỏng mua suất học', `${courseName(cid)} · ${count} suất ${dept ? 'cho ' + dept : 'chờ phân bổ'}.`);
      toast(`Đã thêm ${count} suất. Không có thanh toán thật.`);
    } else {
      const plan = plans().find(item => item.id === data.get('plan'));
      if (!plan) return;
      const activated = (plan.people || []).filter(pid =>
        enrollment(plan.cid, state.employees.find(person => person.id === pid)));
      if (activated.length && dept !== plan.department)
        return toast('Không thể đổi phòng ban khi đã có nhân viên mở khóa. Hãy mua suất mới cho phòng ban khác.');
      const selected = dept === plan.department
        ? [...new Set([...activated, ...data.getAll('priority').map(String)])] : [];
      if (selected.length > plan.seats)
        return toast(`Chỉ có ${plan.seats} suất. Hãy bỏ chọn người khác trước khi lưu.`);
      if (selected.some(pid => !state.employees.some(person => person.id === pid && person.dept === dept)))
        return toast('Chỉ chọn nhân viên thuộc phòng ban nhận suất.');
      if (selected.some(pid => plans().some(other =>
        other !== plan && other.cid === plan.cid && other.people?.includes(pid))))
        return toast('Một nhân viên chỉ được giữ một suất của cùng khóa học.');
      plan.department = dept;
      plan.people = selected;
      toast('Đã cập nhật phòng ban nhận suất.');
    }
    save();
    render();
  }, true);
})();
