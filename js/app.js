/* Doomsday Vault: interaction (sign-in vault, smoke, timeline, detail view, watched list)
   Needs js/data.js to be loaded first. */

const ICONS = {
  team:'<circle cx="12" cy="6.5" r="3.4" fill="currentColor"/><circle cx="5.8" cy="16.8" r="3.4" fill="currentColor"/><circle cx="18.2" cy="16.8" r="3.4" fill="currentColor"/>',
  cosmic:'<circle cx="12" cy="12" r="5" fill="currentColor"/><ellipse cx="12" cy="12" rx="10.4" ry="3.8" fill="none" stroke="currentColor" stroke-width="1.8" transform="rotate(-25 12 12)"/>',
  mystic:'<circle cx="9" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/>',
  street:'<path fill="currentColor" d="M2.5 10h6v11.5h-6zM9.5 3h6v18.5h-6zM16.5 12h5v9.5h-5z"/>',
  mutant:'<path d="M7 2c0 6 10 6 10 10S7 16 7 22M17 2c0 6-10 6-10 10s10 4 10 10" fill="none" stroke="currentColor" stroke-width="2"/><path fill="currentColor" d="M8 5.4h8v1.8H8zM8 16.8h8v1.8H8z"/>',
  royal:'<path fill="currentColor" d="M3 19.5h18l-1.6-11.5-4.6 4.4L12 5l-2.8 7.4L4.6 8z"/>',
  tech:'<path fill="currentColor" d="M13.5 1.5L4 14h7l-1.5 8.5L20 10h-7z"/>',
  quantum:'<path fill="currentColor" d="M6 2.5h12V6l-4.6 6 4.6 6v3.5H6V18l4.6-6L6 6z"/>',
  origin:'<path fill="currentColor" d="M12 2.5l8.5 9.5h-5.2v9.5H8.7V12H3.5z"/>',
  doom:'<path fill="none" stroke="currentColor" stroke-width="1.6" d="M12 2.5l9 5.2v8.6l-9 5.2-9-5.2V7.7z"/><path fill="currentColor" d="M12 6.5l5 2.9v5.2l-5 2.9-5-2.9V9.4z"/>'
};
const sigil=(cat,cls='')=>`<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}">${ICONS[cat]}</svg>`;
const CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const fit=(t,base,max,min)=>{ const L=Math.max(...t.split(' ').map(w=>w.length)); return Math.max(min,Math.min(max,base/L)); };

const state={user:null,order:'release',show:'all',watched:{},hideSeen:false,open:null};
try{ const s=JSON.parse(localStorage.getItem('doomsdayVault')||'null'); if(s) Object.assign(state,{user:s.user||null,order:s.order||'release',show:s.show||'all',watched:s.watched||{},hideSeen:!!s.hideSeen}); }catch(e){}
const save=()=>{ try{ localStorage.setItem('doomsdayVault',JSON.stringify({user:state.user,order:state.order,show:state.show,watched:state.watched,hideSeen:state.hideSeen})); }catch(e){} };
const $=s=>document.querySelector(s);
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmtDate=d=>new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
const fmtShort=iso=>new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const fmtMin=m=>m?`${Math.floor(m/60)} h ${m%60} min`:'Not listed yet';
const doomTime=()=>new Date(DOOM_DATE+'T00:00:00');
const daysLeft=()=>{ const ms=doomTime()-new Date(); return ms<=0?0:Math.max(1,Math.floor(ms/864e5)); };
const pad=n=>String(n).padStart(2,'0');
const laneTag=f=>SERIES[f.id]?`<span class="lane m">${SERIES[f.id].label}</span>`:f.lanes==='mx'?'<span class="lane mx">MCU and X-Men</span>':f.lanes==='x'?'<span class="lane x">X-Men</span>':'<span class="lane m">MCU</span>';

