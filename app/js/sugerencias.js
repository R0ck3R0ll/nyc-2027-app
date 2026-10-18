/* Sugerencias de itinerario.
   Cada tema tiene tres niveles (intenso, equilibrado, relajado). Cada parada:
     n    número de ficha            t  hora más temprana de inicio
     d    duración (si no, la de la ficha)
     alt  fichas alternativas si la parada ya está hecha, programada o cerrada ese día
     nota texto breve para la parada
     libre  parada sin ficha: "descanso" | "musical" | "comida" (con titulo)
   dias: días del viaje en los que se puede proponer (por defecto 2–6). */
window.SUGERENCIAS = [
  {
    id: 'midtown', titulo: 'Midtown navideño', zona: 'Midtown · 5th Ave',
    resumen: 'Árbol del Rockefeller, escaparates, luces de Saks y el mirador al atardecer, todo a pie desde el hotel.',
    niveles: {
      intenso: [
        { n: 67, t: '09:00', nota: 'Desayuno: bagel' },
        { n: 8, t: '09:45', alt: [3] },
        { n: 29, t: '11:15' },
        { n: 64, t: '12:45', alt: [65], nota: 'Comida rápida' },
        { n: 19, t: '13:30', alt: [44, 54] },
        { n: 1, t: '16:00', alt: [3], nota: 'Atardecer hacia las 16:40' },
        { n: 25, t: '17:30' },
        { n: 26, t: '18:05' },
        { n: 27, t: '18:25' },
        { n: 79, t: '20:00', alt: [75, 74], nota: 'Cena' },
        { n: 6, t: '21:45' }
      ],
      equilibrado: [
        { n: 73, t: '09:00', alt: [67], nota: 'Desayuno con espectáculo' },
        { n: 7, t: '10:30' },
        { n: 54, t: '11:45', alt: [57] },
        { n: 29, t: '13:00', alt: [8] },
        { n: 64, t: '14:15', alt: [65], nota: 'Comida rápida' },
        { n: 1, t: '15:45', alt: [3], nota: 'Atardecer hacia las 16:40' },
        { n: 25, t: '17:15' },
        { n: 26, t: '17:50' },
        { n: 27, t: '18:10' },
        { n: 79, t: '20:00', alt: [74], nota: 'Cena' }
      ],
      relajado: [
        { n: 73, t: '09:30', alt: [67], nota: 'Desayuno con espectáculo' },
        { n: 7, t: '11:15' },
        { n: 65, t: '12:45', alt: [64], nota: 'Comida: porción de pizza' },
        { libre: 'descanso', t: '13:30', d: 150, titulo: 'Descanso en el hotel' },
        { n: 25, t: '16:30' },
        { n: 26, t: '17:15' },
        { n: 27, t: '17:35' },
        { n: 74, t: '19:30', alt: [79], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'downtown', titulo: 'Estatua, Lower Manhattan y puente de Brooklyn', zona: 'Puerto · Financial District · DUMBO',
    resumen: 'La Estatua de la Libertad por la mañana, el distrito financiero y el puente de Brooklyn hacia el atardecer.',
    niveles: {
      intenso: [
        { n: 9, t: '09:00', alt: [10], nota: 'Primer ferry; comer algo en las islas' },
        { n: 13, t: '14:45' },
        { n: 12, t: '16:10', nota: 'Museo: última entrada 17:30' },
        { n: 11, t: '18:30', d: 120, nota: 'El puente de noche, con el skyline iluminado' },
        { n: 78, t: '20:45', nota: 'Cena en DUMBO' }
      ],
      equilibrado: [
        { n: 9, t: '09:00', alt: [10], nota: 'Primer ferry; comer algo en las islas' },
        { n: 13, t: '15:00' },
        { n: 11, t: '16:30', nota: 'Atardecer desde el puente' },
        { n: 78, t: '19:15', nota: 'Cena en DUMBO' }
      ],
      relajado: [
        { n: 10, t: '10:00', alt: [9] },
        { n: 13, t: '11:15' },
        { n: 12, t: '12:45', d: 90 },
        { n: 11, t: '15:00', d: 120 },
        { n: 78, t: '17:30', nota: 'Merienda-cena con vistas' }
      ]
    }
  },
  {
    id: 'centralpark', titulo: 'Central Park e Historia Natural', zona: 'Central Park · Upper West Side',
    resumen: 'La mitad sur de Central Park, las galletas de Levain y los dinosaurios del Museo de Historia Natural.',
    niveles: {
      intenso: [
        { n: 67, t: '09:00', nota: 'Desayuno: bagel' },
        { n: 23, t: '09:45' },
        { n: 68, t: '12:00', nota: 'Galleta para el camino' },
        { n: 18, t: '12:30', alt: [17], nota: 'Comer en el food court del museo' },
        { n: 24, t: '16:00', alt: [57] },
        { n: 27, t: '17:45' },
        { n: 75, t: '19:15', alt: [79], nota: 'Cena' },
        { n: 6, t: '21:30' }
      ],
      equilibrado: [
        { n: 73, t: '09:00', alt: [67], nota: 'Desayuno con espectáculo' },
        { n: 23, t: '10:45' },
        { n: 68, t: '13:30' },
        { n: 18, t: '14:00', alt: [17], nota: 'Comer en el food court del museo' },
        { n: 79, t: '19:30', alt: [74], nota: 'Cena' }
      ],
      relajado: [
        { n: 18, t: '10:00', alt: [17], nota: 'A la apertura, antes de las colas' },
        { n: 68, t: '13:15' },
        { n: 23, t: '13:45', d: 120 },
        { libre: 'descanso', t: '16:00', d: 150, titulo: 'Descanso en el hotel' },
        { n: 74, t: '19:30', alt: [73], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'museomile', titulo: 'El Met, Guggenheim y Upper East', zona: 'Upper East Side · 5th Ave',
    resumen: 'Arte en la Milla de los Museos, Central Park y el teleférico de Roosevelt Island al anochecer.',
    niveles: {
      intenso: [
        { n: 23, t: '09:15', d: 150, nota: 'Entrar por Grand Army Plaza y subir hacia el Met' },
        { n: 17, t: '12:00', alt: [18], nota: 'Comer en la cafetería del museo' },
        { n: 20, t: '15:15' },
        { n: 16, t: '17:30', nota: 'Midtown iluminado desde la cabina' },
        { n: 76, t: '19:30', alt: [75, 79], nota: 'Cena' }
      ],
      equilibrado: [
        { n: 17, t: '10:00', alt: [18] },
        { n: 23, t: '13:30', d: 120, nota: 'Comer algo en el parque' },
        { n: 24, t: '15:45', alt: [57] },
        { n: 27, t: '17:30' },
        { n: 79, t: '19:30', alt: [74], nota: 'Cena' }
      ],
      relajado: [
        { n: 17, t: '10:30', alt: [18] },
        { n: 23, t: '14:00', d: 90 },
        { libre: 'descanso', t: '16:00', d: 150, titulo: 'Descanso en el hotel' },
        { n: 73, t: '19:00', alt: [74], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'westside', titulo: 'Hudson Yards, High Line y el Village', zona: 'West Side · Chelsea · Village',
    resumen: 'De los rascacielos nuevos al Nueva York de casas bajas, caminando sobre la antigua vía elevada.',
    niveles: {
      intenso: [
        { n: 67, t: '09:00', nota: 'Desayuno: bagel' },
        { n: 4, t: '09:45', alt: [14] },
        { n: 14, t: '11:00' },
        { n: 15, t: '11:50' },
        { n: 77, t: '13:45', nota: 'Comida: cada uno elige puesto' },
        { n: 49, t: '15:00' },
        { n: 58, t: '17:15' },
        { n: 59, t: '18:10' },
        { n: 71, t: '19:15', nota: 'Cena: pizza de horno de carbón' },
        { n: 32, t: '20:45' }
      ],
      equilibrado: [
        { n: 4, t: '10:00', alt: [14] },
        { n: 14, t: '11:15' },
        { n: 15, t: '12:10' },
        { n: 77, t: '14:00', nota: 'Comida: cada uno elige puesto' },
        { n: 49, t: '15:15' },
        { n: 32, t: '17:30' },
        { n: 71, t: '19:00', nota: 'Cena' }
      ],
      relajado: [
        { n: 14, t: '11:00' },
        { n: 15, t: '11:50' },
        { n: 77, t: '13:45', d: 75, nota: 'Comida' },
        { libre: 'descanso', t: '15:15', d: 150, titulo: 'Descanso en el hotel' },
        { n: 74, t: '19:30', alt: [79], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'barrios', titulo: 'SoHo, Chinatown y Lower East Side', zona: 'Bajo Manhattan',
    resumen: 'Hierro fundido y tiendas en SoHo, mercados de Chinatown, cannoli en Little Italy y el pastrami de Katz\'s.',
    niveles: {
      intenso: [
        { n: 50, t: '09:45' },
        { n: 69, t: '11:45', nota: 'Comida temprana, antes de la cola' },
        { n: 60, t: '13:00' },
        { n: 48, t: '13:45' },
        { n: 66, t: '15:50', nota: 'Merienda' },
        { n: 58, t: '16:45' },
        { n: 59, t: '17:45' },
        { n: 49, t: '18:30', d: 75 },
        { n: 71, t: '20:00', nota: 'Cena' }
      ],
      equilibrado: [
        { n: 48, t: '10:30' },
        { n: 66, t: '12:40', nota: 'Comida: porción cuadrada' },
        { n: 50, t: '13:15' },
        { n: 60, t: '15:15' },
        { n: 69, t: '15:50', nota: 'Merienda-cena, sin la cola de mediodía' },
        { n: 6, t: '19:30', nota: 'Times Square de noche' }
      ],
      relajado: [
        { n: 48, t: '11:00' },
        { n: 66, t: '13:15', nota: 'Comida: porción cuadrada' },
        { n: 50, t: '14:00', d: 90, alt: [47] },
        { libre: 'descanso', t: '16:00', d: 120, titulo: 'Descanso en el hotel' },
        { n: 69, t: '19:15', alt: [72], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'harlem', titulo: 'Domingo en Harlem', zona: 'Harlem · Upper West Side', dias: [3],
    resumen: 'Misa gospel, el barrio del Apollo y el mercadillo dominical del Grand Bazaar.',
    niveles: {
      intenso: [
        { n: 43, t: '09:15' },
        { n: 52, t: '12:30', d: 90, nota: 'Comer soul food (Sylvia\'s)' },
        { n: 61, t: '14:15' },
        { n: 68, t: '15:40' },
        { n: 24, t: '16:30', alt: [23] },
        { n: 27, t: '18:15' },
        { n: 79, t: '19:30', alt: [74], nota: 'Cena' }
      ],
      equilibrado: [
        { n: 43, t: '09:15' },
        { n: 52, t: '12:30', d: 90, nota: 'Comer soul food (Sylvia\'s)' },
        { n: 61, t: '14:30' },
        { n: 68, t: '16:00' },
        { n: 74, t: '19:30', alt: [79], nota: 'Cena' }
      ],
      relajado: [
        { n: 43, t: '09:15' },
        { n: 52, t: '12:30', d: 60, nota: 'Comer soul food (Sylvia\'s)' },
        { libre: 'descanso', t: '14:30', d: 150, titulo: 'Descanso en el hotel' },
        { n: 25, t: '17:15' },
        { n: 26, t: '17:50' },
        { n: 73, t: '19:00', alt: [74], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'brooklyn', titulo: 'Brooklyn: DUMBO y Williamsburg', zona: 'Brooklyn',
    resumen: 'El puente a pie, la azotea del Time Out Market y el vintage de Williamsburg con el skyline al atardecer.',
    niveles: {
      intenso: [
        { n: 67, t: '09:00', nota: 'Desayuno: bagel' },
        { n: 11, t: '09:45' },
        { n: 78, t: '12:15', nota: 'Comida con vistas a los puentes' },
        { n: 62, t: '14:00' },
        { n: 53, t: '16:00', d: 120, nota: 'Domino Park al atardecer (16:40)' },
        { n: 69, t: '19:00', alt: [72], nota: 'Cena' },
        { n: 6, t: '21:00' }
      ],
      equilibrado: [
        { n: 11, t: '10:00' },
        { n: 78, t: '12:45', nota: 'Comida con vistas a los puentes' },
        { n: 62, t: '14:30', d: 90 },
        { n: 53, t: '16:10', d: 105, nota: 'Domino Park al atardecer (16:40)' },
        { n: 79, t: '19:30', alt: [74], nota: 'Cena' }
      ],
      relajado: [
        { n: 11, t: '10:30', d: 120 },
        { n: 78, t: '12:45', d: 90, nota: 'Comida con vistas a los puentes' },
        { n: 53, t: '15:15', d: 90, nota: 'Domino Park al atardecer' },
        { n: 74, t: '19:30', alt: [73], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'midtowneste', titulo: 'ONU, Grand Central y Summit', zona: 'Midtown Este', dias: [4, 5, 6],
    resumen: 'La sede de Naciones Unidas (solo laborables), las grandes salas de la calle 42 y el mirador de los espejos.',
    niveles: {
      intenso: [
        { n: 67, t: '09:00', nota: 'Desayuno: bagel' },
        { n: 45, t: '09:45' },
        { n: 8, t: '11:30' },
        { n: 64, t: '13:15', alt: [65], nota: 'Comida rápida' },
        { n: 56, t: '14:00' },
        { n: 3, t: '15:45', alt: [2], nota: 'Atardecer hacia las 16:40' },
        { n: 16, t: '18:00' },
        { n: 76, t: '19:45', alt: [75], nota: 'Cena' }
      ],
      equilibrado: [
        { n: 45, t: '10:00' },
        { n: 8, t: '12:00', nota: 'Comer en el food court de Grand Central' },
        { n: 29, t: '14:00' },
        { n: 3, t: '15:45', alt: [2], nota: 'Atardecer hacia las 16:40' },
        { n: 79, t: '19:30', alt: [74], nota: 'Cena' }
      ],
      relajado: [
        { n: 8, t: '10:30' },
        { n: 29, t: '12:15', d: 60 },
        { n: 64, t: '13:20', alt: [65], nota: 'Comida rápida' },
        { libre: 'descanso', t: '13:45', d: 120, titulo: 'Descanso en el hotel' },
        { n: 3, t: '16:00', alt: [2] },
        { n: 74, t: '19:00', alt: [73], nota: 'Cena' }
      ]
    }
  },
  {
    id: 'broadway', titulo: 'Día de musical', zona: 'Hudson · Theater District',
    resumen: 'Un día cerca del hotel que deja la noche libre para un musical de Broadway.',
    niveles: {
      intenso: [
        { n: 21, t: '10:00' },
        { n: 65, t: '12:45', nota: 'Comida: porción de pizza' },
        { n: 22, t: '13:30' },
        { n: 31, t: '15:30', alt: [14] },
        { n: 4, t: '16:15', alt: [1], nota: 'Atardecer' },
        { n: 75, t: '17:30', d: 90, alt: [79], nota: 'Cena temprana' },
        { libre: 'musical', t: '19:30', d: 150, titulo: 'Musical de Broadway' }
      ],
      equilibrado: [
        { n: 21, t: '10:00' },
        { n: 65, t: '13:00', nota: 'Comida: porción de pizza' },
        { n: 22, t: '14:00' },
        { libre: 'descanso', t: '15:45', d: 90, titulo: 'Descanso en el hotel' },
        { n: 75, t: '17:30', d: 90, alt: [79], nota: 'Cena temprana' },
        { libre: 'musical', t: '19:30', d: 150, titulo: 'Musical de Broadway' }
      ],
      relajado: [
        { n: 22, t: '10:30' },
        { n: 74, t: '12:15', nota: 'Comida: y la cheesecake' },
        { n: 55, t: '13:30' },
        { libre: 'descanso', t: '14:30', d: 180, titulo: 'Descanso en el hotel' },
        { n: 79, t: '17:45', d: 75, alt: [73], nota: 'Cena temprana' },
        { libre: 'musical', t: '19:30', d: 150, titulo: 'Musical de Broadway' }
      ]
    }
  },
  {
    id: 'woodbury', titulo: 'Día de compras en Woodbury', zona: 'Fuera de la ciudad', dias: [4, 5, 6],
    resumen: 'Un día entero en el outlet; mejor entre semana. Vuelta para cenar cerca del hotel.',
    niveles: {
      intenso: [
        { n: 63, t: '10:15', d: 420, nota: 'Bus desde Port Authority hacia las 8:45' },
        { n: 79, t: '19:30', alt: [74], nota: 'Cena' },
        { n: 6, t: '21:15' }
      ],
      equilibrado: [
        { n: 63, t: '10:30', d: 360, nota: 'Bus desde Port Authority hacia las 9:00' },
        { n: 74, t: '19:30', alt: [79], nota: 'Cena' }
      ],
      relajado: [
        { n: 63, t: '11:30', d: 300, nota: 'Bus desde Port Authority hacia las 10:00' },
        { n: 65, t: '19:30', alt: [64], nota: 'Cena rápida' }
      ]
    }
  },

  /* ---- Medio día: llegada (día 1, desde ~21:00) ---- */
  {
    id: 'llegada', titulo: 'Primera noche', zona: 'Times Square', dias: [1], medio: true,
    resumen: 'Llegada al hotel hacia las 21:00: un primer vistazo a la ciudad sin alejarse.',
    niveles: {
      intenso: [
        { n: 6, t: '21:15' },
        { n: 25, t: '22:05' },
        { n: 26, t: '22:40' }
      ],
      equilibrado: [
        { n: 65, t: '21:15', nota: 'Cena: porción de pizza' },
        { n: 6, t: '21:45' }
      ],
      relajado: [
        { n: 74, t: '21:15', alt: [65], nota: 'Cena cerca del hotel' }
      ]
    }
  },

  /* ---- Medio día: salida (día 7, check-out 12:00, salida al aeropuerto ~18:00) ---- */
  {
    id: 'salida', titulo: 'Última mañana', zona: 'Midtown', dias: [7], medio: true,
    resumen: 'Lo que queda por ver cerca del hotel, con el check-out a mediodía y la tarde tranquila.',
    niveles: {
      intenso: [
        { n: 1, t: '09:00', alt: [3, 2] },
        { n: 7, t: '10:30', alt: [8] },
        { n: 19, t: '12:30', alt: [22, 21] },
        { n: 65, t: '15:00', alt: [64], nota: 'Comida tardía' },
        { n: 54, t: '15:45', alt: [55] }
      ],
      equilibrado: [
        { n: 67, t: '09:00', alt: [73], nota: 'Desayuno' },
        { n: 23, t: '09:40', d: 90 },
        { n: 74, t: '12:45', alt: [79], nota: 'Comida' },
        { n: 55, t: '14:00', alt: [54] },
        { n: 6, t: '15:00' }
      ],
      relajado: [
        { n: 73, t: '09:30', alt: [67], nota: 'Desayuno con espectáculo' },
        { n: 29, t: '12:30', d: 60, alt: [7] },
        { n: 64, t: '13:45', alt: [65], nota: 'Comida rápida' },
        { n: 55, t: '14:30', alt: [6] }
      ]
    }
  }
];

window.NIVELES = [
  { id: 'intenso', nombre: 'Intenso', desc: 'Todo lo que cabe' },
  { id: 'equilibrado', nombre: 'Equilibrado', desc: 'Con pausas' },
  { id: 'relajado', nombre: 'Relajado', desc: 'Pocas paradas y descanso' }
];
