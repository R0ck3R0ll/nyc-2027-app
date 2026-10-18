/* Lógica del viaje sin interfaz: tiempos, traslados, horarios, avisos y sugerencias.
   Funciona en el navegador (window.CORE) y en Node (module.exports) para las pruebas. */
(function (root) {
  'use strict';

  var TRIP = {
    nombre: 'Nueva York 2027',
    dias: [
      { n: 1, fecha: '2027-01-01', corto: 'Vie 1', largo: 'Viernes 1 de enero', tipo: 'llegada' },
      { n: 2, fecha: '2027-01-02', corto: 'Sáb 2', largo: 'Sábado 2 de enero' },
      { n: 3, fecha: '2027-01-03', corto: 'Dom 3', largo: 'Domingo 3 de enero' },
      { n: 4, fecha: '2027-01-04', corto: 'Lun 4', largo: 'Lunes 4 de enero' },
      { n: 5, fecha: '2027-01-05', corto: 'Mar 5', largo: 'Martes 5 de enero' },
      { n: 6, fecha: '2027-01-06', corto: 'Mié 6', largo: 'Miércoles 6 de enero' },
      { n: 7, fecha: '2027-01-07', corto: 'Jue 7', largo: 'Jueves 7 de enero', tipo: 'salida' }
    ],
    hotel: { nombre: 'Kimpton Hotel Theta', direccion: '790 8th Ave, New York, NY 10019', lat: 40.76128, lng: -73.98745 },
    teatros: { lat: 40.7590, lng: -73.9865 },
    atardecer: 16 * 60 + 40,
    sugMin: 9 * 60,
    sugMax: 23 * 60,
    // Bloques fijos con los que nace el viaje (editables)
    fijos: [
      { id: 'fx-llegada', day: 1, start: '19:05', dur: 115, type: 'fixed', who: 'all', title: 'Llegada a Newark y traslado al hotel', note: 'Vuelo con llegada a Newark a las 19:05 (hora de Nueva York)', fixed: true, place: 'hotel' },
      { id: 'fx-checkout', day: 7, start: '11:45', dur: 20, type: 'fixed', who: 'all', title: 'Check-out (maletas en consigna)', note: 'Check-out hasta las 12:00', fixed: true, place: 'hotel' },
      { id: 'fx-salida', day: 7, start: '18:00', dur: 60, type: 'fixed', who: 'all', title: 'Salida hacia Newark', note: 'Vuelo a las 22:00: llegar al aeropuerto hacia las 19:00', fixed: true, place: 'hotel' }
    ]
  };

  /* ---------- tiempo ---------- */
  function toMin(hhmm) {
    if (typeof hhmm === 'number') return hhmm;
    if (!hhmm) return null;
    var p = String(hhmm).split(':');
    return (+p[0]) * 60 + (+p[1] || 0);
  }
  function fmt(min) {
    if (min == null || isNaN(min)) return '';
    min = Math.round(min);
    var h = Math.floor(min / 60), m = ((min % 60) + 60) % 60;
    return (h < 10 ? '0' : '') + (h % 24 === 0 && h > 0 ? 24 : h) + ':' + (m < 10 ? '0' : '') + m;
  }
  function durTxt(min) {
    min = Math.round(min);
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60), m = min % 60;
    return h + ' h' + (m ? ' ' + m : '');
  }
  function roundUp(min, step) { step = step || 5; return Math.ceil(min / step) * step; }

  /* ---------- fichas ---------- */
  var FICHAS = [], BYNUM = {};
  function setFichas(list) {
    FICHAS = list; BYNUM = {};
    list.forEach(function (f) { BYNUM[f.num] = f; });
  }
  function ficha(n) { return BYNUM[n]; }

  function locOf(x) {
    if (!x) return TRIP.hotel;
    if (x.lat != null) return x;
    if (x.n != null && BYNUM[x.n]) return BYNUM[x.n].ubicacion;
    if (x.place === 'hotel' || x.libre === 'descanso') return TRIP.hotel;
    if (x.libre === 'musical' || x.place === 'teatros') return TRIP.teatros;
    if (x.loc) return x.loc;
    return null;
  }

  /* ---------- traslados (estimación sin conexión) ---------- */
  function km(a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  // Devuelve { min, modo: 'pie' | 'metro' | 'bus', km }
  function travel(fromX, toX) {
    var a = locOf(fromX), b = locOf(toX);
    if (!a || !b) return { min: 0, modo: 'pie', km: 0 };
    var fv = toX && toX.n != null && BYNUM[toX.n] && BYNUM[toX.n].plan.viaje;
    var bv = fromX && fromX.n != null && BYNUM[fromX.n] && BYNUM[fromX.n].plan.viaje;
    if (fv || bv) return { min: fv || bv, modo: 'bus', km: km(a, b) };
    var d = km(a, b);
    if (d < 0.08) return { min: 0, modo: 'pie', km: d };
    var walk = d * 1.3 / 4.6 * 60;                 // calles en cuadrícula, paso de grupo
    if (d <= 1.4) return { min: Math.max(3, roundUp(walk)), modo: 'pie', km: d };
    var transit = 10 + d * 2.7;                    // acceso + espera + metro
    if (walk <= transit) return { min: roundUp(walk), modo: 'pie', km: d };
    return { min: roundUp(transit), modo: 'metro', km: d };
  }

  /* ---------- horarios ---------- */
  function hoursOn(f, day) {
    var p = f.plan;
    if (p.fun) return null;
    var h = p.h && p.h[String(day)];
    if (!h) return { closed: true };
    var parts = h.split('-');
    return { open: toMin(parts[0]), close: toMin(parts[1]), last: p.last ? toMin(p.last) : null };
  }
  function funciones(f, day) { return (f.plan.fun && f.plan.fun[String(day)]) || []; }
  function notaDia(f, day) {
    var n = f.plan.notas;
    if (!n) return '';
    return n[String(day)] || n['*'] || '';
  }
  function hoursTxt(f, day) {
    if (f.plan.fun) {
      var fs = funciones(f, day);
      return fs.length ? 'Funciones: ' + fs.join(' · ') : 'Sin función este día';
    }
    var h = hoursOn(f, day);
    if (h.closed) return 'Cerrado este día';
    if (h.open === 0 && h.close >= 1440) return 'Abierto siempre';
    return fmt(h.open) + '–' + fmt(h.close) + (h.last ? ' (última entrada ' + fmt(h.last) + ')' : '');
  }
  // ¿Se puede hacer de start a start+dur? Devuelve null o el motivo
  function fitsHours(f, day, start, dur) {
    if (f.plan.fun) {
      var fs = funciones(f, day);
      if (!fs.length) return 'No hay función este día';
      if (fs.map(toMin).indexOf(start) < 0) return 'Funciones este día: ' + fs.join(' · ');
      return null;
    }
    var h = hoursOn(f, day);
    if (h.closed) return 'Cerrado este día';
    if (start < h.open) return 'Abre a las ' + fmt(h.open);
    var lastStart = h.last != null ? h.last : h.close - Math.min(dur, 30);
    if (start > lastStart) return h.last != null ? 'Última entrada a las ' + fmt(h.last) : 'Cierra a las ' + fmt(h.close);
    if (start + dur > h.close + 10) return 'Cierra a las ' + fmt(h.close) + ' (no da tiempo a la visita completa)';
    return null;
  }

  /* ---------- bloques ---------- */
  // who: 'all' | 'A' | 'B'
  function covers(who, fam) { return who === 'all' || who === fam || fam === 'all'; }
  function blockStart(b) { return toMin(b.start); }
  function blockDur(b) {
    if (b.dur != null) return b.dur;
    var f = b.n != null && BYNUM[b.n];
    return f ? f.plan.dur : 60;
  }
  function blockEnd(b) { return blockStart(b) + blockDur(b); }
  function blockTitle(b) {
    if (b.title) return b.title;
    var f = b.n != null && BYNUM[b.n];
    return f ? f.nombre : 'Bloque';
  }
  function sortBlocks(list) {
    return list.slice().sort(function (a, b) { return blockStart(a) - blockStart(b) || (a.id < b.id ? -1 : 1); });
  }
  // Bloques de una "línea" (lo que hace una familia): los de todos + los suyos
  function lineBlocks(blocks, day, fam) {
    return sortBlocks(blocks.filter(function (b) {
      return b.day === day && b.status !== 'skip' && (fam === 'all' ? true : covers(b.who, fam));
    }));
  }
  // Estado de cada ficha para una familia ('A', 'B') o para el grupo ('all': cualquiera de las dos)
  function placeState(blocks, fam) {
    var st = {};
    blocks.forEach(function (b) {
      if (b.n == null || b.status === 'skip') return;
      var applies = fam === 'all' ? true : covers(b.who, fam);
      if (!applies) return;
      var cur = st[b.n];
      if (b.status === 'done') st[b.n] = { estado: 'hecho', day: b.day, id: b.id, who: b.who };
      else if (!cur || cur.estado !== 'hecho') st[b.n] = { estado: 'programado', day: b.day, id: b.id, who: b.who };
    });
    return st;
  }

  /* ---------- avisos de un día ---------- */
  // Devuelve { byId: {id: [avisos]}, resumen }. aviso = { nivel: 'error'|'warn'|'info', txt, n? }
  function analyzeDay(blocks, day, fam) {
    var line = lineBlocks(blocks, day, fam);
    var byId = {};
    var all = blocks.filter(function (b) { return b.status !== 'skip'; });
    function add(b, nivel, txt, extra) {
      (byId[b.id] = byId[b.id] || []).push(Object.assign({ nivel: nivel, txt: txt }, extra || {}));
    }
    var prev = null, activo = 0, traslados = 0, first = null, last = null;
    line.forEach(function (b) {
      var s = blockStart(b), d = blockDur(b), e = s + d;
      var f = b.n != null ? BYNUM[b.n] : null;
      if (first == null) first = s;
      last = Math.max(last || 0, e);
      activo += d;
      var from = prev || { place: 'hotel' };
      var tr = travel(from, b);
      if (prev) {
        traslados += tr.min;
        var free = s - blockEnd(prev);
        if (free < 0) add(b, 'error', 'Se solapa con «' + blockTitle(prev) + '» (' + fmt(blockStart(prev)) + '–' + fmt(blockEnd(prev)) + ')');
        else if (free < tr.min) add(b, 'error', 'No da tiempo: desde «' + blockTitle(prev) + '» hay ≈' + tr.min + ' min (' + (tr.modo === 'pie' ? 'a pie' : 'en metro') + ') y solo quedan ' + free);
      }
      if (f) {
        var why = fitsHours(f, day, s, d);
        if (why) add(b, f.plan.fun || /Cerrado|función/.test(why) ? 'error' : 'warn', why);
        if (f.plan.luz && e > TRIP.atardecer + 10) add(b, 'warn', 'Mejor con luz: oscurece hacia las 16:40');
        var nd = notaDia(f, day);
        if (nd) add(b, 'info', nd);
        if (f.reserva && f.reserva.dias && f.reserva.dias.indexOf(day) < 0)
          add(b, 'warn', 'Este día no está entre los reservables (' + f.reserva.dias.map(function (x) { return TRIP.dias[x - 1].corto; }).join(', ') + ')');
        if (f.reserva && f.reserva.tipo && f.reserva.tipo !== 'no' && !(b.booking && b.booking.ok))
          add(b, 'info', 'Requiere reserva' + (f.reserva.nota ? ': ' + f.reserva.nota : ''), { reserva: true });
        // excluyentes
        (f.excluye || []).forEach(function (x) {
          all.forEach(function (o) {
            if (o.n !== x || o.id === b.id) return;
            if (fam !== 'all' && !covers(o.who, fam)) return;
            var nota = f.excluye_nota ? ' (' + f.excluye_nota + ')' : '';
            if (o.day === day) add(b, 'warn', 'Excluyente con «' + BYNUM[x].nombre + '» el mismo día' + nota, { n: x });
            else if (/basta|sobra/.test(f.excluye_nota || '')) add(b, 'info', 'También está «' + BYNUM[x].nombre + '» el ' + TRIP.dias[o.day - 1].corto + nota, { n: x });
          });
        });
        // repetidos
        all.forEach(function (o) {
          if (o.id === b.id || o.n !== b.n) return;
          if (fam !== 'all' && !covers(o.who, fam)) return;
          if (!(covers(o.who, b.who === 'all' ? 'all' : b.who) || covers(b.who, o.who === 'all' ? 'all' : o.who))) return;
          add(b, 'warn', (o.status === 'done' ? 'Ya visitado' : 'También programado') + ' el ' + TRIP.dias[o.day - 1].corto);
        });
      }
      if (b.type !== 'fixed' && (e > 24 * 60)) add(b, 'warn', 'Termina después de medianoche');
      prev = b;
    });
    var span = first == null ? 0 : last - first;
    var carga = activo + traslados;
    var nivel = carga === 0 ? 'vacio' : carga < 8 * 60 ? 'ligero' : carga <= 11 * 60 ? 'completo' : 'cargado';
    return { byId: byId, line: line, resumen: { first: first, last: last, activo: activo, traslados: traslados, span: span, carga: carga, nivel: nivel } };
  }

  // Primera hora viable para añadir una ficha a un día (para añadir desde el banco)
  function suggestStart(blocks, day, fam, n, desde) {
    var f = BYNUM[n];
    if (!f) return null;
    var line = lineBlocks(blocks, day, fam);
    var dur = f.plan.dur;
    var me = { n: n };
    var cands;
    if (f.plan.fun) cands = funciones(f, day).map(toMin);
    else {
      var h = hoursOn(f, day);
      if (h.closed) return null;
      var base = Math.max(desde != null ? desde : TRIP.sugMin, h.open);
      cands = [base];
      line.forEach(function (b) { cands.push(roundUp(blockEnd(b) + travel(b, me).min)); });
      cands = cands.filter(function (c) { return c >= base; });
    }
    cands.sort(function (x, y) { return x - y; });
    for (var i = 0; i < cands.length; i++) {
      var s = cands[i], e = s + dur;
      if (fitsHours(f, day, s, dur)) continue;
      var clash = line.some(function (b) {
        var bs = blockStart(b), be = blockEnd(b);
        if (be <= s) return s < be + travel(b, me).min;          // no da tiempo a llegar
        if (bs >= e) return e + travel(me, b).min > bs;           // no da tiempo al siguiente
        return true;                                              // se solapa
      });
      if (!clash) return s;
    }
    return f.plan.fun ? (cands[0] != null ? cands[0] : null) : null;
  }

  /* ---------- sugerencias ---------- */
  function generate(tema, nivel, day, blocks, fam) {
    var stops = tema.niveles[nivel] || [];
    var obst = lineBlocks(blocks, day, fam);
    var st = placeState(blocks, fam);
    var used = {};
    var out = [], dropped = [];
    var prev = null, prevEnd = null;
    // posición inicial: el último bloque antes del primer tramo, o el hotel
    function obstacleAt(s, e) {
      for (var i = 0; i < obst.length; i++) {
        var o = obst[i];
        if (s < blockEnd(o) && e > blockStart(o)) return o;
      }
      return null;
    }
    function lastObstBefore(t) {
      var r = null;
      obst.forEach(function (o) { if (blockEnd(o) <= t) r = o; });
      return r;
    }
    var hayMusical = obst.some(function (o) { var f = o.n && BYNUM[o.n]; return f && f.categoria === 'Broadway' || (f && f.num === 28); });

    stops.forEach(function (sp) {
      if (sp.libre === 'musical' && hayMusical) return;
      var cands = sp.libre ? [null] : [sp.n].concat(sp.alt || []);
      var placed = null, why = '';
      for (var c = 0; c < cands.length && !placed; c++) {
        var n = cands[c];
        var f = n != null ? BYNUM[n] : null;
        if (n != null) {
          if (!f) continue;
          if (used[n]) { why = 'repetido'; continue; }
          if (st[n]) { why = st[n].estado === 'hecho' ? 'ya visitado' : 'ya programado (' + TRIP.dias[st[n].day - 1].corto + ')'; continue; }
          var exN = f.excluye_nota || '';
          var exHit = (f.excluye || []).filter(function (x) { return st[x] || used[x]; });
          if (exHit.length && (/basta/.test(exN) ? exHit.length >= 2 : /mismo día|misma tarde/.test(exN) ? exHit.some(function (x) { return used[x] || st[x].day === day; }) : true)) { why = 'excluyente con «' + BYNUM[exHit[0]].nombre + '»'; continue; }
        }
        var item = n != null ? { n: n } : { libre: sp.libre };
        var dur = sp.d || (f ? f.plan.dur : 60);
        var t0 = Math.max(toMin(sp.t), TRIP.sugMin);
        var from = prev || lastObstBefore(t0) || { place: 'hotel' };
        var tr = travel(from, item).min;
        if (!prev && !lastObstBefore(t0)) prevEnd = t0 - tr;   // salida del hotel con tiempo
        var s = roundUp(Math.max(t0, (prevEnd != null ? prevEnd : 0) + tr));
        // horarios
        var tries = 0, ok = false;
        while (tries++ < 6) {
          if (f && !f.plan.fun) {
            var h = hoursOn(f, day);
            if (h.closed) { why = 'cerrado ese día'; break; }
            if (s < h.open) { if (h.open - s > 40) { why = 'abre a las ' + fmt(h.open); break; } s = h.open; }
          }
          if (f && f.plan.fun) {
            var fs = funciones(f, day).map(toMin).filter(function (x) { return x >= s - 15; });
            if (!fs.length) { why = 'sin función a esa hora'; break; }
            s = fs[0];
          }
          var ob = obstacleAt(s - (prev ? 0 : 0), s + dur);
          if (ob) { s = roundUp(blockEnd(ob) + travel(ob, item).min); from = ob; continue; }
          var e = s + dur;
          var next = null;
          obst.forEach(function (o) { if (!next && blockStart(o) >= e) next = o; });
          if (next && e + travel(item, next).min > blockStart(next)) { s = roundUp(blockEnd(next) + travel(next, item).min); from = next; continue; }
          if (f) {
            var w = fitsHours(f, day, s, dur);
            if (w) { why = w.toLowerCase(); break; }
          }
          if (e > TRIP.sugMax) { why = 'no cabe antes de las 23:00'; break; }
          ok = true; break;
        }
        if (ok) {
          placed = { n: n, libre: sp.libre || null, titulo: sp.titulo || null, start: s, dur: dur, end: s + dur,
            tr: travel(from, item),
            nota: sp.nota || '', sustituye: c > 0 ? sp.n : null };
        }
      }
      if (placed) {
        out.push(placed);
        if (placed.n != null) used[placed.n] = true;
        prev = placed.n != null ? { n: placed.n } : { libre: placed.libre };
        prevEnd = placed.end;
      } else if (!sp.libre) {
        dropped.push({ n: sp.n, why: why });
      }
    });
    var nuevos = out.filter(function (x) { return x.n != null; });
    var imp = nuevos.filter(function (x) { return BYNUM[x.n].clas === 'I'; }).length;
    return {
      tema: tema, nivel: nivel, day: day, stops: out, dropped: dropped,
      start: out.length ? out[0].start : null, end: out.length ? out[out.length - 1].end : null,
      score: nuevos.length * 10 + imp * 6 - dropped.length * 8
    };
  }

  function suggestionsFor(day, nivel, blocks, fam, temas) {
    temas = temas || root.SUGERENCIAS || [];
    var d = TRIP.dias[day - 1];
    var medio = d.tipo === 'llegada' || d.tipo === 'salida';
    return temas.filter(function (t) {
      var dias = t.dias || [2, 3, 4, 5, 6];
      return dias.indexOf(day) >= 0 && (!!t.medio === medio);
    }).map(function (t) { return generate(t, nivel, day, blocks, fam); })
      .filter(function (g) { return g.stops.some(function (s) { return s.n != null; }); })
      .sort(function (a, b) { return b.score - a.score; });
  }

  /* ---------- «Ahora»: qué hacer con el tiempo que queda ---------- */
  function nowOptions(blocks, day, fam, now, here) {
    var line = lineBlocks(blocks, day, fam);
    var next = null;
    line.forEach(function (b) { if (!next && blockStart(b) >= now) next = b; });
    var limit = next ? blockStart(next) : TRIP.sugMax;
    var st = placeState(blocks, fam);
    var res = [];
    FICHAS.forEach(function (f) {
      if (st[f.num]) return;
      var tr = travel(here, { n: f.num });
      var s = roundUp(now + tr.min);
      var dur = f.plan.dur;
      if (f.plan.fun) {
        var fs = funciones(f, day).map(toMin).filter(function (x) { return x >= s; });
        if (!fs.length) return;
        s = fs[0];
        if (s - now > 120) return;
      }
      if (fitsHours(f, day, s, dur)) {
        // ¿cabe una visita corta?
        var h = hoursOn(f, day);
        if (!h || h.closed || s < h.open || s + Math.min(dur, 45) > h.close) return;
      }
      var end = s + dur;
      var back = next ? travel({ n: f.num }, next).min : 0;
      var cabe = end + back <= limit;
      if (!cabe && s + Math.min(dur, 45) + back > limit) return;
      res.push({ n: f.num, start: s, end: end, tr: tr, cabe: cabe, meal: mealNow(f, s) });
    });
    res.sort(function (a, b) { return a.tr.min - b.tr.min || (BYNUM[a.n].clas === 'I' ? -1 : 1); });
    return { next: next, limit: limit, opciones: res };
  }
  function mealNow(f, t) {
    var m = f.plan.meal;
    if (!m) return null;
    if (m.indexOf('des') >= 0 && t >= 7 * 60 && t <= 11 * 60) return 'Desayuno';
    if (m.indexOf('com') >= 0 && t >= 12 * 60 && t <= 15 * 60 + 30) return 'Comida';
    if (m.indexOf('cen') >= 0 && t >= 18 * 60 + 30 && t <= 22 * 60 + 30) return 'Cena';
    if (m.indexOf('snk') >= 0) return 'Picar algo';
    return null;
  }

  /* ---------- hora de Nueva York ---------- */
  function nyNow(date) {
    date = date || new Date();
    var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(date).reduce(function (o, x) { o[x.type] = x.value; return o; }, {});
    var fecha = p.year + '-' + p.month + '-' + p.day;
    var dia = null;
    TRIP.dias.forEach(function (d) { if (d.fecha === fecha) dia = d.n; });
    return { fecha: fecha, min: (+p.hour % 24) * 60 + (+p.minute), dia: dia };
  }

  /* ---------- enlaces de Google Maps ---------- */
  function q(u) { return encodeURIComponent(u); }
  function mapsDir(f) {
    var u = f.ubicacion;
    return 'https://www.google.com/maps/dir/?api=1&destination=' + q(u.lat + ',' + u.lng) + '&travelmode=transit';
  }
  function mapsVer(f) {
    var u = f.ubicacion;
    return 'https://www.google.com/maps/search/?api=1&query=' + q(u.nombre + ', ' + u.direccion);
  }
  function mapsRuta(points) {
    // desde la ubicación actual, por todas las paradas
    return 'https://www.google.com/maps/dir//' + points.map(function (p) { return p.lat + ',' + p.lng; }).join('/');
  }

  var CORE = {
    TRIP: TRIP, toMin: toMin, fmt: fmt, durTxt: durTxt, roundUp: roundUp,
    setFichas: setFichas, ficha: ficha, locOf: locOf, km: km, travel: travel,
    hoursOn: hoursOn, hoursTxt: hoursTxt, funciones: funciones, notaDia: notaDia, fitsHours: fitsHours,
    covers: covers, blockStart: blockStart, blockEnd: blockEnd, blockDur: blockDur, blockTitle: blockTitle,
    sortBlocks: sortBlocks, lineBlocks: lineBlocks, placeState: placeState, analyzeDay: analyzeDay,
    suggestStart: suggestStart, generate: generate, suggestionsFor: suggestionsFor,
    nowOptions: nowOptions, mealNow: mealNow, nyNow: nyNow,
    mapsDir: mapsDir, mapsVer: mapsVer, mapsRuta: mapsRuta
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CORE;
  else root.CORE = CORE;
})(typeof window !== 'undefined' ? window : globalThis);
