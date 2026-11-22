// FCI-Materials backend (Google Apps Script) - شغّل setup() و authorize() مرة واحدة ثم انشره Web App (New Deployment)
const H={db:['id','json'],reports:['id','title','subject'],meta:['key','value'],admins:['name','password','role','scope'],events:['id','title','date','subject','by'],requests:['id','type','name','text','date','status'],schedule:['id','track','dept','level','day','time','subject','place','by'],log:['time','admin','action','detail'],trash:['id','json','at','by'],health:['id','title','subject','problem','checked'],contrib:['id','json','at','status'],sync:['code','json','at']};
const F=['track','dept','level','semester','subject','week','type','title','viewLink','downloadLink','deadline','tags','publishAt','doctor','hidden','contributor'];
const PUB_CACHE_KEY='fci_pub_v3',ADM_CACHE_KEY='fci_adm_data_v3',ADM_AUTH_KEY='fci_adm_auth_v3';
const READ_ACTIONS={login:1,logout:1,adminsync:1,admincounts:1,reqlist:1,healthlist:1,contriblist:1,loglist:1,trashlist:1,visitstats:1,treecfgget:1,adminlist:1,linkinfo:1,treescan:1,secstatus:1};
const TRY_LOCK_ACTIONS={visit:1,bump:1};
let _SS=null;const _SH={};
function SS(){return _SS||(_SS=SpreadsheetApp.getActive())}

function setup(){
  Object.keys(H).forEach(k=>S(k,H[k]));
  const s=S('admins',H.admins);s.getRange('B:B').setNumberFormat('@');
  // لا تنشئ حسابًا بكلمة مرور افتراضية معروفة. أنشئ أول مالك يدويًا بكلمة مرور قوية.
  if(s.getLastRow()<2)Logger.log('لا يوجد مالك بعد. أضف حساب المالك يدويًا إلى ورقة admins قبل النشر.');
}
function S(n,h){
  if(_SH[n])return _SH[n];
  const ss=SS();let s=ss.getSheetByName(n);
  if(!s){s=ss.insertSheet(n);s.appendRow(h);if(n==='events')s.getRange('C:C').setNumberFormat('@');if(n==='log')s.getRange('A:A').setNumberFormat('@');if(n==='health')s.getRange('E:E').setNumberFormat('@')}
  return _SH[n]=s;
}
function rows(n){const h=H[n],s=S(n,h),l=s.getLastRow();return l<2?[]:s.getRange(2,1,l-1,h.length).getValues()}
function findRow(n,id){const s=S(n,H[n]),l=s.getLastRow();if(l<2)return -1;const v=s.getRange(2,1,l-1,1).getValues();for(let i=0;i<v.length;i++)if(String(v[i][0])===String(id))return i+2;return -1}
function getItem(id){const r=findRow('db',id);return r<0?null:JSON.parse(S('db',H.db).getRange(r,2).getValue())}
function isPublicItem(it){return !!it&&!it.hidden&&(!it.publishAt||+it.publishAt<=Date.now())}
function saveItem(it){const s=S('db',H.db),r=findRow('db',it.id),j=JSON.stringify(it);r<0?s.appendRow([it.id,j]):s.getRange(r,2).setValue(j)}
function appendItems(items){
  if(!items||!items.length)return;
  const s=S('db',H.db),data=items.map(it=>[it.id,JSON.stringify(it)]);
  s.getRange(s.getLastRow()+1,1,data.length,2).setValues(data);
}
function clearCache(){try{CacheService.getScriptCache().removeAll([PUB_CACHE_KEY,ADM_CACHE_KEY])}catch(e){}}
function clearAuthCache(){try{CacheService.getScriptCache().remove(ADM_AUTH_KEY)}catch(e){}}
function readAll(forAdmin){
  const now=Date.now();
  let items=rows('db').map(r=>{try{return JSON.parse(r[1])}catch(e){return null}}).filter(Boolean);
  if(!forAdmin)items=items.filter(i=>!i.hidden&&(!i.publishAt||+i.publishAt<=now));
  const reports=forAdmin?rows('reports').map(r=>({id:r[0],title:r[1],subject:r[2]})):[];
  const metaRows=rows('meta'),m=metaRows.find(r=>r[0]==='ann'),um=metaRows.find(r=>r[0]==='ann_until');
  const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd'),until=um?(um[1] instanceof Date?Utilities.formatDate(um[1],'Africa/Cairo','yyyy-MM-dd'):String(um[1])):'';
  const annOk=m&&String(m[1])&&(!until||until>=today);
  const ds=v=>v instanceof Date?Utilities.formatDate(v,'Africa/Cairo','yyyy-MM-dd'):String(v);
  const events=rows('events').map(r=>({id:r[0],title:r[1],date:ds(r[2]),subject:r[3],by:r[4]}));
  const col=n=>rows(n).map(r=>{const o={};H[n].forEach((k,i)=>o[k]=String(r[i]));return o});
  return {items,reports,ann:annOk?String(m[1]):'',events,schedule:col('schedule')};
}
function readPublicCached(){
  const cache=CacheService.getScriptCache();
  try{
    const hit=cache.get(PUB_CACHE_KEY);
    if(hit)return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  }catch(e){}
  const payload=JSON.stringify(readAll(false));
  try{if(payload.length<95000)cache.put(PUB_CACHE_KEY,payload,180)}catch(e){}
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}
function readAdminCached(){
  const cache=CacheService.getScriptCache();
  try{
    const hit=cache.get(ADM_CACHE_KEY);
    if(hit)return JSON.parse(hit);
  }catch(e){}
  const data=readAll(true);
  try{const js=JSON.stringify(data);if(js.length<95000)cache.put(ADM_CACHE_KEY,js,180)}catch(e){}
  return data;
}
function readAdminFor(u){
  const data=readAdminCached();
  if(!u||u.owner)return data;
  const allowed=(data.items||[]).filter(it=>inScope(u,it));
  const ids={};allowed.forEach(it=>ids[String(it.id)]=1);
  data.items=allowed;
  data.reports=(data.reports||[]).filter(r=>ids[String(r.id)]);
  data.schedule=(data.schedule||[]).filter(x=>inScope(u,{level:x.level||'',dept:x.dept||''}));
  return data;
}
function quickCounts(u){
  let req=0,hl=0,ct=0;
  if(u&&u.owner){
    try{
      const rs=S('requests',H.requests),rl=rs.getLastRow();
      if(rl>1){const v=rs.getRange(2,6,rl-1,1).getValues();for(let i=0;i<v.length;i++)if(!v[i][0]||String(v[i][0])==='جديد')req++}
    }catch(e){}
  }
  try{
    const hs=healthRows();
    hl=u&&u.owner?hs.length:hs.filter(h=>{const it=getItem(h.id);return it&&inScope(u,it)}).length;
  }catch(e){}
  try{
    const cr=rows('contrib');
    for(let i=0;i<cr.length;i++){
      if(String(cr[i][3])!=='pending')continue;
      if(u.owner){ct++;continue}
      try{if(inScope(u,JSON.parse(cr[i][1])))ct++}catch(e){}
    }
  }catch(e){}
  return {req,hl,ct};
}
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}

/* ===== نواة الحماية (Fortress v8): التشفير + التوكن الموقّع + منع التخمين + Rate Limiting ===== */
function safeCell(v,maxLen){
  let s=String(v==null?'':v).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,'').trim();
  if(maxLen)s=s.slice(0,maxLen);
  if(/^[=+\-@\t\r]/.test(s))s="'"+s;
  return s;
}
function okUrl(u){
  const s=String(u||'').trim();
  return /^https?:\/\/[^\s<>"'`\\]{3,2000}$/i.test(s);
}
function clean(o){
  const r={};
  F.forEach(k=>{
    let s=String((o&&o[k])||'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,'').trim().slice(0,500);
    if(k!=='viewLink'&&k!=='downloadLink'&&k!=='publishAt'&&/^[=+\-@]/.test(s))s="'"+s;
    r[k]=s;
  });
  return r;
}
function toHex(bytes){return bytes.map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('')}
function b64uEnc(input){
  const b=typeof input==='string'?Utilities.newBlob(input).getBytes():input;
  return Utilities.base64EncodeWebSafe(b).replace(/=+$/,'');
}
function b64uDec(str){
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(String(str||''))).getDataAsString();
}
function ctEq(a,b){
  a=String(a||'');b=String(b||'');
  let diff=a.length^b.length;
  const len=Math.max(a.length,b.length);
  for(let i=0;i<len;i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return diff===0;
}
function getSecret(key){
  const p=props();let v=p.getProperty(key);
  if(!v){
    v=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
    p.setProperty(key,v);
  }
  return v;
}
function getAuthVer(){return +(props().getProperty('AUTH_VER')||1)}
function userAuthKey(name){return 'USER_AUTH_VER_'+toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(name||''))).slice(0,24)}
function getUserAuthVer(name){return +(props().getProperty(userAuthKey(name))||1)}
function bumpUserAuthVer(name){const k=userAuthKey(name),p=props();p.setProperty(k,String(getUserAuthVer(name)+1));}
function hashPass(pw,salt){
  salt=salt||Utilities.getUuid().replace(/-/g,'').slice(0,16);
  const pep=getSecret('AUTH_PEPPER');
  let cur=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+':'+String(pw)+':'+pep,Utilities.Charset.UTF_8);
  for(let i=0;i<200;i++)cur=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,toHex(cur)+':'+salt,Utilities.Charset.UTF_8);
  return 'h2$'+salt+'$'+toHex(cur);
}
function verifyPass(pw,stored){
  stored=String(stored||'');pw=String(pw||'');
  if(!stored||!pw)return {ok:false,migrate:false};
  if(stored.indexOf('h2$')===0){
    const parts=stored.split('$');
    if(parts.length!==3)return {ok:false,migrate:false};
    return {ok:ctEq(hashPass(pw,parts[1]),stored),migrate:false};
  }
  // دعم تلقائي مؤقت للباسورد القديم النصي مع ترقيته فور الدخول إلى Hash مشفّر
  return {ok:ctEq(pw,stored),migrate:true};
}
function issueToken(u){
  const payload={n:u.name,o:u.owner?1:0,s:u.scope||'',v:getAuthVer(),a:getUserAuthVer(u.name),j:Utilities.getUuid().replace(/-/g,'').slice(0,16),exp:Date.now()+6*3600*1000};
  const body=b64uEnc(JSON.stringify(payload));
  const sig=b64uEnc(Utilities.computeHmacSha256Signature(body,getSecret('TOKEN_SECRET')));
  return body+'.'+sig;
}
function verifyToken(tok){
  if(!tok||typeof tok!=='string')return null;
  const parts=tok.split('.');
  if(parts.length!==2)return null;
  const expected=b64uEnc(Utilities.computeHmacSha256Signature(parts[0],getSecret('TOKEN_SECRET')));
  if(!ctEq(parts[1],expected))return null;
  let pl;try{pl=JSON.parse(b64uDec(parts[0]))}catch(e){return null}
  if(!pl||!pl.n||!pl.exp||Date.now()>pl.exp)return null;
  if(pl.v!==getAuthVer())return null;
  if((pl.a||1)!==getUserAuthVer(pl.n))return null;
  if(isTokenRevoked(pl.j))return null;
  const adm=loadAdminsCached().find(x=>x.name===pl.n);
  if(!adm)return null;
  return {name:adm.name,owner:adm.owner,scope:adm.scope,jti:pl.j};
}
function isTokenRevoked(jti){
  if(!jti)return false;
  const p=props(),key='REVOKED_'+String(jti);
  const exp=+(p.getProperty(key)||0);
  if(exp>Date.now())return true;
  if(exp)p.deleteProperty(key);
  return false;
}
function revokeToken(tok){
  try{
    const parts=String(tok||'').split('.');if(parts.length!==2)return;
    const pl=JSON.parse(b64uDec(parts[0]));
    if(pl&&pl.j&&pl.exp>Date.now()){
      const p=props(),all=p.getProperties(),now=Date.now();
      Object.keys(all).forEach(k=>{if(k.indexOf('REVOKED_')===0&&+(all[k]||0)<=now)p.deleteProperty(k)});
      p.setProperty('REVOKED_'+pl.j,String(pl.exp));
    }
  }catch(e){}
}
function rateLimit(bucket,maxCount,winSec){
  // Apps Script Web App لا يوفّر عنوان IP موثوقًا هنا؛ هذه حدود عامة للعملية وليست حماية لكل مستخدم.
  const c=CacheService.getScriptCache();
  const slot=Math.floor(Date.now()/(winSec*1000));
  const k='rl_'+bucket+'_'+slot;
  const cur=+(c.get(k)||0)+1;
  c.put(k,String(cur),winSec+15);
  if(cur>maxCount)throw new Error('طلبات كتير في وقت قصير، استنى دقيقة وجرّب تاني');
}
function checkBruteLock(uname){
  // لا نستخدم قفلًا عامًا أو قفلًا دائمًا للحساب حتى لا يستطيع مهاجم تعطيل دخول المالك.
  return true;
}
function recordLoginFail(uname){
  const c=CacheService.getScriptCache();
  const h=toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(uname||'unknown'))).slice(0,16);
  const key='bf_u_'+h,uc=+(c.get(key)||0)+1;
  c.put(key,String(uc),900);
  if(uc===5||uc===10||uc===20)tgSend('⚠️ <b>تنبيه أمني</b>\nمحاولات دخول فاشلة متكررة للحساب: '+hx(uname||'غير معروف')+' ('+uc+').',true);
}
function clearLoginFail(uname){
  const c=CacheService.getScriptCache();
  if(uname){
    const h=toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(uname))).slice(0,16);
    c.remove('bf_u_'+h);
  }
}
function loadAdminsCached(){
  const cache=CacheService.getScriptCache();
  try{const hit=cache.get(ADM_AUTH_KEY);if(hit)return JSON.parse(hit)}catch(e){}
  const list=rows('admins').map((r,idx)=>({row:idx+2,name:String(r[0]).trim(),pass:String(r[1]),owner:String(r[2]).trim().toLowerCase()==='owner',scope:String(r[3]||'').trim()}));
  try{cache.put(ADM_AUTH_KEY,JSON.stringify(list),600)}catch(e){}
  return list;
}
function authAdmin(d){
  if(d.tok){
    const u=verifyToken(d.tok);
    if(u)return u;
  }
  return null;
}

