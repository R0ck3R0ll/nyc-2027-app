/* Interfaz de la app NYC 2027 */
(function () {
  'use strict';
  var C = window.CORE, ST = window.STORE, S = ST.S;
  C.setFichas(window.FICHAS);
  var F = window.FICHAS;
  var DIAS = C.TRIP.dias;

  /* ---------- utilidades ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function strip(s) { return String(s || '').replace(/<[^>]+>/g, ''); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  var CAT = {
    'Miradores': 'miradores', 'Iconos y paseos': 'iconos', 'Museos': 'museos', 'Parques y pistas de hielo': 'parques',
    'Ambiente navideño': 'navidad', 'Broadway': 'broadway', 'Experiencias': 'experiencias', 'Barrios': 'barrios',
    'Compras': 'compras', 'Restauración': 'restauracion'
  };
  var CATS = Object.keys(CAT);
  function catColor(f) { return 'var(--c-' + (f ? CAT[f.categoria] : 'libre') + ')'; }
  function bullet(f) {
    var dark = f && (f.categoria === 'Broadway');
    return '<span class="bullet' + (dark ? ' dark' : '') + '" style="background:' + catColor(f) + '">' + (f ? f.num : '') + '</span>';
  }
  function thumb(f) { return f && f.fotos && f.fotos.hero ? 'img/t/' + f.fotos.hero + '.webp' : ''; }
  function img(k) { return 'img/' + k + '.webp'; }
  var I = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>',
    now: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    trip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l18-7-7 18-2-8z"/></svg>',
    nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-8-8 18-2-8z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    walk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="2"/><path d="M10 22l2-7-3-3 1-5 4 3 3 1M9 12l-2 3"/></svg>',
    train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r=".5"/><circle cx="15" cy="14" r=".5"/></svg>',
    bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M7 21v-3M17 21v-3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 12l5 5L20 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>'
  };
  function modeIcon(m) { return m === 'metro' ? I.train : m === 'bus' ? I.bus : I.walk; }
  function modeTxt(tr) { return '≈' + tr.min + ' min ' + (tr.modo === 'metro' ? 'en metro' : tr.modo === 'bus' ? 'en bus' : 'a pie'); }
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.add('hidden'); }, 2600);
  }
  function myFam() { return S.me ? S.me.fam : 'A'; }
  function whoChip(who) { return who && who !== 'all' ? '<span class="who ' + who + '">' + esc(ST.famName(who)) + '</span>' : ''; }
  function todayDay() { var n = C.nyNow(); return n.dia; }
  function curDay() {
    if (S.ui.day) return S.ui.day;
    return todayDay() || 2;
  }

  /* ---------- hojas (modales) con botón atrás ---------- */
  var sheetStack = [];
  function openSheet(title, html, onMount) {
    var bg = document.createElement('div'); bg.className = 'sheet-bg';
    var sh = document.createElement('div'); sh.className = 'sheet';
    sh.innerHTML = '<div class="grab' + (title ? '' : ' float') + '"><span class="ttl">' + esc(title || '') + '</span><button class="x" aria-label="Cerrar">×</button></div><div class="body">' + html + '</div>';
    document.body.appendChild(bg); document.body.appendChild(sh);
    var entry = { bg: bg, sh: sh };
    sheetStack.push(entry);
    history.pushState({ sheet: sheetStack.length }, '');
    bg.onclick = function () { history.back(); };
    sh.querySelector('.x').onclick = function () { history.back(); };
    if (onMount) onMount(sh.querySelector('.body'), entry);
    return entry;
  }
  function closeTop() {
    var e = sheetStack.pop();
    if (e) { e.bg.remove(); e.sh.remove(); if (e.onClose) e.onClose(); }
  }
  window.addEventListener('popstate', function () { if (sheetStack.length) closeTop(); });
  function closeAllSheets() { while (sheetStack.length) { closeTop(); history.back(); } }
  function closeSheet() { history.back(); }

  /* ---------- cabecera y pestañas ---------- */
  var TABS = [
    { id: 'programa', nombre: 'Programa', icon: I.cal },
    { id: 'sugerencias', nombre: 'Sugerencias', icon: I.spark },
    { id: 'banco', nombre: 'Lugares', icon: I.list },
    { id: 'ahora', nombre: 'Ahora', icon: I.now },
    { id: 'viaje', nombre: 'Viaje', icon: I.trip }
  ];
  function header(title, sub) {
    var st = S.sync.status;
    var stTxt = { online: 'Sincronizado', offline: 'Sin conexión: se guardará al volver', connecting: 'Conectando…', off: 'Solo en este móvil', notrip: 'Sin viaje en la nube', notfound: 'Viaje no encontrado', error: 'Error de sincronización' }[st] || '';
    return '<header class="band"><div class="row"><div><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') +
      '</div><span title="' + esc(stTxt) + '" class="sync-dot ' + st + '"></span></div></header><div class="band-line"></div>';
  }
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(function (t) {
      return '<button data-tab="' + t.id + '" class="' + (S.ui.view === t.id ? 'on' : '') + '">' + t.icon + '<span>' + t.nombre + '</span><i class="dot"></i></button>';
    }).join('');
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-tab]');
    if (t) { ST.setUi({ view: t.getAttribute('data-tab') }); window.scrollTo(0, 0); }
  });

  /* ---------- bienvenida / perfil ---------- */
  function renderWelcome() {
    var cloud = window.FIREBASE_CONFIG;
    var st = S.sync.status;
    var html = header('Nueva York 2027', '1–7 de enero');
    html += '<div class="welcome">';
    if (!S.trip) {
      if (cloud && (st === 'connecting')) {
        html += '<div class="empty"><div class="big">Conectando…</div>Cargando el viaje</div>';
      } else {
        html += '<h2>Bienvenidos</h2><p class="muted">Si alguien del grupo te ha mandado el enlace del viaje, ábrelo desde ese mensaje. Si eres quien organiza, crea el viaje e invita a los demás.</p>' +
          (st === 'notfound' ? '<p class="warn w-error">El enlace no corresponde a ningún viaje. Pide de nuevo la invitación.</p>' : '') +
          '<label class="f">Nombre de la familia A</label><input type="text" id="famA" placeholder="p. ej. Nasisi" value="">' +
          '<label class="f">Nombre de la familia B</label><input type="text" id="famB" placeholder="la otra familia" value="">' +
          '<div style="height:14px"></div><button class="btn yellow full" id="crear">Crear el viaje</button>' +
          '<label class="f" style="margin-top:22px">¿Tienes un enlace de invitación? Pégalo aquí</label><input type="text" id="link" placeholder="https://…?v=…">' +
          '<div style="height:8px"></div><button class="btn ghost full" id="unirse">Entrar con el enlace</button>';
      }
    } else {
      var me = S.me || {};
      html += '<h2>¿Quién eres?</h2><p class="muted">Tu nombre y tu familia: así la app sabe qué es para todos y qué es solo para tu familia.</p>' +
        '<label class="f">Tu nombre</label><input type="text" id="nombre" value="' + esc(me.name || '') + '" placeholder="Nombre">' +
        '<label class="f">Tu familia</label><div class="famopts">' +
        ['A', 'B'].map(function (f) { return '<button data-fam="' + f + '" class="' + (me.fam === f ? 'on' : '') + '">' + esc(ST.famName(f)) + '</button>'; }).join('') +
        '</div><div style="height:18px"></div><button class="btn yellow full" id="entrar">Entrar</button>';
    }
    html += '</div>';
    $('#app').innerHTML = html;
    var crear = $('#crear');
    if (crear) crear.onclick = function () {
      var fam = { A: $('#famA').value.trim() || 'Familia A', B: $('#famB').value.trim() || 'Familia B' };
      if (window.SYNC_API && window.SYNC_API.enabled()) {
        crear.disabled = true; crear.textContent = 'Creando…';
        window.SYNC_API.create(fam).catch(function (e) { crear.disabled = false; crear.textContent = 'Crear el viaje'; toast('No se pudo crear: ' + (e.code || e.message)); });
      } else ST.createLocal(fam);
    };
    var un = $('#unirse');
    if (un) un.onclick = function () {
      var m = /[?&]v=([\w-]+)/.exec($('#link').value);
      if (!m) { toast('El enlace no es válido'); return; }
      if (!window.SYNC_API || !window.SYNC_API.enabled()) { toast('La sincronización aún no está activada'); return; }
      window.SYNC_API.join(m[1]);
    };
    var sel = me && me.fam;
    document.querySelectorAll('[data-fam]').forEach(function (b) {
      b.onclick = function () { sel = b.getAttribute('data-fam'); document.querySelectorAll('[data-fam]').forEach(function (x) { x.classList.toggle('on', x === b); }); };
    });
    var en = $('#entrar');
    if (en) en.onclick = function () {
      var name = $('#nombre').value.trim();
      if (!name || !sel) { toast('Escribe tu nombre y elige tu familia'); return; }
      ST.setMe({ name: name, fam: sel });
    };
  }

  /* ---------- PROGRAMA ---------- */
  function visibleBlocks(day) {
    var fam = myFam();
    return C.sortBlocks(ST.blocks().filter(function (b) {
      if (b.day !== day) return false;
      if (b.status === 'skip') return false;
      return S.ui.showOther || C.covers(b.who, fam);
    }));
  }
  function dayLoad(day) {
    return C.analyzeDay(ST.blocks(), day, myFam()).resumen;
  }
  function dayChips(sel, attr) {
    return '<div class="days">' + DIAS.map(function (d) {
      var r = dayLoad(d.n);
      var parts = d.corto.split(' ');
      return '<button class="chip daychip ' + (sel === d.n ? 'on' : '') + '" ' + attr + '="' + d.n + '"><span class="d1">' + parts[0] + '</span><span class="d2">' + parts[1] + '</span><span class="load ' + r.nivel + '"></span></button>';
    }).join('') + '</div>';
  }
  function renderPrograma() {
    var day = curDay();
    var d = DIAS[day - 1];
    var fam = myFam(), other = ST.otherFam();
    var an = C.analyzeDay(ST.blocks(), day, fam);
    var anO = S.ui.showOther ? C.analyzeDay(ST.blocks(), day, other) : null;
    var list = visibleBlocks(day);
    var r = an.resumen;
    var html = header('Programa', esc(S.me.name) + ' · ' + esc(ST.famName(fam)));
    html += '<main>' + dayChips(day, 'data-day');
    html += '<div class="dayhead"><div><h2>' + d.largo + '</h2><div class="meta">' +
      (r.first != null ? C.fmt(r.first) + '–' + C.fmt(r.last) + ' · ' + C.durTxt(r.activo) + ' de actividad · ' + C.durTxt(r.traslados) + ' de traslados' : 'Día vacío') +
      '</div></div></div>';
    if (r.carga) {
      var pct = Math.min(100, r.carga / (14 * 60) * 100);
      var col = r.nivel === 'ligero' ? 'var(--ok)' : r.nivel === 'completo' ? 'var(--accent)' : 'var(--err)';
      html += '<div class="loadbar"><i style="width:' + pct + '%;background:' + col + '"></i></div><div class="small muted">Carga del día: ' + { ligero: 'ligera', completo: 'completa', cargado: 'muy cargada' }[r.nivel] + '</div>';
    }
    html += '<label class="toggle"><input type="checkbox" id="showOther" ' + (S.ui.showOther ? 'checked' : '') + '> Ver también lo de ' + esc(ST.famName(other)) + '</label>';
    if (!list.length || list.every(function (b) { return b.type === 'fixed'; })) {
      html += '<div class="card empty"><div class="big">' + (list.length ? 'Solo hay lo fijo' : 'Día vacío') + '</div>Elige una sugerencia o añade lugares desde el banco.<div class="row-btns" style="margin-top:14px"><button class="btn yellow" data-go="sug">' + I.spark + ' Sugerencias</button><button class="btn ghost" data-go="banco">' + I.plus + ' Añadir lugar</button></div></div>';
    }
    if (list.length) {
      html += '<div class="timeline">';
      var prevMine = null;
      list.forEach(function (b, i) {
        var mine = C.covers(b.who, fam);
        var warns = (mine ? an.byId[b.id] : anO && anO.byId[b.id]) || [];
        if (prevMine && mine) {
          var tr = C.travel(prevMine, b);
          var free = C.blockStart(b) - C.blockEnd(prevMine);
          var bad = free < tr.min;
          html += '<div class="gap"><div class="gl"></div><div class="gi' + (bad ? ' bad' : '') + '">' + (tr.min ? modeIcon(tr.modo) + modeTxt(tr) : 'Al lado') + (free - tr.min > 10 ? ' · ' + C.durTxt(free - tr.min) + ' libres' : bad ? ' · faltan ' + (tr.min - free) + ' min' : '') + '</div></div>';
        }
        html += blockCard(b, warns);
        if (mine) prevMine = b;
      });
      html += '</div>';
      html += '<div class="toolbar"><button class="btn ghost" data-go="banco">' + I.plus + ' Añadir lugar</button><button class="btn ghost" data-act="libre">' + I.plus + ' Bloque libre</button>' +
        '<a class="btn maps" target="_blank" rel="noopener" href="' + rutaDia(day) + '">' + I.route + ' Ruta del día</a></div>';
      html += '<div class="toolbar"><button class="btn ghost" data-go="sug">' + I.spark + ' Sugerencias para este día</button></div>';
    }
    html += '</main>';
    $('#app').innerHTML = html;
    $('#showOther').onchange = function (e) { ST.setUi({ showOther: e.target.checked }); };
  }
  function rutaDia(day) {
    var pts = C.lineBlocks(ST.blocks(), day, myFam()).filter(function (b) { return b.status !== 'done' && b.n != null; })
      .map(function (b) { return C.ficha(b.n).ubicacion; });
    return C.mapsRuta(pts.length ? pts : [C.TRIP.hotel]);
  }
  function blockCard(b, warns) {
    var f = b.n != null ? C.ficha(b.n) : null;
    var s = C.blockStart(b), e = C.blockEnd(b);
    var cls = 'card bcard' + (b.status === 'done' ? ' done' : '') + (b.type === 'fixed' ? ' fixed' : '');
    var meta = [];
    if (f) meta.push(esc(f.zona));
    if (b.booking && b.booking.ok) meta.push('<span style="color:var(--book);font-weight:700">Reservado</span>');
    var html = '<div class="blk"><div class="t">' + C.fmt(s) + '<small>' + C.fmt(e) + '</small></div>' +
      '<div class="' + cls + '" style="' + (f ? 'border-left-color:' + catColor(f) : '') + '" data-block="' + b.id + '">' +
      (f && thumb(f) ? '<img class="th" loading="lazy" src="' + thumb(f) + '" alt="">' : '') +
      '<div class="bi"><div class="bt">' + esc(C.blockTitle(b)) + '</div><div class="bm">' + whoChip(b.who) + meta.join(' · ') + '</div>';
    if (b.note) html += '<div class="small muted" style="margin-top:3px">' + esc(b.note) + '</div>';
    if (b.booking && b.booking.ok && b.booking.info) html += '<div class="small" style="margin-top:3px;color:var(--book)">' + esc(b.booking.info) + '</div>';
    var shown = warns.filter(function (w) { return w.nivel !== 'info' || !w.reserva || !(b.booking && b.booking.ok); });
    if (shown.length) html += '<div class="warns">' + shown.map(function (w) { return '<div class="warn w-' + w.nivel + '">' + esc(w.txt) + '</div>'; }).join('') + '</div>';
    html += '</div><div class="acts">';
    if (f) html += '<a class="btn maps small" target="_blank" rel="noopener" href="' + C.mapsDir(f) + '" data-stop>' + I.nav + ' Ir</a>';
    if (f) html += '<button class="btn ghost small" data-ficha="' + f.num + '" data-stop>' + I.doc + ' Ficha</button>';
    if (b.type !== 'fixed') html += '<button class="btn ghost small" data-done="' + b.id + '" data-stop>' + (b.status === 'done' ? 'Deshacer' : I.check + ' Hecho') + '</button>';
    html += '</div></div></div>';
    return html;
  }

  /* editor de bloque */
  function editBlock(id) {
    var b = S.blocks[id];
    if (!b) return;
    var f = b.n != null ? C.ficha(b.n) : null;
    var html = '';
    if (f) html += '<div class="kicker">' + bullet(f) + esc(f.categoria) + ' · ' + esc(f.zona) + '</div>';
    html += '<div class="fttl" style="font-size:21px">' + esc(C.blockTitle(b)) + '</div>';
    if (!f) html += '<label class="f">Título</label><input type="text" id="eb-title" value="' + esc(b.title || '') + '">';
    html += '<div class="filters"><div><label class="f">Día</label><select id="eb-day">' + DIAS.map(function (d) { return '<option value="' + d.n + '"' + (d.n === b.day ? ' selected' : '') + '>' + d.corto + '</option>'; }).join('') + '</select></div>' +
      '<div><label class="f">Hora de inicio</label><input type="time" id="eb-start" value="' + esc(b.start) + '"></div></div>' +
      '<label class="f">Duración (min)</label><input type="number" id="eb-dur" min="5" step="5" value="' + C.blockDur(b) + '">';
    if (f && f.plan.fun) html += '<div class="small muted" style="margin-top:4px">' + esc(C.hoursTxt(f, b.day)) + '</div>';
    else if (f) html += '<div class="small muted" style="margin-top:4px">Horario ese día: ' + esc(C.hoursTxt(f, b.day)) + '</div>';
    html += '<label class="f">Para quién</label><div class="seg" id="eb-who">' + ['all', 'A', 'B'].map(function (w) { return '<button data-w="' + w + '" class="' + (b.who === w ? 'on' : '') + '">' + esc(ST.famName(w)) + '</button>'; }).join('') + '</div>';
    if (b.type !== 'fixed') html += '<label class="f">Estado</label><div class="seg" id="eb-st">' + [['plan', 'Pendiente'], ['done', 'Hecho']].map(function (x) { return '<button data-s="' + x[0] + '" class="' + ((b.status || 'plan') === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (f && f.reserva && f.reserva.tipo !== 'no' || (b.booking && b.booking.ok)) {
      var bk = b.booking || {};
      html += '<label class="toggle" style="margin-top:14px"><input type="checkbox" id="eb-ok" ' + (bk.ok ? 'checked' : '') + '> Reservado</label>' +
        '<input type="text" id="eb-info" placeholder="Datos de la reserva: hora, localizador, butacas…" value="' + esc(bk.info || '') + '">';
    }
    html += '<label class="f">Nota</label><textarea id="eb-note" placeholder="Opcional">' + esc(b.note || '') + '</textarea>';
    html += '<div class="actionbar"><button class="btn ghost" id="eb-del" style="color:var(--err)">Quitar del programa</button><button class="btn yellow" id="eb-save">Guardar</button></div>';
    openSheet(f ? 'Bloque del programa' : 'Bloque', html, function (el) {
      var who = b.who || 'all', st = b.status || 'plan';
      el.querySelectorAll('#eb-who button').forEach(function (x) { x.onclick = function () { who = x.dataset.w; el.querySelectorAll('#eb-who button').forEach(function (y) { y.classList.toggle('on', y === x); }); }; });
      el.querySelectorAll('#eb-st button').forEach(function (x) { x.onclick = function () { st = x.dataset.s; el.querySelectorAll('#eb-st button').forEach(function (y) { y.classList.toggle('on', y === x); }); }; });
      $('#eb-save', el).onclick = function () {
        var nb = Object.assign({}, b, {
          day: +$('#eb-day', el).value, start: $('#eb-start', el).value || b.start,
          dur: Math.max(5, +$('#eb-dur', el).value || C.blockDur(b)), who: who, status: st,
          note: $('#eb-note', el).value.trim()
        });
        if ($('#eb-title', el)) nb.title = $('#eb-title', el).value.trim() || 'Bloque';
        if ($('#eb-ok', el)) nb.booking = { ok: $('#eb-ok', el).checked, info: $('#eb-info', el).value.trim() };
        ST.putBlock(nb); closeSheet(); toast('Guardado');
      };
      $('#eb-del', el).onclick = function () {
        if (b.type === 'fixed' && !confirm('¿Quitar este bloque fijo?')) return;
        ST.delBlock(b.id); closeSheet(); toast('Quitado del programa');
      };
    });
  }
  function newFreeBlock(day) {
    var html = '<label class="f">Qué</label><input type="text" id="nb-t" placeholder="Descanso, compras, cena…">' +
      '<div class="filters"><div><label class="f">Hora</label><input type="time" id="nb-s" value="17:00"></div><div><label class="f">Duración (min)</label><input type="number" id="nb-d" value="60" step="5"></div></div>' +
      '<label class="f">Para quién</label><div class="seg" id="nb-w">' + ['all', 'A', 'B'].map(function (w) { return '<button data-w="' + w + '" class="' + (w === 'all' ? 'on' : '') + '">' + esc(ST.famName(w)) + '</button>'; }).join('') + '</div>' +
      '<label class="toggle"><input type="checkbox" id="nb-h"> Es en el hotel</label>' +
      '<div class="actionbar"><button class="btn yellow" id="nb-ok">Añadir al ' + DIAS[day - 1].corto + '</button></div>';
    openSheet('Bloque libre', html, function (el) {
      var who = 'all';
      el.querySelectorAll('#nb-w button').forEach(function (x) { x.onclick = function () { who = x.dataset.w; el.querySelectorAll('#nb-w button').forEach(function (y) { y.classList.toggle('on', y === x); }); }; });
      $('#nb-ok', el).onclick = function () {
        ST.putBlock({ day: day, start: $('#nb-s', el).value || '17:00', dur: +$('#nb-d', el).value || 60, type: 'free', title: $('#nb-t', el).value.trim() || 'Bloque libre', who: who, status: 'plan', place: $('#nb-h', el).checked ? 'hotel' : null });
        closeSheet(); toast('Añadido');
      };
    });
  }

  /* ---------- SUGERENCIAS ---------- */
  function renderSug() {
    var day = curDay();
    var aud = S.ui.sugFor || 'all';
    var lv = S.ui.nivel;
    var d = DIAS[day - 1];
    var html = header('Sugerencias', 'Itinerarios que evitan lo ya visto');
    html += '<main>' + dayChips(day, 'data-day');
    html += '<div class="seg" id="lv">' + window.NIVELES.map(function (n) { return '<button data-lv="' + n.id + '" class="' + (lv === n.id ? 'on' : '') + '">' + n.nombre + '</button>'; }).join('') + '</div>';
    html += '<div class="chips" style="margin-top:8px">' + ['all', 'A', 'B'].map(function (w) { return '<button class="chip ' + (aud === w ? 'on' : '') + '" data-aud="' + w + '">Para ' + esc(w === 'all' ? 'todos' : ST.famName(w)) + '</button>'; }).join('') + '</div>';
    var sugs = C.suggestionsFor(day, lv, ST.blocks(), aud, window.SUGERENCIAS);
    var existing = C.lineBlocks(ST.blocks(), day, aud).filter(function (b) { return b.type !== 'fixed'; });
    html += '<p class="small muted" style="margin:6px 0 4px">' + d.largo + (d.tipo === 'llegada' ? ' · llegada al hotel hacia las 21:00' : d.tipo === 'salida' ? ' · check-out a las 12:00 y salida al aeropuerto a las 18:00' : ' · de 9:00 a 23:00') +
      (existing.length ? ' · se respetan los ' + existing.length + ' bloques ya programados' : '') + '</p>';
    if (!sugs.length) html += '<div class="card empty"><div class="big">Sin sugerencias</div>Todo lo que proponíamos para este día ya está visto o programado. Prueba con otro nivel o elige en el banco.</div>';
    html += '<div class="list">';
    sugs.forEach(function (g, i) {
      html += '<div class="card scard"><h3>' + esc(g.tema.titulo) + '</h3><div class="sz">' + esc(g.tema.zona) + ' · ' + C.fmt(g.start) + '–' + C.fmt(g.end) + '</div><p class="sr">' + esc(g.tema.resumen) + '</p><ul class="stops">' +
        g.stops.map(function (s) {
          var f = s.n != null ? C.ficha(s.n) : null;
          return '<li><span class="st">' + C.fmt(s.start) + '</span><span class="sn">' + (f ? bullet(f) + '<a href="#" data-ficha="' + f.num + '">' + esc(f.nombre) + '</a>' + (f.clas === 'I' ? ' <span class="badge I">I</span>' : '') : '<b>' + esc(s.titulo) + '</b>') +
            '<small>' + (s.nota ? esc(s.nota) + ' · ' : '') + C.durTxt(s.dur) + (s.tr && s.tr.min ? ' · ' + modeTxt(s.tr) : '') + (s.sustituye ? ' · en lugar de ' + esc(C.ficha(s.sustituye).nombre) : '') + '</small></span></li>';
        }).join('') + '</ul>' +
        (g.dropped.length ? '<div class="dropped">Sin: ' + g.dropped.map(function (x) { return esc(C.ficha(x.n).nombre) + ' (' + esc(x.why) + ')'; }).join(' · ') + '</div>' : '') +
        '<div style="margin-top:12px"><button class="btn yellow full" data-confirm="' + i + '">' + I.check + ' Confirmar para el ' + d.corto + '</button></div></div>';
    });
    html += '</div></main>';
    $('#app').innerHTML = html;
    document.querySelectorAll('[data-lv]').forEach(function (b) { b.onclick = function () { ST.setUi({ nivel: b.dataset.lv }); }; });
    document.querySelectorAll('[data-aud]').forEach(function (b) { b.onclick = function () { ST.setUi({ sugFor: b.dataset.aud }); }; });
    document.querySelectorAll('[data-confirm]').forEach(function (b) {
      b.onclick = function () {
        var g = sugs[+b.dataset.confirm];
        var list = g.stops.map(function (s) {
          return s.n != null
            ? { day: day, n: s.n, start: C.fmt(s.start), dur: s.dur, who: aud, status: 'plan', type: 'place', note: s.nota || '' }
            : { day: day, start: C.fmt(s.start), dur: s.dur, who: aud, status: 'plan', type: 'free', title: s.titulo, place: s.libre === 'descanso' ? 'hotel' : s.libre === 'musical' ? 'teatros' : null };
        });
        ST.putBlocks(list);
        ST.setUi({ view: 'programa', day: day });
        toast('Añadido al ' + d.corto + ': ' + list.length + ' bloques');
      };
    });
  }

  /* ---------- BANCO ---------- */
  function renderBanco() {
    var b = S.ui.banco;
    var fam = myFam();
    var st = C.placeState(ST.blocks(), fam);
    var html = header('Lugares', '79 fichas · banco de opciones');
    html += '<main><div class="search"><input type="search" id="q" placeholder="Buscar: pizza, mirador, Brooklyn…" value="' + esc(b.q) + '"></div>';
    html += '<div class="chips" style="margin-top:8px">' + ['', 'I', 'B'].map(function (c) { return '<button class="chip ' + (b.clas === c ? 'on' : '') + '" data-clas="' + c + '">' + (c === '' ? 'Todas' : c === 'I' ? 'Imprescindibles' : 'Banco') + '</button>'; }).join('') +
      [['', 'Cualquier estado'], ['libre', 'Por hacer'], ['programado', 'Programadas'], ['hecho', 'Hechas']].map(function (x) { return '<button class="chip ' + (b.estado === x[0] ? 'on' : '') + '" data-est="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    html += '<div class="filters"><select id="cat"><option value="">Todas las categorías</option>' + CATS.map(function (c) { return '<option ' + (b.cat === c ? 'selected' : '') + '>' + c + '</option>'; }).join('') + '</select>' +
      '<select id="dia"><option value="">Cualquier día</option>' + DIAS.map(function (d) { return '<option value="' + d.n + '"' + (String(b.dia) === String(d.n) ? ' selected' : '') + '>Abierto el ' + d.corto + '</option>'; }).join('') + '</select></div>';
    var q = b.q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var res = F.filter(function (f) {
      if (b.clas && f.clas !== b.clas) return false;
      if (b.cat && f.categoria !== b.cat) return false;
      var e = st[f.num] ? st[f.num].estado : 'libre';
      if (b.estado && e !== b.estado) return false;
      if (b.dia) {
        var dd = +b.dia;
        if (f.plan.fun ? !C.funciones(f, dd).length : C.hoursOn(f, dd).closed) return false;
      }
      if (q) {
        var hay = (f.nombre + ' ' + f.subtitulo + ' ' + f.zona + ' ' + f.categoria + ' ' + strip(f.que_es.join(' '))).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (q.split(/\s+/).some(function (w) { return hay.indexOf(w) < 0; })) return false;
      }
      return true;
    });
    html += '<p class="small muted">' + res.length + ' de ' + F.length + '</p><div class="list">';
    res.forEach(function (f) { html += placeCard(f, st[f.num]); });
    html += '</div></main>';
    $('#app').innerHTML = html;
    var qi = $('#q');
    qi.oninput = function () { b.q = qi.value; clearTimeout(qi._t); qi._t = setTimeout(function () { ST.setUi({ banco: b }); setTimeout(function () { var x = $('#q'); if (x) { x.focus(); x.setSelectionRange(x.value.length, x.value.length); } }, 0); }, 250); };
    document.querySelectorAll('[data-clas]').forEach(function (x) { x.onclick = function () { b.clas = x.dataset.clas; ST.setUi({ banco: b }); }; });
    document.querySelectorAll('[data-est]').forEach(function (x) { x.onclick = function () { b.estado = x.dataset.est; ST.setUi({ banco: b }); }; });
    $('#cat').onchange = function (e) { b.cat = e.target.value; ST.setUi({ banco: b }); };
    $('#dia').onchange = function (e) { b.dia = e.target.value; ST.setUi({ banco: b }); };
  }
  function stateBadge(s) {
    if (!s) return '';
    return s.estado === 'hecho' ? '<span class="badge done">Hecho</span>' : '<span class="badge plan">' + DIAS[s.day - 1].corto + '</span>';
  }
  function placeCard(f, s, extra) {
    return '<div class="card pcard" data-ficha="' + f.num + '"><img loading="lazy" src="' + thumb(f) + '" alt=""><div class="pi"><div class="pn">' + bullet(f) + '<span>' + esc(f.nombre) + '</span></div>' +
      '<div class="pz">' + esc(f.categoria) + ' · ' + esc(f.zona) + '</div><div class="pt">' + (f.clas === 'I' ? '<span class="badge I">Imprescindible</span>' : '') + stateBadge(s) +
      f.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' + (extra || '') + '</div></div>';
  }

  /* ---------- FICHA ---------- */
  function openFicha(n) {
    var f = C.ficha(n);
    if (!f) return;
    var fam = myFam();
    var st = C.placeState(ST.blocks(), fam)[n];
    var cr = f.creditos || {};
    var h = '';
    if (f.fotos && f.fotos.hero) {
      var c = cr[f.fotos.hero];
      h += '<div class="hero"><img src="' + img(f.fotos.hero) + '" alt="' + esc(f.fotos.alt || '') + '">' + (c ? '<span class="cr">© ' + esc(c.autor) + ' · ' + esc(c.licencia) + '</span>' : '') + '</div>';
    }
    h += '<div class="kicker">' + bullet(f) + esc(f.categoria) + ' · ' + esc(f.zona) + (f.clas === 'I' ? ' <span class="badge I">Imprescindible</span>' : '') + '</div>';
    h += '<div class="fttl">' + esc(f.nombre) + '</div><p class="fsub">' + esc(f.subtitulo) + '</p>';
    h += '<div class="tags">' + f.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
    // estado en el programa
    var mine = ST.blocks().filter(function (b) { return b.n === n && b.status !== 'skip'; });
    if (mine.length) h += '<div class="card pad small" style="margin-bottom:10px">' + mine.map(function (b) {
      return '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:3px 0"><span><b>' + DIAS[b.day - 1].corto + ' ' + esc(b.start) + '</b> ' + whoChip(b.who) + ' ' + (b.status === 'done' ? '<span class="badge done">Hecho</span>' : '') +
        (b.booking && b.booking.ok ? '<br><span style="color:var(--book)">Reservado' + (b.booking.info ? ': ' + esc(b.booking.info) : '') + '</span>' : '') + '</span><button class="btn ghost small" data-goblock="' + b.id + '">Ver</button></div>';
    }).join('') + '</div>';
    h += '<div class="row-btns"><a class="btn maps" target="_blank" rel="noopener" href="' + C.mapsDir(f) + '">' + I.nav + ' Cómo llegar</a><a class="btn ghost" target="_blank" rel="noopener" href="' + C.mapsVer(f) + '">' + I.pin + ' Ver en mapa</a></div>';
    // horario en nuestros días
    h += '<div class="fsec"><h3>' + (f.plan.fun ? 'Funciones en nuestros días' : 'Horario en nuestros días') + '</h3><div class="hours7">' + DIAS.map(function (d) {
      var txt, closed;
      if (f.plan.fun) { var fs = C.funciones(f, d.n); closed = !fs.length; txt = closed ? '—' : fs.join('<br>'); }
      else { var hh = C.hoursOn(f, d.n); closed = hh.closed; txt = closed ? 'Cerrado' : (hh.open === 0 && hh.close >= 1440 ? '24 h' : C.fmt(hh.open) + '<br>' + C.fmt(hh.close)); }
      return '<div class="' + (closed ? 'closed' : '') + '"><b>' + d.corto + '</b>' + txt + '</div>';
    }).join('') + '</div><p class="small muted" style="margin-top:6px">Duración prevista: ' + C.durTxt(f.plan.dur) + ' · desde el hotel ' + modeTxt(C.travel({ place: 'hotel' }, { n: n })) + '</p></div>';
    h += '<div class="fsec"><h3>De qué se trata</h3>' + f.que_es.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>';
    h += '<div class="fsec"><h3>En la práctica</h3><dl class="prac">' + f.practica.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + (r[2] ? '<small>' + r[2] + '</small>' : '') + '</dd>'; }).join('') + '</dl></div>';
    (f.secciones || []).forEach(function (s) {
      h += '<div class="fsec"><h3>' + esc(s.titulo) + '</h3>';
      if (s.tipo === 'route') h += '<ol class="route">' + s.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>';
      else if (s.tipo === 'table') h += '<table class="t"><tr>' + s.cab.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr>' + s.filas.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>' + (s.nota ? '<p class="small muted">' + s.nota + '</p>' : '');
      else h += s.items.map(function (x) { return '<p>' + x + '</p>'; }).join('');
      h += '</div>';
    });
    if (f.empresas) {
      h += '<div class="fsec"><h3>Empresas</h3>' + f.empresas.map(function (e) {
        return '<div class="card empresa"><h4>' + esc(e.nombre) + (e.rec ? ' <span class="badge done">Recomendada</span>' : '') + '</h4><dl class="prac">' + e.filas.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>' +
          (e.enlace ? '<a class="btn ghost small" style="margin-top:8px" target="_blank" rel="noopener" href="' + esc(e.enlace[1]) + '">' + esc(e.enlace[0]) + ' ↗</a>' : '') + '</div>';
      }).join('') + (f.empresas_nota ? '<p class="small muted">' + f.empresas_nota + '</p>' : '') + '</div>';
    }
    if (f.aviso && f.aviso.length) h += '<div class="fsec"><div class="avisobox">' + f.aviso.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div></div>';
    var r = f.reserva;
    if (r && (r.tipo !== 'no' || (r.enlaces && r.enlaces.length))) {
      var ef = mine.filter(function (b) { return b.booking && b.booking.ok; });
      h += '<div class="fsec"><h3>Reserva</h3><div class="resbox"><b>' + (r.tipo === 'no' ? 'Sin reserva' : r.tipo === 'fecha' ? 'Con fecha' : 'Con fecha y hora') + '</b>' +
        (r.dias ? ' · días ' + r.dias.map(function (x) { return DIAS[x - 1].corto; }).join(', ') : '') + (r.nota ? '<div class="small">' + esc(r.nota) + '</div>' : '') +
        (ef.length ? '<div style="margin-top:6px;font-weight:700">Reservado: ' + ef.map(function (b) { return DIAS[b.day - 1].corto + ' ' + esc(b.start) + (b.booking.info ? ' · ' + esc(b.booking.info) : ''); }).join(' / ') + '</div>' : '') +
        (r.enlaces || []).map(function (l) { return '<a class="lnk" target="_blank" rel="noopener" href="' + esc(l[1]) + '"><span>' + esc(l[0]) + '</span><span>↗</span></a>'; }).join('') + '</div></div>';
    }
    if (f.valoraciones) {
      var v = f.valoraciones;
      h += '<div class="fsec"><h3>Valoraciones · ' + esc(v.fuente) + '</h3><div style="display:flex;gap:10px;align-items:baseline;margin-bottom:6px"><span class="score">' + String(v.nota).replace('.', ',') + '</span><span class="muted small">' + Number(v.num).toLocaleString('es-ES') + ' reseñas</span></div>' +
        '<div class="vals"><div class="pos"><h4>A favor</h4><ul>' + v.pos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div class="neg"><h4>En contra</h4><ul>' + v.neg.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div></div>';
    }
    if (f.combina && f.combina.length) h += '<div class="fsec"><h3>Combina con</h3><div class="links">' + f.combina.map(function (x) { var g = C.ficha(x); return g ? '<button data-ficha="' + x + '">' + bullet(g) + esc(g.nombre) + '</button>' : ''; }).join('') + '</div></div>';
    if (f.excluye && f.excluye.length) h += '<div class="fsec"><h3>Excluyente con</h3><div class="links">' + f.excluye.map(function (x) { var g = C.ficha(x); return g ? '<button data-ficha="' + x + '">' + bullet(g) + esc(g.nombre) + '</button>' : ''; }).join('') + '</div>' + (f.excluye_nota ? '<p class="small muted">' + esc(f.excluye_nota) + '</p>' : '') + '</div>';
    if (f.fotos && f.fotos.gal && f.fotos.gal.length) {
      h += '<div class="fsec"><h3>Galería</h3><div class="gal">' + f.fotos.gal.map(function (g) {
        var c = cr[g[0]];
        return '<figure><img loading="lazy" src="' + img(g[0]) + '" alt=""><figcaption>' + esc(g[1]) + (c ? '<br>© ' + esc(c.autor) + ' · ' + esc(c.licencia) : '') + '</figcaption></figure>';
      }).join('') + '</div></div>';
    }
    h += '<p class="small muted" style="margin-top:16px">Ficha ' + f.num + ' de 79</p>';
    h += '<div class="actionbar"><button class="btn yellow" data-add="' + n + '">' + I.plus + ' Añadir al programa</button></div>';
    openSheet('', h);
  }

  /* añadir una ficha a un día */
  function addPlace(n, presetDay) {
    var f = C.ficha(n);
    var fam = myFam();
    var day = presetDay || (S.ui.view === 'programa' ? curDay() : null) || curDay();
    var who = 'all';
    var start = null, nogap = false;
    function compute() {
      var s = C.suggestStart(ST.blocks(), day, who === 'all' ? fam : who, n);
      nogap = s == null;
      start = s != null ? C.fmt(s) : (f.plan.fun ? (C.funciones(f, day)[0] || '19:00') : (C.hoursOn(f, day).closed ? '10:00' : C.fmt(Math.max(C.hoursOn(f, day).open, 600))));
    }
    compute();
    var html = '<div class="kicker">' + bullet(f) + esc(f.categoria) + '</div><div class="fttl" style="font-size:21px">' + esc(f.nombre) + '</div>' +
      '<label class="f">Día</label><div class="chips" id="ad-days"></div>' +
      '<div id="ad-hours" class="small muted"></div>' +
      '<div class="filters"><div><label class="f">Hora</label><input type="time" id="ad-start"></div><div><label class="f">Duración (min)</label><input type="number" id="ad-dur" step="5" value="' + f.plan.dur + '"></div></div>' +
      '<label class="f">Para quién</label><div class="seg" id="ad-who">' + ['all', 'A', 'B'].map(function (w) { return '<button data-w="' + w + '" class="' + (w === who ? 'on' : '') + '">' + esc(ST.famName(w)) + '</button>'; }).join('') + '</div>' +
      '<div id="ad-warn" class="warns" style="margin-top:12px"></div>' +
      '<div class="actionbar"><button class="btn yellow" id="ad-ok">' + I.plus + ' Añadir</button></div>';
    openSheet('Añadir al programa', html, function (el) {
      function draw() {
        $('#ad-days', el).innerHTML = DIAS.map(function (d) {
          var closed = f.plan.fun ? !C.funciones(f, d.n).length : C.hoursOn(f, d.n).closed;
          return '<button class="chip ' + (d.n === day ? 'on' : '') + '" data-d="' + d.n + '"' + (closed ? ' style="opacity:.45;text-decoration:line-through"' : '') + '>' + d.corto + '</button>';
        }).join('');
        el.querySelectorAll('#ad-days [data-d]').forEach(function (x) { x.onclick = function () { day = +x.dataset.d; compute(); $('#ad-start', el).value = start; draw(); }; });
        $('#ad-hours', el).textContent = C.hoursTxt(f, day) + (C.notaDia(f, day) ? ' · ' + C.notaDia(f, day) : '');
        preview();
      }
      function tmp() { return { id: '__tmp', day: day, n: n, start: $('#ad-start', el).value, dur: +$('#ad-dur', el).value || f.plan.dur, who: who, status: 'plan', type: 'place' }; }
      function preview() {
        var t = tmp();
        var an = C.analyzeDay(ST.blocks().concat([t]), day, who === 'all' ? fam : who);
        var ws = (an.byId.__tmp || []).filter(function (w) { return !w.reserva; });
        if (nogap && !(f.plan.fun ? !C.funciones(f, day).length : C.hoursOn(f, day).closed)) ws.unshift({ nivel: 'warn', txt: 'No hay un hueco libre con tiempo suficiente este día: ajusta la hora o mueve otros bloques' });
        $('#ad-warn', el).innerHTML = ws.length ? ws.map(function (w) { return '<div class="warn w-' + w.nivel + '">' + esc(w.txt) + '</div>'; }).join('') : '<div class="warn w-ok">Encaja en el programa del ' + DIAS[day - 1].corto + '</div>';
      }
      $('#ad-start', el).value = start;
      $('#ad-start', el).oninput = preview; $('#ad-dur', el).oninput = preview;
      el.querySelectorAll('#ad-who button').forEach(function (x) { x.onclick = function () { who = x.dataset.w; el.querySelectorAll('#ad-who button').forEach(function (y) { y.classList.toggle('on', y === x); }); preview(); }; });
      draw();
      $('#ad-ok', el).onclick = function () {
        var t = tmp(); delete t.id;
        ST.putBlock(t);
        closeAllSheets();
        ST.setUi({ view: 'programa', day: day });
        toast('Añadido al ' + DIAS[day - 1].corto + ' a las ' + t.start);
      };
    });
  }

  /* ---------- AHORA ---------- */
  var here = null, hereName = 'el hotel';
  function renderAhora() {
    var fam = myFam();
    var ny = C.nyNow();
    var live = !!ny.dia;
    var day = live ? ny.dia : (S.ui.simDay || 2);
    var now = live ? ny.min : C.toMin(S.ui.simTime || '10:00');
    var from = here;
    if (!from) {
      var prev = null;
      C.lineBlocks(ST.blocks(), day, fam).forEach(function (b) { if (C.blockStart(b) <= now) prev = b; });
      from = prev ? (C.locOf(prev) || C.TRIP.hotel) : C.TRIP.hotel;
      hereName = prev ? '«' + C.blockTitle(prev) + '»' : 'el hotel';
    }
    var res = C.nowOptions(ST.blocks(), day, fam, now, from);
    var filt = S.ui.ahoraF || '';
    var opts = res.opciones.filter(function (o) {
      if (filt === 'comer') return !!o.meal;
      if (filt === 'cerca') return o.tr.min <= 15;
      if (filt === 'I') return C.ficha(o.n).clas === 'I';
      return true;
    });
    var html = header('Ahora', live ? 'Hora de Nueva York' : 'Simulación (el viaje aún no ha empezado)');
    html += '<main>';
    if (live) html += '<div class="clock">' + C.fmt(now) + '</div><div class="muted">' + DIAS[day - 1].largo + '</div>';
    else html += '<div class="filters"><select id="simDay">' + DIAS.map(function (d) { return '<option value="' + d.n + '"' + (d.n === day ? ' selected' : '') + '>' + d.corto + '</option>'; }).join('') + '</select><input type="time" id="simTime" value="' + C.fmt(now) + '"></div>';
    html += '<p class="small" style="margin:8px 0">Desde ' + esc(hereName) + ' · <a href="#" id="gps">usar mi ubicación</a>' + (here ? ' · <a href="#" id="nogps">volver al programa</a>' : '') + '</p>';
    var left = res.limit - now;
    var cur = null;
    C.lineBlocks(ST.blocks(), day, fam).forEach(function (b) { if (C.blockStart(b) <= now && C.blockEnd(b) > now) cur = b; });
    if (cur) html += '<div class="card pad small" style="margin-bottom:8px">Ahora mismo: <b>' + esc(C.blockTitle(cur)) + '</b> hasta las ' + C.fmt(C.blockEnd(cur)) + '</div>';
    html += '<div class="card nextbox"><div><div class="small muted">' + (res.next ? 'Siguiente en el programa' : 'Sin nada más programado') + '</div><b>' + (res.next ? C.fmt(C.blockStart(res.next)) + ' · ' + esc(C.blockTitle(res.next)) : 'Hasta las 23:00') + '</b></div><div style="text-align:right"><div class="small muted">Tiempo libre</div><b>' + (left > 0 ? C.durTxt(left) : '—') + '</b></div></div>';
    html += '<div class="chips" style="margin-top:12px">' + [['', 'Todo'], ['cerca', 'Cerca (≤15 min)'], ['comer', 'Comer'], ['I', 'Imprescindibles']].map(function (x) { return '<button class="chip ' + (filt === x[0] ? 'on' : '') + '" data-af="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (!opts.length) html += '<div class="card empty"><div class="big">Nada encaja ahora</div>Con el tiempo libre y los horarios de este momento no hay opciones de este tipo.</div>';
    html += '<div class="list">';
    opts.slice(0, 30).forEach(function (o) {
      var f = C.ficha(o.n);
      var extra = '<div class="small" style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' + modeIcon(o.tr.modo).replace('<svg', '<svg width="14" height="14"') + ' ' + modeTxt(o.tr) + ' · ' + C.fmt(o.start) + '–' + C.fmt(o.end) +
        (o.meal ? ' · <b>' + o.meal + '</b>' : '') + (o.cabe ? '' : ' · <span style="color:var(--warn)">solo una visita corta</span>') + '</div>' +
        '<div class="acts" style="display:flex;gap:6px;margin-top:8px"><button class="btn yellow small" data-now="' + o.n + '" data-s="' + C.fmt(o.start) + '" data-stop>' + I.plus + ' Añadir ahora</button><a class="btn maps small" target="_blank" rel="noopener" data-stop href="' + C.mapsDir(f) + '">' + I.nav + ' Ir</a></div>';
      html += placeCard(f, null, extra);
    });
    html += '</div></main>';
    $('#app').innerHTML = html;
    document.querySelectorAll('[data-af]').forEach(function (b) { b.onclick = function () { ST.setUi({ ahoraF: b.dataset.af }); }; });
    if ($('#simDay')) { $('#simDay').onchange = function (e) { ST.setUi({ simDay: +e.target.value }); }; $('#simTime').onchange = function (e) { ST.setUi({ simTime: e.target.value }); }; }
    $('#gps').onclick = function (e) {
      e.preventDefault();
      if (!navigator.geolocation) { toast('Este móvil no da la ubicación'); return; }
      navigator.geolocation.getCurrentPosition(function (p) { here = { lat: p.coords.latitude, lng: p.coords.longitude }; hereName = 'tu ubicación'; render(); },
        function () { toast('No se pudo obtener la ubicación'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    };
    if ($('#nogps')) $('#nogps').onclick = function (e) { e.preventDefault(); here = null; render(); };
    document.querySelectorAll('[data-now]').forEach(function (b) {
      b.onclick = function () {
        var n = +b.dataset.now;
        ST.putBlock({ day: day, n: n, start: b.dataset.s, dur: C.ficha(n).plan.dur, who: fam, status: 'plan', type: 'place' });
        toast('Añadido al programa de ' + ST.famName(fam) + ' a las ' + b.dataset.s);
      };
    });
  }

  /* ---------- VIAJE ---------- */
  function renderViaje() {
    var h = C.TRIP.hotel;
    var html = header('Viaje', 'Datos generales');
    html += '<main>';
    html += '<h2 class="sec">Hotel</h2><div class="card pad"><b>' + esc(h.nombre) + '</b><div class="muted small">' + esc(h.direccion) + '</div><div class="small" style="margin-top:6px">Check-in desde las 15:00 · check-out hasta las 12:00</div>' +
      '<div class="row-btns" style="margin-top:10px"><a class="btn maps small" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(h.nombre + ', ' + h.direccion) + '&travelmode=transit">' + I.nav + ' Volver al hotel</a></div></div>';
    html += '<h2 class="sec">Vuelos</h2><div class="card pad small"><dl class="kv"><dt>Ida · vie 1</dt><dd>Málaga 11:55 → Múnich → Newark 19:05</dd><dt>Vuelta · jue 7</dt><dd>Newark 22:00 → Zúrich → Málaga 15:30 (vie 8)</dd></dl><p class="muted" style="margin:8px 0 0">Horarios del grupo que viaja con Voyage Privé. La otra familia puede ajustar sus bloques fijos en el Programa.</p></div>';
    // reservas
    var need = [];
    ST.blocks().forEach(function (b) {
      var f = b.n != null && C.ficha(b.n);
      if (!f || !f.reserva || f.reserva.tipo === 'no' || b.status === 'skip') return;
      need.push({ b: b, f: f });
    });
    need.sort(function (x, y) { return x.b.day - y.b.day || C.blockStart(x.b) - C.blockStart(y.b); });
    html += '<h2 class="sec">Reservas del programa</h2>';
    if (!need.length) html += '<div class="card pad small muted">Aún no hay nada programado que necesite reserva.</div>';
    else html += '<div class="list">' + need.map(function (x) {
      var ok = x.b.booking && x.b.booking.ok;
      return '<div class="card pcard" data-block="' + x.b.id + '"><div class="pi"><div class="pn">' + bullet(x.f) + '<span>' + esc(x.f.nombre) + '</span></div><div class="pz">' + DIAS[x.b.day - 1].corto + ' ' + esc(x.b.start) + ' ' + whoChip(x.b.who) + '</div>' +
        '<div class="pt">' + (ok ? '<span class="badge done">Reservado</span>' + (x.b.booking.info ? '<span>' + esc(x.b.booking.info) + '</span>' : '') : '<span class="badge I">Pendiente</span><span>' + esc(x.f.reserva.nota || '') + '</span>') + '</div></div></div>';
    }).join('') + '</div>';
    // grupo
    html += '<h2 class="sec">Grupo</h2><div class="card pad">';
    var mem = Object.keys(S.members).map(function (k) { return S.members[k]; });
    ['A', 'B'].forEach(function (fm) {
      var names = mem.filter(function (m) { return m.fam === fm; }).map(function (m) { return esc(m.name); });
      html += '<div style="margin-bottom:6px"><span class="who ' + fm + '">' + esc(ST.famName(fm)) + '</span> ' + (names.join(', ') || '<span class="muted small">nadie conectado aún</span>') + '</div>';
    });
    html += '<div class="small muted">Tú: ' + esc(S.me.name) + ' · ' + esc(ST.famName(S.me.fam)) + ' · <a href="#" id="perfil">cambiar</a></div>';
    var api = window.SYNC_API;
    if (api && api.enabled() && api.tripId()) {
      html += '<div class="row-btns" style="margin-top:12px"><button class="btn yellow" id="invitar">' + I.share + ' Invitar al grupo</button></div>';
    } else if (S.tripId === 'local') {
      html += '<p class="small" style="margin:10px 0 0">El programa está solo en este móvil.' + (api && api.enabled() ? ' <a href="#" id="subir">Subirlo a la nube e invitar al grupo</a>' : ' La sincronización se activará cuando esté configurada.') + '</p>';
    }
    html += '<div class="small muted" style="margin-top:8px">Sincronización: ' + esc({ online: 'conectada', offline: 'sin conexión (los cambios se guardan y se suben al volver)', connecting: 'conectando…', off: 'desactivada', notrip: 'sin viaje', notfound: 'viaje no encontrado', error: 'error' }[S.sync.status] || S.sync.status) + (S.sync.error ? ' · ' + esc(S.sync.error) : '') + '</div></div>';
    html += '<h2 class="sec">Sin conexión</h2><div class="card pad small"><p style="margin:0 0 8px">Las fichas y el programa funcionan sin conexión. Las fotos se guardan al verlas; para tenerlas todas, descárgalas antes del viaje con wifi (≈9 MB).</p><button class="btn ghost small" id="fotos">Descargar todas las fotos</button> <span id="fotosSt" class="muted"></span>' +
      '<p class="muted" style="margin:10px 0 0">Los tiempos de traslado son estimaciones por distancia; para el recorrido exacto, «Cómo llegar» abre Google Maps.</p></div>';
    html += '<h2 class="sec">Créditos</h2><div class="card pad small muted">Fotos de Wikimedia Commons con licencia libre; autor y licencia en cada ficha. Datos de horarios y precios consultados en octubre de 2026.</div>';
    html += '</main>';
    $('#app').innerHTML = html;
    $('#perfil').onclick = function (e) { e.preventDefault(); ST.S.me = null; ST.emit(); };
    if ($('#invitar')) $('#invitar').onclick = function () {
      var url = api.inviteUrl();
      var txt = 'App del viaje a Nueva York: ábrela con este enlace y añádela a la pantalla de inicio';
      if (navigator.share) navigator.share({ title: 'Nueva York 2027', text: txt, url: url }).catch(function () {});
      else { navigator.clipboard.writeText(url).then(function () { toast('Enlace copiado'); }); }
    };
    if ($('#subir')) $('#subir').onclick = function (e) { e.preventDefault(); api.create(S.trip.fam).then(function () { toast('Viaje subido a la nube'); }).catch(function (er) { toast('Error: ' + (er.code || er.message)); }); };
    $('#fotos').onclick = function () { downloadPhotos($('#fotosSt')); };
  }
  function downloadPhotos(el) {
    if (!('caches' in window)) { el.textContent = 'No disponible en este navegador'; return; }
    var urls = [];
    F.forEach(function (f) {
      if (!f.fotos) return;
      if (f.fotos.hero) { urls.push(img(f.fotos.hero)); urls.push(thumb(f)); }
      (f.fotos.gal || []).forEach(function (g) { urls.push(img(g[0])); });
    });
    var done = 0;
    caches.open('nyc27-img').then(function (c) {
      var i = 0;
      function next() {
        if (i >= urls.length) { el.textContent = 'Listo: ' + done + ' fotos guardadas'; return; }
        var u = urls[i++];
        c.match(u).then(function (m) { return m || fetch(u).then(function (r) { if (r.ok) return c.put(u, r); }); })
          .then(function () { done++; el.textContent = done + ' / ' + urls.length; next(); }, next);
      }
      for (var k = 0; k < 4; k++) next();
    });
  }

  /* ---------- delegación de eventos ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var stop = t.closest('[data-stop]');
    var x;
    if ((x = t.closest('[data-ficha]'))) { ev.preventDefault(); openFicha(+x.getAttribute('data-ficha')); return; }
    if ((x = t.closest('[data-add]'))) { addPlace(+x.getAttribute('data-add')); return; }
    if ((x = t.closest('[data-done]'))) {
      var b = S.blocks[x.getAttribute('data-done')];
      if (b) { ST.putBlock(Object.assign({}, b, { status: b.status === 'done' ? 'plan' : 'done' })); toast(b.status === 'done' ? 'Marcado como pendiente' : 'Marcado como hecho'); }
      return;
    }
    if (stop) return;
    if ((x = t.closest('[data-goblock]'))) { var bb = S.blocks[x.getAttribute('data-goblock')]; closeAllSheets(); ST.setUi({ view: 'programa', day: bb.day }); return; }
    if ((x = t.closest('[data-block]'))) { editBlock(x.getAttribute('data-block')); return; }
    if ((x = t.closest('[data-day]'))) { ST.setUi({ day: +x.getAttribute('data-day') }); return; }
    if ((x = t.closest('[data-go]'))) {
      var go = x.getAttribute('data-go');
      if (go === 'sug') ST.setUi({ view: 'sugerencias' });
      if (go === 'banco') ST.setUi({ view: 'banco' });
      window.scrollTo(0, 0);
      return;
    }
    if ((x = t.closest('[data-act="libre"]'))) { newFreeBlock(curDay()); return; }
  });

  /* ---------- render ---------- */
  function render() {
    var y = window.scrollY;
    var sameView = render._last === S.ui.view + '|' + curDay();
    if (!S.trip || !S.me) { $('#tabs').classList.add('hidden'); renderWelcome(); return; }
    $('#tabs').classList.remove('hidden');
    renderTabs();
    ({ programa: renderPrograma, sugerencias: renderSug, banco: renderBanco, ahora: renderAhora, viaje: renderViaje }[S.ui.view] || renderPrograma)();
    if (sameView) window.scrollTo(0, y);
    render._last = S.ui.view + '|' + curDay();
  }
  ST.on(render);
  render();
  // refresco de «Ahora» cada minuto
  setInterval(function () { if (S.ui.view === 'ahora' && !sheetStack.length) render(); }, 60000);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
