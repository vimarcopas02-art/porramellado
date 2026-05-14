# Porra Mundial 2026

Web de porras entre amigos para el Mundial 2026. Cada persona entra con su
nombre, rellena sus pronósticos (72 partidos de grupos, orden de los grupos,
cuadro final y preguntas especiales) y compite en una clasificación automática.

No gestiona apuestas, dinero ni premios. No está afiliada a la FIFA.

## Tecnología

- **Next.js 16** + **React 19** (App Router)
- **Tailwind CSS 4**
- Datos del Mundial en `/data` (JSON), extraídos del Excel original
- Persistencia: `localStorage` del navegador (ver "Próximo paso")

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

```
app/
  page.tsx               Portada
  jugar/                 Hub + pantallas de predicción
    grupos/              72 partidos de fase de grupos
    orden/               Orden 1º-4º de cada grupo
    eliminatorias/       Cuadro final (16avos → campeón)
    preguntas/           Preguntas especiales
  clasificacion/         Ranking automático
  reglas/                Sistema de puntuación
  admin/                 Panel para introducir resultados reales
components/              Componentes reutilizables
lib/
  data.ts                Acceso a los datos del Mundial
  scoring.ts             Cálculo de puntos (replica el Excel)
  storage.ts             Capa de persistencia (localStorage)
  bracket.ts             Lógica del cuadro final
data/                    teams, groups, venues, matches, bracket, questions
scripts/extract_excel.py Script que generó los JSON desde el Excel
```

## Panel de administración

En `/admin` se introducen los resultados reales de los partidos. La
clasificación se recalcula sola. El código de acceso está en
`lib/config.ts` (`ADMIN_CODE`) — **cámbialo por el tuyo**.

## Sistema de puntuación

Replica el Excel original. Resumen en la página `/reglas`.

## Publicar en Vercel (gratis)

1. Sube el proyecto a un repositorio de GitHub.
2. Entra en https://vercel.com y conéctalo con tu cuenta de GitHub.
3. **Add New → Project** → elige el repositorio `porra-mundial-2026`.
4. Vercel detecta Next.js automáticamente. Pulsa **Deploy**.
5. En 1-2 minutos tendrás una URL pública (`porra-mundial-2026.vercel.app`)
   que puedes pasar por WhatsApp.

Cada vez que hagas `git push`, Vercel actualiza la web sola.

## Próximo paso: clasificación compartida

Ahora mismo cada persona guarda su porra en **su propio navegador**. Para que
todos los amigos compartan una misma clasificación hace falta una base de
datos. El siguiente paso es conectar **Supabase** (gratis): solo cambia el
archivo `lib/storage.ts`, el resto de la app ya está preparada.
