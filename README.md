# D&D Character Forge

Crea una aplicación web completa para la creación y gestión de personajes de Dungeons & Dragons 5.5e.

Objetivo

El usuario debe poder crear un personaje siguiendo las reglas de D&D 5.5e, de forma progresiva según su nivel, y guardar sus personajes para poder continuar editándolos posteriormente.

Creación de personaje

Crear un asistente paso a paso con:

Nombre del personaje.

Especie/Raza.

Clase.

Trasfondo.

Nivel.

Características y modificadores.

Competencias.

Habilidades.

Equipo.

Conjuros, cuando corresponda.

Rasgos y habilidades obtenidos por especie, clase, trasfondo y nivel.

Las opciones disponibles deben depender de las elecciones anteriores. Por ejemplo, la clase determina las opciones de clase disponibles y el nivel determina qué habilidades, mejoras y características puede tener.

Sistema de niveles

El personaje debe respetar estrictamente la progresión de D&D 5.5e:

Nivel 1 → solamente contenido disponible en nivel 1.

Nivel 2 → desbloquear automáticamente lo correspondiente al nivel 2.

Nivel 3 → desbloquear lo correspondiente al nivel 3, etc.

Hasta nivel 20.

Al subir de nivel, conservar todo lo que el personaje ya tenía y añadir únicamente las nuevas opciones, habilidades, mejoras, conjuros, espacios de conjuro, etc. correspondientes al nuevo nivel.

Ejemplo:
Un personaje guardado en nivel 5 que sube a nivel 6 debe cargar todos sus datos anteriores y permitir añadir únicamente las novedades de nivel 6.

Guardado y carga

Implementar un sistema para:

Crear personajes.

Guardarlos.

Editarlos.

Cargarlos posteriormente.

Subirlos de nivel conservando toda la información anterior.

Duplicar personajes.

Eliminar personajes.

Guardar automáticamente los cambios.

Los personajes deben almacenarse de forma estructurada para que puedan modificarse posteriormente sin perder información.

Reglas

La aplicación debe utilizar únicamente reglas y contenido de D&D 5.5e y evitar ofrecer opciones que el personaje no pueda seleccionar según sus elecciones y nivel.

Separar claramente:

Datos del personaje.

Datos de especie.

Datos de clase.

Datos de trasfondo.

Progresión por nivel.

Inventario.

Conjuros.

Interfaz

Diseño moderno, limpio y orientado a jugadores de D&D.
Debe ser responsive para PC, tablet y móvil.

Crear:

Pantalla principal con personajes guardados.

Crear personaje.

Editor de personaje.

Ficha completa del personaje.

Pantalla para subir de nivel.

Guardado y carga de personajes.

La arquitectura debe estar preparada para añadir posteriormente más contenido, clases, especies, trasfondos y reglas sin tener que rehacer la aplicación.

Genera la aplicación funcional completa, no solamente un diseño visual.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://questbook-companion.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5cd83e0c-d7fb-4700-b5f4-8d465a1710e0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
