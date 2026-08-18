import type { Feat } from "@/lib/types";

export const FEATS: Feat[] = [
  // Dotes de origen (trasfondo)
  {
    id: "alert",
    name: "Alerta",
    category: "origin",
    desc: "Ganas un bonificador a la iniciativa igual a tu bonificador de competencia y puedes intercambiar tu iniciativa con la de un aliado dispuesto.",
  },
  {
    id: "crafter",
    name: "Artesano",
    category: "origin",
    desc: "Competencia con tres herramientas de artesano, descuento del 20% en compras no mágicas y puedes fabricar objetos sencillos en un descanso.",
  },
  {
    id: "healer",
    name: "Sanador",
    category: "origin",
    desc: "Usa un kit de sanador para restaurar puntos de golpe y estabilizar criaturas con mayor eficacia.",
  },
  {
    id: "lucky",
    name: "Afortunado",
    category: "origin",
    desc: "Tienes puntos de suerte iguales a tu nivel para obtener ventaja en pruebas o imponer desventaja a un ataque.",
  },
  {
    id: "magic-initiate-arcane",
    name: "Iniciado en la Magia (Arcano)",
    category: "origin",
    desc: "Aprendes dos trucos y un conjuro de nivel 1 de la lista de mago; puedes lanzarlo una vez por descanso largo.",
  },
  {
    id: "magic-initiate-divine",
    name: "Iniciado en la Magia (Divino)",
    category: "origin",
    desc: "Aprendes dos trucos y un conjuro de nivel 1 de la lista de clérigo; puedes lanzarlo una vez por descanso largo.",
  },
  {
    id: "magic-initiate-primal",
    name: "Iniciado en la Magia (Primigenio)",
    category: "origin",
    desc: "Aprendes dos trucos y un conjuro de nivel 1 de la lista de druida; puedes lanzarlo una vez por descanso largo.",
  },
  {
    id: "musician",
    name: "Músico",
    category: "origin",
    desc: "Competencia con tres instrumentos musicales y puedes inspirar a aliados tras un descanso.",
  },
  {
    id: "savage-attacker",
    name: "Atacante Salvaje",
    category: "origin",
    desc: "Una vez por turno, al golpear con un arma puedes tirar de nuevo el daño y usar el mejor resultado.",
  },
  {
    id: "skilled",
    name: "Diestro",
    category: "origin",
    desc: "Ganas competencia en tres habilidades o herramientas a tu elección.",
  },
  {
    id: "tavern-brawler",
    name: "Peleonero de Taberna",
    category: "origin",
    desc: "Tu golpe sin armas causa 1d4, puedes empujar tras golpear y ganas competencia con armas improvisadas.",
  },
  {
    id: "tough",
    name: "Duro",
    category: "origin",
    desc: "Tus puntos de golpe máximos aumentan en el doble de tu nivel.",
  },
  // Dotes generales (nivel 4+)
  {
    id: "ability-improvement",
    name: "Mejora de Puntuación de Característica",
    category: "general",
    desc: "Aumenta una puntuación de característica en 2, o dos puntuaciones en 1 (máximo 20).",
  },
  {
    id: "actor",
    name: "Actor",
    category: "general",
    desc: "+1 Carisma, ventaja en Engaño e Interpretación al hacerte pasar por alguien e imitas voces.",
  },
  {
    id: "athlete",
    name: "Atleta",
    category: "general",
    desc: "+1 Fuerza o Destreza, levantarte cuesta la mitad de movimiento y trepas a velocidad normal.",
  },
  {
    id: "charger",
    name: "Cargador",
    category: "general",
    desc: "+1 Fuerza o Destreza y daño extra o empuje al cargar tras un Esprint.",
  },
  {
    id: "defensive-duelist",
    name: "Duelista Defensivo",
    category: "general",
    desc: "+1 Destreza y puedes usar tu reacción para añadir tu bonificador de competencia a tu CA.",
  },
  {
    id: "elemental-adept",
    name: "Adepto Elemental",
    category: "general",
    desc: "+1 en la característica de lanzamiento; tus conjuros ignoran la resistencia a un tipo de daño elemental.",
  },
  {
    id: "grappler",
    name: "Luchador",
    category: "general",
    desc: "+1 Fuerza o Destreza, ventaja contra criaturas que agarras y puedes agarrar tras un ataque.",
  },
  {
    id: "great-weapon-master",
    name: "Maestro de Armas Grandes",
    category: "general",
    desc: "+1 Fuerza y daño masivo con armas pesadas; ataque adicional al reducir a 0 pg o crítico.",
  },
  {
    id: "heavy-armor-master",
    name: "Maestro de la Armadura Pesada",
    category: "general",
    desc: "+1 Fuerza y reduces el daño físico recibido en tu bonificador de competencia.",
  },
  {
    id: "inspiring-leader",
    name: "Líder Inspirador",
    category: "general",
    desc: "+1 Sabiduría o Carisma y otorgas puntos de golpe temporales a tus aliados tras un descanso.",
  },
  {
    id: "keen-mind",
    name: "Mente Aguda",
    category: "general",
    desc: "+1 Inteligencia, memoria perfecta y puedes estudiar a una criatura para conocer sus debilidades.",
  },
  {
    id: "mage-slayer",
    name: "Matamagos",
    category: "general",
    desc: "+1 Fuerza o Destreza y ventaja en salvaciones contra conjuros de criaturas cercanas.",
  },
  {
    id: "medium-armor-master",
    name: "Maestro de la Armadura Intermedia",
    category: "general",
    desc: "+1 Fuerza o Destreza, sin desventaja en Sigilo y hasta +3 Des a la CA con armadura intermedia.",
  },
  {
    id: "mobile",
    name: "Móvil",
    category: "general",
    desc: "+1 Destreza, +10 pies de velocidad y evitas ataques de oportunidad tras atacar.",
  },
  {
    id: "polearm-master",
    name: "Maestro de Armas de Asta",
    category: "general",
    desc: "+1 Fuerza o Destreza, ataque adicional con el extremo del asta y ataques de oportunidad ampliados.",
  },
  {
    id: "resilient",
    name: "Resistente",
    category: "general",
    desc: "+1 a una característica y competencia en sus tiradas de salvación.",
  },
  {
    id: "sentinel",
    name: "Centinela",
    category: "general",
    desc: "+1 Fuerza o Destreza; tus ataques de oportunidad reducen la velocidad a 0.",
  },
  {
    id: "sharpshooter",
    name: "Tirador Certero",
    category: "general",
    desc: "+1 Destreza, ignoras cobertura y penalizaciones por alcance largo.",
  },
  {
    id: "spell-sniper",
    name: "Francotirador Mágico",
    category: "general",
    desc: "+1 en la característica de lanzamiento, doble alcance de conjuros de ataque y aprendes un truco.",
  },
  {
    id: "war-caster",
    name: "Lanzador de Combate",
    category: "general",
    desc: "+1 en la característica de lanzamiento, ventaja en salvaciones de concentración y conjuros como reacción.",
  },
  // Estilos de combate
  {
    id: "fs-archery",
    name: "Arquería",
    category: "fighting-style",
    desc: "+2 a las tiradas de ataque con armas a distancia.",
  },
  {
    id: "fs-defense",
    name: "Defensa",
    category: "fighting-style",
    desc: "+1 a la CA mientras lleves armadura.",
  },
  {
    id: "fs-dueling",
    name: "Duelo",
    category: "fighting-style",
    desc: "+2 al daño si empuñas un arma cuerpo a cuerpo en una mano y ninguna otra arma.",
  },
  {
    id: "fs-great-weapon",
    name: "Lucha con Armas Grandes",
    category: "fighting-style",
    desc: "Puedes volver a tirar 1 o 2 en el daño de armas a dos manos o versátiles.",
  },
  {
    id: "fs-protection",
    name: "Protección",
    category: "fighting-style",
    desc: "Impones desventaja a un ataque contra un aliado cercano usando tu reacción y un escudo.",
  },
  {
    id: "fs-two-weapon",
    name: "Lucha con Dos Armas",
    category: "fighting-style",
    desc: "Añades tu modificador de característica al daño del segundo ataque.",
  },
  {
    id: "fs-blind-fighting",
    name: "Lucha a Ciegas",
    category: "fighting-style",
    desc: "Tienes visión ciega de 10 pies.",
  },
  {
    id: "fs-interception",
    name: "Intercepción",
    category: "fighting-style",
    desc: "Reduces el daño que recibe un aliado cercano usando tu reacción.",
  },
  {
    id: "fs-thrown-weapon",
    name: "Armas Arrojadizas",
    category: "fighting-style",
    desc: "Puedes desenfundar un arma arrojadiza como parte del ataque y ganas +2 al daño.",
  },
  {
    id: "fs-unarmed",
    name: "Combate sin Armas",
    category: "fighting-style",
    desc: "Tus golpes sin armas causan 1d6+mod y dañas a criaturas que agarras.",
  },
];

export const FEAT_MAP = Object.fromEntries(FEATS.map((f) => [f.id, f]));

export const FIGHTING_STYLE_OPTIONS = FEATS.filter((f) => f.category === "fighting-style").map(
  (f) => ({ id: f.id, name: f.name, desc: f.desc }),
);
