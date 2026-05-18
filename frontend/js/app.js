/* =====================================================
   FICHA DE PERSONAGEM D&D — LÓGICA
   ===================================================== */

'use strict';


/* =====================================================
   CONSTANTES E DADOS
   ===================================================== */

let PROF_BONUS = 3;

const STATS = [
  {
    id: 'str', label: 'FOR', value: 10, savingThrow: false,
    skills: [
      { name: 'Atletismo', prof: false }
    ]
  },
  {
    id: 'dex', label: 'DES', value: 14, savingThrow: false,
    skills: [
      { name: 'Acrobacia',       prof: false },
      { name: 'Furtividade',     prof: false },
      { name: 'Prestidigitação', prof: true  }
    ]
  },
  {
    id: 'con', label: 'CON', value: 14, savingThrow: false,
    skills: []
  },
  {
    id: 'int', label: 'INT', value: 18, savingThrow: true,
    skills: [
      { name: 'Arcanismo',   prof: true  },
      { name: 'História',    prof: false },
      { name: 'Investigação',prof: true  },
      { name: 'Natureza',    prof: false },
      { name: 'Religião',    prof: false }
    ]
  },
  {
    id: 'wis', label: 'SAB', value: 12, savingThrow: false,
    skills: [
      { name: 'Intuição',         prof: false },
      { name: 'Lidar c/ Animais', prof: false },
      { name: 'Medicina',         prof: false },
      { name: 'Percepção',        prof: true  },
      { name: 'Sobrevivência',    prof: false }
    ]
  },
  {
    id: 'cha', label: 'CAR', value: 8, savingThrow: false,
    skills: [
      { name: 'Atuação',    prof: false },
      { name: 'Enganação',  prof: false },
      { name: 'Intimidação',prof: false },
      { name: 'Persuasão',  prof: false }
    ]
  },
  {
    id: 'nivel', label: 'Nível', value: 5, mod: '+3', isNivel: true,
    skills: []
  }
];

const COLORS = {
  str:   { bg: '#6B2A36', t: '#f5c8ce' },
  dex:   { bg: '#7A5230', t: '#f5dcc0' },
  con:   { bg: '#1E5E52', t: '#b0e8db' },
  int:   { bg: '#2A4070', t: '#b0c8f5' },
  wis:   { bg: '#3a3a3a', t: '#ddd8cc' },
  cha:   { bg: '#3E2568', t: '#d0b8f5' },
  nivel: { bg: '#2a2218', t: '#c9a84c' }
};

const SCHOOL_RUNES = {
  evocação:     'ᚦ',
  transmutação: 'ᚱ',
  encantamento: 'ᚾ',
  necromancia:  'ᛞ',
  ilusão:       'ᛁ',
  adivinhação:  'ᛟ',
  conjuração:   'ᚨ',
  abjuração:    'ᛉ'
};

const SCHOOL_BG = {
  evocação:     '#3a1a10',
  transmutação: '#1a3a20',
  encantamento: '#2a1a3a',
  necromancia:  '#1a1a2a',
  ilusão:       '#1a2a3a',
  adivinhação:  '#2a2a10',
  conjuração:   '#1a3a38',
  abjuração:    '#1a2a1a'
};

const SCHOOL_COLOR = {
  evocação:     '#e08040',
  transmutação: '#60b870',
  encantamento: '#b060e0',
  necromancia:  '#8080c0',
  ilusão:       '#60a0d0',
  adivinhação:  '#d0d060',
  conjuração:   '#60d0c0',
  abjuração:    '#80d080'
};

const ORIGIN_RUNES = {
  'Classe':      'ᚲ',
  'Talento':     'ᛏ',
  'Pergaminho':  'ᛊ',
  'Item Mágico': 'ᛜ',
  'Dom':         'ᚷ'
};

const HEX_LAYOUT = [
  ['str', 'dex'],
  ['cha', 'nivel', 'con'],
  ['int', 'wis']
];


/* ── Helpers matemáticos ── */
function calcMod(value) { return Math.floor((value - 10) / 2); }
function fmtMod(mod)    { return (mod >= 0 ? '+' : '') + mod; }
function getStatMod(s)  { return s.isNivel ? s.mod : fmtMod(calcMod(s.value)); }
function getSkillMod(s, sk) {
  return sk.prof ? calcMod(s.value) + PROF_BONUS : calcMod(s.value);
}


/* =====================================================
   HEXÁGONOS DE ATRIBUTOS
   ===================================================== */

