'use strict';
/* ==========================================================================
   FCI-Materials — Frontend Application (Modular Architecture)
   Assiut University • Faculty of Computers & Information
   ========================================================================== */

/* ===== 1. الثوابت الأساسية والأدوات المساعدة ===== */
const DEPT_GEN=['علوم الحاسب','نظم المعلومات','تكنولوجيا المعلومات','الوسائط المتعددة'];
const DEPT_SPC=['هندسة البرمجيات','نظم المعلومات الحيوية','الذكاء الاصطناعي','الأمن السيبراني'];
const DEPTS=DEPT_GEN.concat(DEPT_SPC);
const COMMON_LEVELS=['الفرقة الأولى','الفرقة الثانية'];
const trackLabel=t=>t==='خاص'?'البرامج الخاصة':'الأقسام العامة';
const deptsOf=t=>t==='خاص'?DEPT_SPC:DEPT_GEN;
const deptBtnsHtml=t=>(t==='خاص'?'':'<button class="btn" data-k="dept" data-v="مشترك" data-n="semesterStep">📚 المواد المشتركة فقط</button>')+deptsOf(t).map(d=>`<button class="btn" data-k="dept" data-v="${esc(d)}" data-n="levelStep">${esc(d)}</button>`).join('');
const DEPT_FIX={'علوم حاسب':'علوم الحاسب','نظم معلومات':'نظم المعلومات','المعلوماتية الحيوية':'نظم المعلومات الحيوية','المعلوماتيه الحيويه':'نظم المعلومات الحيوية','الذكاء الأصطناعي':'الذكاء الاصطناعي','ذكاء اصطناعي':'الذكاء الاصطناعي','الامن السيبراني':'الأمن السيبراني','هندسه البرمجيات':'هندسة البرمجيات','الوسائط المتعدده':'الوسائط المتعددة'};
function normOneItem(i){
  if(!i||typeof i!=='object')return i;
  const o=Object.assign({},i);
  o.dept=String(o.dept||'').trim();
  if(DEPT_FIX[o.dept])o.dept=DEPT_FIX[o.dept];
  o.track=String(o.track||'').trim();
  if(o.track==='البرامج الخاصة'||o.track==='برامج خاصة')o.track='خاص';
  else if(o.track==='الأقسام العامة'||o.track==='أقسام عامة')o.track='عام';
  if(DEPT_SPC.includes(o.dept))o.track='خاص';
  else if(DEPT_GEN.includes(o.dept))o.track='عام';
  if(o.track!=='عام'&&o.track!=='خاص')o.track='عام';
  if(!o.dept)o.dept='مشترك';
  o.level=String(o.level||'').trim();
  const lvMap={'الفرقة الاولى':'الفرقة الأولى','الفرقه الاولى':'الفرقة الأولى','الفرقة الثانيه':'الفرقة الثانية','الفرقه الثانيه':'الفرقة الثانية','الفرقة الثالثه':'الفرقة الثالثة','الفرقه الثالثه':'الفرقة الثالثة','الفرقة الرابعه':'الفرقة الرابعة','الفرقه الرابعه':'الفرقة الرابعة'};
  if(lvMap[o.level])o.level=lvMap[o.level];
  o.semester=String(o.semester||'').trim();
  const smMap={'الفصل الاول':'الفصل الأول','الترم الأول':'الفصل الأول','الترم الاول':'الفصل الأول','الترم الثاني':'الفصل الثاني','الترم الثانى':'الفصل الثاني','الفصل الثانى':'الفصل الثاني'};
  if(smMap[o.semester])o.semester=smMap[o.semester];
  o.type=String(o.type||'').trim();
  if(!TYPES.includes(o.type))o.type='محاضرات';
  o.subject=String(o.subject||'').trim();
  o.title=String(o.title||'').trim();
  return o;
}
const fixItems=a=>(a||[]).map(normOneItem);
const LEVELS=['الفرقة الأولى','الفرقة الثانية','الفرقة الثالثة','الفرقة الرابعة'];
const TYPES=['محاضرات','سكاشن','ملخصات','امتحانات سابقة','تكليفات'];
const WEEKS=['عام',...Array.from({length:16},(_,i)=>'الأسبوع '+(i+1)),'ميدتيرم','فاينال'];
const DAYS=['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const GRADE_POINTS={'A (90-100)':4.0,'A- (85-90)':3.7,'B+ (80-85)':3.3,'B (75-80)':3.0,'B- (70-75)':2.7,'C+ (65-70)':2.3,'C (60-65)':2.0,'C- (55-60)':1.7,'D+ (50-55)':1.3,'D (45-50)':1.0,'F (<45)':0.0};
const GRADE_MIGRATE={'A+ (90%+)':'A (90-100)','A (85-89%)':'A- (85-90)','B+ (80-84%)':'B+ (80-85)','B (75-79%)':'B (75-80)','C+ (70-74%)':'B- (70-75)','C (65-69%)':'C+ (65-70)','D+ (60-64%)':'C (60-65)','D (50-59%)':'D+ (50-55)','F (<50%)':'F (<45)'};

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeId=s=>String(s??'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,64);
const safeHref=u=>esc(safeUrl(u)||'#');
function ld(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const getDB=()=>DB;
const getReps=()=>REPS;
const opts=(a,sel)=>a.map(x=>`<option value="${esc(x)}"${x===sel?' selected':''}>${esc(x)}</option>`).join('');
function toast(m,err){
  const t=document.createElement('div');t.className='toast';t.style.background=err?'#e74c3c':'#27ae60';t.textContent=m;
  $('toast-container').appendChild(t);setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.remove(),300)},2800);
}
function closeModal(id){if($(id))$(id).style.display='none'}

/* نافذة التأكيد المدمجة بدلاً من confirm() */
let _confirmResolve=null;
function askConfirm(msg){
  return new Promise(res=>{
    _confirmResolve=res;
    $('confirmMsg').textContent=msg;
    $('confirmModal').style.display='flex';
  });
}
function resolveConfirm(val){
  $('confirmModal').style.display='none';
  if(_confirmResolve){const r=_confirmResolve;_confirmResolve=null;r(val)}
}
let _promptResolve=null;
function askPrompt(title,defaultVal='',placeholder=''){
  return new Promise(res=>{
    _promptResolve=res;
    $('promptTitle').textContent=title;
    const inp=$('promptInput');
    inp.value=defaultVal||'';
    inp.placeholder=placeholder||'';
    $('promptModal').style.display='flex';
    setTimeout(()=>{inp.focus();inp.select()},30);
  });
}
function resolvePrompt(ok){
  $('promptModal').style.display='none';
  const val=ok?$('promptInput').value:null;
  if(_promptResolve){const r=_promptResolve;_promptResolve=null;r(val)}
}
$('promptInput').addEventListener('keydown',e=>{if(e.key==='Enter')resolvePrompt(true)});
function debounce(fn,ms=130){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

function safeUrl(s){try{const u=new URL(String(s||''));if(!/^https?:$/.test(u.protocol)||u.username||u.password)return '';return u.href}catch(e){return ''}}
function getDL(l){
  l=safeUrl(l);if(!l)return '';
  let m=l.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
  if(m)return `https://docs.google.com/${m[1]}/d/${m[2]}/export?format=${m[1]==='spreadsheets'?'xlsx':m[1]==='presentation'?'pptx':'pdf'}`;
  if(l.includes('drive.google.com')&&!l.includes('/folders/')){m=l.match(/\/d\/([\w-]+)/)||l.match(/[?&]id=([\w-]+)/);if(m)return `https://drive.usercontent.google.com/download?id=${m[1]}&export=download&confirm=t`}
  return l;
}
function getIcon(l){if(l.includes('youtu'))return '🎬';if(/\.pdf($|\?)/i.test(l))return '📄';if(l.includes('/folders/'))return '📁';return '🔗'}
function dlBadge(d){
  if(!d)return '';const e=new Date(d+'T23:59:59'),days=Math.ceil((e-new Date())/864e5);
  if(e<new Date())return '<span class="countdown-badge urgent">انتهى الوقت</span>';
  return `<span class="countdown-badge${days<=2?' urgent':''}">⏳ ${days<=1?'آخر يوم':days+' يوم'}</span>`;
}
function copyText(t){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t).then(()=>toast('تم النسخ 🔗'));
  const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('تم النسخ 🔗')}catch(e){toast('تعذر النسخ',1)}a.remove();
}

/* ===== المظهر (الوضع الليلي / النهاري) ===== */
let isAdmin=false;
const bodyEl=document.body;
if(ld('fci_theme','dark')==='dark'){bodyEl.classList.add('dark-mode');$('themeToggleBtn').textContent='☀️'}
$('themeToggleBtn').onclick=()=>{
  bodyEl.classList.toggle('dark-mode');
  const d=bodyEl.classList.contains('dark-mode');
  sv('fci_theme',d?'dark':'light');
  $('themeToggleBtn').textContent=d?'☀️':'🌙';
};

/* ===== تهيئة قوائم المواد والإدارة ===== */
$('deptBtns').innerHTML=deptBtnsHtml('عام');
$('levelBtns').innerHTML=LEVELS.map(l=>`<button class="btn" data-k="level" data-v="${esc(l)}" data-n="semesterStep">${esc(l)}</button>`).join('');
function fillAddDept(){
  const tr=$('addTrack').value;
  $('addDept').innerHTML=tr==='خاص'?opts(deptsOf('خاص').concat(['مشترك'])):opts(['مشترك'].concat(deptsOf('عام')));
}
function autoDept(){if($('addTrack').value==='عام'&&COMMON_LEVELS.indexOf($('addLevel').value)>-1)$('addDept').value='مشترك'}
fillAddDept();
function saveLastAddPath(){
  sv('fci_last_add_path',{
    track:$('addTrack').value,dept:$('addDept').value,level:$('addLevel').value,
    semester:$('addSemester').value,subject:$('addSubject').value.trim(),doctor:$('addDoctor').value.trim()
  });
}
function restoreLastAddPath(){
  const lp=ld('fci_last_add_path',null);if(!lp)return;
  if(lp.track&&['عام','خاص'].includes(lp.track))$('addTrack').value=lp.track;
  fillAddDept();
  if(lp.level&&LEVELS.includes(lp.level))$('addLevel').value=lp.level;
  if(lp.dept&&Array.from($('addDept').options).some(o=>o.value===lp.dept))$('addDept').value=lp.dept;
  if(lp.semester&&['الفصل الأول','الفصل الثاني'].includes(lp.semester))$('addSemester').value=lp.semester;
  if(lp.subject)$('addSubject').value=lp.subject;
  if(lp.doctor)$('addDoctor').value=lp.doctor;
}
function updateAddDatalists(){
  const db=getDB();
  const subs=Array.from(new Set(db.map(i=>i.subject).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ar'));
  const docs=Array.from(new Set(db.map(i=>i.doctor).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ar'));
  if($('dlSubjects'))$('dlSubjects').innerHTML=subs.map(s=>`<option value="${esc(s)}">`).join('');
  if($('dlDoctors'))$('dlDoctors').innerHTML=docs.map(d=>`<option value="${esc(d)}">`).join('');
}
$('addTrack').addEventListener('change',()=>{fillAddDept();autoDept();saveLastAddPath()});
$('addLevel').addEventListener('change',()=>{autoDept();saveLastAddPath()});
['addDept','addSemester'].forEach(id=>$(id).addEventListener('change',saveLastAddPath));
['addSubject','addDoctor'].forEach(id=>$(id).addEventListener('change',saveLastAddPath));
$('pathHint').textContent='الأقسام العامة: '+COMMON_LEVELS.join('، ')+' دراستها موحّدة لكل الطلاب (اختار «مشترك»)، وبعدها الطالب بيختار قسمه. البرامج الخاصة: اختار البرنامج.';
$('addLevel').innerHTML=opts(LEVELS);
$('addWeek').innerHTML=opts(WEEKS);$('editWeek').innerHTML=opts(WEEKS);
$('addType').innerHTML=opts(TYPES);
$('weekFilter').innerHTML='<option value="">كل الأسابيع</option>'+opts(WEEKS);
$('typeFilter').innerHTML='<option value="">كل الأنواع</option>'+opts(TYPES);
$('addType').onchange=()=>{$('addDeadline').style.display=$('addType').value==='تكليفات'?'block':'none'};
$('editType').innerHTML=opts(TYPES);$('editTrack').innerHTML=opts(['عام','خاص']);$('editDept').innerHTML=opts(['مشترك'].concat(DEPTS));$('editLevel').innerHTML=opts(LEVELS);$('editSem').innerHTML=opts(['الفصل الأول','الفصل الثاني']);
$('editDept').addEventListener('change',()=>{const d=$('editDept').value;if(DEPT_SPC.includes(d))$('editTrack').value='خاص';else if(DEPT_GEN.includes(d))$('editTrack').value='عام'});
restoreLastAddPath();

/* ===== التنقل بين الأقسام الرئيسية الخمسة ===== */
const ALL_MAIN_SECTIONS=['studentFlow','scheduleView','gpaView','studyView','aiView','adminLogin','adminDashboard'];
function switchMainView(viewId){
  ALL_MAIN_SECTIONS.forEach(id=>{if($(id))$(id).hidden=(id!==viewId)});
  document.querySelectorAll('[data-main-tab]').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.mainTab===viewId);
  });
  if(viewId==='studentFlow'&&!$('resultsStep').hidden)render();
  if(viewId==='scheduleView')renderScheduleHub();
  if(viewId==='gpaView')renderGpaHub();
  if(viewId==='studyView')renderStudyHub();
  if(viewId==='aiView')renderAiHub();
  if(viewId==='adminDashboard')adminTab('home');
}
function showSection(id){switchMainView(id)}


/* ===== المسار الدراسي للطالب ===== */
let userPath=ld('fci_path',{});
if(userPath.dept&&DEPT_FIX[userPath.dept])userPath.dept=DEPT_FIX[userPath.dept];
function goHome(){
  switchMainView('studentFlow');
  if(!isAdmin&&userPath.semester)showResults(userPath.semester);
  else resetTo('trackStep');
}
$('brandHomeBtn').addEventListener('click',goHome);
$('brandHomeBtn').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goHome()}});
function quickSelectAI(){
  activeSub=null;activeType=null;userPath={track:'خاص',dept:'الذكاء الاصطناعي',level:'الفرقة الثانية',semester:'الفصل الأول'};
  sv('fci_path',userPath);
  showResults('الفصل الأول');
  toast('تم فتح مسار برنامج الذكاء الاصطناعي — الفرقة الثانية ⚡');
}
function clearSavedPath(){try{localStorage.removeItem('fci_path')}catch(e){}activeSub=null;activeType=null;QF='all';userPath={};resetTo('trackStep')}
function goStep(n){document.querySelectorAll('.student-step').forEach(s=>s.hidden=true);$(n).hidden=false}
function resetTo(n){activeSub=null;activeType=null;if(n==='trackStep')userPath={};goStep(n)}
function showResults(sem){
  userPath.semester=sem;sv('fci_path',userPath);goStep('resultsStep');
  $('chosenResultsLabel').textContent=[trackLabel(userPath.track),userPath.dept&&userPath.dept!=='مشترك'?userPath.dept:'',userPath.level,sem].filter(Boolean).join(' > ');
  render();
}
$('studentFlow').addEventListener('click',e=>{
  const b=e.target.closest('[data-k]');if(!b)return;
  const k=b.dataset.k,v=b.dataset.v,gen=()=>userPath.track==='عام';
  if(k==='semester'){activeSub=null;activeType=null;return showResults(v)}
  userPath[k]=v;
  if(k==='track'){
    delete userPath.dept;delete userPath.level;delete userPath.semester;
    if(v==='عام')goStep('levelStep');else{$('deptBtns').innerHTML=deptBtnsHtml('خاص');goStep('deptStep')}
  }else if(k==='dept'){
    goStep(gen()?'semesterStep':'levelStep');
  }else if(k==='level'){
    if(gen()&&COMMON_LEVELS.indexOf(v)<0){$('deptBtns').innerHTML=deptBtnsHtml('عام');goStep('deptStep')}
    else{if(gen())userPath.dept='مشترك';goStep('semesterStep')}
  }
  const dn=userPath.dept&&userPath.dept!=='مشترك'?userPath.dept:'';
  $('lblDept').textContent=[trackLabel(userPath.track),userPath.level].filter(Boolean).join(' - ');
  $('lblLevel').textContent=[trackLabel(userPath.track),dn].filter(Boolean).join(' - ');
  $('lblSem').textContent=[trackLabel(userPath.track),dn,userPath.level].filter(Boolean).join(' - ');
});

/* ===== البيانات المحلية للطالب (الجدول، الغياب، الـ GPA، المهام) ===== */
const DEFAULT_ATTENDANCE=[];
const DEFAULT_GPA_COURSES=[];
const DEFAULT_TASKS=[];


function sanitizeLocalArr(arr,prefix){
  return (Array.isArray(arr)?arr:[]).filter(x=>x&&typeof x==='object').map((x,i)=>Object.assign({},x,{id:safeId(x.id)||(prefix+i)}));
}
let customSched=sanitizeLocalArr(ld('fci_custom_sched',[]),'cs_');
let attendanceList=sanitizeLocalArr(ld('fci_attendance',DEFAULT_ATTENDANCE),'att_');
let gpaCoursesList=sanitizeLocalArr(ld('fci_rich_gpa',DEFAULT_GPA_COURSES),'gc_').map(c=>Object.assign({},c,{grade:GRADE_MIGRATE[c.grade]||c.grade}));
let personalTasks=sanitizeLocalArr(ld('fci_personal_tasks',DEFAULT_TASKS),'pt_');
let studyStats=ld('fci_study_stats',{minutes:0,sessions:0});
let activeSchedDay='all';
let activeTaskFilter='all';

