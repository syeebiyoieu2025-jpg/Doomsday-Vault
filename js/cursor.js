/* Doomsday Vault: custom cursor
   Robert Downey Jr. plays both Iron Man and Doom, so the cursor tells that story:
   - Sign-in page: Iron Man's glove (fires a repulsor blast when you click).
   - When the vault opens, the glove turns into Doom's gauntlet (crackles with lightning on click).
   - On the main page, Stark's glove only returns while hovering a film he plays Tony Stark in
     (RDJ_FILMS in js/data.js). Anything clickable gets a green glow.
   Both use 128px images shown at 64px, so they stay sharp on high-res screens.
   Touch screens keep their normal behaviour. */
(function(){
  if(!matchMedia('(pointer: fine)').matches) return;
  const TIP = { gauntlet:[17,0], glove:[14,3] };   // fingertip in each 64px image = click point
  const RDJ = new Set(typeof RDJ_FILMS !== 'undefined' ? RDJ_FILMS : []);
  const gate = document.getElementById('gate');
  const el = document.createElement('div');
  el.className = 'vault-cursor';
  el.setAttribute('aria-hidden','true');
  document.body.appendChild(el);
  document.documentElement.classList.add('has-vault-cursor');

  let x = -200, y = -200, target = null, queued = false;
  const onSignIn = () => gate && !gate.hidden && !document.body.classList.contains('flooding');

  function update(){
    queued = false;
    const t = target && target.closest ? target : null;
    const panel = t && t.closest('.panel[data-id]');
    const glove = onSignIn() || !!(panel && RDJ.has(panel.dataset.id));
    el.classList.toggle('glove', glove);
    el.classList.toggle('hot', !!(t && t.closest('button:not(:disabled),a,label,[role="button"]')));
    el.classList.toggle('typing', !!(t && t.closest('input,textarea')));
    const [tx,ty] = glove ? TIP.glove : TIP.gauntlet;
    el.style.transform = `translate3d(${x - tx}px, ${y - ty}px, 0)`;
  }
  addEventListener('pointermove', e => {
    if(e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY; target = e.target; el.classList.add('on');
    if(!queued){ queued = true; requestAnimationFrame(update); }
  }, {passive:true});
  addEventListener('pointerdown', e => {
    if(e.pointerType !== 'mouse') return;
    el.classList.add('press');
    el.classList.remove('zap'); void el.offsetWidth; el.classList.add('zap');   // restart the effect on every click
  });
  addEventListener('pointerup', () => el.classList.remove('press'));
  el.addEventListener('animationend', () => el.classList.remove('zap'));
  document.documentElement.addEventListener('mouseleave', () => el.classList.remove('on'));

  // the moment the vault floods with smoke, Stark's glove becomes Doom's gauntlet
  let wasFlooding = false;
  new MutationObserver(() => {
    const flooding = document.body.classList.contains('flooding');
    if(flooding && !wasFlooding && el.classList.contains('glove')){
      target = document.elementFromPoint(x, y); update();
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
        el.animate([{filter:'brightness(3.5) drop-shadow(0 0 18px #58E08A)',opacity:.4},
                    {filter:'brightness(1.6) drop-shadow(0 0 10px #58E08A)',opacity:1,offset:.4},
                    {filter:'drop-shadow(2px 3px 0 rgba(0,0,0,.55))',opacity:1}],{duration:900,easing:'ease-out'});
    }
    wasFlooding = flooding;
    if(!queued){ queued = true; requestAnimationFrame(update); }
  }).observe(document.body, {attributes:true, attributeFilter:['class']});
  if(gate) new MutationObserver(() => { if(!queued){ queued = true; requestAnimationFrame(update); } })
    .observe(gate, {attributes:true, attributeFilter:['hidden']});
})();