function renderHexGrid() {
  const grid = document.getElementById('hex-grid');
  grid.innerHTML = '';

  HEX_LAYOUT.forEach((row, ri) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'hex-row';
    rowDiv.style.marginTop = ri === 0 ? '0' : '-18px';

    row.forEach(id => {
      const s = STATS.find(x => x.id === id);
      const c = COLORS[id];
      const profStars = (!s.isNivel && s.skills)
        ? s.skills.filter(sk => sk.prof).length
        : 0;

      const wrap = document.createElement('div');
      wrap.className = 'hex-wrap';
      wrap.onclick = e => openStatPopup(id, e);

      const bg = document.createElement('div');
      bg.className = 'hex-bg';
      bg.style.background = c.bg;
      bg.innerHTML = `
        ${profStars > 0 ? `<span class="hstars">${'*'.repeat(profStars)}</span>` : ''}
        <span class="hlabel" style="color:${c.t}">${s.label}</span>
        <span class="hval"   style="color:${c.t}">${s.value}</span>
        <span class="hmod"   style="color:${c.t}">${getStatMod(s)}</span>
      `;

      wrap.appendChild(bg);
      rowDiv.appendChild(wrap);
    });

    grid.appendChild(rowDiv);
  });
}


/* =====================================================
   POPUP DE ATRIBUTO
   ===================================================== */

let curStat = null;

function openStatPopup(id, e) {
  curStat = id;
  const s   = STATS.find(x => x.id === id);
  const pop = document.getElementById('stat-popup');
  let html  = '';

  if (!s.isNivel) {
    const savMod = s.savingThrow
      ? calcMod(s.value) + PROF_BONUS
      : calcMod(s.value);

    html += `
      <div class="prow">
        <span class="plabel">Modificador</span>
        <span class="pval">${fmtMod(calcMod(s.value))}</span>
      </div>
      <div class="prow">
        <span class="plabel">
          Resistência ${s.savingThrow ? '<span class="pbadge">PROF</span>' : ''}
        </span>
        <span class="pval ${s.savingThrow ? 'prof' : ''}">${fmtMod(savMod)}</span>
      </div>
    `;

    if (s.skills && s.skills.length > 0) {
      html += `<div style="padding:5px 0 2px;font-size:9px;color:var(--text3);
        font-family:'Cinzel',serif;letter-spacing:0.05em;">PERÍCIAS</div>`;

      s.skills.forEach((sk, si) => {
        const m = getSkillMod(s, sk);
        html += `
          <div class="prow">
            <span class="plabel">
              <div class="ptog ${sk.prof ? 'on' : ''}"
                   onclick="toggleSkillProf('${id}',${si})"
                   title="Alternar proficiência">
              </div>
              ${sk.name}
            </span>
            <span class="pval ${sk.prof ? 'prof' : ''}">${fmtMod(m)}</span>
          </div>
        `;
      });
    }
  } else {
    html += `
      <div class="prow">
        <span class="plabel">Bônus Prof</span>
        <span class="pval">${s.mod}</span>
      </div>
      <div class="prow">
        <span class="plabel">Nível</span>
        <span class="pval">${s.value}</span>
      </div>
    `;
  }

  document.getElementById('popup-title').textContent = s.label + ' — ' + s.value;
  document.getElementById('popup-content').innerHTML = html;

  const rect = e.currentTarget.getBoundingClientRect();
  pop.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
  let left = rect.left + window.scrollX;
  if (left + 260 > window.innerWidth - 8) left = window.innerWidth - 268;
  if (left < 8) left = 8;
  pop.style.left = left + 'px';
  pop.classList.add('open');
  e.stopPropagation();
}

function closePopup() {
  document.getElementById('stat-popup').classList.remove('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#stat-popup') && !e.target.closest('.hex-wrap')) {
    closePopup();
  }
});

function toggleSkillProf(statId, si) {
  const s = STATS.find(x => x.id === statId);
  s.skills[si].prof = !s.skills[si].prof;
  renderHexGrid();

  // Reabre o popup na mesma posição aproximada
  const pop  = document.getElementById('stat-popup');
  const rect = pop.getBoundingClientRect();
  const fakeEvent = {
    currentTarget: { getBoundingClientRect: () => ({ bottom: rect.top - 8, left: rect.left }) },
    stopPropagation: () => {}
  };
  openStatPopup(statId, fakeEvent);
}


/* =====================================================
   MODAL DE EDIÇÃO DE ATRIBUTO
   ===================================================== */

let editStatId = null;

function openStatEdit() {
  const s = STATS.find(x => x.id === curStat);
  if (!s) return;
  editStatId = curStat;
  closePopup();

  document.getElementById('se-title').textContent = 'Editar ' + s.label;
  document.getElementById('se-value').value = s.value;

  const saveRow = document.getElementById('se-save-row');
  const tog     = document.getElementById('se-save-tog');
  const lbl     = document.getElementById('se-save-lbl');

  if (s.isNivel) {
    saveRow.style.display = 'none';
    document.getElementById('se-skills-section').style.display = 'none';
  } else {
    saveRow.style.display = '';
    tog.dataset.on      = s.savingThrow ? '1' : '0';
    tog.style.background  = s.savingThrow ? 'var(--teal2)' : 'var(--bg3)';
    tog.style.borderColor = s.savingThrow ? 'var(--teal2)' : 'var(--border2)';
    lbl.textContent = s.savingThrow ? 'Proficiente' : 'Não proficiente';

    if (s.skills && s.skills.length > 0) {
      document.getElementById('se-skills-section').style.display = '';
      const list = document.getElementById('se-skills-list');
      list.innerHTML = '';

      s.skills.forEach((sk, si) => {
        const row = document.createElement('label');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);cursor:pointer;';
        const cb = document.createElement('input');
        cb.type    = 'checkbox';
        cb.checked = sk.prof;
        cb.dataset.si = si;
        row.appendChild(cb);
        row.appendChild(document.createTextNode(sk.name));
        list.appendChild(row);
      });
    } else {
      document.getElementById('se-skills-section').style.display = 'none';
    }
  }

  document.getElementById('stat-edit-overlay').classList.add('open');
}

