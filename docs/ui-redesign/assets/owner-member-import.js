/* OW-07 design preview: local CSV review only. Nothing is sent to the API. */
const OM_IMPORT_DEPARTMENTS=['Sales','People Operations','Operations'];
const OM_IMPORT_POSITIONS=['Sales (CRM)','People Operations','Operations'];
const OM_IMPORT_MAX_ROWS=200;

function omCsvRecords(text){
 const source=String(text||'').replace(/^\uFEFF/,'');
 const firstLine=source.split(/\r?\n/,1)[0]||'';
 const count=separator=>{let quoted=false,total=0;for(let i=0;i<firstLine.length;i++){if(firstLine[i]==='"'){if(quoted&&firstLine[i+1]==='"')i++;else quoted=!quoted}else if(firstLine[i]===separator&&!quoted)total++}return total};
 const separator=['\t',';',','].sort((a,b)=>count(b)-count(a))[0];
 const records=[];let cells=[],cell='',quoted=false,line=1,start=1;
 const finish=()=>{cells.push(cell.trim());if(cells.some(value=>value!==''))records.push({line:start,cells});cells=[];cell='';start=line};
 for(let i=0;i<source.length;i++){
  const char=source[i];
  if(char==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(char===separator&&!quoted){cells.push(cell.trim());cell=''}
  else if(char==='\n'){if(quoted){cell+='\n';line++}else{finish();line++;start=line}}
  else if(char==='\r'){if(source[i+1]!=='\n'){if(quoted){cell+='\n';line++}else{finish();line++;start=line}}}
  else cell+=char;
 }
 if(cell||cells.length)finish();
 return {records,unclosedQuote:quoted};
}

function omParseMemberCsv(text){
 const {records,unclosedQuote}=omCsvRecords(text),issues=[];
 if(unclosedQuote)issues.push('The CSV contains an unclosed quotation mark.');
 if(!records.length)issues.push('The file is empty.');
 const first=records[0]?.cells.map(value=>value.toLowerCase().replace(/\s+/g,'_'))||[];
 const hasHeader=first[0]==='email'||first[0]==='e-mail';
 if(!hasHeader)issues.push('Add a header row starting with email,full_name,department,position,role.');
 else if(!['full_name','name','họ_tên'].includes(first[1]))issues.push('The second header must be full_name.');
 const data=hasHeader?records.slice(1):[];
 if(data.length>OM_IMPORT_MAX_ROWS)issues.push('At most 200 people can be invited per batch. Split this file into smaller files.');
 const seen=new Set();
 const rows=data.map(({line,cells},index)=>{
  const [rawEmail='',fullName='',department='',position='',rawRole='']=cells;
  const email=rawEmail.trim().toLowerCase(),role=(rawRole||'EMPLOYEE').trim().toUpperCase();
  const errors=[];
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.push('Invalid email');
  if(!fullName.trim())errors.push('Full name required');
  if(seen.has(email))errors.push('Duplicate email');
  else if(email)seen.add(email);
  if(!['OWNER','MANAGER','EMPLOYEE'].includes(role))errors.push('Use OWNER, MANAGER or EMPLOYEE');
  if(department&&!OM_IMPORT_DEPARTMENTS.includes(department))errors.push('Department not found');
  if(position&&!OM_IMPORT_POSITIONS.includes(position))errors.push('Position not found');
  if(cells.length>5)errors.push('Too many columns');
  if(index>=OM_IMPORT_MAX_ROWS)errors.push('Over the 200-person limit');
  return {line,email,fullName:fullName.trim(),department,position,role,errors};
 });
 return {rows,issues};
}

function omMembersImportPage(){
 const mode=state.omImportMode||'file',result=state.omImportResult,rows=result?.rows||[];
 const valid=rows.filter(row=>!row.errors.length).length,invalid=rows.length-valid;
 const canReview=!!result&&rows.length>0&&!invalid&&!result.issues.length;
 return `<section class="om-workspace om-members">
  <div class="om-section-head"><div><span class="om-kicker">MEMBERS / INVITATIONS</span><h2>Bring your team in, all at once.</h2><p>Place each person in the right role and position before their competency journey starts.</p></div><span class="om-import-pro">PRO · BULK IMPORT</span></div>
  <div class="om-member-hero"><div><span class="om-kicker">THE FAST PATH</span><h3>One file.<br>One clear review.</h3><p>Prepare your team in a spreadsheet, export as CSV UTF-8, review every row, then invite.</p><div class="om-member-hero-actions"><button type="button" class="btn" onclick="omMemberMode('file')">Import members ↗</button><button type="button" class="btn secondary" onclick="omMemberMode('single')">Add one person</button></div></div><div class="om-member-hero-art" aria-hidden="true"><span class="om-art-sheet"><i></i><i></i><i></i><b>CSV</b></span><span class="om-art-arrow">→</span><span class="om-art-people"><i>A</i><i>L</i><i>M</i><small>TEAM READY</small></span></div></div>
  <div class="om-import-steps" aria-label="Import workflow"><span><b>01</b> Download template</span><span><b>02</b> Upload CSV</span><span><b>03</b> Review rows</span><span><b>04</b> Send invitations</span></div>
  <div class="om-member-tabs" role="tablist" aria-label="Add member method"><button role="tab" aria-selected="${mode==='file'}" class="${mode==='file'?'active':''}" onclick="omMemberMode('file')">Import from file <small>For many people</small></button><button role="tab" aria-selected="${mode==='single'}" class="${mode==='single'?'active':''}" onclick="omMemberMode('single')">Add individually <small>For one person</small></button></div>
  ${mode==='file'?omImportPanel(result,valid,invalid,canReview):omSingleMemberPanel()}
  <div class="om-member-bottom"><div class="om-surface"><span class="om-kicker">CURRENT TEAM / SAMPLE</span><h3>People already in the business</h3><div class="om-roster-head"><span>PERSON</span><span>ROLE / POSITION</span><span>STATUS</span><span></span></div>${[['Alex Tran','Employee · Sales (CRM)','Active'],['Linh Le','Employee · Sales (CRM)','Active'],['Minh Pham','Employee · Sales (CRM)','Invited']].map(([name,role,status],i)=>`<button class="om-roster-row" onclick="state.person=${i};go('OW-08')"><span><i class="om-initials">${name.split(' ').map(v=>v[0]).join('')}</i><strong>${name}</strong></span><span>${role}</span><span class="om-status ${status==='Active'?'met':'unknown'}">${status}</span><b>↗</b></button>`).join('')}</div><aside class="om-surface om-member-context"><span class="om-kicker">WHY THE FIELDS MATTER</span><div><b>Role</b><span>Sets access and responsibilities.</span></div><div><b>Department</b><span>Places the person in the team view.</span></div><div><b>Position</b><span>Connects them to a 24-skill target.</span></div><button type="button" onclick="go('OW-08')">Explore capability profiles ↗</button></aside></div>
 </section>`;
}

function omImportPanel(result,valid,invalid,canReview){
 const rows=result?.rows||[],file=state.omImportFile||'';
 return `<div class="om-surface om-import-panel" id="om-import-panel"><div class="om-panel-top"><div><span class="om-kicker">01 / PREPARE THE FILE</span><h3>Start with the template.</h3><p>Columns: email, full name, department, position and role. Department and position names must already exist.</p></div><a class="btn secondary" href="assets/member-import-template.csv" download="member-import-template.csv">↓ Download CSV template</a></div>
  <div class="om-import-layout"><label class="om-import-drop" id="om-import-drop" ondragover="event.preventDefault();this.classList.add('dragging')" ondragleave="this.classList.remove('dragging')" ondrop="event.preventDefault();this.classList.remove('dragging');omReadMemberFile(event.dataTransfer.files[0])"><input type="file" accept=".csv,text/csv,text/plain" onchange="omReadMemberFile(this.files[0])"><span class="om-upload-icon" aria-hidden="true">↑</span><strong>Drop your CSV here, or browse files</strong><small>CSV UTF-8 · Excel users: Save As CSV UTF-8</small><em>Choose CSV file</em></label><div class="om-import-guide"><span class="om-kicker">FILE CHECKLIST</span><div><i>✓</i><span>Use one person per row</span></div><div><i>✓</i><span>Roles: OWNER, MANAGER or EMPLOYEE</span></div><div><i>✓</i><span>Maximum 200 people per batch</span></div><div><i>✓</i><span>Check department and position spelling</span></div><p>Bulk import requires the business's Pro entitlement. This screen previews that workflow.</p></div></div>
  ${result?omImportReview(result,valid,invalid,canReview,file):`<div class="om-import-empty"><span>✦</span><div><strong>Your file review will appear here</strong><small>Upload a CSV to see valid invitations and row-level fixes before sending.</small></div></div>`}
 </div>`;
}

function omImportReview(result,valid,invalid,canReview,file){
 const rows=result.rows,reviewed=!!state.omImportReviewed,ownerCount=rows.filter(row=>row.role==='OWNER'&&!row.errors.length).length;
 return `<div class="om-import-review" aria-live="polite"><div class="om-import-review-head"><div><span class="om-kicker">02 / REVIEW THE DATA</span><h3>${esc(file||'Selected CSV')}</h3></div><button type="button" onclick="omClearMemberFile()">Replace file ↗</button></div><div class="om-import-counts"><span><b>${rows.length}</b>Total rows</span><span class="good"><b>${valid}</b>Ready</span><span class="${invalid||result.issues.length?'bad':''}"><b>${invalid+result.issues.length}</b>Need attention</span></div>${result.issues.length?`<div class="om-import-alert" role="alert">${result.issues.map(issue=>`<p>${esc(issue)}</p>`).join('')}</div>`:''}
  <div class="om-import-table-wrap"><table class="om-import-table"><thead><tr><th>ROW</th><th>PERSON</th><th>ROLE</th><th>DEPARTMENT / POSITION</th><th>CHECK</th></tr></thead><tbody>${rows.map(row=>`<tr class="${row.errors.length?'invalid':''}"><td>${row.line}</td><td><strong>${esc(row.fullName||'—')}</strong><small>${esc(row.email||'—')}</small></td><td>${esc(row.role)}</td><td>${esc(row.department||'Unassigned')}<small>${esc(row.position||'Unassigned')}</small></td><td><span class="om-import-status ${row.errors.length?'bad':'good'}">${row.errors.length?esc(row.errors.join(' · ')):'Ready'}</span></td></tr>`).join('')}</tbody></table></div>
  ${ownerCount?`<div class="om-import-alert" role="alert">${ownerCount} person${ownerCount===1?'':'s'} will receive full Owner access. Check this role before inviting.</div>`:''}
  <div class="om-import-footer"><p>${canReview?'All rows look ready. Review the invitation count before sending.':'Fix the marked rows in your file and upload it again. No invitations have been sent.'}</p><button type="button" class="btn" ${canReview?'':'disabled'} onclick="omReviewMemberInvitations()">Review ${valid} invitations →</button></div>
  ${reviewed&&canReview?`<div class="om-import-confirm"><span class="om-kicker">03 / FINAL CHECK</span><h3>Invite ${valid} people to Northstar Co.?</h3><p>Each person receives their selected role, department and position. The live system can report rejected rows separately.</p><button type="button" class="btn" onclick="toast('Design preview only: no invitations were sent.')">Send ${valid} invitations (preview)</button><button type="button" class="btn secondary" onclick="state.omImportReviewed=false;render()">Back to file review</button></div>`:''}
 </div>`;
}

function omSingleMemberPanel(){
 return `<div class="om-surface om-import-panel" id="om-import-panel"><div class="om-panel-top"><div><span class="om-kicker">SINGLE INVITATION</span><h3>Set one person's context.</h3><p>Use this when you have just one teammate to invite.</p></div></div><form class="om-single-form" onsubmit="event.preventDefault();omPreviewSingleInvite(this)"><div class="om-invite-grid"><label>Full name *<input name="fullName" required placeholder="Taylor Nguyen"></label><label>Work email *<input name="email" type="email" required placeholder="taylor@company.com"></label><label>Employee code<input name="employeeCode" placeholder="EMP-001"></label><label>Role<select name="role"><option value="EMPLOYEE">Employee</option><option value="MANAGER">Manager</option><option value="OWNER">Owner</option></select></label><label>Department<select name="department"><option value="">Unassigned</option>${OM_IMPORT_DEPARTMENTS.map(name=>`<option>${esc(name)}</option>`).join('')}</select></label><label>Position<select name="position"><option value="">Unassigned</option>${OM_IMPORT_POSITIONS.map(name=>`<option>${esc(name)}</option>`).join('')}</select></label></div><button type="submit" class="btn">Send invitation (preview)</button></form></div>`;
}

function omMemberMode(mode){state.omImportMode=mode;render();document.getElementById('om-import-panel')?.scrollIntoView({behavior:'smooth',block:'start'})}
function omReviewMemberInvitations(){state.omImportReviewed=true;render();document.querySelector('.om-import-confirm')?.scrollIntoView({behavior:'smooth',block:'nearest'})}
function omClearMemberFile(){state.omImportResult=null;state.omImportFile='';state.omImportReviewed=false;render()}
async function omReadMemberFile(file){
 if(!file)return;
 if(!/\.csv$/i.test(file.name)){toast('Use a CSV file. In Excel, choose Save As → CSV UTF-8.');return}
 try{state.omImportResult=omParseMemberCsv(await file.text());state.omImportFile=file.name;state.omImportReviewed=false;render();document.querySelector('.om-import-review')?.scrollIntoView({behavior:'smooth',block:'nearest'})}
 catch{toast('The CSV could not be read. Please try another file.')}
}
function omPreviewSingleInvite(form){
 const role=form.elements.role.value;
 if(role==='OWNER'){toast('Owner grants full business access. Design preview only; no invitation was sent.');return}
 toast('Design preview only: no invitation was sent.');
}
