const carousel=document.querySelector('.immersive-carousel');
const slides=[...document.querySelectorAll('.carousel-slide')];
const dots=[...document.querySelectorAll('.carousel-dot')];
const status=document.querySelector('.carousel-status');
const pauseButton=document.querySelector('.carousel-pause');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeSlide=0;
let carouselTimer;
let paused=reduceMotion;

function restartProgress(){
  const progress=document.querySelector('.carousel-progress span');
  if(!progress)return;
  progress.style.animation='none';
  void progress.offsetWidth;
  progress.style.animation='';
}

function showSlide(index,announce=true){
  activeSlide=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>{
    const active=i===activeSlide;
    slide.classList.toggle('active',active);
    slide.setAttribute('aria-hidden',String(!active));
  });
  dots.forEach((dot,i)=>{
    dot.classList.toggle('active',i===activeSlide);
    dot.setAttribute('aria-current',i===activeSlide?'true':'false');
  });
  status.textContent=`${String(activeSlide+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  if(announce)restartProgress();
}

function scheduleCarousel(){
  clearInterval(carouselTimer);
  if(!paused)carouselTimer=setInterval(()=>showSlide(activeSlide+1),8000);
  carousel?.classList.toggle('paused',paused);
  if(pauseButton){
    pauseButton.textContent=paused?'▶':'Ⅱ';
    pauseButton.setAttribute('aria-label',paused?'Play carousel':'Pause carousel');
    pauseButton.setAttribute('aria-pressed',String(paused));
  }
}

document.querySelector('.carousel-next')?.addEventListener('click',()=>{showSlide(activeSlide+1);scheduleCarousel()});
document.querySelector('.carousel-prev')?.addEventListener('click',()=>{showSlide(activeSlide-1);scheduleCarousel()});
dots.forEach((dot,i)=>dot.addEventListener('click',()=>{showSlide(i);scheduleCarousel()}));
pauseButton?.addEventListener('click',()=>{paused=!paused;scheduleCarousel()});
carousel?.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){showSlide(activeSlide+1);scheduleCarousel()}
  if(event.key==='ArrowLeft'){showSlide(activeSlide-1);scheduleCarousel()}
});
showSlide(0,false);
scheduleCarousel();

const players=[...document.querySelectorAll('.listening-card')];
let activeAudio=null;
function formatTime(seconds){
  if(!Number.isFinite(seconds))return '0:00';
  return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
}
function stopOtherPlayers(next){
  players.forEach(card=>{
    const audio=card.querySelector('audio');
    if(audio!==next&&!audio.paused){audio.pause();card.querySelector('.audio-play').textContent='▶'}
  });
}
players.forEach(card=>{
  const audio=card.querySelector('audio');
  const play=card.querySelector('.audio-play');
  const image=card.querySelector('.audio-stage img');
  const title=card.querySelector('.audio-current strong');
  const description=card.querySelector('.audio-current span');
  const time=card.querySelector('.audio-time');
  const progress=card.querySelector('.audio-progress');
  const variants=[...card.querySelectorAll('.variant-button')];
  function selectVariant(button,autoplay=false){
    const wasPlaying=!audio.paused;
    audio.pause();
    audio.src=button.dataset.audio;
    image.src=button.dataset.waveform;
    image.alt=`Waveform for ${button.dataset.title}`;
    title.textContent=button.dataset.title;
    description.textContent=button.dataset.description;
    variants.forEach(item=>{const current=item===button;item.classList.toggle('active',current);item.setAttribute('aria-pressed',String(current))});
    progress.style.width='0%';
    time.textContent='0:00';
    if(autoplay||wasPlaying){stopOtherPlayers(audio);audio.play().catch(()=>{});play.textContent='Ⅱ';activeAudio=audio}
  }
  variants.forEach(button=>button.addEventListener('click',()=>selectVariant(button,true)));
  play.addEventListener('click',()=>{
    if(audio.paused){stopOtherPlayers(audio);audio.play().then(()=>{play.textContent='Ⅱ';activeAudio=audio}).catch(()=>{})}
    else{audio.pause();play.textContent='▶'}
  });
  audio.addEventListener('timeupdate',()=>{
    const percent=audio.duration?audio.currentTime/audio.duration*100:0;
    progress.style.width=`${percent}%`;
    time.textContent=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });
  audio.addEventListener('ended',()=>{play.textContent='▶';progress.style.width='0%';time.textContent=`0:00 / ${formatTime(audio.duration)}`});
  selectVariant(variants[0]);
});

const siteDialog=document.querySelector('#site-dialog');
const siteDialogKicker=siteDialog?.querySelector('[data-dialog-kicker]');
const siteDialogTitle=siteDialog?.querySelector('[data-dialog-title]');
const siteDialogBody=siteDialog?.querySelector('[data-dialog-body]');
const dialogCopy={
  support:{kicker:'SUPPORT',title:'A support path built for musicians',body:'Launch support will include guided setup, workflow articles, current release notes, and direct contact routes. Final service hours and response terms will be published before sale.'},
  downloads:{kicker:'DOWNLOADS',title:'Release downloads are being prepared',body:'The production installer, release notes, integrity hashes, and license instructions will appear here when the public build is ready. This marketing kit does not distribute the application installer.'},
  company:{kicker:'HARRIS SOFTWARE SOLUTIONS, LLC',title:'Musician-centered software development',body:'Harris Software Solutions, LLC develops Muzicle as a focused environment for MIDI transformation, notation, arranging, and compositional exploration.'}
};
document.querySelectorAll('[data-site-dialog]').forEach(button=>button.addEventListener('click',()=>{
  const copy=dialogCopy[button.dataset.siteDialog];
  siteDialogKicker.textContent=copy.kicker;siteDialogTitle.textContent=copy.title;siteDialogBody.textContent=copy.body;siteDialog.showModal();
}));
document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));

const searchDialog=document.querySelector('#search-dialog');
const searchInput=document.querySelector('#site-search-input');
const searchResults=document.querySelector('.search-results');
const searchable=[...document.querySelectorAll('main section[id]')].map(section=>({
  id:section.id,
  title:section.querySelector('h1,h2,h3')?.textContent.trim()||section.id,
  text:section.innerText.replace(/\s+/g,' ').trim()
}));
function renderSearch(query=''){
  const normalized=query.trim().toLowerCase();
  const matches=searchable.filter(item=>!normalized||item.text.toLowerCase().includes(normalized)).slice(0,8);
  searchResults.innerHTML=matches.length?matches.map(item=>`<a href="#${item.id}"><strong>${item.title}</strong><small>${item.text.slice(0,125)}${item.text.length>125?'…':''}</small></a>`).join(''):'<p>No matching Muzicle section found.</p>';
  searchResults.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>searchDialog.close()));
}
document.querySelector('[data-search-open]')?.addEventListener('click',()=>{renderSearch();searchDialog.showModal();setTimeout(()=>searchInput.focus(),0)});
searchInput?.addEventListener('input',()=>renderSearch(searchInput.value));

document.querySelector('[data-portal-open]')?.addEventListener('click',()=>document.querySelector('#portal-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()}));

window.__muzicleImmersive={slides:slides.length,players:players.length,get activeSlide(){return activeSlide},get activeAudio(){return activeAudio}};