/* ===== 2. منطق الجدول ومتتبع الغياب ===== */
function renderScheduleHub(){
  const td=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][new Date().getDay()];
  $('todayBadgeLabel').textContent='اليوم: '+td;
  const pills=['all'].concat(DAYS);
  $('schedDayPills').innerHTML=pills.map(d=>`<button type="button" class="pill-btn ${activeSchedDay===d?'active':''}" onclick="setSchedDay('${d}')">${d==='all'?'كل الأيام':d}${d===td?' (النهاردة)':''}</button>`).join('');

  const p=userPath;
  const backendSched=SCHED.filter(x=>(!p.track||x.track===p.track)&&(!p.level||x.level===p.level)&&(!p.dept||x.dept===p.dept||x.dept==='مشترك'));
  const combined=[
    ...backendSched.map(x=>({id:x.id,subject:x.subject,day:x.day,time:x.time,place:x.place,type:'محاضرة / سكشن',isBackend:true})),
    ...customSched
  ].filter(item=>activeSchedDay==='all'||item.day===activeSchedDay);

  const box=$('unifiedScheduleList');
  if(!combined.length){
    box.innerHTML='<p style="text-align:center;color:#888">لا توجد محاضرات أو سكاشن مسجلة في هذا اليوم.</p>';
  }else{
    box.innerHTML=combined.map(item=>{
      const isLab=String(item.type||'').includes('معمل')||String(item.type||'').includes('سكشن');
      return `<div class="ev">
        <div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:3px">
            <span class="tag">${esc(item.day)}</span>
            <b style="color:var(--accent-color)">${esc(item.time)}</b>
            <span class="badge-soft ${isLab?'badge-lab':'badge-lec'}">${esc(item.type||'محاضرة')}</span>
          </div>
          <b>${esc(item.subject)}</b><br>
          <small>📍 ${esc(item.place)}</small>
        </div>
        ${!item.isBackend?`<button type="button" class="btn btn-danger sm" onclick="removeCustomSched('${safeId(item.id)}')">🗑️</button>`:''}
      </div>`;
    }).join('');
  }

  $('attendanceCardsList').innerHTML=attendanceList.map(att=>{
    const absences=Math.max(0,Math.min(1000,Number(att.absences)||0));
    const maxAbsences=Math.max(1,Math.min(1000,Number(att.max)||4));
    const ratio=absences/maxAbsences;
    const col=ratio>=0.75?'var(--danger-color)':ratio>=0.5?'var(--warning-color)':'var(--success-color)';
    return `<div style="padding:10px;border-radius:10px;background:var(--card-bg);border:1px solid var(--border-col);margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <b style="font-size:13px">${esc(att.course)}</b>
        <span style="font-size:12px;font-weight:700;color:${col}">${absences} / ${maxAbsences} غياب</span>
      </div>
      <div class="pbar" style="margin-bottom:8px"><i style="width:${Math.min(100,ratio*100)}%;background:${col}"></i></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <small style="color:#888">${ratio>=0.75?'⚠️ تحذير: اقتربت من الحرمان!':'وضع الحضور آمن ✅'}</small>
        <div style="display:flex;gap:6px">
          <button type="button" class="btn sm" style="padding:2px 9px" onclick="changeAbsence('${safeId(att.id)}',-1)">-</button>
          <button type="button" class="btn sm" style="padding:2px 9px" onclick="changeAbsence('${safeId(att.id)}',1)">+</button>
          <button type="button" class="btn btn-danger sm" style="padding:2px 8px" onclick="deleteAbsenceCourse('${safeId(att.id)}')">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function setSchedDay(d){activeSchedDay=d;renderScheduleHub()}
$('customSchedForm').addEventListener('submit',e=>{
  e.preventDefault();
  customSched.push({
    id:'cs_'+Date.now(),
    subject:$('cSchedSubject').value.trim(),
    day:$('cSchedDay').value,
    time:$('cSchedTime').value.trim(),
    place:$('cSchedRoom').value.trim(),
    type:$('cSchedType').value
  });
  sv('fci_custom_sched',customSched);
  $('cSchedSubject').value='';$('cSchedTime').value='';$('cSchedRoom').value='';
  renderScheduleHub();
  toast('تمت إضافة الموعد لجدولك ✅');
});
function removeCustomSched(id){
  customSched=customSched.filter(x=>x.id!==id);
  sv('fci_custom_sched',customSched);
  renderScheduleHub();
}
function changeAbsence(id,delta){
  const item=attendanceList.find(a=>a.id===id);
  if(!item)return;
  item.absences=Math.max(0,Math.min(item.max,item.absences+delta));
  sv('fci_attendance',attendanceList);
  renderScheduleHub();
}
function deleteAbsenceCourse(id){
  attendanceList=attendanceList.filter(a=>a.id!==id);
  sv('fci_attendance',attendanceList);
  renderScheduleHub();
}
$('addAttCourseForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('newAttCourseName').value.trim();
  if(!name)return;
  attendanceList.push({id:'att_'+Date.now(),course:name,absences:0,max:4});
  sv('fci_attendance',attendanceList);
  $('newAttCourseName').value='';
  renderScheduleHub();
  toast('تمت إضافة المادة لمتتبع الغياب');
});
function getPathSubjects(){
  const p=userPath;
  if(!p||!p.track||!p.level||!p.semester)return [];
  const unified=p.track==='عام'&&p.dept==='مشترك'&&COMMON_LEVELS.indexOf(p.level)>-1;
  const items=getDB().filter(i=>i.track===p.track&&i.level===p.level&&i.semester===p.semester&&(i.dept===p.dept||i.dept==='مشترك'||unified)&&(!i.hidden&&(!i.publishAt||+i.publishAt<=Date.now())));
  return Array.from(new Set(items.map(i=>i.subject).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ar'));
}
function importPathCoursesToAttendance(){
  const subs=getPathSubjects();
  if(!subs.length)return toast('اختار مسارك الدراسي من صفحة المواد الأول (أو لا توجد مواد بعد)',1);
  const have=new Set(attendanceList.map(a=>norm(a.course)));
  let added=0;
  subs.forEach((s,idx)=>{
    if(!have.has(norm(s))){attendanceList.push({id:'att_'+Date.now()+'_'+idx,course:s,absences:0,max:4});have.add(norm(s));added++}
  });
  if(!added)return toast('كل مواد مسارك موجودة بالفعل في متتبع الغياب ✅');
  sv('fci_attendance',attendanceList);renderScheduleHub();
  toast('تم استيراد '+added+' مادة لمتتبع الغياب ⚡');
}
function importPathCoursesToGpa(){
  const subs=getPathSubjects();
  if(!subs.length)return toast('اختار مسارك الدراسي من صفحة المواد الأول (أو لا توجد مواد بعد)',1);
  const have=new Set(gpaCoursesList.map(c=>norm(c.name)));
  let added=0;
  subs.forEach((s,idx)=>{
    if(!have.has(norm(s))){gpaCoursesList.push({id:'gc_'+Date.now()+'_'+idx,name:s,hours:3,grade:'B (75-80)'});have.add(norm(s));added++}
  });
  if(!added)return toast('كل مواد مسارك موجودة بالفعل في حاسبة الـ GPA ✅');
  sv('fci_rich_gpa',gpaCoursesList);renderGpaHub();
  toast('تم استيراد '+added+' مادة لحاسبة الـ GPA ⚡');
}

/* ===== 3. منطق حاسبة الـ GPA والدرجات ===== */
function getGpaGradeLabel(g){
  if(g>=3.7)return 'ممتاز (تقريباً)';
  if(g>=3.0)return 'جيد جداً (تقريباً)';
  if(g>=2.3)return 'جيد (تقريباً)';
  if(g>=2.0)return 'مقبول (تقريباً)';
  return 'أقل من 2.0 — ملاحظة أكاديمية';
}
function computeGpaStats(){
  const prevG=parseFloat($('prevGpa').value)||0;
  const prevH=parseFloat($('prevHrs').value)||0;
  let semH=0,semP=0;
  gpaCoursesList.forEach(c=>{
    const h=parseFloat(c.hours)||0;
    const pt=GRADE_POINTS[c.grade]!==undefined?GRADE_POINTS[c.grade]:0;
    if(h>0){semH+=h;semP+=h*pt}
  });
  const semGpa=semH>0?(semP/semH):0;
  const totH=prevH+semH;
  const newCgpa=totH>0?((prevG*prevH)+semP)/totH:0;
  return {prevG,prevH,semH,semGpa,totH,newCgpa};
}
function renderGpaHub(){
  const savedMeta=ld('fci_gpa_meta',{prevG:'',prevH:''});
  if(!$('prevGpa').dataset.init){
    $('prevGpa').value=savedMeta.prevG;
    $('prevHrs').value=savedMeta.prevH;
    $('prevGpa').dataset.init='1';
  }
  const gradeKeys=Object.keys(GRADE_POINTS);
  $('richGpaCoursesList').innerHTML=gpaCoursesList.length?gpaCoursesList.map((c,idx)=>`
    <div class="gpa-row">
      <input type="text" class="form-input" value="${esc(c.name)}" placeholder="اسم المقرر #${idx+1}" oninput="updateGpaCourse('${safeId(c.id)}','name',this.value)">
      <select class="form-select" onchange="updateGpaCourse('${safeId(c.id)}','hours',this.value)">
        ${[1,2,3,4].map(h=>`<option value="${h}"${Number(c.hours)===h?' selected':''}>${h} س</option>`).join('')}
      </select>
      <select class="form-select" onchange="updateGpaCourse('${safeId(c.id)}','grade',this.value)">
        ${gradeKeys.map(g=>`<option value="${esc(g)}"${c.grade===g?' selected':''}>${esc(g)}</option>`).join('')}
      </select>
      <button type="button" class="btn btn-danger sm" onclick="removeGpaCourse('${safeId(c.id)}')" aria-label="حذف المقرر">🗑️</button>
    </div>
  `).join(''):'<div class="cat-empty-hint">اضغط «➕ إضافة مادة» لحساب معدلك الفصلي والتراكمي.</div>';
  refreshGpaNumbers();
}
function refreshGpaNumbers(){
  const st=computeGpaStats();
  sv('fci_gpa_meta',{prevG:st.prevG,prevH:st.prevH});
  $('liveSemGpa').textContent=st.semGpa.toFixed(2);
  $('liveSemHours').textContent=st.semH+' ساعة مسجلة';
  $('liveNewCgpa').textContent=st.newCgpa.toFixed(2);
  $('liveGradeBadge').textContent=getGpaGradeLabel(st.newCgpa);
  const al=$('gpaHonorAlert');
  if(st.newCgpa<2.0){
    al.innerHTML='⚠️ المعدل التراكمي أقل من 2.00 (ملاحظة أكاديمية — يجب رفعه لتجنب الإنذار)';
    al.style.color='var(--danger-color)';
  }else if(st.newCgpa>=3.0){
    al.innerHTML='🏅 معدلك 3.00 فأكثر: مؤهل لمرتبة الشرف بشرط عدم الرسوب في أي مقرر!';
    al.style.color='var(--success-color)';
  }else{
    al.innerHTML='✅ وضعك الأكاديمي سليم — واصل الاجتهاد لرفع المعدل فوق 3.00';
    al.style.color='var(--text-color)';
  }
}
$('prevGpa').addEventListener('input',refreshGpaNumbers);
$('prevHrs').addEventListener('input',refreshGpaNumbers);
function updateGpaCourse(id,field,val){
  const c=gpaCoursesList.find(x=>x.id===id);
  if(!c)return;
  c[field]=field==='hours'?Number(val):val;
  sv('fci_rich_gpa',gpaCoursesList);
  refreshGpaNumbers();
}
function addRichGpaCourse(){
  gpaCoursesList.push({id:'gc_'+Date.now(),name:'مقرر جديد',hours:3,grade:'B (75-80)'});
  sv('fci_rich_gpa',gpaCoursesList);
  renderGpaHub();
}
function removeGpaCourse(id){
  gpaCoursesList=gpaCoursesList.filter(x=>x.id!==id);
  sv('fci_rich_gpa',gpaCoursesList);
  renderGpaHub();
}
function resetDefaultGpaCourses(){
  gpaCoursesList=JSON.parse(JSON.stringify(DEFAULT_GPA_COURSES));
  sv('fci_rich_gpa',gpaCoursesList);
  renderGpaHub();
  toast('تم مسح كل المواد');
}
function simulateTargetGpa(){
  const desired=parseFloat($('targetCgpaInput').value)||3.5;
  const st=computeGpaStats();
  const out=$('targetGpaOutput');
  if(st.semH<=0){out.textContent='أضف مادة واحدة على الأقل لحساب المعدل المطلوب.';return}
  const reqPoints=(desired*(st.prevH+st.semH))-(st.prevH*st.prevG);
  const reqSemGpa=reqPoints/st.semH;
  if(reqSemGpa>4.0){
    out.innerHTML=`للوصول إلى <b>${desired.toFixed(2)}</b> هذا الترم تحتاج معدل فصلي <b style="color:var(--danger-color)">${reqSemGpa.toFixed(2)}</b> (أعلى من 4.00)، لذا يمكنك تحقيقه على فصلين دراسيين متتاليين.`;
  }else if(reqSemGpa<=0){
    out.innerHTML=`🎉 معدلك التراكمي الحالي يحقق هذا الهدف بالفعل!`;
  }else{
    out.innerHTML=`للوصول إلى معدل تراكمي <b>${desired.toFixed(2)}</b>، تحتاج لتحقيق معدل فصلي <b style="color:var(--success-color)">${reqSemGpa.toFixed(2)}</b> في الـ ${st.semH} ساعة المسجلة حالياً.`;
  }
}
function calcInlineCourseGrade(){
  const m=+$('inlineGM').value,mm=+$('inlineGMM').value,f=+$('inlineGF').value,t=+$('inlineGT').value,r=$('inlineGradeResult');
  if(!(mm>0&&f>0&&m>=0&&m<=mm)){r.textContent='راجع الأرقام المدخلة!';r.style.color='var(--danger-color)';return}
  const need=t/100*(mm+f)-m;
  if(need<=0){r.innerHTML='🎉 حققت هذه النسبة بالفعل من أعمال السنة!';r.style.color='var(--success-color)'}
  else if(need>f){r.innerHTML=`😔 لا يمكن الوصول إلى ${t}% (تحتاج ${need.toFixed(1)} من ${f})`;r.style.color='var(--danger-color)'}
  else{r.innerHTML=`تحتاج إلى <b>${need.toFixed(1)}</b> درجة من ${f} في امتحان الفاينال (${Math.round(need/f*100)}%)`;r.style.color='var(--accent-color)'}
}

/* ===== 4. منطق المهام، مؤقت المذاكرة (Pomodoro)، والملاحظات ===== */
let pomoInterval=null,pomoSeconds=25*60,pomoMode=25,pomoRunning=false,pomoSound=true;
function renderStudyHub(){
  $('studyStatsBanner').textContent=`🔥 إنجاز المذاكرة: ${studyStats.minutes} دقيقة (${studyStats.sessions} جلسات)`;
  if(!$('taskDateIn').value)$('taskDateIn').value=new Date().toISOString().slice(0,10);

  /* التكليفات المرفوعة على المنصة */
  const p=userPath;
  const platTasks=getDB().filter(i=>i.type==='تكليفات'&&(!p.track||i.track===p.track)&&(!p.level||i.level===p.level));
  $('platformAssignmentsBox').innerHTML=platTasks.length?`<div class="upcoming" style="margin-bottom:12px"><strong>📌 تكليفات مرفوعة على المنصة:</strong>${platTasks.map(i=>`<div style="margin-top:4px">• <b>${esc(i.subject)}</b>: ${esc(i.title)} ${dlBadge(i.deadline)} <a href="${safeHref(i.viewLink)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-color)">فتح الملف ↗</a></div>`).join('')}</div>`:'';

  const list=personalTasks.filter(t=>{
    if(activeTaskFilter==='pending')return !t.done;
    if(activeTaskFilter==='done')return t.done;
    return true;
  });
  $('personalTasksList').innerHTML=list.length?list.map(t=>{
    const pCol=t.priority==='عاجل'?'badge-urgent':t.priority==='متوسط'?'badge-lec':'badge-ok';
    return `<div class="ev" style="${t.done?'opacity:.6':''}">
      <div style="display:flex;align-items:center;gap:10px">
        <button type="button" class="done-btn ${t.done?'on':''}" style="border:1px solid var(--border-col);border-radius:6px;padding:4px 9px;cursor:pointer" onclick="togglePersonalTask('${safeId(t.id)}')">✔</button>
        <div>
          <b style="${t.done?'text-decoration:line-through':''}">${esc(t.title)}</b><br>
          <small>${esc(t.course)} • تسليم: ${esc(t.date)}</small>
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="badge-soft ${pCol}">${esc(t.priority)}</span>
        <button type="button" class="btn btn-danger sm" onclick="deletePersonalTask('${safeId(t.id)}')">🗑️</button>
      </div>
    </div>`;
  }).join(''):'<p style="text-align:center;color:#888">لا توجد مهام في هذا التصنيف.</p>';

  $('quickNotesArea').value=ld('fci_quick_notes','');
  renderSavedFileNotesList();
}
function setTaskFilter(f){
  activeTaskFilter=f;
  document.querySelectorAll('#taskFilterBar .pill-btn').forEach(b=>b.classList.toggle('active',b.dataset.tf===f));
  renderStudyHub();
}
$('addTaskForm').addEventListener('submit',e=>{
  e.preventDefault();
  personalTasks.unshift({
    id:'pt_'+Date.now(),
    title:$('taskTitleIn').value.trim(),
    course:$('taskCourseIn').value.trim(),
    date:$('taskDateIn').value,
    priority:$('taskPrioIn').value,
    done:false
  });
  sv('fci_personal_tasks',personalTasks);
  $('taskTitleIn').value='';$('taskCourseIn').value='';
  renderStudyHub();
  toast('تمت إضافة المهمة بنجاح ✅');
});
function togglePersonalTask(id){
  const t=personalTasks.find(x=>x.id===id);
  if(t){t.done=!t.done;sv('fci_personal_tasks',personalTasks);renderStudyHub()}
}
function deletePersonalTask(id){
  personalTasks=personalTasks.filter(x=>x.id!==id);
  sv('fci_personal_tasks',personalTasks);
  renderStudyHub();
}
$('quickNotesArea').addEventListener('input',e=>sv('fci_quick_notes',e.target.value));
function copyQuickNotes(){copyText($('quickNotesArea').value)}

/* ملاحظات الملفات الفردية (إصلاح openNote) */
function openNote(id){
  const m=getDB().find(x=>x.id===id);
  const notes=ld('fci_notes',{});
  const cur=notes[id]||'';
  tool(`<h3>📝 ملاحظة خاصة على الملف</h3><p style="font-size:13px;color:#888;margin:0 0 8px">${esc(m?m.subject+' — '+m.title:'ملف دراسي')}</p><textarea id="fileNoteInput" class="form-input" rows="5" placeholder="اكتب ملاحظاتك أو النقاط المهمة في هذا الملف...">${esc(cur)}</textarea><div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="btn" style="flex:1" onclick="saveFileNote('${safeId(id)}')">💾 حفظ الملاحظة</button><button type="button" class="btn btn-warning" onclick="deleteFileNote('${safeId(id)}')">مسح</button></div>`);
}
function saveFileNote(id){
  const notes=ld('fci_notes',{});
  const v=$('fileNoteInput').value.trim();
  if(v)notes[id]=v;else delete notes[id];
  sv('fci_notes',notes);
  closeModal('toolModal');
  if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();
  if(!$('studyView').hidden)renderSavedFileNotesList();
  if(RD_CUR&&RD_CUR.id===id)syncReaderUI();
  toast('تم حفظ ملاحظتك على الملف 📝');
}
function deleteFileNote(id){
  const notes=ld('fci_notes',{});
  delete notes[id];
  sv('fci_notes',notes);
  closeModal('toolModal');
  if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();
  if(!$('studyView').hidden)renderSavedFileNotesList();
  if(RD_CUR&&RD_CUR.id===id)syncReaderUI();
  toast('تم مسح الملاحظة');
}
function renderSavedFileNotesList(){
  const notes=ld('fci_notes',{});
  const keys=Object.keys(notes);
  const box=$('savedFileNotesBox');
  if(!box)return;
  if(!keys.length){box.innerHTML='';return}
  box.innerHTML=`<h4 style="margin:10px 0 6px;font-size:13px">📌 ملاحظاتك المحفوظة على ملفات المواد (${keys.length}):</h4>`+keys.map(id=>{
    const m=getDB().find(x=>x.id===id);
    return `<div class="comment-item"><span><b>${esc(m?m.title:'ملف')}:</b> ${esc(notes[id])}</span><button type="button" class="btn sm" onclick="openNote('${safeId(id)}')">✏️</button></div>`;
  }).join('');
}

/* مؤقت البومودورو */
function playPomoBeep(){
  if(!pomoSound)return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    const ctx=new Ctx(),osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(660,ctx.currentTime);
    g.gain.setValueAtTime(0.12,ctx.currentTime);
    osc.connect(g);g.connect(ctx.destination);
    osc.start();osc.stop(ctx.currentTime+0.35);
  }catch(e){}
}
const POMO_CIRC=2*Math.PI*75;
function updatePomoUI(){
  const m=String(Math.floor(pomoSeconds/60)).padStart(2,'0');
  const s=String(pomoSeconds%60).padStart(2,'0');
  $('pomoTimerDisplay').textContent=`${m}:${s}`;
  const circle=$('pomoProgCircle');
  if(circle){
    const total=Math.max(1,pomoMode*60);
    const ratio=Math.max(0,Math.min(1,pomoSeconds/total));
    circle.style.strokeDashoffset=String(POMO_CIRC*(1-ratio));
    circle.style.stroke=pomoMode===25?'var(--accent)':'var(--success)';
  }
}
function setPomoMode(mins){
  clearInterval(pomoInterval);pomoRunning=false;pomoMode=mins;pomoSeconds=mins*60;
  $('pomoStartBtn').textContent='▶ ابدأ';
  $('pomoStatusLabel').textContent='جاهز للبدء';
  document.querySelectorAll('[data-pomo]').forEach(b=>b.classList.toggle('active',Number(b.dataset.pomo)===mins));
  updatePomoUI();
}
function togglePomoTimer(){
  if(pomoRunning){
    clearInterval(pomoInterval);pomoRunning=false;
    $('pomoStartBtn').textContent='▶ استئناف';
    $('pomoStatusLabel').textContent='المؤقت متوقف مؤقتاً';
  }else{
    pomoRunning=true;
    $('pomoStartBtn').textContent='⏸ إيقاف مؤقت';
    $('pomoStatusLabel').textContent='جلسة تركيز نشطة الآن... بالتوفيق!';
    clearInterval(pomoInterval);
    pomoInterval=setInterval(()=>{
      if(pomoSeconds>0){pomoSeconds--;updatePomoUI()}
      else{
        clearInterval(pomoInterval);pomoRunning=false;
        $('pomoStartBtn').textContent='▶ ابدأ';
        playPomoBeep();
        if(pomoMode===25){
          studyStats.minutes+=25;studyStats.sessions+=1;sv('fci_study_stats',studyStats);
          renderStudyHub();
          toast('🎉 عاش! أتممت جلسة مذاكرة 25 دقيقة!');
        }else toast('انتهت فترة الراحة، جاهز لجلسة جديدة!');
        pomoSeconds=pomoMode*60;updatePomoUI();
      }
    },1000);
  }
}
function resetPomoTimer(){
  clearInterval(pomoInterval);pomoRunning=false;pomoSeconds=pomoMode*60;
  $('pomoStartBtn').textContent='▶ ابدأ';
  $('pomoStatusLabel').textContent='تمت إعادة ضبط المؤقت';
  updatePomoUI();
}
function togglePomoSound(){
  pomoSound=!pomoSound;
  $('pomoSoundBtn').textContent=pomoSound?'🔔 الصوت مفعل':'🔕 الصوت صامت';
}


/* ===== الإدارة وربط Google Sheets ===== */
$('adminUsername').addEventListener('keydown',e=>{if(e.key==='Enter')$('adminPassword').focus()});
$('adminPassword').addEventListener('keydown',e=>{if(e.key==='Enter')checkLogin()});
if($('adminOtp'))$('adminOtp').addEventListener('keydown',e=>{if(e.key==='Enter')checkLogin()});
function updateStats(){
  const db=getDB();$('statTotal').textContent=db.length;
  $('statLecSec').textContent=db.filter(i=>i.type==='محاضرات'||i.type==='سكاشن').length;
  $('statSubs').textContent=new Set(db.map(i=>i.subject)).size;$('statExams').textContent=db.filter(i=>i.type==='امتحانات سابقة').length;
  $('statViews').textContent=db.reduce((a,i)=>a+(i.views||0),0)+' / '+db.reduce((a,i)=>a+(i.downloads||0),0);
}
function openEdit(id){
  const m=getDB().find(x=>x.id===id);if(!m)return;
  $('editId').value=id;$('editSubject').value=m.subject;$('editTitle').value=m.title;$('editLink').value=m.viewLink;$('editWeek').value=m.week||'عام';$('editType').value=m.type;$('editTrack').value=m.track;$('editDept').value=m.dept;$('editLevel').value=m.level;$('editSem').value=m.semester;$('editTags').value=m.tags||'';$('editDoctor').value=m.doctor||'';$('editDeadline').value=m.deadline||'';$('editModal').style.display='flex';
}
function exportBackup(){
  const b=new Blob([JSON.stringify({db:getDB(),reports:getReps(),ann:ld('fci_ann','')},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='fci-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href);
}
function renderReports(){
  const r=getReps();$('reportsSection').style.display=r.length?'block':'none';
  $('reportsList').innerHTML=r.map(x=>`<div class="report-item"><span>${esc(x.subject)} - ${esc(x.title)}</span><button class="btn btn-warning" style="padding:4px 10px" data-rid="${esc(x.id)}">إخفاء</button></div>`).join('');
}

/* ===== عرض المواد والملفات ===== */
let favs=ld('fci_favs',[]),done=ld('fci_done',[]),activeSub=null,activeType=null,Q='',W='',TF='',QF='all';
function setQuickFilter(f){
  QF=f||'all';
  document.querySelectorAll('#quickFilterBar .qf-pill').forEach(b=>b.classList.toggle('active',b.dataset.qf===QF));
  render();
}
function resetStudentFilters(){
  Q='';W='';TF='';QF='all';activeType=null;
  if($('searchBox'))$('searchBox').value='';
  if($('weekFilter'))$('weekFilter').value='';
  if($('typeFilter'))$('typeFilter').value='';
  render();
}
function jumpToPath(track,dept,level,semester,subject,type){
  const normIt=normOneItem({track,dept,level,semester,type});
  userPath={track:normIt.track,dept:normIt.dept==='مشترك'&&normIt.track==='خاص'?DEPT_SPC[0]:normIt.dept,level:normIt.level,semester:normIt.semester};
  Q='';W='';TF='';QF='all';
  if($('searchBox'))$('searchBox').value='';
  if($('weekFilter'))$('weekFilter').value='';
  if($('typeFilter'))$('typeFilter').value='';
  activeSub=subject||null;
  activeType=type||null;
  switchMainView('studentFlow');
  showResults(normIt.semester);
}
function showAddJumpBanner(info){
  const el=$('addJumpBanner');if(!el||!info)return;
  const it=normOneItem(info);
  window._lastAddedPath=it;
  const pathText=[trackLabel(it.track),it.dept&&it.dept!=='مشترك'?it.dept:'مشترك',it.level,it.semester,it.subject,it.type].filter(Boolean).join(' › ');
  el.innerHTML=`<div class="jump-banner"><div><b>✅ تم الحفظ في المسار:</b><br><small>${esc(pathText)}</small></div><button type="button" class="btn btn-success sm" onclick="jumpToLastAdded()">👁️ افتح مكانه في الموقع الآن</button></div>`;
}
function jumpToLastAdded(){
  const it=window._lastAddedPath;if(!it)return;
  jumpToPath(it.track,it.dept,it.level,it.semester,it.subject,it.type);
}
function trackRecent(id){
  if(!id)return;
  let arr=ld('fci_recent',[]).filter(x=>x!==id);
  arr.unshift(id);
  if(arr.length>4)arr=arr.slice(0,4);
  sv('fci_recent',arr);
}
function clearRecent(){sv('fci_recent',[]);render()}
function renderRecentStrip(all){
  const el=$('recentStrip');if(!el)return;
  const ids=ld('fci_recent',[]),map={};
  all.forEach(i=>map[i.id]=i);
  const rec=ids.map(id=>map[id]).filter(Boolean);
  if(!rec.length){el.innerHTML='';return}
  el.innerHTML=`<div class="recent-strip"><div class="recent-head"><span>🕒 كمّل مذاكرة (آخر ملفات فتحتها)</span><button type="button" class="recent-clear" onclick="clearRecent()">مسح ✕</button></div><div class="recent-chips">${rec.map(m=>`<button type="button" class="recent-chip" onclick="openReader('${safeId(m.id)}')"><span class="rc-ic">${getIcon(m.viewLink)}</span><span class="rc-title">${esc(m.title)}</span><small>• ${esc(m.subject)}</small></button>`).join('')}</div></div>`;
}
function toggleAllCategoryDone(sub,type){
  const p=userPath,unified=p.track==='عام'&&p.dept==='مشترك'&&COMMON_LEVELS.indexOf(p.level)>-1;
  const ids=getDB().filter(i=>i.track===p.track&&i.level===p.level&&i.semester===p.semester&&(i.dept===p.dept||i.dept==='مشترك'||unified)&&i.subject===sub&&i.type===type&&(isAdmin||(!i.hidden&&(!i.publishAt||+i.publishAt<=Date.now())))).map(i=>i.id);
  if(!ids.length)return;
  const allDone=ids.every(id=>done.includes(id));
  if(allDone){done=done.filter(id=>!ids.includes(id))}
  else{ids.forEach(id=>{if(!done.includes(id))done.push(id)})}
  sv('fci_done',done);render();
  toast(allDone?'تم إلغاء تحديد ملفات القسم':'تم تحديد كل ملفات القسم كمكتمل ✔');
}
const TYPE_ICONS={'محاضرات':'🎓','سكاشن':'🧪','ملخصات':'📝','امتحانات سابقة':'📄','تكليفات':'📌'};
const norm=t=>String(t||'').toLowerCase().replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
$('searchBox').addEventListener('input',debounce(e=>{Q=norm(e.target.value.trim());render()},120));
$('weekFilter').addEventListener('change',e=>{W=e.target.value;render()});
$('typeFilter').addEventListener('change',e=>{TF=e.target.value;activeType=TF||null;render()});

function render(){
  const saved={},savedIds=ld('fci_saved',[]);document.querySelectorAll('#cards input').forEach(i=>saved[i.id]=i.value);
  const p=userPath,unified=p.track==='عام'&&p.dept==='مشترك'&&COMMON_LEVELS.indexOf(p.level)>-1,notes=ld('fci_notes',{});
  const all=getDB().filter(i=>i.track===p.track&&i.level===p.level&&i.semester===p.semester&&(i.dept===p.dept||i.dept==='مشترك'||unified)&&(isAdmin||(!i.hidden&&(!i.publishAt||+i.publishAt<=Date.now()))));
  const semDone=all.filter(i=>done.includes(i.id)).length,semPct=all.length?Math.round(semDone/all.length*100):0;
  const newWeekCount=all.filter(i=>Date.now()-i.timestamp<7*864e5).length;
  if($('qfNewBtn'))$('qfNewBtn').textContent=newWeekCount?`🆕 جديد الأسبوع (${newWeekCount})`:'🆕 جديد الأسبوع';
  const totalSubsCount=new Set(all.map(i=>i.subject)).size;
  if($('semProg'))$('semProg').innerHTML=all.length?`<div class="sem-prog-box"><div class="sem-prog-head"><span>🎯 إنجازك في الترم: ${semDone} من ${all.length} ملف (${totalSubsCount} مادة)</span><span class="sem-prog-pct">${semPct}%</span></div><div class="pbar" style="margin:0"><i style="width:${semPct}%"></i></div></div>`:'';
  renderRecentStrip(all);
  const soon=all.filter(i=>{if(i.type!=='تكليفات'||!i.deadline||done.includes(i.id))return false;const e=new Date(i.deadline+'T23:59:59'),n=new Date();return e>=n&&e-n<7*864e5});
  $('upcoming').innerHTML=evBanner()+(soon.length?`<div class="upcoming"><strong>⏰ تكليفات قريبة:</strong>${soon.map(i=>`<div>• ${esc(i.subject)} - ${esc(i.title)} ${dlBadge(i.deadline)}</div>`).join('')}</div>`:'');
  document.querySelectorAll('#quickFilterBar .qf-pill').forEach(b=>b.classList.toggle('active',b.dataset.qf===QF));
  let db=all;
  if(QF==='new')db=db.filter(i=>Date.now()-i.timestamp<7*864e5);
  else if(QF==='todo')db=db.filter(i=>!done.includes(i.id));
  else if(QF==='saved')db=db.filter(i=>savedIds.includes(i.id));
  else if(QF==='noted')db=db.filter(i=>!!notes[i.id]);
  if(Q)db=db.filter(i=>norm(i.title+' '+i.subject+' '+(i.tags||'')+' '+(i.doctor||'')).includes(Q));
  if(W)db=db.filter(i=>i.week===W);
  if(TF)db=db.filter(i=>i.type===TF);
  const box=$('cards');
  if(!db.length){
    box.classList.remove('single-tab');
    if(isLoadingDB){box.innerHTML='<div class="skel-grid" style="grid-column:1/-1"><div class="skel-card"></div><div class="skel-card"></div><div class="skel-card"></div><div class="skel-card"></div></div>';return}
    if(all.length){
      box.innerHTML=`<div class="cat-empty-hint" style="grid-column:1/-1">يوجد <b>${all.length}</b> ملف في هذا المسار، لكن الفلاتر أو البحث الحالي تخفيها.<div style="margin-top:10px"><button type="button" class="btn sm" onclick="resetStudentFilters()">↺ إلغاء الفلاتر وإظهار كل الملفات</button></div></div>`;
      return;
    }
    const otherPathsHint=isAdmin&&getDB().length?`<div style="margin-top:10px"><button type="button" class="btn btn-warning sm" onclick="switchMainView('adminDashboard');adminTab('files')">🗂 عرض كل ملفات المنصة (${getDB().length})</button></div>`:'';
    box.innerHTML=`<div class="cat-empty-hint" style="grid-column:1/-1">لا توجد ملفات مرفوعة حالياً في هذا المسار.${otherPathsHint}</div>`;
    return;
  }
  const g={};
  db.forEach(i=>{(g[i.subject]=g[i.subject]||{});(g[i.subject][i.type]=g[i.subject][i.type]||[]).push(i)});
  const subs=Object.keys(g).sort((a,b)=>(favs.includes(b)-favs.includes(a))||a.localeCompare(b,'ar'));
  const focused=(activeSub&&subs.includes(activeSub))?activeSub:null;
  box.classList.toggle('single-tab',!!focused);
  const shownSubs=focused?[focused]:subs;
  box.innerHTML=shownSubs.map(sub=>{
    const isOpen=focused===sub,items=all.filter(i=>i.subject===sub),doc=all.filter(i=>i.subject===sub&&i.doctor).sort((x,y)=>y.timestamp-x.timestamp).map(i=>i.doctor)[0],dn=items.filter(i=>done.includes(i.id)).length,pct=items.length?Math.round(dn/items.length*100):0;
    const availTypes=TYPES.filter(t=>(g[sub][t]||[]).length>0);
    if(!isOpen){
      const chips=availTypes.map(t=>`<span class="sub-chip">${TYPE_ICONS[t]||'📁'} ${esc(t)} (${g[sub][t].length})</span>`).join('');
      return `<div class="material-card"><button class="subject-btn" data-act="tog" data-s="${esc(sub)}"><div class="sl"><span class="fav-btn ${favs.includes(sub)?'active':''}" data-act="fav" data-s="${esc(sub)}" role="button" aria-label="تثبيت">⭐</span><span class="fav-btn" data-act="sharesub" data-s="${esc(sub)}" role="button" aria-label="مشاركة المادة" style="font-size:18px">🔗</span><span>📚 ${esc(sub)}${doc?` <small style="font-weight:normal;opacity:.85;margin-right:6px">👨‍🏫 ${esc(doc)}</small>`:''}</span></div><span><span class="prog">${dn}/${items.length}</span>▼</span></button><div class="sub-mini-pbar"><i style="width:${pct}%"></i></div>${chips?`<div class="sub-card-chips">${chips}</div>`:''}</div>`;
    }
    const subTip=findSubjectTip(sub),subQuizzes=getSubjectQuizzes(sub),subQa=getSubjectQa(sub);
    let h=`<div class="material-card"><button class="subject-btn" data-act="tog" data-s="${esc(sub)}"><div class="sl"><span class="fav-btn ${favs.includes(sub)?'active':''}" data-act="fav" data-s="${esc(sub)}" role="button" aria-label="تثبيت">⭐</span><span class="fav-btn" data-act="sharesub" data-s="${esc(sub)}" role="button" aria-label="مشاركة المادة" style="font-size:18px">🔗</span><span>📚 ${esc(sub)}${doc?` <small style="font-weight:normal;opacity:.85;margin-right:6px">👨‍🏫 ${esc(doc)}</small>`:''}</span></div><span><span class="prog">${dn}/${items.length}</span><span class="sub-close-pill" data-act="closeSub" role="button" aria-label="إغلاق المادة">✕ إغلاق</span></span></button><div class="subject-content"><div class="pbar"><i style="width:${pct}%"></i></div>`;
    h+=`<div class="sub-tools-bar"><button type="button" class="btn sm" data-act="aiSub" data-s="${esc(sub)}">🤖 اسأل Gemini Pro عن المادة</button><button type="button" class="btn btn-warning sm" data-act="aiQuizSub" data-s="${esc(sub)}">⚡ ولّد كويز MCQ</button>${isAdmin?`<button type="button" class="btn btn-ghost sm" data-act="tipEdit" data-s="${esc(sub)}">💡 ${subTip?'تعديل دليل المذاكرة':'أضف نصيحة الدفعات الأكبر'}</button>`:''}</div>`;
    if(subTip){
      h+=`<details class="senior-tip-box"><summary style="cursor:pointer;font-weight:800">💡 إزاي تذاكر «${esc(sub)}»؟ — نصائح الدفعات الأكبر</summary><div style="margin-top:8px;white-space:pre-line;line-height:1.75">${esc(subTip.guide)}</div>${subTip.resources?`<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border-strong)"><b>📺 أفضل القنوات والمراجع:</b><div style="white-space:pre-line;margin-top:4px">${esc(subTip.resources)}</div></div>`:''}</details>`;
    }
    const isSpecialTab=(activeType==='__qa__'||activeType==='__quiz__');
    const focusedType=isSpecialTab?activeType:((activeType&&TYPES.includes(activeType))?activeType:((TF&&TYPES.includes(TF))?TF:(availTypes.length===1?availTypes[0]:null)));
    h+=`<div class="cat-tabs" role="tablist">`+TYPES.map(t=>{
      const cnt=(g[sub][t]||[]).length,on=focusedType===t;
      return `<button type="button" role="tab" aria-selected="${on}" class="cat-tab${on?' active':''}${!cnt?' empty':''}" data-act="togType" data-s="${esc(t)}"><span>${TYPE_ICONS[t]||'📁'}</span><span>${esc(t)}</span><span class="cat-count">${cnt}</span></button>`;
    }).join('')+`<button type="button" role="tab" aria-selected="${focusedType==='__quiz__'}" class="cat-tab${focusedType==='__quiz__'?' active':''}${!subQuizzes.length?' empty':''}" data-act="togType" data-s="__quiz__"><span>🧪</span><span>اختبارات MCQ</span><span class="cat-count">${subQuizzes.length}</span></button><button type="button" role="tab" aria-selected="${focusedType==='__qa__'}" class="cat-tab${focusedType==='__qa__'?' active':''}" data-act="togType" data-s="__qa__"><span>💬</span><span>أسئلة Q&amp;A</span><span class="cat-count">${subQa.length}</span></button></div>`;
    if(focusedType==='__qa__'){
      return h+renderSubjectQaPanel(sub)+'</div></div>';
    }
    if(focusedType==='__quiz__'){
      const scores=ld('fci_quiz_scores',{});
      const qHtml=subQuizzes.length?subQuizzes.map(qz=>`<div class="ev"><div><b>🧪 ${esc(qz.title)}</b> ${scores[qz.id]!=null?`<span class="badge-soft badge-ok">أعلى درجة: ${scores[qz.id]}%</span>`:''}<br><small>${(qz.questions||[]).length} سؤال • ⏱ ${qz.minutes||10} دقيقة</small></div><button type="button" class="btn sm" onclick="startSavedQuiz('${safeId(qz.id)}')">▶ ابدأ الاختبار</button></div>`).join(''):`<div class="cat-empty-hint">مفيش اختبارات محفوظة في المادة دي لسه — تقدر تولّد كويز فوري بالذكاء الاصطناعي من الزرار اللي فوق ⚡</div>`;
      return h+qHtml+'</div></div>';
    }
    if(!focusedType){
      h+=`<div class="cat-empty-hint">اضغط على القسم (محاضرات، سكاشن، ملخصات، امتحانات سابقة، تكليفات، اختبارات MCQ، أو أسئلة Q&amp;A) لعرضه</div>`;
      return h+'</div></div>';
    }
    const list=(g[sub][focusedType]||[]).slice().sort((a,b)=>(WEEKS.indexOf(a.week)-WEEKS.indexOf(b.week))||a.title.localeCompare(b.title,'ar',{numeric:true}));
    const allCatDone=list.length&&list.every(m=>done.includes(m.id));
    h+=`<div class="cat-active-head"><span>${TYPE_ICONS[focusedType]||'📁'} ${esc(focusedType)} (${list.length})</span><div style="display:flex;gap:6px;flex-wrap:wrap">${list.length?`<button type="button" class="btn sm ${allCatDone?'btn-ghost':'btn-success'}" data-act="doneAllCat" data-s="${esc(sub)}" data-t="${esc(focusedType)}">${allCatDone?'↺ إلغاء الكل':'✔ تحديد الكل'}</button>`:''}<button type="button" class="btn sm btn-danger" data-act="closeType">✕ إغلاق القسم</button></div></div>`;
    if(!list.length){
      h+=`<div class="cat-empty-hint">لا توجد ملفات في قسم «${esc(focusedType)}» حالياً.</div>`;
      return h+'</div></div>';
    }
    list.forEach(m=>{
      const isNew=Date.now()-m.timestamp<7*864e5,dn2=done.includes(m.id);
      const mid=safeId(m.id);
      const cm=(m.comments||[]).map((c,i)=>{c=typeof c==='string'?{n:'طالب',t:c}:c;return `<div class="comment-item"><span>💬 <b>${esc(c.n)}:</b> ${esc(c.t)}</span>${isAdmin?`<button class="delete-btn" style="border:0;border-radius:4px;cursor:pointer" data-act="delc" data-id="${mid}" data-i="${i}" aria-label="حذف تعليق">🗑️</button>`:''}</div>`}).join('');
      h+=`<div class="material-item${dn2?' done':''}"><div class="item-header"><span class="item-title">${getIcon(m.viewLink)} ${esc(m.title)} ${isNew?'<span class="new-badge">جديد</span>':''} ${m.type==='تكليفات'?dlBadge(m.deadline):''}</span>
<div class="action-links">
<button class="done-btn ${dn2?'on':''}" data-act="done" data-id="${mid}" aria-label="تم">✔</button>
<button class="report-btn" data-act="rep" data-id="${mid}" aria-label="إبلاغ">⚠</button>
<button class="open-btn" data-act="read" data-id="${mid}" aria-label="قراءة">📖</button>
<button class="note-btn save-btn ${savedIds.indexOf(m.id)>-1?'on':''}" data-act="save" data-id="${mid}" aria-label="حفظ">🔖</button>
<button class="note-btn ${notes[m.id]?'on':''}" data-act="note" data-id="${mid}" aria-label="ملاحظة">📝</button>
<button class="share-btn" data-act="share" data-id="${mid}" aria-label="مشاركة">🔗</button>
<a href="${safeHref(m.viewLink)}" target="_blank" rel="noopener noreferrer" class="open-btn" data-act="view" data-id="${mid}">عرض</a>
<a href="${safeHref(getDL(m.viewLink))}" target="_blank" rel="noopener noreferrer" class="download-btn" data-act="dl" data-id="${mid}">تحميل</a>
${isAdmin?`<button class="edit-btn" data-act="copy" data-id="${mid}" aria-label="نسخ">📋</button><button class="edit-btn" data-act="edit" data-id="${mid}" aria-label="تعديل">✏️</button><button class="delete-btn" data-act="del" data-id="${mid}" aria-label="حذف">🗑️</button>`:''}
</div></div>
<div class="item-meta"><span>📅 ${esc(m.week||'عام')}</span><span>🗓 ${esc(m.dateAdded||'')}</span>${m.contributor?`<span>🤝 مساهمة: ${esc(m.contributor)}</span>`:''}${m.by?`<span>✍ ${esc(m.by)}</span>`:''}<span>👁 ${m.views||0}</span><span>⬇ ${m.downloads||0}</span>${m.dept==='مشترك'?'<span>🌐 مشترك</span>':''}${String(m.tags||'').split(',').map(t=>t.trim()).filter(Boolean).map(t=>`<span class="tag" data-act="tag" data-s="${esc(t)}">#${esc(t)}</span>`).join('')}</div>
${notes[m.id]?`<div class="comment-item" style="border-right:3px solid #16a085"><span>📝 <b>ملاحظتك:</b> ${esc(notes[m.id])}</span></div>`:''}
<div class="comments-section"><div>${cm}</div><div class="comment-input-box"><input type="text" id="cn-${mid}" class="comment-input" style="max-width:100px;flex:none" placeholder="اسمك" maxlength="20"><input type="text" id="cm-${mid}" class="comment-input" placeholder="اكتب تعليقك..." maxlength="300"><button class="btn" style="padding:5px 10px;font-size:12px" data-act="cmt" data-id="${mid}">إرسال</button></div></div></div>`;
    });
    return h+'</div></div>';
  }).join('');
  const nm=ld('fci_name','');
  document.querySelectorAll('#cards input[id^="cn-"]').forEach(i=>i.value=saved[i.id]??nm);
  document.querySelectorAll('#cards input[id^="cm-"]').forEach(i=>{if(saved[i.id])i.value=saved[i.id]});
}
function toggleIn(arr,v,key){const i=arr.indexOf(v);i>-1?arr.splice(i,1):arr.push(v);sv(key,arr);return i===-1}

/* ===== الاتصال بـ Google Sheets API ===== */
const API='https://script.google.com/macros/s/AKfycbyS2hyRuwqBDB5IXxlyCqM2Kzqb-j6jBDpmxlS7T4_ho1Gn1o7xSEttfcqIb1ZuthxrdQ/exec';
let DB=fixItems(ld('fci_db',[])),REPS=[],ANN=ld('fci_ann',''),TOK='',ME='',OWNER=false,EVENTS=ld('fci_ev',[]),SCHED=ld('fci_sched',[]),QUIZZES=ld('fci_quizzes',[]),QA_LIST=ld('fci_qa',[]),TIPS=ld('fci_tips',[]),ROADMAP=ld('fci_roadmap',[]),AI_ENABLED=false,AI_MODEL='';
const hasApi=()=>/^https?:/.test(API);
async function api(a,d={}){
  if(!hasApi())throw new Error('حط رابط الـ API في أول السكريبت');
  const body=Object.assign({action:a},TOK?{tok:TOK}:{},d);
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
  const txt=await r.text();let j;
  try{j=JSON.parse(txt)}catch(e){throw new Error('السيرفر رجّع رد غير متوقع — تأكد من تشغيل authorize() وعمل New Deployment في Apps Script')}
  if(j.error){
    if(/انتهت صلاحية الجلسة/.test(j.error)&&isAdmin){
      isAdmin=false;TOK='';ME='';OWNER=false;
      try{sessionStorage.removeItem('fci_adm_tok')}catch(x){}
      $('adminBtn').style.display='block';$('logoutBtn').style.display='none';
      showSection('adminLogin');
    }
    throw new Error(j.error);
  }
  return j;
}
function syncLocalAdminCounts(counts){
  const db=getDB();
  ADM_CNT.rep=getReps().length;
  ADM_CNT.sch=db.filter(i=>i.publishAt&&+i.publishAt>Date.now()).length;
  ADM_CNT.hid=db.filter(i=>i.hidden).length;
  ADM_CNT.com=db.reduce((a,i)=>a+(i.comments||[]).length,0);
  if(counts){
    ADM_CNT.req=counts.req;ADM_CNT.hl=counts.hl;ADM_CNT.ct=counts.ct;
    ADM_CNT.at=Date.now();
  }
  const tot=(ADM_CNT.rep||0)+(ADM_CNT.req||0)+(ADM_CNT.ct||0);
  if($('repBadge'))$('repBadge').textContent=tot||'';
}
function apply(j){
  if(!j||!j.items)return;DB=fixItems(j.items);REPS=j.reports||[];ANN=j.ann||'';EVENTS=j.events||EVENTS;sv('fci_ev',EVENTS);SCHED=j.schedule||SCHED;sv('fci_sched',SCHED);sv('fci_db',DB);sv('fci_ann',ANN);
  if(Array.isArray(j.quizzes)){QUIZZES=j.quizzes;sv('fci_quizzes',QUIZZES)}
  if(Array.isArray(j.qa)){QA_LIST=j.qa;sv('fci_qa',QA_LIST)}
  if(Array.isArray(j.tips)){TIPS=j.tips;sv('fci_tips',TIPS)}
  if(Array.isArray(j.roadmap)){ROADMAP=j.roadmap;sv('fci_roadmap',ROADMAP)}
  if(typeof j.aiEnabled==='boolean')AI_ENABLED=j.aiEnabled;
  if(typeof j.aiModel==='string')AI_MODEL=j.aiModel;
  if(j.counts)syncLocalAdminCounts(j.counts);
  renderNotif();loadAnnouncement();updateAddDatalists();
  if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();
  if(!$('scheduleView').hidden)renderScheduleHub();
  if(!$('studyView').hidden)renderStudyHub();
  if(!$('aiView').hidden)renderAiHub();
  if(!$('adminDashboard').hidden){updateStats();renderReports();if(!$('ap-files').hidden)renderAdminFiles()}
}
let lastRefreshAt=0,isLoadingDB=false;
async function refresh(manual){
  if(manual!==true&&manual!=='force'&&Date.now()-lastRefreshAt<120000)return;
  const rBtn=$('refreshBtn');
  if(!DB.length){isLoadingDB=true;if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render()}
  if(rBtn)rBtn.classList.add('spinning');
  try{
    if(!hasApi())throw new Error('لسه مفيش رابط API');
    const j=(isAdmin&&TOK)?await api('adminsync'):await (await fetch(API+(API.includes('?')?'&':'?')+'_t='+Date.now(),{cache:'no-store'})).json();
    lastRefreshAt=Date.now();isLoadingDB=false;apply(j);if(manual===true)toast('تم التحديث ✅');
  }catch(e){
    isLoadingDB=false;
    if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();
    if(manual===true)toast('تعذر الاتصال، يتم عرض آخر نسخة محفوظة',1);
  }finally{
    if(rBtn)rBtn.classList.remove('spinning');
  }
}
async function act(a,d,msg){try{const j=await api(a,d);apply(j);if(j.msg||msg)toast(j.msg||msg);return j}catch(e){toast(e.message||'خطأ في الاتصال',1);return false}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
function loadAnnouncement(){const b=$('globalAnnouncement');if(ANN){b.textContent='📢 '+ANN;b.style.display='block'}else b.style.display='none'}
function saveAnnouncement(){act('ann',{text:$('announceInput').value.trim(),until:$('announceUntil').value},'تم النشر')}
function clearAnnouncement(){act('ann',{text:''},'تم الحذف')}
function applyAdminSessionUI(j){
  ME=j.name;OWNER=!!j.owner;isAdmin=true;
  $('adminHello').textContent='👤 '+ME+(OWNER?' • مالك':(j.scope?' • ممثل دفعة ('+j.scope.replace('|',' / ')+')':' • أدمن'));
  document.querySelectorAll('.owner-only').forEach(e=>e.style.display=OWNER?'':'none');
  $('adminBtn').style.display='none';$('logoutBtn').style.display='block';
}
let _loggingIn=false;
async function checkLogin(){
  if(_loggingIn)return;
  const nm=$('adminUsername').value.trim(),p=$('adminPassword').value;
  const otp=$('adminOtp')?$('adminOtp').value.trim():'';
  if(!nm||!p)return toast('اكتب اسم المشرف وكلمة المرور',1);
  const btn=$('adminLoginBtn');
  _loggingIn=true;
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري التحقق المشفّر...'}
  try{
    const j=await api('login',{name:nm,pass:p,otp});
    if(j.needOtp){
      if($('otpBox'))$('otpBox').hidden=false;
      if($('adminOtp')){$('adminOtp').value='';$('adminOtp').focus()}
      toast(j.msg||'اكتب كود Google Authenticator (6 أرقام)');
      return;
    }
    TOK=j.tok||'';
    applyAdminSessionUI(j);apply(j);
    try{
      sessionStorage.removeItem('fci_adm_sess');
      if(!$('adminRememberTab')||$('adminRememberTab').checked){
        sessionStorage.setItem('fci_adm_tok',JSON.stringify({tok:TOK,name:ME,owner:OWNER,scope:j.scope||''}));
      }else{
        sessionStorage.removeItem('fci_adm_tok');
      }
      sv('fci_last_adm_user',nm);
    }catch(e){}
    $('adminPassword').value='';
    if($('adminOtp'))$('adminOtp').value='';
    if($('otpBox'))$('otpBox').hidden=true;
    showSection('adminDashboard');toast('أهلاً '+ME+' 🛡️');
  }catch(e){TOK='';toast(e.message||'خطأ',1)}
  finally{_loggingIn=false;if(btn){btn.disabled=false;btn.textContent='دخول لوحة التحكم'}}
}
async function restoreAdminSession(){
  try{sessionStorage.removeItem('fci_adm_sess')}catch(e){}
  let s=null;try{s=JSON.parse(sessionStorage.getItem('fci_adm_tok'))}catch(e){}
  if(!s||!s.tok)return false;
  TOK=s.tok;
  applyAdminSessionUI(s);
  try{
    const j=await api('adminsync');
    apply(j);
    return true;
  }catch(e){
    isAdmin=false;TOK='';ME='';OWNER=false;
    $('adminBtn').style.display='block';$('logoutBtn').style.display='none';
    try{sessionStorage.removeItem('fci_adm_tok')}catch(x){}
    return false;
  }
}
function logoutAdmin(){
  if(TOK)api('logout').catch(()=>{});
  isAdmin=false;TOK='';ME='';OWNER=false;
  try{sessionStorage.removeItem('fci_adm_tok');sessionStorage.removeItem('fci_adm_sess')}catch(e){}
  $('adminBtn').style.display='block';$('logoutBtn').style.display='none';goHome();refresh('force');
  toast('تم تسجيل الخروج وإلغاء الجلسة بأمان 🔒');
}
async function openSecurityCenter(){
  if(!OWNER)return;
  try{
    const j=await api('secstatus'),s=j.sec||{};
    let score=70;
    if(!s.plainAdmins)score+=15;
    if(s.totpEnabled)score+=15;
    const evs=(s.events||[]).map(ev=>`<div class="sec-log-item"><span>🚫 <b>${esc(ev.u)}</b> — ${esc(ev.r)}</span><small style="color:var(--text-muted)">${esc(ev.t)}</small></div>`).join('');
    tool(`<h3>🛡️ مركز الأمان والحماية (Ultimate v12)</h3>
      <div class="sec-score-bar">
        <div class="sem-prog-head"><span>مستوى التحصين الحالي</span><span class="sem-prog-pct">${score}%</span></div>
        <div class="pbar" style="margin:0"><i style="width:${score}%"></i></div>
      </div>
      <div class="stat-grid" style="margin-bottom:12px">
        <div class="stat-card"><small>حسابات مشفّرة</small><div class="stat-num">${s.hashedAdmins||0}/${s.totalAdmins||0}</div><small>SHA-256 (600x)</small></div>
        <div class="stat-card"><small>المصادقة الثنائية</small><div class="stat-num">${s.totpEnabled?'مفعّلة':'مقفولة'}</div><small>Google Auth 2FA</small></div>
        <div class="stat-card"><small>محاولات فاشلة</small><div class="stat-num">${s.globalFails||0}</div><small>تأخير تصاعدي آمن</small></div>
      </div>
      <div class="acard" style="font-size:12.5px;line-height:1.85">
        <div>✅ كلمات المرور: <b>600-Round SHA-256 + Salt + Server Pepper</b> (الحد الأدنى 12 حرفاً)</div>
        <div>✅ الجلسات: <b>HMAC-SHA256 Token (6 ساعات) + إلغاء دائم في PropertiesService + إبطال فوري لكل أدمن</b></div>
        <div>✅ منع التخمين بدون قفل دائم: <b>تأخير تصاعدي (1–8 ثوانٍ) تحت LockService + تنبيه تليجرام</b></div>
        <div>✅ عزل الصلاحيات وحماية السيرفر: <b>عزل بيانات الأدمن الفرعي + قصر درايف على المالك + منع SSRF</b></div>
        <div>⚠️ حدود Apps Script: <b>Rate Limiting عام للعملية لعدم توفر IP موثوق، وCSP يحتوي unsafe-inline</b></div>
        <div>${s.lockdown?'🔒 <b>وضع الطوارئ (القراءة فقط) مفعّل حالياً</b>':'🟢 الموقع في الوضع الطبيعي (القراءة والكتابة مفتوحة)'}</div>
      </div>
      ${s.plainAdmins>0?`<button type="button" class="btn btn-warning" style="width:100%;margin-bottom:8px" onclick="hashAllPasswords()">🔐 تشفير الـ ${s.plainAdmins} حساب القديم الآن</button>`:''}
      ${s.totpEnabled
        ?`<button type="button" class="btn btn-ghost" style="width:100%;margin-bottom:8px" onclick="disableTotp2FA()">🔓 إيقاف المصادقة الثنائية (2FA)</button>`
        :`<button type="button" class="btn btn-success" style="width:100%;margin-bottom:8px" onclick="startTotpSetup()">📲 تفعيل المصادقة الثنائية (Google Authenticator 2FA)</button>`}
      <button type="button" class="btn ${s.lockdown?'btn-success':'btn-warning'}" style="width:100%;margin-bottom:8px" onclick="toggleLockdown(${!s.lockdown})">${s.lockdown?'🔓 إيقاف وضع الطوارئ (فتح التعليقات والطلبات)':'🔒 تفعيل وضع الطوارئ (قراءة فقط ضد أي سبام)'}</button>
      <button type="button" class="btn btn-danger" style="width:100%;margin-bottom:10px" onclick="revokeAllSessions()">🚫 إنهاء كل الجلسات على جميع الأجهزة</button>
      <details><summary style="cursor:pointer;font-weight:700;font-size:13px">🕵️ سجل المحاولات الفاشلة (${(s.events||[]).length})</summary><div style="margin-top:8px">${evs||'<p style="font-size:12px;color:var(--text-muted)">لا توجد محاولات اختراق أو دخول فاشل مسجلة ✅</p>'}</div></details>`);
  }catch(e){toast(e.message||'خطأ',1)}
}
async function startTotpSetup(){
  try{
    const j=await api('totpinit');
    const qr='https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data='+encodeURIComponent(j.otpauth);
    tool(`<h3>📲 تفعيل Google Authenticator (2FA)</h3>
      <p style="font-size:12.5px;color:var(--text-muted);margin:0 0 8px">1) افتح تطبيق <b>Google Authenticator</b> أو <b>Authy</b> وامسح الكود ده (أو انسخ المفتاح السري):</p>
      <div class="qr-card">
        <div class="qr-frame"><img src="${esc(qr)}" alt="2FA QR"><small>FCI-Materials Owner 2FA</small></div>
        <code dir="ltr" style="font-size:13px;letter-spacing:2px;font-weight:800;word-break:break-all">${esc(j.secret)}</code>
      </div>
      <p style="font-size:12.5px;color:var(--text-muted);margin:10px 0 6px">2) اكتب الكود المكون من 6 أرقام اللي ظهر في التطبيق لتأكيد التفعيل:</p>
      <input id="totpVerifyCode" type="text" inputmode="numeric" maxlength="6" class="form-input otp-input" placeholder="000000" autocomplete="off">
      <div style="display:flex;gap:8px;margin-top:10px">
        <button type="button" class="btn btn-success" style="flex:1" onclick="confirmTotpEnable()">✅ تأكيد وتفعيل 2FA</button>
        <button type="button" class="btn btn-ghost" onclick="openSecurityCenter()">رجوع</button>
      </div>`);
  }catch(e){toast(e.message||'خطأ',1)}
}
async function confirmTotpEnable(){
  const otp=$('totpVerifyCode').value.trim();
  if(!/^\d{6}$/.test(otp))return toast('اكتب الكود المكون من 6 أرقام',1);
  try{const j=await api('totpenable',{otp});toast(j.msg||'تم التفعيل 🛡️');openSecurityCenter()}catch(e){toast(e.message||'خطأ',1)}
}
async function disableTotp2FA(){
  const otp=await askPrompt('🔓 اكتب كود Google Authenticator الحالي (6 أرقام) لإيقاف 2FA','','000000');
  if(!otp)return;
  try{const j=await api('totpdisable',{otp:otp.trim()});toast(j.msg||'تم الإيقاف');openSecurityCenter()}catch(e){toast(e.message||'خطأ',1)}
}
async function toggleLockdown(on){
  const msg=on?'تفعيل وضع الطوارئ (القراءة فقط)؟ الطلاب هيقدروا يفتحوا ويحملوا الملفات عادي، بس التعليقات والطلبات والمساهمات هتتوقف مؤقتاً.':'إلغاء وضع الطوارئ وإرجاع الموقع للوضع الطبيعي؟';
  if(!(await askConfirm(msg)))return;
  try{const j=await api('lockdown',{on});toast(j.msg||'تم');openSecurityCenter()}catch(e){toast(e.message||'خطأ',1)}
}
async function repairAllPaths(){
  if(!(await askConfirm('هيتم فحص كل ملفات قاعدة البيانات وتصحيح أي ملف مساره (النظام/القسم/الفرقة/الترم) متخالف عشان يظهر في مكانه الصح. نكمل؟')))return;
  await act('repairpaths',{});
}
async function hashAllPasswords(){
  try{const j=await api('hashall');toast(j.msg||'تم التشفير 🔐');openSecurityCenter()}catch(e){toast(e.message||'خطأ',1)}
}
async function revokeAllSessions(){
  if(!(await askConfirm('هيتم تسجيل خروج كل المشرفين على كل الأجهزة الأخرى فوراً (وجلستك الحالية هتتجدد). نكمل؟')))return;
  try{
    const j=await api('revokeall');
    if(j.tok){
      TOK=j.tok;
      try{if(sessionStorage.getItem('fci_adm_tok'))sessionStorage.setItem('fci_adm_tok',JSON.stringify({tok:TOK,name:ME,owner:OWNER,scope:''}))}catch(e){}
    }
    toast(j.msg||'تم إنهاء كل الجلسات ✅');openSecurityCenter();
  }catch(e){toast(e.message||'خطأ',1)}
}
async function saveMaterial(){
  const link=safeUrl($('addLink').value.trim());
  const item={track:$('addTrack').value,dept:$('addDept').value,level:$('addLevel').value,semester:$('addSemester').value,subject:$('addSubject').value.trim(),week:$('addWeek').value,type:$('addType').value,title:$('addTitle').value.trim(),viewLink:link,downloadLink:getDL(link),deadline:$('addDeadline').value,tags:$('addTags').value.trim(),doctor:$('addDoctor').value.trim(),publishAt:$('addPub').value?String(new Date($('addPub').value).getTime()):''};
  if(!item.subject||!item.title)return toast('أكمل الحقول!',1);
  if(!link)return toast('الرابط لازم يبدأ بـ https://',1);
  const dp=dupOf(link,item.title,item.subject);
  if(dp&&!(await askConfirm('فيه ملف مشابه بالفعل: «'+dp.title+'» ('+dp.subject+'). تضيفه برضه؟')))return;
  saveLastAddPath();
  const res=await act('add',{item},'تم النشر بنجاح ✅');
  if(res){
    showAddJumpBanner(item);
    ['addTitle','addLink','addDeadline','addTags','addPub'].forEach(i=>$(i).value='');
  }
}
async function deleteMat(id){if(await askConfirm('حذف هذا الملف؟'))act('del',{id},'مُسح')}
async function clearAllData(){
  if(!(await askConfirm('⚠️ تحذير: هيتم عمل نسخة احتياطية تلقائية على درايف ثم مسح كل الملفات نهائياً. متأكد؟')))return;
  const pw=await askPrompt('🔐 اكتب كلمة مرور المالك لتأكيد تصفير السيستم','','كلمة المرور...');
  if(!pw)return;
  act('clear',{confirmPass:pw},'تم التصفير (واتحفظت نسخة احتياطية على درايف)');
}
async function submitEdit(){
  const id=$('editId').value,t=$('editTitle').value.trim(),sb=$('editSubject').value.trim(),l=safeUrl($('editLink').value.trim());
  if(!t||!sb||!l)return toast('تأكد من الحقول والرابط',1);
  if(await act('edit',{id,fields:{title:t,subject:sb,viewLink:l,downloadLink:getDL(l),week:$('editWeek').value,type:$('editType').value,track:$('editTrack').value,dept:$('editDept').value,level:$('editLevel').value,semester:$('editSem').value,tags:$('editTags').value.trim(),doctor:$('editDoctor').value.trim(),deadline:$('editDeadline').value}},'عُدل'))closeModal('editModal');
}
function reportLink(id){act('report',{id},'تم الإبلاغ ⚠')}
$('importFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const j=JSON.parse(r.result);if(!Array.isArray(j.db))throw 0;act('import',{items:j.db},'تم الاسترجاع')}catch(x){toast('ملف غير صالح',1)}};
  r.readAsText(f);e.target.value='';
});
$('reportsList').addEventListener('click',e=>{const b=e.target.closest('[data-rid]');if(b)act('unreport',{id:b.dataset.rid})});
$('cards').addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;
  const a=el.dataset.act,id=el.dataset.id,s=el.dataset.s;
  if(a==='view'||a==='dl'){trackRecent(id);api('bump',{id,f:a==='dl'?'downloads':'views'}).catch(()=>{});return}
  if(a==='doneAllCat'){e.stopPropagation();return toggleAllCategoryDone(s,el.dataset.t)}
  if(a==='aiSub'){e.stopPropagation();return openAiForSubject(s,'tutor')}
  if(a==='aiQuizSub'){e.stopPropagation();return openAiForSubject(s,'quiz')}
  if(a==='tipEdit'){e.stopPropagation();return openTipEditor(s)}
  if(a==='qaAsk'){e.stopPropagation();return submitQaQuestion(s)}
  if(a==='closeSub'){e.stopPropagation();activeSub=null;activeType=null;return render()}
  if(a==='closeType'){e.stopPropagation();activeType=null;if(TF){TF='';$('typeFilter').value=''}return render()}
  if(a==='togType'){e.stopPropagation();if(TF&&TF!==s){TF='';$('typeFilter').value=''}activeType=(activeType===s)?null:s;return render()}
  if(a==='tog'){activeSub=(activeSub===s)?null:s;activeType=null;render();if(activeSub&&$('cards').getBoundingClientRect().top<80)$('cards').scrollIntoView({behavior:'smooth',block:'start'});return}
  if(a==='sharesub'){e.stopPropagation();return shareSub(s)}
  if(a==='fav'){e.stopPropagation();toggleIn(favs,s,'fci_favs');return render()}
  if(a==='done'){toggleIn(done,id,'fci_done');return render()}
  if(a==='save')return toggleSaved(id);
  if(a==='note')return openNote(id);
  if(a==='read')return openReader(id);
  if(a==='tag'){$('searchBox').value=s;Q=norm(s);return render()}
  if(a==='rep')return reportLink(id);
  if(a==='share'){
    const m=getDB().find(x=>x.id===id);if(!m)return;
    const su=safeUrl(m.viewLink);if(!su)return;
    if(navigator.share)navigator.share({title:m.title,text:m.subject+' - '+m.title,url:su}).catch(()=>{});else copyText(su);return;
  }
  if(a==='cmt'){
    const t=$('cm-'+id).value.trim(),n=$('cn-'+id).value.trim()||'طالب';if(!t)return;
    sv('fci_name',n==='طالب'?'':n);$('cm-'+id).value='';return act('comment',{id,n,t});
  }
  if(isAdmin){
    if(a==='copy')return openCopy(id);
    if(a==='edit')return openEdit(id);
    if(a==='del')return deleteMat(id);
    if(a==='delc')return act('delc',{id,i:+el.dataset.i});
  }
});

/* ===== مميزات: بحث شامل، محفوظات، تقويم، تقارير المالك ===== */
const pubItems=()=>getDB().filter(i=>(!i.hidden&&(!i.publishAt||+i.publishAt<=Date.now())));
function openGlobalSearch(){
  tool('<h3>🔍 بحث في كل الملفات</h3><input id="gsQ" class="form-input" placeholder="اكتب اسم ملف أو مادة أو دكتور..." autocomplete="off"><div id="gsRes" style="margin-top:10px"></div>');
  $('gsQ').addEventListener('input',gsRun);gsRun();$('gsQ').focus();
}
function gsRun(){
  const q=norm($('gsQ').value.trim());
  if(q.length<2){$('gsRes').innerHTML='<p style="color:#888;font-size:13px">اكتب حرفين على الأقل.</p>';return}
  const a=pubItems().filter(i=>norm(i.title+' '+i.subject+' '+(i.tags||'')+' '+(i.doctor||'')).includes(q)).slice(0,30);
  $('gsRes').innerHTML=a.length?a.map(m=>`<div class="ev"><div><b>${esc(m.title)}</b><br><small>${esc(m.subject)} • ${esc(m.type)} • ${esc(m.level)}${m.dept&&m.dept!=='مشترك'?' • '+esc(m.dept):''}</small></div><div class="action-links"><a class="open-btn" href="${safeHref(m.viewLink)}" target="_blank" rel="noopener noreferrer">فتح</a><button class="btn sm" onclick="goToItem('${safeId(m.id)}')">📂 مكانه</button></div></div>`).join(''):'<p>مفيش نتايج.</p>';
}
function goToItem(id){
  const m=getDB().find(x=>x.id===id);if(!m)return;
  userPath={track:m.track,dept:m.dept,level:m.level};activeSub=m.subject;activeType=m.type||null;closeModal('toolModal');
  switchMainView('studentFlow');showResults(m.semester);
}
function toggleSaved(id){
  const a=ld('fci_saved',[]),i=a.indexOf(id);if(i>-1)a.splice(i,1);else a.push(id);
  sv('fci_saved',a);render();toast(i>-1?'اتشالت من المحفوظات':'اتحفظت 🔖');
}
function openSaved(){
  const db=getDB(),a=ld('fci_saved',[]).map(id=>db.find(x=>x.id===id)).filter(Boolean);
  tool(`<h3>🔖 المحفوظات</h3>${a.length?a.map(m=>`<div class="ev"><div><b>${esc(m.title)}</b><br><small>${esc(m.subject)} • ${esc(m.type)}</small></div><div class="action-links"><a class="open-btn" href="${safeHref(m.viewLink)}" target="_blank" rel="noopener noreferrer">فتح</a><button class="btn sm" onclick="goToItem('${safeId(m.id)}')">📂</button><button class="btn btn-danger sm" onclick="toggleSaved('${safeId(m.id)}');openSaved()">✕</button></div></div>`).join(''):'<p>لسه ما حفظتش حاجة. اضغط 🔖 جنب أي ملف.</p>'}`);
}
function icsEsc(t){return String(t).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
function exportIcs(){
  const ev=[],p=userPath;
  EVENTS.forEach(e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&evDays(e.date)>=-1)ev.push({t:e.title+(e.subject?' - '+e.subject:''),d:e.date,id:'ev'+e.id})});
  pubItems().filter(i=>i.type==='تكليفات'&&/^\d{4}-\d{2}-\d{2}$/.test(i.deadline||'')&&evDays(i.deadline)>=-1&&(!p.level||(i.level===p.level&&i.track===p.track))).forEach(i=>ev.push({t:'تسليم: '+i.title+' - '+i.subject,d:i.deadline,id:'as'+i.id}));
  if(!ev.length)return toast('مفيش مواعيد لتصديرها',1);
  const nx=d=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+1);return x.getFullYear()+String(x.getMonth()+1).padStart(2,'0')+String(x.getDate()).padStart(2,'0')};
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FCI-Materials//AR','CALSCALE:GREGORIAN'];
  ev.forEach(e=>L.push('BEGIN:VEVENT','UID:'+e.id+'@fci-materials','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART;VALUE=DATE:'+e.d.replace(/-/g,''),'DTEND;VALUE=DATE:'+nx(e.d),'SUMMARY:'+icsEsc(e.t),'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(e.t),'END:VALARM','END:VEVENT'));
  L.push('END:VCALENDAR');
  const b=new Blob([L.join('\r\n')],{type:'text/calendar;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='fci-calendar.ics';a.click();URL.revokeObjectURL(a.href);
  toast('نزل ملف التقويم، افتحه وأضفه لتقويم جوجل أو آبل 📆');
}
function openGaps(){
  const db=getDB(),subs={};
  db.forEach(i=>{const k=[i.track,i.dept,i.level,i.semester,i.subject].join('|'),o=subs[k]=subs[k]||{i,t:{}};o.t[i.type]=(o.t[i.type]||0)+1});
  const lack=[];
  Object.keys(subs).forEach(k=>{const o=subs[k],miss=['محاضرات','ملخصات','امتحانات سابقة'].filter(t=>!o.t[t]);if(miss.length)lack.push({i:o.i,miss})});
  const has=(tr,lv,sm,dp)=>db.some(i=>i.track===tr&&i.level===lv&&i.semester===sm&&(!dp||i.dept===dp)),empty=[];
  ['الفصل الأول','الفصل الثاني'].forEach(sm=>LEVELS.forEach(lv=>{
    if(!has('عام',lv,sm))empty.push('الأقسام العامة • '+lv+' • '+sm);
    DEPT_SPC.forEach(dp=>{if(!has('خاص',lv,sm,dp))empty.push(dp+' • '+lv+' • '+sm)});
  }));
  const old=db.filter(i=>!(i.views||0)&&!(i.downloads||0)&&Date.now()-i.timestamp>30*864e5);
  tool(`<h3>🕳 المحتوى الناقص</h3><h4>مسارات فاضية (${empty.length})</h4>${empty.length?'<div style="font-size:13px;line-height:1.8">'+empty.slice(0,30).map(x=>'• '+esc(x)).join('<br>')+(empty.length>30?'<br>…':'')+'</div>':'<p>كل المسارات فيها ملفات ✅</p>'}<h4>مواد ناقصها (${lack.length})</h4>${lack.slice(0,25).map(x=>`<div class="ev"><div><b>${esc(x.i.subject)}</b><br><small>${esc(x.i.level)} • ${esc(x.i.dept)} • ناقص: ${x.miss.join('، ')}</small></div></div>`).join('')||'<p>—</p>'}<h4>ملفات ماحدش فتحها من 30 يوم (${old.length})</h4>${old.slice(0,10).map(itemRow).join('')||'<p>—</p>'}`);
}
function openShareMsg(){
  const base=location.origin+location.pathname,day=864e5,now=Date.now(),by={};
  const nw=pubItems().filter(i=>now-i.timestamp<7*day);
  nw.forEach(i=>{const k=[i.track,i.dept,i.level,i.semester,i.subject].join('|');(by[k]=by[k]||[]).push(i)});
  let t='📚 *جديد على FCI-Materials (آخر 7 أيام)*\n';
  Object.keys(by).forEach(k=>{
    const a=by[k],f=a[0];
    t+='\n▪️ *'+f.subject+'* — '+f.level+(f.dept&&f.dept!=='مشترك'?' • '+f.dept:'')+'\n';
    a.slice(0,8).forEach(i=>{t+='   • '+i.title+' ('+i.type+')\n'});
    if(a.length>8)t+='   … و'+(a.length-8)+' كمان\n';
    t+='   🔗 '+base+'#go='+encodeURIComponent([f.track,f.dept,f.level,f.semester,f.subject].join('|'))+'\n';
  });
  if(!nw.length)t+='\nمفيش ملفات جديدة الأسبوع ده.\n';
  const up=EVENTS.filter(e=>{const k=evDays(e.date);return k>=0&&k<=10}).sort((x,y)=>x.date.localeCompare(y.date));
  if(up.length){t+='\n⏰ *مواعيد قريبة:*\n';up.forEach(e=>{t+='• '+e.title+(e.subject?' ('+e.subject+')':'')+' — '+e.date+'\n'})}
  tool(`<h3>📣 رسالة جاهزة للجروب</h3><p style="font-size:12px;margin:0 0 8px">انسخها وابعتها في واتساب أو تليجرام، وعدّل عليها لو حبيت.</p><textarea id="smTxt" class="form-input" style="min-height:260px">${esc(t)}</textarea><button class="btn" style="width:100%;margin-top:8px" onclick="copyText($('smTxt').value)">📋 نسخ الرسالة</button>`);
}
function exportCsv(){
  const cols=[['title','العنوان'],['subject','المادة'],['type','النوع'],['week','الأسبوع'],['track','النظام'],['dept','القسم'],['level','الفرقة'],['semester','الفصل'],['doctor','الدكتور'],['tags','الوسوم'],['viewLink','الرابط'],['views','مشاهدات'],['downloads','تحميلات'],['by','نشره'],['dateAdded','تاريخ الإضافة']];
  const q=v=>{let t=String(v==null?'':v);if(/^[=+\-@]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"'};
  const csv='\uFEFF'+[cols.map(c=>q(c[1])).join(',')].concat(getDB().map(i=>cols.map(c=>q(i[c[0]])).join(','))).join('\r\n');
  const b=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='fci-files-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(a.href);
  toast('تم تنزيل الملف، افتحه بـ Excel');
}
/* ===== ترقية لوحة الأدمن ===== */
function selIds(){return Object.keys(AF.sel).filter(k=>AF.sel[k])}
function updateBar(){const n=selIds().length;$('afBar').style.display=n?'block':'none';$('afSel').textContent='✔ اتحدد '+n+' ملف'}
function bulkClear(){AF.sel={};$('afAll').checked=false;renderAdminFiles();updateBar()}
$('afList').addEventListener('change',e=>{const c=e.target.closest('.afck');if(!c)return;AF.sel[c.dataset.id]=c.checked;updateBar()});
$('afAll').addEventListener('change',e=>{document.querySelectorAll('#afList .afck').forEach(c=>{c.checked=e.target.checked;AF.sel[c.dataset.id]=e.target.checked});updateBar()});
async function bulkHide(v){const ids=selIds();if(!ids.length)return;if(await act('bulkedit',{ids,fields:{hidden:v}}))bulkClear()}
async function bulkDelete(){const ids=selIds();if(!ids.length||!(await askConfirm('نقل '+ids.length+' ملف لسلة المحذوفات؟ (تقدر ترجّعهم خلال 30 يوم)')))return;if(await act('bulkdel',{ids}))bulkClear()}
function bulkMove(){
  const o=(a,id)=>`<select id="${id}" class="form-select"><option value="">— بدون تغيير —</option>${opts(a)}</select>`;
  tool(`<h3>📦 نقل/تعديل ${selIds().length} ملف</h3><p style="font-size:12px;margin:0 0 8px">اختار بس اللي عايز تغيّره، والباقي بيفضل زي ما هو.</p><div class="form-group"><label>النظام</label>${o(['عام','خاص'],'bmT')}</div><div class="form-group"><label>القسم</label>${o(['مشترك'].concat(DEPTS),'bmD')}</div><div class="form-group"><label>الفرقة</label>${o(LEVELS,'bmL')}</div><div class="form-group"><label>الفصل</label>${o(['الفصل الأول','الفصل الثاني'],'bmS')}</div><div class="form-group"><label>الأسبوع</label>${o(WEEKS,'bmW')}</div><div class="form-group"><label>النوع</label>${o(TYPES,'bmY')}</div><button class="btn" style="width:100%" onclick="bulkMoveGo()">تطبيق</button>`);
}
async function bulkMoveGo(){
  const f={};[['bmT','track'],['bmD','dept'],['bmL','level'],['bmS','semester'],['bmW','week'],['bmY','type']].forEach(x=>{const v=$(x[0]).value;if(v)f[x[1]]=v});
  if(!Object.keys(f).length)return toast('اختار حاجة تتغيّر',1);
  if(await act('bulkedit',{ids:selIds(),fields:f})){closeModal('toolModal');bulkClear()}
}
const ADM_CNT={at:0};
async function refreshCounts(force){
  syncLocalAdminCounts();
  if(!force&&ADM_CNT.at&&Date.now()-ADM_CNT.at<45000)return ADM_CNT;
  try{
    const j=await api('admincounts');
    if(j&&j.counts)syncLocalAdminCounts(j.counts);
  }catch(e){}
  return ADM_CNT;
}
async function loadStudentsTab(){
  const c=await refreshCounts(),set=(id,n)=>{$(id).textContent=n==null?'':n};
  set('cntCtr',c.ct);set('cntReq',c.req);set('cntCom',c.com);
}
async function loadAttention(){
  const box=$('attention');if(!box)return;
  const c=await refreshCounts();
  const t=(n,ic,l,fn)=>`<button class="tile" onclick="${fn}"><span>${ic}</span><b>${n==null?'؟':n}</b>${l}</button>`;
  box.innerHTML='<h4>🔔 محتاج انتباهك</h4><div class="agrid">'+t(c.ct,'📬','مساهمات للمراجعة','openContribs()')+t(c.req,'📥','طلبات جديدة','openReqList()')+t(c.rep,'⚠️','بلاغات',"adminTab('students')")+t(c.hl,'🩺','روابط فيها مشاكل','openHealth()')+t(c.sch,'⏳','ملفات مجدولة',"adminTab('files')")+t(c.hid,'🙈','ملفات مخفية',"adminTab('files')")+'</div>';
}
/* لصق ذكي: بيملّى العنوان والنوع والأسبوع من اسم ملف الدرايف */
let LI_T=null;
async function smartPaste(){
  const l=safeUrl($('addLink').value.trim());if(!l||!isAdmin)return;
  try{
    const j=await api('linkinfo',{url:l});
    if(j.name&&!$('addTitle').value.trim())$('addTitle').value=j.name;
    if(j.type)$('addType').value=j.type;
    if(j.week&&j.week!=='عام')$('addWeek').value=j.week;
    if(j.name){$('addType').dispatchEvent(new Event('change'));toast('اتعبّى العنوان والنوع تلقائي ✨')}
  }catch(e){}
}
$('addLink').addEventListener('input',()=>{clearTimeout(LI_T);LI_T=setTimeout(smartPaste,600)});
$('addLink').addEventListener('keydown',e=>{if(e.key==='Enter')saveMaterial()});
let SUBS=[];
function openSubjects(){
  const g={};
  getDB().forEach(i=>{const k=[i.track,i.dept,i.level,i.semester,i.subject].join('|'),o=g[k]=g[k]||{i,ids:[],doc:''};o.ids.push(i.id);if(i.doctor)o.doc=i.doctor});
  SUBS=Object.keys(g).map(k=>g[k]).sort((a,b)=>String(a.i.level).localeCompare(String(b.i.level),'ar')||String(a.i.subject).localeCompare(String(b.i.subject),'ar'));
  tool(`<h3>📚 إدارة المواد</h3><p style="font-size:12px;margin:0 0 8px">غيّر اسم مادة في كل ملفاتها بضغطة، أو اكتب اسم الدكتور لكل الملفات. لو كتبت اسم مادة موجودة في نفس المسار هتتدمج معاها.</p>${SUBS.map((o,n)=>`<div class="ev"><div><b>${esc(o.i.subject)}</b> <small>(${o.ids.length} ملف)</small><br><small>${esc(o.i.level)} • ${esc(o.i.dept)} • ${esc(o.i.semester)}${o.doc?' • 👨‍🏫 '+esc(o.doc):''}</small></div><div class="action-links"><button class="btn sm" onclick="subRename(${n})">✏️ الاسم</button><button class="btn sm" onclick="subDoctor(${n})" aria-label="الدكتور">👨‍🏫</button><button class="btn btn-ghost sm" onclick="openSubQr(${n})" aria-label="QR">📱</button></div></div>`).join('')||'<p>مفيش مواد.</p>'}`);
}
async function subRename(n){const o=SUBS[n],v=await askPrompt('✏️ الاسم الجديد للمادة',o.i.subject,'اكتب اسم المادة...');if(v===null||!v.trim()||v.trim()===o.i.subject)return;if(await act('bulkedit',{ids:o.ids,fields:{subject:v.trim()}}))openSubjects()}
async function subDoctor(n){const o=SUBS[n],v=await askPrompt('👨‍🏫 اسم الدكتور لكل ملفات المادة',o.doc,'اكتب اسم الدكتور...');if(v===null)return;if(await act('bulkedit',{ids:o.ids,fields:{doctor:v.trim()}}))openSubjects()}
function openComments(){
  const rows=[];
  getDB().forEach(i=>(i.comments||[]).forEach((c,n)=>rows.push({i,n,c:typeof c==='string'?{n:'طالب',t:c}:c})));
  const a=rows.sort((x,y)=>y.i.timestamp-x.i.timestamp).slice(0,60);
  tool(`<h3>💬 التعليقات (${rows.length})</h3>${a.length?a.map(r=>`<div class="ev" style="align-items:flex-start"><div><b>${esc(r.c.n)}</b>: ${esc(r.c.t)}<br><small>على: ${esc(r.i.title)} (${esc(r.i.subject)})</small></div><button class="btn btn-danger sm" data-dc="${esc(r.i.id)}|${r.n}" aria-label="مسح">🗑️</button></div>`).join(''):'<p>مفيش تعليقات.</p>'}`);
}
let ADMS=[];
async function openAdmins(){
  try{
    const j=await api('adminlist');ADMS=j.admins;
    tool(`<h3>👥 الأدمنز</h3>${ADMS.map((a,n)=>`<div class="ev"><div><b>${esc(a.name)}</b> ${a.role==='owner'?'<span class="countdown-badge">مالك</span>':''}<br><small>${a.scope?'نطاق: '+esc(a.scope.replace('|',' / ')):'من غير نطاق'}</small></div><div class="action-links"><button class="btn sm" onclick="adminEdit(${n})" aria-label="تعديل">✏️</button><button class="btn btn-danger sm" onclick="adminDel(${n})" aria-label="حذف">🗑️</button></div></div>`).join('')}<hr><h4 id="admFormT">➕ أدمن جديد</h4><input id="admN" class="form-input" placeholder="الاسم"><input id="admP" type="text" class="form-input" style="margin-top:6px" placeholder="الباسورد (12 حرفًا على الأقل)" autocomplete="off"><select id="admR" class="form-select" style="margin-top:6px"><option value="">أدمن</option><option value="owner">مالك</option></select><input id="admS" class="form-input" style="margin-top:6px" placeholder="النطاق (اختياري): الفرقة الثالثة أو الفرقة الثالثة|علوم الحاسب"><button class="btn" style="width:100%;margin-top:8px" onclick="adminSave()">حفظ</button>`);
  }catch(e){toast(e.message||'خطأ',1)}
}
function adminEdit(n){const a=ADMS[n];$('admN').value=a.name;$('admP').value='';$('admP').placeholder='سيب الباسورد فاضي لو مش هتغيّره';$('admR').value=a.role;$('admS').value=a.scope;$('admFormT').textContent='✏️ تعديل: '+a.name}
async function adminSave(){if(await act('adminsave',{name:$('admN').value,password:$('admP').value,role:$('admR').value,scope:$('admS').value}))openAdmins()}
async function adminDel(n){const a=ADMS[n];if((await askConfirm('حذف الأدمن «'+a.name+'»؟'))&&await act('admindel',{name:a.name}))openAdmins()}
/* ===== ابديت 8: مساهمات، مزامنة، مخطط مذاكرة ===== */
function openContribute(){
  const p=userPath;
  if(!p.level||!p.semester)return tool('<h3>➕ ساهم بملف</h3><p>اختار مسارك الأول (النظام والفرقة والترم) من صفحة المواد، وبعدين ارجع هنا.</p>');
  const subs=Array.from(new Set(pubItems().filter(i=>i.track===p.track&&i.level===p.level&&i.semester===p.semester).map(i=>i.subject)));
  tool(`<h3>➕ ساهم بملف</h3><p style="font-size:12px;margin:0 0 8px">عندك ملف مفيد؟ ابعته للإدارة وهيتنشر بعد المراجعة. المسار: <b>${esc(trackLabel(p.track))} • ${esc(p.level)} • ${esc(p.semester)}</b></p><input id="ctS" class="form-input" list="ctSL" placeholder="اسم المادة"><datalist id="ctSL">${subs.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><input id="ctT" class="form-input" style="margin-top:8px" placeholder="عنوان الملف"><input id="ctL" type="url" class="form-input" style="margin-top:8px" placeholder="رابط الملف (درايف مشترك لأي حد معاه الرابط)"><div class="row" style="margin-top:8px"><select id="ctY" class="form-select">${opts(TYPES)}</select><select id="ctW" class="form-select">${opts(WEEKS)}</select></div><input id="ctN" class="form-input" style="margin-top:8px" placeholder="اسمك (اختياري)" maxlength="30" value="${esc(ld('fci_name','')||'')}"><button class="btn" style="width:100%;margin-top:8px" onclick="sendContrib()">📤 إرسال للمراجعة</button>`);
}
async function sendContrib(){
  const p=userPath,day=new Date().toISOString().slice(0,10),cnt=ld('fci_cday',{d:'',n:0});
  if(cnt.d===day&&cnt.n>=5)return toast('وصلت للحد اليومي (5 مساهمات)',1);
  const link=safeUrl($('ctL').value.trim()),item={track:p.track,dept:p.dept||'مشترك',level:p.level,semester:p.semester,subject:$('ctS').value.trim(),title:$('ctT').value.trim(),type:$('ctY').value,week:$('ctW').value,viewLink:link,downloadLink:getDL(link)};
  if(!item.subject||!item.title)return toast('اكتب المادة والعنوان',1);
  if(!link)return toast('الرابط لازم يبدأ بـ https://',1);
  try{const j=await api('contribute',{item,name:$('ctN').value.trim()});sv('fci_cday',{d:day,n:(cnt.d===day?cnt.n:0)+1});toast(j.msg||'اتبعت للمراجعة ✅');closeModal('toolModal')}catch(e){toast(e.message||'خطأ',1)}
}
let CTR=[];
async function openContribs(){
  try{
    const j=await api('contriblist');CTR=j.contrib;
    tool(`<h3>📬 المساهمات (${CTR.length})</h3>${CTR.length?CTR.map((c,n)=>`<div class="acard"><b>${esc(c.title)}</b><br><small>${esc(c.subject)} • ${esc(c.type)} • ${esc(c.week)} • ${esc(c.level)} • ${esc(c.dept)} • ${esc(c.semester)}<br>🤝 ${esc(c.contributor)} • ${esc(c.at)}</small><div class="action-links" style="margin-top:8px"><a class="open-btn" href="${safeHref(c.viewLink)}" target="_blank" rel="noopener noreferrer">فتح</a><button class="btn sm btn-success" data-ca="${n}">✅ نشر</button><button class="btn sm btn-warning" onclick="openContribEdit(${n})">✏️ تعديل ونشر</button><button class="btn btn-danger sm" data-cr="${esc(c.id)}">❌ رفض</button></div></div>`).join(''):'<p>مفيش مساهمات مستنية ✅</p>'}`);
  }catch(e){toast(e.message||'خطأ',1)}
}
function openContribEdit(n){
  const c=CTR[n];if(!c)return;
  tool(`<h3>✏️ مراجعة وتعديل المساهمة</h3><small style="color:var(--text-muted)">مُرسلة من: ${esc(c.contributor)} • ${esc(c.level)} / ${esc(c.semester)}</small><div class="form-group" style="margin-top:10px"><label>العنوان</label><input id="ceT" class="form-input" value="${esc(c.title)}"></div><div class="form-group"><label>المادة</label><input id="ceS" class="form-input" value="${esc(c.subject)}"></div><div class="form-grid"><div class="form-group"><label>القسم</label><select id="ceD" class="form-select">${opts(['مشترك'].concat(DEPTS),c.dept||'مشترك')}</select></div><div class="form-group"><label>النوع</label><select id="ceY" class="form-select">${opts(TYPES,c.type||'محاضرات')}</select></div></div><div class="form-group"><label>الأسبوع</label><select id="ceW" class="form-select">${opts(WEEKS,c.week||'عام')}</select></div><div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="btn btn-success" style="flex:1" onclick="submitContribEdit(${n})">✅ حفظ ونشر</button><button type="button" class="btn btn-ghost" onclick="openContribs()">رجوع</button></div>`);
}
async function submitContribEdit(n){
  const c=CTR[n];if(!c)return;
  const fields={title:$('ceT').value.trim(),subject:$('ceS').value.trim(),dept:$('ceD').value,type:$('ceY').value,week:$('ceW').value};
  if(!fields.title||!fields.subject)return toast('اكتب العنوان والمادة',1);
  if(await act('contribapprove',{id:c.id,fields}))openContribs();
}
const SYNC_KEYS=['fci_done','fci_saved','fci_favs','fci_notes','fci_path','fci_personal_tasks','fci_quick_notes','fci_attendance','fci_custom_sched','fci_study_stats','fci_recent'],SYNC_GPA=['fci_rich_gpa','fci_gpa_meta'],SYNC_ALPHA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function syncNewCode(){const a=new Uint32Array(10);crypto.getRandomValues(a);return Array.from(a,x=>SYNC_ALPHA[x%32]).join('')}
function syncCollect(g){const o={};SYNC_KEYS.concat(g?SYNC_GPA:[]).forEach(k=>{try{const v=localStorage.getItem(k);if(v!==null)o[k]=v}catch(e){}});return o}
function openSync(){
  const code=ld('fci_sync_code',''),at=ld('fci_sync_at',0);
  tool(`<h3>☁️ مزامنة بياناتي</h3><p style="font-size:12px;margin:0 0 8px">انقل ملاحظاتك ومهامك وتقدمك ومحفوظاتك بين أجهزتك بكود شخصي من غير تسجيل دخول. <b>مهم:</b> البيانات بتتخزن في شيت إدارة الموقع، فمتحطّش فيها حاجة سرية، واللي يعرف الكود يقدر يشوفها.</p>${code?`<div class="acard"><b>الكود بتاعك:</b><div style="font-size:22px;letter-spacing:3px;direction:ltr;text-align:center;margin:6px 0">${esc(code)}</div><small>${at?'آخر رفع: '+new Date(at).toLocaleString('ar-EG'):'لسه ما اترفعش'}</small><label style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:13px"><input type="checkbox" id="syGpa"> أضمّن بيانات الـ GPA والدرجات</label><button class="btn" style="width:100%;margin-top:8px" onclick="syncUp()">⬆️ ارفع بياناتي الآن</button><button class="btn btn-danger sm" style="margin-top:8px" onclick="syncForget()">إلغاء الكود من الجهاز</button></div>`:'<button class="btn" style="width:100%;margin-bottom:10px" onclick="syncCreate()">🔑 إنشاء كود جديد لجهازي</button>'}<div class="acard"><b>جهاز تاني؟</b> اكتب الكود واسترجع بياناتك:<input id="syIn" class="form-input" style="margin-top:6px;direction:ltr;text-transform:uppercase" maxlength="10" placeholder="XXXXXXXXXX"><button class="btn btn-warning" style="width:100%;margin-top:8px" onclick="syncDown()">⬇️ استرجاع</button></div>`);
}
function syncCreate(){sv('fci_sync_code',syncNewCode());openSync()}
async function syncForget(){if(await askConfirm('تلغي الكود من الجهاز ده؟ البيانات المرفوعة هتفضل على السيرفر.')){try{localStorage.removeItem('fci_sync_code')}catch(e){}openSync()}}
async function syncUp(){
  const code=ld('fci_sync_code','');if(!code)return;
  const data=JSON.stringify(syncCollect($('syGpa')&&$('syGpa').checked));
  if(data.length>45000)return toast('البيانات كبيرة (ملاحظات كتير). قلّلها وجرّب تاني',1);
  try{const j=await api('syncput',{code,data});sv('fci_sync_at',j.at||Date.now());toast(j.msg||'تم ☁️');openSync()}catch(e){toast(e.message||'خطأ',1)}
}
async function syncDown(){
  const code=$('syIn').value.trim().toUpperCase();
  if(!/^[A-HJ-NP-Z2-9]{10}$/.test(code))return toast('الكود لازم 10 حروف وأرقام',1);
  try{
    const j=await api('syncget',{code});let o;try{o=JSON.parse(j.sync)}catch(e){throw new Error('بيانات تالفة')}
    if(!(await askConfirm('هيتم استبدال بيانات الجهاز ده ببيانات الكود. نكمل؟')))return;
    const SAFE_ARR_KEYS=['fci_custom_sched','fci_attendance','fci_rich_gpa','fci_personal_tasks'];
    SYNC_KEYS.concat(SYNC_GPA).forEach(k=>{
      if(!Object.prototype.hasOwnProperty.call(o,k))return;
      if(typeof o[k]!=='string'||o[k].length>=45000)return;
      try{
        let parsed=JSON.parse(o[k]);
        if(SAFE_ARR_KEYS.includes(k)){
          parsed=sanitizeLocalArr(parsed,'s_');
          localStorage.setItem(k,JSON.stringify(parsed));
        }else if(k==='fci_done'||k==='fci_saved'||k==='fci_recent'){
          localStorage.setItem(k,JSON.stringify((Array.isArray(parsed)?parsed:[]).map(safeId).filter(Boolean).slice(0,500)));
        }else if(k==='fci_notes'){
          const cn={};
          if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))Object.keys(parsed).forEach(nk=>{const sk=safeId(nk);if(sk&&typeof parsed[nk]==='string')cn[sk]=parsed[nk].slice(0,1000)});
          localStorage.setItem(k,JSON.stringify(cn));
        }else{
          localStorage.setItem(k,JSON.stringify(parsed));
        }
      }catch(e){}
    });
    try{localStorage.setItem('fci_sync_code',JSON.stringify(code))}catch(e){}
    toast('تم الاسترجاع ✅ بيعيد تحميل الصفحة...');setTimeout(()=>location.reload(),900);
  }catch(e){toast(e.message||'خطأ',1)}
}
function planCfg(){return Object.assign({mpf:45,hrs:3},ld('fci_plan_cfg',{}))}
function planSet(){sv('fci_plan_cfg',{mpf:Math.max(10,Math.min(180,+$('plMpf').value||45)),hrs:Math.max(0.5,Math.min(12,+$('plHrs').value||3))});openPlanner()}
function openPlanner(){
  const p=userPath,c=planCfg();
  if(!p.level)return tool('<h3>🗓 خطة مذاكرة ذكية</h3><p>اختار مسارك الأول من صفحة المواد، وبعدين ارجع هنا.</p>');
  const unified=p.track==='عام'&&p.dept==='مشترك'&&COMMON_LEVELS.indexOf(p.level)>-1;
  const mine=pubItems().filter(i=>i.track===p.track&&i.level===p.level&&i.semester===p.semester&&(i.dept===p.dept||i.dept==='مشترك'||unified));
  const done=ld('fci_done',[]),exams=EVENTS.filter(e=>e.subject&&evDays(e.date)>=2).sort((a,b)=>a.date.localeCompare(b.date));
  let total=0;
  const rows=exams.map(e=>{
    const ns=norm(e.subject),files=mine.filter(i=>['محاضرات','ملخصات','سكاشن'].indexOf(i.type)>-1&&(norm(i.subject).includes(ns)||ns.includes(norm(i.subject)))).sort((a,b)=>(WEEKS.indexOf(a.week)-WEEKS.indexOf(b.week))||a.title.localeCompare(b.title,'ar',{numeric:true}));
    const rem=files.filter(i=>done.indexOf(i.id)<0),left=Math.max(1,evDays(e.date)-1),per=rem.length?Math.ceil(rem.length/left):0;
    total+=per;return {e,files,rem,left,per};
  });
  const mins=total*c.mpf,cap=c.hrs*60;
  const status=!rows.length?'':mins>cap?'⚠️ الحمل النهاردة حوالي '+(mins/60).toFixed(1)+' ساعة وده أكتر من '+c.hrs+' ساعات. زوّد وقتك أو ابدأ بالأقرب امتحاناً.':'✅ حملك النهاردة حوالي '+(mins/60).toFixed(1)+' ساعة، جوه وقتك.';
  tool(`<h3>🗓 خطة مذاكرة ذكية</h3><p style="font-size:12px;margin:0 0 8px">بتتحسب من مواعيد الامتحانات اللي الإدارة ضايفاها وملفات موادك اللي لسه ما علّمتش عليها ✔.</p><div class="row"><label style="font-size:12px">دقايق للملف<input id="plMpf" type="number" class="form-input" value="${c.mpf}" onchange="planSet()"></label><label style="font-size:12px">ساعات المذاكرة يومياً<input id="plHrs" type="number" step="0.5" class="form-input" value="${c.hrs}" onchange="planSet()"></label></div>${status?'<p><b>'+status+'</b></p>':''}${rows.length?rows.map(r=>`<div class="acard"><b>${esc(r.e.subject)}</b> — ${esc(r.e.title)} <span class="countdown-badge">${r.left} يوم للمذاكرة</span><br><small>${r.rem.length} ملف متبقي من ${r.files.length}${r.per?' • النهاردة: '+r.per+' ملف':' • خلّصت ✅'}</small>${r.rem.slice(0,r.per).map(i=>`<div class="ev"><span>${esc(i.title)}</span><a class="open-btn btn sm" href="${safeHref(i.viewLink)}" target="_blank" rel="noopener noreferrer">فتح</a></div>`).join('')}</div>`).join(''):'<p>مفيش امتحانات قادمة عليها اسم مادة. اطلب من الإدارة تضيف المواعيد.</p>'}`);
}
/* ===== المنظّم الذكي لدرايف (للمالك) ===== */
let TR={files:[],truncated:false,rootId:''};
function trDefaults(){return {track:$('trTrack').value,dept:$('trDept').value,level:$('trLevel').value,semester:$('trSem').value,subject:$('trSubj').value.trim(),rootAsSubject:$('trRootSub').checked}}
(function(){const o=a=>'<option value="">— تلقائي —</option>'+opts(a);$('trTrack').innerHTML=o(['عام','خاص']);$('trDept').innerHTML=o(['مشترك'].concat(DEPTS));$('trLevel').innerHTML=o(LEVELS);$('trSem').innerHTML=o(['الفصل الأول','الفصل الثاني'])})();
function showDriveProgress(title,sub,pct){
  if(!$('dpBar')){
    tool(`<h3>${esc(title)}</h3><p id="dpSub" style="font-size:13px;color:var(--text-muted);margin:0 0 10px">${esc(sub)}</p><div class="pbar"><i id="dpBar" style="width:${pct}%"></i></div>`);
  }else{
    $('dpSub').textContent=sub;
    $('dpBar').style.width=pct+'%';
  }
}
async function treeCollect(){
  const root=$('trRoot').value.trim();if(!root){toast('الصق رابط الفولدر الرئيسي',1);return false}
  showDriveProgress('🔍 جاري فحص فولدر درايف...','بيقرأ الفولدرات والملفات...',18);
  TR={files:[],truncated:false,rootId:''};let stack=null,seen=null,rootId='',guard=0;
  try{
    for(;;){
      const j=await api('treescan',{root:stack?'':root,stack,seen,rootId,defaults:trDefaults()});
      TR.files=TR.files.concat(j.files||[]);stack=j.stack;seen=j.seen;if(j.rootId)rootId=TR.rootId=j.rootId;
      showDriveProgress('🔍 جاري فحص فولدر درايف...',`تم فحص ${TR.files.length} ملف...`,j.done?100:Math.min(92,25+guard*12));
      if(j.done)break;
      if(++guard>40||TR.files.length>=2000){TR.truncated=true;break}
    }
    return true;
  }catch(e){closeModal('toolModal');toast(e.message||'خطأ',1);return false}
}
async function treeScan(){if(await treeCollect())showTreePlan()}
function showTreePlan(){
  const fs=TR.files,ok=fs.filter(f=>f.ok&&!f.exists),ex=fs.filter(f=>f.exists).length,bad=fs.filter(f=>!f.ok&&!f.exists),g={};
  ok.forEach(f=>{const x=f.fields,k=[x.track,x.dept,x.level,x.semester,x.subject].join('|'),o=g[k]=g[k]||{x,n:0,t:{}};o.n++;o.t[x.type]=(o.t[x.type]||0)+1});
  const rows=Object.keys(g).sort().map(k=>{const o=g[k],x=o.x;return `<div class="ev"><div><b>${esc(x.subject)}</b><br><small>${esc(trackLabel(x.track))} • ${esc(x.dept)} • ${esc(x.level)} • ${esc(x.semester)}<br>${Object.keys(o.t).map(t=>esc(t)+' '+o.t[t]).join(' • ')}</small></div><b>${o.n}</b></div>`}).join('');
  tool(`<h3>📂 نتيجة الفحص</h3><p>لقيت <b>${fs.length}</b> ملف: <b style="color:var(--success-color)">${ok.length} جديد جاهز</b> • ${ex} موجود قبل كده • <b style="color:var(--danger-color)">${bad.length} مش واضح</b>${TR.truncated?'<br><small>⚠️ الفولدر كبير والفحص وقف عند حد معيّن. استورد اللي ظهر وكرر الفحص بعدها.</small>':''}</p>${ok.length?`<button class="btn" style="width:100%;margin-bottom:10px" onclick="treeImport()">📥 استيراد ${ok.length} ملف</button>`:''}${rows}${bad.length?'<h4>ملفات مش واضحة (مش هتتستورد)</h4><div style="font-size:12px">'+bad.slice(0,15).map(f=>`• ${esc(f.name)}<br><small style="color:#888">${esc(f.trail||'—')} — ${esc(f.reason)}</small>`).join('<br>')+(bad.length>15?'<br>…':'')+'</div><p style="font-size:12px">سمّي الفولدرات بأسماء واضحة (الفرقة والترم والمادة) أو حدد الافتراضيات وافحص تاني.</p>':''}`);
}
async function treeImport(){
  const items=TR.files.filter(f=>f.ok&&!f.exists);
  if(!items.length)return toast('مفيش ملفات جديدة جاهزة',1);
  if(!(await askConfirm('هيتم استيراد '+items.length+' ملف وفتح مشاركتها لأي حد معاه الرابط. نكمل؟')))return;
  showDriveProgress('⚡ جاري الاستيراد السريع...',`0 / ${items.length} ملف`,8);
  let doneCnt=0,skip=0,fail=0;const subs=new Set(),CHUNK=80;
  for(let i=0;i<items.length;i+=CHUNK){
    const part=items.slice(i,i+CHUNK);
    try{
      const payload=part.map(f=>({id:f.id,name:f.name,mime:f.mime||'',fromShortcut:!!f.fromShortcut,fields:f.fields}));
      const j=await api('treebatch',{items:payload,rootId:i===0?TR.rootId:'',share:true,confirmPublicShare:true,fast:true,quiet:true});
      doneCnt+=(j.imported??part.length);skip+=(j.skipped||0);fail+=(j.failed||0);
      part.forEach(f=>subs.add(f.fields.subject));
      const pct=Math.min(96,Math.round(((i+part.length)/items.length)*95));
      showDriveProgress('⚡ جاري الاستيراد السريع...',`اتستورد ${doneCnt} من ${items.length} ملف...`,pct);
    }catch(e){fail+=(items.length-i);toast(e.message||'خطأ',1);break}
  }
  if(doneCnt){
    api('treesummary',{n:doneCnt,subjects:Array.from(subs)}).catch(()=>{});
    await refresh('force');
  }
  closeModal('toolModal');
  toast('خلّصت: '+doneCnt+' ملف'+(skip?' • اتخطّى '+skip:'')+(fail?' • فشل '+fail:'')+' ✅');
}
async function treeSyncNow(){if(await treeCollect())treeImport()}
async function treeSaveCfg(){
  const root=$('trRoot').value.trim();
  if(!root)return toast('الصق رابط الفولدر الأول',1);
  const autoShare=!$('trAutoShare')||$('trAutoShare').checked;
  if(await act('treecfg',{root,defaults:trDefaults(),autoShare})){
    $('trRoot').value='';
    loadTreeCfg();
  }
}
async function treeRemoveSource(id){
  if((await askConfirm('تشيل الفولدر ده من المزامنة التلقائية؟ (الملفات الموجودة على الموقع مش هتتمسح)'))&&await act('treecfg',{removeId:id}))loadTreeCfg();
}
async function treeClearCfg(){
  if((await askConfirm('تشيل كل الفولدرات المربوطة بالمزامنة التلقائية؟'))&&await act('treecfg',{clear:true}))loadTreeCfg();
}
async function runAutoSyncNow(){
  const btn=$('autoSyncNowBtn');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري سحب الجديد...'}
  try{
    const res=await act('autosyncnow',{});
    if(res)loadTreeCfg();
  }finally{
    if(btn){btn.disabled=false;btn.textContent='🔄 مزامنة الكل الآن'}
  }
}
async function loadTreeCfg(){
  try{
    const c=(await api('treecfgget')).cfg||{};
    const sources=Array.isArray(c.sources)?c.sources:[];
    const iv=String(c.interval||'30');
    const ivLbl={'15':'كل 15 دقيقة','30':'كل 30 دقيقة','60':'كل ساعة','360':'كل 6 ساعات','1440':'مرة يومياً'}[iv]||'كل 30 دقيقة';
    if($('syncIntervalSel'))$('syncIntervalSel').value=iv;
    const listEl=$('trSourcesList');
    if(listEl){
      if(!sources.length){
        listEl.innerHTML='<div class="cat-empty-hint" style="padding:12px">مفيش فولدرات مربوطة لسه — الصق رابط الفولدر فوق واضغط «➕ ربط الفولدر للمزامنة التلقائية».</div>';
      }else{
        listEl.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:13px">📡 الفولدرات المربوطة تلقائياً (${sources.length}/15):</b><button type="button" class="btn btn-danger sm" onclick="treeClearCfg()">إزالة الكل</button></div>`+sources.map(s=>{
          const d=s.defaults||{};
          const meta=[d.track?trackLabel(d.track):'',d.dept,d.level,d.semester,d.subject].filter(Boolean).join(' • ')||'تصنيف تلقائي بالكامل من أسماء الفولدرات';
          return `<div class="ev" style="padding:8px 10px;background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;margin-bottom:6px">
            <div>
              <b>📁 ${esc(s.name||'فولدر درايف')}</b><br>
              <small style="color:var(--text-muted)">${esc(meta)}</small>
            </div>
            <div class="action-links">
              <a class="open-btn" href="https://drive.google.com/drive/folders/${encodeURIComponent(s.id)}" target="_blank" rel="noopener noreferrer">فتح ↗</a>
              <button type="button" class="btn btn-danger sm" onclick="treeRemoveSource('${safeId(s.id)}')">🗑️</button>
            </div>
          </div>`;
        }).join('');
      }
    }
    const statusBadge=c.triggerActive
      ?`<span style="color:var(--success-color);font-weight:800">🟢 الربط التلقائي شغّال (${esc(ivLbl)})</span>`
      :`<span style="color:var(--danger-color);font-weight:800">🔴 الربط التلقائي غير مفعّل</span> — اضغط «🤖 تفعيل الربط التلقائي»`;
    $('trInfo').innerHTML=statusBadge+(c.last?`<br>🕒 آخر مزامنة: <b>${esc(c.last)}</b>`:'');
  }catch(e){}
}
async function healFix(){if((await askConfirm('تحذير: هيتم فتح مشاركة ملفات Google Drive المحددة لأي شخص معاه الرابط. هل تؤكد؟'))&&await act('healfix',{confirmPublicShare:true}))openHealth()}
function adminsInto(){
  if(!OWNER)return;const b=$('toolBody');if(!b)return;
  const by={},now=Date.now();
  getDB().forEach(i=>{const k=i.by||'—',o=by[k]=by[k]||{n:0,m:0};o.n++;if(now-i.timestamp<30*864e5)o.m++});
  const d=document.createElement('div');
  d.innerHTML='<h4>👥 إسهامات الأدمنز</h4>'+Object.keys(by).sort((a,b)=>by[b].n-by[a].n).map(k=>`<div class="ev"><span>${esc(k)}</span><span>${by[k].n} ملف • ${by[k].m} آخر 30 يوم</span></div>`).join('');
  b.insertBefore(d,b.lastElementChild);
}
/* ===== الإشعارات ===== */
function soonList(){
  const p=userPath,out=[],done=ld('fci_done',[]);
  EVENTS.forEach(e=>{const k=evDays(e.date);if(k>=1&&k<=4)out.push({t:e.title+(e.subject?' ('+e.subject+')':''),k})});
  pubItems().filter(i=>i.type==='تكليفات'&&/^\d{4}-\d{2}-\d{2}$/.test(i.deadline||'')&&done.indexOf(i.id)<0&&(!p.level||(i.level===p.level&&i.track===p.track))).forEach(i=>{const k=evDays(i.deadline);if(k>=1&&k<=4)out.push({t:'تسليم: '+i.title+' ('+i.subject+')',k})});
  return out.sort((a,b)=>a.k-b.k);
}
function renderNotif(){
  const seen=ld('fci_seen',0),items=getDB().filter(i=>(!i.hidden&&(!i.publishAt||+i.publishAt<=Date.now()))).sort((a,b)=>b.timestamp-a.timestamp).slice(0,5),soon=soonList();
  $('notifDot').style.display=(soon.length||items.some(i=>i.timestamp>seen))?'block':'none';
  $('notifList').innerHTML=(soon.length?'<div class="notif-item" style="background:rgba(231,76,60,.12)"><b>⏰ قريب:</b><br>'+soon.map(x=>'• '+esc(x.t)+' — '+(x.k<=1?'النهاردة':x.k===2?'بكرة':'بعد '+(x.k-1)+' أيام')).join('<br>')+'</div>':'')+(items.length?items.map(i=>`<div class="notif-item">${i.timestamp>seen?'🆕 ':''}${esc(i.title)} <small>(${esc(i.subject)})</small></div>`).join(''):(soon.length?'':'لا جديد.'));
}
function toggleNotif(){
  const d=$('notifDropdown');if(d.style.display==='block')return closeNotif();
  d.style.top=($('siteHeader').getBoundingClientRect().bottom+8)+'px';d.style.display='block';
  sv('fci_seen',Date.now());$('notifDot').style.display='none';
}
function closeNotif(){const d=$('notifDropdown');if(d.style.display==='block'){d.style.display='none';renderNotif()}}
document.addEventListener('click',e=>{if(!e.target.closest('#notifDropdown,#notifBtn'))closeNotif()});
['readModal','toolModal','confirmModal','promptModal','editModal'].forEach(id=>{
  const el=$(id);if(!el)return;
  el.addEventListener('click',e=>{
    if(e.target!==el)return;
    if(id==='readModal')closeReader();
    else if(id==='confirmModal')resolveConfirm(false);
    else if(id==='promptModal')resolvePrompt(false);
    else closeModal(id);
  });
});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();openGlobalSearch();return;
  }
  if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
    e.preventDefault();openGlobalSearch();return;
  }
  if($('readModal').style.display==='flex'){
    if(e.key==='ArrowLeft'){e.preventDefault();stepReader(1);return}
    if(e.key==='ArrowRight'){e.preventDefault();stepReader(-1);return}
  }
  if(e.key!=='Escape')return;
  closeNotif();
  if($('confirmModal').style.display==='flex')return resolveConfirm(false);
  if($('promptModal').style.display==='flex')return resolvePrompt(false);
  if($('readModal').style.display==='flex')return closeReader();
  if($('editModal').style.display==='flex')return closeModal('editModal');
  if($('toolModal').style.display==='flex')return closeModal('toolModal');
  if(!$('studentFlow').hidden&&!$('resultsStep').hidden){
    if(activeType){activeType=null;if(TF){TF='';$('typeFilter').value=''}render()}
    else if(activeSub){activeSub=null;render()}
  }
});

