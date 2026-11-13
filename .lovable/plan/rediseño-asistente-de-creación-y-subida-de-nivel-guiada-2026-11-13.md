# Rediseño: asistente de creación y subida de nivel guiada

## Qué cambia para el jugador
- **Crear personaje** pasa a ser un asistente de 9 pasos, siempre en nivel 1, con una sola decisión por pantalla.
- **Subir de nivel** pasa a ser un asistente propio: muestra solo lo nuevo del nivel siguiente, pide las elecciones obligatorias y no aplica el nivel hasta que todo esté completo y confirmado.
- La ficha, la exportación (PDF/Excel/imprimir), la importación, el inventario, los conjuros, las notas y las estadísticas manuales se mantienen igual.

## 1. Asistente de creación (nivel 1)
Pasos, uno por pantalla:
1. Identidad (nombre, jugador, alineamiento)
2. Especie (+ linaje si lo tiene)
3. Clase
4. Trasfondo (+ reparto de +2/+1 o +1/+1/+1)
5. Características (puntuaciones base)
6. Habilidades (de clase; las de trasfondo se muestran ya marcadas)
7. Rasgos y elecciones de nivel 1 (estilo de combate, etc.) — se salta solo si no hay ninguna
8. Conjuros (trucos y conjuros de nivel 1) — se salta solo si la clase no lanza conjuros a nivel 1
9. Equipo y resumen final

Navegación:
- Barra de progreso superior con "Paso N de 9" y un índice de pasos clicable (chips en escritorio, menú desplegable en móvil). Cada paso muestra si está completo, pendiente o con algún problema.
- Botones Atrás / Siguiente fijos abajo. Siguiente se desactiva solo cuando falta algo obligatorio en ese paso, y explica qué falta.
- **Ir a un paso anterior en un clic y volver**: al saltar desde el índice o desde el resumen ("Editar" junto al nombre), aparece el botón "Volver al paso N" que te lleva de vuelta adonde estabas. No se pierde nada porque todas las elecciones se guardan solas al momento.
- El paso actual se guarda en la dirección de la página (`/crear?id=…&paso=…`): recargar o volver más tarde continúa el borrador en el mismo punto.
- Si cambias la clase o la especie, solo se borran las elecciones que dependían de ella (ya funciona así) y se avisa antes con un mensaje de confirmación.

Diseño de cada paso:
- Tarjetas visuales grandes con ilustración, nombre y 2–3 datos clave (p. ej. clase: dado de golpe, característica principal, "lanza conjuros"). El texto largo queda detrás de un botón "Ver detalles" (el diálogo ⓘ actual).
- Ilustraciones generadas al estilo grimorio (pintura de fantasía, paleta oscura y dorada): 10 especies, 12 clases y 1 imagen de cabecera por paso para trasfondos, características, habilidades, conjuros y equipo. Trasfondos e iconos de opciones pequeñas usan iconos en vez de imágenes para no sobrecargar.

## 2. Asistente de subida de nivel
Se abre desde la ficha con "Subir a nivel N+1" (ruta propia `/personaje/$id/subir`). Pasos:
1. **Novedades del nivel**: tarjetas con solo lo que se gana en N+1 — rasgos de clase/subclase, bono de competencia si cambia, nuevos espacios de conjuro, recursos que aumentan (furias, ki…), con "Ver detalles".
2. **Puntos de golpe**: media o tirada (igual que ahora).
3. **Elecciones del nivel** (solo las que aparezcan): subclase, mejora de característica o dote, opciones de rasgos, pericias, nuevos trucos/conjuros hasta el límite permitido. Solo se ofrecen opciones válidas según los datos actuales.
4. **Confirmar**: resumen de lo elegido; el botón "Aplicar nivel N+1" solo se activa cuando no queda nada obligatorio pendiente.

Clave técnica: todas las elecciones se preparan sobre una copia temporal del personaje (con nivel N+1) y solo se guardan al confirmar. Si cancelas, el personaje queda intacto.

Revisar niveles anteriores: en la pestaña de nivel, una lista "Historial de niveles" (1…N) donde cada nivel muestra lo obtenido y lo elegido, con "Corregir" para cambiar esa elección (subclase, ASI/dote, opciones de rasgo) cuando las reglas lo permitan. "Bajar de nivel" se conserva, con confirmación.