/* ================= green smoke ================= */
const smoke=(()=>{
  const cv=$('#smoke'),ctx=cv.getContext('2d'); let W=0,H=0,parts=[],raf=null,source=null,seepRate=0;
  const sp=document.createElement('canvas'); sp.width=sp.height=256;
  const g=sp.getContext('2d'), rg=g.createRadialGradient(128,128,0,128,128,128);
  rg.addColorStop(0,'rgba(34,112,64,1)'); rg.addColorStop(.4,'rgba(26,92,52,.45)'); rg.addColorStop(1,'rgba(20,70,40,0)'); g.fillStyle=rg; g.fillRect(0,0,256,256);
  function resize(){ const d=Math.min(2,devicePixelRatio||1); W=innerWidth; H=innerHeight; cv.width=W*d; cv.height=H*d; ctx.setTransform(d,0,0,d,0,0); }
  function make(x,y,b){ return {x:x??Math.random()*W,y:y??H+Math.random()*200,r:(b?110:180)+Math.random()*(b?150:300),vx:b?(Math.random()-.5)*2.6:(Math.random()-.5)*.25,vy:b?-(Math.random()*1.6+.4):-(Math.random()*.35+.12),max:(b?.16:.07)+Math.random()*(b?.08:.05),life:0,span:b?250+Math.random()*150:900+Math.random()*700,rot:Math.random()*6.28,vr:(Math.random()-.5)*.002,b}; }
  // smoke leaking out of the vault door's seam
  function wisp(){
    const s=source(); if(!s) return;
    const ang=Math.random()*Math.PI*2, out=.6+Math.random()*.8;
    parts.push({x:s.x+Math.cos(ang)*s.r,y:s.y+Math.sin(ang)*s.r,r:s.r*(.16+Math.random()*.22),
      vx:Math.cos(ang)*out*.7+(Math.random()-.5)*.3,vy:Math.sin(ang)*out*.45-(.35+Math.random()*.55),
      max:.14+Math.random()*.1,life:0,span:160+Math.random()*160,rot:Math.random()*6.28,vr:(Math.random()-.5)*.01,b:true,grow:.35,seep:true});
  }
  function frame(){
    if(source){ let n=seepRate; while(n>=1){ wisp(); n--; } if(Math.random()<n) wisp(); }
    ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation='source-over';   // drawn as dark smoke, not light
    for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.life++; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.r+=p.grow??.12;
      const t=p.life/p.span, a=t<.2?p.max*(t/.2):p.max*(1-(t-.2)/.8);
      if(p.life>=p.span){ parts.splice(i,1); if(!p.b) parts.push(make()); continue; }
      ctx.globalAlpha=Math.max(0,a); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.scale(1,.7); ctx.drawImage(sp,-p.r,-p.r,p.r*2,p.r*2); ctx.restore(); }
    ctx.globalAlpha=1; raf=requestAnimationFrame(frame);
  }
  function init(){ resize(); const n=W<700?5:9; parts=Array.from({length:n},()=>{const p=make(); p.y=Math.random()*H*1.1; p.life=Math.random()*p.span*.6; return p;});
    cancelAnimationFrame(raf); frame(); if(reduce()) cancelAnimationFrame(raf); }
  addEventListener('resize',resize);
  return {init,
    burst(x,y,n=24){ if(reduce()) return; for(let i=0;i<n;i++) parts.push(make(x+(Math.random()-.5)*80,y+(Math.random()-.5)*80,true)); },
    seep(fn,rate=.9){ source=fn; seepRate=rate; document.body.classList.add('at-gate'); },
    stopSeep(){ source=null; document.body.classList.remove('at-gate'); },
    // a huge cloud rolling out from (x,y) until it covers the screen
    flood(x,y){ if(reduce()) return; const R=Math.hypot(W,H);
      parts.forEach(p=>{ if(p.seep) p.span=Math.min(p.span,p.life+30); });   // leaking wisps dissolve into the cloud
      for(let i=0;i<140;i++){ const ang=Math.random()*Math.PI*2, sp2=2+Math.random()*9;
        parts.push({x,y,r:60+Math.random()*120,vx:Math.cos(ang)*sp2,vy:Math.sin(ang)*sp2-.5,max:.12+Math.random()*.1,life:-Math.random()*30,
          span:150+Math.random()*70,rot:Math.random()*6.28,vr:(Math.random()-.5)*.01,b:true,grow:R/320}); } }
  };
})();