/* ===== القائمة والأدوات المدمجة ===== */
function tool(h){$('toolBody').innerHTML=h+'<button class="btn btn-danger" style="width:100%;margin-top:12px" onclick="closeModal(\'toolModal\')">إغلاق</button>';$('toolModal').style.display='flex'}
function openMenu(){
  tool(`<h3>☰ القائمة السريعة والأدوات</h3><div class="menu">${[
    ['📅','المواعيد المهمة والامتحانات','openEvents()'],
    ['🗓','الجدول الدراسي ومتتبع الغياب','closeModal(\'toolModal\');switchMainView(\'scheduleView\')'],
    ['🧮','حاسبة المعدل التراكمي والدرجات','closeModal(\'toolModal\');switchMainView(\'gpaView\')'],
    ['⏱️','إدارة التسليمات ومؤقت المذاكرة','closeModal(\'toolModal\');switchMainView(\'studyView\')'],
    ['🤖','المساعد الذكي (Gemini Pro)','closeModal(\'toolModal\');switchMainView(\'aiView\');switchAiTab(\'tutor\')'],
    ['🧪','بنك الاختبارات ومولّد MCQ','closeModal(\'toolModal\');switchMainView(\'aiView\');switchAiTab(\'quizzes\')'],
    ['🏆','لوحة شرف المساهمين','closeModal(\'toolModal\');switchMainView(\'aiView\');switchAiTab(\'leaderboard\')'],
    ['🗺️','خريطة المقررات والمتطلبات','closeModal(\'toolModal\');switchMainView(\'aiView\');switchAiTab(\'roadmap\')'],
    ['🔍','بحث في كل الملفات','openGlobalSearch()'],['🗓','خطة مذاكرة ذكية','openPlanner()'],['➕','ساهم بملف','openContribute()'],['☁️','مزامنة بياناتي','openSync()'],['🔖','المحفوظات','openSaved()'],['📆','تصدير المواعيد للتقويم','exportIcs()'],['💬','طلب مادة / اقتراح للإدارة','openReq()'],
    ['📱','مشاركة الموقع بكود QR','openQrModal()'],
    ['📲','تثبيت التطبيق على الهاتف','openInstall()']
  ].concat(isAdmin?[
    ['📈','إحصائيات الموقع','openDash()'],
    ...(OWNER?[['🧾','سجل النشاط','openLog()'],['🛡️','مركز الأمان','openSecurityCenter()']]:[]),
    ['🛠','إدارة الجدول (للأدمن)','openManage()']
  ]:[]).map(x=>`<button class="menu-btn" onclick="${x[2]}"><span>${x[0]}</span>${x[1]}</button>`).join('')}</div>`);
}
$('toolBody').addEventListener('click',async e=>{
  const ev=e.target.closest('[data-ev]'),rq=e.target.closest('[data-rq]'),cd=e.target.closest('[data-cd]'),rs=e.target.closest('[data-rs]'),dc=e.target.closest('[data-dc]'),rst=e.target.closest('[data-rst]'),ca=e.target.closest('[data-ca]'),cr=e.target.closest('[data-cr]');
  if(ca&&CTR[+ca.dataset.ca])act('contribapprove',{id:CTR[+ca.dataset.ca].id}).then(ok=>ok&&openContribs());
  if(cr&&(await askConfirm('رفض المساهمة؟')))act('contribreject',{id:cr.dataset.cr}).then(ok=>ok&&openContribs());
  if(dc&&(await askConfirm('مسح التعليق؟'))){const k=dc.dataset.dc.split('|');act('delc',{id:k[0],i:+k[1]}).then(ok=>ok&&openComments())}
  if(rst){const k=rst.dataset.rst.split('|');api('reqstatus',{id:k[0],status:k[1]}).then(()=>openReqList()).catch(x=>toast(x.message||'خطأ',1))}
  if(rs)act('restore',{id:rs.dataset.rs},'تم الاسترجاع ✅').then(ok=>ok&&openTrash());
  if(ev&&(await askConfirm('حذف الموعد؟')))act('evdel',{id:ev.dataset.ev}).then(ok=>ok&&openEvents());
  if(rq&&(await askConfirm('حذف هذا الطلب؟')))api('reqdel',{id:rq.dataset.rq}).then(()=>openReqList()).catch(x=>toast(x.message,1));
  if(cd&&(await askConfirm('حذف من الجدول؟')))act('coldel',{col:'schedule',id:cd.dataset.cd}).then(ok=>ok&&openManage());
});

