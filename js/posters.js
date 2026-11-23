/* Doomsday Vault: movie posters
   Shows each film's poster (from the posters folder, see POSTERS in js/data.js) on its
   panel and in the detail view, with a shared comic "print" layer (halftone dots +
   inked frame) on top. If an image file is missing, the designed comic cover stays. */
(function(){
  const EXT = ['jpg','jpeg','png','webp'];
  const found = {};   // film id -> working image URL, or false if none was found

  function loadInto(holder, id, alt){
    if(!POSTERS[id] || holder.dataset.poster || found[id]===false) return;
    holder.dataset.poster = 'loading';
    const img = new Image(), print = document.createElement('span');
    img.className = 'poster'; img.alt = alt || ''; img.decoding = 'async';
    print.className = 'print'; print.setAttribute('aria-hidden','true');
    let i = 0;
    const next = () => {
      if(found[id]) return found[id];
      if(i >= EXT.length){ found[id] = false; img.remove(); print.remove(); return null; }
      return POSTER_DIR + POSTERS[id] + '.' + EXT[i++];
    };
    img.onload = () => { found[id] = img.src; holder.classList.add('has-poster'); holder.dataset.poster = 'ok'; };
    img.onerror = () => { const u = next(); if(u) img.src = u; };
    holder.prepend(img); img.after(print);
    img.src = next();
  }

  function apply(){
    document.querySelectorAll('.panel[data-id] .cover').forEach(c => loadInto(c, c.closest('.panel').dataset.id, ''));
    const art = document.querySelector('#splash .art');
    const btn = document.querySelector('#splash [data-watch]');
    if(art && btn) loadInto(art, btn.dataset.watch, 'Poster for ' + (document.querySelector('#splash h2')?.textContent || 'this film'));
  }
  // panels and the detail view are rebuilt as you browse, so keep applying
  new MutationObserver(apply).observe(document.body, {childList:true, subtree:true});
  apply();
})();
