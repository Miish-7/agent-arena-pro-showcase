/* Local presentation controller. The gateway never requests or executes a tool action. */
(() => {
'use strict';
const scriptURL=document.currentScript.src;
const descriptions={
 en:{
  allow:['Proposal · Read this synthetic ticket.','Policy · The read is within the granted scope.','Allow · The scoped read crosses the gateway.'],
  deny:['Proposal · Close a ticket assigned for summarization.','Policy · Closing the ticket exceeds the granted scope.','Deny · The proposed write stops before the tool.'],
  approval:['Proposal · Request a sensitive action in the fixture.','Policy · An authorized human decision is required.','Pending · The action waits at the boundary.','Approved · The simulated reviewer authorizes this action.','Executed once · The simulated approval is consumed.'],
  review:'Check policy',decision:'Show decision',replay:'Replay route',approve:'Approve in simulation',execute:'Execute once'
 },
 ar:{
  allow:['الاقتراح · قراءة التذكرة الاصطناعية المحددة.','السياسة · القراءة ضمن الصلاحية الممنوحة.','سماح · تعبر القراءة المأذون بها البوابة.'],
  deny:['الاقتراح · إغلاق تذكرة طُلب تلخيصها.','السياسة · إغلاق التذكرة يتجاوز الصلاحية الممنوحة.','منع · يتوقف طلب التعديل قبل وصوله إلى الأداة.'],
  approval:['الاقتراح · طلب إجراء حساس في المحاكاة.','السياسة · يتطلب الإجراء قرارًا من مراجع مخوّل.','انتظار · يبقى الإجراء عند حدّ الثقة.','موافقة · أذن المراجع بهذا الإجراء في المحاكاة.','تنفيذ مرة واحدة · استُخدمت الموافقة في المحاكاة.'],
  review:'فحص السياسة',decision:'عرض القرار',replay:'إعادة عرض المسار',approve:'الموافقة في المحاكاة',execute:'التنفيذ مرة واحدة'
 }
};
const choices=['allow','deny','approval'];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let scriptPromise;
// Keep driver initialization off the first paint. The original rendered poster is interactive
// through the same HTML controls while Chrome compiles the optional 3D scene.
function afterContent(){
 return new Promise(resolve=>{
  if(performance.getEntriesByName('first-contentful-paint').length){resolve();return}
  if(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes.includes('paint')){
   const observer=new PerformanceObserver(list=>{
    if(list.getEntries().some(e=>e.name==='first-contentful-paint')){observer.disconnect();resolve()}
   });
   observer.observe({type:'paint',buffered:true});
  }else requestAnimationFrame(()=>requestAnimationFrame(resolve));
 });
}
function getRenderer(){
 if(window.ArenaGateRenderer)return Promise.resolve(window.ArenaGateRenderer);
 if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=new URL('gate-render.js',scriptURL).href;
  script.onload=()=>resolve(window.ArenaGateRenderer);
  script.onerror=()=>reject(new Error('Gateway renderer unavailable'));
  document.head.append(script);
 });
 return scriptPromise;
}
for(const root of document.querySelectorAll('[data-gate-root]')){
 const view=root.querySelector('[data-gate-view]'),canvas=root.querySelector('canvas'),poster=root.querySelector('[data-gate-poster]');
 const ar=document.documentElement.lang.startsWith('ar');
 const base=new URL('.',poster.src),angleLabel=root.querySelector('.gate-angle'),angleInput=angleLabel.querySelector('input');
 const status=root.querySelector('[data-gate-status]'),step=root.querySelector('[data-gate-step]'),buttons=root.querySelectorAll('[data-gate-choice]');
 const words=descriptions[ar?'ar':'en'];
 const incoming=view.querySelector('.gate-origin');
 if(incoming)incoming.textContent=ar?'اقتراح الوكيل':'Agent proposal';
 const outcome=document.createElement('span');outcome.className='gate-edge-label gate-exit';outcome.setAttribute('aria-hidden','true');view.append(outcome);
 let choice='allow',stage=2,angle=0,pointer=0,currentAngle=0,engine=null,frame=0,pending=false,visible=false,lost=false,failed=false,dirty=true;
 let position=-3.24,target=position,start=position,changedAt=0,last=0,animEnd=0;
 let motion=document.documentElement.dataset.motion!=='paused';
 let firstView;
 function enabled(){return motion&&!reduced.matches}
 function positionFor(){if(stage===0)return 2.85;if(stage===1)return 1.67;if(choice==='allow'||stage===4)return -3.24;return .76}
 function updateUI(){
  const text=words[choice][stage];status.textContent=text;
  outcome.textContent=stage<2?(ar?'قيد التحقق':'Checking scope'):choice==='deny'?(ar?'رفض التغيير':'Change denied'):choice==='approval'&&stage===2?(ar?'انتظار المراجعة':'Review required'):choice==='approval'&&stage===3?(ar?'سُجّلت الموافقة':'Approval recorded'):(ar?'إجراء مأذون':'Authorized action');view.setAttribute('aria-label',text);
  const filename=stage<2?'portal-proposal.webp':choice==='deny'?'portal-deny.webp':choice==='approval'&&stage<4?'portal-review.webp':'portal.webp';
  const next=new URL(ar?filename.replace('.webp','-ar.webp'):filename,base).href;if(poster.src!==next)poster.src=next;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.gateChoice===choice));
  root.dataset.gateMode=choice;root.dataset.gateStage=String(stage);
  const label=stage===0?'review':stage===1?'decision':choice==='approval'&&stage===2?'approve':choice==='approval'&&stage===3?'execute':'replay';
  step.textContent=words[label];
 }
 function startMove(){
  const now=performance.now();start=position;target=positionFor();changedAt=now;animEnd=now+900;dirty=true;requestDraw();
 }
 function choose(value){
  if(!choices.includes(value))return;
  const different=choice!==value;choice=value;stage=2;if(different)position=2.85;
  updateUI();startMove();announce();
 }
 function announce(){root.dispatchEvent(new CustomEvent('arena-gate-decision',{bubbles:true,detail:{choice,stage}}))}
 for(const b of buttons)b.addEventListener('click',()=>choose(b.dataset.gateChoice));
 step.addEventListener('click',()=>{
  const final=choice==='approval'?4:2;
  stage=stage>=final?0:stage+1;updateUI();startMove();announce();
 });
 document.addEventListener('arena-gate-choice',e=>choose(e.detail?.choice));
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0}
 function showPoster(){canvas.hidden=true;poster.hidden=false;angleLabel.hidden=true;root.dataset.gateRenderer='poster';stop()}
 function requestDraw(){
  if(!frame&&engine&&!lost&&!failed&&enabled()&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
 }
 function draw(now){
  frame=0;
  if(!enabled()||!visible||document.hidden||!engine||lost)return;
  const moving=now<animEnd||Math.abs(currentAngle-angle-pointer)>.06;
  if(!dirty&&!moving)return;
  if(last&&now-last<32){requestDraw();return}
  last=now;dirty=false;
  const t=Math.max(0,Math.min(1,(now-changedAt)/820));position=start+(target-start)*(t*t*(3-2*t));
  currentAngle+=(angle+pointer-currentAngle)*.34;
  try{
   engine.render({choice,stage,angle:currentAngle,time:now/1000,position});canvas.hidden=false;poster.hidden=true;angleLabel.hidden=false;
   root.dataset.gateRenderer='webgl';
  }catch{failed=true;showPoster();return}
  if(moving)requestDraw();
 }
 async function activate(){
  if(!visible||document.hidden||!enabled()||lost||failed){if(!enabled()||lost||failed)showPoster();else stop();return}
  if(engine){dirty=true;requestDraw();return}
  if(pending)return;pending=true;
  try{
   if(!firstView)firstView=Promise.all([afterContent(),poster.decode().catch(()=>{})]).then(()=>
    new Promise(resolve=>setTimeout(()=>{
     if(window.requestIdleCallback)requestIdleCallback(resolve,{timeout:700});else resolve();
    },250))
   );
   await firstView;
   if(!enabled()||!visible||document.hidden||lost)return;
   const make=await getRenderer();
   if(enabled()&&visible&&!document.hidden&&!lost){
    engine=make(canvas);if(!engine){failed=true;showPoster()}else{dirty=true;requestDraw()}
   }
  }catch{failed=true;showPoster()}finally{pending=false}
 }
 angleInput.addEventListener('input',()=>{angle=Number(angleInput.value);pointer=0;dirty=true;requestDraw()});
 view.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!enabled())return;
  const bounds=view.getBoundingClientRect();pointer=((e.clientX-bounds.left)/Math.max(1,bounds.width)-.5)*8;dirty=true;requestDraw();
 });
 view.addEventListener('pointerleave',()=>{pointer=0;dirty=true;requestDraw()});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;engine=null;showPoster()});
 canvas.addEventListener('webglcontextrestored',()=>{lost=false;failed=false;activate()});
 document.addEventListener('arena-motion',e=>{motion=e.detail?.enabled!==false;activate()});
 reduced.addEventListener('change',activate);
 document.addEventListener('visibilitychange',activate);
 if(window.ResizeObserver)new ResizeObserver(()=>{dirty=true;requestDraw()}).observe(view);
 if(window.IntersectionObserver){
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;activate()},{rootMargin:'24px'}).observe(view);
 }else{visible=true;activate()}
 root.dataset.gateRenderer='poster';updateUI();
}
})();