function toggleSeSave() {
  const tog = document.getElementById('se-save-tog');
  const lbl = document.getElementById('se-save-lbl');
  const on  = tog.dataset.on === '1';
  tog.dataset.on      = on ? '0' : '1';
  tog.style.background  = !on ? 'var(--teal2)' : 'var(--bg3)';
  tog.style.borderColor = !on ? 'var(--teal2)' : 'var(--border2)';
  lbl.textContent = !on ? 'Proficiente' : 'Não proficiente';
}

function saveStatEdit() {
  const s = STATS.find(x => x.id === editStatId);
  if (!s) return;

  const newVal = parseInt(document.getElementById('se-value').value) || s.value;
  s.value = Math.max(1, Math.min(30, newVal));

  if (!s.isNivel) {
    s.savingThrow = document.getElementById('se-save-tog').dataset.on === '1';

    if (s.skills && s.skills.length > 0) {
      document.getElementById('se-skills-list')
        .querySelectorAll('input[type=checkbox]')
        .forEach((cb, i) => { s.skills[i].prof = cb.checked; });
    }
  }

  renderHexGrid();
  closeStatEditDirect();
}

function closeStatEdit(e) {
  if (e.target === document.getElementById('stat-edit-overlay')) closeStatEditDirect();
}

function closeStatEditDirect() {
  document.getElementById('stat-edit-overlay').classList.remove('open');
}


/* =====================================================
   ABAS E SEÇÕES
   ===================================================== */

function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('tbtn-' + tab).classList.add('active');
}

function toggleSection(header) {
  header.parentElement.classList.toggle('col');
}

/* =====================================================
   FETCH DO PERSONAGEM
   ===================================================== */
async function fetchCharacter() {
    const id = window.location.pathname
        .split("/")
        .pop();

    const response = await fetch(
        `/api/character/${id}`
    );

    const character = await response.json();

    renderCharacter(character);
}

function renderCharacter(character) {
    document.getElementById(
        "char-name"
    ).value = character.name;

    document.getElementById(
        "char-race"
    ).value = character.race;

    document.getElementById(
        "char-align"
    ).value = character.alignment;

    document.getElementById(
        "char-antecedent"
    ).value = character.antecedent;
}


/* =====================================================
   HEADER — SINCRONIZAÇÃO
   ===================================================== */
function syncHeader() {
  document.getElementById('hdr-name').textContent  = document.getElementById('char-name').value;
  document.getElementById('hdr-class').textContent = document.getElementById('char-class').value;
  document.getElementById('hdr-race').textContent  = document.getElementById('char-race').value;
  document.getElementById('hdr-align').textContent = document.getElementById('char-align').value;
}

