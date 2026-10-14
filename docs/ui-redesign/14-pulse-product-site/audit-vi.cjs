const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const WebSocket = require('../../../frontend/node_modules/ws');
const url = pathToFileURL(path.join(__dirname, 'index.html')).href + '#/welcome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pulse-vi-audit-'));
const browser = process.env.PULSE_BROWSER ||
  ['C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
    .find(candidate => fs.existsSync(candidate));
if (!browser) throw Error('Set PULSE_BROWSER to a Chromium-based browser executable');
const chrome = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--disable-background-networking', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
async function run() {
  const active = path.join(profile, 'DevToolsActivePort');
  for (let n = 0; n < 100 && !fs.existsSync(active); n++) await sleep(100);
  if (!fs.existsSync(active)) throw Error('Chrome did not start');
  const port = fs.readFileSync(active, 'utf8').split(/\r?\n/)[0];
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item => item.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  let seq = 0;
  const pending = new Map();
  const errors = [];
  socket.on('message', raw => {
    const item = JSON.parse(raw.toString());
    if (item.method === 'Runtime.exceptionThrown') errors.push(item.params.exceptionDetails.exception?.description || item.params.exceptionDetails.text);
    if (!item.id || !pending.has(item.id)) return;
    const task = pending.get(item.id); pending.delete(item.id);
    item.error ? task.reject(Error(item.error.message)) : task.resolve(item.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const output = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (output.exceptionDetails) throw Error(output.exceptionDetails.exception?.description || output.exceptionDetails.text);
    return output.result.value;
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  for (let n = 0; n < 100 && !await evaluate('!!document.querySelector("[data-action=sample-paid]")'); n++) await sleep(80);
  const records = [];
  async function collect(key) {
    const nodes = await evaluate(`(()=>{const out=[];const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walk.nextNode()){const value=node.nodeValue.trim();if(value&&node.parentElement?.offsetParent!==null)out.push(value)}for(const el of document.querySelectorAll('input[placeholder],textarea[placeholder],select[aria-label],button[aria-label]'))out.push(el.getAttribute('placeholder')||el.getAttribute('aria-label'));return [...new Set(out)]})()`);
    records.push({ key, nodes });
  }
  await collect('welcome');
  for (const area of ['register','verify','login','catalog','course/2-2']) {
    await evaluate(`go(${JSON.stringify(area)})`); await collect(area);
  }
  await evaluate(`go('welcome');document.querySelector('[data-action="sample-paid"]').click()`);
  if (!await evaluate(`state.purchases['0-2']===3&&!!enrollment('0-2',state.employees.find(p=>p.id==='ben'))&&document.body.textContent.includes('2 đã mở, 1 còn lại')`))
    throw Error('Purchased sample did not auto-open Ben after Basic or show current seat counts');
  await evaluate('state=sample();state.role="owner";save();go("owner")');
  const owner = ['owner','setup','people','gap','catalog','course/2-2','cohorts','tasks','framework','report','certificates','notifications','profile'];
  for (const area of owner) { await evaluate(`go(${JSON.stringify(area)})`); await collect('owner/'+area); }
  for (let domain = 0; domain < 6; domain++) for (let tier = 1; tier <= 3; tier++) {
    const cid = `${domain}-${tier}`;
    await evaluate(`go('course/${cid}')`); await collect('owner/course/'+cid);
    await evaluate(`go('lesson/${cid}/0')`); await collect('owner/lesson/'+cid);
  }
  await evaluate('state.role="manager";save()');
  const manager = ['manager','gap','review','team-training','evidence','report','framework','notifications','profile'];
  for (const area of manager) { await evaluate(`go(${JSON.stringify(area)})`); await collect('manager/'+area); }
  await evaluate('state.role="employee";save()');
  const employee = ['employee','path','assessment','catalog','course/2-1','course/2-2','lesson/2-2/0','assignment','certificates','notifications','profile'];
  for (const area of employee) { await evaluate(`go(${JSON.stringify(area)})`); await collect('employee/'+area); }
  await evaluate('state.role="admin";save()');
  const admin = ['admin','admin/framework','admin/curriculum','admin/customers','admin/users','admin/commerce','admin/audit','profile'];
  for (const area of admin) { await evaluate(`go(${JSON.stringify(area)})`); await collect('admin/'+area); }
  const unique = [...new Set(records.flatMap(item => item.nodes))].sort((a,b)=>a.localeCompare(b));
  fs.writeFileSync(path.join(os.tmpdir(),'pulse-vi-corpus.json'),JSON.stringify({records,unique,errors},null,2));
  console.log(`Collected ${unique.length} unique text nodes across ${records.length} pages. Errors: ${errors.length}`);
  await evaluate(`(()=>{state=fresh();state.verified=true;state.role='owner';state.org='Test';state.departments[0].manager='Nora Park';save();go('course/2-2')})()`);
  if (!await evaluate('!!document.querySelector(\'form[data-form="seat-purchase"]\')')) throw Error('Owner purchase form missing');
  await evaluate(`(()=>{const f=document.querySelector('form[data-form="seat-purchase"]');f.elements.count.value='1';f.requestSubmit()})()`);
  if (!await evaluate(`state.purchases['2-2']===1&&state.seatPlans.length===1&&state.seatPlans[0].department==='' `)) throw Error('Purchase did not create an unscoped seat plan');
  await evaluate(`(()=>{state.departments[0].positions[0].target[2]=2;state.employees=[
    {id:'a',name:'An',email:'an@test.example',dept:'Accounting',position:'Accountant',current:[0,0,0,0,0,0],assessed:false},
    {id:'b',name:'Binh',email:'binh@test.example',dept:'Accounting',position:'Accountant',current:[0,0,0,0,0,0],assessed:false}
  ];publishBlueprint()})()`);
  if (!await evaluate(`state.seatPlans[0].department==='Accounting'&&state.seatPlans[0].people.length===1&&state.seatPlans[0].people[0]==='a'&&!enrollment('2-2',state.employees[0])`)) throw Error('Publish did not reserve one seat for the matching department');
  await evaluate(`(()=>{go('course/2-2');const f=document.querySelector('form[data-form="seat-plan-scope"]');f.querySelector('[value="a"]').checked=false;f.querySelector('[value="b"]').checked=true;f.requestSubmit()})()`);
  if (!await evaluate(`state.seatPlans[0].people.length===1&&state.seatPlans[0].people[0]==='b'`)) throw Error('Owner could not prioritize a different employee when seats are insufficient');
  await evaluate(`(()=>{const f=document.querySelector('form[data-form="seat-plan-scope"]');f.querySelector('[value="b"]').checked=false;f.querySelector('[value="a"]').checked=true;f.requestSubmit()})()`);
  if (!await evaluate(`state.seatPlans[0].people[0]==='a'`)) throw Error('Owner priority selection was not saved');
  await evaluate(`state.role='employee';save();go('assessment')`);
  if (!await evaluate(`!!document.querySelector('input[name="quiz-2-1"]')&&!document.querySelector('select[name="domain-2"]')`)) throw Error('Path-specific baseline quiz missing');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  if (!await evaluate(`document.body.scrollWidth<=document.documentElement.clientWidth+2`))
    throw Error('Path-specific baseline quiz overflows on a narrow screen');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await evaluate('document.querySelector("#toast").classList.remove("show")');
  const quizImage = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(os.tmpdir(), 'pulse-vi-assessment.png'), Buffer.from(quizImage.data, 'base64'));
  await evaluate(`(()=>{for(const field of document.querySelectorAll('.assessment-question'))field.querySelector('input[value="1"]').checked=true;document.querySelector('input[name="quiz-2-1"][value="0"]').checked=true;document.querySelector('form[data-form="assessment"]').requestSubmit()})()`);
  if (!await evaluate(`employee().assessed&&employee().current[2]===1&&employee().baselineCurrent[2]===1`)) throw Error('Baseline quiz did not score Digital content at L1');
  if (await evaluate(`!!enrollment('2-2',employee())`)) throw Error('Paid course opened before Basic approval');
  await evaluate(`(()=>{state.enrollments.push({employeeId:'a',courseId:'2-1',lessons:[true,true,true],finalCheck:true,attempts:[{at:now(),evidence:'Nguồn và kết quả đã kiểm tra',decision:null,reason:''}],status:'pending',assignedAt:now()});state.role='manager';save();go('review')})()`);
  await sleep(100);
  await evaluate(`(()=>{const f=document.querySelector('form[data-form="review"]');f.elements.decision.value='pass';f.elements.reason.value='Nguồn đã được đối chiếu và kết quả đáp ứng đầy đủ tiêu chí khóa Cơ bản.';f.requestSubmit()})()`);
  if (!await evaluate(`enrollment('2-1',state.employees[0]).status==='approved'&&!!enrollment('2-2',state.employees[0])`))
    throw Error('Manager Basic approval did not automatically activate the reserved Intermediate seat');
  await evaluate(`state.role='employee';save();go('course/2-2')`);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  if (!await evaluate(`document.body.scrollWidth<=document.documentElement.clientWidth+2`))
    throw Error('Purchased Employee course overflows on a narrow screen');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  if (!await evaluate(`!!enrollment('2-2',employee())&&document.body.textContent.includes('Mô đun')&&!enrollment('2-2',state.employees[1])`)) throw Error('Reserved seat did not auto-open after Basic approval, or exceeded purchased capacity');
  await collect('paid employee/course/2-2');
  await evaluate(`go('lesson/2-2/0')`); await collect('paid employee/lesson/2-2/0');
  await evaluate(`state.role='owner';save();go('course/2-2')`); await collect('paid owner/course/2-2');
  await evaluate(`state.secondary.courseMeta['2-2']={...(state.secondary.courseMeta['2-2']||{}),open:false};save();render()`);
  if (await evaluate(`!!document.querySelector('form[data-form="seat-purchase"]')`))
    throw Error('Paused paid course still accepts new seat purchases');
  await evaluate(`state.secondary.courseMeta['2-2'].open=true;save();render()`);
  await evaluate(`(()=>{state.employees[1].assessed=true;state.enrollments.push({employeeId:'b',courseId:'2-1',lessons:[true,true,true],finalCheck:true,attempts:[{decision:'pass'}],status:'approved',assignedAt:now()});startEnrollment('2-2',state.employees[1]);save()})()`);
  if (await evaluate(`!!enrollment('2-2',state.employees[1])`)) throw Error('A second Employee used a seat already activated for the first');
  await evaluate(`(()=>{state.departments.push({name:'Marketing',ceiling:[2,2,2,2,2,1],manager:'Jordan',positions:[{name:'Specialist',target:[1,1,2,1,1,1]}]});state.employees.push({id:'c',name:'Chi',email:'chi@test.example',dept:'Marketing',position:'Specialist',current:[1,1,1,1,1,1],assessed:true});state.enrollments.push({employeeId:'c',courseId:'2-1',lessons:[true,true,true],finalCheck:true,attempts:[{decision:'pass'}],status:'approved',assignedAt:now()});save();go('cohorts')})()`);
  await sleep(100);
  await evaluate(`(()=>{const f=document.querySelector('#bulk-assignment-form');f.elements.audience.value='people';f.querySelector('input[value="c"]').checked=true;f.elements.learning.value='course';f.elements.course.value='2-2';f.elements.course.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  if (!await evaluate(`document.querySelector('#bulk-assignment-preview')?.textContent.includes('Chưa phân bổ suất đã mua cho phòng ban này') && document.querySelector('#bulk-assignment-form button[type="submit"]').disabled`))
    throw Error('Group assignment borrowed a paid seat from another department: ' +
      JSON.stringify(await evaluate(`(()=>{const f=document.querySelector('#bulk-assignment-form');return {audience:f.elements.audience.value,course:f.elements.course.value,selected:[...f.querySelectorAll('input[name="person"]:checked')].map(x=>x.value),preview:f.querySelector('#bulk-assignment-preview').textContent}})()`)) +
      JSON.stringify(errors.slice(-3)));
  console.log('PASS paid seats cannot be reused or borrowed by another department');
  await evaluate(`go('setup')`); await collect('paid owner/setup');
  await evaluate(`state.role='employee';save();go('course/2-2')`);
  await evaluate('document.querySelector("#toast").classList.remove("show")');
  const courseImage = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(os.tmpdir(), 'pulse-vi-paid-course.png'), Buffer.from(courseImage.data, 'base64'));
  for (const [moduleIndex, answer0, answer1] of [[0, '1', '0'], [1, '1', '1'], [2, '1', '0']]) {
    await evaluate(`go('lesson/2-2/${moduleIndex}')`);
    await sleep(100);
    await evaluate(`(()=>{document.querySelector('[data-action="slide-next"]').click();document.querySelector('[data-action="slide-next"]').click()})()`);
    if (moduleIndex === 0) {
      await collect('paid employee/lesson/quiz');
      await evaluate(`(()=>{const f=document.querySelector('form[data-form="module-quiz"]');f.querySelector('[name="q0"][value="0"]').checked=true;f.querySelector('[name="q1"][value="1"]').checked=true;f.requestSubmit()})()`);
      if (!await evaluate(`!enrollment('2-2',employee()).lessons[0]&&document.querySelector('.pulse-quiz-feedback').textContent.includes('0/2')`))
        throw Error('Incorrect module quiz unlocked paid course progress');
    }
    await evaluate(`(()=>{const f=document.querySelector('form[data-form="module-quiz"]');f.querySelector('[name="q0"][value="${answer0}"]').checked=true;f.querySelector('[name="q1"][value="${answer1}"]').checked=true;f.requestSubmit()})()`);
    if (!await evaluate(`enrollment('2-2',employee()).lessons[${moduleIndex}]===true`))
      throw Error('Correct module quiz did not record paid course progress');
  }
  await evaluate(`go('assignment/2-2')`); await sleep(100);
  await evaluate(`(()=>{const f=document.querySelector('form[data-form="assignment"]');f.elements.evidence.value='Nguồn là báo cáo nội dung, tôi đối chiếu chỉ số và đề xuất điều chỉnh có căn cứ.';f.requestSubmit()})()`);
  if (!await evaluate(`enrollment('2-2',employee()).status==='pending'`)) throw Error('Final assignment did not reach Manager review');
  await evaluate(`state.role='manager';save();go('review')`); await sleep(100);
  await evaluate(`(()=>{const f=document.querySelector('form[data-form="review"]');f.elements.decision.value='pass';f.elements.reason.value='Nguồn và hành động được kiểm tra rõ ràng, kết luận phù hợp với tiêu chí khóa học.';f.requestSubmit()})()`);
  if (!await evaluate(`enrollment('2-2',state.employees[0]).status==='approved'&&state.employees[0].baselineCurrent[2]===1&&state.employees[0].current[2]===2`))
    throw Error('Manager approval did not raise Digital content L1 → L2 while preserving entry baseline');
  await evaluate(`state.events.unshift({at:now(),title:'Sự kiện chỉ Marketing',detail:'Chi hoàn thành một việc riêng.'});save();go('report')`);
  await collect('completed manager/report');
  if (await evaluate(`document.body.textContent.includes('Sự kiện chỉ Tiếp thị')`))
    throw Error('Manager report exposed another department activity');
  await evaluate(`state.role='owner';save();go('report')`);
  await collect('completed owner/report');
  if (!await evaluate(`document.body.textContent.includes('Sự kiện chỉ Tiếp thị')`))
    throw Error('Owner report hid company-wide activity: ' + JSON.stringify(await evaluate(`({role:state.role,route:route(),events:state.events.slice(0,2),text:document.querySelector('.main-area')?.textContent.slice(-1200)})`)));
  await evaluate(`state.role='employee';save();go('path')`);
  if (!await evaluate(`document.querySelector('.capability-progress')?.textContent.includes('L1')&&document.querySelector('.capability-progress')?.textContent.includes('L2')`))
    throw Error('Employee path did not show the verified capability increase');
  console.log('PASS paid modules → quiz gating → final assignment → Manager approval → verified L1 to L2');
  fs.writeFileSync(path.join(os.tmpdir(),'pulse-vi-corpus.json'),JSON.stringify({records,unique:[...new Set(records.flatMap(item => item.nodes))].sort((a,b)=>a.localeCompare(b)),errors},null,2));
  console.log('PASS purchase → publish → reserve department seat → path quiz → Basic approved → paid course auto-open; no over-allocation');
  if (errors.length) console.log(errors.slice(0,5));
}
run().then(() => { socket?.close(); chrome.kill(); process.exit(0); }, error => {
  console.error(error.stack); socket?.close(); chrome.kill(); process.exit(1);
});
