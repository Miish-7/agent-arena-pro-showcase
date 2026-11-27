(() => {
  "use strict";
  const $ = (s,p=document) => p.querySelector(s);
  const $$ = (s,p=document) => Array.from(p.querySelectorAll(s));
  const ar = document.documentElement.lang === "ar";
  const key = document.body.dataset.page;
  const menus = $$(".navgroup"), nav = $("#navigation"), menu = $("#menu");
  function closeNav() {
    menus.forEach(d => d.open = false);
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded","false");
  }
  menu.addEventListener("click", () => {
    if (nav.classList.contains("open")) closeNav();
    else {nav.classList.add("open");menu.setAttribute("aria-expanded","true");}
  });
  menus.forEach(d => {
    d.addEventListener("toggle", () => {if (d.open) menus.filter(x => x !== d).forEach(x => x.open = false);});
  });
  document.addEventListener("click",e => {if (!e.target.closest(".top")) closeNav();});
  document.addEventListener("keydown",e => {
    if (e.key !== "Escape") return;
    const open = menus.find(d => d.open);
    if(open){open.open=false;open.querySelector("summary").focus();}
    else if(nav.classList.contains("open")){closeNav();menu.focus();}
  });
  $$("#navigation a").forEach(link => {
    if(link.pathname.replace(/index\.html$/,"")===location.pathname.replace(/index\.html$/,"")){
      link.setAttribute("aria-current","page");link.closest("details")?.classList.add("current");
    }
  });
  const motion=$("#motion"), system=matchMedia("(prefers-reduced-motion: reduce)");
  let manual=false;
  try {manual=sessionStorage.getItem("arena-pause")==="1";}catch {}
  function sync(){
    const paused=manual||system.matches;
    document.documentElement.dataset.motion=paused?"paused":"enabled";
    motion.setAttribute("aria-pressed",String(paused));
    motion.disabled=system.matches;
    const msg=system.matches?(ar?"تقليل الحركة بحسب إعدادات الجهاز":"Reduced motion follows your device"):paused?(ar?"تشغيل الحركة الزخرفية":"Resume decorative motion"):(ar?"إيقاف الحركة الزخرفية":"Pause decorative motion");
    motion.setAttribute("aria-label",msg);motion.title=msg;motion.firstElementChild.textContent=paused?"▷":"Ⅱ";
    document.dispatchEvent(new CustomEvent("arena-motion",{detail:{enabled:!paused}}));
  }
  motion.addEventListener("click",()=>{manual=!manual;try{sessionStorage.setItem("arena-pause",manual?"1":"0");}catch{}sync();});
  system.addEventListener("change",sync);sync();
  const pickers=$$("[data-picker]");
  function choose(root,val) {
    const btns=$$("[data-pick]",root), active=btns.find(b=>b.dataset.pick===val)||btns[0];
    for(const b of btns)b.setAttribute("aria-pressed",String(b===active));
    for(const p of $$("[data-panel]",root))p.hidden=p.dataset.panel!==active.dataset.pick;
  }
  for(const root of pickers){
    for(const b of $$("[data-pick]",root))b.addEventListener("click",()=>{choose(root,b.dataset.pick);history.replaceState(null,"","#"+b.dataset.pick);});
  }
  function notesTarget(target,scroll){
    if(!target||key!=="notes")return;
    for(let el=target;el;el=el.parentElement)if(el.tagName==="DETAILS"){el.open=true;el.hidden=false;}
    if(scroll)requestAnimationFrame(()=>target.scrollIntoView({block:"start"}));
  }
  function route(){
    const h=location.hash.slice(1);
    pickers.forEach(r=>choose(r,h));
    if(!key&&h){
      const map={architecture:"architecture/",demo:"lab/",evidence:"evidence/",results:"evidence/#python",snapshot:"evidence/",team:"about/#delivery",role:"about/#delivery",limits:"security/#limits","case-study":"notes/#case",recording:"notes/#fixture-recording",gallery:"platform/",sectors:"sectors/",capabilities:"platform/","executive-overview":"sectors/",documentation:"resources/",rights:"notes/#rights",verification:"evidence/", "approved-detail":"lab/#approval"};
      const g=h.match(/^shot-(?:tab-)?(overview|denied|timeline|pending|closed)$/),s=h.match(/^sector-(.+)$/),t=h.match(/^(?:panel|tab)-(allow|block|deny|approval)$/);
      const next=(g&&g[1]==="overview"?(ar?"../":"")+"assets/dashboard-new.png":null)||map[h]||(g?"platform/#"+({overview:"overview",denied:"fixture",timeline:"timeline",pending:"pending",closed:"closed"}[g[1]]):s?"sectors/#"+s[1]:t?"lab/#"+(t[1]==="block"?"deny":t[1]==="allow"?"read":t[1]):null);
      if(next){location.replace(new URL(next,location.href.split("#")[0]));return;}
    }
    if(h)notesTarget(document.getElementById(h),true);
  }
  route();window.addEventListener("hashchange",route);
  const arch=$("#arch-choice");
  if(arch){
    const labels=ar?{
      read:"الإجراء ضمن النطاق. تقرأ الأداة التذكرة الاصطناعية وتُسجَّل القراءة.",
      deny:"الرفض يوقف التغيير عند البوابة. تبقى التذكرة مفتوحة، ويُسجّل سبب الرفض.",
      approval:"يتوقف المسار عند المراجع. تتطلب المتابعة موافقة مخوّلة مطابقة وإعادة تحقق قبل تنفيذ الإجراء مرة واحدة."
    }:{
      read:"Within scope. The tool reads the synthetic ticket and the read is recorded.",
      deny:"The gateway stops the proposed change. The ticket stays open and the denial reason is recorded.",
      approval:"The proposal waits for a reviewer. A matching approval and revalidation are required before the tool can execute once."
    };
    function pathState(){
      const k=arch.value;
      $(".flowchart").dataset.outcome=k;
      for(const b of $$("[data-node]")){
        const v=b.dataset.node;
        b.dataset.path=((v==="approval"&&k!=="approval")||(v==="execution"&&k!=="read"))?"idle":"used";
      }
      $("#arch-effect").textContent=labels[k];
    }
    arch.addEventListener("change",pathState);pathState();
    for(const b of $$("[data-node]"))b.addEventListener("click",()=>{
      const control=document.querySelector('[data-pick="'+b.dataset.node+'"]');
      control.click();control.focus({preventScroll:true});control.scrollIntoView({block:"nearest"});
    });
  }
  const search=$("[data-search]");
  if(search) search.addEventListener("input",()=>{
    const term=search.value.trim().toLocaleLowerCase();let n=0;
    for(const el of $$("[data-searchable]")){el.hidden=!el.textContent.toLocaleLowerCase().includes(term);if(!el.hidden)n++;}
    $("[data-empty]").hidden=n>0;
  });
  const sw=$("#language"),base=sw.href;
  function translated(){
    let id=location.hash.slice(1);
    if(key==="notes"){
      const anchor=$$(".note:not([hidden]),.note[open] [id]").filter(n=>n.getBoundingClientRect().height>0&&n.getBoundingClientRect().top<innerHeight*.6).pop();
      if(anchor)id=anchor.id;
    }
    if(key===""){
      let visible=$("#product-view").getBoundingClientRect();
      if(visible.top<innerHeight*.55&&visible.bottom>70)id="product-view";
      else if(scrollY<70)id="";
    }
    sw.href=base+(id?"#"+encodeURIComponent(id):"");
  }
  ["focus","pointerdown","click"].forEach(ev=>sw.addEventListener(ev,translated));
  const zoom=$("#zoom");
  $$("[data-zoom]").forEach(a=>a.addEventListener("click",e=>{
    if(!zoom.showModal)return;e.preventDefault();const img=$("img",zoom);img.src=a.href;img.alt=$("img",a).alt;zoom.showModal();
  }));
  $("button",zoom).addEventListener("click",()=>zoom.close());
  zoom.addEventListener("click",e=>{if(e.target===zoom)zoom.close();});
})();
