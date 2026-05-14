import { ButtonLink, Card } from "@/components/ui";
import {
  BallIcon,
  TrophyIcon,
  ShareIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { matches, teams, groups, questions, TOURNAMENT_START } from "@/lib/data";

const steps = [
  {
    icon: BallIcon,
    title: "Rellena tu porra",
    text: "Pronostica los 72 partidos de grupos, el orden de cada grupo, el cuadro final y las preguntas especiales.",
  },
  {
    icon: ShareIcon,
    title: "Comparte el enlace",
    text: "Pasa el enlace de la web por WhatsApp a tu grupo. Cada uno entra con su nombre y hace su porra.",
  },
  {
    icon: TrophyIcon,
    title: "Compite en el ranking",
    text: "Cuando empiezan los partidos se van metiendo los resultados y la clasificación se actualiza sola.",
  },
];

const blocks = [
  {
    value: `${matches.length}`,
    label: "partidos de grupos",
    detail: "Pronostica el marcador exacto de cada partido.",
  },
  {
    value: `${groups.length}`,
    label: "grupos por ordenar",
    detail: "Acierta el orden 1º-4º de un grupo y suma 10 puntos.",
  },
  {
    value: "Cuadro",
    label: "final completo",
    detail: "Desde dieciseisavos hasta el campeón del Mundial.",
  },
  {
    value: `${questions.length}`,
    label: "preguntas especiales",
    detail: "Preguntas variadas con puntuación extra.",
  },
];

export default function Home() {
  const startDate = TOURNAMENT_START.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-pitch-800 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #34d399 0, transparent 45%), radial-gradient(circle at 80% 0%, #fbbf24 0, transparent 35%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            La porra de tu grupo de amigos
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Crea tu porra del{" "}
            <span className="text-gold-400">Mundial 2026</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pitch-100">
            Pronostica los partidos, comparte el enlace con tus amigos y compite
            en un ranking automático. Sin apuestas, sin botes de dinero: solo
            por diversión.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/jugar" variant="gold" size="lg">
              <BallIcon className="h-5 w-5" />
              Jugar mi porra
            </ButtonLink>
            <ButtonLink
              href="/reglas"
              variant="secondary"
              size="lg"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Ver cómo se puntúa
              <ArrowRightIcon className="h-5 w-5" />
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-pitch-200">
            Las predicciones se pueden editar hasta el inicio del Mundial
            ({startDate}). Después quedan bloqueadas.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Cómo funciona</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-pitch-100 text-pitch-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-ink-400">
                    Paso {i + 1}
                  </span>
                </div>
                <h3 className="mt-3 font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{step.text}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Qué se pronostica */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight">
            Qué incluye tu porra
          </h2>
          <p className="mt-2 text-ink-600">
            {teams.length} selecciones, todo el Mundial en una sola porra.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {blocks.map((block) => (
              <Card key={block.label} className="p-5">
                <p className="text-3xl font-bold text-pitch-600">
                  {block.value}
                </p>
                <p className="font-semibold">{block.label}</p>
                <p className="mt-1 text-sm text-ink-600">{block.detail}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/jugar" size="lg">
              Empezar a rellenar mi porra
              <ArrowRightIcon className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Aviso */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Card className="flex items-start gap-3 bg-pitch-50 p-5">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pitch-600 text-white">
            <CheckIcon className="h-4 w-4" />
          </span>
          <div className="text-sm text-ink-700">
            <p className="font-bold text-ink-900">
              Solo por diversión entre amigos
            </p>
            <p className="mt-1">
              Esta web no gestiona apuestas, dinero ni premios económicos. Es
              una porra privada para picarse con el grupo. No está afiliada a la
              FIFA ni usa marcas oficiales.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