/* المواعيد */
const evDays=d=>Math.ceil((new Date(d+'T23:59:59')-new Date())/864e5);
function evBadge(d){const k=evDays(d);return k<0?'<span class="countdown-badge">انتهى</span>':`<span class="countdown-badge${k<=3?' urgent':''}">${k<=1?'آخر يوم':k+' يوم'}</span>`}
function evBanner(){
  const a=EVENTS.filter(e=>{const k=evDays(e.date);return k>=0&&k<=7}).sort((x,y)=>x.date.localeCompare(y.date));
  return a.length?`<div class="upcoming" style="border-color:var(--accent-color);background:rgba(252,163,17,.12)"><strong>📅 مواعيد قريبة:</strong>${a.map(e=>`<div>• ${esc(e.title)} ${e.subject?'('+esc(e.subject)+')':''} ${evBadge(e.date)}</div>`).join('')}</div>`:'';
}
function openEvents(){
  const a=EVENTS.filter(e=>evDays(e.date)>=-14).sort((x,y)=>x.date.localeCompare(y.date));
  tool(`<h3>📅 المواعيد المهمة</h3><button class="btn sm" style="margin-bottom:8px" onclick="exportIcs()">📆 إضافة للتقويم</button>${a.length?a.map(e=>`<div class="ev"><div><b>${esc(e.title)}</b><br><small>${esc(e.subject||'')} • ${esc(e.date)}</small></div><div>${evBadge(e.date)}${isAdmin?` <button class="btn btn-danger sm" data-ev="${esc(e.id)}">🗑️</button>`:''}</div></div>`).join(''):'<p>لا توجد مواعيد حالياً.</p>'}${isAdmin?`<hr><input id="evT" class="form-input" placeholder="العنوان (ميدتيرم، تسليم...)"><input id="evS" class="form-input" style="margin-top:8px" placeholder="المادة"><input id="evD" type="date" class="form-input" style="margin-top:8px"><button class="btn" style="width:100%;margin-top:8px" onclick="addEvent()">➕ إضافة موعد</button>`:''}`);
}
function addEvent(){
  const title=$('evT').value.trim(),date=$('evD').value,subject=$('evS').value.trim();
  if(!title||!date)return toast('اكتب العنوان والتاريخ',1);
  act('evadd',{title,date,subject},'تمت الإضافة').then(ok=>ok&&openEvents());
}

