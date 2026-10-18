/* Estado de la app y persistencia.
   - Siempre se guarda una copia en el móvil (localStorage) para abrir al instante y sin conexión.
   - Si Firebase está configurado y hay viaje en la nube, sync.js conecta y los cambios van a Firestore
     (que también funciona sin conexión y sube los cambios al recuperarla). */
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
    tripId: saved.tripId || null,       // id del viaje en la nube (o 'local')
    trip: saved.trip || null,           // { nombre, fam: { A, B } }
    me: saved.me || null,               // { name, fam }
    blocks: saved.blocks || {},         // id -> bloque
    members: saved.members || {},       // uid -> { name, fam }
    ui: Object.assign({ view: 'programa', day: null, showOther: false, nivel: 'equilibrado', sugFor: null,
                        banco: { q: '', cat: '', clas: '', estado: '', dia: '' } }, saved.ui || {}),
    sync: { status: 'off', error: '' }  // estado de la sincronización (no se guarda)
  };

  var saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify({ tripId: S.tripId, trip: S.trip, me: S.me, blocks: S.blocks, members: S.members, ui: S.ui }));
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

  var STORE = {
    S: S,
    uid: uid,
    on: function (fn) { listeners.push(fn); },
    emit: emit,
    blocks: function () { return Object.keys(S.blocks).map(function (k) { return S.blocks[k]; }); },
    famName: function (f) {
      if (f === 'all') return 'Todos';
      return (S.trip && S.trip.fam && S.trip.fam[f]) || ('Familia ' + f);
    },
    otherFam: function () { return S.me && S.me.fam === 'A' ? 'B' : 'A'; },
    putBlock: function (b) {
      b = Object.assign({}, b);
      if (!b.id) b.id = uid('b');
      b.by = (S.me && S.me.name) || '';
      b.at = Date.now();
      S.blocks[b.id] = b;
      emit();
      var be = backend(); if (be) be.putBlock(b);
      return b;
    },
    putBlocks: function (list) {
      var me = (S.me && S.me.name) || '';
      list = list.map(function (b) { b = Object.assign({}, b); if (!b.id) b.id = uid('b'); b.by = me; b.at = Date.now(); S.blocks[b.id] = b; return b; });
      emit();
      var be = backend(); if (be) be.putBlocks(list);
      return list;
    },
    delBlock: function (id) {
      delete S.blocks[id];
      emit();
      var be = backend(); if (be) be.delBlock(id);
    },
    setUi: function (patch) { Object.assign(S.ui, patch); emit(); },
    setMe: function (me) {
      S.me = me; emit();
      var be = backend(); if (be) be.putMember(me);
    },
    setTrip: function (trip) {
      S.trip = Object.assign({}, S.trip || {}, trip); emit();
      var be = backend(); if (be) be.putTrip(S.trip);
    },
    // Viaje solo en este móvil (sin Firebase): se crea con los bloques fijos
    createLocal: function (fam) {
      S.tripId = 'local';
      S.trip = { nombre: CORE.TRIP.nombre, fam: fam };
      S.blocks = {};
      CORE.TRIP.fijos.forEach(function (b) { S.blocks[b.id] = Object.assign({ status: 'plan' }, b); });
      emit();
    },
    // Llamadas desde sync.js con los datos que llegan de la nube
    applyRemote: function (patch) {
      if (patch.trip) S.trip = patch.trip;
      if (patch.blocks) S.blocks = patch.blocks;
      if (patch.members) S.members = patch.members;
      if (patch.tripId) S.tripId = patch.tripId;
      emit();
    },
    setSync: function (st) { S.sync = Object.assign({}, S.sync, st); emit(); },
    resetAll: function () { localStorage.removeItem(KEY); location.href = location.pathname; }
  };
  window.STORE = STORE;
})();
