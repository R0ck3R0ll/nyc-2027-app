/* Estado de la app y persistencia.
   - Siempre se guarda una copia en el móvil (localStorage) para abrir al instante y sin conexión.
   - sync.js conecta con Firestore (que también funciona sin conexión y sube los cambios al recuperarla).
   - Cada cambio en el programa genera un aviso para las personas a las que afecta. */
(function () {
  'use strict';
  var KEY = 'nyc27.v1';
  var listeners = [];

  function uid(prefix) {
    var a = new Uint8Array(10);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return (prefix || '') + Array.prototype.map.call(a, function (x) { return ('0' + x.toString(36)).slice(-2); }).join('').slice(0, 14);
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  var saved = load();

  var S = {
    tripId: saved.tripId || null,       // id del viaje en la nube
    trip: saved.trip || null,           // { nombre }
    me: saved.me || null,               // { name, fam }
    blocks: saved.blocks || {},         // id -> bloque
    members: saved.members || {},       // uid -> { name, fam }
    claims: saved.claims || {},         // nombre normalizado -> { uid, name }
    notifs: saved.notifs || [],         // avisos de cambios (los últimos)
    ui: Object.assign({ view: 'programa', day: null, showOther: false, nivel: 'equilibrado', sugMine: false, seenAt: 0,
                        banco: { q: '', cat: '', clas: '', estado: '', dia: '' } }, saved.ui || {}),
    sync: { status: 'off', error: '' }
  };
  // perfiles de versiones anteriores: solo valen los nombres de la lista
  if (S.me && window.CORE) {
    var pp = window.CORE.persona(S.me.name);
    S.me = pp ? { name: pp.nombre, fam: pp.fam } : null;
  }

  var saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify({ tripId: S.tripId, trip: S.trip, me: S.me, blocks: S.blocks, members: S.members,
          claims: S.claims, notifs: S.notifs.slice(0, 60), ui: S.ui }));
      } catch (e) { /* almacenamiento lleno o bloqueado: la nube sigue funcionando */ }
    }, 150);
  }

  var emitTimer = null;
  function emit() {
    persist();
    clearTimeout(emitTimer);
    emitTimer = setTimeout(function () { listeners.forEach(function (fn) { try { fn(S); } catch (e) { console.error(e); } }); }, 0);
  }

  function backend() { return window.SYNC_API && window.SYNC_API.ready() ? window.SYNC_API : null; }

  /* ---- avisos ---- */
  var C = function () { return window.CORE; };
  function desc(b) {
    var d = C().TRIP.dias[b.day - 1];
    return '«' + C().blockTitle(b) + '» el ' + (d ? d.corto : '') + ' a las ' + b.start;
  }
  function notify(who, txt, b) {
    if (!S.me) return;
    var n = { id: uid('n'), at: Date.now(), by: S.me.name, byFam: S.me.fam, who: who, txt: txt, day: b ? b.day : null, blockId: b ? b.id : null };
    S.notifs.unshift(n);
    var be = backend(); if (be) be.addNotif(n);
  }
  function scopeTxt(who) {
    if (who === 'all') return ' (todo el grupo)';
    return S.me && who === S.me.fam ? ' (solo su familia)' : '';
  }
  function changeTxt(a, b) {
    var ch = [];
    if (a.day !== b.day) ch.push('pasa al ' + C().TRIP.dias[b.day - 1].corto);
    if (a.start !== b.start) ch.push('hora ' + a.start + ' → ' + b.start);
    if (C().blockDur(a) !== C().blockDur(b)) ch.push('duración ' + C().durTxt(C().blockDur(b)));
    if ((a.status || 'plan') !== (b.status || 'plan')) ch.push(b.status === 'done' ? 'hecho' : 'vuelve a pendiente');
    if (!!(a.booking && a.booking.ok) !== !!(b.booking && b.booking.ok) || (a.booking && b.booking && a.booking.info !== b.booking.info)) ch.push(b.booking && b.booking.ok ? 'reservado' + (b.booking.info ? ': ' + b.booking.info : '') : 'reserva anulada');
    if ((a.note || '') !== (b.note || '')) ch.push('nota: ' + (b.note || '—'));
    if ((a.title || '') !== (b.title || '') && b.title) ch.push('ahora «' + b.title + '»');
    return ch.join(' · ');
  }

  var STORE = {
    S: S,
    uid: uid,
    on: function (fn) { listeners.push(fn); },
    emit: emit,
    blocks: function () { return Object.keys(S.blocks).map(function (k) { return S.blocks[k]; }); },
    // Etiquetas relativas: la familia no se nombra en la app
    famName: function (f) {
      if (f === 'all') return 'Todo el grupo';
      return S.me && f === S.me.fam ? 'Mi familia' : 'Otra familia';
    },
    otherFam: function () { return S.me && S.me.fam === 'A' ? 'B' : 'A'; },
    canEdit: function (b) { return !!S.me && window.CORE.covers(b.who, S.me.fam); },

    // Escrituras sin aviso (uso interno)
    _put: function (b) {
      b = Object.assign({}, b);
      if (!b.id) b.id = uid('b');
      b.by = (S.me && S.me.name) || '';
      b.at = Date.now();
      S.blocks[b.id] = b;
      var be = backend(); if (be) be.putBlock(b);
      return b;
    },
    _del: function (id) { delete S.blocks[id]; var be = backend(); if (be) be.delBlock(id); },

    /* Operaciones del programa (con aviso a los afectados) */
    addBlocks: function (list, who, intro) {
      var out = list.map(function (b) { return STORE._put(Object.assign({}, b, { who: who })); });
      if (out.length === 1) notify(who, 'ha añadido ' + desc(out[0]) + scopeTxt(who), out[0]);
      else if (out.length) notify(who, (intro || 'ha añadido ' + out.length + ' planes') + ' el ' + C().TRIP.dias[out[0].day - 1].corto + scopeTxt(who), out[0]);
      emit();
      return out;
    },
    // Cambia un bloque. scope: 'all' (el cambio vale para todos los del bloque) o 'mine' (solo mi familia)
    updateBlock: function (orig, changed, scope) {
      var me = S.me.fam, other = STORE.otherFam();
      var ch = changeTxt(orig, changed);
      if (orig.who === 'all' && scope === 'mine') {
        // el bloque original se queda para la otra familia y se crea una copia cambiada para la mía
        STORE._put(Object.assign({}, orig, { who: other }));
        var copy = Object.assign({}, changed, { id: null, who: me });
        var nb = STORE._put(copy);
        notify('all', 'ha cambiado ' + desc(orig) + ' solo para su familia' + (ch ? ': ' + ch : ''), nb);
      } else {
        var b = STORE._put(changed);
        if (ch) notify(b.who, 'ha cambiado ' + desc(orig) + ': ' + ch + scopeTxt(b.who), b);
      }
      emit();
    },
    removeBlock: function (orig, scope) {
      if (orig.who === 'all' && scope === 'mine') {
        STORE._put(Object.assign({}, orig, { who: STORE.otherFam() }));
        notify('all', 'ha quitado ' + desc(orig) + ' solo para su familia', orig);
      } else {
        STORE._del(orig.id);
        notify(orig.who, 'ha quitado ' + desc(orig) + scopeTxt(orig.who), orig);
      }
      emit();
    },

    setUi: function (patch) { Object.assign(S.ui, patch); emit(); },
    setMe: function (me) { S.me = me; emit(); },
    unseen: function () {
      if (!S.me) return [];
      return S.notifs.filter(function (n) {
        return n.at > (S.ui.seenAt || 0) && n.by !== S.me.name && window.CORE.covers(n.who, S.me.fam);
      });
    },
    mine: function () {
      if (!S.me) return [];
      return S.notifs.filter(function (n) { return window.CORE.covers(n.who, S.me.fam); });
    },
    // Llamadas desde sync.js con los datos que llegan de la nube
    applyRemote: function (patch) {
      ['trip', 'blocks', 'members', 'claims', 'notifs', 'tripId'].forEach(function (k) { if (patch[k] !== undefined) S[k] = patch[k]; });
      emit();
    },
    setSync: function (st) { S.sync = Object.assign({}, S.sync, st); emit(); },
    resetAll: function () { localStorage.removeItem(KEY); location.href = location.pathname; }
  };
  window.STORE = STORE;
})();
