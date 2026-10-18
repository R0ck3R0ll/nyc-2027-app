# NYC 2027 — app del viaje

Web app instalable (PWA) para el viaje a Nueva York del 1 al 7 de enero de 2027: 7 personas, 2 familias.
Funciona sin conexión y sincroniza el programa entre todos los móviles con Firebase.

## Pestañas

| Pestaña | Qué hace |
|---|---|
| Programa | Días 1–7, vacíos hasta confirmar una sugerencia o añadir lugares. Avisos de tiempos, horarios, excluyentes y reservas; carga del día; «Ir» y «Ruta del día» abren Google Maps |
| Sugerencias | Itinerarios de día completo (días 2–6) y de medio día (1 y 7) en tres niveles; quitan lo ya visitado o programado y respetan lo que ya hay en el día |
| Lugares | Banco de las 79 fichas con filtros (clasificación, estado, categoría, abierto tal día) |
| Ahora | Qué se puede hacer desde donde estáis con el tiempo libre hasta el siguiente compromiso |
| Viaje | Hotel, vuelos, reservas del programa, grupo e invitación, fotos sin conexión |

## Sincronización en dos niveles

Cada bloque del programa es para **Todos**, **Familia A** o **Familia B**. Cada móvil se configura con nombre y familia.
Un lugar visitado cuenta como hecho solo para quien lo tenía asignado.

## Estructura

- `app/` — la web que se publica (sin compilación)
  - `data/fichas.js` — generado desde la Fase 3 (`tools/build_data.py`)
  - `js/core.js` — tiempos, traslados, horarios, avisos, sugerencias (probado con `node tools/test_core.js`)
  - `js/sugerencias.js` — plantillas de itinerario
  - `js/store.js`, `js/sync.js` — estado local y Firestore · `js/app.js` — interfaz · `sw.js` — sin conexión
  - `js/config.js` — `firebaseConfig` del proyecto
- `tools/` — `meta.py` (duración, horarios por día, funciones, comidas), `build_data.py`, JSON de la Fase 3
- `firestore.rules`, `firebase.json`, `.github/workflows/deploy.yml` — publicación automática al hacer push a `main`

## Regenerar los datos

    python3 tools/build_data.py --fotos   # necesita tools/fotos_src/ (fotos de la Fase 3, no van al repositorio)