## 3. Errores y problemas detectados que se corrigen
- **Se puede subir de nivel con elecciones pendientes**: hoy se sube al instante y las elecciones quedan pendientes después. Se arregla con el asistente (requisito 4).
- **Bajar de nivel deja restos**: elimina PG y mejoras, pero conserva elecciones de rasgos, subclase, pericias y conjuros de niveles superiores. Se limpiará todo lo que ya no corresponde al nivel.
- **Crear un personaje genera borradores huérfanos**: abrir "Crear" guarda un personaje vacío al instante; si sales sin pulsar Descartar queda en la lista (y puede duplicarse al recargar). Se marcará como borrador: la lista los mostrará con la etiqueta "Borrador" y "Continuar", y "Crear" reutilizará el borrador abierto en vez de crear otro.
- **El editor de creación permite elegir nivel**: con el requisito 1, la creación queda fija en nivel 1.
- La validación de "completo" actual se reaprovecha para el estado de cada paso.

## 4. Compatibilidad con personajes guardados
- No cambia la clave de almacenamiento ni se borra ningún campo. Solo se añaden campos opcionales: `draft?: boolean`, `wizardStep?: number`, y en las elecciones el nivel en que se tomaron (`choiceLevels?: Record<string, number>`).
- Personajes ya existentes: se cargan tal cual; sin `draft` se tratan como terminados. Las elecciones antiguas sin nivel se asignan al nivel del rasgo que las originó (se calcula a partir de los datos de clase, no hace falta migrar nada guardado).
- Personajes creados antes a nivel > 1 siguen funcionando; el asistente solo se aplica a nuevos.
- Importar/exportar JSON sigue aceptando el formato actual.

## Detalles técnicos
Archivos nuevos:
- `src/components/wizard/` — `WizardShell.tsx` (barra, índice clicable, Atrás/Siguiente, "volver al paso"), `steps.ts` (definición declarativa de pasos: id, título, imagen, `isRelevant(c)`, `isComplete(c)`, componente) para añadir pasos sin tocar el armazón.
- `src/components/wizard/create/*Step.tsx` — cada paso reutiliza la lógica de las secciones existentes de `parts.tsx` (se extraen sus partes internas, no se reescriben reglas).
- `src/components/wizard/levelup/*Step.tsx` + `src/lib/levelup.ts` — `levelUpDelta(c, next)` (rasgos, espacios, recursos, competencia que cambian, usando `featuresGainedBetween`, `spellSlots`, `resources.ts`), `requiredChoices(cDraft)`, `applyLevelUp`, `pruneToLevel(c, level)` para bajar de nivel.
- `src/data/art.ts` — mapa id → imagen (especie/clase/paso); si no hay imagen, se muestra un icono, así nuevo contenido funciona sin arte.
- `src/assets/art/*.jpg` — ilustraciones generadas.
- `src/routes/personaje.$id.subir.tsx` — ruta del asistente de nivel.

Archivos modificados:
- `src/routes/crear.tsx` — usa el asistente; `validateSearch` para `id` y `paso`; reutiliza borrador.
- `src/routes/personaje.$id.tsx` — el panel de nivel enlaza al asistente; historial de niveles con "Corregir"; bajar de nivel usa `pruneToLevel`.
- `src/routes/index.tsx` — etiqueta "Borrador" y "Continuar".
- `src/lib/types.ts`, `src/lib/storage.ts` — campos opcionales nuevos.
- `src/components/character/parts.tsx` — extraer subcomponentes reutilizables; la edición completa en la ficha se mantiene.
- `src/styles.css` — tokens para tarjetas ilustradas y barra de progreso.
- Pruebas: `src/lib/levelup.test.ts` (no se aplica nivel con elecciones pendientes; bajar de nivel limpia elecciones superiores; creación arranca en nivel 1).

Riesgos:
- `parts.tsx` es grande: extraer piezas puede romper la edición en la ficha → se prueba crear y editar con Playwright tras el cambio.
- Las reglas de "qué elección es obligatoria en cada nivel" dependen de los datos actuales (`choice` en rasgos, `asiLevels`, `subclassLevel`, límites de conjuros); si algún dato de clase está incompleto, el asistente lo reflejará tal cual. No se inventan reglas nuevas.
- Peso de imágenes: ~25 imágenes comprimidas, cargadas solo en el paso donde se ven.

Orden de trabajo: (1) lógica `levelup.ts` + pruebas, (2) armazón del asistente, (3) pasos de creación, (4) asistente de subida, (5) historial/corrección y borradores, (6) ilustraciones, (7) verificación completa en navegador (crear, saltar al nombre y volver, subir 1→3 con elecciones, bajar, exportar PDF).
