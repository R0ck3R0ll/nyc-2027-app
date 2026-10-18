/* Sincronización con Firebase (Firestore + acceso anónimo).
   Datos: trips/{viaje}            { nombre, fam: { A, B }, createdBy }
          trips/{viaje}/blocks/{id} bloques del programa (cada uno con who: all | A | B)
          trips/{viaje}/members/{uid} { name, fam }
   El id del viaje es largo y aleatorio: solo entra quien tiene el enlace de invitación. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, writeBatch, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const ST = window.STORE;
const CFG = window.FIREBASE_CONFIG;
let db = null, user = null, tid = null, unsubs = [];
let gotTrip = false;

function clean(o) { return JSON.parse(JSON.stringify(o)); }
function set(st) { ST.setSync(st); }

const API = {
  ready: () => !!(db && user && tid && gotTrip),
  enabled: () => !!CFG,
  tripId: () => tid,
  inviteUrl: () => tid ? location.origin + location.pathname + '?v=' + tid : '',
  async create(fam) {
    await authReady;
    const id = ST.uid('v') + ST.uid('');
    const trip = { nombre: window.CORE.TRIP.nombre, fam, createdBy: user.uid, created: serverTimestamp() };
    const batch = writeBatch(db);
    batch.set(doc(db, 'trips', id), trip);
    // Se suben los bloques que hubiera en el móvil (o los fijos del viaje)
    let blocks = ST.blocks();
    if (!blocks.length) blocks = window.CORE.TRIP.fijos.map(b => Object.assign({ status: 'plan' }, b));
    blocks.forEach(b => batch.set(doc(db, 'trips', id, 'blocks', b.id), clean(b)));
    await batch.commit();
    connect(id);
    return id;
  },
  join(id) { connect(id); },
  putBlock(b) { return setDoc(doc(db, 'trips', tid, 'blocks', b.id), clean(b)).catch(err); },
  putBlocks(list) {
    const batch = writeBatch(db);
    list.forEach(b => batch.set(doc(db, 'trips', tid, 'blocks', b.id), clean(b)));
    return batch.commit().catch(err);
  },
  delBlock(id) { return deleteDoc(doc(db, 'trips', tid, 'blocks', id)).catch(err); },
  putMember(me) { return setDoc(doc(db, 'trips', tid, 'members', user.uid), clean({ name: me.name, fam: me.fam, at: Date.now() })).catch(err); },
  putTrip(trip) { return updateDoc(doc(db, 'trips', tid), clean({ nombre: trip.nombre, fam: trip.fam })).catch(err); }
};
window.SYNC_API = API;

function err(e) { console.error(e); set({ error: String(e && (e.code || e.message) || e) }); }

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
    const d = snap.data();
    ST.applyRemote({ tripId: id, trip: { nombre: d.nombre, fam: d.fam } });
    set({ status: snap.metadata.fromCache ? 'offline' : 'online' });
    // Si el móvil tenía perfil, se registra como participante
    if (ST.S.me) API.putMember(ST.S.me);
  }, e => { err(e); set({ status: 'error' }); }));
  unsubs.push(onSnapshot(collection(db, 'trips', id, 'blocks'), { includeMetadataChanges: true }, qs => {
    const blocks = {};
    qs.forEach(s => { blocks[s.id] = Object.assign({}, s.data(), { id: s.id }); });
    ST.applyRemote({ blocks });
    set({ pending: qs.metadata.hasPendingWrites, status: qs.metadata.fromCache ? 'offline' : 'online' });
  }, err));
  unsubs.push(onSnapshot(collection(db, 'trips', id, 'members'), qs => {
    const members = {};
    qs.forEach(s => { members[s.id] = s.data(); });
    ST.applyRemote({ members });
  }, err));
}

let authReady;
if (!CFG) {
  set({ status: 'off' });
} else {
  const app = initializeApp(CFG);
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  const auth = getAuth(app);
  authReady = new Promise(resolve => {
    onAuthStateChanged(auth, u => {
      if (u) { user = u; resolve(u); }
    });
  });
  set({ status: 'connecting' });
  signInAnonymously(auth).catch(e => {
    // Sin conexión en el primer arranque: se reintenta al volver la red
    if (!auth.currentUser) {
      set({ status: 'offline', error: String(e.code || e) });
      window.addEventListener('online', () => signInAnonymously(auth).catch(err), { once: true });
    }
  });
  authReady.then(() => {
    const fromUrl = new URLSearchParams(location.search).get('v');
    const id = fromUrl || (ST.S.tripId && ST.S.tripId !== 'local' ? ST.S.tripId : null);
    if (fromUrl) history.replaceState(null, '', location.pathname);
    if (id) connect(id);
    else set({ status: 'notrip' });
  });
}
