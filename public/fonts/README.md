Guía para obtener e instalar las tipografías usadas en este proyecto
===============================================================

Este proyecto carga fuentes locales desde `/fonts/...` en `src/app/globals.css`.
Actualmente no incluimos los archivos `.woff2/.woff/.ttf` por razones de licencia.

Sigue uno de estos flujos para añadir las fuentes a `public/fonts/` y evitar errores 404:

1) Obtener las fuentes originales (recomendado cuando estén disponibles)
---------------------------------------------------------------
- Si tienes acceso a los archivos de diseño (Figma, Sketch, Adobe XD) o al diseñador, pide los ficheros de fuente (`.woff2`, `.woff` o `.ttf`).
- Copia esos archivos directamente a `public/fonts/`.

PowerShell (ejemplo):

```powershell
mkdir -Force public\fonts
Copy-Item "C:\ruta\a\tus\fuentes\HorizonBull.woff2" public\fonts\
Copy-Item "C:\ruta\a\tus\fuentes\Anantason.woff2" public\fonts\
```

2) Si no tienes las fuentes originales: usar alternativas libres (Google Fonts)
---------------------------------------------------------------
Si la fuente original es comercial o no la tienes, puedes usar una alternativa abierta.

- Alternativas sugeridas (Google Fonts):
  - `Anant` (similar a estilos serif compactos): https://fonts.google.com/specimen/Anant
  - `Anton` (estilo sólido para títulos, buena alternativa a Horizon Bull): https://fonts.google.com/specimen/Anton
  - `Bebas Neue` (otra alternativa de display): https://fonts.google.com/specimen/Bebas+Neue

Descarga desde Google Fonts: visita la página, selecciona la variante (.woff2) y pulsa "Download family".
Extrae los ficheros `.woff2` y cópialos a `public/fonts/`.

3) Opción técnica recomendada (Next.js): `next/font/local`
---------------------------------------------------------------
Para integrar las fuentes con las optimizaciones de Next.js, coloca los `.woff2` en `src/fonts/` y usa `next/font/local` en `src/app/layout.tsx`.

Ventajas:
- Next optimiza la carga y evita 404.
- Mejor control con variables CSS.

4) Notas legales
---------------------------------------------------------------
- Asegúrate de respetar la licencia de cada fuente. No descargues ni redistribuyas fuentes comerciales sin licencia.
- Si las fuentes forman parte del branding de la marca (p. ej. `Horizon Bull`), lo ideal es conseguirlas del diseñador o del proveedor de la tipografía.

5) Verificación
---------------------------------------------------------------
- Arranca el servidor de desarrollo:

```powershell
npm run dev
```

- Comprueba que las URLs devuelvan 200 (ejemplo):

```powershell
iwr http://localhost:3000/fonts/HorizonBull.woff2 -UseBasicParsing
```

Si necesitas, puedo:
- Crear la carpeta `public/fonts/` en el repo (vacía) y este README — ya lo he añadido.
- Añadir una versión `src/fonts/fonts.ts` y ejemplo de `layout.tsx` para usar `next/font/local` (no puedo generar los `.woff2`).

Dime si quieres que cree los archivos de integración (`src/fonts/fonts.ts` y la actualización de `src/app/layout.tsx`).