/* ================= sign-in ================= */
(function build(){
  // gold clasps around the frame (12, evenly spaced, skipping the hinge side)
  let c=''; for(let i=0;i<12;i++){ if(i===9) continue; const ang=i/12*Math.PI*2-Math.PI/2, x=(200+Math.cos(ang)*172).toFixed(1), y=(200+Math.sin(ang)*172).toFixed(1);
    c+=`<g class="clasp"><circle cx="${x}" cy="${y}" r="12" fill="#EAC35A" stroke="#0D0D0D" stroke-width="4"/><path d="M${x-6} ${+y+3}l9-9M${x-3} ${+y+7}l9-9" stroke="#0D0D0D" stroke-width="2"/></g>`; }
  $('#clasps').innerHTML=c;
  // rivets around the door, between the edge and the centre plate
  let r=''; for(let i=0;i<24;i++){ const ang=i/24*Math.PI*2; const x=200+Math.cos(ang)*132, y=200+Math.sin(ang)*132;
    if(x<100 && Math.abs(y-200)<62) continue;              // hidden under the hinge arms
    r+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="#323C55" stroke="#0D0D0D" stroke-width="1.5"/>`; }
  $('#rivets').innerHTML=r;
  // locking bolts poking out of the door edge into the frame (they slide in when it opens)
  let bo=''; for(let i=0;i<12;i++){ const deg=i*30+15; if(deg>150 && deg<210) continue;   // not on the hinge side
    bo+=`<g transform="rotate(${deg} 200 200)"><rect class="bolt" x="193" y="38" width="14" height="22" rx="2" fill="#A9B8D6" stroke="#0D0D0D" stroke-width="3"/></g>`; }
  $('#bolts').innerHTML=bo;
})();
const vaultEl=$('#vault');
function vaultSource(){ if($('#gate').hidden) return null; const r=vaultEl.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r.width*.37}; }
const IDLE_SMOKE=.3;     // a little smoke always leaks from the door
let opening=false;
$('#form').addEventListener('submit',e=>{ e.preventDefault();
  const n=$('#codename').value.trim(), p=$('#passcode').value;
  if(!n){ $('#err').textContent='Enter a codename to continue.'; $('#codename').focus(); return; }
  if(p.length<4){ $('#err').textContent='Passcode needs at least 4 characters.'; $('#passcode').focus(); return; }
  $('#err').textContent=''; openVault(n); });
$('#guest').addEventListener('click',()=>openVault(null));
function openVault(name){
  if(opening) return; opening=true;
  state.user=name||'Guest'; save(); $('#passcode').value='';
  if(reduce()){ showApp(); opening=false; return; }
  const r=vaultEl.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  // timeline (ms)
  const T={bolts:250, wheel:850, unseal:1950, swing:2300, push:2550, flood:3200};
  const fwd={fill:'forwards'};
  // 0. everything but the vault falls away
  [$('#gTitle'),$('#form')].forEach(n=>n.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(12px)'}],{duration:450,easing:'ease-in',...fwd}));
  smoke.seep(vaultSource,.9);
  setTimeout(()=>smoke.seep(vaultSource,1.6),T.bolts);
  // 1. locking bolts: a small tug outward, then they slide in one after another
  document.querySelectorAll('.bolt').forEach((b,i)=>b.animate(
    [{transform:'translateY(0)'},{transform:'translateY(-4px)',offset:.3,easing:'cubic-bezier(.6,0,.9,.4)'},{transform:'translateY(27px)'}],
    {duration:340,delay:T.bolts+i*55,...fwd}));
  // 2. the wheel: wind back, heavy spin, settle
  $('#wheel').animate(
    [{transform:'rotate(0)',easing:'ease-out'},{transform:'rotate(18deg)',offset:.15,easing:'cubic-bezier(.5,0,.2,1)'},
     {transform:'rotate(-372deg)',offset:.86,easing:'ease-in-out'},{transform:'rotate(-360deg)'}],
    {duration:1100,delay:T.wheel,...fwd});
  // 3. the seal breaks: the door lifts out of its frame, green light leaks round the edge, one heavy thud
  const closed='translateZ(0) scale(1)', lifted='translateZ(28px) scale(1.025)';
  const glow0='drop-shadow(0 0 0 rgba(88,224,138,0))', glow1='drop-shadow(0 0 18px rgba(88,224,138,.95)) drop-shadow(0 0 4px rgba(180,255,200,.9))';
  $('#leafSvg').animate([{transform:closed,filter:glow0},{transform:lifted,filter:glow1}],{duration:340,delay:T.unseal,easing:'cubic-bezier(.2,.8,.3,1)',...fwd});
  vaultEl.animate([{transform:'translate(0,0)'},{transform:'translate(-7px,3px)'},{transform:'translate(6px,-2px)'},{transform:'translate(-4px,1px)'},
    {transform:'translate(2px,0)'},{transform:'translate(0,0)'}],{duration:480,delay:T.unseal+120,easing:'ease-out'});
  setTimeout(()=>smoke.seep(vaultSource,3),T.unseal);
  // 4. the door swings open on its hinges and the vault glows
  $('#leafSvg').animate([{transform:lifted,filter:glow1},{transform:'translateZ(28px) rotateY(-84deg) scale(1.025)',filter:glow1+' brightness(.45)'}],
    {duration:1300,delay:T.swing,easing:'cubic-bezier(.55,.05,.25,1)',...fwd});
  $('.vault-glow').animate([{opacity:1,transform:'scale(1)'},{opacity:1,transform:'scale(1.45)',filter:'blur(10px) brightness(1.8)'}],{duration:1200,delay:T.swing,easing:'ease-out',...fwd});
  // 5. push in toward the glowing opening as the smoke pours out
  vaultEl.animate([{transform:'scale(1)'},{transform:'scale(2.8)'}],{duration:1500,delay:T.push,easing:'cubic-bezier(.6,0,.85,.45)',...fwd});
  setTimeout(()=>{ document.body.classList.add('flooding'); smoke.stopSeep(); smoke.flood(cx,cy); },T.flood);
  const fl=$('#flood');
  fl.animate([{opacity:0},{opacity:1}],{duration:850,delay:T.flood+100,fill:'forwards',easing:'ease-in'}).onfinish=()=>{
    showApp();                                        // swap pages while the screen is full of smoke
    fl.animate([{opacity:1},{opacity:1,offset:.3},{opacity:0}],{duration:2200,fill:'forwards',easing:'ease-out'}).onfinish=()=>{
      document.body.classList.remove('flooding'); fl.getAnimations().forEach(x=>x.cancel()); opening=false; };
  };
}
function showApp(){
  $('#gate').hidden=true; $('#app').hidden=false; smoke.stopSeep();
  $('#agentName').textContent=state.user||'Guest';
  render(false); scrollTo(0,0);
  const h=$('#app h1'); h.setAttribute('tabindex','-1'); h.focus({preventScroll:true});
}
$('#lock').addEventListener('click',()=>{
  state.user=null; save(); $('#app').hidden=true; $('#gate').hidden=false;
  document.querySelectorAll('.bolt, #wheel, #leafSvg, #vault, .vault-glow, #gTitle, #form').forEach(el=>el.getAnimations().forEach(x=>x.cancel()));
  $('#codename').value=''; $('#err').textContent='';
  smoke.seep(vaultSource,IDLE_SMOKE); $('#codename').focus(); scrollTo(0,0);
});

/* ================= archive ================= */
function sequence(){
  const vis=FILMS.filter(f=>(state.show==='all'||f.lanes.includes(state.show))&&!(state.hideSeen&&state.watched[f.id]));
  const out=[];
  if(state.order==='release'){ let ci=-1;
    [...vis].sort((a,b)=>a.date.localeCompare(b.date)).forEach(f=>{ const c=RELEASE_CH.findIndex(ch=>f.date<ch.to); if(c!==ci){ci=c; out.push({ch:RELEASE_CH[c]});} out.push({f}); });
  } else ['mcu','fox','828'].forEach(sec=>{ const l=vis.filter(f=>f.sec===sec).sort((a,b)=>a.idx-b.idx); if(l.length){ out.push({ch:STORY_CH[sec]}); l.forEach(f=>out.push({f})); } });
  return out;
}
const els=new Map(); let current=[],finaleEl=null,dirty=false;
function makePanel(f){
  const el=document.createElement('article'), cv=COVER[f.id];
  el.className='panel'+(KEY.has(f.id)?' key':''); el.dataset.id=f.id;
  el.innerHTML=`<button class="open"><span class="cover" style="--tint:${TINT[cv[2]]}"><span class="no"></span>${SERIES[f.id]?.essential?'<span class="ess">Essential!</span>':''}${sigil(f.cat,'mark')}<span class="cv" aria-hidden="true" style="font-size:${fit(cv[0],430,48,24)}px">${cv[0]}</span><span class="sub">${cv[1]}</span></span>
    <span class="info"><span class="ttl">${f.title}</span><span class="meta"></span><span class="seen-on"></span>${laneTag(f)}</span></button>
    <button class="seal" aria-pressed="false">${CHECK}</button><span class="stamp" aria-hidden="true">Seen<br>it!</span>`;
  el.querySelector('.open').addEventListener('click',()=>openSplash(f.id));
  el.querySelector('.seal').addEventListener('click',e=>toggleWatched(f.id,e.currentTarget));
  els.set(f.id,el); return el;
}
function makeFinale(){
  const el=document.createElement('button'); el.className='finale';
  el.setAttribute('aria-label','Avengers: Doomsday. Open details');
  el.innerHTML=`<span class="doom-stage" aria-hidden="true">
      <span class="puff p1"></span><span class="puff p2"></span><span class="puff p3"></span>
      <span class="doom-figure"><i class="eye l"></i><i class="eye r"></i></span>
      <span class="puff p4"></span><span class="puff p5"></span><span class="puff p6"></span>
    </span>
    <span class="finale-text">
      <span class="final-tag">Final issue</span>
      <h3 class="letter">Avengers: Doomsday</h3>
      <span class="doom-clock" role="timer" aria-label="Time until Avengers: Doomsday">
        <span class="dc-u"><b data-u="d">000</b><small>days</small></span><span class="dc-sep">:</span>
        <span class="dc-u"><b data-u="h">00</b><small>hours</small></span><span class="dc-sep">:</span>
        <span class="dc-u"><b data-u="m">00</b><small>minutes</small></span><span class="dc-sep">:</span>
        <span class="dc-u"><b data-u="s">00</b><small>seconds</small></span>
      </span>
      <span class="doom-here" hidden>Doomsday is here.</span>
      <p>Every file in this vault leads here: the Avengers, the Fantastic Four, the Thunderbolts and the original X-Men, in one film.</p>
      <span class="when" id="fWhen"></span>
    </span>`;
  el.addEventListener('click',()=>openSplash('doom'));
  // Doom leans toward the cursor
  const fig=el.querySelector('.doom-figure');
  el.addEventListener('pointermove',e=>{ if(reduce()) return; const r=el.getBoundingClientRect();
    const dx=(e.clientX-r.left)/r.width-.5, dy=(e.clientY-r.top)/r.height-.5;
    fig.style.setProperty('--lx',(dx*16).toFixed(1)+'px'); fig.style.setProperty('--ly',(dy*10).toFixed(1)+'px'); fig.style.setProperty('--lr',(dx*4).toFixed(2)+'deg'); });
  el.addEventListener('pointerleave',()=>{ ['--lx','--ly','--lr'].forEach(p=>fig.style.removeProperty(p)); });
  // he rises out of the smoke the first time the panel scrolls into view
  if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting){ el.classList.add('risen'); io.disconnect(); } }); },{threshold:.35}); io.observe(el); }
  else el.classList.add('risen');
  tickDoomClock(el);
  return el;
}
function tickDoomClock(root){
  root=root||finaleEl; if(!root) return;
  let ms=doomTime()-new Date();
  const clock=root.querySelector('.doom-clock'), here=root.querySelector('.doom-here');
  if(ms<=0){ clock.hidden=true; here.hidden=false; return; }
  const d=Math.floor(ms/864e5); ms-=d*864e5; const h=Math.floor(ms/36e5); ms-=h*36e5; const m=Math.floor(ms/6e4); ms-=m*6e4; const s=Math.floor(ms/1e3);
  const set=(u,v)=>{ const b=clock.querySelector(`[data-u="${u}"]`); if(b.textContent!==v) b.textContent=v; };
  set('d',String(d).padStart(3,'0')); set('h',pad(h)); set('m',pad(m)); set('s',pad(s));
}
setInterval(()=>tickDoomClock(),1000);
/* comic countdown at the top of the main page */
function tickComicClock(){
  const box=$('#comicClock'); if(!box) return;
  let ms=doomTime()-new Date();
  if(ms<=0){ box.querySelector('.cd-tiles').hidden=true; box.querySelector('.cd-here').hidden=false; return; }
  const d=Math.floor(ms/864e5); ms-=d*864e5; const h=Math.floor(ms/36e5); ms-=h*36e5; const m=Math.floor(ms/6e4); ms-=m*6e4; const s=Math.floor(ms/1e3);
  [['d',String(d)],['h',pad(h)],['m',pad(m)],['s',pad(s)]].forEach(([u,v])=>{
    const b=box.querySelector(`[data-t="${u}"]`); if(b.textContent===v) return; b.textContent=v;
    if(!reduce() && !$('#app').hidden) b.animate([{transform:'scale(1.22) rotate(-4deg)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.3,1.3)'});
  });
}
tickComicClock(); setInterval(tickComicClock,1000);
function render(animate){
  const grid=$('#grid'), first=new Map();
  if(animate&&!reduce()) els.forEach((el,id)=>{ if(el.isConnected) first.set(id,el.getBoundingClientRect()); });
  const seq=sequence(); current=seq.filter(x=>x.f).map(x=>x.f.id);
  grid.innerHTML=''; let n=0;
  seq.forEach(it=>{
    if(it.ch){ const h=document.createElement('div'); h.className='chapter'; h.innerHTML=`<h2 class="letter"><span class="speed">${it.ch.t}</span></h2><p class="paper">${it.ch.d}</p>`; grid.appendChild(h); return; }
    const f=it.f; n++; const el=els.get(f.id)||makePanel(f), seen=state.watched[f.id];
    el.classList.remove('tilt-a','tilt-b'); el.classList.add(n%2?'tilt-a':'tilt-b');
    el.querySelector('.no').textContent='#'+n;
    el.querySelector('.meta').textContent=state.order==='release'?`${fmtDate(f.date)}${SERIES[f.id]?`, ${SERIES[f.id].episodes}`:f.min?`, ${fmtMin(f.min)}`:''}`:`Set in ${f.setIn}. ${SERIES[f.id]?'Premiered':'Released'} ${f.year}.`;
    el.querySelector('.seen-on').textContent=seen?`Watched ${fmtShort(seen)}`:'';
    el.classList.toggle('seen',!!seen);
    el.querySelector('.open').setAttribute('aria-label',`Number ${n}: ${f.title}, ${f.year}${seen?', watched':''}. Open details`);
    const sb=el.querySelector('.seal'); sb.setAttribute('aria-pressed',!!seen); sb.setAttribute('aria-label',`${seen?'Unmark':'Mark'} ${f.title} as watched`);
    grid.appendChild(el);
  });
  if(!n){ const e=document.createElement('div'); e.className='empty'; e.textContent='You’ve watched every film here. Turn off “Hide watched” to see them again.'; grid.appendChild(e); }
  const fh=document.createElement('div'); fh.className='chapter'; fh.innerHTML='<h2 class="letter"><span class="speed">The final issue!</span></h2><p class="paper">Coming next</p>'; grid.appendChild(fh);
  grid.appendChild(finaleEl||(finaleEl=makeFinale()));
  const d=daysLeft();
  $('#fWhen').textContent=d>0?'In theaters December 18, 2026':'In theaters now';
  progress(); sync(); save();
  if(first.size) els.forEach((el,id)=>{ if(!el.isConnected) return; const a=first.get(id), b=el.getBoundingClientRect();
    if(!a){ el.animate([{opacity:0,transform:'scale(.7) rotate(-5deg)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1.2)'}); return; }
    const dx=a.left-b.left, dy=a.top-b.top; if(Math.abs(dx)<1&&Math.abs(dy)<1) return;
    const rot=((id.length%5)-2)*3;
    el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${dx*.4}px,${dy*.4}px) rotate(${rot}deg) scale(1.04)`,offset:.45},{transform:'none'}],{duration:700,easing:'cubic-bezier(.3,.7,.2,1)'}); });
}
function progress(){ const t=FILMS.filter(f=>state.show==='all'||f.lanes.includes(state.show)), s=t.filter(f=>state.watched[f.id]).length;
  $('#count').textContent=`${s} of ${t.length} watched`; $('#bar').style.width=(t.length?s/t.length*100:0)+'%'; }