/* الطلبات */
function openReq(){tool(`<h3>💬 طلب مادة / اقتراح</h3><select id="rqT" class="form-select"><option>طلب مادة</option><option>اقتراح</option><option>شكوى</option></select><input id="rqN" class="form-input" style="margin-top:8px" placeholder="اسمك (اختياري)" maxlength="30"><textarea id="rqX" class="form-input" style="margin-top:8px;min-height:90px" maxlength="500" placeholder="اكتب طلبك أو اقتراحك..."></textarea><button class="btn" style="width:100%;margin-top:8px" onclick="sendReq()">إرسال</button>${isAdmin?'<hr><button class="btn btn-warning" style="width:100%" onclick="openReqList()">📥 عرض الطلبات (للأدمن)</button>':''}`)}
async function sendReq(){
  const text=$('rqX').value.trim();if(!text)return toast('اكتب الرسالة',1);
  try{await api('request',{type:$('rqT').value,name:$('rqN').value.trim(),text});toast('وصلت للإدارة، شكراً 🙏');closeModal('toolModal')}catch(e){toast(e.message||'خطأ',1)}
}
async function openReqList(){
  try{
    const j=await api('reqlist'),col={'جديد':'#e74c3c','قيد التنفيذ':'#f39c12','تم':'#27ae60'};
    tool(`<h3>📥 الطلبات (${j.requests.filter(r=>r.status==='جديد').length} جديد)</h3>${j.requests.length?j.requests.map(r=>`<div class="ev" style="align-items:flex-start"><div><span class="countdown-badge" style="background:${col[r.status]||'#888'}">${esc(r.status)}</span> <b>${esc(r.type)}</b> <small>${esc(r.name||'مجهول')} • ${esc(r.date)}</small><br>${esc(r.text)}</div><div class="action-links" style="flex-direction:column"><button class="btn sm" data-rst="${esc(r.id)}|قيد التنفيذ" aria-label="قيد التنفيذ">⏳</button><button class="btn sm" data-rst="${esc(r.id)}|تم" aria-label="تم">✅</button><button class="btn btn-danger sm" data-rq="${esc(r.id)}" aria-label="حذف">🗑️</button></div></div>`).join(''):'<p>لا توجد طلبات.</p>'}`);
  }catch(e){toast(e.message||'خطأ',1)}
}

