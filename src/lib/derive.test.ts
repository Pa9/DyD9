import { describe, expect, test } from "bun:test";
import { createCharacter } from "./storage";
import { levelUpRequirements } from "./derive";

function characterWithBackground() {
  return createCharacter({
    name: "Exploradora",
    speciesId: "human",
    classId: "fighter",
    backgroundId: "soldier",
    skillProficiencies: ["athletics", "intimidation"],
  });
}

describe("validación de mejoras de trasfondo", () => {
  test("acepta +2/+1 en características permitidas", () => {
    const c = characterWithBackground();
    c.backgroundAbilities = { str: 2, dex: 1 };
    expect(levelUpRequirements(c)).not.toContain("Mejoras de trasfondo");
  });

  test("acepta +1/+1/+1 en las tres características permitidas", () => {
    const c = characterWithBackground();
    c.backgroundAbilities = { str: 1, dex: 1, con: 1 };
    expect(levelUpRequirements(c)).not.toContain("Mejoras de trasfondo");
  });

  test("rechaza tres puntos en una sola característica", () => {
    const c = characterWithBackground();
    c.backgroundAbilities = { str: 3 };
    expect(levelUpRequirements(c)).toContain("Mejoras de trasfondo");
  });

  test("rechaza características no permitidas por el trasfondo", () => {
    const c = characterWithBackground();
    c.backgroundAbilities = { str: 2, cha: 1 };
    expect(levelUpRequirements(c)).toContain("Mejoras de trasfondo");
  });
});

describe("progresión guiada", () => {
  test("requiere elegir una subclase al nivel correspondiente", () => {
    const c = characterWithBackground();
    c.backgroundAbilities = { str: 2, dex: 1 };
    c.level = 3;
    expect(levelUpRequirements(c)).toContain("Subclase");
  });

  test("una mejora de característica vacía no permite avanzar", () => {
    const c = characterWithBackground();
    c.backgroundAbilities = { str: 2, dex: 1 };
    c.level = 4;
    c.subclassId = "champion";
    c.asi = [{ level: 4, type: "asi", abilities: [] }];
    expect(levelUpRequirements(c)).toContain("Mejoras de característica");
  });
});
