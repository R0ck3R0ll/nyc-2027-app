"""Metadatos de planificación de cada ficha (se combinan con el JSON de la Fase 3).

Días del viaje: 1 vie 1 ene · 2 sáb · 3 dom · 4 lun · 5 mar · 6 mié · 7 jue 7 ene.

  dur    duración de la visita en minutos
  h      horario: "HH:MM-HH:MM" igual todos los días, o dict {día: "HH:MM-HH:MM" | None (cerrado)}
         con clave "*" para el resto de días
  last   hora límite para empezar (si es distinta del cierre menos la duración)
  fun    funciones con hora fija {día: ["HH:MM", ...]} (espectáculos, visitas guiadas)
  meal   comidas para las que sirve: des (desayuno), com (comida), cen (cena), snk (tentempié)
  luz    True si conviene hacerlo con luz de día (oscurece ~16:40)
  franja momento ideal: "manana" | "tarde" | "atardecer" | "noche"
  notas  {día: "aviso"} avisos de ese día
  viaje  minutos fijos de desplazamiento desde Manhattan (sustituye al cálculo por distancia)
"""

D = range(1, 8)

def ov(h, over):
    r = {d: h for d in D}
    r.update(over)
    return r


def week(lun, mar, mie, jue, vie, sab, dom):
    """Convierte horario por día de la semana a días del viaje (1 = viernes)."""
    return {1: vie, 2: sab, 3: dom, 4: lun, 5: mar, 6: mie, 7: jue}

