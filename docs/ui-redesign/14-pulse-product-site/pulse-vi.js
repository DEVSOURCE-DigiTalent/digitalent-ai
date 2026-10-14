/* Presentation-only localization. Business state, route ids and form values are unchanged. */
(function () {
  const parse = source => String(source || '').trim().split('\n').map(line => {
    const split = line.indexOf('|');
    return [line.slice(0, split), line.slice(split + 1)];
  }).filter(([original, translated]) => original && translated);
  const phrases = parse(window.PULSE_VI_PAIRS);
  const terms = parse(window.PULSE_VI_LEXICON);
  const exact = new Map([...phrases, ...terms].map(([a,b]) => [a.toLowerCase(), b]));
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const compile = ([original, translated]) => {
    const left = /^[A-Za-z]/.test(original) ? '(?<![A-Za-z])' : '';
    const right = /[A-Za-z]$/.test(original) ? '(?![A-Za-z])' : '';
    return [new RegExp(left + escapeRegex(original) + right, 'gi'), translated];
  };
  const replacements = [...phrases, ...terms]
    .sort((a,b) => b[0].length - a[0].length)
    .map(compile);
  const postPairs = parse(window.PULSE_VI_POST);
  const after = new Map(postPairs.map(([a,b]) => [a.toLowerCase(), b]));
  const postReplacements = postPairs.sort((a,b) => b[0].length - a[0].length).map(compile);
  const memo = new Map();

  function translate(value) {
    if (memo.has(value)) return memo.get(value);
    if (!value || !/[A-Za-z]/.test(value)) return value;
    const start = value.match(/^\s*/)?.[0] || '';
    const end = value.match(/\s*$/)?.[0] || '';
    const core = value.trim();
    if (!core || core === 'DigiTalent Pulse') return value;
    let translated = exact.get(core.toLowerCase());
    if (!translated) {
      translated = core;
      const protectedValues = [];
      translated = translated.replace(/[\w.+-]+@[\w.-]+|https?:\/\/[^\s]+/g, match => {
        protectedValues.push(match);
        return `¤${protectedValues.length - 1}¤`;
      });
      for (const [regex, replacement] of replacements) translated = translated.replace(regex, replacement);
      translated = translated.replace(/¤(\d+)¤/g, (_, index) => protectedValues[Number(index)]);
      translated = after.get(translated.toLowerCase()) || translated;
      for (const [regex, replacement] of postReplacements) translated = translated.replace(regex, replacement);
      translated = translated
        .replace(/^Học the core concepts behind (.+?) at the (.+?) Mức\. Connect each idea to a real nhiệm vụ in vị trí của bạn\.$/i,
          'Học kiến thức cốt lõi về $1 ở mức $2. Liên hệ mỗi ý với công việc thực tế của vị trí.')
        .replace(/^Understand (.+?) at work$/i, 'Hiểu $1 trong công việc')
        .replace(/^(\d+) purchased Suất học in this mẫu · (\d+) còn lại to Phân bổ\. No payment was taken\.$/i,
          'Đã mua mô phỏng $1 suất · còn $2 suất để phân bổ. Không có thanh toán thật.')
        .replace(/^(\d+) Chu kỳ khóa học đã duyệt across (\d+) learners\. Includes Cơ bản trial Khóa học and any later purchased Khóa học using the same Báo cáo model\.$/i,
          '$1 chu kỳ khóa học đã duyệt với $2 người học. Khóa Cơ bản và khóa đã mua dùng cùng mẫu báo cáo.')
        .replace(/^học tập: (\d+)\/(\d+) bài học and final Kiểm tra\.$/i,
          'Học tập: $1/$2 bài học và bài kiểm tra cuối.')
        .replace(/^Bài cuối khóa: Đã duyệt sau (\d+) submission\.$/i,
          'Bài cuối khóa: đã duyệt sau $1 lượt nộp.')
        .replace(/^(.+) Đang chờ Đầu vào → (L\d+) Đã xác nhận\. The Đầu vào remains unchanged\.$/i,
          '$1: đầu vào chờ xác nhận → $2; mức đầu vào vẫn được giữ.')
        .replace(/^(.+) Đầu vào → (L\d+) Đã xác nhận\. The Đầu vào remains unchanged\.$/i,
          '$1 đầu vào → $2; mức đầu vào không đổi.')
        .replace(/^(.+) đã hoàn thành (.+)\. The cycle Báo cáo is Sẵn sàng\.$/i,
          '$1 đã hoàn thành $2. Báo cáo chu kỳ đã sẵn sàng.')
        .replace(/^(.+) submitted (.+) · attempt (\d+)\/(\d+)\.$/i,
          '$1 đã nộp $2 · lượt $3/$4.')
        .replace(/^(.+) passed mô đun (\d+) in (.+)\.$/i,
          '$1 đã đạt mô đun $2 của $3.')
        .replace(/^(\d+) khoảng cách đã xác nhận\(s\)$/i, '$1 khoảng cách đã xác nhận');
      translated = translated.replace(/tháng (\d{1,2}) (\d{1,2}), (\d{4})/g, '$2/$1/$3');
    }
    const output = start + translated + end;
    memo.set(value, output);
    memo.set(output, output);
    return output;
  }
  function translateNode(node) {
    if (node.nodeType !== Node.TEXT_NODE || node.parentElement?.closest('script,style')) return;
    const next = translate(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }
  function localize(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) return translateNode(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);
    for (const element of [root, ...root.querySelectorAll('[placeholder],[aria-label],[title],[alt]')]) {
      if (element.nodeType !== Node.ELEMENT_NODE) continue;
      for (const attr of ['placeholder','aria-label','title','alt']) {
        if (!element.hasAttribute(attr)) continue;
        const value = element.getAttribute(attr);
        const next = translate(value);
        if (next !== value) element.setAttribute(attr, next);
      }
    }
  }
  document.documentElement.lang = 'vi';
  const titles = {
    welcome:'Trang chủ', register:'Đăng ký', login:'Đăng nhập', verify:'Xác minh email',
    forgot:'Quên mật khẩu', invite:'Kích hoạt lời mời', owner:'Tổng quan doanh nghiệp',
    setup:'Khung năng lực', people:'Nhân sự', gap:'Khoảng cách năng lực',
    assessment:'Kiểm tra đầu vào', employee:'Hôm nay', path:'Lộ trình học',
    catalog:'Thư viện khóa học', course:'Chi tiết khóa học', lesson:'Bài học',
    assignment:'Bài cuối khóa', manager:'Tổng quan quản lý', review:'Chấm bài cuối khóa',
    report:'Báo cáo chu kỳ', cohorts:'Nhóm đào tạo', tasks:'Nhiệm vụ thực tế',
    framework:'Khung năng lực chung', evidence:'Minh chứng thực tế',
    'team-training':'Đào tạo đội ngũ', curriculum:'Chương trình học',
    customers:'Tổ chức', users:'Người dùng', commerce:'Đơn hàng và giá',
    audit:'Nhật ký kiểm tra',
    certificates:'Chứng nhận', certificate:'Chi tiết chứng nhận',
    notifications:'Hoạt động', profile:'Hồ sơ', admin:'Quản trị nền tảng'
  };
  const originalConfirm = window.confirm.bind(window);
  window.confirm = message => originalConfirm(translate(message));
  const previousRender = render;
  render = function () {
    const result = previousRender();
    const parts = route().split('/');
    document.title = 'DigiTalent Pulse · ' + (parts[0] === 'admin' && parts[1]
      ? titles[parts[1]] || translate(parts[1]) : titles[parts[0]] || translate(parts[0]));
    localize(document.body);
    return result;
  };
  document.addEventListener('DOMContentLoaded', () => {
    localize(document.body);
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') translateNode(record.target);
        else for (const node of record.addedNodes) localize(node);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  });
})();
