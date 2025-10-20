
(function(){
  if (window.__HeptixProbeIntegratedV9) return;
  window.__HeptixProbeIntegratedV9 = true;

  function $(q,root){ return (root||document).querySelector(q); }
  function $all(q,root){ return Array.from((root||document).querySelectorAll(q)); }

  // CSS scoped to our mount only
  var css = `
    #heptixProbeMount{ border:1px solid rgba(26,115,232,.18); border-radius:12px; padding:12px; background:#FAFDFF; margin:12px 0; }
    #heptixProbeMount h3{ margin:0 0 8px 0; font-size:14px; text-transform:uppercase; letter-spacing:.12em; color:#52607A; }
    #heptixProbeHeader{ display:flex; gap:10px; align-items:center; justify-content:space-between; margin-bottom:10px; color:#52607A; }
    #heptixRoundsLeft b{ font-weight:800; }
    #heptixProbeHistory{ display:grid; gap:10px; }
    .hx-probeBlock{ display:grid; gap:6px; }
    .hx-lettersRow{ display:flex; gap:10px; align-items:flex-end; }
    .hx-mini{ position:relative; width:48px; }
    .hx-mini input{
      width:100%; background:transparent; border:none; outline:none; text-align:center;
      font-weight:900; text-transform:uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size:28px; padding:2px 0 6px; -webkit-appearance:none;
    }
    .hx-mini::after{ content:""; position:absolute; left:4px; right:4px; bottom:2px; height:2px; background:currentColor; opacity:.3; border-radius:2px; }
    .hx-ltrTile{ width:48px; height:44px; display:grid; place-items:center; border:1px solid rgba(26,115,232,.18); border-radius:8px; font-weight:900; background:#fff; }
    .hx-markers{ display:grid; grid-template-columns: repeat(3, 48px); column-gap:10px; align-items:center; justify-content:start; min-height:20px; }
    .hx-markerCell{ width:48px; display:grid; place-items:center; }
    .hx-circ{ width:18px; height:18px; border-radius:99px; border:2px solid #10B981; color:#10B981; display:grid; place-items:center; font-size:11px; font-weight:800; }
    .hx-x{ width:18px; height:18px; background:#EF4444; border-radius:3px; position:relative; }
    .hx-x::before,.hx-x::after{ content:""; position:absolute; left:50%; top:50%; width:12px; height:2px; background:#fff; transform-origin:center; }
    .hx-x::before{ transform: translate(-50%,-50%) rotate(45deg);} .hx-x::after{ transform: translate(-50%,-50%) rotate(-45deg);}
    #heptixAlphabet{ display:flex; gap:6px; flex-wrap:wrap; padding-top:8px; border-top:1px dashed rgba(26,115,232,.18); margin-top:8px; }
    .hx-abc{ position:relative; width:32px; height:40px; border:1px solid rgba(26,115,232,.18); border-radius:8px; display:grid; place-items:center; background:#fff; font-weight:800; }
    .hx-abc.hx-slash::after{ content:""; position:absolute; top:50%; left:8%; right:8%; height:2px; background:red; transform: rotate(-24deg); }
    #heptixStatus3{ color:#52607A; min-height:20px; margin-top:6px; }
    .hx-submit{ background:linear-gradient(180deg, #69B9FF, #1A73E8); color:#fff; border:0; padding:10px 12px; border-radius:10px; font-weight:800; cursor:pointer; }
    @media (max-width:420px){
      .hx-mini{ width:44px; }
      .hx-mini input{ font-size:24px; }
    }
    /* Round 6 HUD */
    #heptixR6Hud{ margin-top:10px; border-top:1px dashed rgba(26,115,232,.18); padding-top:8px; }
    .hx-rowTitle{ color:#52607A; font-size:12px; margin:6px 0 4px; }
    .hx-tiles{ display:flex; gap:6px; flex-wrap:wrap; }
    .hx-tile{ width:32px; height:40px; display:grid; place-items:center; border:1px solid rgba(26,115,232,.18); border-radius:8px; background:#fff; font-weight:800; }
    .hx-tile.dim{ opacity:.55; }
    .hx-tile.bad{ color:#EF4444; border-color:#EF4444; }
  `;
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function findRound6Anchor(){
    var ids = ['round6','round-6','solve','solvePanel','Round6','Solve'];
    for (var i=0;i<ids.length;i++){ var el = document.getElementById(ids[i]); if (el) return el; }
    var hs = $all('h2,h3,h4');
    for (var j=0;j<hs.length;j++){
      var t = (hs[j].textContent||'').toLowerCase();
      if (t.indexOf('round 6') !== -1 || t.indexOf('7-letter') !== -1) return hs[j].closest('section') || hs[j];
    }
    return $('.app') || document.body.firstElementChild || document.body;
  }

  // Mount just above Round 6 (no hiding of existing UI in general)
  var mount = document.createElement('section'); mount.id = 'heptixProbeMount'; mount.setAttribute('aria-label','Rounds 1–5');
  mount.innerHTML = `
    <h3>Rounds 1–5 – Probe Phase</h3>
    <div id="heptixProbeHeader">
      <div id="heptixPrompt">Submit 3-letter word</div>
      <div id="heptixRoundsLeftWrap">Rounds left: <b id="heptixRoundsLeft">5</b></div>
    </div>
    <div id="heptixProbeHistory"></div>
    <div id="heptixStatus3"></div>
    <div id="heptixAlphabet" aria-label="Alphabet"></div>
  `;
  var anchor = findRound6Anchor();
  anchor.parentNode.insertBefore(mount, anchor);

  // ---- SAFE de-duplication of *older* probe block (without touching dark mode/sounds) ----
  (function dedupeOldProbe(){
    try{
      var heads = $all('h2,h3,h4');
      heads.forEach(function(h){
        var txt = (h.textContent||'').toLowerCase();
        if (txt.indexOf('rounds 1') !== -1 && txt.indexOf('5') !== -1){
          if (!h.closest('#heptixProbeMount')){
            var sec = h.closest('section') || h.parentElement;
            if (sec && !sec.closest('#heptixProbeMount')){
              sec.style.display = 'none';
            }
          }
        }
      });
      var all = $all('label, div, p, span');
      all.forEach(function(el){
        var t = (el.textContent||'').trim().toLowerCase();
        if (t === '3-letter guess' || t === '3 letter guess'){
          if (!el.closest('#heptixProbeMount')){
            var c = el.closest('section') || el.parentElement;
            if (c && !c.closest('#heptixProbeMount')) c.style.display = 'none';
          }
        }
      });
    }catch(e){ console.warn('Probe dedupe warning:', e); }
  })();

  var roundsUsed = 0;
  var guessed = new Set(), found=new Set(), eliminated=new Set();

  var roundsLeftEl = $('#heptixRoundsLeft');
  var hist = $('#heptixProbeHistory');
  var status3 = $('#heptixStatus3');
  var alpha = $('#heptixAlphabet');

  function A(){ return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); }
  function letterCounts(w){ var m={}; for (var i=0;i<w.length;i++){ var c=w[i]; m[c]=(m[c]||0)+1; } return m; }

  // Target resolution (same as V8)
  var TARGET = null;
  function is7(w){ return typeof w==='string' && /^[A-Za-z]{7}$/.test(w); }
  function resolveTarget(){
    var cand = null;
    try { if (window.Heptix && typeof Heptix.getTarget === 'function') cand = Heptix.getTarget(); } catch(_){}
    try { if (!cand && window.Heptix && Heptix.target) cand = Heptix.target; } catch(_){}
    if (!cand && typeof window.HEPTIX_TARGET === 'string') cand = window.HEPTIX_TARGET;
    if (!cand && typeof window.targetWord === 'string') cand = window.targetWord;
    if (!cand && typeof window.currentWord === 'string') cand = window.currentWord;
    if (!cand && typeof window.TARGET === 'string') cand = window.TARGET;
    var n = document.body.getAttribute('data-target') || (anchor && anchor.getAttribute('data-target'));
    if (!cand && is7(n)) cand = n;
    if (!cand){
      try{
        var keys = ['heptix_target','HeptixTarget','targetWord','currentWord','TARGET'];
        for (var i=0;i<keys.length;i++){ var v = localStorage.getItem(keys[i]); if (is7(v)){ cand = v; break; } }
      }catch(_){}
    }
    if (!cand){
      var slots = $all('#slots input, .slots input');
      if (slots.length===7){
        var tmp = slots.map(function(ip){ return (ip.value||'').toUpperCase(); }).join('');
        if (/^[A-Z]{7}$/.test(tmp)) cand = tmp;
      }
    }
    if (!is7(cand)) cand = null;
    if (cand) TARGET = cand.toUpperCase();
    return TARGET;
  }

  var mo = new MutationObserver(function(){ resolveTarget(); });
  mo.observe(document.documentElement, {subtree:true, childList:true, attributes:true, characterData:false});

  // Round 6 HUD
  function ensureR6Hud(){
    var slots = $('#slots') || $('.slots');
    if (!slots) return null;
    var hud = $('#heptixR6Hud');
    if (!hud){
      hud = document.createElement('div');
      hud.id = 'heptixR6Hud';
      hud.innerHTML = `
        <div class="hx-rowTitle">Letters found so far (<span id="hxFoundCount">0</span>):</div>
        <div id="hxFound" class="hx-tiles"></div>
        <div class="hx-rowTitle">Used & missed:</div>
        <div id="hxElim" class="hx-tiles"></div>
        <div class="hx-rowTitle">Not yet guessed:</div>
        <div id="hxRemain" class="hx-tiles"></div>
      `;
      if (slots.parentElement) slots.parentElement.insertBefore(hud, slots.nextSibling);
      else slots.insertAdjacentElement('afterend', hud);
    }
    return hud;
  }

  function renderR6Hud(){
    var hud = ensureR6Hud(); if (!hud) return;
    var foundBox = $('#hxFound'), countBox = $('#hxFoundCount');
    var elimBox = $('#hxElim'), remBox = $('#hxRemain');

    var tgt = resolveTarget();
    var counts = tgt ? letterCounts(tgt) : {};
    var foundArr = Array.from(found).sort();
    var tiles = [];
    foundArr.forEach(function(ch){
      var n = counts[ch] || 1;
      for (var i=0;i<n;i++) tiles.push(ch);
    });
    foundBox.innerHTML = tiles.map(function(ch){ return '<div class="hx-tile">'+ch+'</div>'; }).join('');
    countBox.textContent = String(tiles.length);

    var elimArr = Array.from(eliminated).sort();
    elimBox.innerHTML = elimArr.map(function(ch){ return '<div class="hx-tile bad">'+ch+'</div>'; }).join('');

    var remain = A().filter(function(ch){ return !guessed.has(ch); });
    remBox.innerHTML = remain.map(function(ch){ return '<div class="hx-tile dim">'+ch+'</div>'; }).join('');
  }

  function wireR6Inputs(){
    var inputs = $all('#slots input, .slots input, [data-solve] input');
    inputs.forEach(function(ip){
      ip.addEventListener('input', function(){
        var v = (ip.value||'').toUpperCase().replace(/[^A-Z]/g,'');
        if (!v) { renderR6Hud(); return; }
        var ch = v[0];
        guessed.add(ch);
        var tgt = resolveTarget();
        if (tgt && tgt.indexOf(ch) !== -1) { found.add(ch); eliminated.delete(ch); }
        else if (tgt) { eliminated.add(ch); }
        renderR6Hud();
      }, {passive:true});
    });
  }
  function refreshR6Wiring(){ ensureR6Hud(); wireR6Inputs(); renderR6Hud(); }

  // Probe alphabet & rows
  function renderAlphabet(){
    var frag = document.createDocumentFragment();
    A().forEach(function(ch){
      var div = document.createElement('div');
      div.className = 'hx-abc' + (guessed.has(ch)?' hx-slash':'');
      div.textContent = ch;
      frag.appendChild(div);
    });
    alpha.innerHTML = '';
    alpha.appendChild(frag);
  }

  function miniInput(){
    var wrap=document.createElement('div'); wrap.className='hx-mini';
    var ip=document.createElement('input'); ip.maxLength=1; ip.autocapitalize='characters'; ip.spellcheck=false;
    wrap.appendChild(ip);
    return {wrap:wrap, input:ip};
  }

  function focusFirstProbe(){
    var first = $('#heptixProbeHistory .hx-mini input'); if (first){ try{ first.focus(); }catch(_){}} 
  }
  function focusFirstSolveSlot(){
    var inputs = $all('#slots input, .slots input, [data-solve] input');
    if (inputs.length){
      var target = inputs.find(function(ip){ return !ip.value; }) || inputs[0];
      try { target.focus(); } catch(_) {}
    }
  }

  function dispatchComplete(){
    var detail = { guessed: Array.from(guessed), found: Array.from(found), eliminated: Array.from(eliminated) };
    try { document.dispatchEvent(new CustomEvent('heptix:probes-complete', { detail: detail })); } catch(_){}
    if (window.Heptix && typeof Heptix.onProbeComplete === 'function'){
      try { Heptix.onProbeComplete(detail); } catch(e){ console.warn('Heptix.onProbeComplete error', e); }
    }
    try { $('#round6')?.scrollIntoView({behavior:'smooth', block:'start'}); } catch(_){}
    refreshR6Wiring();
    focusFirstSolveSlot();
  }

  function appendActiveRow(){
    var block = document.createElement('div'); block.className='hx-probeBlock';
    var lettersLine = document.createElement('div'); lettersLine.className='hx-lettersRow';
    var A1=miniInput(), B1=miniInput(), C1=miniInput();
    lettersLine.appendChild(A1.wrap); lettersLine.appendChild(B1.wrap); lettersLine.appendChild(C1.wrap);
    var btn=document.createElement('button'); btn.className='hx-submit'; btn.textContent='Submit'; lettersLine.appendChild(btn);
    var markers = document.createElement('div'); markers.className='hx-markers'; markers.style.visibility='hidden';

    block.appendChild(lettersLine);
    block.appendChild(markers);
    hist.appendChild(block);

    function submit(){
      var tgt = resolveTarget(); // always refresh
      var guess = (A1.input.value + B1.input.value + C1.input.value).toUpperCase().replace(/[^A-Z]/g,'');
      if (guess.length!==3){ status3.textContent="Enter a valid 3-letter word."; return; }
      var counts = tgt ? letterCounts(tgt) : {};
      var marks=[];
      for (var i=0;i<3;i++){
        var ch=guess[i]; guessed.add(ch);
        if (tgt && tgt.indexOf(ch)!==-1){ marks.push({in:true,count:counts[ch]||1}); found.add(ch); eliminated.delete(ch); }
        else if (tgt){ marks.push({in:false}); eliminated.add(ch); }
        else { marks.push({in:false}); } // if target unknown, don't eliminate
      }
      lettersLine.innerHTML='';
      for (var i=0;i<3;i++){ var t=document.createElement('div'); t.className='hx-ltrTile'; t.textContent=guess[i]; lettersLine.appendChild(t); }
      markers.innerHTML='';
      for (var i=0;i<3;i++){ var cell=document.createElement('div'); cell.className='hx-markerCell'; if (marks[i].in){ var c=document.createElement('div'); c.className='hx-circ'; c.textContent=marks[i].count; cell.appendChild(c);} else { var x=document.createElement('div'); x.className='hx-x'; cell.appendChild(x);} markers.appendChild(cell); }
      markers.style.visibility='visible';

      roundsUsed += 1;
      var left = 5 - roundsUsed;
      roundsLeftEl.textContent = String(left);
      status3.textContent = left>0 ? ("You have " + left + " probe rounds left.") : "Probe phase complete.";
      renderAlphabet();
      renderR6Hud();
      if (left>0){
        appendActiveRow();
      } else {
        dispatchComplete();
      }
    }

    [A1,B1,C1].forEach(function(obj, idx){
      var ip=obj.input;
      function place(ch){ ip.value=ch; if (idx<2){ [A1,B1,C1][idx+1].input.focus(); } }
      ip.addEventListener('input', function(){ var v=(ip.value||'').toUpperCase().replace(/[^A-Z]/g,''); if (!v) return; ip.value=v[0]; place(ip.value); }, {passive:true});
      ip.addEventListener('keydown', function(e){ if (e.key==='Backspace'){ if (!ip.value && idx>0){ [A1,B1,C1][idx-1].input.focus(); [A1,B1,C1][idx-1].input.value=''; } return; } if (/^[a-zA-Z]$/.test(e.key)){ e.preventDefault(); place(e.key.toUpperCase()); } if (e.key==='Enter'){ submit(); } });
      ip.addEventListener('touchstart', function(){ ip.focus(); }, {passive:true});
    });
    btn.addEventListener('click', function(e){ e.preventDefault(); submit(); });

    setTimeout(function(){ A1.input.focus(); }, 0);
  }

  function softReset(){
    roundsUsed = 0; guessed.clear(); found.clear(); eliminated.clear();
    if (hist) hist.innerHTML = "";
    if (alpha) alpha.innerHTML = "";
    if (status3) status3.textContent = "";
    if (roundsLeftEl) roundsLeftEl.textContent = "5";
    appendActiveRow();
    renderAlphabet();
    setTimeout(refreshR6Wiring, 0);
    setTimeout(function(){ var first = $('#heptixProbeHistory .hx-mini input'); if (first) try{ first.focus(); }catch(_){ } }, 0);
  }

  window.HeptixProbe = window.HeptixProbe || {};
  window.HeptixProbe.reset = softReset;
  window.HeptixProbe.resolveTarget = resolveTarget;

  document.addEventListener('heptix:new-game', softReset);
  document.addEventListener('game:reset', softReset);

  // Boot
  $('#heptixRoundsLeft').textContent = String(5);
  $('#heptixStatus3').textContent = "";
  appendActiveRow();
  renderAlphabet();
  setTimeout(refreshR6Wiring, 0);
  setTimeout(function(){ var f = $('#heptixProbeHistory .hx-mini input'); if (f) try{ f.focus(); }catch(_){ } }, 0);
  try { console.log("[Heptix] Probe injected V9. Target:", resolveTarget()); } catch(_){}
})();