document.getElementById('portrait-input').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('portrait-img').src          = ev.target.result;
    document.getElementById('portrait-img').style.display = 'block';
    document.getElementById('portrait-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});


/* =====================================================
   PONTOS DE VIDA
   ===================================================== */

function adjustHP(delta) {
  const el  = document.getElementById('hp-atual');
  const max = parseInt(document.getElementById('hp-max').textContent);
  let v = parseInt(el.textContent) + delta;
  v = Math.max(0, Math.min(max, v));
  el.textContent = v;
  updateHpHeader();
}

function applyHPDelta() {
  const delta = parseInt(document.getElementById('hp-delta').value) || 0;
  adjustHP(delta);
  document.getElementById('hp-delta').value = '';
}

function healFull() {
  document.getElementById('hp-atual').textContent =
    document.getElementById('hp-max').textContent;
  updateHpHeader();
}

function updateHpHeader() {
  const cur = document.getElementById('hp-atual').textContent;
  const max = document.getElementById('hp-max').textContent;
  document.getElementById('hdr-hp').textContent = cur + '/' + max;
  document.getElementById('hdr-hp').style.color =
    parseInt(cur) <= parseInt(max) * 0.25 ? '#ff4040' : '#e05050';
}

function focusHP() {
  switchTab('ficha');
  setTimeout(() => document.getElementById('hp-delta').focus(), 100);
}


/* =====================================================
   TESTES CONTRA A MORTE
   ===================================================== */

const dsState = { s: [false, false, false], f: [false, false, false] };

function toggleDS(type, idx) {
  dsState[type][idx] = !dsState[type][idx];
  document.getElementById('ds-' + type)
    .querySelectorAll('.dsdot')[idx]
    .classList.toggle(type, dsState[type][idx]);
}


/* =====================================================
   INSPIRAÇÃO
   ===================================================== */

let hasInspiration = false;

function toggleInspiration() {
  hasInspiration = !hasInspiration;
  const dot = document.getElementById('insp-dot');
  dot.style.background  = hasInspiration ? 'var(--gold)'  : 'var(--bg3)';
  dot.style.borderColor = hasInspiration ? 'var(--gold)'  : 'var(--border2)';
  dot.style.boxShadow   = hasInspiration ? '0 0 10px rgba(201,168,76,0.6)' : 'none';
}


/* =====================================================
   TALENTOS
   ===================================================== */

let talentos = [
  { name: 'Mente Aguçada',  desc: 'Aumenta a INT em 1. Vantagem em testes de Investigação.',                   bonus: '+1 INT, Vantagem em Investigação' },
  { name: 'Magia de Guerra', desc: 'Quando lança um truque, pode fazer um ataque com arma como ação bônus.',   bonus: 'Ataque bônus após truque'          },
  { name: 'Trance Élfico',   desc: 'Pode realizar um descanso longo em 4 horas em vez de 8.',                  bonus: 'Descanso longo em 4h'               }
];

function renderTalentos() {
  const list = document.getElementById('talentos-list');
  list.innerHTML = '';

  talentos.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'tal-card';
    card.innerHTML = `
      <div class="tal-hdr" onclick="toggleTalBody(${i})">
        <span class="tal-name">★ ${t.name}</span>
        <div style="display:flex;gap:5px;align-items:center;">
          <button class="ebtn" onclick="event.stopPropagation();openTalentoModal(${i})">✎</button>
          <span style="font-size:11px;color:var(--text3);" id="ta-arr-${i}">▼</span>
        </div>
      </div>
      <div class="tal-body" id="ta-body-${i}">
        <p class="tal-desc">${t.desc || 'Sem descrição.'}</p>
        ${t.bonus ? `<div class="tal-bonus">✦ ${t.bonus}</div>` : ''}
      </div>
    `;
    list.appendChild(card);
  });
}

function toggleTalBody(i) {
  const body  = document.getElementById('ta-body-' + i);
  const arrow = document.getElementById('ta-arr-' + i);
  body.classList.toggle('open');
  if (arrow) arrow.textContent = body.classList.contains('open') ? '▲' : '▼';
}

let editTalIdx = null;

function openTalentoModal(idx) {
  editTalIdx = idx;
  const t = idx !== null ? talentos[idx] : { name: '', desc: '', bonus: '' };
  document.getElementById('tal-mtitle').textContent = idx !== null ? 'Editar Talento' : 'Novo Talento';
  document.getElementById('tal-name').value  = t.name;
  document.getElementById('tal-desc').value  = t.desc  || '';
  document.getElementById('tal-bonus').value = t.bonus || '';
  document.getElementById('tal-del-btn').style.display = idx !== null ? 'block' : 'none';
  document.getElementById('talento-moverlay').classList.add('open');
}

function saveTalento() {
  const name = document.getElementById('tal-name').value.trim();
  if (!name) return;
  const obj = {
    name,
    desc:  document.getElementById('tal-desc').value.trim(),
    bonus: document.getElementById('tal-bonus').value.trim()
  };
  if (editTalIdx !== null) talentos[editTalIdx] = obj;
  else talentos.push(obj);
  renderTalentos();
  closeTalentoModalDirect();
}

function deleteTalento() {
  if (editTalIdx !== null) {
    talentos.splice(editTalIdx, 1);
    renderTalentos();
    closeTalentoModalDirect();
  }
}

function closeTalentoModal(e) {
  if (e.target === document.getElementById('talento-moverlay')) closeTalentoModalDirect();
}

function closeTalentoModalDirect() {
  document.getElementById('talento-moverlay').classList.remove('open');
}


/* =====================================================
   CARACTERÍSTICAS
   ===================================================== */

let caracList = [
  { title: 'Recuperação Arcana',           desc: 'Uma vez por descanso curto, recupera slots cujos níveis somados sejam ≤ metade do nível.' },
  { title: 'Tradição: Escola da Evocação', desc: 'Esculpir Feitiços — permite excluir aliados do dano da evocação.'                         }
];

function renderCaracs() {
  const cont = document.getElementById('caracList');
  cont.innerHTML = '';

  caracList.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'carac-card';
    el.innerHTML = `
      <div class="carac-title">
        ${c.title}
        <button class="ebtn" onclick="openCaracModal(${i})">✎</button>
      </div>
      <div class="carac-desc">${c.desc}</div>
    `;
    cont.appendChild(el);
  });
}

let editCaracIdx = null;

function openCaracModal(idx) {
  editCaracIdx = idx;
  const c = idx !== null ? caracList[idx] : { title: '', desc: '' };
  document.getElementById('carac-mtitle').textContent = idx !== null ? 'Editar Característica' : 'Nova Característica';
  document.getElementById('carac-name').value = c.title || '';
  document.getElementById('carac-desc').value = c.desc  || '';
  document.getElementById('carac-del-btn').style.display = idx !== null ? 'block' : 'none';
  document.getElementById('carac-moverlay').classList.add('open');
}

