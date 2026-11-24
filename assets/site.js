/* AGENT//ARENA. Static local presentation. No network API or analytics. */
(() => {
  "use strict";
  const root = document.documentElement;
  const ar = root.lang === "ar";
  const words = (english, arabic) => ar ? arabic : english;
  const one = (selector, host = document) => host.querySelector(selector);
  const all = (selector, host = document) => Array.from(host.querySelectorAll(selector));
  root.classList.add("enhanced");
  const systemMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionButton = one("button[data-motion]");
  let preference;
  const readPref = () => {
    try { return localStorage.getItem("arena-presentation-motion"); } catch { return null; }
  };
  preference = readPref();
  let motion = false;
  function applyMotion() {
    motion = !systemMotion.matches && preference !== "paused";
    root.dataset.motion = motion ? "enabled" : "paused";
    root.classList.toggle("motion-on", motion);
    root.classList.toggle("motion-off", !motion);
    if (motionButton) {
      const label = systemMotion.matches
        ? words("Motion paused by device preference", "الحركة متوقفة حسب تفضيل جهازك")
        : motion ? words("Pause motion", "إيقاف الحركة") : words("Resume motion", "استئناف الحركة");
      motionButton.setAttribute("aria-pressed", String(!motion));
      motionButton.setAttribute("aria-label", label);
      motionButton.title = label;
      motionButton.disabled = systemMotion.matches;
    }
    document.dispatchEvent(new CustomEvent("arena-motion", { detail: { enabled: motion } }));
  }
  motionButton?.addEventListener("click", () => {
    preference = motion ? "paused" : "enabled";
    try { localStorage.setItem("arena-presentation-motion", preference); } catch { /* Storage is optional. */ }
    applyMotion();
  });
  systemMotion.addEventListener("change", applyMotion);
  applyMotion();
  window.addEventListener("DOMContentLoaded", applyMotion, {once:true});
  const language = one("[data-language]");
  const menu = one(".menu");
  const nav = one(".mainnav");
  function menuOpen(open, returnFocus = false) {
    if (!menu || !nav) return;
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    if (returnFocus) menu.focus({preventScroll:true});
  }
  menu?.addEventListener("click", () => menuOpen(!nav.classList.contains("open")));
  nav?.addEventListener("click", e => { if (e.target.closest("a")) menuOpen(false); });
  window.matchMedia("(min-width:821px)").addEventListener("change", () => menuOpen(false));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav?.classList.contains("open")) menuOpen(false, true);
  });
  document.addEventListener("pointerdown", e => {
    if (nav?.classList.contains("open") && !e.target.closest(".mast")) menuOpen(false);
  });
  document.addEventListener("focusin", e => {
    if (nav?.classList.contains("open") && !e.target.closest(".mast")) menuOpen(false);
  });
  const siteSections = all("main > section[id], .notes-body > section[id]");
  const notesPage = Boolean(one(".notes-body"));
  const sectionLinks = all(notesPage ? ".notes-nav a" : ".mainnav a");
  const landmarkGroups = {
    home:"home", capabilities:"home", architecture:"architecture", "executive-overview":"architecture",
    demo:"demo", "case-study":"demo", evidence:"evidence", gallery:"evidence",
    sectors:"sectors", limits:"sectors", team:"team"
  };
  // Only known local landmarks are carried between language editions.
  const subAnchors = new Set(["overview","results","snapshot","role","rights","recording","documentation",
    "hero-heading","art-caption","arch-heading","case-heading","evidence-heading","role-heading","limits-heading",
    "shot-overview","shot-denied","shot-timeline","shot-pending","shot-closed"]);
  const sectionDetails = new Map(siteSections.map(section => [section, all("[data-reading-detail]", section)]));
  // The compact table of contents changes height when navigation is enhanced.
  // Land an incoming notes link after that layout change, preserving back/forward restoration.
  const initialNote = notesPage && location.hash ? document.getElementById(location.hash.slice(1)) : null;
  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  if (initialNote?.closest(".notes-body") && navigationType === "navigate")
    initialNote.scrollIntoView({behavior:"instant",block:"start"});
  const header = one(".mast");
  let framePending = false;
  function syncReadingPosition() {
    if (!siteSections.length || !language) return;
    const viewport = document.documentElement.clientHeight;
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const line = headerBottom + Math.min(116, Math.max(30, (viewport - headerBottom) * .16));
    const scrollRoot = document.scrollingElement || root;
    const end = scrollRoot.scrollHeight > viewport + 2 && scrollRoot.scrollTop + viewport >= scrollRoot.scrollHeight - 3;
    // On the notes page the introduction precedes the article on compact screens.
    if (notesPage && !end && (siteSections[0].getBoundingClientRect().top > line + 1 ||
        (scrollRoot.scrollTop <= 2 && !location.hash))) {
      const first = siteSections[0];
      // Retain a direct first-note bookmark while its text and the introduction share the viewport.
      const target = location.hash === "#" + first.id && first.getBoundingClientRect().top < viewport * .8 ? first.id : "";
      for (const link of sectionLinks) {
        if (target && link.hash === "#" + target) link.setAttribute("aria-current","location");
        else link.removeAttribute("aria-current");
      }
      if (language.hash !== (target ? "#" + target : "")) language.hash = target;
      return;
    }
    let current = siteSections[0];
    if (end) current = siteSections[siteSections.length - 1];
    else {
      for (const section of siteSections) {
        if (section.getBoundingClientRect().top > line + 1) break;
        current = section;
      }
    }
    const navKey = notesPage ? current.id : landmarkGroups[current.id];
    for (const link of sectionLinks) {
      const active = link.hash === "#" + navKey;
      if (active && !link.hasAttribute("aria-current")) link.setAttribute("aria-current","location");
      if (!active && link.hasAttribute("aria-current")) link.removeAttribute("aria-current");
    }
    const fragment = location.hash.slice(1);
    const addressed = fragment ? document.getElementById(fragment) : null;
    let key = current.id;
    // A single detail on the reading line identifies an individual roadmap item or mobile sector.
    // On a row with multiple columns the shared section is the unambiguous reading position.
    const crossing = sectionDetails.get(current).filter(item => {
      const box = item.getBoundingClientRect();
      if (item.id === "recording" && box.width < item.parentElement.clientWidth * .74) return false;
      return box.top <= line + 1 && box.bottom > line;
    });
    if (!end && crossing.length === 1) key = crossing[0].id;
    const compatible = addressed && (subAnchors.has(fragment) || addressed.hasAttribute("data-reading-detail"));
    if (compatible && (current.contains(addressed) || (end && !notesPage && addressed.id === "rights"))) {
      const rect=addressed.getBoundingClientRect();
      if (rect.top >= headerBottom - 4 && rect.top <= line + 3 ||
          (end && ["rights","documentation"].includes(fragment) && rect.top < viewport && rect.bottom > headerBottom)) key=fragment;
    }
    if (language.hash !== "#" + key) language.hash = key;
  }
  function schedulePosition() {
    if (framePending) return;
    framePending=true;
    requestAnimationFrame(() => {framePending=false;syncReadingPosition();});
  }
  window.addEventListener("scroll",schedulePosition,{passive:true});
  window.addEventListener("resize",schedulePosition);
  window.addEventListener("pageshow",schedulePosition);
  window.addEventListener("load",schedulePosition,{once:true});
  window.addEventListener("hashchange",schedulePosition);
  // Native links retain normal keyboard, context-menu and new-tab behavior.
  for (const event of ["focus","pointerenter","pointerdown","click","contextmenu"])
    language?.addEventListener(event,syncReadingPosition);
  if ("ResizeObserver" in window && siteSections.length) {
    const observer = new ResizeObserver(schedulePosition);
    siteSections.forEach(section=>observer.observe(section));
  }
  syncReadingPosition();
  const people=all(".person");
  const fine=window.matchMedia("(hover:hover) and (pointer:fine)");
  function level(position) { return position < .36 ? "low" : position > .64 ? "high" : "mid"; }
  function clearTilt(card) { card.removeAttribute("data-x");card.removeAttribute("data-y"); }
  for (const card of people) {
    card.addEventListener("pointermove",event=>{
      if (!motion || !fine.matches || event.pointerType==="touch") return;
      const box=card.getBoundingClientRect();
      const x=level((event.clientX-box.left)/box.width), y=level((event.clientY-box.top)/box.height);
      if(card.dataset.x!==x)card.dataset.x=x;
      if(card.dataset.y!==y)card.dataset.y=y;
    },{passive:true});
    card.addEventListener("pointerleave",()=>clearTilt(card));
    card.addEventListener("pointercancel",()=>clearTilt(card));
  }
  document.addEventListener("arena-motion",()=>{if(!motion)people.forEach(clearTilt);});

  const stages=all("[data-stage]");
  const panels=all("[data-stage-panel]");
  function chooseStage(index) {
    stages.forEach((node,n)=>node.setAttribute("aria-pressed",String(n===index)));
    panels.forEach((panel,n)=>{panel.hidden=n!==index;});
  }
  stages.forEach((node,n)=>node.addEventListener("click",()=>chooseStage(n)));
  const arch=one(".arch");
  if (arch && "IntersectionObserver" in window) new IntersectionObserver(items=>{
    arch.dataset.inview=String(items[0].isIntersecting);
  }).observe(arch);
  const cases=all("[data-case]");
  const tabs=all("[data-choice]");
  const status=one("[data-lab-status]");
  function reset(panel) {
    const result=one("[data-outcome]",panel);
    result.hidden=true;
    const options=one(".review-options",result);
    if (options) options.hidden=false;
    const reviewed=one(".review-result",result);
    if (reviewed) { reviewed.hidden=true; reviewed.textContent=""; }
  }
  function selectCase(n, focus=false) {
    tabs.forEach((tab,i)=>{
      tab.tabIndex=i===n?0:-1;
      tab.setAttribute("aria-selected",String(n===i));
      cases[i].hidden=n!==i;
      reset(cases[i]);
    });
    if (focus) tabs[n].focus();
    if(status) status.textContent="";
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener("click",()=>selectCase(i));
    tab.addEventListener("keydown",e=>{
      let by;
      if(e.key==="ArrowRight") by=ar?-1:1;
      if(e.key==="ArrowLeft") by=ar?1:-1;
      let next=by===undefined?null:(i+tabs.length+by)%tabs.length;
      if(e.key==="Home") next=0;
      if(e.key==="End") next=tabs.length-1;
      if(next!==null){ e.preventDefault();selectCase(next,true); }
    });
  });
  const decisionBookmarks = {
    "tab-allow":"allow","panel-allow":"allow","tab-deny":"block","panel-deny":"block",
    "tab-block":"block","panel-block":"block","tab-approval":"approval","panel-approval":"approval",
    "approved-detail":"approval"
  };
  function followDecisionBookmark() {
    const id=location.hash.slice(1);
    if (!Object.hasOwn(decisionBookmarks,id)) return;
    const index=tabs.findIndex(tab=>tab.dataset.choice===decisionBookmarks[id]);
    if(index<0) return;
    selectCase(index);
    const target=document.getElementById(id);
    if(target) target.scrollIntoView({behavior:"instant",block:"start"});
    schedulePosition();
  }
  window.addEventListener("hashchange",followDecisionBookmark);
  if(tabs.length) followDecisionBookmark();
  for (const panel of cases) {
    one(".simulate",panel).addEventListener("click",()=>{
      reset(panel);
      const result=one("[data-outcome]",panel);
      result.hidden=false;
      status.textContent=one(".verdict",result).textContent.trim()+" · "+one("p",result).textContent.trim();
    });
    all("[data-review]",panel).forEach(button=>button.addEventListener("click",()=>{
      const approved=button.dataset.review==="accept";
      const message=approved
        ? words("Approved in the fixture. After server rechecks in the documented case, the synthetic ticket became closed.","موافقة في المحاكاة. بعد إعادة تحقّق الخادم في الحالة الموثّقة، أُغلقت التذكرة الاصطناعية.")
        : words("Rejected in this illustration. The synthetic ticket remains open.","رُفض الطلب في هذه المحاكاة. وتبقى التذكرة الاصطناعية مفتوحة.");
      one(".review-options",panel).hidden=true;
      const output=one(".review-result",panel);
      output.textContent=message; output.hidden=false; output.focus({preventScroll:true});
      status.textContent=message;
    }));
  }
  // Announced evidence is always the final verified result. Animation is visual only.
  const counters=all("[data-count]");
  if(counters.length && "IntersectionObserver" in window) {
    const observer=new IntersectionObserver(entries=>{
      for (const entry of entries) {
        if(!entry.isIntersecting) continue;
        const el=entry.target;
        observer.unobserve(el);
        if(!motion) continue;
        const final=Number(el.dataset.count), value=one("span",el), start=performance.now();
        const tick=now=>{
          const t=motion?Math.min(1,(now-start)/560):1;
          value.textContent=String(Math.min(final,Math.round(final*(1-(1-t)**3))));
          if(t<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },{threshold:.45});
    counters.forEach(el=>observer.observe(el));
  }
  const dialog=one("#viewer");
  if(!dialog) return;
  const gallery=all(".capture[data-image]");
  const frame=one(".image-scroll",dialog),image=one("img",frame),zoom=one("[data-zoom]",dialog);
  let current=0,opener=null;
  function setZoom(on) {
    frame.classList.toggle("original",on);
    zoom.setAttribute("aria-pressed",String(on));
    one("span",zoom).textContent=on?words("Fit image","ملاءمة الصورة"):words("Original pixels","الحجم الأصلي");
    frame.scrollTo({left:0,top:0,behavior:"instant"});
  }
  function show(index) {
    current=(index+gallery.length)%gallery.length;
    const thumb=one("img",gallery[current]);
    image.src=thumb.src; image.alt=thumb.alt; image.width=thumb.width ? Number(thumb.getAttribute("width")) : thumb.naturalWidth;
    one("#viewer-title",dialog).textContent=one("strong",gallery[current]).textContent;
    one(".viewer-alt",dialog).textContent=thumb.alt;
    setZoom(false);
  }
  all("button[data-image]").forEach(button=>button.addEventListener("click",()=>{
    opener=button;show(Number(button.dataset.image));dialog.showModal();document.body.classList.add("modal-open");
    one("[data-dismiss]",dialog).focus({preventScroll:true});
  }));
  one("[data-dismiss]",dialog).addEventListener("click",()=>dialog.close());
  one("[data-prev]",dialog).addEventListener("click",()=>show(current-1));
  one("[data-next]",dialog).addEventListener("click",()=>show(current+1));
  zoom.addEventListener("click",()=>setZoom(!frame.classList.contains("original")));
  dialog.addEventListener("close",()=>{document.body.classList.remove("modal-open");opener?.focus({preventScroll:true});});
  dialog.addEventListener("click",e=>{
    if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
  });
  dialog.addEventListener("keydown",e=>{
    if(frame.classList.contains("original") && e.target===frame) return;
    if(e.key==="ArrowLeft" || e.key==="ArrowRight"){
      e.preventDefault();
      show(current+(e.key==="ArrowRight"?(ar?-1:1):(ar?1:-1)));
    }
  });
})();