/* تثبيت التطبيق */
let deferredInstall=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});
function openInstall(){
  if(deferredInstall){closeModal('toolModal');deferredInstall.prompt();deferredInstall=null;return}
  tool('<h3>📲 تثبيت التطبيق</h3><p><b>أندرويد (Chrome):</b> القائمة ⋮ ثم "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".</p><p><b>آيفون (Safari):</b> زرار المشاركة ⬆️ ثم "إضافة إلى الشاشة الرئيسية".</p>');
}

/* عارض الملفات */
function readerUrl(l){
  l=safeUrl(l);if(!l)return '';
  let m=l.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||l.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if(m)return 'https://drive.google.com/file/d/'+m[1]+'/preview';
  m=l.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
  if(m)return 'https://docs.google.com/'+m[1]+'/d/'+m[2]+'/preview';
  m=l.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m?'https://www.youtube.com/embed/'+m[1]:'';
}
let RD_LIST=[],RD_IDX=-1,RD_CUR=null;
function syncReaderUI(){
  if(!RD_CUR)return;
  const m=RD_CUR,isDone=done.includes(m.id),notes=ld('fci_notes',{});
  $('rdT').textContent=m.title;
  $('rdDl').href=getDL(m.viewLink)||'#';
  $('rdExt').href=safeUrl(m.viewLink)||'#';
  $('rdDone').classList.toggle('on',isDone);
  $('rdNote').classList.toggle('on',!!notes[m.id]);
  const pos=$('rdPos');
  if(RD_LIST.length>1&&RD_IDX>=0){pos.textContent=`${RD_IDX+1} / ${RD_LIST.length}`;pos.hidden=false}
  else pos.hidden=true;
  $('rdPrev').disabled=RD_IDX<=0;
  $('rdNext').disabled=RD_IDX<0||RD_IDX>=RD_LIST.length-1;
}
function openReader(id){
  const m=getDB().find(x=>x.id===id);if(!m)return;
  trackRecent(id);
  const u=readerUrl(m.viewLink);
  if(!u){window.open(safeUrl(m.viewLink)||'about:blank','_blank','noopener,noreferrer');if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();return}
  RD_CUR=m;
  RD_LIST=getDB().filter(i=>i.track===m.track&&i.level===m.level&&i.semester===m.semester&&i.subject===m.subject&&i.type===m.type&&(isAdmin||(!i.hidden&&(!i.publishAt||+i.publishAt<=Date.now())))).sort((a,b)=>(WEEKS.indexOf(a.week)-WEEKS.indexOf(b.week))||a.title.localeCompare(b.title,'ar',{numeric:true}));
  RD_IDX=RD_LIST.findIndex(x=>x.id===id);
  api('bump',{id,f:'views'}).catch(()=>{});
  syncReaderUI();
  $('rdF').src=u;$('readModal').style.display='flex';
  if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();
}
function stepReader(delta){
  const nx=RD_IDX+delta;
  if(nx<0||nx>=RD_LIST.length)return;
  openReader(RD_LIST[nx].id);
}
function toggleReaderDone(){
  if(!RD_CUR)return;
  const added=toggleIn(done,RD_CUR.id,'fci_done');
  syncReaderUI();
  if(!$('studentFlow').hidden&&!$('resultsStep').hidden)render();
  toast(added?'اتعلّم كمكتمل ✔':'اتشالت علامة الإنجاز');
}
function openReaderNote(){
  if(!RD_CUR)return;
  openNote(RD_CUR.id);
}
function closeReader(){$('rdF').src='about:blank';$('readModal').style.display='none';RD_CUR=null}

/* ===== QR Code للموقع وللمواد ===== */
function openQrModal(url,label){
  const targetUrl=url||(location.origin+location.pathname);window._lastQrUrl=targetUrl;
  const title=label||'FCI-Materials — جامعة أسيوط';
  const qrImg='https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=14&data='+encodeURIComponent(targetUrl);
  tool(`<h3>📱 كود QR للمشاركة</h3>
    <div class="qr-card">
      <div class="qr-frame">
        <img id="qrPreviewImg" src="${esc(qrImg)}" alt="QR Code" crossorigin="anonymous">
        <small>${esc(title)}</small>
      </div>
      <code dir="ltr" style="font-size:11.5px;word-break:break-all;color:var(--text-muted)">${esc(targetUrl)}</code>
      <div class="row" style="width:100%;justify-content:center">
        <a class="btn" href="${esc(qrImg)}" download="fci-qr.png" target="_blank" rel="noopener noreferrer">⬇️ تحميل صورة QR</a>
        <button type="button" class="btn btn-warning" onclick="copyText(window._lastQrUrl)">📋 نسخ الرابط</button>
      </div>
    </div>`);
}
function openSubQr(n){
  const o=SUBS[n];if(!o)return;
  const i=o.i,u=location.origin+location.pathname+'#go='+encodeURIComponent([i.track,i.dept,i.level,i.semester,i.subject].join('|'));
  openQrModal(u,i.subject+' — '+i.level);
}

/* ===== مصحّح التصنيف الذكي (للأدمن) ===== */
function guessClientType(title){
  const n=norm(title);
  if(/exam|امتحان|اختبار|midterm|ميدتيرم|final|فاينال|فاينل|quiz|كويز|\bbanks?\b|بنك|بنوك|questions?|اسئله|سؤال/.test(n))return 'امتحانات سابقة';
  if(/assignment|assign|تكليف|واجب|homework|\bhw\b|project|بروجكت|مشروع|شيت|sheet|task|تاسك/.test(n))return 'تكليفات';
  if(/section|\bsec\d*\b|سكشن|سكاشن|سيكشن|\blabs?\b|لاب|معمل|معامل|tutorial|تمرين|تمارين|عملي/.test(n))return 'سكاشن';
  if(/summary|summaries|ملخص|تلخيص|مراجعه|مراجعات|review|notes|نوتس|مذكره|مذكرات|مختصر|زتونه/.test(n))return 'ملخصات';
  return '';
}
let FIX_LIST=[];
function openSmartFixer(){
  FIX_LIST=getDB().filter(i=>OWNER||i.by===ME).map(i=>{
    const sug=guessClientType(i.title);
    return (sug&&sug!==i.type)?{i,sug}:null;
  }).filter(Boolean);
  if(!FIX_LIST.length)return tool('<h3>🪄 فحص وتصحيح التصنيف</h3><p>ممتاز! كل الملفات متصنفة في أقسامها الصح ✅</p>');
  const byType={};
  FIX_LIST.forEach(x=>{(byType[x.sug]=byType[x.sug]||[]).push(x)});
  tool(`<h3>🪄 مصحّح التصنيف الذكي (${FIX_LIST.length} ملف)</h3>
    <p style="font-size:12px;color:var(--text-muted);margin:0 0 10px">الملفات دي أسماؤها بتدل على قسم مختلف عن القسم المحفوظة فيه حالياً:</p>
    <button type="button" class="btn btn-success" style="width:100%;margin-bottom:12px" onclick="applySmartFixAll()">⚡ تصحيح الكل تلقائياً (${FIX_LIST.length} ملف)</button>
    ${Object.keys(byType).map(t=>`<h4 style="margin:10px 0 6px">${TYPE_ICONS[t]||'📁'} سيتم نقلها إلى «${esc(t)}» (${byType[t].length})</h4>`+byType[t].slice(0,25).map(x=>`<div class="ev"><div><b>${esc(x.i.title)}</b><br><small>${esc(x.i.subject)}</small><div class="fix-arrow"><span class="fix-old">${esc(x.i.type)}</span><span>←</span><span class="fix-new">${esc(x.sug)}</span></div></div><button type="button" class="btn sm" onclick="closeModal('toolModal');openEdit('${safeId(x.i.id)}')">✏️</button></div>`).join('')).join('')}`);
}
async function applySmartFixAll(){
  if(!FIX_LIST.length)return;
  if(!(await askConfirm('هيتم تصحيح تصنيف '+FIX_LIST.length+' ملف ونقلهم لأقسامهم المناسبة. نكمل؟')))return;
  const groups={};
  FIX_LIST.forEach(x=>{(groups[x.sug]=groups[x.sug]||[]).push(x.i.id)});
  let total=0;
  for(const t of Object.keys(groups)){
    const res=await act('bulkedit',{ids:groups[t],fields:{type:t}});
    if(res)total+=groups[t].length;
  }
  closeModal('toolModal');
  toast('تم تصحيح تصنيف '+total+' ملف ✅');
}

/* ===== كاشف الملفات المكررة (للأدمن) ===== */
let DUP_IDS=[];
function openDuplicates(){
  const db=getDB().slice().sort((a,b)=>a.timestamp-b.timestamp);
  const seenLink={},seenName={},dups=[];
  db.forEach(i=>{
    const m=String(i.viewLink||'').match(/\/d\/([\w-]+)/)||String(i.viewLink||'').match(/[?&]id=([\w-]+)/);
    const keyL=m?('id:'+m[1]):('u:'+i.viewLink);
    const keyN=[i.track,i.dept,i.level,i.semester,norm(i.subject),norm(i.title)].join('|');
    if(seenLink[keyL])dups.push({dup:i,orig:seenLink[keyL],why:'نفس الرابط'});
    else if(seenName[keyN])dups.push({dup:i,orig:seenName[keyN],why:'نفس الاسم والمادة'});
    else{seenLink[keyL]=i;seenName[keyN]=i}
  });
  DUP_IDS=dups.filter(x=>OWNER||x.dup.by===ME).map(x=>x.dup.id);
  if(!dups.length)return tool('<h3>♻️ كشف الملفات المكررة</h3><p>مفيش أي ملفات مكررة في المنصة ✅</p>');
  tool(`<h3>♻️ ملفات مكررة (${dups.length})</h3>
    <p style="font-size:12px;color:var(--text-muted);margin:0 0 10px">تقدر تنقل النسخ المكررة لسلة المحذوفات بضغطة واحدة (مع الاحتفاظ بالنسخة الأقدم).</p>
    ${DUP_IDS.length?`<button type="button" class="btn btn-danger" style="width:100%;margin-bottom:10px" onclick="deleteAllDups()">🗑️ نقل ${DUP_IDS.length} نسخة مكررة للسلة</button>`:''}
    ${dups.slice(0,40).map(x=>`<div class="ev"><div><b>${esc(x.dup.title)}</b><br><small>${esc(x.dup.subject)} • ${esc(x.why)}</small></div><button type="button" class="btn btn-danger sm" onclick="deleteMat('${safeId(x.dup.id)}');closeModal('toolModal')">🗑️</button></div>`).join('')}`);
}
async function deleteAllDups(){
  if(!DUP_IDS.length||!(await askConfirm('نقل '+DUP_IDS.length+' ملف مكرر لسلة المحذوفات؟')))return;
  if(await act('bulkdel',{ids:DUP_IDS}))closeModal('toolModal');
}

