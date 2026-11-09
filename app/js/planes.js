/* Planes conjuntos: propuestas para que las dos familias vayan juntas.
   Tres por día (días 2–7): tipo 'completo', 'manana' o 'tarde'.
   Las paradas tienen el mismo formato que las sugerencias (sugerencias.js):
     n    número de ficha            t  hora más temprana de inicio
     d    duración (si no, la de la ficha)
     alt  fichas alternativas: se usan si la parada ya está hecha, programada o cerrada,
          y después, en el programa, para sustituir la parada
     nota texto breve para la parada
   Criterios y planes redactados: claude/Planes_conjuntos_NYC.md (proyecto). */
window.PLANES_TIPOS = [
  { id: 'completo', nombre: 'Día completo' },
  { id: 'manana', nombre: 'Mañana' },
  { id: 'tarde', nombre: 'Tarde' }
];

window.PLANES = [
  /* ---------- Día 2 · sábado 2 de enero ---------- */
  {
    id: 'P2', dia: 2, tipo: 'completo', titulo: '5th Avenue navideña', zona: 'Midtown · Central Park · 5th Ave',
    resumen: 'Rockefeller a primera hora, los estudios de NBC, Central Park y los escaparates de la 5th Avenue al anochecer, de Bergdorf a Saks.',
    paradas: [
      { n: 73, t: '09:00', alt: [67], nota: 'Desayuno con espectáculo' },
      { n: 7, t: '10:30', nota: 'Antes de que se llene la plaza' },
      { n: 44, t: '11:45', alt: [57], nota: 'Visita guiada: reservar hora' },
      { n: 65, t: '13:15', alt: [64, 74], nota: 'Comida: porción de pizza' },
      { n: 23, t: '13:45', d: 120, nota: 'Entrada por Columbus Circle; salida por Grand Army Plaza (5th Ave)' },
      { n: 82, t: '16:00' },
      { n: 27, t: '16:35', nota: 'Al anochecer, de Bergdorf (calle 58) hacia el sur hasta Saks' },
      { n: 79, t: '18:15', alt: [74, 75], nota: 'Cena (reservar para 7)' }
    ]
  },
  {
    id: 'M2', dia: 2, tipo: 'manana', titulo: 'Calle 42 y Herald Square', zona: 'Midtown · calle 42 · calle 34',
    resumen: 'Bagels, la Biblioteca a la apertura, Grand Central y Macy\'s, con pizza para comer.',
    paradas: [
      { n: 67, t: '09:00', alt: [73], nota: 'Desayuno: bagel' },
      { n: 8, t: '10:00', nota: 'Biblioteca a la apertura y después Grand Central; se cruza Bryant Park' },
      { n: 56, t: '11:45', alt: [81] },
      { n: 65, t: '13:15', alt: [64], nota: 'Comida: porción de pizza' }
    ]
  },
  {
    id: 'T2', dia: 2, tipo: 'tarde', titulo: 'Brooklyn: DUMBO y Dyker Heights', zona: 'Brooklyn',
    resumen: 'Comida tardía con vistas a los puentes en DUMBO y las casas iluminadas de Dyker Heights.',
    paradas: [
      { n: 78, t: '14:30', nota: 'Comida tardía; azotea con vistas a los puentes' },
      { n: 30, t: '17:00', nota: 'Calle 84 entre las avenidas 11 y 12' },
      { n: 74, t: '19:45', alt: [79, 65], nota: 'Cena al volver (metro R hasta 49 St)' }
    ]
  },

  /* ---------- Día 3 · domingo 3 de enero ---------- */
  {
    id: 'P3', dia: 3, tipo: 'completo', titulo: 'Upper West Side y calle 42', zona: 'Upper West Side · Midtown · calle 42',
    resumen: 'El mercadillo de los domingos y las galletas de Levain, la Biblioteca y Grand Central, Summit al atardecer y Times Square de noche.',
    paradas: [
      { n: 67, t: '09:00', alt: [73], nota: 'Desayuno: bagel' },
      { n: 61, t: '10:00', nota: 'Solo abre los domingos' },
      { n: 68, t: '11:15', nota: 'Galletas para llevar' },
      { n: 65, t: '12:15', alt: [64], nota: 'Comida: porción de pizza' },
      { n: 8, t: '13:00', nota: 'Biblioteca (domingo solo de 13:00 a 17:00) y Grand Central; se cruza Bryant Park, último día del mercadillo' },
      { n: 3, t: '15:00', nota: 'Franja de atardecer (puesta de sol ~16:40)' },
      { n: 6, t: '17:15', nota: 'Ya de noche, con todas las pantallas' },
      { n: 74, t: '18:15', alt: [79, 73], nota: 'Cena' }
    ]
  },
  {
    id: 'M3', dia: 3, tipo: 'manana', titulo: 'Domingo de gospel en Harlem', zona: 'Harlem',
    resumen: 'Visita guiada con misa gospel en una iglesia baptista y la calle 125, con el Apollo.',
    paradas: [
      { n: 43, t: '09:15', nota: 'Harlem Heritage Tours: salida 9:15 en 104 Malcolm X Blvd (calle 116)' },
      { n: 52, t: '12:30', d: 45, nota: '125th St: Apollo y Studio Museum' },
      { libre: 'comida', t: '13:15', d: 60, titulo: 'Comida en Harlem' }
    ]
  },
  {
    id: 'T3', dia: 3, tipo: 'tarde', titulo: 'Central Park y Guggenheim', zona: 'Central Park · Upper East Side',
    resumen: 'Central Park de sur a norte y el Guggenheim a última hora, cuando se paga lo que se quiere.',
    paradas: [
      { n: 23, t: '14:00', d: 100, nota: 'Entrada por Grand Army Plaza; hacia el norte por el Mall y Bethesda' },
      { n: 20, t: '16:00', d: 70, nota: 'Paga lo que quieras de 16:00 a 17:30' },
      { n: 79, t: '18:15', alt: [74, 73], nota: 'Cena (reservar para 7)' }
    ]
  }
];
