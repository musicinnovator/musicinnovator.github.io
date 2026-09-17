(function(){
  const data=window.MUZICLE_LAB_CATALOGS;
  if(!data)return;
  const closeAll=(except)=>document.querySelectorAll('.catalog-popover.open').forEach(panel=>{if(panel!==except){panel.classList.remove('open');panel.closest('.lab-title-wrap')?.querySelector('.catalog-toggle')?.setAttribute('aria-expanded','false')}});
  document.querySelectorAll('[data-lab-catalog]').forEach(root=>{
    const lab=root.dataset.labCatalog;
    const entries=data.catalogs[lab]||[];
    const panel=root.querySelector('.catalog-popover');
    const list=root.querySelector('.catalog-list');
    const input=root.querySelector('.catalog-search');
    const count=root.querySelector('.catalog-count');
    const toggle=root.querySelector('.catalog-toggle');
    const render=(query='')=>{
      const needle=query.trim().toLowerCase();
      const matches=needle?entries.filter(item=>`${item.name} ${item.family}`.toLowerCase().includes(needle)):entries;
      list.innerHTML=matches.map((item,index)=>`<li><span>${String(index+1).padStart(3,'0')}</span><div><strong>${item.name}</strong><small>${item.family}</small></div></li>`).join('');
      count.textContent=`${matches.length.toLocaleString()} of ${entries.length.toLocaleString()} named registrations`;
    };
    render();
    input.addEventListener('input',()=>render(input.value));
    root.addEventListener('mouseenter',()=>{closeAll(panel);panel.classList.add('open')});
    root.addEventListener('mouseleave',()=>{if(!root.contains(document.activeElement))panel.classList.remove('open')});
    root.addEventListener('focusin',()=>{closeAll(panel);panel.classList.add('open')});
    root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))panel.classList.remove('open')});
    toggle.addEventListener('click',event=>{
      event.preventDefault();
      const open=toggle.getAttribute('aria-expanded')!=='true';
      closeAll(open?panel:null);
      panel.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',String(open));
      if(open)input.focus();
    });
  });
  document.addEventListener('click',event=>{if(!event.target.closest('[data-lab-catalog]'))closeAll()});
})();