/* مشاركة مادة برابط مباشر */
function shareSub(sub){
  const p=userPath,u=location.origin+location.pathname+'#go='+encodeURIComponent([p.track,p.dept,p.level,p.semester,sub].join('|'));
  if(navigator.share)navigator.share({title:sub,text:'مادة '+sub+' على FCI-Materials',url:u}).catch(()=>{});else copyText(u);
}
function applyHash(){
  const m=location.hash.match(/^#go=(.+)$/);if(!m)return;let a=[];try{a=decodeURIComponent(m[1]).split('|')}catch(e){}
  if(a.length<5)return;
  userPath={track:a[0],dept:a[1],level:a[2]};activeSub=a.slice(4).join('|');activeType=null;showSection('studentFlow');showResults(a[3]);history.replaceState(null,'',location.pathname);
}

/* أدوات الأدمن */
const itemRow=m=>`<div class="ev"><div><b>${esc(m.title)}</b><br><small>${esc(m.subject)} • ⬇${m.downloads||0} 👁${m.views||0}</small></div><a class="btn sm" href="${safeHref(m.viewLink)}" target="_blank" rel="noopener noreferrer">عرض</a></div>`;
function openDash(){
  const db=getDB(),sum=f=>db.reduce((a,i)=>a+(i[f]||0),0),by={};
  db.forEach(i=>{const o=by[i.subject]=by[i.subject]||{n:0,u:0};o.n++;o.u+=(i.views||0)+(i.downloads||0)});
  const top=db.slice().sort((a,b)=>((b.views||0)+(b.downloads||0))-((a.views||0)+(a.downloads||0))).slice(0,6);
  tool(`<h3>📈 إحصائيات الموقع</h3><div class="stats-container"><div class="stat-box"><div class="stat-num">${db.length}</div>ملف</div><div class="stat-box"><div class="stat-num">${sum('views')}</div>مشاهدة</div><div class="stat-box"><div class="stat-num">${sum('downloads')}</div>تحميل</div></div><h4>أكتر المواد استخداماً</h4>${Object.keys(by).sort((a,b)=>by[b].u-by[a].u).slice(0,6).map(k=>`<div class="ev"><span>${esc(k)}</span><span>${by[k].u} استخدام • ${by[k].n} ملف</span></div>`).join('')}<h4>أكتر الملفات</h4>${top.map(itemRow).join('')}`);
  visitsInto();adminsInto();
}
async function openLog(){
  try{const j=await api('loglist');tool(`<h3>🧾 سجل النشاط</h3>${j.log.length?j.log.map(l=>`<div class="ev"><div><b>${esc(l.a)}</b> <small>${esc(l.d)}</small><br><small>${esc(l.n)} • ${esc(l.t)}</small></div></div>`).join(''):'<p>لا يوجد نشاط.</p>'}`)}catch(e){toast(e.message||'خطأ',1)}
}
function openManage(){
  tool(`<h3>🛠 إدارة الجدول</h3><div class="form-grid"><select id="sT" class="form-select"><option>عام</option><option>خاص</option></select><select id="sD" class="form-select">${['مشترك'].concat(DEPTS).map(x=>`<option>${x}</option>`).join('')}</select><select id="sL" class="form-select">${LEVELS.map(x=>`<option>${x}</option>`).join('')}</select><select id="sDay" class="form-select">${DAYS.map(x=>`<option>${x}</option>`).join('')}</select><input id="sTm" class="form-input" placeholder="الوقت 10:00 - 12:00"><input id="sS" class="form-input" placeholder="المادة"><input id="sP" class="form-input" placeholder="المكان (قاعة 3)"></div><button class="btn" style="width:100%;margin-top:6px" onclick="addS()">➕ إضافة للجدول</button><hr><h4>الجدول (${SCHED.length})</h4>${SCHED.slice(-25).map(x=>`<div class="ev"><div><small>${esc(x.level)} • ${esc(x.day)}</small> ${esc(x.subject)}</div><button class="btn btn-danger sm" data-cd="${esc(x.id)}">🗑️</button></div>`).join('')}`);
}
function addS(){
  const f={track:$('sT').value,dept:$('sD').value,level:$('sL').value,day:$('sDay').value,time:$('sTm').value.trim(),subject:$('sS').value.trim(),place:$('sP').value.trim()};
  if(!f.subject||!f.time)return toast('اكتب المادة والوقت',1);
  act('coladd',{col:'schedule',f},'تمت الإضافة').then(ok=>ok&&openManage());
}
async function saveBulk(){
  const base=formBase();
  if(!base.subject)return toast('اكتب اسم المادة في الفورم اللي فوق',1);
  let bad=0;const items=[];
  $('addBulk').value.split('\n').forEach(l=>{
    l=l.trim();if(!l)return;const i=l.indexOf('|'),t=i>0?l.slice(0,i).trim():'',u=safeUrl(i>0?l.slice(i+1).trim():'');
    if(!t||!u){bad++;return}items.push(Object.assign({},base,{title:t,viewLink:u,downloadLink:getDL(u)}));
  });
  const dn=items.filter(x=>dupOf(x.viewLink,x.title,x.subject)).length;
  if(dn){if(!(await askConfirm(dn+' من الملفات موجودة قبل كده. نتخطاها ونكمل؟')))return;for(let i=items.length-1;i>=0;i--)if(dupOf(items[i].viewLink,items[i].title,items[i].subject))items.splice(i,1)}
  if(!items.length)return toast('مفيش سطور صحيحة (العنوان | الرابط)',1);
  if(items.length>40)return toast('الحد الأقصى 40 ملف في المرة',1);
  if(await act('addmany',{items},'تم نشر '+items.length+' ملف'+(bad?' (وتخطيت '+bad+' سطر غلط)':''))){$('addBulk').value='';showAddJumpBanner(base)}
}
function openCopy(id){
  const m=getDB().find(x=>x.id===id);if(!m)return;
  tool(`<h3>📋 نسخ الملف لمسار تاني</h3><small>${esc(m.title)}</small><div class="form-group" style="margin-top:8px"><label>النظام</label><select id="cpT" class="form-select">${opts(['عام','خاص'],m.track)}</select></div><div class="form-group"><label>القسم</label><select id="cpD" class="form-select">${opts(['مشترك'].concat(DEPTS),m.dept)}</select></div><div class="form-group"><label>الفرقة</label><select id="cpL" class="form-select">${opts(LEVELS,m.level)}</select></div><div class="form-group"><label>الفصل</label><select id="cpS" class="form-select">${opts(['الفصل الأول','الفصل الثاني'],m.semester)}</select></div><button class="btn" style="width:100%" onclick="doCopy('${safeId(m.id)}')">نسخ</button>`);
}
function doCopy(id){
  const m=getDB().find(x=>x.id===id);if(!m)return;
  const it=Object.assign({},m,{track:$('cpT').value,dept:$('cpD').value,level:$('cpL').value,semester:$('cpS').value});
  if(it.track===m.track&&it.dept===m.dept&&it.level===m.level&&it.semester===m.semester)return toast('اختار مسار مختلف',1);
  act('addmany',{items:[it]},'تم النسخ ✅').then(ok=>ok&&closeModal('toolModal'));
}

/* تبويبات لوحة الأدمن */
const AF={q:'',s:'',n:50,k:'',sel:{}};
function adminTab(t){
  document.querySelectorAll('.apanel').forEach(x=>x.hidden=x.id!=='ap-'+t);
  document.querySelectorAll('.atab').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  if(t==='home'){updateStats();renderReports();loadAttention()}
  if(t==='files')renderAdminFiles();
  if(t==='students')loadStudentsTab();
  if(t==='settings'&&OWNER){loadTreeCfg();loadTgCfg();loadAiCfg()}
}
function renderAdminFiles(){
  const db=getDB().slice().sort((a,b)=>b.timestamp-a.timestamp),q=norm(AF.q);
  const subs=Array.from(new Set(db.map(i=>i.subject))).sort((a,b)=>a.localeCompare(b,'ar'));
  if(AF.k!==subs.join('|')){AF.k=subs.join('|');if(AF.s&&subs.indexOf(AF.s)<0)AF.s='';$('afSub').innerHTML='<option value="">كل المواد</option>'+opts(subs,AF.s)}
  const all=db.filter(i=>(!AF.s||i.subject===AF.s)&&(!q||norm(i.title+' '+i.subject+' '+(i.tags||'')+' '+(i.doctor||'')).includes(q)));
  const l=all.slice(0,AF.n);
  $('afCount').textContent=all.length+' ملف';
  $('afList').innerHTML=l.length?l.map(m=>{
    const can=OWNER||m.by===ME,sch=m.publishAt&&+m.publishAt>Date.now();
    return `<div class="frow"><label style="display:flex;align-items:center;padding:0 4px"><input type="checkbox" class="afck" data-id="${safeId(m.id)}" ${AF.sel[m.id]?'checked':''}></label><div class="finfo"><b>${esc(m.title)}</b>${m.hidden?' <span class="countdown-badge">🙈 مخفي</span>':''}${sch?' <span class="countdown-badge">⏳ مجدول</span>':''}<br><small>${esc(m.subject)} • ${esc(m.type)} • ${esc(m.level)} • ${esc(m.dept)} • ${esc(m.semester)}</small><br><small>${esc(m.week||'عام')} • 👁${m.views||0} ⬇${m.downloads||0}${m.by?' • ✍ '+esc(m.by):''}</small></div><div class="action-links"><a class="open-btn" href="${safeHref(m.viewLink)}" target="_blank" rel="noopener noreferrer">فتح</a>${can?`<button class="edit-btn" onclick="openCopy('${safeId(m.id)}')" aria-label="نسخ">📋</button><button class="edit-btn" onclick="openEdit('${safeId(m.id)}')" aria-label="تعديل">✏️</button><button class="delete-btn" onclick="deleteMat('${safeId(m.id)}')" aria-label="حذف">🗑️</button>`:''}</div></div>`;
  }).join(''):'<p style="text-align:center">لا توجد ملفات.</p>';
  $('afMore').style.display=all.length>AF.n?'block':'none';
}
$('afSearch').addEventListener('input',debounce(e=>{AF.q=e.target.value.trim();AF.n=50;renderAdminFiles()},120));
$('afSub').addEventListener('change',e=>{AF.s=e.target.value;AF.n=50;renderAdminFiles()});
$('afMore').addEventListener('click',()=>{AF.n+=50;renderAdminFiles()});

/* الأتمتة، درايف، تليجرام، صحة الروابط، السلة */
function dupOf(link,title,subject){
  const m=String(link).match(/\/d\/([\w-]+)/)||String(link).match(/[?&]id=([\w-]+)/),id=m?m[1]:'';
  return getDB().find(i=>(id&&String(i.viewLink||'').indexOf(id)>-1)||i.viewLink===link||(i.subject===subject&&i.title===title));
}
function formBase(){
  return {track:$('addTrack').value,dept:$('addDept').value,level:$('addLevel').value,semester:$('addSemester').value,subject:$('addSubject').value.trim(),week:$('addWeek').value,type:$('addType').value,deadline:$('addDeadline').value,tags:$('addTags').value.trim(),doctor:$('addDoctor').value.trim(),publishAt:$('addPub').value?String(new Date($('addPub').value).getTime()):''};
}
async function saveDriveImport(){
  const folder=$('driveFolder').value.trim(),base=formBase();
  if(!folder)return toast('الصق رابط الفولدر',1);
  if(!base.subject)return toast('اكتب اسم المادة في الكروت اللي فوق',1);
  if(!(await askConfirm('هيتم استيراد ملفات الفولدر لمادة «'+base.subject+'»'+($('driveShare').checked?' وفتح مشاركتها لأي حد معاه الرابط':'')+'. نكمل؟')))return;
  saveLastAddPath();
  showDriveProgress('📥 جاري استيراد فولدر المادة...','بيقرأ الملفات ويفتح المشاركة...',20);
  let totalImp=0,totalSkip=0,more=true,round=0;
  try{
    while(more&&round<6){
      round++;
      const wantShare=$('driveShare').checked;
      const j=await api('driveimport',{folder,base,auto:$('driveAuto').checked,share:wantShare,confirmPublicShare:wantShare,fast:true});
      totalImp+=(j.imported||0);totalSkip+=(j.skipped||0);more=!!j.hasMore;
      showDriveProgress('📥 جاري استيراد فولدر المادة...',`اتستورد ${totalImp} ملف حتى الآن...`,more?Math.min(92,25+round*15):100);
    }
    if(totalImp){await refresh('force');showAddJumpBanner(base)}
    if(!more)$('driveFolder').value='';
    closeModal('toolModal');
    toast('تم استيراد '+totalImp+' ملف'+(totalSkip?' • اتخطّى '+totalSkip+' موجود':'')+(more?' • فيه ملفات زيادة اضغط تاني':'')+' ✅');
  }catch(e){
    closeModal('toolModal');
    toast(e.message||'خطأ في الاستيراد',1);
  }
}
async function openHealth(){try{const j=await api('healthlist');showHealth(j.health)}catch(e){toast(e.message||'خطأ',1)}}
function showHealth(a){
  tool(`<h3>🩺 صحة الروابط</h3><p style="font-size:12px;margin:0 0 8px">الفحص الأسبوعي تلقائي لو فعّلت الأتمتة، وتقدر تفحص دفعة دلوقتي.</p><button class="btn btn-warning" style="width:100%;margin-bottom:8px" onclick="healthRun()">🔄 افحص 25 ملف الآن</button>${OWNER&&a.some(h=>/مش مشارك/.test(h.problem))?'<button class="btn btn-danger" style="width:100%;margin-bottom:8px" onclick="healFix()">🔓 افتح مشاركة الملفات المقفولة</button>':''}${a.length?a.map(h=>`<div class="ev"><div><b>${esc(h.title)}</b><br><small>${esc(h.subject)} • ${esc(h.problem)} • ${esc(h.at)}</small></div><button class="btn sm" onclick="closeModal('toolModal');openEdit('${safeId(h.id)}')">✏️</button></div>`).join(''):'<p>مفيش روابط فيها مشاكل مسجلة ✅</p>'}`);
}
async function healthRun(){toast('بيفحص...');try{const j=await api('healthrun');toast(j.msg||'تم');showHealth(j.health)}catch(e){toast(e.message||'خطأ',1)}}
async function openTrash(){
  try{const j=await api('trashlist');tool(`<h3>♻️ سلة المحذوفات (30 يوم)</h3>${j.trash.length?j.trash.map(t=>`<div class="ev"><div><b>${esc(t.title)}</b><br><small>${esc(t.subject)} • حذفه ${esc(t.by)} • ${esc(t.at)}</small></div><button class="btn sm" data-rs="${esc(t.id)}">استرجاع</button></div>`).join(''):'<p>السلة فاضية.</p>'}`)}catch(e){toast(e.message||'خطأ',1)}
}
async function loadTgCfg(){
  try{
    const t=(await api('tgget')).tg||{};
    if(t.chat&&!$('tgChat').value)$('tgChat').value=t.chat;
    if(t.pubChat&&!$('tgPubChat').value)$('tgPubChat').value=t.pubChat;
    if(t.site)$('tgSite').value=t.site;
    if(t.hasToken)$('tgToken').placeholder='✅ التوكن محفوظ (سيبه فاضي لو مش هتغيره)';
  }catch(e){}
}
function tgSave(){act('tgset',{token:$('tgToken').value.trim(),chat:$('tgChat').value.trim(),pubChat:$('tgPubChat').value.trim(),site:$('tgSite').value.trim()},'تم الحفظ ✅').then(ok=>{if(ok){$('tgToken').value='';loadTgCfg()}})}
function tgTest(){act('tgtest',{},'وصلت رسالة التجربة ✅')}
async function installAuto(){
  const iv=$('syncIntervalSel')?$('syncIntervalSel').value:'30';
  const lbl={'15':'كل 15 دقيقة','30':'كل 30 دقيقة','60':'كل ساعة','360':'كل 6 ساعات','1440':'مرة يومياً'}[iv]||'كل 30 دقيقة';
  if(await askConfirm('هيتفعّل الربط التلقائي مع درايف ('+lbl+') + نسخ احتياطي يومي + ملخص أسبوعي + فحص الروابط. نكمل؟')){
    if(await act('installtriggers',{interval:iv}))loadTreeCfg();
  }
}
function visitPing(){const t=new Date().toISOString().slice(0,10);if(hasApi()&&ld('fci_vday','')!==t){sv('fci_vday',t);api('visit').catch(()=>{})}}
function visitsInto(){
  api('visitstats').then(j=>{
    const b=$('toolBody');if(!b||!j.days)return;const d=document.createElement('div');const mx=Math.max(1,...j.days.map(x=>x.n));
    d.innerHTML=`<h4>👥 زيارات الموقع (أجهزة في اليوم) — الإجمالي ${j.total}</h4><div style="display:flex;gap:3px;align-items:flex-end;height:70px;margin-bottom:10px">${j.days.map(x=>`<div title="${esc(x.d)}: ${x.n}" style="flex:1;background:var(--accent-color);border-radius:3px 3px 0 0;height:${Math.max(3,Math.round(x.n/mx*60))}px"></div>`).join('')}</div>`;
    b.insertBefore(d,b.lastElementChild);
  }).catch(()=>{});
}
$('tgSite').value=/^https?:/.test(location.href)?location.origin+location.pathname:'';

/* الخلفية المتحركة */
(function(){
  const b=$('bg');
  ['</>','{ }','01','AI','#!','∑','fn()','SQL'].forEach((t,i)=>{
    const e=document.createElement('span');e.className='sym';e.textContent=t;
    e.style.cssText=`left:${(i*12+Math.random()*6)%94}%;font-size:${16+Math.random()*20}px;animation-duration:${26+Math.random()*24}s;animation-delay:-${Math.random()*40}s`;
    b.appendChild(e);
  });
})();

/* التشغيل الفوري الآمن */
let _appBooted=false;
function bootApp(){
  if(_appBooted)return;
  _appBooted=true;
  const sp=$('splashScreen');if(sp){if(DB.length){sp.remove()}else{setTimeout(()=>{sp.style.opacity=0;setTimeout(()=>sp.remove(),250)},180)}}
  const syncOnlineUI=()=>{const b=$('offlineBanner');if(b)b.classList.toggle('show',!navigator.onLine)};
  syncOnlineUI();
  window.addEventListener('offline',()=>{syncOnlineUI();toast('انقطع الإنترنت — يتم عرض النسخة المحفوظة 📡',1)});
  window.addEventListener('online',()=>{syncOnlineUI();toast('عاد الاتصال بالإنترنت ✅');refresh('force')});
  const lastU=ld('fci_last_adm_user','');if(lastU&&$('adminUsername'))$('adminUsername').value=lastU;
  loadAnnouncement();
  updateAddDatalists();
  updatePomoUI();
  goHome();
  applyHash();
  if(!ld('fci_seen',0))sv('fci_seen',Date.now());
  renderNotif();
  restoreAdminSession().then(restored=>{if(!restored)refresh('force').then(visitPing)});
  window.addEventListener('scroll',()=>{
    const b=$('scrollTopBtn');
    if(b)b.classList.toggle('show',window.scrollY>340);
  },{passive:true});
  if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootApp);
}else{
  bootApp();
}
window.addEventListener('load',bootApp);
/* ==========================================================================
   v13 AI Campus Edition: Gemini Pro Tutor, Interactive MCQ Quiz Bank,
   Contributors Leaderboard, Course Roadmap, Senior Tips & Q&A Forum
   ========================================================================== */
let activeAiTab='tutor';
let _activeQuiz=null,_quizAnswers={},_quizSubmitted=false,_quizTimer=null,_quizSecLeft=0,_lastGeneratedQuiz=null;

function formatAiText(raw){
  let s=esc(String(raw||''));
  const blocks=[];
  s=s.replace(/```(\w*)\n?([\s\S]*?)```/g,(_,lang,code)=>{
    const idx=blocks.length;
    blocks.push(`<pre><code>${code.trim()}</code></pre>`);
    return `@@CODEBLK${idx}@@`;
  });
  s=s.replace(/`([^`\n]+)`/g,'<code>$1</code>');
  s=s.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>');
  s=s.replace(/^###\s+(.+)$/gm,'<h4 style="margin:10px 0 4px">$1</h4>');
  s=s.replace(/^[-*]\s+(.+)$/gm,'• $1');
  s=s.replace(/\n/g,'<br>');
  blocks.forEach((b,i)=>{s=s.replace(`@@CODEBLK${i}@@`,b)});
  return s;
}

function switchAiTab(tab){
  activeAiTab=tab||'tutor';
  document.querySelectorAll('.ai-subpanel').forEach(p=>p.hidden=(p.id!=='aiTab-'+activeAiTab));
  document.querySelectorAll('[data-ai-tab]').forEach(b=>b.classList.toggle('active',b.dataset.aiTab===activeAiTab));
  if(activeAiTab==='quizzes')renderQuizBank();
  if(activeAiTab==='leaderboard')renderLeaderboard();
  if(activeAiTab==='roadmap')renderRoadmap();
}

function renderAiHub(){
  if($('aiStatusPill'))$('aiStatusPill').textContent=AI_ENABLED?('🟢 متصل'+(AI_MODEL?' ('+AI_MODEL+')':'')):'⚪ بانتظار API Key من الإدارة';
  if($('addQuizBankBtn'))$('addQuizBankBtn').style.display=isAdmin?'inline-flex':'none';
  if($('addRoadBtn'))$('addRoadBtn').style.display=OWNER?'inline-flex':'none';
  if($('roadDeptSel')&&userPath&&userPath.dept&&!$('roadDeptSel').dataset.synced){
    const val=userPath.track==='خاص'&&DEPT_SPC.includes(userPath.dept)?userPath.dept:'الأقسام العامة';
    $('roadDeptSel').value=val;$('roadDeptSel').dataset.synced='1';
  }
  switchAiTab(activeAiTab);
}

function openAiForSubject(sub,mode){
  switchMainView('aiView');
  if(mode==='quiz'){
    switchAiTab('quizzes');
    if($('aiQuizSubj'))$('aiQuizSubj').value=sub||'';
    if($('aiQuizText'))$('aiQuizText').focus();
    return;
  }
  switchAiTab('tutor');
  if($('aiTutorSubj'))$('aiTutorSubj').value=sub||'';
  if($('aiTutorFile'))$('aiTutorFile').value='';
  if($('aiTutorContextBadge'))$('aiTutorContextBadge').style.display='none';
  if($('aiTutorPrompt'))$('aiTutorPrompt').focus();
}

function askAiFromReader(){
  if(!RD_CUR)return;
  const sub=RD_CUR.subject||'',title=RD_CUR.title||'';
  closeReader();
  switchMainView('aiView');
  switchAiTab('tutor');
  if($('aiTutorSubj'))$('aiTutorSubj').value=sub;
  if($('aiTutorFile'))$('aiTutorFile').value=title;
  if($('aiTutorContextBadge')){
    $('aiTutorContextBadge').style.display='block';
    $('aiTutorContextBadge').innerHTML=`<span class="tag">📄 بتسأل عن: ${esc(title)} (${esc(sub)})</span>`;
  }
  if($('aiTutorPrompt')){$('aiTutorPrompt').placeholder='اسأل أي سؤال عن «'+title+'» أو الصق الجزء اللي مش فاهمه...';$('aiTutorPrompt').focus()}
}

async function askAiTutor(){
  const q=$('aiTutorPrompt').value.trim();
  if(!q)return toast('اكتب سؤالك الأول',1);
  const btn=$('aiTutorSendBtn'),out=$('aiTutorReply');
  btn.disabled=true;btn.textContent='⏳ Gemini Pro بيفكّر...';
  out.innerHTML='<div class="ai-reply-box">⏳ جاري تجهيز الشرح بواسطة Gemini Pro...</div>';
  try{
    const j=await api('aitutor',{
      q,
      subject:$('aiTutorSubj').value.trim(),
      file:$('aiTutorFile').value.trim(),
      mode:$('aiTutorMode').value
    });
    out.innerHTML=`<div class="ai-reply-box"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;color:var(--text-muted)"><span>🤖 <b>إجابة ${esc(j.model||'Gemini Pro')}</b></span><button type="button" class="pill-btn" onclick="copyText(window._lastAiAns||'')">📋 نسخ</button></div><div>${formatAiText(j.answer)}</div></div>`;
    window._lastAiAns=j.answer||'';
  }catch(e){
    out.innerHTML=`<div class="ai-reply-box" style="border-right-color:var(--danger)">⚠️ ${esc(e.message||'تعذر الاتصال بـ Gemini Pro')}</div>`;
  }finally{
    btn.disabled=false;btn.textContent='✨ اسأل Gemini Pro';
  }
}

