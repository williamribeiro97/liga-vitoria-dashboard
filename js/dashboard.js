const ROTATE_MS = CONFIG.ROTATE_SEC * 1000;
let current = 0, startTime = Date.now(), lastRefresh = Date.now();

function parseCSV(txt) {
  return txt.split('\n').map(line => {
    const cols = []; let cur = '', inQ = false;
    for (const c of line) {
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    cols.push(cur.trim());
    return cols;
  });
}
function num(s) { return parseFloat((s||'').replace(/\./g,'').replace(',','.')) || 0; }
function brl(n) { return 'R$ ' + n.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2}); }
function barHtml(pct, falt, big=false) {
  const sz = big ? 'font-size:24px' : '';
  const h  = big ? 'height:58px' : 'height:44px';
  return `<div class="bar-track" style="${h}">
    <div class="bar-g" style="width:${pct}%;${sz}">${pct>=10?pct.toFixed(2)+'%':''}</div>
    <div class="bar-r" style="width:${falt}%;${sz}">${falt>=10?falt.toFixed(2)+'%':''}</div>
  </div>`;
}

async function fetchCSV(url) {
  const attempts = [
    () => fetch(url + '&_t=' + Date.now(), { mode: 'cors', cache: 'no-store' }),
    () => fetch('https://corsproxy.io/?' + encodeURIComponent(url + '&_t=' + Date.now())),
    () => fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url + '&_t=' + Date.now())),
    () => fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url)),
  ];
  for (let i = 0; i < attempts.length; i++) {
    try {
      const r = await attempts[i]();
      if (r.ok) {
        const t = await r.text();
        if (t && t.length > 20 && !t.includes('<!DOCTYPE')) {
          console.log('CSV ok via tentativa', i, '- chars:', t.length);
          return t;
        }
      }
    } catch(e) { console.warn('Tentativa', i, 'falhou:', e.message); }
  }
  throw new Error('Todas as tentativas falharam para: ' + url);
}

async function fetchData() {
  try {
    document.getElementById('loading-text').textContent = 'Buscando dados...';
    document.getElementById('loading').classList.remove('hidden');
    const [t1, t2] = await Promise.all([
      fetchCSV(CONFIG.CSV_META),
      fetchCSV(CONFIG.CSV_COMERCIAL),
    ]);
    renderMeta(parseCSV(t1));
    renderComercial(parseCSV(t2));
    lastRefresh = Date.now();
    document.getElementById('loading').classList.add('hidden');
  } catch(e) {
    console.error('fetchData erro:', e);
    const em = document.getElementById('error-msg');
    em.style.display = 'block';
    em.textContent = 'Erro: ' + e.message;
    document.getElementById('loading-text').textContent = 'Falha na conexão';
    setTimeout(() => document.getElementById('loading').classList.add('hidden'), 5000);
  }
}

function renderMeta(rows) {
  const setores = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;
    const meta = num(r[1]), alc = num(r[2]), falt = num(r[4]), pct = num(r[5]);
    if (meta > 0) setores.push({ nome: r[0].trim(), meta, alc, falt, pct });
    if (setores.length >= 4) break;
  }
  const colors = ['blue','green','red','gold'];
  document.getElementById('kpi-meta').innerHTML = setores.map((s,i) => `
    <div class="kpi ${colors[i]}">
      <div class="kpi-label">${s.nome.replace(/\s*\(.*?\)/g,'').trim()}</div>
      <div class="kpi-value">${brl(s.alc)}</div>
      <div class="kpi-sub">Meta: <b>${brl(s.meta)}</b> &nbsp;|&nbsp;
        <b style="color:${s.pct>=70?'#22c55e':'#ef4444'}">${s.pct.toFixed(1)}%</b> alcançado</div>
    </div>`).join('');
  document.getElementById('bars-meta').innerHTML = setores.map(s => {
    const match = s.nome.match(/\(.*?\)/);
    const sub = match ? match[0] : '';
    const title = s.nome.replace(/\s*\(.*?\)/,'').trim();
    return `<div class="bar-row">
      <div class="bar-name">${title}<small>${sub}</small></div>
      ${barHtml(s.pct, s.falt)}
      <div class="bar-pct">
        <div class="bar-pct-v ${s.pct<50?'low':''}">${s.pct.toFixed(1)}%</div>
        <div class="bar-pct-l">alcançado</div>
      </div>
    </div>`;}).join('');
}

function renderComercial(rows) {
  const corr = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;
    const meta = num(r[1]), alc = num(r[2]), falt = num(r[4]), pct = num(r[5]);
    if (meta > 0) corr.push({ nome: r[0].trim(), meta, alc, falt, pct });
  }
  document.getElementById('kpi-smj').innerHTML = corr.map(c => `
    <div class="kpi ${c.pct>=70?'green':'red'}">
      <div class="kpi-label">${c.nome}</div>
      <div class="kpi-value big">${c.pct.toFixed(2)}<span style="font-size:24px;font-weight:400">%</span></div>
      <div class="kpi-sub">Realizado: <b>${brl(c.alc)}</b> &nbsp;|&nbsp; Meta: <b>${brl(c.meta)}</b></div>
    </div>`).join('');
  document.getElementById('bars-smj').innerHTML = corr.map(c => `
    <div class="bar-row" style="grid-template-columns:150px 1fr 110px">
      <div class="bar-name" style="font-size:24px">${c.nome}</div>
      ${barHtml(c.pct, c.falt, true)}
      <div class="bar-pct">
        <div class="bar-pct-v ${c.pct<50?'low':''}" style="font-size:40px">${c.pct.toFixed(1)}%</div>
        <div class="bar-pct-l">alcançado</div>
      </div>
    </div>`).join('');
}

function tick() {
  const now = new Date();
  document.getElementById('h-clock').textContent = now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  document.getElementById('h-date').textContent = now.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
  const rem = Math.max(0, Math.ceil(ROTATE_MS/1000 - (Date.now()-startTime)/1000));
  document.getElementById('f-timer').textContent = rem + 's';
  const next = CONFIG.REFRESH_MIN*60 - Math.floor((Date.now()-lastRefresh)/1000);
  if (next > 0) { const m=Math.floor(next/60),s=next%60; document.getElementById('f-refresh').textContent='↻ '+(m>0?m+'m ':'')+s+'s'; }
}
setInterval(tick, 1000); tick();

function animProg() {
  document.getElementById('prog').style.width = Math.min(((Date.now()-startTime)/ROTATE_MS)*100,100)+'%';
  requestAnimationFrame(animProg);
}
animProg();

function goSlide(idx) {
  CONFIG.SLIDES.forEach((s,i) => {
    document.getElementById(s.id).classList.toggle('active', i===idx);
    document.getElementById('dot-'+i).classList.toggle('active', i===idx);
  });
  document.getElementById('h-title').textContent = CONFIG.SLIDES[idx].title;
  document.getElementById('f-counter').textContent = String(idx+1).padStart(2,'0')+' / '+String(CONFIG.SLIDES.length).padStart(2,'0');
  current = idx; startTime = Date.now();
  const bar = document.getElementById('prog');
  bar.style.transition = 'none'; bar.style.width = '0%';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ bar.style.transition='width '+ROTATE_MS+'ms linear'; bar.style.width='100%'; }));
}

setInterval(() => goSlide((current+1) % CONFIG.SLIDES.length), ROTATE_MS);
setInterval(fetchData, CONFIG.REFRESH_MIN * 60 * 1000);
goSlide(0);
fetchData();