function saveCarac() {
  const title = document.getElementById('carac-name').value.trim();
  if (!title) return;
  const obj = { title, desc: document.getElementById('carac-desc').value.trim() };
  if (editCaracIdx !== null) caracList[editCaracIdx] = obj;
  else caracList.push(obj);
  renderCaracs();
  closeCaracModalDirect();
}

function deleteCarac() {
  if (editCaracIdx !== null) {
    caracList.splice(editCaracIdx, 1);
    renderCaracs();
    closeCaracModalDirect();
  }
}

function closeCaracModal(e) {
  if (e.target === document.getElementById('carac-moverlay')) closeCaracModalDirect();
}

function closeCaracModalDirect() {
  document.getElementById('carac-moverlay').classList.remove('open');
}


/* =====================================================
   SLOTS DE MAGIA
   ===================================================== */

const slotConfig = [
  { level: 1, total: 4, used: [], label: '1º Nível' },
  { level: 2, total: 3, used: [], label: '2º Nível' },
  { level: 3, total: 2, used: [], label: '3º Nível' },
  { level: 4, total: 0, used: [], label: '4º Nível' },
  { level: 5, total: 0, used: [], label: '5º Nível' }
];

function renderSlots() {
  const grid = document.getElementById('slots-grid');
  grid.innerHTML = '';

  slotConfig.forEach((sg, si) => {
    if (sg.total === 0 && si > 2) return;

    const div = document.createElement('div');
    div.className = 'slot-g';

    let circles = '';
    for (let i = 0; i < Math.max(sg.total, 1); i++) {
      circles += `<div class="slotc ${sg.used.includes(i) ? 'used' : ''}"
                       onclick="toggleSlot(${si}, ${i})"></div>`;
    }

    div.innerHTML = `
      <div class="slot-lvl">${sg.label}</div>
      <div class="slot-circles">${circles}</div>
      <div style="display:flex;gap:4px;justify-content:center;margin-top:5px;">
        <span style="font-size:10px;color:var(--text3);cursor:pointer;"
              onclick="changeSlotTotal(${si}, -1)">−</span>
        <span style="font-size:10px;color:var(--text3);">
          ${sg.total - sg.used.length}/${sg.total}
        </span>
        <span style="font-size:10px;color:var(--text3);cursor:pointer;"
              onclick="changeSlotTotal(${si}, 1)">+</span>
      </div>
    `;

    grid.appendChild(div);
  });
}

function toggleSlot(si, i) {
  const sg  = slotConfig[si];
  const idx = sg.used.indexOf(i);
  if (idx >= 0) sg.used.splice(idx, 1);
  else if (sg.used.length < sg.total) sg.used.push(i);
  renderSlots();
}

function changeSlotTotal(si, delta) {
  slotConfig[si].total = Math.max(0, slotConfig[si].total + delta);
  slotConfig[si].used  = slotConfig[si].used.filter(i => i < slotConfig[si].total);
  renderSlots();
}

function resetSlots() {
  slotConfig.forEach(sg => (sg.used = []));
  renderSlots();
}


/* =====================================================
   MAGIAS
   ===================================================== */

let spells = [
  {
    name: 'Bola de Fogo', level: 3, school: 'evocação',
    action: '1 ação', range: '45m', duration: 'Instantânea',
    components: 'V, S, M (bola de guano)', damage: '8d6 fogo',
    origin: 'Classe', ritual: false, conc: false, reaction: false,
    prepared: true,
    desc: 'Uma faísca de luz sai do seu dedo e explode em um rugido na área escolhida.'
  },
  {
    name: 'Míssil Mágico', level: 1, school: 'evocação',
    action: '1 ação', range: '36m', duration: 'Instantânea',
    components: 'V, S', damage: '3×(1d4+1) de força',
    origin: 'Classe', ritual: false, conc: false, reaction: false,
    prepared: true,
    desc: 'Três dardos de energia mágica atingem criaturas à sua escolha.'
  },
  {
    name: 'Detectar Magia', level: 1, school: 'adivinhação',
    action: '1 ação', range: 'Pessoal', duration: 'Conc. 10min',
    components: 'V, S', damage: '—',
    origin: 'Classe', ritual: true, conc: true, reaction: false,
    prepared: false,
    desc: 'Por 10 minutos, você sente a presença de magia a 9 metros de você.'
  },
  {
    name: 'Escudo', level: 1, school: 'abjuração',
    action: '1 reação', range: 'Pessoal', duration: '1 rodada',
    components: 'V, S', damage: '+5 CA',
    origin: 'Classe', ritual: false, conc: false, reaction: true,
    prepared: true,
    desc: '+5 de bônus à CA até o início do seu próximo turno.'
  }
];

