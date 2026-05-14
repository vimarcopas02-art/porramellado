import { Card, PageHeader, Badge, ButtonLink } from "@/components/ui";
import { POINTS } from "@/lib/scoring";
import {
  matches,
  groups,
  questions,
  totalQuestionPoints,
  TOURNAMENT_START,
} from "@/lib/data";

function PointRow({ points, text }: { points: string; text: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Badge tone="pitch" className="mt-0.5 shrink-0">
        {points}
      </Badge>
      <span className="text-sm text-ink-700">{text}</span>
    </li>
  );
}

export default function ReglasPage() {
  const startDate = TOURNAMENT_START.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        eyebrow="Porra Mundial 2026"
        title="Reglas y puntuación"
        description="Así se reparten los puntos. El objetivo es sumar la mayor cantidad posible con tus pronósticos."
      />

      <Card className="p-5">
        <h2 className="font-bold">Fase de grupos</h2>
        <p className="mt-1 text-sm text-ink-600">
          {matches.length} partidos. Pronostica el marcador exacto de cada uno.
        </p>
        <ul className="mt-2 divide-y divide-ink-100">
          <PointRow
            points={`${POINTS.signo} pts`}
            text="Acertar el signo del partido (1, X o 2), según los goles que pronostiques."
          />
          <PointRow
            points={`${POINTS.golesEquipo} pt`}
            text="Acertar los goles exactos de un equipo (se puede sumar por el local y por el visitante)."
          />
          <PointRow
            points={`${POINTS.ordenGrupo} pts`}
            text={`Acertar el orden completo (1º-4º) de un grupo. Hay ${groups.length} grupos.`}
          />
        </ul>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-bold">Cuadro final</h2>
        <p className="mt-1 text-sm text-ink-600">
          Puntos por acertar qué selecciones llegan a cada ronda.
        </p>
        <ul className="mt-2 divide-y divide-ink-100">
          <PointRow
            points={`${POINTS.r32} pts`}
            text="Por cada equipo que aciertes en dieciseisavos de final."
          />
          <PointRow
            points={`${POINTS.r16} pts`}
            text="Por cada equipo que aciertes en octavos de final."
          />
          <PointRow
            points={`${POINTS.qf} pts`}
            text="Por cada equipo que aciertes en cuartos de final."
          />
          <PointRow
            points={`${POINTS.sf} pts`}
            text="Por cada equipo que aciertes en semifinales."
          />
          <PointRow
            points={`${POINTS.third4} pts`}
            text="Por cada equipo que aciertes en el partido por el tercer puesto."
          />
          <PointRow
            points={`${POINTS.final} pts`}
            text="Por cada equipo que aciertes en la final."
          />
          <PointRow
            points={`${POINTS.thirdPlace} pts`}
            text="Acertar el tercer clasificado del Mundial."
          />
          <PointRow
            points={`${POINTS.champion} pts`}
            text="Acertar el campeón del Mundial."
          />
          <PointRow
            points={`${POINTS.knockoutExact} pts`}
            text="Marcador exacto de un cruce (90 min), solo si acertaste los dos equipos de ese cruce."
          />
        </ul>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-bold">Preguntas especiales</h2>
        <p className="mt-1 text-sm text-ink-600">
          {questions.length} preguntas variadas. Cada una tiene su propia
          puntuación (de 1 a 20 puntos), {totalQuestionPoints} puntos en total.
        </p>
      </Card>

      <Card className="mt-4 bg-ink-900 p-5 text-white">
        <h2 className="font-bold">Ejemplo</h2>
        <p className="mt-1 text-sm text-ink-300">
          Pronosticas <strong className="text-white">México 3 - 1</strong>{" "}
          (signo «1»):
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-300">
          <li>· Termina 1-0 → 2 puntos (signo).</li>
          <li>· Termina 3-2 → 3 puntos (signo + goles de México).</li>
          <li>· Termina 3-1 → 4 puntos (signo + goles de los dos equipos).</li>
        </ul>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-bold">Otras reglas</h2>
        <ul className="mt-2 space-y-2 text-sm text-ink-700">
          <li>
            · Las predicciones se pueden editar hasta el inicio del Mundial (
            {startDate}). Después quedan bloqueadas y solo se pueden consultar.
          </li>
          <li>
            · En las eliminatorias cuentan los resultados de los 90 minutos
            reglamentarios (sin prórroga ni penaltis).
          </li>
          <li>
            · Esta web es solo para divertirse entre amigos: no gestiona
            apuestas, botes ni premios económicos.
          </li>
          <li>
            · No está afiliada a la FIFA ni utiliza marcas, escudos ni
            logotipos oficiales.
          </li>
        </ul>
      </Card>

      <div className="mt-6">
        <ButtonLink href="/jugar" size="lg" className="w-full">
          Rellenar mi porra
        </ButtonLink>
      </div>
    </div>
  );
}
