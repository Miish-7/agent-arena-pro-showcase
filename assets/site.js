'use strict';
(() => {
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const rtl = document.documentElement.dir === 'rtl';
  const params = new URLSearchParams(location.search);
  const chosen = {};
  const menu = one('.menu-toggle');
  const nav = one('#navigation');
  document.documentElement.classList.add('js');
  menu.hidden = false;
  function showMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label',open ? menu.dataset.close : menu.dataset.open);
    nav.classList.toggle('is-open',open);
  }
  menu.addEventListener('click',() => showMenu(menu.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',event => {if (event.target.closest('a')) showMenu(false);});
  document.addEventListener('keydown',event => {
    if (event.key==='Escape' && menu.getAttribute('aria-expanded')==='true') {showMenu(false);menu.focus();}
  });
  document.addEventListener('click',event => {
    if (menu.getAttribute('aria-expanded')==='true' && !event.target.closest('.masthead')) showMenu(false);
  });
  const narrow = window.matchMedia('(max-width:900px)');
  narrow.addEventListener('change',() => showMenu(false));

  const currentLanguage = document.documentElement.lang;
  const navigation = all('[data-nav]');
  const navTargets = navigation.map(link=>document.getElementById(link.hash.slice(1)));
  let positionPending = false;
  let visibleSection = 'overview';
  let interactionsReady = false;
  function updateLocation() {
    positionPending = false;
    const threshold = one('.masthead').getBoundingClientRect().bottom + 62;
    let selected = 0;
    navTargets.forEach((node,index) => { if (node.getBoundingClientRect().top<=threshold) selected=index; });
    if (window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-3) selected=navTargets.length-1;
    navigation.forEach((link,index) => {
      if (index===selected) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    const nextSection=navTargets[selected].id;
    if (visibleSection!==nextSection) {
      visibleSection=nextSection;
      if (interactionsReady) updateLanguageLinks();
    }
  }
  function requestPosition() {
    if (!positionPending) {positionPending=true;requestAnimationFrame(updateLocation);}
  }
  window.addEventListener('scroll',requestPosition,{passive:true});
  window.addEventListener('resize',requestPosition,{passive:true});
  window.addEventListener('load',requestPosition);
  updateLocation();

  const review = one('[data-review]');
  const follow = review.closest('.approval-follow');
  const approvalPanel = review.closest('[data-panel]');
  const detail = one('#approved-detail');
  const reviewLabel = one('[data-review-label]',review);
  const affected = [
    [one('.node-2 strong',approvalPanel),follow.dataset.gate],
    [one('.node-3 strong',approvalPanel),follow.dataset.outcome],
    [one('[data-result-title]',approvalPanel),follow.dataset.title],
    [one('[data-result-copy]',approvalPanel),follow.dataset.copy]
  ].map(([el,after])=>({el,before:el.textContent,after}));
  const reviewIcons = all('.node-3 use,.outcome-icon use',approvalPanel);
  function setReviewed(value) {
    review.setAttribute('aria-expanded',String(value));
    reviewLabel.textContent=value ? reviewLabel.dataset.end : reviewLabel.dataset.start;
    detail.hidden=!value;
    approvalPanel.classList.toggle('review-complete',value);
    for (const item of affected) item.el.textContent=value ? item.after : item.before;
    reviewIcons.forEach(use=>use.setAttribute('href',value?'#i-check':'#i-review'));
  }
  review.hidden=false;
  setReviewed(false);
  review.addEventListener('click',()=>{
    setReviewed(review.getAttribute('aria-expanded')!=='true');
    updateLanguageLinks();
  });
  function updateLanguageLinks() {
    for (const link of all('[data-language]')) {
      const url=new URL(link.getAttribute('href').split(/[?#]/)[0],document.baseURI);
      if (chosen.path && chosen.path!=='deny') url.searchParams.set('path',chosen.path);
      if (chosen.capture && chosen.capture!=='overview') url.searchParams.set('capture',chosen.capture);
      if (chosen.path==='approval' && review.getAttribute('aria-expanded')==='true') url.searchParams.set('reviewed','1');
      if (location.hash==='#rights' && visibleSection==='limits') url.hash='rights';
      else if (visibleSection!=='overview') url.hash=visibleSection;
      const relative=link.dataset.language==='ar' ? (currentLanguage==='ar'?'../ar/index.html':'./ar/index.html') : (currentLanguage==='ar'?'../index.html':'./index.html');
      link.setAttribute('href',relative+url.search+url.hash);
    }
  }
  function enhanceGroup(group) {
    const buttons=all('[data-tab]',group), panels=all('[data-panel]',group);
    const list=one('[data-tablist]',group),kind=group.dataset.tabs;
    list.setAttribute('role','tablist');
    function select(key,focus=false) {
      if (!buttons.some(button=>button.dataset.tab===key)) key=group.dataset.default;
      chosen[kind]=key;
      for (const button of buttons) {
        const yes=button.dataset.tab===key;
        button.setAttribute('role','tab');
        button.setAttribute('aria-selected',String(yes));
        button.tabIndex=yes ? 0 : -1;
        if (yes && focus) button.focus();
      }
      for (const panel of panels) {
        panel.setAttribute('role','tabpanel');
        panel.tabIndex=0;
        panel.hidden=panel.dataset.panel!==key;
      }
      if(kind==='path' && key!=='approval') setReviewed(false);
      updateLanguageLinks();
    }
    for (const [index,button] of buttons.entries()) {
      button.addEventListener('click',()=>select(button.dataset.tab));
      button.addEventListener('keydown',event=>{
        const n=buttons.length;
        let next;
        if (event.key==='Home') next=0;
        else if (event.key==='End') next=n-1;
        else if (event.key==='ArrowRight') next=(index+(rtl?-1:1)+n)%n;
        else if (event.key==='ArrowLeft') next=(index+(rtl?1:-1)+n)%n;
        else return;
        event.preventDefault();select(buttons[next].dataset.tab,true);
      });
    }
    group.classList.add('enhanced');
    select(params.get(kind)||group.dataset.default);
  }
  all('[data-tabs]').forEach(enhanceGroup);
  if(chosen.path==='approval' && params.get('reviewed')==='1') setReviewed(true);
  window.addEventListener('hashchange',updateLanguageLinks);
  interactionsReady=true;
  updateLanguageLinks();

  const dialog=one('.lightbox');
  if (typeof dialog.showModal==='function') {
    let trigger;
    all('[data-zoom]').forEach(link=>link.addEventListener('click',event=>{
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const figure=link.closest('figure'), image=one('img',figure);
      const large=new Image();large.src=image.getAttribute('src');large.alt=image.alt;
      one('.lightbox-img',dialog).replaceChildren(large);
      one('#lightbox-title',dialog).textContent=one('figcaption strong',figure).textContent;
      one('.lightbox-caption',dialog).textContent=one('figcaption p',figure).textContent;
      trigger=link;dialog.showModal();
    }));
    one('.dialog-close',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog) return;
      const r=dialog.getBoundingClientRect();
      if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();
    });
    dialog.addEventListener('close',()=>{one('.lightbox-img',dialog).replaceChildren();if(trigger?.isConnected)trigger.focus();});
  }
})();