META = {
    1:  dict(dur=75,  h="08:00-24:00", last="23:10", franja="atardecer"),
    2:  dict(dur=90,  h="09:00-22:00"),
    3:  dict(dur=105, h="08:00-24:00", last="22:30", franja="atardecer"),
    4:  dict(dur=60,  h="09:00-22:00", franja="atardecer"),
    5:  dict(dur=60,  h="09:00-21:00", luz=True),
    6:  dict(dur=45,  h="00:00-24:00", franja="noche"),
    7:  dict(dur=60,  h="06:30-23:00"),
    8:  dict(dur=90,  h=(week("10:00-18:00", "10:00-20:00", "10:00-20:00", "10:00-18:00",
                                  "10:00-18:00", "10:00-18:00", "13:00-17:00")),
             notas={1: "1 de enero: la Biblioteca está cerrada; Grand Central abierta"}),
    9:  dict(dur=330, h="08:30-17:00", last="11:30", franja="manana", luz=True,
             notas={"*": "Último ferry hacia las 15:15: para las dos islas, empezar antes de las 11:30"}),
    10: dict(dur=60,  h="00:00-24:00"),
    11: dict(dur=150, h="00:00-24:00"),
    12: dict(dur=120, h=ov("09:00-19:00", {5: "08:00-20:00"}), last="17:30",
             notas={5: "Martes: el museo cierra; solo el Memorial exterior (30 min)",
                    4: "Lunes: museo gratis de 17:30 a 19:00 (entradas online ese día a las 7:00)"}),
    13: dict(dur=75,  h="00:00-24:00"),
    14: dict(dur=45,  h="11:00-21:00", notas={"*": "Vessel: cerrado de 17:00 a 19:00"}),
    15: dict(dur=105, h="07:00-20:00", luz=True),
    16: dict(dur=60,  h="06:00-24:00", franja="atardecer"),
    17: dict(dur=180, h={1: None, 2: "10:00-21:00", 3: "10:00-17:00", 4: "10:00-17:00",
                         5: "10:00-17:00", 6: None, 7: "10:00-17:00"}),
    18: dict(dur=180, h="10:00-17:30",
             notas={2: "Fin de semana: colas de seguridad de 1–2 h; llegar a la apertura",
                    3: "Fin de semana: colas de seguridad de 1–2 h; llegar a la apertura"}),
    19: dict(dur=135, h=ov("10:30-17:30", {1: "10:30-20:30"})),
    20: dict(dur=105, h="10:30-17:30",
             notas={3: "Paga lo que quieras de 16:00 a 17:30", 5: "Paga lo que quieras de 16:00 a 17:30"}),
    21: dict(dur=150, h="10:00-17:00", last="16:00"),
    22: dict(dur=90,  h=week("09:30-16:00", "09:30-16:00", "09:30-16:00", "09:30-18:30",
                             "09:30-18:30", "09:30-18:30", "09:30-18:30")),
    23: dict(dur=150, h="06:00-24:00", luz=True, franja="manana"),
    24: dict(dur=90,  h=week("10:00-14:30", "10:00-14:30", "10:00-21:00", "10:00-21:00",
                             "10:00-22:00", "10:00-22:00", "10:00-21:00")),
    25: dict(dur=30,  h="05:00-24:00", franja="noche"),
    26: dict(dur=15,  h="17:00-23:00", franja="noche",
             notas={"*": "Fecha de fin 2026-27 sin confirmar (otros años, primeros días de enero)"}),
    27: dict(dur=60,  h="00:00-24:00", franja="atardecer",
             notas={"*": "Los escaparates se desmontan a primeros de enero: cuanto antes, mejor"}),
    28: dict(dur=90,  fun={2: ["20:00"], 3: ["17:00"], 4: ["14:00"]}),
    29: dict(dur=75,  h={1: "08:00-24:00", 2: "08:00-24:00", 3: "08:00-24:00", 4: "08:00-22:00",
                         5: "08:00-22:00", 6: "08:00-22:00", 7: "08:00-22:00"},
             notas={1: "Mercadillo 11:00–20:00", 2: "Mercadillo 10:00–20:00 (último fin de semana)",
                    3: "Último día del mercadillo (10:00–20:00)",
                    4: "Mercadillo ya cerrado: solo la pista", 5: "Mercadillo ya cerrado: solo la pista",
                    6: "Mercadillo ya cerrado: solo la pista", 7: "Mercadillo ya cerrado: solo la pista"}),
    30: dict(dur=90,  h="16:30-21:00", franja="noche",
             notas={"*": "Algunas casas apagan después del 1 de enero; confirmar antes"}),
    31: dict(dur=45,  h="10:00-22:00", franja="noche"),
    32: dict(dur=20,  h="00:00-24:00", franja="noche"),
    33: dict(dur=150, fun={1: ["19:00"], 2: ["14:00", "19:30"], 3: ["15:00"], 5: ["19:00"], 6: ["19:00"]}),
    34: dict(dur=165, fun={2: ["14:00", "20:00"], 3: ["14:00"], 5: ["19:00"], 6: ["19:00"]}),
    35: dict(dur=150, fun={2: ["14:00", "19:30"], 3: ["15:00"], 5: ["19:00"], 6: ["19:00"]}),
    36: dict(dur=150, fun={2: ["14:00", "20:00"], 3: ["15:00"], 5: ["19:00"], 6: ["13:00", "19:00"]}),
    37: dict(dur=150, fun={1: ["19:00"], 2: ["14:00", "20:00"], 3: ["15:00"], 5: ["19:00"], 6: ["14:00", "19:30"]}),
    38: dict(dur=150, fun={1: ["14:00", "20:00"], 2: ["14:00", "20:00"], 3: ["15:00"], 4: ["19:00"],
                           6: ["19:00"], 7: ["14:00"]}),
    39: dict(dur=150, fun={1: ["19:00"], 2: ["14:00", "19:30"], 3: ["15:00"], 5: ["19:00"], 6: ["14:00", "19:30"]}),
    40: dict(dur=130, fun={1: ["19:00"], 2: ["14:00", "19:30"], 3: ["15:00"], 5: ["19:00"], 6: ["14:00", "19:30"]}),
    41: dict(dur=160, fun={1: ["20:00"], 2: ["14:00", "20:00"], 3: ["15:00"]}),
    42: dict(dur=175, fun={2: ["14:00", "20:00"], 3: ["15:00"], 5: ["19:00"], 6: ["13:00", "19:00"]}),
    43: dict(dur=180, fun={3: ["09:15", "07:45"]}),
    44: dict(dur=80,  h="09:00-17:00", notas={"*": "Horarios según la producción del día; salen ~1 mes antes"}),
    45: dict(dur=90,  h={1: None, 2: None, 3: None, 4: "09:00-16:30", 5: "09:00-16:30",
                         6: "09:00-16:30", 7: "09:00-16:30"},
             notas={"*": "Registro de seguridad previo de cada visitante, con foto"}),
    46: dict(dur=165, h="10:00-18:00"),
    47: dict(dur=180, h="10:30-17:00", meal=["com"]),
    48: dict(dur=120, h="10:00-20:00", notas={3: "Domingo: las tiendas abren hacia las 12:00"}),
    49: dict(dur=120, h="00:00-24:00"),
    50: dict(dur=105, h="09:00-22:00"),
    51: dict(dur=120, h="07:00-22:00",
             notas={3: "Galerías de arte cerradas en domingo", 4: "Galerías de arte cerradas en lunes"}),
    52: dict(dur=150, h="09:00-20:00", luz=True),
    53: dict(dur=150, h="10:00-22:00", franja="atardecer"),
    54: dict(dur=45,  h=week("10:00-20:00", "10:00-20:00", "10:00-20:00", "10:00-20:00",
                             "10:00-20:00", "10:00-20:00", "11:00-19:00")),
    55: dict(dur=40,  h=week("10:00-23:00", "10:00-23:00", "10:00-23:00", "10:00-23:00",
                             "09:00-24:00", "09:00-24:00", "09:00-24:00")),
    56: dict(dur=75,  h=week("10:00-21:00", "10:00-21:00", "10:00-21:00", "10:00-21:00",
                             "10:00-22:00", "10:00-22:00", "11:00-21:00")),
    57: dict(dur=40,  h=week("10:00-20:00", "10:00-20:00", "10:00-20:00", "10:00-20:00",
                             "10:00-20:00", "10:00-20:00", "11:00-19:00")),
    58: dict(dur=50,  h="10:00-21:00"),
    59: dict(dur=30,  h="11:00-19:00"),
    60: dict(dur=25,  h="11:00-18:00"),
    61: dict(dur=75,  h={1: None, 2: None, 3: "10:00-17:00", 4: None, 5: None, 6: None, 7: None}),
    62: dict(dur=105, h="11:00-19:00",
             notas={"*": "Artists & Fleas solo abre sábado y domingo"}),
    63: dict(dur=330, h="10:00-21:00", viaje=90),
    64: dict(dur=20,  h="10:00-24:00", meal=["com", "cen", "snk"]),
    65: dict(dur=25,  h="10:00-24:00", meal=["com", "cen", "snk"]),
    66: dict(dur=25,  h="10:00-24:00", meal=["com", "snk"]),
    67: dict(dur=30,  h="05:00-19:30", meal=["des"]),
    68: dict(dur=15,  h="07:00-21:00", meal=["snk"]),
    69: dict(dur=60,  h="08:00-23:00", meal=["com", "cen"],
             notas={"*": "De 13:00 a 16:00 la cola puede pasar de una hora"}),
    70: dict(dur=45,  h="08:00-16:00", meal=["des", "com"]),
    71: dict(dur=60,  h=ov("11:30-22:00", {1: "11:30-23:00", 2: "11:30-23:00"}),
             meal=["com", "cen"]),
    72: dict(dur=50,  h="11:00-22:30", meal=["com", "cen"]),
    73: dict(dur=75,  h="07:00-24:00", meal=["des", "com", "cen"]),
    74: dict(dur=50,  h="07:00-23:00", meal=["com", "cen", "snk"]),
    75: dict(dur=105, h=ov("11:45-22:00", {1: "11:45-23:00", 2: "11:45-23:00"}),
             meal=["cen"]),
    76: dict(dur=105, h=week("11:45-22:30", "11:45-22:30", "11:45-22:30", "11:45-22:30",
                             "11:45-22:30", "17:00-22:30", "17:00-21:30"), meal=["com", "cen"]),
    77: dict(dur=60,  h="07:00-22:00", meal=["com", "snk"]),
    78: dict(dur=75,  h=ov("08:00-22:00", {1: "08:00-23:00", 2: "08:00-23:00"}),
             meal=["com", "cen"]),
    79: dict(dur=90,  h=ov("11:30-23:00", {1: "11:30-24:00", 2: "11:00-24:00", 3: "11:00-23:00"}),
             meal=["com", "cen"]),
    80: dict(dur=105, h={1: None, 2: "10:30-17:00", 3: "10:30-17:00", 4: None, 5: "10:30-17:00",
                         6: "10:30-17:00", 7: "10:30-17:00"},
             notas={3: "Salas históricas gratis de 15:00 a 17:00 (sin exposiciones)", 5: "Salas históricas gratis de 15:00 a 17:00 (sin exposiciones)"}),
}