function doGet(){return readPublicCached()}
function doPost(e){
  const raw=String((e&&e.postData&&e.postData.contents)||'');
  if(!raw||raw.length>220000)return out({error:'حجم الطلب غير مسموح'});
  let d;
  try{d=JSON.parse(raw)}catch(err){return out({error:'طلب غير صالح'})}
  if(!d||typeof d!=='object')return out({error:'طلب غير صالح'});
  if(READ_ACTIONS[d.action]){
    try{return out(handle(d))}catch(err){return out({error:String(err.message||err)})}
  }
  const lock=LockService.getScriptLock();
  if(TRY_LOCK_ACTIONS[d.action]){
    if(!lock.tryLock(1500))return out({ok:1});
    try{return out(handle(d))}catch(err){return out({ok:1})}
    finally{try{lock.releaseLock()}catch(x){}}
  }
  try{
    lock.waitLock(20000);
    return out(handle(d));
  }catch(err){return out({error:String(err.message||err)})}
  finally{try{lock.releaseLock()}catch(x){}}
}

function handle(d){
  const a=d.action,created=[];let note='',extra=null;
  // ---- عمليات عامة (للطلاب) مع حماية ضد السبام والإغراق ----
  if(a==='like'||a==='bump'||a==='comment'){
    if(a==='comment')rateLimit('cmt',15,60);
    else if(a==='bump')rateLimit('bump',80,60);
    else rateLimit('like',40,60);
    const it=getItem(d.id);if(!isPublicItem(it))throw new Error('الملف غير متاح');
    if(a==='like')it.likes=Math.max(0,(it.likes||0)+(d.d>0?1:-1));
    else if(a==='bump'){const f=d.f==='downloads'?'downloads':'views';it[f]=(it[f]||0)+1}
    else{
      const t=safeCell(d.t,300);if(!t)throw new Error('تعليق فارغ');
      const nm=safeCell(d.n||'طالب',20)||'طالب';
      const dk='cd_'+toHex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,d.id+'|'+t)).slice(0,16);
      const cache=CacheService.getScriptCache();
      if(cache.get(dk))throw new Error('التعليق ده اتبعت قبل كده');
      cache.put(dk,'1',300);
      it.comments=it.comments||[];
      it.comments.push({n:nm,t});
      if(it.comments.length>60)it.comments=it.comments.slice(-60);
    }
    saveItem(it);clearCache();
    return a==='bump'?{ok:1}:readAll(false);
  }
  if(a==='report'){
    rateLimit('rep',10,60);
    const it=getItem(d.id);
    if(isPublicItem(it)&&findRow('reports',it.id)<0){S('reports',H.reports).appendRow([safeCell(it.id,30),safeCell(it.title,200),safeCell(it.subject,120)]);tgSend('⚠️ <b>بلاغ عن رابط</b>\n'+hx(it.title)+' ('+hx(it.subject)+')')}
    return readAll(false);
  }
  if(a==='request'){
    rateLimit('req_m',8,60);rateLimit('req_h',40,3600);
    const t=safeCell(d.text,500);if(!t)throw new Error('الرسالة فارغة');
    const ty=['طلب مادة','اقتراح','شكوى'].indexOf(d.type)>-1?d.type:'اقتراح';
    const nm=safeCell(d.name||'',30);
    S('requests',H.requests).appendRow([Utilities.getUuid().slice(0,12),ty,nm,t,Utilities.formatDate(new Date(),'Africa/Cairo','yyyy/MM/dd HH:mm'),'جديد']);
    tgSend('📥 <b>'+hx(ty)+' جديد</b>\n'+hx(t.slice(0,300))+(nm?'\n— '+hx(nm):''));
    return {ok:1};
  }
  if(a==='visit'){
    rateLimit('vis',40,60);
    const s=S('meta',H.meta),day=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
    ['v_total','v_'+day].forEach(k=>{const r=findRow('meta',k);if(r<0)s.appendRow([k,'1']);else s.getRange(r,2).setValue((+s.getRange(r,2).getValue()||0)+1)});
    return {ok:1};
  }
  if(a==='contribute'){
    rateLimit('ctr_m',6,60);rateLimit('ctr_h',30,3600);
    const it=clean(d.item||{});
    if(!it.title||!it.subject||!okUrl(it.viewLink))throw new Error('اكتب العنوان والمادة ورابط صحيح');
    if(!it.track||!it.level||!it.semester)throw new Error('اختار مسارك الأول');
    if(['محاضرات','سكاشن','ملخصات','امتحانات سابقة','تكليفات'].indexOf(it.type)<0)it.type='محاضرات';
    it.contributor=safeCell(d.name||'',30)||'طالب';it.dept=it.dept||'مشترك';
    const lid=driveIdOf(it.viewLink),same=r=>{try{const x=JSON.parse(r[1]);return x.viewLink===it.viewLink||(lid&&driveIdOf(x.viewLink)===lid)}catch(e){return false}};
    if(rows('db').some(same)||rows('contrib').some(same))throw new Error('الملف ده موجود أو مستني مراجعة بالفعل');
    const cs=S('contrib',H.contrib);if(cs.getLastRow()>300)throw new Error('طابور المساهمات ممتلئ حالياً، جرّب بعدين');
    cs.appendRow([Utilities.getUuid().slice(0,12),JSON.stringify(it),Date.now(),'pending']);
    tgSend('📬 <b>مساهمة جديدة للمراجعة</b>\n'+hx(it.title)+' ('+hx(it.subject)+')\n— '+hx(it.contributor));
    return {ok:1,msg:'اتبعت للمراجعة ✅ هيظهر بعد موافقة الإدارة'};
  }
  if(a==='syncput'||a==='syncget'){
    throw new Error('خاصية المزامنة متوقفة مؤقتًا لأسباب أمنية');
    /*
    rateLimit(a==='syncput'?'sy_p':'sy_g',a==='syncput'?15:20,60);
    const code=String(d.code||'');if(!/^[A-HJ-NP-Z2-9]{10}$/.test(code))throw new Error('كود غير صالح');
    const s=S('sync',H.sync),r=findRow('sync',code);
    if(a==='syncget'){if(r<0)throw new Error('الكود ده مش موجود');return {sync:String(s.getRange(r,2).getValue()),at:+s.getRange(r,3).getValue()||0}}
    const js=String(d.data||'');
    if(js.length>45000)throw new Error('البيانات كبيرة (أكتر من 45 ألف حرف). قلّل الملاحظات');
    let parsed;try{parsed=JSON.parse(js)}catch(e){throw new Error('بيانات غير صالحة')}
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('بيانات غير صالحة');
    const ALLOWED_SYNC={fci_done:1,fci_saved:1,fci_favs:1,fci_notes:1,fci_path:1,fci_personal_tasks:1,fci_quick_notes:1,fci_attendance:1,fci_custom_sched:1,fci_study_stats:1,fci_recent:1,fci_rich_gpa:1,fci_gpa_meta:1};
    const cleanObj={};
    Object.keys(parsed).forEach(k=>{if(ALLOWED_SYNC[k]&&typeof parsed[k]==='string')cleanObj[k]=parsed[k]});
    const cleanJs=JSON.stringify(cleanObj);
    if(r<0){if(s.getLastRow()>3000)throw new Error('الخدمة مشغولة حالياً');s.appendRow([code,cleanJs,Date.now()])}
    else{s.getRange(r,2).setValue(cleanJs);s.getRange(r,3).setValue(Date.now())}
    return {ok:1,at:Date.now(),msg:'اتحفظت بياناتك ☁️'};
    */
  }
  // ---- تسجيل الدخول والخروج (توكن موقّع HMAC + منع تخمين + تشفير تلقائي) ----
  if(a==='logout'){
    revokeToken(d.tok);
    return {ok:1};
  }
  if(a==='login'){
    const nm=String(d.name||'').trim();
    const pw=String(d.pass||'');
    if(!nm||!pw)throw new Error('اكتب اسم المشرف وكلمة المرور');
    checkBruteLock(nm);
    const list=loadAdminsCached();
    const rec=list.find(x=>x.name===nm);
    const ver=rec?verifyPass(pw,rec.pass):{ok:false,migrate:false};
    if(!rec||!ver.ok){
      recordLoginFail(nm);
      Utilities.sleep(1000);
      throw new Error('اسم المشرف أو كلمة المرور غير صحيحة');
    }
    clearLoginFail(nm);
    if(ver.migrate){
      try{
        const s=S('admins',H.admins);
        s.getRange(rec.row,2).setNumberFormat('@').setValue(hashPass(pw));
        clearAuthCache();
      }catch(e){}
    }
    const u={name:rec.name,owner:rec.owner,scope:rec.scope};
    const tok=issueToken(u);
    return Object.assign({},readAdminFor(u),{name:u.name,owner:u.owner,scope:u.scope,tok,counts:quickCounts(u)});
  }
  // ---- عمليات الأدمن (محمية بالتوكن الموقّع HMAC-SHA256) ----
  const u=authAdmin(d);
  if(!u)throw new Error('انتهت صلاحية الجلسة، سجّل دخولك من جديد');
  const mine=it=>{if(!(u.owner||it.by===u.name))throw new Error('مش مسموح: الملف ده مش بتاعك');if(!inScope(u,it))throw new Error('الملف خارج نطاق صلاحيتك')};
  if(a==='adminsync')return Object.assign({},readAdminFor(u),{counts:quickCounts(u)});
  if(a==='admincounts')return {counts:quickCounts(u)};
  if(a==='secstatus'){
    if(!u.owner)throw new Error('للمالك فقط');
    const all=loadAdminsCached();
    const hashed=all.filter(x=>x.pass.indexOf('h2$')===0).length;
    const c=CacheService.getScriptCache();
    return {sec:{totalAdmins:all.length,hashedAdmins:hashed,plainAdmins:all.length-hashed,authVer:getAuthVer(),globalFails:+(c.get('bf_g')||0),locked:!!c.get('lock_g')}};
  }
  if(a==='revokeall'){
    if(!u.owner)throw new Error('للمالك فقط');
    const nv=getAuthVer()+1;
    props().setProperty('AUTH_VER',String(nv));
    logIt(u.name,'revokeall','إنهاء جميع الجلسات');
    tgSend('🔒 <b>إجراء أمني</b>\nقام المالك بإنهاء جميع جلسات الإدارة المفتوحة على كل الأجهزة.',true);
    return {ok:1,tok:issueToken(u),msg:'تم إنهاء كل الجلسات الأخرى وتجديد جلستك ✅'};
  }
  if(a==='hashall'){
    if(!u.owner)throw new Error('للمالك فقط');
    const s=S('admins',H.admins),all=rows('admins');let n=0;
    all.forEach((r,idx)=>{
      const pw=String(r[1]||'');
      if(pw&&pw.indexOf('h2$')!==0){s.getRange(idx+2,2).setNumberFormat('@').setValue(hashPass(pw));n++}
    });
    clearAuthCache();
    logIt(u.name,'hashall',n+' حساب');
    return {ok:1,msg:n?'تم تشفير '+n+' كلمة مرور بنجاح 🔐':'كل كلمات المرور مشفّرة بالفعل ✅'};
  }
  if(a==='add'){
    const it=clean(d.item||{});if(!inScope(u,it))throw new Error('خارج نطاق صلاحيتك');
    if(!it.title||!it.subject||!okUrl(it.viewLink))throw new Error('بيانات ناقصة أو رابط غير صالح');
    it.downloadLink=okUrl(it.downloadLink)?it.downloadLink:it.viewLink;
    Object.assign(it,{id:Utilities.getUuid().slice(0,12),timestamp:Date.now(),dateAdded:Utilities.formatDate(new Date(),'Africa/Cairo','yyyy/MM/dd'),by:u.name,likes:0,views:0,downloads:0,comments:[]});
    saveItem(it);created.push(it);
  }else if(a==='edit'){
    const it=getItem(d.id);if(!it)throw new Error('الملف غير موجود');mine(it);
    const f=clean(d.fields||{});if(!f.title||!f.subject||!okUrl(f.viewLink))throw new Error('بيانات غير صالحة');if(!inScope(u,f))throw new Error('خارج نطاق صلاحيتك');
    ['title','subject','viewLink','downloadLink','week','track','dept','level','semester','type'].forEach(k=>it[k]=f[k]||it[k]);
    it.tags=f.tags||'';it.doctor=f.doctor||'';it.deadline=f.deadline||'';
    saveItem(it);
    const rr=findRow('reports',it.id);if(rr>0)S('reports',H.reports).deleteRow(rr);
  }else if(a==='del'){
    const it=getItem(d.id);if(!it)throw new Error('الملف غير موجود');mine(it);
    S('trash',H.trash).appendRow([it.id,JSON.stringify(it),Date.now(),u.name]);
    S('db',H.db).deleteRow(findRow('db',d.id));
    const rr=findRow('reports',d.id);if(rr>0)S('reports',H.reports).deleteRow(rr);
  }else if(a==='delc'){
    const it=getItem(d.id);if(!it)throw new Error('الملف غير موجود');mine(it);
    const ci=Number(d.i);if(!Number.isInteger(ci)||ci<0||ci>=(it.comments||[]).length)throw new Error('رقم التعليق غير صالح');
    (it.comments||[]).splice(ci,1);saveItem(it);
  }else if(a==='unreport'){
    const it=getItem(d.id);if(it)mine(it);else if(!u.owner)throw new Error('للمالك فقط');
    const rr=findRow('reports',d.id);if(rr>0)S('reports',H.reports).deleteRow(rr);
  }else if(a==='ann'){
    if(!u.owner)throw new Error('الإعلان العام للمالك فقط');
    const s=S('meta',H.meta),r=findRow('meta','ann'),t=String(d.text||'').slice(0,300);
    r<0?s.appendRow(['ann',t]):s.getRange(r,2).setValue(t);
    const ru=findRow('meta','ann_until'),uv=/^\d{4}-\d{2}-\d{2}$/.test(String(d.until||''))?String(d.until):'';
    if(ru<0)s.appendRow(['ann_until',uv]);else s.getRange(ru,2).setValue(uv);
  }else if(a==='import'||a==='clear'){
    if(!u.owner)throw new Error('للمالك فقط');
    if(a==='clear'){const s=S('db',H.db),l=s.getLastRow();if(l>1)s.deleteRows(2,l-1);const p=S('reports',H.reports),pl=p.getLastRow();if(pl>1)p.deleteRows(2,pl-1)}
    else{
      const existing={};rows('db').forEach(r=>existing[String(r[0])]=1);
      const batch=[];
      (d.items||[]).forEach(x=>{if(x&&x.id&&okUrl(x.viewLink)&&!existing[String(x.id)]){batch.push(x);existing[String(x.id)]=1}});
      appendItems(batch);
    }
  }else if(a==='evadd'){
    const t=safeCell(d.title,100),dt=String(d.date||'');
    if(!t||!/^\d{4}-\d{2}-\d{2}$/.test(dt))throw new Error('بيانات الموعد غير صالحة');
    S('events',H.events).appendRow([Utilities.getUuid().slice(0,12),t,dt,safeCell(d.subject,100),safeCell(u.name,40)]);
  }else if(a==='evdel'){
    const s=S('events',H.events),r=findRow('events',d.id);
    if(r>0){
      const by=String(s.getRange(r,5).getValue());
      if(!(u.owner||by===u.name))throw new Error('مش مسموح: الموعد ده مش بتاعك');
      s.deleteRow(r);
    }
  }else if(a==='reqlist'){
    if(!u.owner)throw new Error('الطلبات للمالك فقط');
    return {requests:rows('requests').map(r=>({id:r[0],type:r[1],name:r[2],text:r[3],date:String(r[4]),status:String(r[5]||'جديد')})).reverse()};
  }else if(a==='reqdel'){
    if(!u.owner)throw new Error('للمالك فقط');
    const r=findRow('requests',d.id);if(r<0)throw new Error('الطلب مش موجود');
    S('requests',H.requests).deleteRow(r);
    return {ok:1};
  }else if(a==='addmany'){
    const batch=[];
    (d.items||[]).slice(0,40).forEach((o,i)=>{const it=mkItem(o,u,i);if(it){batch.push(it);created.push(it)}});
    if(!batch.length)throw new Error('مفيش ملفات صالحة');
    appendItems(batch);
  }else if(a==='driveimport'){
    if(!u.owner)throw new Error('استيراد Google Drive متاح للمالك فقط لحماية ملفات حسابه');
    const fid=folderId(d.folder);if(!fid)throw new Error('رابط الفولدر غير صالح');
    const base=clean(d.base||{});if(!base.subject)throw new Error('اكتب اسم المادة');
    if(!inScope(u,base))throw new Error('خارج نطاق صلاحيتك');
    const rootFolder=openDriveFolder(fid);
    const allowPublicShare=d.share===true&&d.confirmPublicShare===true;
    const rootShared=allowPublicShare?safeShare(rootFolder,true):isPubliclyReadable(rootFolder);
    const have=driveHave();
    const stack=[{id:rootFolder.getId(),type:'',week:'',depth:0}],seenFolders={};
    seenFolders[rootFolder.getId()]=1;
    const batch=[],t0=Date.now(),MAX_N=120,MAX_MS=20000;
    let skip=0,fail=0,hasMore=false;
    while(stack.length&&batch.length<MAX_N&&Date.now()-t0<MAX_MS){
      const cur=stack.pop();
      let folder;try{folder=cur.id===rootFolder.getId()?rootFolder:DriveApp.getFolderById(cur.id)}catch(e){continue}
      const files=folder.getFiles();
      while(files.hasNext()){
        if(batch.length>=MAX_N||Date.now()-t0>=MAX_MS){hasMore=true;break}
        const res=resolveDriveEntry(files.next(),true);
        if(!res)continue;
        if(res.isFolder){
          if(cur.depth<4&&!seenFolders[res.id]){
            seenFolders[res.id]=1;
            const fn=nrm(res.name),ft=folderTypeOf(fn,true),fw=guess(res.name).week;
            stack.push({id:res.id,type:ft||cur.type,week:fw!=='عام'?fw:cur.week,depth:cur.depth+1});
          }
          continue;
        }
        const f=res.file,id=res.id;
        if(have[id]){skip++;continue}
        if(allowPublicShare&&(res.fromShortcut||!rootShared)&&!safeShare(f,true)){fail++;continue;}
        if(!isPubliclyReadable(f)){fail++;continue;}
        const fname=res.name,nt=nrm(fname),g=guess(fname),detectedType=typeOf(nt);
        const links=fileLinksByMime(id,res.mime);
        const o=Object.assign({},base,{title:stripExt(fname),viewLink:links.view,downloadLink:links.dl});
        if(d.auto!==false){
          if(cur.type)o.type=cur.type;
          else if(detectedType)o.type=detectedType;
          if(g.week!=='عام')o.week=g.week;
          else if(cur.week)o.week=cur.week;
        }
        const it=mkItem(o,u,batch.length);
        if(it){batch.push(it);created.push(it);have[id]=1}
      }
      if(!hasMore&&cur.depth<4){
        const sub=folder.getFolders();
        while(sub.hasNext()){
          const sf=sub.next(),sid=sf.getId();
          if(seenFolders[sid])continue;seenFolders[sid]=1;
          const fn=nrm(sf.getName()),ft=folderTypeOf(fn,true),fw=guess(sf.getName()).week;
          stack.push({id:sid,type:ft||cur.type,week:fw!=='عام'?fw:cur.week,depth:cur.depth+1});
        }
      }
    }
    if(stack.length)hasMore=true;
    appendItems(batch);
    if(!batch.length&&!skip)throw new Error('الفولدر فاضي أو مفيش ملفات متاحة فيه (تأكد إن الفولدر فيه ملفات مش بس فولدرات فاضية)');
    note='تم استيراد '+batch.length+' ملف'+(skip?' • تخطيت '+skip+' موجود قبل كده':'')+(fail?' • تعذر فتح المشاركة لـ '+fail+' ملف':'')+(hasMore?' • بيكمّل باقي الملفات...':'');
    extra={hasMore:hasMore,imported:batch.length,skipped:skip};
    if(d.fast){
      clearCache();
      if(created.length)notifyNew(created);
      logIt(u.name,a,batch.length+' ملف');
      return {ok:1,hasMore,imported:batch.length,skipped:skip,msg:note};
    }
  }else if(a==='restore'){
    const r=findRow('trash',d.id);if(r<0)throw new Error('مش موجود في السلة');
    const it=JSON.parse(S('trash',H.trash).getRange(r,2).getValue());
    if(!(u.owner||it.by===u.name))throw new Error('مش مسموح: الملف ده مش بتاعك');
    if(!inScope(u,it))throw new Error('الملف خارج نطاق صلاحيتك');
    saveItem(it);S('trash',H.trash).deleteRow(r);
  }else if(a==='trashlist'){
    const tr=rows('trash').filter(r=>{if(u.owner)return true;if(String(r[3])!==u.name)return false;try{return inScope(u,JSON.parse(r[1]))}catch(e){return false}});
    return {trash:tr.slice(-50).reverse().map(r=>{let x={};try{x=JSON.parse(r[1])}catch(e){}return {id:r[0],title:x.title||'',subject:x.subject||'',by:r[3],at:Utilities.formatDate(new Date(+r[2]),'Africa/Cairo','MM-dd HH:mm')}})};
  }else if(a==='healthlist'){
    const hs=healthRows();
    return {health:u.owner?hs:hs.filter(h=>{const it=getItem(h.id);return it&&inScope(u,it)})};
  }else if(a==='healthrun'){
    if(!u.owner)throw new Error('للمالك فقط');
    const r=runHealth(25,20000);return {health:healthRows(),msg:'فحصت '+r.checked+' من '+r.total+' ملف. اضغط تاني عشان تكمل.'};
  }else if(a==='visitstats'){
    if(!u.owner)throw new Error('للمالك فقط');
    const days=[];let total=0;
    rows('meta').forEach(r=>{const k=String(r[0]);if(k==='v_total')total=+r[1]||0;else if(k.indexOf('v_')===0)days.push({d:k.slice(2),n:+r[1]||0})});
    days.sort((x,y)=>x.d<y.d?-1:1);return {total,days:days.slice(-14)};
  }else if(a==='tgset'){
    if(!u.owner)throw new Error('للمالك فقط');
    const o={};
    if(d.token)o.TG_TOKEN=String(d.token).trim();
    if(d.chat)o.TG_CHAT=String(d.chat).trim();
    if(d.site)o.SITE_URL=String(d.site).trim().replace(/#.*$/,'');
    if(Object.keys(o).length)props().setProperties(o);
    note='تم حفظ إعدادات تليجرام';
  }else if(a==='tgtest'){
    if(!u.owner)throw new Error('للمالك فقط');
    if(!tgSend('✅ تجربة: الموقع متربط بتليجرام وشغال'))throw new Error('فشل الإرسال. راجع الـ Token والـ Chat ID وإن البوت أدمن في الجروب أو القناة');
    note='وصلت رسالة التجربة ✅';
  }else if(a==='installtriggers'){
    if(!u.owner)throw new Error('للمالك فقط');
    const iv=normalizeSyncInterval(d.interval||props().getProperty('SYNC_INTERVAL')||'30');
    props().setProperty('SYNC_INTERVAL',iv);
    installTriggers(iv);
    note='تم تفعيل الربط التلقائي ('+syncIntervalLabel(iv)+') + النسخ اليومي + الملخص وفحص الروابط ✅';
  }else if(a==='bulkedit'){
    const ids=(d.ids||[]).slice(0,300),set={};ids.forEach(i=>set[i]=1);
    const ALLOW=['track','dept','level','semester','subject','week','type','doctor','tags','hidden'],f=d.fields||{},upd={};
    ALLOW.forEach(k=>{if(f[k]!==undefined)upd[k]=String(f[k]).slice(0,300)});
    if(!Object.keys(upd).length)throw new Error('مفيش تعديل مطلوب');
    if('hidden' in upd&&upd.hidden!==''&&upd.hidden!=='1')throw new Error('قيمة غير صالحة');
    if('subject' in upd&&!upd.subject.trim())throw new Error('اسم المادة فاضي');
    const s=S('db',H.db),l=s.getLastRow();if(l<2)throw new Error('مفيش ملفات');
    const v=s.getRange(2,1,l-1,2).getValues();let n=0,skipped=0;
    const outVals=v.map(r=>{
      if(!set[r[0]])return [r[1]];
      let it;try{it=JSON.parse(r[1])}catch(e){return [r[1]]}
      if(!(u.owner||it.by===u.name)){skipped++;return [r[1]]}
      const nx=Object.assign({},it,upd);
      if(!inScope(u,nx)){skipped++;return [r[1]]}
      n++;return [JSON.stringify(nx)];
    });
    s.getRange(2,2,l-1,1).setValues(outVals);
    note='اتعدّل '+n+' ملف'+(skipped?' • اتخطّيت '+skipped+' (مش بتوعك أو برّه نطاقك)':'');
  }else if(a==='bulkdel'){
    const set={};(d.ids||[]).slice(0,300).forEach(i=>set[i]=1);
    const s=S('db',H.db),l=s.getLastRow();if(l<2)throw new Error('مفيش ملفات');
    const v=s.getRange(2,1,l-1,2).getValues(),keep=[],gone=[];let skipped=0;
    v.forEach(r=>{
      if(!set[r[0]]){keep.push(r);return}
      let it;try{it=JSON.parse(r[1])}catch(e){keep.push(r);return}
      if((u.owner||it.by===u.name)&&inScope(u,it))gone.push(r);else{keep.push(r);skipped++}
    });
    if(!gone.length)throw new Error('مفيش ملفات مسموح لك تحذفها');
    const t=S('trash',H.trash),now=Date.now();
    t.getRange(t.getLastRow()+1,1,gone.length,4).setValues(gone.map(r=>[r[0],r[1],now,u.name]));
    s.getRange(2,1,l-1,2).clearContent();
    if(keep.length)s.getRange(2,1,keep.length,2).setValues(keep);
    note='اتنقل '+gone.length+' ملف لسلة المحذوفات'+(skipped?' • اتخطّيت '+skipped+' مش بتوعك':'');
  }else if(a==='reqstatus'){
    if(!u.owner)throw new Error('للمالك فقط');
    const r=findRow('requests',d.id);if(r<0)throw new Error('الطلب مش موجود');
    const st=['جديد','قيد التنفيذ','تم'].indexOf(d.status)>-1?d.status:'جديد';
    S('requests',H.requests).getRange(r,6).setValue(st);
    return {ok:1};
  }else if(a==='adminlist'){
    if(!u.owner)throw new Error('للمالك فقط');
    return {admins:rows('admins').map(r=>({name:String(r[0]),role:String(r[2]||'').trim().toLowerCase()==='owner'?'owner':'',scope:String(r[3]||'')}))};
  }else if(a==='adminsave'){
    if(!u.owner)throw new Error('للمالك فقط');
    const nm=safeCell(d.name,40),pw=String(d.password||'').trim(),role=d.role==='owner'?'owner':'',scope=safeCell(d.scope,100);
    if(!nm)throw new Error('اكتب اسم الأدمن');
    const s=S('admins',H.admins),all=rows('admins'),isOwner=r=>String(r[2]).trim().toLowerCase()==='owner',idx=all.findIndex(r=>String(r[0]).trim()===nm);
    if((idx<0||pw)&&pw.length<12)throw new Error('كلمة المرور الجديدة لازم تكون 12 حرفًا على الأقل');
    if(idx>=0&&isOwner(all[idx])&&role!=='owner'&&all.filter(isOwner).length<2)throw new Error('لازم يفضل مالك واحد على الأقل');
    const hashed=pw?hashPass(pw):'';
    if(idx<0){s.getRange('B:B').setNumberFormat('@');s.appendRow([nm,hashed,role,scope])}
    else{const rr=idx+2;if(hashed)s.getRange(rr,2).setNumberFormat('@').setValue(hashed);s.getRange(rr,3).setValue(role);s.getRange(rr,4).setValue(scope)}
    bumpUserAuthVer(nm);
    clearAuthCache();note='تم حفظ الأدمن «'+nm+'» بتشفير كامل 🔐';
  }else if(a==='admindel'){
    if(!u.owner)throw new Error('للمالك فقط');
    const nm=String(d.name||''),all=rows('admins'),isOwner=r=>String(r[2]).trim().toLowerCase()==='owner',idx=all.findIndex(r=>String(r[0])===nm);
    if(idx<0)throw new Error('الأدمن مش موجود');
    if(nm===u.name)throw new Error('مينفعش تحذف نفسك');
    if(isOwner(all[idx])&&all.filter(isOwner).length<2)throw new Error('لازم يفضل مالك واحد على الأقل');
    bumpUserAuthVer(nm);
    S('admins',H.admins).deleteRow(idx+2);
    clearAuthCache();note='اتحذف الأدمن';
  }else if(a==='contriblist'){
    return {contrib:rows('contrib').filter(r=>String(r[3])==='pending').map(r=>{let x={};try{x=JSON.parse(r[1])}catch(e){}return {id:r[0],at:Utilities.formatDate(new Date(+r[2]),'Africa/Cairo','MM-dd HH:mm'),title:x.title||'',subject:x.subject||'',type:x.type||'',week:x.week||'',track:x.track||'',dept:x.dept||'',level:x.level||'',semester:x.semester||'',viewLink:x.viewLink||'',contributor:x.contributor||''}}).filter(x=>inScope(u,x)).reverse()};
  }else if(a==='contribapprove'){
    const r=findRow('contrib',d.id);if(r<0)throw new Error('المساهمة مش موجودة');
    const cs=S('contrib',H.contrib);let x;try{x=JSON.parse(cs.getRange(r,2).getValue())}catch(e){throw new Error('بيانات تالفة')}
    if(!inScope(u,x))throw new Error('خارج نطاق صلاحيتك');
    const f=clean(d.fields||{});['subject','type','week','dept','title'].forEach(k=>{if(f[k])x[k]=f[k]});
    const it=mkItem(x,u,0);if(!it)throw new Error('بيانات المساهمة غير صالحة');
    saveItem(it);created.push(it);cs.deleteRow(r);
    note='اتنشرت المساهمة ✅';
  }else if(a==='contribreject'){
    const r=findRow('contrib',d.id);if(r<0)throw new Error('المساهمة مش موجودة');
    const cs=S('contrib',H.contrib);let x={};try{x=JSON.parse(cs.getRange(r,2).getValue())}catch(e){}
    if(!inScope(u,x))throw new Error('خارج نطاق صلاحيتك');
    cs.deleteRow(r);note='اتشالت المساهمة';
  }else if(a==='linkinfo'){
    if(!u.owner)throw new Error('فحص روابط Google Drive متاح للمالك فقط');
    const l=String(d.url||''),id=driveIdOf(l),fid=folderId(l);let name='';
    if(id){try{const f=DriveApp.getFileById(id),res=resolveDriveEntry(f);name=res?res.name:f.getName()}catch(e){}}
    else if(fid){try{name=DriveApp.getFolderById(fid).getName()}catch(e){}}
    const gg=guess(name),nt=typeOf(nrm(name));
    return {name:stripExt(name),type:name?(nt||gg.type):'',week:name?gg.week:''};
  }else if(a==='treescan'){
    if(!u.owner)throw new Error('للمالك فقط');
    const def=d.defaults||{};let stack=d.stack,seen=d.seen||{},rootId=d.rootId||'';
    if(!Array.isArray(stack)){
      const fid=folderId(d.root);if(!fid)throw new Error('رابط الفولدر غير صالح');
      const rf=openDriveFolder(fid);
      rootId=rf.getId();
      const rctx=rootCtxOf(rf.getName(),def);
      stack=[{id:rootId,ctx:rctx,depth:0}];
      seen={};seen[rootId]=1;
    }
    const have=driveHave(),t0=Date.now(),files=[];
    while(stack.length&&Date.now()-t0<20000&&files.length<500){
      const cur=stack.pop();let folder;try{folder=DriveApp.getFolderById(String(cur.id))}catch(e){continue}
      const fl=folder.getFiles();
      while(fl.hasNext()){
        const res=resolveDriveEntry(fl.next(),true);
        if(!res)continue;
        if(res.isFolder){
          if((cur.depth||0)<6&&!seen[res.id]){
            seen[res.id]=1;
            stack.push({id:res.id,ctx:childCtx(cur.ctx||{},res.name),depth:(cur.depth||0)+1});
          }
          continue;
        }
        files.push(planFile(res.id,res.name,res.mime,res.fromShortcut,cur.ctx||{},def,have));
      }
      if((cur.depth||0)<6){
        const sub=folder.getFolders();
        while(sub.hasNext()){
          const s=sub.next(),sid=s.getId();
          if(seen[sid])continue;seen[sid]=1;
          stack.push({id:sid,ctx:childCtx(cur.ctx||{},s.getName()),depth:(cur.depth||0)+1});
        }
      }
    }
    return {files,stack,seen,rootId,done:!stack.length};
  }else if(a==='treebatch'){
    if(!u.owner)throw new Error('للمالك فقط');
    let rootShared=false;
    const allowPublicShare=d.share===true&&d.confirmPublicShare===true;
    if(allowPublicShare&&d.rootId){try{rootShared=safeShare(DriveApp.getFolderById(String(d.rootId)),true)}catch(e){}}
    else if(d.rootId){try{rootShared=isPubliclyReadable(DriveApp.getFolderById(String(d.rootId)))}catch(e){}}
    const have=driveHave(),batch=[];let skip=0,fail=0;
    (d.items||[]).slice(0,100).forEach((x,i)=>{
      const id=String(x.id||'');if(!/^[\w-]{10,}$/.test(id)||have[id]){skip++;return}
      let title=String(x.name||'').trim(),viewLink=String(x.viewLink||''),downloadLink=String(x.downloadLink||'');
      if(!title||!okUrl(viewLink)||(allowPublicShare&&x.fromShortcut)){
        let f;try{f=DriveApp.getFileById(id)}catch(e){fail++;return}
        const res=resolveDriveEntry(f,false);if(!res||res.isFolder){fail++;return}
        if(have[res.id]){skip++;return}
        if(allowPublicShare&&(res.fromShortcut||!rootShared))safeShare(res.file,true);
        if(!isPubliclyReadable(res.file)){fail++;return;}
        const links=fileLinksByMime(res.id,res.mime);
        title=title||stripExt(res.name);viewLink=links.view;downloadLink=links.dl;
        have[res.id]=1;
      }
      if(!allowPublicShare){
        let checkFile;try{checkFile=DriveApp.getFileById(id)}catch(e){fail++;return;}
        if(!isPubliclyReadable(checkFile)){fail++;return;}
      }
      const o=Object.assign({},clean(x.fields||{}),{title:stripExt(title),viewLink,downloadLink:okUrl(downloadLink)?downloadLink:viewLink});
      const it=mkItem(o,u,i);
      if(it){batch.push(it);have[id]=1;if(!d.quiet)created.push(it)}else fail++;
    });
    appendItems(batch);
    note='اتستورد '+batch.length+' ملف'+(skip?' • اتخطّى '+skip:'')+(fail?' • فشل '+fail:'');
    extra={imported:batch.length,skipped:skip,failed:fail};
    if(d.fast){
      clearCache();
      if(created.length)notifyNew(created);
      logIt(u.name,a,batch.length+' ملف');
      return {ok:1,imported:batch.length,skipped:skip,failed:fail,msg:note};
    }
  }else if(a==='treesummary'){
    if(!u.owner)throw new Error('للمالك فقط');
    const n=+d.n||0,sub=(d.subjects||[]).slice(0,10).map(hx).join('، '),site=props().getProperty('SITE_URL');
    if(n)tgSend('📂 <b>اتضاف '+n+' ملف جديد من درايف</b>'+(sub?'\nالمواد: '+sub:'')+(site?'\n🔗 '+site:''));
    return {ok:1};
  }else if(a==='treecfg'){
    if(!u.owner)throw new Error('للمالك فقط');
    const p=props();
    if(d.clear){
      p.deleteProperty('DRIVE_SOURCES');p.deleteProperty('DRIVE_ROOT');p.deleteProperty('DRIVE_DEF');
      note='اتشالت كل المصادر التلقائية';
    }else if(d.removeId){
      const list=getSyncSources().filter(x=>x.id!==String(d.removeId));
      saveSyncSources(list);
      note='اتشال الفولدر من المزامنة التلقائية';
    }else{
      const fid=folderId(d.root);if(!fid)throw new Error('رابط الفولدر غير صالح');
      const rf=openDriveFolder(fid),rid=rf.getId(),rname=String(rf.getName()||'فولدر درايف').slice(0,80);
      const list=getSyncSources();
      const idx=list.findIndex(x=>x.id===rid);
      const entry={id:rid,name:rname,defaults:d.defaults||{},addedAt:Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd')};
      if(idx>=0)list[idx]=entry;
      else{
        if(list.length>=15)throw new Error('الحد الأقصى 15 فولدر للمزامنة التلقائية');
        list.push(entry);
      }
      saveSyncSources(list);
      const active=hasAutoSyncTrigger();
      note=(idx>=0?'اتحدّث':'اتضاف')+' «'+rname+'» للمزامنة التلقائية ✅'+(active?'':' • اضغط «تفعيل الربط التلقائي» تحت عشان يشتغل لوحده');
    }
  }else if(a==='treecfgget'){
    if(!u.owner)throw new Error('للمالك فقط');
    const p=props();
    return {cfg:{
      sources:getSyncSources(),
      interval:normalizeSyncInterval(p.getProperty('SYNC_INTERVAL')||'30'),
      last:p.getProperty('AUTOSYNC_LAST')||'',
      triggerActive:hasAutoSyncTrigger()
    }};
  }else if(a==='autosyncnow'){
    if(!u.owner)throw new Error('للمالك فقط');
    const r=runAutoSync(true);
    note=r.msg;
    extra={imported:r.added,checkedSources:r.sources};
  }else if(a==='healfix'){
    if(!u.owner)throw new Error('للمالك فقط');
    if(d.confirmPublicShare!==true)throw new Error('يتطلب هذا الإجراء تأكيدًا صريحًا لأنه يفتح مشاركة ملفات Drive للعامة');
    let n=0,fail=0;
    healthRows().filter(h=>/مش مشارك/.test(h.problem)).forEach(h=>{
      const it=getItem(h.id);if(!it)return;const id=driveIdOf(it.viewLink);if(!id)return;
      try{DriveApp.getFileById(id).setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);setHealth(it,'');n++}catch(e){fail++}
    });
    note='اتفتحت مشاركة '+n+' ملف'+(fail?' • فشل '+fail:'');
  }else if(a==='coladd'){
    const C={schedule:['track','dept','level','day','time','subject','place']}[d.col];
    if(!C)throw new Error('نوع غير معروف');
    const f=d.f||{};if(!f.subject)throw new Error('بيانات ناقصة');
    if(!inScope(u,{level:String(f.level||''),dept:String(f.dept||'')}))throw new Error('خارج نطاق صلاحيتك');
    S(d.col,H[d.col]).appendRow([Utilities.getUuid().slice(0,12)].concat(C.map(k=>safeCell(f[k],200)),[safeCell(u.name,40)]));
  }else if(a==='coldel'){
    if(['schedule'].indexOf(d.col)<0)throw new Error('نوع غير معروف');
    const s=S(d.col,H[d.col]),r=findRow(d.col,d.id);
    if(r>0){
      const by=String(s.getRange(r,9).getValue());
      const rowScope={level:String(s.getRange(r,4).getValue()||''),dept:String(s.getRange(r,3).getValue()||'')};
      if(!(u.owner||by===u.name))throw new Error('مش مسموح: الموعد ده مش بتاعك');
      if(!inScope(u,rowScope))throw new Error('الموعد خارج نطاق صلاحيتك');
      s.deleteRow(r);
    }
  }else if(a==='loglist'){
    if(!u.owner)throw new Error('سجل النشاط للمالك فقط');
    return {log:rows('log').slice(-60).reverse().map(r=>({t:String(r[0]),n:r[1],a:r[2],d:r[3]}))};
  }else throw new Error('عملية غير معروفة');
  clearCache();
  if(created.length)notifyNew(created);
  logIt(u.name,a,String(d.id||d.title||(d.item&&d.item.title)||(d.items&&d.items.length+' ملف')||(d.ids&&d.ids.length+' ملف')||d.name||(a==='driveimport'?'استيراد فولدر':'')||d.col||''));
  const R=readAdminFor(u);if(note)R.msg=note;if(extra)Object.assign(R,extra);return R;
}

