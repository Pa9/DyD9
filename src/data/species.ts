import type { Species } from "@/lib/types";

export const SPECIES: Species[] = [
  {
    id: "human",
    name: "Humano",
    desc: "Versátiles y ambiciosos, los humanos destacan por su adaptabilidad y determinación.",
    size: "Mediano",
    speed: 30,
    traits: [
      {
        level: 1,
        name: "Ingenio",
        desc: "Ganas competencia en una tirada de salvación de tu elección.",
        choice: {
          id: "human-resourceful",
          label: "Dote de origen adicional",
          count: 1,
          options: [
            { id: "alert", name: "Alerta" },
            { id: "healer", name: "Sanador" },
            { id: "lucky", name: "Afortunado" },
            { id: "savage-attacker", name: "Atacante Salvaje" },
            { id: "skilled", name: "Diestro" },
            { id: "tough", name: "Duro" },
          ],
        },
      },
      { level: 1, name: "Hábil", desc: "Ganas competencia en una habilidad adicional." },
      {
        level: 1,
        name: "Versátil",
        desc: "Obtienes una dote de origen adicional a tu elección.",
      },
    ],
  },
  {
    id: "elf",
    name: "Elfo",
    desc: "Longevos y mágicos, los elfos poseen sentidos agudos y afinidad natural con la magia.",
    size: "Mediano",
    speed: 30,
    traits: [
      { level: 1, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 60 pies." },
      {
        level: 1,
        name: "Sentidos Élficos",
        desc: "Competencia en Percepción y ventaja en salvaciones contra el estado hechizado.",
      },
      { level: 1, name: "Trance Élfico", desc: "Un descanso largo te lleva solo 4 horas." },
      {
        level: 1,
        name: "Linaje Élfico",
        desc: "Elige un linaje que otorga conjuros y beneficios adicionales.",
        choice: {
          id: "elf-lineage",
          label: "Linaje élfico",
          count: 1,
          options: [
            {
              id: "drow",
              name: "Drow",
              desc: "Visión en la oscuridad 120 pies, truco Llama Sagrada; a nivel 3 Fuego Feérico, a nivel 5 Oscuridad.",
            },
            {
              id: "high-elf",
              name: "Elfo Alto",
              desc: "Truco Prestidigitación (cambiable en descansos largos); a nivel 3 Detectar Magia, a nivel 5 Paso Brumoso.",
            },
            {
              id: "wood-elf",
              name: "Elfo de los Bosques",
              desc: "Velocidad 35 pies, truco Druidcraft; a nivel 3 Zancada Prodigiosa, a nivel 5 Pasar sin Rastro.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "dwarf",
    name: "Enano",
    desc: "Resistentes y tenaces, forjados en la piedra y el metal de las profundidades.",
    size: "Mediano",
    speed: 30,
    traits: [
      { level: 1, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 120 pies." },
      {
        level: 1,
        name: "Resiliencia Enana",
        desc: "Resistencia al daño de veneno y ventaja en salvaciones contra veneno.",
      },
      {
        level: 1,
        name: "Aguante Enano",
        desc: "Tus puntos de golpe máximos aumentan en 1 por cada nivel de personaje.",
      },
      {
        level: 1,
        name: "Sentido de la Piedra",
        desc: "Obtienes sentido del temblor de 10 pies al estar en contacto con piedra.",
      },
    ],
  },
  {
    id: "halfling",
    name: "Mediano",
    desc: "Pequeños, afortunados y valientes; nadie los subestima dos veces.",
    size: "Pequeño",
    speed: 30,
    traits: [
      { level: 1, name: "Valentía", desc: "Ventaja en salvaciones contra el estado asustado." },
      {
        level: 1,
        name: "Agilidad Mediana",
        desc: "Puedes moverte a través del espacio de criaturas de tamaño mayor que el tuyo.",
      },
      { level: 1, name: "Suerte", desc: "Puedes volver a tirar un 1 en pruebas, ataques o salvaciones." },
      { level: 1, name: "Sigiloso por Naturaleza", desc: "Puedes esconderte tras una criatura mayor." },
    ],
  },
  {
    id: "dragonborn",
    name: "Dracónido",
    desc: "Herederos del poder dracónico, con aliento elemental y alas ancestrales.",
    size: "Mediano",
    speed: 30,
    traits: [
      {
        level: 1,
        name: "Ascendencia Dracónica",
        desc: "Elige un tipo de dragón; determina tu daño de aliento y resistencia.",
        choice: {
          id: "draconic-ancestry",
          label: "Ascendencia dracónica",
          count: 1,
          options: [
            { id: "black", name: "Negro (ácido)" },
            { id: "blue", name: "Azul (relámpago)" },
            { id: "brass", name: "Latón (fuego)" },
            { id: "bronze", name: "Bronce (relámpago)" },
            { id: "copper", name: "Cobre (ácido)" },
            { id: "gold", name: "Oro (fuego)" },
            { id: "green", name: "Verde (veneno)" },
            { id: "red", name: "Rojo (fuego)" },
            { id: "silver", name: "Plata (frío)" },
            { id: "white", name: "Blanco (frío)" },
          ],
        },
      },
      {
        level: 1,
        name: "Aliento de Dragón",
        desc: "Reemplaza un ataque para exhalar energía en línea o cono (1d10, aumenta a niveles 5, 11 y 17).",
      },
      { level: 1, name: "Resistencia al Daño", desc: "Resistencia al tipo de daño de tu ascendencia." },
      { level: 5, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 60 pies." },
      { level: 10, name: "Vuelo Dracónico", desc: "Como acción adicional, ganas velocidad de vuelo igual a tu velocidad por 10 minutos." },
    ],
  },
  {
    id: "tiefling",
    name: "Tiflin",
    desc: "Marcados por un legado planar, canalizan magia infernal, abisal o ctónica.",
    size: "Mediano",
    speed: 30,
    traits: [
      { level: 1, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 60 pies." },
      { level: 1, name: "Herencia Infernal", desc: "Conoces el truco Taumaturgia y aprendes conjuros según tu legado." },
      {
        level: 1,
        name: "Legado Planar",
        desc: "Elige tu legado; determina resistencias y conjuros.",
        choice: {
          id: "fiendish-legacy",
          label: "Legado planar",
          count: 1,
          options: [
            { id: "abyssal", name: "Abisal", desc: "Resistencia a veneno; Bendición, Rayo de Enfermedad, Aura de Vitalidad." },
            { id: "chthonic", name: "Ctónico", desc: "Resistencia a necrótico; Perdición, Falsa Vida, Toque Vampírico." },
            { id: "infernal", name: "Infernal", desc: "Resistencia a fuego; Reprensión Infernal, Manos Ardientes, Bola de Fuego." },
          ],
        },
      },
      { level: 5, name: "Legado Reforzado", desc: "Puedes lanzar el conjuro de nivel 1 de tu legado sin gastar espacio una vez por descanso largo." },
    ],
  },
  {
    id: "gnome",
    name: "Gnomo",
    desc: "Curiosos inventores de mente resistente a la magia.",
    size: "Pequeño",
    speed: 30,
    traits: [
      { level: 1, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 60 pies." },
      { level: 1, name: "Astucia Gnoma", desc: "Ventaja en salvaciones de Inteligencia, Sabiduría y Carisma contra magia." },
      {
        level: 1,
        name: "Linaje Gnomo",
        desc: "Elige tu linaje gnomo.",
        choice: {
          id: "gnome-lineage",
          label: "Linaje gnomo",
          count: 1,
          options: [
            { id: "forest", name: "Gnomo del Bosque", desc: "Truco Ilusión Menor y hablas con bestias pequeñas." },
            { id: "rock", name: "Gnomo de las Rocas", desc: "Competencia con herramientas de manitas y creas artilugios." },
          ],
        },
      },
    ],
  },
  {
    id: "orc",
    name: "Orco",
    desc: "Fuertes e implacables, con vigor sobrenatural para seguir luchando.",
    size: "Mediano",
    speed: 30,
    traits: [
      { level: 1, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 120 pies." },
      { level: 1, name: "Resistencia Incansable", desc: "Al caer a 0 pg puedes quedarte en 1 pg (una vez por descanso largo)." },
      { level: 1, name: "Embate Adrenalínico", desc: "Al usar Esprintar ganas puntos de golpe temporales." },
    ],
  },
  {
    id: "goliath",
    name: "Goliath",
    desc: "Descendientes de gigantes, enormes y poderosos.",
    size: "Mediano",
    speed: 35,
    traits: [
      { level: 1, name: "Constitución Gigantesca", desc: "Tienes ventaja en salvaciones contra el estado apresado." },
      { level: 1, name: "Poderoso", desc: "Cuentas como una talla mayor al determinar tu capacidad de carga." },
      {
        level: 1,
        name: "Ascendencia Gigante",
        desc: "Elige un tipo de gigante que otorga un beneficio usable por descanso.",
        choice: {
          id: "giant-ancestry",
          label: "Ascendencia de gigante",
          count: 1,
          options: [
            { id: "cloud", name: "Gigante de las Nubes", desc: "Teletransporte corto como acción adicional." },
            { id: "fire", name: "Gigante de Fuego", desc: "Daño de fuego adicional al golpear." },
            { id: "frost", name: "Gigante de Escarcha", desc: "Daño de frío y reduces la velocidad del objetivo." },
            { id: "hill", name: "Gigante de las Colinas", desc: "Derribas al objetivo al golpear." },
            { id: "stone", name: "Gigante de Piedra", desc: "Reacción para reducir daño recibido." },
            { id: "storm", name: "Gigante de las Tormentas", desc: "Daño de trueno en área al golpear." },
          ],
        },
      },
      { level: 5, name: "Zancada Gigante", desc: "Como acción adicional, aumentas tu tamaño a Grande durante 10 minutos (una vez por descanso largo)." },
    ],
  },
  {
    id: "aasimar",
    name: "Aasimar",
    desc: "Tocados por los Planos Superiores, portan luz curativa y una forma radiante.",
    size: "Mediano",
    speed: 30,
    traits: [
      { level: 1, name: "Visión en la Oscuridad", desc: "Ves en la oscuridad hasta 60 pies." },
      { level: 1, name: "Manos Curativas", desc: "Como acción, curas puntos de golpe iguales a tiradas de d4 (una vez por descanso largo)." },
      { level: 1, name: "Portador de Luz", desc: "Conoces el truco Luz." },
      { level: 1, name: "Resistencia Celestial", desc: "Resistencia al daño necrótico y radiante." },
      { level: 3, name: "Revelación Celestial", desc: "Como acción adicional te transformas (alas, alma radiante o mortaja necrótica) durante 1 minuto." },
    ],
  },
];

export const SPECIES_MAP = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