/* ── Renderização dos cards ── */
function renderSpells() {
  const grid = document.getElementById('spells-grid');
  grid.innerHTML = '';

  spells.forEach((sp, i) => {
    const card = document.createElement('div');
    card.className = 'spell-card' + (sp.prepared ? ' prep' : '');

    const rune     = SCHOOL_RUNES[sp.school]  || '✦';
    const origRune = ORIGIN_RUNES[sp.origin]  || '?';
    const schoolBg = SCHOOL_BG[sp.school]     || '#1a1a1a';
    const schoolCl = SCHOOL_COLOR[sp.school]  || '#aaa';

    const flags = [
      sp.conc     ? '<span class="sflag fc">CONC</span>' : '',
      sp.ritual   ? '<span class="sflag fr">RIT</span>'  : '',
      sp.reaction ? '<span class="sflag fre">REA</span>' : ''
    ].join('');

    card.innerHTML = `
      <div class="spell-img-area" style="background:${schoolBg};">
        <div class="spell-rune"
             style="color:${schoolCl};text-shadow:0 0 14px ${schoolCl}88;">
          ${rune}
        </div>
        <div class="spell-top">
          <div class="slvl-badge">${sp.level === 0 ? 'C' : sp.level}</div>
          <div class="sorig-rune" title="${sp.origin}">${origRune}</div>
        </div>
      </div>
      ${flags ? `<div class="spell-flags-row">${flags}</div>` : '<div style="height:4px;"></div>'}
      <div class="spell-card-body">
        <div class="spell-name">${sp.name}</div>
        <div class="spell-actions">
          <div class="prep-btn ${sp.prepared ? 'on' : ''}"
               onclick="togglePrepared(${i}, event)"
               title="${sp.prepared ? 'Preparada — clique para desmarcar' : 'Preparar'}">
          </div>
          <div style="display:flex;gap:4px;">
            <button class="sib" onclick="openSpellForm(${i}, event)"   title="Editar">✎</button>
            <button class="sib" onclick="openSpellDetail(${i}, event)" title="Detalhes">◉</button>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  renderPrepared();
}

function togglePrepared(i, e) {
  spells[i].prepared = !spells[i].prepared;
  renderSpells();
  e.stopPropagation();
}

function renderPrepared() {
  const list = document.getElementById('prepared-list');
  list.innerHTML = '';

  const prep = spells.filter(s => s.prepared);
  if (prep.length === 0) {
    list.innerHTML = '<div style="color:var(--text3);font-size:13px;">Nenhuma magia preparada.</div>';
    return;
  }

  prep.forEach(sp => {
    const el = document.createElement('div');
    el.className = 'prep-item';
    el.innerHTML = `
      <div class="prep-lvl">${sp.level === 0 ? 'C' : sp.level}</div>
      <div style="flex:1;">
        <div style="font-size:14px;">${sp.name}</div>
        <div style="font-size:11px;color:var(--text3);">${sp.action}</div>
      </div>
    `;
    list.appendChild(el);
  });
}

/* ── Modal de detalhes da magia ── */
function openSpellDetail(i, e) {
  if (e) e.stopPropagation();
  const sp     = spells[i];
  const rune   = SCHOOL_RUNES[sp.school]  || '✦';
  const schoolCl = SCHOOL_COLOR[sp.school] || '#aaa';
  const spIdx  = spells.indexOf(sp);

  document.getElementById('sd-title').textContent = sp.name;
  document.getElementById('sd-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div style="font-size:54px;color:${schoolCl};font-family:serif;
                  text-shadow:0 0 18px ${schoolCl}66;">${rune}</div>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:12px;color:${schoolCl}">
          ${sp.school} · ${sp.level === 0 ? 'Truque' : 'Nível ' + sp.level}
        </div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px;">Origem: ${sp.origin}</div>
        <div style="display:flex;gap:5px;margin-top:4px;">
          ${sp.conc     ? '<span class="sflag fc">CONCENTRAÇÃO</span>' : ''}
          ${sp.ritual   ? '<span class="sflag fr">RITUAL</span>'       : ''}
          ${sp.reaction ? '<span class="sflag fre">REAÇÃO</span>'      : ''}
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <div class="irow"><span style="color:var(--text3)">Ação:</span> ${sp.action}</div>
      <div class="irow"><span style="color:var(--text3)">Distância:</span> ${sp.range}</div>
      <div class="irow"><span style="color:var(--text3)">Duração:</span> ${sp.duration}</div>
      <div class="irow"><span style="color:var(--text3)">Componentes:</span> ${sp.components}</div>
      <div class="irow" style="grid-column:1/-1;">
        <span style="color:var(--red2);">Dano/Efeito:</span>
        <strong style="color:var(--text);">${sp.damage}</strong>
      </div>
    </div>
    <div style="font-size:14px;color:var(--text2);line-height:1.6;">${sp.desc}</div>
    <div style="display:flex;gap:8px;margin-top:14px;">
      <button class="btn-sm"
        onclick="togglePrepared(${spIdx},{stopPropagation:()=>{}});renderSpells();closeSpellDetailDirect();">
        ${sp.prepared ? 'Desmarcar Preparada' : 'Marcar Preparada'}
      </button>
      <button class="btn-sm"
        onclick="closeSpellDetailDirect();openSpellForm(${spIdx}, null);">
        ✎ Editar
      </button>
    </div>
  `;

  document.getElementById('spell-detail-overlay').classList.add('open');
}

function closeSpellDetail(e) {
  if (e.target === document.getElementById('spell-detail-overlay')) closeSpellDetailDirect();
}

function closeSpellDetailDirect() {
  document.getElementById('spell-detail-overlay').classList.remove('open');
}

/* ── Formulário de magia (adicionar / editar) ── */
let editSpellIdx = null;

function openSpellForm(idx, e) {
  if (e) e.stopPropagation();
  editSpellIdx = idx;

  const sp = idx !== null ? spells[idx] : {
    name: '', level: 1, school: 'evocação', action: '1 ação',
    range: '', duration: '', components: '', damage: '',
    origin: 'Classe', ritual: false, conc: false, reaction: false, desc: ''
  };

  document.getElementById('sf-title').textContent = idx !== null ? 'Editar Magia' : 'Nova Magia';
  document.getElementById('sf-name').value        = sp.name;
  document.getElementById('sf-level').value       = sp.level;
  document.getElementById('sf-school').value      = sp.school;
  document.getElementById('sf-action').value      = sp.action;
  document.getElementById('sf-range').value       = sp.range;
  document.getElementById('sf-duration').value    = sp.duration;
  document.getElementById('sf-components').value  = sp.components;
  document.getElementById('sf-damage').value      = sp.damage;
  document.getElementById('sf-origin').value      = sp.origin;
  document.getElementById('sf-ritual').checked    = sp.ritual;
  document.getElementById('sf-conc').checked      = sp.conc;
  document.getElementById('sf-reaction').checked  = sp.reaction;
  document.getElementById('sf-desc').value        = sp.desc || '';
  document.getElementById('sf-del-btn').style.display = idx !== null ? 'block' : 'none';

  document.getElementById('spell-form-overlay').classList.add('open');
}

function saveSpellForm() {
  const name = document.getElementById('sf-name').value.trim();
  if (!name) return;

  const sp = {
    name,
    level:      parseInt(document.getElementById('sf-level').value) || 0,
    school:     document.getElementById('sf-school').value,
    action:     document.getElementById('sf-action').value,
    range:      document.getElementById('sf-range').value      || 'Pessoal',
    duration:   document.getElementById('sf-duration').value   || 'Instantânea',
    components: document.getElementById('sf-components').value || 'V, S',
    damage:     document.getElementById('sf-damage').value     || '—',
    origin:     document.getElementById('sf-origin').value,
    ritual:     document.getElementById('sf-ritual').checked,
    conc:       document.getElementById('sf-conc').checked,
    reaction:   document.getElementById('sf-reaction').checked,
    prepared:   editSpellIdx !== null ? spells[editSpellIdx].prepared : false,
    desc:       document.getElementById('sf-desc').value
  };

  if (editSpellIdx !== null) spells[editSpellIdx] = sp;
  else spells.push(sp);

  renderSpells();
  closeSpellFormDirect();
}

function deleteSpellForm() {
  if (editSpellIdx !== null) {
    spells.splice(editSpellIdx, 1);
    renderSpells();
    closeSpellFormDirect();
  }
}

function closeSpellForm(e) {
  if (e.target === document.getElementById('spell-form-overlay')) closeSpellFormDirect();
}

function closeSpellFormDirect() {
  document.getElementById('spell-form-overlay').classList.remove('open');
}


/* =====================================================
   ARMAS
   ===================================================== */

let weapons = [
  { name: 'Bastão Arcano', bonus: '+4', damage: '1d6+2 contusão',    type: 'Simples', state: 'Equipado', notes: 'Foco arcano'          },
  { name: 'Adaga',         bonus: '+5', damage: '1d4+3 perfuração', type: 'Simples', state: 'Equipado', notes: 'Jogável, corpo a corpo' }
];

function renderWeapons() {
  const list = document.getElementById('weapons-list');
  list.innerHTML = '';

  weapons.forEach((w, i) => {
    const el = document.createElement('div');
    el.className = 'weapon-row';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <div class="wname">${w.name}</div>
        <button class="ebtn" onclick="openWeaponModal(${i})">✎ Editar</button>
      </div>
      <div class="wstats">
        <div class="wstat"><div class="wl">BÔNUS ATQ</div><div class="wv" style="color:var(--gold2);">${w.bonus}</div></div>
        <div class="wstat"><div class="wl">DANO</div>      <div class="wv" style="color:var(--red2);">${w.damage}</div></div>
        <div class="wstat"><div class="wl">TIPO</div>      <div class="wv">${w.type  || '—'}</div></div>
        <div class="wstat"><div class="wl">ESTADO</div>    <div class="wv">${w.state}</div></div>
      </div>
      ${w.notes ? `<div style="font-size:11px;color:var(--text3);margin-top:4px;">${w.notes}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

let editWpnIdx = null;

function openWeaponModal(idx) {
  editWpnIdx = idx;
  const w = idx !== null ? weapons[idx] : { name: '', bonus: '', damage: '', type: '', state: 'Equipado', notes: '' };
  document.getElementById('wm-title').textContent = idx !== null ? 'Editar Arma' : 'Nova Arma';
  document.getElementById('wm-name').value   = w.name;
  document.getElementById('wm-bonus').value  = w.bonus;
  document.getElementById('wm-damage').value = w.damage;
  document.getElementById('wm-state').value  = w.state;
  document.getElementById('wm-type').value   = w.type  || '';
  document.getElementById('wm-notes').value  = w.notes || '';
  document.getElementById('wm-del-btn').style.display = idx !== null ? 'block' : 'none';
  document.getElementById('weapon-moverlay').classList.add('open');
}

function saveWeapon() {
  const name = document.getElementById('wm-name').value.trim();
  if (!name) return;
  const obj = {
    name,
    bonus:  document.getElementById('wm-bonus').value,
    damage: document.getElementById('wm-damage').value,
    type:   document.getElementById('wm-type').value,
    state:  document.getElementById('wm-state').value,
    notes:  document.getElementById('wm-notes').value
  };
  if (editWpnIdx !== null) weapons[editWpnIdx] = obj;
  else weapons.push(obj);
  renderWeapons();
  closeWeaponModalDirect();
}

function deleteWeapon() {
  if (editWpnIdx !== null) {
    weapons.splice(editWpnIdx, 1);
    renderWeapons();
    closeWeaponModalDirect();
  }
}

function closeWeaponModal(e) {
  if (e.target === document.getElementById('weapon-moverlay')) closeWeaponModalDirect();
}

function closeWeaponModalDirect() {
  document.getElementById('weapon-moverlay').classList.remove('open');
}


/* =====================================================
   ITENS
   ===================================================== */

let items = [
  { name: 'Mochila de Aventureiro', qty: 1,  value: '2po',  desc: 'Equipamentos básicos de sobrevivência.' },
  { name: 'Poção de Cura',          qty: 3,  value: '50po', desc: 'Recupera 2d4+2 HP.'                     },
  { name: 'Pergaminho em Branco',   qty: 5,  value: '1po',  desc: 'Para copiar magias.'                    },
  { name: 'Tinta de Escriba',       qty: 1,  value: '10po', desc: 'Necessária para transcrever magias.'    },
  { name: 'Ração de Viagem',        qty: 10, value: '5pp',  desc: 'Para 1 dia.'                            }
];

function renderItems() {
  const list = document.getElementById('items-list');
  list.innerHTML = '';

  items.forEach((it, i) => {
    const el = document.createElement('div');
    el.className = 'item-row';
    el.innerHTML = `
      <div class="item-qty"
           contenteditable
           onblur="items[${i}].qty = parseInt(this.textContent) || 1">
        ${it.qty}
      </div>
      <div style="flex:1;">
        <div style="font-size:14px;"
             contenteditable
             onblur="items[${i}].name = this.textContent">
          ${it.name}
        </div>
        <div style="font-size:11px;color:var(--text3);"
             contenteditable
             onblur="items[${i}].desc = this.textContent">
          ${it.desc}
        </div>
      </div>
      <div style="font-size:12px;color:var(--text3);"
           contenteditable
           onblur="items[${i}].value = this.textContent">
        ${it.value}
      </div>
      <button class="ebtn" onclick="openItemModal(${i})" style="flex-shrink:0;">✎</button>
    `;
    list.appendChild(el);
  });
}

let editItemIdx = null;

function openItemModal(idx) {
  editItemIdx = idx;
  const it = idx !== null ? items[idx] : { name: '', qty: 1, value: '', desc: '' };
  document.getElementById('im-title').textContent = idx !== null ? 'Editar Item' : 'Novo Item';
  document.getElementById('im-name').value  = it.name;
  document.getElementById('im-qty').value   = it.qty;
  document.getElementById('im-value').value = it.value;
  document.getElementById('im-desc').value  = it.desc;
  document.getElementById('im-del-btn').style.display = idx !== null ? 'block' : 'none';
  document.getElementById('item-moverlay').classList.add('open');
}

function saveItem() {
  const name = document.getElementById('im-name').value.trim();
  if (!name) return;
  const obj = {
    name,
    qty:   parseInt(document.getElementById('im-qty').value) || 1,
    value: document.getElementById('im-value').value,
    desc:  document.getElementById('im-desc').value
  };
  if (editItemIdx !== null) items[editItemIdx] = obj;
  else items.push(obj);
  renderItems();
  closeItemModalDirect();
}

function deleteItem() {
  if (editItemIdx !== null) {
    items.splice(editItemIdx, 1);
    renderItems();
    closeItemModalDirect();
  }
}

function closeItemModal(e) {
  if (e.target === document.getElementById('item-moverlay')) closeItemModalDirect();
}

function closeItemModalDirect() {
  document.getElementById('item-moverlay').classList.remove('open');
}


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

function init() {
  fetchCharacter();
  syncHeader();
  renderHexGrid();
  renderSlots();
  renderSpells();
  renderWeapons();
  renderItems();
  renderTalentos();
  renderCaracs();
  updateHpHeader();
}

init(); 