function sync(){ document.querySelectorAll('[data-order]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.order===state.order));
  document.querySelectorAll('[data-show]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.show===state.show)); $('#hideSeen').setAttribute('aria-pressed',state.hideSeen); }
const WORDS=['KRAKOOM!','WHOOSH!','FWOOM!','SHRAKK!','BADOOM!'];
function pow(el,word){ if(reduce()) return; const p=$('#pow'), r=el.getBoundingClientRect();
  p.textContent=word||WORDS[Math.floor(Math.random()*WORDS.length)];
  p.style.left=Math.max(8,Math.min(innerWidth-220,r.left+r.width/2-80))+'px'; p.style.top=(r.bottom+6)+'px';
  p.animate([{opacity:0,transform:'scale(.4) rotate(-14deg)'},{opacity:1,transform:'scale(1.15) rotate(-6deg)',offset:.3},{opacity:0,transform:'scale(1) rotate(-6deg) translateY(10px)'}],{duration:900,easing:'ease-out'}); }
function toggleWatched(id,btn){
  if(state.watched[id]) delete state.watched[id]; else state.watched[id]=new Date().toISOString();
  const f=FILMS.find(x=>x.id===id), on=!!state.watched[id];
  $('#status').textContent=on?`${f.title} marked as watched.`:`${f.title} unmarked.`;
  if(state.open&&state.hideSeen){ dirty=true; save(); progress(); } else render(state.hideSeen);
  if(btn&&btn.isConnected){ btn.focus(); if(on) pow(btn,'SEEN IT!'); }
  const el=els.get(id);
  if(on&&el&&el.isConnected&&!reduce()){ el.querySelector('.stamp').animate([{transform:'rotate(40deg) scale(2.2)',opacity:0},{transform:'rotate(10deg) scale(1)',opacity:1}],{duration:320,easing:'cubic-bezier(.3,1.4,.5,1)'});
    const cov=el.querySelector('.cover.has-poster'); if(cov){ try{ cov.animate([{opacity:0,transform:'scale(1.4)'},{opacity:.4,transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1.1)',pseudoElement:'::after'}); }catch(e){} }
    const r=el.getBoundingClientRect(); smoke.burst(r.left+r.width/2,r.top+r.height/2,6); }
}
document.querySelectorAll('[data-order]').forEach(b=>b.addEventListener('click',()=>{ if(state.order===b.dataset.order) return; state.order=b.dataset.order;
  $('#status').textContent=state.order==='release'?'Showing release order.':'Showing chronological story order.'; pow(b); render(true); }));
document.querySelectorAll('[data-show]').forEach(b=>b.addEventListener('click',()=>{ if(state.show===b.dataset.show) return; state.show=b.dataset.show; render(true); }));
$('#hideSeen').addEventListener('click',()=>{ state.hideSeen=!state.hideSeen; render(true); });

/* ================= splash detail ================= */
let lastFocus=null;
function openSplash(id){
  if(!state.open) lastFocus=document.activeElement;
  state.open=id; const sp=$('#splash');
  if(id==='doom'){ const d=daysLeft(), last=current[current.length-1];
    sp.innerHTML=`<button class="close" aria-label="Close">×</button>
      <div class="art" style="--tint:#2F6B5E"><span class="no">Final issue</span>${sigil('doom')}<span class="cv" style="font-size:44px;color:var(--gold)">Doomsday!</span><span class="sub">Avengers, part 5 of 5</span></div>
      <div class="body"><span class="lane m">The crossover</span><h2 id="dTitle">Avengers: Doomsday</h2>
        <p class="blurb">${d>0?`${d} days to go.`:'In theaters now.'} Heroes from several universes collide in the biggest crossover yet.</p>
        <dl class="facts"><dt>Release</dt><dd>${fmtDate(DOOM_DATE)} (US)</dd><dt>Directed by</dt><dd>Anthony and Joe Russo</dd><dt>Builds on</dt><dd>The Avengers, Fantastic Four, Thunderbolts, Wakanda and the Fox X-Men</dd></dl>
        <div class="nav">${last?`<button data-go="${last}"><b>Previous</b>${FILMS.find(f=>f.id===last).title}</button>`:''}</div></div>`;
  } else { const f=FILMS.find(x=>x.id===id), cv=COVER[id], i=current.indexOf(id), prev=current[i-1], next=current[i+1], seen=state.watched[id];
    sp.innerHTML=`<button class="close" aria-label="Close">×</button>
      <div class="art${seen?' seen':''}" style="--tint:${TINT[cv[2]]}"><span class="no">${i>=0?'#'+(i+1):'File'}</span>${SERIES[id]?.essential?'<span class="ess">Essential!</span>':''}${sigil(f.cat)}<span class="cv" style="font-size:${fit(cv[0],520,60,28)}px">${cv[0]}</span><span class="sub">${cv[1]}</span></div>
      <div class="body">${laneTag(f)}<h2 id="dTitle">${f.title}</h2>
        <p class="blurb">${f.blurb}</p>
        <button class="markbtn" data-watch="${id}" aria-pressed="${!!seen}">${seen?`Watched ${fmtShort(seen)}`:'Mark as watched'}</button>
        <dl class="facts">${SERIES[id]?`<dt>Premiered</dt><dd>${fmtDate(f.date)} (season 2: ${fmtDate(SERIES[id].season2)})</dd>`:`<dt>Released</dt><dd>${fmtDate(f.date)}</dd>`}<dt>Set in</dt><dd>${f.setIn}</dd>${SERIES[id]?`<dt>Episodes</dt><dd>${SERIES[id].episodes}</dd>`:`<dt>Runtime</dt><dd>${fmtMin(f.min)}</dd>`}<dt>Directed by</dt><dd>${f.dir}</dd><dt>Type</dt><dd>${CAT[f.cat]}</dd><dt>Universe</dt><dd>${UNIVERSE[f.sec]}</dd></dl>
        <div class="nav"><button data-go="${prev||''}" ${prev?'':'disabled'}><b>Previous</b>${prev?FILMS.find(x=>x.id===prev).title:'Start of the vault'}</button>
          <button data-go="${next||'doom'}"><b>Next</b>${next?FILMS.find(x=>x.id===next).title:'Avengers: Doomsday'}</button></div></div>`; }
  const firstOpen=$('#scrim').hidden; $('#scrim').hidden=false; document.body.style.overflow='hidden';
  sp.querySelector('.close').focus();
  if(firstOpen&&!reduce()) sp.animate([{opacity:0,transform:'scale(.85) rotate(-3deg)'},{opacity:1,transform:'none'}],{duration:280,easing:'cubic-bezier(.2,.9,.3,1.25)'});
}
function closeSplash(){ state.open=null; $('#scrim').hidden=true; document.body.style.overflow=''; if(dirty){dirty=false; render(true);} if(lastFocus&&lastFocus.isConnected) lastFocus.focus(); }
$('#scrim').addEventListener('click',e=>{
  if(e.target.id==='scrim'||e.target.closest('.close')){ closeSplash(); return; }
  const w=e.target.closest('[data-watch]'); if(w){ const id=w.dataset.watch; toggleWatched(id); openSplash(id); const nb=$('#splash [data-watch]'); nb.focus(); if(state.watched[id]) pow(nb,'SEEN IT!'); return; }
  const g=e.target.closest('[data-go]'); if(g&&g.dataset.go) openSplash(g.dataset.go);
});
document.addEventListener('keydown',e=>{ if(!state.open) return;
  if(e.key==='Escape') closeSplash();
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ const want=e.key==='ArrowRight'?'Next':'Previous'; const b=[...document.querySelectorAll('#splash [data-go]')].find(x=>x.textContent.startsWith(want)); if(b&&!b.disabled) b.click(); }
  if(e.key==='Tab'){ const f=[...document.querySelectorAll('#splash button:not([disabled])')]; if(!f.length) return;
    if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault(); f[f.length-1].focus();} else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault(); f[0].focus();} }
});

smoke.init();
if(state.user){ $('#gate').hidden=true; $('#app').hidden=false; $('#agentName').textContent=state.user; render(false); } else smoke.seep(vaultSource,IDLE_SMOKE);