function logIt(n,a,x){
  const L={add:'إضافة ملف',treebatch:'استيراد شجرة درايف',treecfg:'ضبط منظّم درايف',healfix:'فتح مشاركة ملفات',contribapprove:'قبول مساهمة',contribreject:'رفض مساهمة',bulkedit:'تعديل جماعي',bulkdel:'حذف جماعي',reqstatus:'تغيير حالة طلب',adminsave:'حفظ أدمن',admindel:'حذف أدمن',addmany:'إضافة جماعية',driveimport:'استيراد من درايف',restore:'استرجاع ملف',tgset:'ربط تليجرام',installtriggers:'تفعيل الأتمتة',edit:'تعديل ملف',del:'حذف ملف',delc:'حذف تعليق',unreport:'إخفاء بلاغ',ann:'إعلان',import:'استرجاع نسخة',clear:'تصفير',evadd:'إضافة موعد',evdel:'حذف موعد',coladd:'إضافة للجدول',coldel:'حذف من الجدول',revokeall:'إنهاء جميع الجلسات',hashall:'تشفير كلمات المرور',autosync:'مزامنة تلقائية لدرايف',autosyncnow:'مزامنة فورية لدرايف'};
  try{S('log',H.log).appendRow([Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd HH:mm'),safeCell(n,40),L[a]||a,safeCell(x,80)])}catch(e){}
}

function mkItem(o,u,i){
  const it=clean(o||{});if(!it.title||!it.subject||!okUrl(it.viewLink))return null;
  if(!inScope(u,it))throw new Error('خارج نطاق صلاحيتك');
  it.downloadLink=okUrl(it.downloadLink)?it.downloadLink:it.viewLink;
  return Object.assign(it,{id:Utilities.getUuid().slice(0,12),timestamp:Date.now()+i,dateAdded:Utilities.formatDate(new Date(),'Africa/Cairo','yyyy/MM/dd'),by:u.name,likes:0,views:0,downloads:0,comments:[]});
}

/* ===== أدوات مساعدة لدرايف ===== */
function stripExt(name){return String(name||'').replace(/\.[A-Za-z0-9]{1,5}$/,'').trim()||String(name||'')}
function openDriveFolder(fid){
  try{return DriveApp.getFolderById(fid)}
  catch(e){
    const msg=String(e&&e.message||e);
    if(/permission|authoriz|scope|DriveApp/i.test(msg))throw new Error('صلاحية درايف غير مفعّلة: شغّل دالة authorize() في Apps Script ثم اعمل New Deployment');
    throw new Error('مقدرتش أفتح الفولدر. تأكد إنه على حسابك أو متشارك معاك وإن الرابط صحيح');
  }
}
function resolveDriveEntry(f,fromIter){
  try{
    if(!fromIter&&f.isTrashed())return null;
    const mime=String(f.getMimeType()||'');
    if(mime==='application/vnd.google-apps.shortcut'){
      const tid=f.getTargetId(),tm=String(f.getTargetMimeType()||'');
      if(!tid)return null;
      if(tm==='application/vnd.google-apps.folder')return {isFolder:true,id:tid,name:f.getName(),fromShortcut:true};
      try{
        const tf=DriveApp.getFileById(tid);
        if(tf.isTrashed())return null;
        return {isFolder:false,file:tf,id:tid,name:f.getName()||tf.getName(),mime:tm||String(tf.getMimeType()||''),fromShortcut:true};
      }catch(e){return null}
    }
    return {isFolder:false,file:f,id:f.getId(),name:f.getName(),mime:mime,fromShortcut:false};
  }catch(e){return null}
}
function safeShare(f,confirmed){
  if(confirmed!==true)return false;
  try{
    const a=f.getSharingAccess();
    if(a===DriveApp.Access.ANYONE||a===DriveApp.Access.ANYONE_WITH_LINK)return true;
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
    return true;
  }catch(e){return false}
}
function fileLinksByMime(id,mime){
  const m=String(mime||'');
  if(m==='application/vnd.google-apps.document')return {view:'https://docs.google.com/document/d/'+id+'/view',dl:'https://docs.google.com/document/d/'+id+'/export?format=pdf'};
  if(m==='application/vnd.google-apps.presentation')return {view:'https://docs.google.com/presentation/d/'+id+'/view',dl:'https://docs.google.com/presentation/d/'+id+'/export?format=pptx'};
  if(m==='application/vnd.google-apps.spreadsheet')return {view:'https://docs.google.com/spreadsheets/d/'+id+'/view',dl:'https://docs.google.com/spreadsheets/d/'+id+'/export?format=xlsx'};
  if(m.indexOf('application/vnd.google-apps')===0)return {view:'https://drive.google.com/file/d/'+id+'/view',dl:'https://drive.google.com/file/d/'+id+'/view'};
  return {view:'https://drive.google.com/file/d/'+id+'/view',dl:'https://drive.usercontent.google.com/download?id='+id+'&export=download&confirm=t'};
}

/* ===== الأتمتة والتكاملات ===== */
function inScope(u,it){
  if(!u||u.owner)return true;
  if(!u.scope)return false;
  const p=u.scope.split('|');
  return (!p[0]||it.level===p[0])&&(!p[1]||it.dept===p[1]||it.dept==='مشترك');
}
function props(){return PropertiesService.getScriptProperties()}
const hx=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function tgSend(text,urgent){
  const p=props(),t=p.getProperty('TG_TOKEN'),c=p.getProperty('TG_CHAT');
  if(!t||!c)return false;
  if(!urgent){
    try{
      const cc=CacheService.getScriptCache(),slot=Math.floor(Date.now()/300000),k='tg_'+slot;
      const n=+(cc.get(k)||0)+1;
      if(n>15)return false;
      cc.put(k,String(n),320);
    }catch(e){}
  }
  try{
    const r=UrlFetchApp.fetch('https://api.telegram.org/bot'+t+'/sendMessage',{method:'post',payload:{chat_id:c,text:String(text).slice(0,3900),parse_mode:'HTML',disable_web_page_preview:'true'},muteHttpExceptions:true});
    return r.getResponseCode()===200;
  }catch(e){return false}
}
function siteLink(it){
  const u=props().getProperty('SITE_URL');
  return u?u+'#go='+encodeURIComponent([it.track,it.dept,it.level,it.semester,it.subject].join('|')):'';
}
function notifyNew(items){
  items=items.filter(i=>!i.hidden&&!i.publishAt);if(!items.length)return;
  const by={};
  items.forEach(i=>{const k=[i.track,i.dept,i.level,i.semester,i.subject].join('|');(by[k]=by[k]||[]).push(i)});
  let t='📚 <b>جديد على الموقع</b>';
  Object.keys(by).slice(0,6).forEach(k=>{
    const a=by[k],f=a[0],lk=siteLink(f);
    t+='\n\n<b>'+hx(f.subject)+'</b> — '+hx(f.level)+(f.dept&&f.dept!=='مشترك'?' • '+hx(f.dept):'');
    a.slice(0,8).forEach(i=>{t+='\n• '+hx(i.title)+' <i>('+hx(i.type)+')</i>'});
    if(a.length>8)t+='\n… و'+(a.length-8)+' ملف كمان';
    if(lk)t+='\n🔗 <a href="'+lk+'">افتح المادة</a>';
  });
  tgSend(t);
}
function folderId(u){
  const s=String(u||'').trim(),m=s.match(/folders\/([\w-]+)/)||s.match(/[?&]id=([\w-]+)/);
  return m?m[1]:(/^[\w-]{20,}$/.test(s)?s:'');
}
function driveIdOf(l){
  const s=String(l||''),m=s.match(/\/d\/([\w-]+)/)||s.match(/[?&]id=([\w-]+)/);
  return m?m[1]:'';
}
function guess(name){
  const n=String(name||'').toLowerCase();let type='محاضرات';
  if(/exam|امتحان|اختبار|midterm|ميدتيرم|ميد|final|فاينال|فاينل|quiz|كويز|banks?|بنك|بنوك|questions?|اسئله|أسئلة|أسئله|سؤال/.test(n))type='امتحانات سابقة';
  else if(/assignment|assign|تكليف|واجب|homework|\bhw\b|project|بروجكت|مشروع|شيت|sheet|task|تاسك/.test(n))type='تكليفات';
  else if(/section|\bsec\d*\b|سكشن|سكاشن|سيكشن|\blabs?\b|لاب|معمل|معامل|tutorial|تمرين|تمارين|عملي|عملى/.test(n))type='سكاشن';
  else if(/summary|summaries|ملخص|تلخيص|مراجعة|مراجعه|review|notes|نوتس|مذكرة|مذكره|مختصر|زتونه|الزتونه/.test(n))type='ملخصات';
  let week='عام';const w=n.match(/(?:week|w|أسبوع|اسبوع|الأسبوع|الاسبوع)\s*[-_#]?\s*(\d{1,2})\b/);
  if(w&&+w[1]>=1&&+w[1]<=16)week='الأسبوع '+(+w[1]);
  else if(/midterm|ميدتيرم/.test(n))week='ميدتيرم';
  else if(/final|فاينال|فاينل/.test(n))week='فاينال';
  return {type,week};
}
function checkLink(it){
  const l=String(it.viewLink||''),id=driveIdOf(l);
  if(id&&/drive\.google\.com|docs\.google\.com/.test(l)){
    try{
      const f=DriveApp.getFileById(id);
      if(f.isTrashed())return 'الملف في سلة محذوفات الدرايف';
      const a=f.getSharingAccess();
      if(a!==DriveApp.Access.ANYONE&&a!==DriveApp.Access.ANYONE_WITH_LINK)return 'مش مشارك لأي حد معاه الرابط';
      return '';
    }catch(e){return 'تعذر فحصه: ممكن يكون اتمسح أو مش متاح لحسابك'}
  }
  try{
    let r=UrlFetchApp.fetch(l,{method:'head',muteHttpExceptions:true,followRedirects:true});
    let c=r.getResponseCode();
    if(c===405||c===501){r=UrlFetchApp.fetch(l,{method:'get',muteHttpExceptions:true,followRedirects:true});c=r.getResponseCode()}
    return c>=400?'الرابط بيرجع خطأ '+c:'';
  }catch(e){return 'الرابط مش بيفتح'}
}
function setHealth(it,pr){
  const s=S('health',H.health),r=findRow('health',it.id);
  if(!pr){if(r>0)s.deleteRow(r);return}
  const v=[it.id,it.title,it.subject,pr,Utilities.formatDate(new Date(),'Africa/Cairo','MM-dd HH:mm')];
  if(r>0)s.getRange(r,1,1,5).setValues([v]);else s.appendRow(v);
}
function runHealth(maxItems,maxMs){
  const t0=Date.now(),items=rows('db').map(r=>{try{return JSON.parse(r[1])}catch(e){return null}}).filter(Boolean);
  if(!items.length)return {checked:0,total:0};
  const p=props();let pos=+(p.getProperty('HEALTH_POS')||0);if(pos>=items.length)pos=0;
  let checked=0;
  while(checked<maxItems&&checked<items.length&&Date.now()-t0<maxMs){
    const it=items[pos%items.length];pos++;checked++;
    setHealth(it,checkLink(it));
  }
  p.setProperty('HEALTH_POS',String(pos%items.length));
  return {checked,total:items.length};
}
function healthRows(){return rows('health').map(r=>({id:r[0],title:r[1],subject:r[2],problem:r[3],at:String(r[4])}))}
function dailyBackup(){
  const name='FCI-Materials-Backups',fi=DriveApp.getFoldersByName(name),folder=fi.hasNext()?fi.next():DriveApp.createFolder(name);
  const r=readAll(true),day=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
  folder.createFile('backup-'+day+'.json',JSON.stringify({db:r.items,reports:r.reports,ann:r.ann,events:r.events,schedule:r.schedule}),'application/json');
  const fl=folder.getFiles(),arr=[];while(fl.hasNext())arr.push(fl.next());
  arr.sort((a,b)=>b.getDateCreated()-a.getDateCreated());arr.slice(14).forEach(f=>f.setTrashed(true));
  const s=S('trash',H.trash),l=s.getLastRow();
  if(l>1){const v=s.getRange(2,1,l-1,3).getValues();for(let i=v.length-1;i>=0;i--)if(Date.now()-(+v[i][2])>30*864e5)s.deleteRow(i+2)}
}
function weeklyDigest(){
  const r=readAll(false),now=Date.now(),day=864e5;
  const left=d=>(new Date(d+'T23:59:59').getTime()-now)/day;
  const ev=r.events.filter(e=>left(e.date)>=0&&left(e.date)<=8).sort((a,b)=>a.date<b.date?-1:1);
  const asg=r.items.filter(i=>i.type==='تكليفات'&&i.deadline&&left(i.deadline)>=0&&left(i.deadline)<=8);
  const wk=r.items.filter(i=>now-i.timestamp<7*day).length;
  let t='📅 <b>ملخص الأسبوع</b>\n'+(wk?'📚 اتضاف '+wk+' ملف جديد':'📚 مفيش ملفات جديدة الأسبوع ده');
  if(ev.length){t+='\n\n⏰ <b>مواعيد قريبة:</b>';ev.forEach(e=>{t+='\n• '+hx(e.title)+(e.subject?' ('+hx(e.subject)+')':'')+' — '+hx(e.date)})}
  if(asg.length){t+='\n\n📝 <b>تكليفات قريبة:</b>';asg.forEach(i=>{t+='\n• '+hx(i.title)+' ('+hx(i.subject)+') — '+hx(i.deadline)})}
  tgSend(t);
}
function weeklyHealth(){
  runHealth(400,5*60*1000);
  const bad=healthRows();
  if(bad.length)tgSend('🩺 <b>فحص الروابط الأسبوعي</b>\nفيه '+bad.length+' رابط محتاج مراجعة:\n'+bad.slice(0,10).map(b=>'• '+hx(b.title)+' ('+hx(b.subject)+') — '+hx(b.problem)).join('\n'));
}
function normalizeSyncInterval(v){
  const s=String(v||'30');
  return ['15','30','60','360','1440'].indexOf(s)>-1?s:'30';
}
function syncIntervalLabel(v){
  return {'15':'كل 15 دقيقة','30':'كل 30 دقيقة','60':'كل ساعة','360':'كل 6 ساعات','1440':'مرة يومياً (4 فجراً)'}[normalizeSyncInterval(v)]||'كل 30 دقيقة';
}
function hasAutoSyncTrigger(){
  try{return ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='autoSync')}catch(e){return false}
}
function installTriggers(intervalArg){
  const iv=normalizeSyncInterval(intervalArg||props().getProperty('SYNC_INTERVAL')||'30');
  const mine=['dailyBackup','weeklyDigest','weeklyHealth','autoSync'];
  ScriptApp.getProjectTriggers().forEach(t=>{if(mine.indexOf(t.getHandlerFunction())>-1)ScriptApp.deleteTrigger(t)});
  ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(2).create();
  ScriptApp.newTrigger('weeklyDigest').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(18).create();
  ScriptApp.newTrigger('weeklyHealth').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(3).create();
  const tb=ScriptApp.newTrigger('autoSync').timeBased();
  if(iv==='15')tb.everyMinutes(15).create();
  else if(iv==='30')tb.everyMinutes(30).create();
  else if(iv==='60')tb.everyHours(1).create();
  else if(iv==='360')tb.everyHours(6).create();
  else tb.everyDays(1).atHour(4).create();
}
// شغّلها يدوياً مرة واحدة لمنح الصلاحيات (درايف + إنترنت + المشغّلات)
function authorize(){
  DriveApp.getRootFolder();ScriptApp.getProjectTriggers();props();
  try{UrlFetchApp.fetch('https://api.telegram.org',{muteHttpExceptions:true})}catch(e){}
}

// إنشاء أول مالك عند الحاجة: ضع INITIAL_OWNER_PASSWORD مؤقتًا في Script Properties ثم شغّل bootstrapOwner().
// تُحذف الخاصية فور إنشاء الحساب؛ لا تضع كلمة المرور في GitHub أو ملفات الواجهة.
function bootstrapOwner(){
  const p=props(),pw=String(p.getProperty('INITIAL_OWNER_PASSWORD')||'');
  if(pw.length<12)throw new Error('أضف INITIAL_OWNER_PASSWORD (12 حرفًا على الأقل) في Script Properties أولًا');
  const s=S('admins',H.admins);
  if(s.getLastRow()>1)throw new Error('يوجد حساب أدمن بالفعل؛ لن يتم إنشاء حساب أولي');
  s.getRange('B:B').setNumberFormat('@');
  s.appendRow(['المالك',hashPass(pw),'owner','']);
  p.deleteProperty('INITIAL_OWNER_PASSWORD');
  clearAuthCache();
  return 'تم إنشاء حساب المالك الأول وحذف كلمة المرور المؤقتة من Script Properties.';
}

/* ===== المنظّم الذكي لدرايف ===== */
const LEVELS_S=['الفرقة الأولى','الفرقة الثانية','الفرقة الثالثة','الفرقة الرابعة'],SEMS_S=['الفصل الأول','الفصل الثاني'];
const DEPT_SPC_S=['هندسة البرمجيات','نظم المعلومات الحيوية','الذكاء الاصطناعي','الأمن السيبراني'];
const ORD_W={
  1:'الاولي|الاول|اولي|اول|first|1st|one',
  2:'الثانيه|الثاني|التانيه|التاني|ثانيه|ثاني|تانيه|تاني|second|2nd|two',
  3:'الثالثه|الثالث|التالته|التالت|ثالثه|ثالث|تالته|تالت|third|3rd|three',
  4:'الرابعه|الرابع|رابعه|رابع|fourth|4th|four'
};
const DEPT_LONG=[['نظم المعلومات الحيويه','نظم المعلومات الحيوية'],['المعلوماتيه الحيويه','نظم المعلومات الحيوية'],['bioinformatics','نظم المعلومات الحيوية'],['علوم الحاسب','علوم الحاسب'],['علوم حاسب','علوم الحاسب'],['computer science','علوم الحاسب'],['نظم المعلومات','نظم المعلومات'],['نظم معلومات','نظم المعلومات'],['information systems','نظم المعلومات'],['تكنولوجيا المعلومات','تكنولوجيا المعلومات'],['information technology','تكنولوجيا المعلومات'],['الوسائط المتعدده','الوسائط المتعددة'],['multimedia','الوسائط المتعددة'],['هندسه البرمجيات','هندسة البرمجيات'],['software engineering','هندسة البرمجيات'],['الذكاء الاصطناعي','الذكاء الاصطناعي'],['artificial intelligence','الذكاء الاصطناعي'],['الامن السيبراني','الأمن السيبراني'],['cyber security','الأمن السيبراني'],['cybersecurity','الأمن السيبراني'],['الحوسبه الامنيه','الأمن السيبراني']];
const DEPT_SHORT={cs:'علوم الحاسب',is:'نظم المعلومات',it:'تكنولوجيا المعلومات',mm:'الوسائط المتعددة',se:'هندسة البرمجيات',ai:'الذكاء الاصطناعي',bis:'نظم المعلومات الحيوية',cyber:'الأمن السيبراني'};
const IGNORE_SUBJ=/^(20\d{2}(\s+20\d{2})?|fci(\s+materials)?|drive|materials|courses|subjects|files|all|new|مواد|المواد|ملفات|الملفات|الكليه|كليه|دراسه|الدراسه|مواد الكليه|حاسبات|حاسبات ومعلومات)$/;
function nrm(t){return String(t||'').toLowerCase().replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[_\-\.\/\\|]+/g,' ').replace(/\s+/g,' ').trim()}
function ordOf(w){for(const k in ORD_W){if(new RegExp('^('+ORD_W[k]+'|'+k+')$').test(w))return +k}return 0}
function levelOf(n){
  let m=n.match(/(?:الفرقه|فرقه|المستوي|مستوي|level|year|السنه|سنه|لفل|grade)\s*(\S+)/);
  if(m){const k=ordOf(m[1]);if(k)return LEVELS_S[k-1]}
  m=n.match(/(\S+)\s*(?:year|level|فرقه|سنه)/);
  if(m){const k=ordOf(m[1]);if(k)return LEVELS_S[k-1]}
  m=n.match(/(?:^|\s)[ly]\s?([1-4])(?:\s|$)/);
  if(m)return LEVELS_S[+m[1]-1];
  const k=ordOf(n);
  if(k&&/^(الاولي|اولي|الثانيه|التانيه|ثانيه|تانيه|الثالثه|التالته|ثالثه|تالته|الرابعه|رابعه)$/.test(n))return LEVELS_S[k-1];
  return '';
}
function semOf(n){
  let m=n.match(/(?:الفصل الدراسي|الترم|التيرم|الفصل|ترم|تيرم|term|semester|sem)\s*(\S+)/);
  if(m){const k=ordOf(m[1]);if(k===1||k===2)return SEMS_S[k-1]}
  m=n.match(/(\S+)\s*(?:term|semester|ترم|تيرم|فصل)/);
  if(m){const k=ordOf(m[1]);if(k===1||k===2)return SEMS_S[k-1]}
  m=n.match(/(?:^|\s)(?:t|s|sem)\s?([12])(?:\s|$)/);
  return m?SEMS_S[+m[1]-1]:'';
}
function deptOf(n){
  const s=n.replace(/^(قسم|برنامج|بقسم|شعبه|dept|department|program)\s+/,'').trim(),combo=levelOf(n)||semOf(n);
  for(const p of DEPT_LONG){if(s===p[0]||(combo&&n.indexOf(p[0])>-1))return p[1]}
  if(DEPT_SHORT[s])return DEPT_SHORT[s];
  if(combo){
    const m=n.match(/(?:^|\s)(cs|is|it|mm|se|ai|bis|cyber)(?:\s|$)/);
    if(m&&DEPT_SHORT[m[1]])return DEPT_SHORT[m[1]];
  }
  return '';
}
function trackOf(n){
  if(/برامج خاصه|البرامج الخاصه|نظام خاص|special/.test(n)||n==='خاص')return 'خاص';
  if(/الاقسام العامه|اقسام عامه|نظام عام|general/.test(n)||n==='عام')return 'عام';
  return '';
}
function typeOf(n){
  if(/exam|امتحان|اختبار|midterm|ميدتيرم|final|فاينال|فاينل|quiz|كويز|\bbanks?\b|بنك|بنوك|questions?|اسئله|سؤال/.test(n))return 'امتحانات سابقة';
  if(/assignment|assign|تكليف|واجب|homework|\bhw\b|project|بروجكت|مشروع|شيت|sheet|task|تاسك/.test(n))return 'تكليفات';
  if(/section|\bsec\d*\b|سكشن|سكاشن|سيكشن|\blabs?\b|لاب|معمل|معامل|tutorial|تمرين|تمارين|عملي/.test(n))return 'سكاشن';
  if(/summary|summaries|ملخص|تلخيص|مراجعه|مراجعات|review|notes|نوتس|مذكره|مذكرات|مختصر|زتونه/.test(n))return 'ملخصات';
  if(/lecture|\blec\d*\b|lecs|محاضر|slides?|سلايد|شرح|نظري|chapter|\bch\s*\d+\b|شابتر/.test(n))return 'محاضرات';
  return '';
}
function folderTypeOf(n,insideSubject){
  if(insideSubject)return typeOf(n);
  const s=String(n||'').replace(/^(ملفات|فولدر|مجلد)\s+/,'').replace(/^ال/,'').trim();
  return /^(lectures?|lecs?|slides?|سلايد|محاضر|نظري|شرح|سكاشن|سكشن|سيكشن|sections?|labs?|لاب|معمل|معامل|عملي|تمارين|تمرين|ملخص|تلخيص|مراجع|مذكر|summar|notes|reviews?|امتحان|اختبار|كويز|بنك|بنوك|اسئله|exams?|past exams?|old exams?|banks?|question|midterm|final|quiz|تكليف|شيت|مشروع|مشاريع|practice|assignment|sheets?|homework|projects?|واجب)/.test(s)?typeOf(n):'';
}
function classifyFolder(name,insideSubject){
  const n=nrm(name),c={},t=trackOf(n),d=deptOf(n),l=levelOf(n),s=semOf(n),ty=folderTypeOf(n,insideSubject),w=guess(name).week;
  if(t)c.track=t;if(d)c.dept=d;if(l)c.level=l;if(s)c.semester=s;if(ty)c.type=ty;if(w!=='عام')c.week=w;
  return c;
}
function rootCtxOf(rootName,def){
  const cls=classifyFolder(rootName,false),c={trail:[]};
  ['track','dept','level','semester','type','week'].forEach(k=>{if(cls[k])c[k]=cls[k]});
  if(def&&def.rootAsSubject)c.subject=String(rootName||'').trim().slice(0,100);
  return c;
}
function childCtx(parent,name){
  const cls=classifyFolder(name,!!(parent&&parent.subject)),c=Object.assign({},parent),n=nrm(name);
  const keys=Object.keys(cls);
  // لو الفولدر اسمه زي اسم قسم (مثل الذكاء الاصطناعي أو هندسة البرمجيات) بس القسم أو الفرقة+الترم متحدد قبل كده، اعتبره اسم مادة
  if(keys.length===1&&cls.dept&&(parent.dept||(parent.level&&parent.semester))&&!parent.subject){
    c.subject=String(name).trim().slice(0,100);
  }else{
    ['track','dept','level','semester','type','week'].forEach(k=>{if(cls[k])c[k]=cls[k]});
    if(!keys.length&&!c.subject&&!IGNORE_SUBJ.test(n))c.subject=String(name).trim().slice(0,100);
  }
  c.trail=(parent.trail||[]).concat([String(name).slice(0,40)]);
  return c;
}
function driveHave(){
  const h={},s=S('db',H.db),l=s.getLastRow();
  if(l<2)return h;
  const v=s.getRange(2,2,l-1,1).getValues();
  for(let i=0;i<v.length;i++){
    const txt=String(v[i][0]||''),m=txt.match(/\/d\/([\w-]{10,})/)||txt.match(/[?&]id=([\w-]{10,})/);
    if(m)h[m[1]]=1;
  }
  return h;
}
function planFile(id,rawName,mime,fromShortcut,ctx,def,have){
  const name=String(rawName||''),nt=nrm(name),g=guess(name),links=fileLinksByMime(id,mime);
  let track=ctx.track||'',dept=ctx.dept||'';
  const level=ctx.level||def.level||'',sem=ctx.semester||def.semester||'',subject=ctx.subject||def.subject||'';
  if(!track&&dept)track=DEPT_SPC_S.indexOf(dept)>-1?'خاص':'عام';
  if(!track)track=def.track||'عام';
  if(!dept)dept=def.dept||'';
  if(track==='عام'&&!dept)dept='مشترك';
  const miss=[];
  if(!track)miss.push('النظام');if(track==='خاص'&&!dept)miss.push('البرنامج');
  if(!level)miss.push('الفرقة');if(!sem)miss.push('الترم');if(!subject)miss.push('المادة');
  return {id,name:stripExt(name),viewLink:links.view,downloadLink:links.dl,fromShortcut:!!fromShortcut,exists:!!have[id],ok:!miss.length,reason:miss.length?'ناقص: '+miss.join('، '):'',trail:(ctx.trail||[]).join(' / '),
    fields:{track,dept,level,semester:sem,subject,type:ctx.type||typeOf(nt)||g.type,week:g.week!=='عام'?g.week:(ctx.week||'عام')}};
}
function getSyncSources(){
  const p=props(),raw=p.getProperty('DRIVE_SOURCES');
  if(raw){
    try{const arr=JSON.parse(raw);if(Array.isArray(arr))return arr.filter(x=>x&&x.id)}catch(e){}
  }
  const legacy=p.getProperty('DRIVE_ROOT');
  if(legacy){
    let def={};try{def=JSON.parse(p.getProperty('DRIVE_DEF')||'{}')}catch(e){}
    let name='الفولدر الرئيسي';try{name=DriveApp.getFolderById(legacy).getName()||name}catch(e){}
    const list=[{id:legacy,name:String(name).slice(0,80),defaults:def,addedAt:''}];
    saveSyncSources(list);
    return list;
  }
  return [];
}
function saveSyncSources(list){
  const p=props();
  p.setProperty('DRIVE_SOURCES',JSON.stringify(list||[]));
  p.deleteProperty('DRIVE_ROOT');p.deleteProperty('DRIVE_DEF');
}
function isPubliclyReadable(f){
  try{const a=f.getSharingAccess();return a===DriveApp.Access.ANYONE||a===DriveApp.Access.ANYONE_WITH_LINK}catch(e){return false}
}
function ensureRootSharedCached(rf){
  // فحص فقط: المزامنة التلقائية لا تغيّر صلاحيات مشاركة ملفات Drive.
  return isPubliclyReadable(rf);
}
function runAutoSync(isManual){
  const p=props(),sources=getSyncSources();
  if(!sources.length){
    if(isManual)throw new Error('مفيش فولدرات مربوطة للمزامنة التلقائية. أضف فولدر الأول');
    return {added:0,bad:0,sources:0,msg:'مفيش فولدرات مربوطة'};
  }
  const have=driveHave(),created=[],t0=Date.now(),LIM=isManual?20000:240000,MAX_NEW=isManual?120:250;
  let bad=0,failedSources=0,checkedSources=0;
  const sys={name:'تلقائي',owner:true,scope:''};
  for(let si=0;si<sources.length&&Date.now()-t0<LIM&&created.length<MAX_NEW;si++){
    const src=sources[si],def=src.defaults||{};
    let rf;try{rf=DriveApp.getFolderById(String(src.id))}catch(e){failedSources++;continue}
    checkedSources++;
    const rootShared=ensureRootSharedCached(rf);
    const rctx=rootCtxOf(rf.getName(),def);
    const stack=[{id:rf.getId(),ctx:rctx,depth:0}],seen={};seen[rf.getId()]=1;
    while(stack.length&&Date.now()-t0<LIM&&created.length<MAX_NEW){
      const cur=stack.pop();let folder;
      try{folder=cur.id===rf.getId()?rf:DriveApp.getFolderById(cur.id)}catch(e){continue}
      const fl=folder.getFiles();
      while(fl.hasNext()&&created.length<MAX_NEW&&Date.now()-t0<LIM){
        const res=resolveDriveEntry(fl.next(),true);
        if(!res)continue;
        if(res.isFolder){
          if((cur.depth||0)<6&&!seen[res.id]){seen[res.id]=1;stack.push({id:res.id,ctx:childCtx(cur.ctx,res.name),depth:(cur.depth||0)+1})}
          continue;
        }
        if(have[res.id])continue;
        const pl=planFile(res.id,res.name,res.mime,res.fromShortcut,cur.ctx,def,have);
        if(!pl.ok){bad++;continue}
        if(!isPubliclyReadable(res.file)){bad++;continue;}
        const it=mkItem(Object.assign({},pl.fields,{title:pl.name,viewLink:pl.viewLink,downloadLink:pl.downloadLink}),sys,created.length);
        if(it){have[pl.id]=1;created.push(it)}
      }
      if((cur.depth||0)<6&&Date.now()-t0<LIM){
        const sub=folder.getFolders();
        while(sub.hasNext()){
          const s=sub.next(),sid=s.getId();
          if(seen[sid])continue;seen[sid]=1;
          stack.push({id:sid,ctx:childCtx(cur.ctx,s.getName()),depth:(cur.depth||0)+1});
        }
      }
    }
  }
  appendItems(created);
  if(created.length){clearCache();notifyNew(created);logIt('تلقائي','autosync',created.length+' ملف من '+checkedSources+' مصدر')}
  const stamp=Utilities.formatDate(new Date(),'Africa/Cairo','MM-dd HH:mm');
  const summary=stamp+' • فُحص '+checkedSources+' فولدر • جديد: '+created.length+(bad?' • مش واضح: '+bad:'')+(failedSources?' • تعذر فتح: '+failedSources:'');
  p.setProperty('AUTOSYNC_LAST',summary);
  const msg=created.length?'تم سحب '+created.length+' ملف جديد من درايف ✅'+(bad?' • ('+bad+' مش واضح)':''):'كل الملفات محدّثة بالفعل — مفيش ملفات جديدة ('+checkedSources+' فولدر)'+(bad?' • '+bad+' ملف ناقصه فرقة/ترم/مادة':'');
  return {added:created.length,bad,sources:checkedSources,msg,summary};
}
function autoSync(){
  if(!getSyncSources().length)return;
  const lock=LockService.getScriptLock();if(!lock.tryLock(30000))return;
  try{runAutoSync(false)}finally{lock.releaseLock()}
}
