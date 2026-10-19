/* Sincronización con Firebase (Firestore + acceso anónimo).
   Datos: trips/{viaje}              { nombre, createdBy }
          trips/{viaje}/blocks/{id}   bloques del programa (who: all | A | B)
          trips/{viaje}/claims/{nombre} quién ha entrado con cada nombre de la lista { uid, name }
          trips/{viaje}/notifs/{id}   avisos de cambios { at, by, who, txt, day, blockId }
   El id del viaje es largo y aleatorio: solo entra quien tiene el enlace de invitación. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, deleteDoc, getDocFromServer, collection, onSnapshot, writeBatch, serverTimestamp,
  query, orderBy, limit, connectFirestoreEmulator
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const ST = window.STORE;
const C = window.CORE;
const CFG = window.FIREBASE_CONFIG;
let db = null, user = null, tid = null, unsubs = [];
let gotTrip = false;

function clean(o) { return JSON.parse(JSON.stringify(o)); }
function set(st) { ST.setSync(st); }
function err(e) { console.error(e); set({ error: String(e && (e.code || e.message) || e) }); }

const API = {
  ready: () => !!(db && user && tid && gotTrip),
  enabled: () => !!CFG,
  tripId: () => tid,
  uid: () => user && user.uid,
  inviteUrl: () => tid ? location.origin + location.pathname + '?v=' + tid : '',
  // Crea el viaje (solo el organizador, la primera vez)
  async create() {
    await authReady;
    const id = ST.uid('v') + ST.uid('');
    const batch = writeBatch(db);
    batch.set(doc(db, 'trips', id), { nombre: C.TRIP.nombre, createdBy: user.uid, created: serverTimestamp() });
    C.TRIP.fijos.forEach(b => batch.set(doc(db, 'trips', id, 'blocks', b.id), clean(Object.assign({ status: 'plan' }, b))));
    await batch.commit();
    connect(id);
    return id;
  },
  // Entrar con un nombre de la lista: 'ok' | 'taken' | 'offline' | 'notrip'
  async claim(name) {
    await authReady;
    if (!tid) return 'notrip';
    const key = C.nameKey(name);
    const ref = doc(db, 'trips', tid, 'claims', key);
    let snap;
    try { snap = await getDocFromServer(ref); } catch (e) { return 'offline'; }
    const cur = snap.exists() ? snap.data().uid : null;
    if (cur && cur !== user.uid) return 'taken';
    if (cur !== user.uid) {
      try { await setDoc(ref, { uid: user.uid, name: C.persona(name).nombre, at: Date.now() }); }
      catch (e) { return e && e.code === 'permission-denied' ? 'taken' : 'offline'; }
    }
    return 'ok';
  },
  // El organizador libera un nombre (p. ej. si alguien cambia de móvil)
  release(key) {
    const c = ST.S.claims[key];
    return setDoc(doc(db, 'trips', tid, 'claims', key), { uid: null, name: c ? c.name : key, at: Date.now() }).catch(err);
  },
  join(id) { connect(id); },
  putBlock(b) { return setDoc(doc(db, 'trips', tid, 'blocks', b.id), clean(b)).catch(err); },
  delBlock(id) { return deleteDoc(doc(db, 'trips', tid, 'blocks', id)).catch(err); },
  addNotif(n) { return setDoc(doc(db, 'trips', tid, 'notifs', n.id), clean(n)).catch(err); }
};
window.SYNC_API = API;

function connect(id) {
  unsubs.forEach(u => u()); unsubs = [];
  tid = id; gotTrip = false;
  set({ status: 'connecting', error: '' });
  unsubs.push(onSnapshot(doc(db, 'trips', id), { includeMetadataChanges: true }, snap => {
    if (!snap.exists()) {
      if (!snap.metadata.fromCache) set({ status: 'notfound' });
      return;
    }
    gotTrip = true;
    ST.applyRemote({ tripId: id, trip: { nombre: snap.data().nombre } });
    set({ status: snap.metadata.fromCache ? 'offline' : 'online' });
  }, e => { err(e); set({ status: 'error' }); }));
  unsubs.push(onSnapshot(collection(db, 'trips', id, 'blocks'), { includeMetadataChanges: true }, qs => {
    const blocks = {};
    qs.forEach(s => { blocks[s.id] = Object.assign({}, s.data(), { id: s.id }); });
    ST.applyRemote({ blocks });
    if (gotTrip) set({ pending: qs.metadata.hasPendingWrites, status: qs.metadata.fromCache ? 'offline' : 'online' });
  }, err));
  unsubs.push(onSnapshot(collection(db, 'trips', id, 'claims'), { includeMetadataChanges: true }, qs => {
    const claims = {};
    qs.forEach(s => { claims[s.id] = s.data(); });
    ST.applyRemote({ claims });
    // ¿Sigue siendo mío el nombre con el que entré en este móvil?
    const me = ST.S.me;
    if (me && user && !qs.metadata.fromCache) {
      const c = claims[C.nameKey(me.name)];
      if (!c) API.claim(me.name);                       // entrada de una versión anterior o nombre liberado: se vuelve a reservar
      else if (c.uid !== user.uid) ST.setMe(null);      // el nombre lo tiene otro móvil
    }
  }, err));
  let first = true;
  unsubs.push(onSnapshot(query(collection(db, 'trips', id, 'notifs'), orderBy('at', 'desc'), limit(80)), qs => {
    const notifs = [];
    qs.forEach(s => notifs.push(s.data()));
    if (!first && window.onNewNotifs) {
      const nuevos = qs.docChanges().filter(ch => ch.type === 'added' && !ch.doc.metadata.hasPendingWrites).map(ch => ch.doc.data());
      if (nuevos.length) window.onNewNotifs(nuevos);
    }
    first = false;
    ST.applyRemote({ notifs });
  }, err));
}

let authReady;
if (!CFG) {
  set({ status: 'off' });
} else {
  const app = initializeApp(CFG);
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  const auth = getAuth(app);
  if (window.FIREBASE_EMULATOR) {   // solo para pruebas locales
    const host = typeof window.FIREBASE_EMULATOR === 'string' ? window.FIREBASE_EMULATOR : 'localhost';
    connectFirestoreEmulator(db, host, 8080);
    connectAuthEmulator(auth, 'http://' + host + ':9099', { disableWarnings: true });
  }
  authReady = new Promise(resolve => {
    onAuthStateChanged(auth, u => { if (u) { user = u; resolve(u); } });
  });
  set({ status: 'connecting' });
  signInAnonymously(auth).catch(e => {
    // Sin conexión en el primer arranque: se reintenta al volver la red
    if (!auth.currentUser) {
      set({ status: 'offline', error: String(e.code || e) });
      window.addEventListener('online', () => signInAnonymously(auth).catch(err), { once: true });
    }
  });
  API.started = authReady.then(() => {
    const fromUrl = new URLSearchParams(location.search).get('v');
    const id = fromUrl || (ST.S.tripId && ST.S.tripId !== 'local' ? ST.S.tripId : null);
    if (fromUrl) history.replaceState(null, '', location.pathname);
    if (id) connect(id);
    else set({ status: 'notrip' });
  });
}
