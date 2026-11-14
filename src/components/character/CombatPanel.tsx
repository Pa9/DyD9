import { useState } from "react";
import { Section, type SectionProps } from "@/components/character/parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maxHp, spellSlots } from "@/lib/derive";

const CONDITIONS = ["Agarrado", "Apresado", "Aturdido", "Cegado", "Derribado", "Ensordecido", "Envenenado", "Hechizado", "Incapacitado", "Inconsciente", "Invisible", "Paralizado", "Petrificado", "Asustado"];

export function CombatPanel({ character, update }: SectionProps) {
  const maximum = maxHp(character);
  const hp = Math.min(maximum, Math.max(0, character.currentHp ?? maximum));
  const temp = Math.max(0, character.tempHp ?? 0);
  const [amount, setAmount] = useState("1");
  const n = Math.max(0, Math.floor(Number(amount) || 0));
  const death = character.deathSaves ?? { successes: 0, failures: 0 };
  const slots = spellSlots(character);

  const damage = () => update(c => {
    const t = Math.max(0, c.tempHp ?? 0);
    const absorbed = Math.min(t, n);
    const current = Math.min(maxHp(c), Math.max(0, c.currentHp ?? maxHp(c)));
    return { tempHp: t - absorbed, currentHp: Math.max(0, current - (n - absorbed)) };
  });
  const heal = () => update(c => ({
    currentHp: Math.min(maxHp(c), Math.max(0, c.currentHp ?? maxHp(c)) + n),
    ...(n > 0 ? { deathSaves: { successes: 0, failures: 0 } } : {}),
  }));
  const deathRoll = (roll: number) => {
    if (roll === 20) {
      update({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } });
      return;
    }
    update(c => {
      const d = c.deathSaves ?? { successes: 0, failures: 0 };
      const successes = Math.min(3, d.successes + (roll >= 10 ? 1 : 0));
      const failures = Math.min(3, d.failures + (roll === 1 ? 2 : roll < 10 ? 1 : 0));
      return { deathSaves: { successes, failures } };
    });
  };
  return (
    <div className="space-y-5">
      <Section title="Puntos de golpe" hint="Dados físicos por defecto. Introduce el resultado y aplica el cambio.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="stat-block p-3 text-center"><p className="text-xs text-muted-foreground">PG actuales</p><p className="font-display text-2xl text-primary">{hp} / {maximum}</p></div>
          <div className="stat-block p-3 text-center"><p className="text-xs text-muted-foreground">PG temporales</p><p className="font-display text-2xl">{temp}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input aria-label="Cantidad de puntos de golpe" className="w-24" type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} />
          <Button variant="outline" onClick={damage} disabled={!n}>Recibir daño</Button>
          <Button variant="outline" onClick={heal} disabled={!n}>Curar</Button>
          <Button variant="outline" onClick={() => update({ tempHp: Math.max(temp, n) })} disabled={!n}>Añadir PG temporales</Button>
          <Button variant="ghost" onClick={() => update({ tempHp: 0 })}>Quitar temporales</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">El daño sin tipo indicado se aplica normalmente; los PG temporales absorben primero. Los PG temporales no se acumulan.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => update({ currentHp: maximum, tempHp: 0, deathSaves: { successes: 0, failures: 0 }, usedSpellSlots: {}, usedPactSlots: 0 })}>Descanso largo (recuperación básica)</Button>
        </div>
      </Section>
      <Section title="Salvaciones contra la muerte" hint="Introduce el resultado de tu d20 físico o usa el dado digital opcional.">
        <div className="flex flex-wrap gap-4 text-sm"><span>Éxitos: {death.successes}/3</span><span>Fallos: {death.failures}/3</span></div>
        <p className="mt-2 text-xs text-muted-foreground">{death.failures >= 3 ? "Tres fallos: el personaje muere." : death.successes >= 3 ? "Tres éxitos: el personaje queda estabilizado." : "Un 1 natural cuenta como dos fallos; un 20 natural recupera 1 PG."}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input id="death-roll" type="number" min="1" max="20" placeholder="1–20" className="w-24" />
          <Button variant="outline" onClick={() => { const el = document.getElementById("death-roll") as HTMLInputElement | null; const roll = Number(el?.value); if (Number.isInteger(roll) && roll >= 1 && roll <= 20) deathRoll(roll); }}>Registrar d20</Button>
          <Button variant="outline" onClick={() => deathRoll(Math.floor(Math.random() * 20) + 1)}>Tirar d20 digital</Button>
          <Button variant="ghost" onClick={() => update({ deathSaves: { successes: 0, failures: 0 } })}>Reiniciar</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => update({ deathSaves: { ...death, successes: Math.min(3, death.successes + 1) } })}>+ Éxito</Button>
          <Button variant="ghost" onClick={() => update({ deathSaves: { ...death, failures: Math.min(3, death.failures + 1) } })}>+ Fallo</Button>
        </div>
      </Section>
      <Section title="Estados" hint="Marca o desmarca los estados. Sus efectos se gestionan manualmente por ahora.">
        <div className="flex flex-wrap gap-2">{CONDITIONS.map(name => {
          const active = (character.conditions ?? []).includes(name);
          return <Button key={name} size="sm" variant={active ? "default" : "outline"} aria-pressed={active} onClick={() => update(c => ({ conditions: active ? (c.conditions ?? []).filter(x => x !== name) : [...(c.conditions ?? []), name] }))}>{name}</Button>;
        })}</div>
      </Section>
      {(slots.slots.length > 0 || slots.pact) && (
        <Section title="Espacios de conjuro" hint="Control manual de los espacios gastados. El descanso largo los restablece; la magia de pacto también se recupera con descanso corto.">
          <div className="space-y-2">
            {slots.slots.map((total, i) => total > 0 && <div key={i} className="flex items-center justify-between gap-2 text-sm">
              <span>Nivel {i + 1}: {Math.max(0, total - (character.usedSpellSlots?.[String(i + 1)] ?? 0))}/{total}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => update(c => ({ usedSpellSlots: { ...c.usedSpellSlots, [String(i + 1)]: Math.min(total, (c.usedSpellSlots?.[String(i + 1)] ?? 0) + 1) } }))}>Gastar</Button>
                <Button size="sm" variant="ghost" onClick={() => update(c => ({ usedSpellSlots: { ...c.usedSpellSlots, [String(i + 1)]: Math.max(0, (c.usedSpellSlots?.[String(i + 1)] ?? 0) - 1) } }))}>Devolver</Button>
              </div>
            </div>)}
            {slots.pact && <div className="flex items-center justify-between gap-2 text-sm"><span>Magia de pacto (nivel {slots.pact.level}): {Math.max(0, slots.pact.slots - (character.usedPactSlots ?? 0))}/{slots.pact.slots}</span><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => update(c => ({ usedPactSlots: Math.min(slots.pact!.slots, (c.usedPactSlots ?? 0) + 1) }))}>Gastar</Button><Button size="sm" variant="ghost" onClick={() => update({ usedPactSlots: 0 })}>Recuperar</Button></div></div>}
          </div>
        </Section>
      )}
    </div>
  );
}