/* ===== مولّد الكويزات + بنك الاختبارات التفاعلي ===== */
function renderQuizBank(){
  const box=$('quizBankList');if(!box)return;
  const scores=ld('fci_quiz_scores',{});
  const p=userPath;
  const list=QUIZZES.slice().sort((a,b)=>(b.ts||0)-(a.ts||0));
  if(!list.length){
    box.innerHTML='<div class="cat-empty-hint">لسه مفيش اختبارات محفوظة في البنك. استخدم مولّد الكويزات بالذكاء الاصطناعي جنبه، أو الأدمن يضيف اختبارات للدفعة!</div>';
    return;
  }
  const matching=p.level?list.filter(q=>q.level===p.level&&(!p.track||q.track===p.track)):list;
  const shown=matching.length?matching:list;
  box.innerHTML=shown.map(q=>{
    const best=scores[q.id];
    const canDel=isAdmin&&(OWNER||q.by===ME);
    return `<div class="ev">
      <div>
        <b>🧪 ${esc(q.title)}</b> ${best!=null?`<span class="badge-soft badge-ok">أعلى درجة: ${best}%</span>`:''}<br>
        <small>${esc(q.subject)} • ${(q.questions||[]).length} سؤال • ⏱ ${q.minutes||10} د • ${esc(q.level||'')}</small>
      </div>
      <div class="action-links">
        <button type="button" class="btn sm" onclick="startSavedQuiz('${safeId(q.id)}')">▶ ابدأ الاختبار</button>
        ${canDel?`<button type="button" class="btn btn-danger sm" onclick="deleteQuiz('${safeId(q.id)}')">🗑️</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function startSavedQuiz(id){
  const q=QUIZZES.find(x=>x.id===id);
  if(!q)return toast('الاختبار غير موجود',1);
  startQuizRunner(q,false);
}

async function generateAiQuiz(){
  const text=$('aiQuizText').value.trim();
  const subj=$('aiQuizSubj').value.trim();
  if(text.length<15)return toast('اكتب الموضوع أو الصق فقرة من المحاضرة (15 حرف على الأقل)',1);
  const btn=$('aiQuizGenBtn');
  btn.disabled=true;btn.textContent='⏳ Gemini Pro بيجهّز الأسئلة...';
  try{
    const j=await api('aiquiz',{
      text,subject:subj,
      count:+$('aiQuizCount').value||5,
      diff:$('aiQuizDiff').value
    });
    _lastGeneratedQuiz=j.quiz;
    startQuizRunner(j.quiz,isAdmin);
  }catch(e){
    toast(e.message||'تعذر توليد الاختبار',1);
  }finally{
    btn.disabled=false;btn.textContent='⚡ ولّد الاختبار وابدأ الآن';
  }
}

function startQuizRunner(quiz,canSave){
  clearInterval(_quizTimer);
  _activeQuiz=quiz;_quizAnswers={};_quizSubmitted=false;
  _quizSecLeft=Math.max(60,(Number(quiz.minutes)||10)*60);
  renderQuizModal(canSave);
  _quizTimer=setInterval(()=>{
    if(_quizSubmitted||$('toolModal').style.display!=='flex'){clearInterval(_quizTimer);return}
    _quizSecLeft--;
    const tEl=$('quizTimerBadge');
    if(tEl)tEl.textContent='⏱ '+Math.floor(_quizSecLeft/60)+':'+String(_quizSecLeft%60).padStart(2,'0');
    if(_quizSecLeft<=0){clearInterval(_quizTimer);submitQuizRun(canSave)}
  },1000);
}

function renderQuizModal(canSave){
  const qz=_activeQuiz;if(!qz)return;
  const qs=qz.questions||[];
  const mins=Math.floor(_quizSecLeft/60),secs=String(_quizSecLeft%60).padStart(2,'0');
  let scoreHtml='';
  if(_quizSubmitted){
    let ok=0;
    qs.forEach((q,i)=>{if(_quizAnswers[i]===q.ans)ok++});
    const pct=qs.length?Math.round(ok/qs.length*100):0;
    if(qz.id){
      const sc=ld('fci_quiz_scores',{});
      sc[qz.id]=Math.max(sc[qz.id]||0,pct);
      sv('fci_quiz_scores',sc);
      if(!$('aiView').hidden&&activeAiTab==='quizzes')renderQuizBank();
    }
    scoreHtml=`<div class="jump-banner" style="margin-bottom:12px"><div><b>🎯 نتيجتك: ${ok} من ${qs.length} (${pct}%)</b><br><small>${pct>=80?'ممتاز جداً! مستعد للامتحان 🔥':pct>=50?'كويس! راجع الأسئلة الغلط تحت':'محتاج مراجعة سريعة على الجزء ده'}</small></div><button type="button" class="btn sm" onclick="startQuizRunner(_activeQuiz,${!!canSave})">↺ إعادة الاختبار</button></div>`;
  }
  const body=qs.map((q,qi)=>{
    const picked=_quizAnswers[qi];
    return `<div class="quiz-q-card">
      <div style="font-weight:800;font-size:14px;margin-bottom:6px">${qi+1}) ${esc(q.q)}</div>
      ${(q.opts||[]).map((op,oi)=>{
        let cls='quiz-opt';
        if(_quizSubmitted){
          if(oi===q.ans)cls+=' correct';
          else if(picked===oi&&oi!==q.ans)cls+=' wrong';
        }else if(picked===oi)cls+=' selected';
        return `<button type="button" class="${cls}" ${_quizSubmitted?'disabled':''} onclick="selectQuizOpt(${qi},${oi},${!!canSave})"><span>${['أ','ب','ج','د'][oi]||oi+1}.</span><span>${esc(op)}</span></button>`;
      }).join('')}
      ${_quizSubmitted&&q.exp?`<div class="quiz-exp">💡 <b>التوضيح:</b> ${esc(q.exp)}</div>`:''}
    </div>`;
  }).join('');
  tool(`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <h3 style="margin:0">🧪 ${esc(qz.title||'اختبار MCQ')}</h3>
      <span id="quizTimerBadge" class="quiz-timer-pill">⏱ ${mins}:${secs}</span>
    </div>
    <small style="color:var(--text-muted);display:block;margin-bottom:10px">${esc(qz.subject||'')} • ${qs.length} سؤال</small>
    ${scoreHtml}${body}
    ${!_quizSubmitted?`<button type="button" class="btn btn-success" style="width:100%;margin-top:6px" onclick="submitQuizRun(${!!canSave})">✅ تسليم الإجابات وعرض النتيجة</button>`:''}
    ${canSave&&isAdmin?`<button type="button" class="btn btn-warning" style="width:100%;margin-top:8px" onclick="saveGeneratedQuizToBank()">💾 حفظ الاختبار ده في بنك اختبارات الدفعة</button>`:''}`);
}

function selectQuizOpt(qi,oi,canSave){
  if(_quizSubmitted)return;
  _quizAnswers[qi]=oi;
  renderQuizModal(canSave);
}

function submitQuizRun(canSave){
  clearInterval(_quizTimer);
  _quizSubmitted=true;
  renderQuizModal(canSave);
}

async function saveGeneratedQuizToBank(){
  if(!_lastGeneratedQuiz)return;
  const p=userPath.level?userPath:{track:$('addTrack').value,dept:$('addDept').value,level:$('addLevel').value,semester:$('addSemester').value};
  const payload=Object.assign({},_lastGeneratedQuiz,{track:p.track||'عام',dept:p.dept||'مشترك',level:p.level||'الفرقة الثانية',semester:p.semester||'الفصل الأول'});
  if(await act('quizadd',payload,'تم حفظ الاختبار في البنك للطلاب ✅'))renderQuizBank();
}

function openAddQuizModal(){
  if(!isAdmin)return toast('للمشرفين فقط',1);
  tool(`<h3>🧪 إضافة اختبار تفاعلي لبنك الاختبارات</h3>
    <div class="form-grid">
      <select id="qzTr" class="form-select">${opts(['عام','خاص'],userPath.track||'خاص')}</select>
      <select id="qzDp" class="form-select">${opts(['مشترك'].concat(DEPTS),userPath.dept||'الذكاء الاصطناعي')}</select>
      <select id="qzLv" class="form-select">${opts(LEVELS,userPath.level||'الفرقة الثانية')}</select>
      <select id="qzSm" class="form-select">${opts(['الفصل الأول','الفصل الثاني'],userPath.semester||'الفصل الأول')}</select>
    </div>
    <div class="form-grid" style="margin-top:8px">
      <input id="qzSubj" list="dlSubjects" class="form-input" placeholder="اسم المادة">
      <input id="qzMin" type="number" min="2" max="120" value="15" class="form-input" placeholder="المدة بالدقائق">
    </div>
    <input id="qzTitle" class="form-input" style="margin-top:8px" placeholder="عنوان الاختبار (مثال: مراجعة ميدتيرم 2026)">
    <p style="font-size:11.5px;color:var(--text-muted);margin:8px 0 4px">اكتب كل سؤال في سطر بالشكل: <code>السؤال | اختيار1 | اختيار2 | اختيار3 | اختيار4 | رقم الإجابة الصحيحة (1-4) | شرح اختياري</code></p>
    <textarea id="qzLines" rows="6" class="form-input" placeholder="ما تعقيد Binary Search؟ | O(n) | O(log n) | O(n^2) | O(1) | 2 | لأننا نقسم المجال لنصفين في كل خطوة"></textarea>
    <button type="button" class="btn btn-success" style="width:100%;margin-top:10px" onclick="submitNewQuiz()">🚀 نشر الاختبار للطلاب</button>`);
}

async function submitNewQuiz(){
  const questions=[];
  $('qzLines').value.split('\n').forEach(line=>{
    line=line.trim();if(!line)return;
    const p=line.split('|').map(x=>x.trim());
    if(p.length>=6){
      const ansIdx=Math.max(0,Math.min(3,(parseInt(p[5],10)||1)-1));
      questions.push({q:p[0],opts:p.slice(1,5),ans:ansIdx,exp:p[6]||''});
    }
  });
  if(!questions.length)return toast('اكتب سؤال واحد على الأقل بالشكل الصحيح المفصول بـ |',1);
  const res=await act('quizadd',{
    track:$('qzTr').value,dept:$('qzDp').value,level:$('qzLv').value,semester:$('qzSm').value,
    subject:$('qzSubj').value.trim(),title:$('qzTitle').value.trim(),minutes:+$('qzMin').value||15,questions
  });
  if(res){closeModal('toolModal');renderQuizBank()}
}

async function deleteQuiz(id){
  if(await askConfirm('حذف هذا الاختبار التفاعلي؟')){
    if(await act('quizdel',{id}))renderQuizBank();
  }
}

/* ===== لوحة شرف المساهمين ===== */
function renderLeaderboard(){
  const box=$('leaderboardList');if(!box)return;
  const counts={};
  pubItems().forEach(i=>{
    const name=String(i.contributor||i.by||'').trim();
    if(!name||name==='تلقائي')return;
    const rec=counts[name]=counts[name]||{name,n:0,isStudent:!!i.contributor,subs:new Set()};
    rec.n++;if(i.contributor)rec.isStudent=true;if(i.subject)rec.subs.add(i.subject);
  });
  const arr=Object.values(counts).sort((a,b)=>(b.isStudent-a.isStudent)||(b.n-a.n)).slice(0,25);
  if(!arr.length){
    box.innerHTML='<div class="cat-empty-hint">لسه مفيش مساهمين مسجلين — كن أول واحد يظهر في لوحة الشرف!</div>';
    return;
  }
  const badgeOf=n=>n>=20?'👑 أسطورة الكلية':n>=10?'🌟 نجم الدفعة':n>=5?'🔥 بطل الملخصات':'🤝 داعم الدفعة';
  box.innerHTML=arr.map((c,idx)=>{
    const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'#'+(idx+1);
    return `<div class="lb-row ${idx===0?'top1':''}">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="lb-rank">${medal}</div>
        <div>
          <b>${esc(c.name)}</b> <span class="badge-soft ${c.isStudent?'badge-ok':'badge-lec'}">${c.isStudent?'طالب مساهم':'مشرف'}</span><br>
          <small style="color:var(--text-muted)">${badgeOf(c.n)} • ${c.subs.size} مادة</small>
        </div>
      </div>
      <div style="text-align:center">
        <div style="font-size:20px;font-weight:900;color:var(--accent)">${c.n}</div>
        <small style="color:var(--text-muted)">ملف</small>
      </div>
    </div>`;
  }).join('');
}

/* ===== خريطة المقررات والمتطلبات ===== */
const DEFAULT_ROADMAP=[
  {id:'r1',dept:'الذكاء الاصطناعي',level:'الفرقة الأولى',semester:'الفصل الأول',code:'CS101',name:'مقدمة في علوم الحاسب',hours:3,prereq:''},
  {id:'r2',dept:'الذكاء الاصطناعي',level:'الفرقة الأولى',semester:'الفصل الأول',code:'CS102',name:'أساسيات البرمجة (C++)',hours:3,prereq:''},
  {id:'r3',dept:'الذكاء الاصطناعي',level:'الفرقة الأولى',semester:'الفصل الأول',code:'MA101',name:'رياضيات 1 (تفاضل وتكامل)',hours:3,prereq:''},
  {id:'r4',dept:'الذكاء الاصطناعي',level:'الفرقة الأولى',semester:'الفصل الثاني',code:'CS103',name:'البرمجة الشيئية (OOP)',hours:3,prereq:'أساسيات البرمجة (C++)'},
  {id:'r5',dept:'الذكاء الاصطناعي',level:'الفرقة الأولى',semester:'الفصل الثاني',code:'MA102',name:'تراكيب محددة (Discrete Math)',hours:3,prereq:'رياضيات 1 (تفاضل وتكامل)'},
  {id:'r6',dept:'الذكاء الاصطناعي',level:'الفرقة الأولى',semester:'الفصل الثاني',code:'MA103',name:'جبر خطي واحتمالات',hours:3,prereq:'رياضيات 1 (تفاضل وتكامل)'},
  {id:'r7',dept:'الذكاء الاصطناعي',level:'الفرقة الثانية',semester:'الفصل الأول',code:'CS201',name:'تراكيب البيانات (Data Structures)',hours:3,prereq:'البرمجة الشيئية (OOP)'},
  {id:'r8',dept:'الذكاء الاصطناعي',level:'الفرقة الثانية',semester:'الفصل الأول',code:'AI201',name:'مقدمة في الذكاء الاصطناعي',hours:3,prereq:'تراكيب محددة (Discrete Math)'},
  {id:'r9',dept:'الذكاء الاصطناعي',level:'الفرقة الثانية',semester:'الفصل الأول',code:'IS201',name:'قواعد البيانات (Databases)',hours:3,prereq:'أساسيات البرمجة (C++)'},
  {id:'r10',dept:'الذكاء الاصطناعي',level:'الفرقة الثانية',semester:'الفصل الثاني',code:'CS202',name:'تحليل وتصميم الخوارزميات',hours:3,prereq:'تراكيب البيانات (Data Structures)'},
  {id:'r11',dept:'الذكاء الاصطناعي',level:'الفرقة الثانية',semester:'الفصل الثاني',code:'AI202',name:'تعلم الآلة (Machine Learning)',hours:3,prereq:'مقدمة في الذكاء الاصطناعي'},
  {id:'r12',dept:'الذكاء الاصطناعي',level:'الفرقة الثالثة',semester:'الفصل الأول',code:'AI301',name:'التعلم العميق (Deep Learning)',hours:3,prereq:'تعلم الآلة (Machine Learning)'},
  {id:'r13',dept:'الذكاء الاصطناعي',level:'الفرقة الثالثة',semester:'الفصل الأول',code:'AI302',name:'الرؤية بالحاسب (Computer Vision)',hours:3,prereq:'تعلم الآلة (Machine Learning)'},
  {id:'r14',dept:'الذكاء الاصطناعي',level:'الفرقة الثالثة',semester:'الفصل الثاني',code:'AI303',name:'معالجة اللغات الطبيعية (NLP)',hours:3,prereq:'التعلم العميق (Deep Learning)'},
  {id:'r15',dept:'هندسة البرمجيات',level:'الفرقة الأولى',semester:'الفصل الأول',code:'CS102',name:'أساسيات البرمجة',hours:3,prereq:''},
  {id:'r16',dept:'هندسة البرمجيات',level:'الفرقة الأولى',semester:'الفصل الثاني',code:'CS103',name:'البرمجة الشيئية (OOP)',hours:3,prereq:'أساسيات البرمجة'},
  {id:'r17',dept:'هندسة البرمجيات',level:'الفرقة الثانية',semester:'الفصل الأول',code:'SE201',name:'مقدمة في هندسة البرمجيات',hours:3,prereq:'البرمجة الشيئية (OOP)'},
  {id:'r18',dept:'هندسة البرمجيات',level:'الفرقة الثانية',semester:'الفصل الثاني',code:'SE202',name:'تحليل وتصميم النظم',hours:3,prereq:'مقدمة في هندسة البرمجيات'},
  {id:'r19',dept:'الأمن السيبراني',level:'الفرقة الأولى',semester:'الفصل الأول',code:'CS102',name:'أساسيات البرمجة',hours:3,prereq:''},
  {id:'r20',dept:'الأمن السيبراني',level:'الفرقة الثانية',semester:'الفصل الأول',code:'IT201',name:'شبكات الحاسب',hours:3,prereq:'أساسيات البرمجة'},
  {id:'r21',dept:'الأمن السيبراني',level:'الفرقة الثانية',semester:'الفصل الثاني',code:'CY202',name:'أمن المعلومات والتشفير',hours:3,prereq:'شبكات الحاسب'},
  {id:'r22',dept:'نظم المعلومات الحيوية',level:'الفرقة الأولى',semester:'الفصل الأول',code:'BI101',name:'مقدمة في البيولوجيا الجزيئية',hours:3,prereq:''},
  {id:'r23',dept:'نظم المعلومات الحيوية',level:'الفرقة الثانية',semester:'الفصل الأول',code:'BI201',name:'خوارزميات المعلوماتية الحيوية',hours:3,prereq:'مقدمة في البيولوجيا الجزيئية'},
  {id:'r24',dept:'الأقسام العامة',level:'الفرقة الأولى',semester:'الفصل الأول',code:'CS101',name:'مقدمة حاسبات وبرمجة 1',hours:3,prereq:''},
  {id:'r25',dept:'الأقسام العامة',level:'الفرقة الأولى',semester:'الفصل الثاني',code:'CS102',name:'برمجة 2 (OOP)',hours:3,prereq:'مقدمة حاسبات وبرمجة 1'},
  {id:'r26',dept:'الأقسام العامة',level:'الفرقة الثانية',semester:'الفصل الأول',code:'CS201',name:'تراكيب البيانات',hours:3,prereq:'برمجة 2 (OOP)'},
  {id:'r27',dept:'الأقسام العامة',level:'الفرقة الثانية',semester:'الفصل الثاني',code:'CS202',name:'نظم التشغيل وقواعد البيانات',hours:3,prereq:'تراكيب البيانات'}
];

function renderRoadmap(){
  const sel=$('roadDeptSel'),box=$('roadmapContent');if(!sel||!box)return;
  const dept=sel.value;
  const custom=ROADMAP.filter(r=>(dept==='الأقسام العامة'?r.track==='عام':r.dept===dept));
  const list=custom.length?custom:DEFAULT_ROADMAP.filter(r=>r.dept===dept);
  const passed=ld('fci_road_passed',[]);
  const passedNames=new Set(list.filter(c=>passed.includes(c.dept+'|'+c.name)).map(c=>norm(c.name)));
  const totalHrs=list.reduce((a,c)=>a+(+c.hours||3),0);
  const doneHrs=list.filter(c=>passedNames.has(norm(c.name))).reduce((a,c)=>a+(+c.hours||3),0);
  if($('roadStatsBadge'))$('roadStatsBadge').textContent=`مجتاز: ${doneHrs} / ${totalHrs} ساعة`;
  const byLevel={};
  list.forEach(c=>{const k=c.level+' — '+c.semester;(byLevel[k]=byLevel[k]||[]).push(c)});
  const keys=Object.keys(byLevel);
  if(!keys.length){box.innerHTML='<div class="cat-empty-hint">مفيش مقررات مضافة لهذا القسم بعد.</div>';return}
  window._roadKeys=[];
  box.innerHTML=`<div class="road-sem-grid">${keys.map(k=>`<div class="acard" style="margin:0"><h4 style="margin-bottom:10px">📘 ${esc(k)}</h4>${byLevel[k].map(c=>{
    const key=c.dept+'|'+c.name,kIdx=window._roadKeys.push(key)-1,isPass=passedNames.has(norm(c.name));
    const hasPre=!!(c.prereq&&c.prereq.trim()),preOk=!hasPre||passedNames.has(norm(c.prereq));
    const cls=isPass?'passed':(preOk?'open-ready':'locked');
    const st=isPass?'✅ مجتاز':(preOk?'🔓 متاح للتسجيل':'🔒 يفتح بعد: '+c.prereq);
    const isCustom=!!ROADMAP.find(x=>x.id===c.id);
    return `<div class="road-course ${cls}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
        <label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer;flex:1">
          <input type="checkbox" ${isPass?'checked':''} onchange="togglePassedCourse(window._roadKeys[${kIdx}])" style="margin-top:4px">
          <div><b>${esc(c.name)}</b> ${c.code?`<small style="opacity:.7">(${esc(c.code)})</small>`:''}<br><small style="color:var(--text-muted)">${c.hours||3} ساعات • ${esc(st)}</small></div>
        </label>
        ${OWNER&&isCustom?`<button type="button" class="btn btn-danger sm" onclick="deleteRoad('${safeId(c.id)}')">🗑️</button>`:''}
      </div>
    </div>`;
  }).join('')}</div>`).join('')}</div>`;
}

function togglePassedCourse(key){
  const arr=ld('fci_road_passed',[]),i=arr.indexOf(key);
  if(i>-1)arr.splice(i,1);else arr.push(key);
  sv('fci_road_passed',arr);renderRoadmap();
}

function openAddRoadModal(){
  if(!OWNER)return toast('للمالك فقط',1);
  tool(`<h3>🗺️ إضافة مقرر لخريطة المقررات</h3>
    <div class="form-grid">
      <select id="rdTr" class="form-select">${opts(['عام','خاص'],'خاص')}</select>
      <select id="rdDp" class="form-select">${opts(['مشترك'].concat(DEPTS),'الذكاء الاصطناعي')}</select>
      <select id="rdLv" class="form-select">${opts(LEVELS,'الفرقة الثانية')}</select>
      <select id="rdSm" class="form-select">${opts(['الفصل الأول','الفصل الثاني'],'الفصل الأول')}</select>
    </div>
    <div class="form-grid" style="margin-top:8px">
      <input id="rdCode" class="form-input" placeholder="كود المقرر (مثال: AI202)">
      <input id="rdHrs" type="number" min="1" max="6" value="3" class="form-input" placeholder="الساعات المعتمدة">
    </div>
    <input id="rdName" class="form-input" style="margin-top:8px" placeholder="اسم المقرر">
    <input id="rdPre" class="form-input" style="margin-top:8px" placeholder="المتطلب السابق (سيبه فاضي لو مفيش)">
    <button type="button" class="btn btn-success" style="width:100%;margin-top:10px" onclick="submitNewRoad()">➕ إضافة للخريطة</button>`);
}

async function submitNewRoad(){
  const res=await act('roadadd',{
    track:$('rdTr').value,dept:$('rdDp').value,level:$('rdLv').value,semester:$('rdSm').value,
    code:$('rdCode').value.trim(),hours:+$('rdHrs').value||3,name:$('rdName').value.trim(),prereq:$('rdPre').value.trim()
  });
  if(res){closeModal('toolModal');renderRoadmap()}
}

async function deleteRoad(id){
  if(await askConfirm('حذف هذا المقرر من الخريطة؟')){
    if(await act('roaddel',{id}))renderRoadmap();
  }
}

/* ===== نصائح الدفعات الأكبر (دليل مذاكرة المادة) ===== */
function findSubjectTip(sub){
  const p=userPath;
  return TIPS.find(t=>t.subject===sub&&t.track===p.track&&t.level===p.level&&t.semester===p.semester&&(t.dept===p.dept||t.dept==='مشترك'))||TIPS.find(t=>t.subject===sub);
}

function openTipEditor(sub){
  if(!isAdmin)return toast('للمشرفين فقط',1);
  const ex=findSubjectTip(sub)||{guide:'',resources:''};
  tool(`<h3>💡 دليل مذاكرة: ${esc(sub)}</h3>
    <p style="font-size:12px;color:var(--text-muted);margin:0 0 8px">اكتب نصائح الدفعات الأكبر (توزيع الدرجات، أهم الشباتر، طريقة الامتحان) وأفضل قنوات يوتيوب أو مراجع.</p>
    <input type="hidden" id="tipSubj" value="${esc(sub)}">
    <div class="form-group"><label>إزاي تذاكر المادة دي؟</label><textarea id="tipGuide" rows="5" class="form-input" placeholder="مثال: ركّز على شيتات السكاشن وامتحانات آخر 3 سنين، توزيع الدرجات 40 أعمال سنة و60 فاينال...">${esc(ex.guide||'')}</textarea></div>
    <div class="form-group"><label>أفضل قنوات يوتيوب / مراجع (اختياري)</label><textarea id="tipRes" rows="3" class="form-input" placeholder="قناة د. فلان على يوتيوب، كتاب كذا...">${esc(ex.resources||'')}</textarea></div>
    <div style="display:flex;gap:8px">
      <button type="button" class="btn btn-success" style="flex:1" onclick="submitTipSave()">💾 حفظ النصيحة</button>
      ${ex.id?`<button type="button" class="btn btn-danger" onclick="deleteTip('${safeId(ex.id)}')">🗑️</button>`:''}
    </div>`);
}

async function submitTipSave(){
  const p=userPath;
  const res=await act('tipsave',{
    track:p.track||'عام',dept:p.dept||'مشترك',level:p.level||'الفرقة الثانية',semester:p.semester||'الفصل الأول',
    subject:$('tipSubj').value,guide:$('tipGuide').value.trim(),resources:$('tipRes').value.trim()
  });
  if(res){closeModal('toolModal');render()}
}

async function deleteTip(id){
  if(await askConfirm('حذف نصيحة هذه المادة؟')){
    if(await act('tipdel',{id})){closeModal('toolModal');render()}
  }
}

/* ===== ساحة الأسئلة والأجوبة Q&A داخل كل مادة ===== */
function getSubjectQa(sub){
  const p=userPath;
  return QA_LIST.filter(q=>q.subject===sub&&q.track===p.track&&q.level===p.level&&q.semester===p.semester&&(q.dept===p.dept||q.dept==='مشترك')).sort((a,b)=>(b.ts||0)-(a.ts||0));
}

function getSubjectQuizzes(sub){
  const p=userPath;
  return QUIZZES.filter(q=>q.subject===sub&&q.track===p.track&&q.level===p.level&&q.semester===p.semester&&(q.dept===p.dept||q.dept==='مشترك')).sort((a,b)=>(b.ts||0)-(a.ts||0));
}

function renderSubjectQaPanel(sub){
  const list=getSubjectQa(sub),nm=ld('fci_name','');
  let h=`<div class="acard" style="margin-bottom:12px">
    <h4 style="margin:0 0 8px">❓ عندك سؤال في «${esc(sub)}»؟ اسأل دفعتك والمشرفين</h4>
    <textarea id="qaNewQ" rows="2" class="form-input" maxlength="600" placeholder="اكتب سؤالك بوضوح هنا..."></textarea>
    <div class="row" style="margin-top:8px">
      <input id="qaNewName" class="form-input" style="max-width:160px" maxlength="25" placeholder="اسمك (اختياري)" value="${esc(nm)}">
      <button type="button" class="btn sm" data-act="qaAsk" data-s="${esc(sub)}">📤 نشر السؤال</button>
    </div>
  </div>`;
  if(!list.length)return h+'<div class="cat-empty-hint">مفيش أسئلة في المادة دي لسه — اسأل أول سؤال!</div>';
  return h+list.map(q=>{
    const qid=safeId(q.id);
    const ansHtml=(q.answers||[]).slice().sort((a,b)=>(b.verified?1:0)-(a.verified?1:0)).map(a=>{
      const aid=safeId(a.id);
      return `<div class="qa-ans ${a.verified?'verified':''}">
        <div>
          ${a.verified?'<span class="verified-pill">✅ إجابة معتمدة</span> ':''}<b>${esc(a.by)}</b> <small style="color:var(--text-muted)">• ${esc(a.at||'')}</small>
          <div style="margin-top:3px">${esc(a.text)}</div>
        </div>
        ${isAdmin?`<div style="display:flex;gap:4px"><button type="button" class="btn sm ${a.verified?'btn-ghost':'btn-success'}" onclick="verifyQaAns('${qid}','${aid}')" title="اعتماد/إلغاء اعتماد">✅</button><button type="button" class="btn btn-danger sm" onclick="deleteQa('${qid}','${aid}')" title="حذف الإجابة">🗑️</button></div>`:''}
      </div>`;
    }).join('');
    return `<div class="qa-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div><b>❓ ${esc(q.q)}</b><br><small style="color:var(--text-muted)">بواسطة ${esc(q.by)} • ${esc(q.at||'')}</small></div>
        ${isAdmin?`<button type="button" class="btn btn-danger sm" onclick="deleteQa('${qid}','')">🗑️</button>`:''}
      </div>
      ${ansHtml}
      <div class="comment-input-box" style="margin-top:9px">
        <input id="qan-${qid}" class="comment-input" style="max-width:105px;flex:none" placeholder="اسمك" maxlength="25" value="${esc(nm)}">
        <input id="qat-${qid}" class="comment-input" placeholder="اكتب إجابتك لمساعدة زميلك..." maxlength="700">
        <button type="button" class="btn sm" onclick="submitQaAnswer('${qid}')">رد</button>
      </div>
    </div>`;
  }).join('');
}

async function submitQaQuestion(sub){
  const q=$('qaNewQ').value.trim(),by=$('qaNewName').value.trim()||'طالب';
  if(q.length<4)return toast('اكتب سؤالك بوضوح',1);
  if(by!=='طالب')sv('fci_name',by);
  const p=userPath;
  const res=await act('qaask',{track:p.track||'عام',dept:p.dept||'مشترك',level:p.level||'الفرقة الثانية',semester:p.semester||'الفصل الأول',subject:sub,q,by});
  if(res)$('qaNewQ').value='';
}

async function submitQaAnswer(qid){
  const text=$('qat-'+qid).value.trim(),by=$('qan-'+qid).value.trim()||'طالب';
  if(!text)return toast('اكتب الإجابة أولاً',1);
  if(by!=='طالب')sv('fci_name',by);
  const res=await act('qaans',{id:qid,text,by});
  if(res)$('qat-'+qid).value='';
}

async function verifyQaAns(qid,aid){await act('qaverify',{id:qid,aid})}
async function deleteQa(qid,aid){
  if(await askConfirm(aid?'حذف هذه الإجابة؟':'حذف السؤال بكل إجاباته؟'))await act('qadel',{id:qid,aid});
}

/* ===== إدارة إعدادات Gemini API + جلب الموديلات المتاحة تلقائياً ===== */
const DEFAULT_AI_MODELS=[
  {id:'gemini-3.8-flash',label:'Gemini 3.8 Flash (مجاني وسريع — موصى به)'},
  {id:'gemini-4-hydrogen',label:'Gemini 4 Hydrogen (مجاني — 20 طلب/يوم)'},
  {id:'gemini-3.1-pro-preview',label:'Gemini 3.1 Pro Preview (يتطلب Billing)'},
  {id:'gemini-flash-latest',label:'Gemini Flash Latest'},
  {id:'gemini-pro-latest',label:'Gemini Pro Latest'}
];
let _fetchedAiModels=[];

function syncAiCustomModel(){
  const sel=$('aiModelSel'),cus=$('aiCustomModel');
  if(!sel||!cus)return;
  cus.style.display=sel.value==='custom'?'block':'none';
}

function selectAiModelInDropdown(modelId){
  const sel=$('aiModelSel'),cus=$('aiCustomModel');
  if(!sel||!cus)return;
  const hasOpt=Array.from(sel.options).some(o=>o.value===modelId);
  if(hasOpt){sel.value=modelId;cus.style.display='none'}
  else{sel.value='custom';cus.value=modelId;cus.style.display='block'}
}

async function loadAiCfg(){
  try{
    const a=(await api('aiget')).ai||{};
    if($('aiKeyInput'))$('aiKeyInput').placeholder=a.hasKey?'✅ المفتاح محفوظ بأمان على السيرفر (سيبه فاضي لو مش هتغيره)':'Gemini API Key من Google AI Studio';
    if($('aiDailyLimit'))$('aiDailyLimit').value=a.dailyLimit||20;
    const m=a.model||'gemini-3.8-flash';
    selectAiModelInDropdown(m);
    if($('aiCfgInfo'))$('aiCfgInfo').innerHTML=(a.hasKey?'🟢 <b>مفعّل</b>':'🔴 <b>غير مفعّل</b>')+' • الموديل الحالي: <code dir="ltr">'+esc(m)+'</code> • استهلاك اليوم: <b>'+(a.usedToday||0)+' / '+(a.dailyLimit||20)+'</b>';
    if(_fetchedAiModels.length)renderFetchedAiModels(m);
  }catch(e){}
}

function renderFetchedAiModels(activeId){
  const box=$('aiModelsBox');if(!box)return;
  if(!_fetchedAiModels.length){box.innerHTML='';return}
  box.innerHTML=`<div class="ai-models-panel">
    <div class="ai-models-head">
      <span>✨ الموديلات المتاحة على مفتاحك (${_fetchedAiModels.length} موديل — اضغط لاختيار أي موديل)</span>
      <button type="button" class="pill-btn" onclick="$('aiModelsBox').innerHTML=''">إخفاء ✕</button>
    </div>
    <div class="ai-models-grid">${_fetchedAiModels.map((m,idx)=>`
      <button type="button" class="ai-model-chip${m.id===activeId?' active':''}" onclick="pickFetchedAiModel(${idx})">
        <b>${esc(m.name||m.id)}</b>
        <code>${esc(m.id)}</code>
      </button>`).join('')}
    </div>
  </div>`;
}

async function fetchAvailableAiModels(){
  const btn=$('aiFetchModelsBtn');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري جلب الموديلات...'}
  try{
    const j=await api('aimodels',{key:$('aiKeyInput')?$('aiKeyInput').value.trim():''});
    _fetchedAiModels=Array.isArray(j.models)?j.models:[];
    const sel=$('aiModelSel');
    if(sel&&_fetchedAiModels.length){
      const curSel=sel.value==='custom'?$('aiCustomModel').value.trim():sel.value;
      const liveOpts=_fetchedAiModels.map(m=>`<option value="${esc(m.id)}">${esc(m.name)} (${esc(m.id)})</option>`).join('');
      const fallbackOpts=DEFAULT_AI_MODELS.filter(d=>!_fetchedAiModels.some(m=>m.id===d.id)).map(d=>`<option value="${esc(d.id)}">${esc(d.label)}</option>`).join('');
      sel.innerHTML=`<optgroup label="✨ المتاحة على مفتاحك الآن (من جوجل)">${liveOpts}</optgroup>`+(fallbackOpts?`<optgroup label="خيارات شائعة">${fallbackOpts}</optgroup>`:'')+`<option value="custom">✏️ اسم موديل مخصص...</option>`;
      selectAiModelInDropdown(curSel||j.current||_fetchedAiModels[0].id);
    }
    const nowActive=sel?(sel.value==='custom'?$('aiCustomModel').value.trim():sel.value):(j.current||'');
    renderFetchedAiModels(nowActive);
    toast(j.msg||('تم جلب '+_fetchedAiModels.length+' موديل متاح ✅'));
  }catch(e){
    toast(e.message||'تعذر جلب الموديلات من جوجل',1);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='🔄 جلب الموديلات المتاحة'}
  }
}

function pickFetchedAiModel(idx){
  const m=_fetchedAiModels[idx];if(!m)return;
  selectAiModelInDropdown(m.id);
  renderFetchedAiModels(m.id);
  toast('تم اختيار '+m.id+' — اضغط «💾 حفظ الإعدادات» لتفعيله');
}

async function aiSave(){
  const sel=$('aiModelSel').value;
  const model=sel==='custom'?$('aiCustomModel').value.trim():sel;
  if(!model)return toast('اختار أو اكتب اسم الموديل',1);
  const res=await act('aiset',{key:$('aiKeyInput').value.trim(),model,dailyLimit:+$('aiDailyLimit').value||20});
  if(res){$('aiKeyInput').value='';loadAiCfg()}
}

async function aiClearKey(){
  if(await askConfirm('حذف مفتاح Gemini API وإيقاف ميزات الذكاء الاصطناعي؟')){
    if(await act('aiset',{clearKey:true})){_fetchedAiModels=[];if($('aiModelsBox'))$('aiModelsBox').innerHTML='';loadAiCfg()}
  }
}

async function aiTest(){
  const btn=$('aiTestBtn');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري التجربة...'}
  try{
    const j=await api('aitest');
    toast(j.msg||'متصل بنجاح ✅');
    loadAiCfg();
  }catch(e){toast(e.message||'فشل الاتصال',1)}
  finally{if(btn){btn.disabled=false;btn.textContent='⚡ تجربة الاتصال'}}
}

async function suggestTagsWithAi(){
  const title=$('addTitle').value.trim(),subject=$('addSubject').value.trim();
  if(!title)return toast('اكتب عنوان الملف الأول عشان الـ AI يقترحلك الوسوم والتصنيف',1);
  const btn=$('aiTagBtn');
  if(btn){btn.disabled=true;btn.textContent='⏳ بيقترح...'}
  try{
    const j=await api('aitags',{title,subject});
    if(j.tags)$('addTags').value=j.tags;
    if(j.type&&TYPES.includes(j.type)){$('addType').value=j.type;$('addType').dispatchEvent(new Event('change'))}
    if(j.week&&WEEKS.includes(j.week))$('addWeek').value=j.week;
    toast('تم اقتراح الوسوم والتصنيف بواسطة Gemini Pro ✨');
  }catch(e){toast(e.message||'خطأ',1)}
  finally{if(btn){btn.disabled=false;btn.textContent='✨ اقتراح وسوم وتصنيف بالـ AI'}}
}
