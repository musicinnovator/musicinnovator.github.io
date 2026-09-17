(function(){
  const data=window.MUZICLE_LAB_CATALOGS;
  const lab=document.body.dataset.showcase;
  if(!data||!lab)return;
  const settings={
    transformation:{label:'Transformation Laboratory',count:276,accent:'cyan',headline:'Turn one musical identity toward ten different futures.',lede:'Pitch, interval, tonal function, register, scope, and direction become compositional material. These ten process previews are only a glimpse of 276 named registrations.'},
    rhythm:{label:'Rhythm Laboratory',count:571,accent:'lime',headline:'Compose the energy between the notes.',lede:'Density, accent, pulse, silence, displacement, modulation, syncopation, and tuplets become a field for deliberate development. These ten process previews are only a glimpse of 571 named registrations.'},
    retro:{label:'Retro Laboratory',count:838,accent:'violet',headline:'Reimagine direction without surrendering musical purpose.',lede:'Reverse timing, phrase direction, cadential behavior, interval motion, and hybrid strategies reveal new paths through existing material. These ten process previews are only a glimpse of 838 named registrations.'},
    repetition:{label:'Repetition Workflow',count:null,accent:'lime',headline:'Make repetition a compositional decision.',lede:'Define an exact source range, choose how new material is generated and placed, then keep developing the copies while the source remains available.'}
  }[lab];
  const items=lab==='repetition'?data.repetition:data.featured[lab];
  const hero=document.querySelector('[data-showcase-hero]');
  hero.innerHTML=`<p class="showcase-kicker">${settings.label}</p><h1>${settings.headline}</h1><p>${settings.lede}</p>${settings.count?`<div class="sample-ratio"><strong>10</strong><span>featured processes<br>from ${settings.count.toLocaleString()} registrations</span></div>`:''}`;
  const grid=document.querySelector('[data-showcase-grid]');
  grid.innerHTML=items.map((item,index)=>`<article class="process-card ${settings.accent}" tabindex="0" data-audio-card><figure><img src="${item.visual}" alt="Animated musical graphic for ${item.name}"><span>${String(index+1).padStart(2,'0')}</span><button type="button" class="hover-audio" aria-label="Play audio preview for ${item.name}">▶ Listen</button></figure><div><p>${item.family||settings.label}</p><h2>${item.name}</h2><p>${item.description}</p></div><audio preload="metadata" src="${item.audio}"></audio></article>`).join('');
  let active=null;
  const stop=card=>{const audio=card?.querySelector('audio');if(audio){audio.pause();audio.currentTime=0}card?.classList.remove('playing');const button=card?.querySelector('.hover-audio');if(button)button.textContent='▶ Listen';if(active===card)active=null};
  const play=async card=>{if(active&&active!==card)stop(active);const audio=card.querySelector('audio');try{await audio.play();active=card;card.classList.add('playing');card.querySelector('.hover-audio').textContent='■ Stop'}catch{card.classList.add('audio-ready')}};
  document.querySelectorAll('[data-audio-card]').forEach(card=>{
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')play(card)});
    card.addEventListener('pointerleave',()=>stop(card));
    card.addEventListener('focusin',()=>play(card));
    card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget))stop(card)});
    card.querySelector('.hover-audio').addEventListener('click',event=>{event.stopPropagation();card.classList.contains('playing')?stop(card):play(card)});
    card.querySelector('audio').addEventListener('ended',()=>stop(card));
  });
  const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
})();
