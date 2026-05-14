"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader, Button } from "@/components/ui";
import { MatchScoreRow } from "@/components/MatchScoreRow";
import { GroupOrderEditor } from "@/components/GroupOrderEditor";
import { BracketTieCard, type RoundKey } from "@/components/BracketTieCard";
import { QuestionItem } from "@/components/QuestionItem";
import { ShieldIcon, ShareIcon, WhatsAppIcon, CheckIcon } from "@/components/icons";
import {
  groups,
  matchesOfGroup,
  matchMeta,
  bracket,
  questions,
  questionCategories,
} from "@/lib/data";
import { normalizeBracket } from "@/lib/bracket";
import { useResultsDraft, useParticipants, useMounted } from "@/lib/hooks";
import { removeParticipant } from "@/lib/storage";
import { computeScore } from "@/lib/scoring";
import { ADMIN_CODE } from "@/lib/config";
import type { Results } from "@/lib/storage";
import type { ScorePrediction } from "@/lib/types";
import { cn } from "@/lib/cn";

const SESSION_KEY = "porra-admin-unlocked";

type DraftPatch = (updater: (prev: Results) => Results) => void;

/* -------------------------------------------------------------------------- */
/*  Compartir                                                                  */
/* -------------------------------------------------------------------------- */

function ShareCard() {
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);
  const url = mounted ? window.location.origin : "";
  const shareText = `¡Únete a la Porra del Mundial 2026! Entra, haz tus pronósticos y compite: ${url}`;

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 font-bold">
        <ShareIcon className="h-5 w-5 text-pitch-600" />
        Compartir la porra
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        Pasa este enlace a tu grupo. Cada persona entra con su nombre y rellena
        su porra.
      </p>
      <div className="mt-3 rounded-xl bg-ink-50 px-3 py-2.5 text-sm font-medium text-ink-700 break-all">
        {url || "…"}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={async () => {
            if (!url) return;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 text-pitch-600" /> Copiado
            </>
          ) : (
            "Copiar enlace"
          )}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pitch-600 px-4 text-sm font-semibold text-white hover:bg-pitch-700"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Compartir por WhatsApp
        </a>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pestañas de resultados                                                     */
/* -------------------------------------------------------------------------- */

function GroupResultsTab({
  draft,
  patch,
}: {
  draft: Results;
  patch: DraftPatch;
}) {
  const [groupId, setGroupId] = useState(groups[0].id);
  const setScore = (matchId: string, value: ScorePrediction) =>
    patch((prev) => ({
      ...prev,
      groupMatches: { ...prev.groupMatches, [matchId]: value },
    }));

  return (
    <div>
      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupId(g.id)}
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl text-sm font-bold transition-colors",
                g.id === groupId
                  ? "bg-pitch-600 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {g.id}
            </button>
          ))}
        </div>
      </div>
      <Card className="px-4 py-2">
        <h3 className="py-2 text-center text-sm font-bold uppercase tracking-wide text-pitch-600">
          Resultados reales · Grupo {groupId}
        </h3>
        <div className="divide-y divide-ink-100">
          {matchesOfGroup(groupId).map((m) => (
            <MatchScoreRow
              key={m.id}
              homeName={m.homeName}
              awayName={m.awayName}
              meta={matchMeta(m)}
              value={draft.groupMatches[m.id] ?? { home: null, away: null }}
              onChange={(v) => setScore(m.id, v)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function OrderResultsTab({
  draft,
  patch,
}: {
  draft: Results;
  patch: DraftPatch;
}) {
  const setOrder = (groupId: string, order: string[]) =>
    patch((prev) => ({
      ...prev,
      groupOrder: { ...prev.groupOrder, [groupId]: order },
    }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((g) => {
        const saved = draft.groupOrder[g.id];
        const order =
          saved && saved.length === 4 ? saved : g.teams;
        return (
          <GroupOrderEditor
            key={g.id}
            groupId={g.id}
            order={order}
            locked={false}
            onReorder={(next) => setOrder(g.id, next)}
          />
        );
      })}
    </div>
  );
}

function BracketResultsTab({
  draft,
  patch,
}: {
  draft: Results;
  patch: DraftPatch;
}) {
  const [tab, setTab] = useState<"r32" | "r16" | "qf" | "sf" | "final">("r32");

  const updateBracket = (mutate: (rec: Record<string, string>) => void) =>
    patch((prev) => {
      const rec = { ...prev.bracket };
      mutate(rec);
      return { ...prev, bracket: normalizeBracket(rec) };
    });

  const cardProps = {
    bracketRecord: draft.bracket,
    bracketScores: draft.bracketScores,
    locked: false,
    onSlot: (tieId: string, index: 0 | 1, teamId: string) =>
      updateBracket((rec) => {
        if (teamId) rec[`slot:${tieId}:${index}`] = teamId;
        else delete rec[`slot:${tieId}:${index}`];
      }),
    onWinner: (tieId: string, teamId: string) =>
      teamId &&
      updateBracket((rec) => {
        rec[`win:${tieId}`] = teamId;
      }),
    onScore: (tieId: string, score: ScorePrediction) =>
      patch((prev) => ({
        ...prev,
        bracketScores: { ...prev.bracketScores, [tieId]: score },
      })),
  };

  const TABS = [
    { id: "r32", label: "16avos", ties: bracket.r32, round: "r32" },
    { id: "r16", label: "Octavos", ties: bracket.r16, round: "r16" },
    { id: "qf", label: "Cuartos", ties: bracket.qf, round: "qf" },
    { id: "sf", label: "Semis", ties: bracket.sf, round: "sf" },
  ] as const;

  return (
    <div>
      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {[...TABS, { id: "final", label: "Final" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={cn(
                "h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition-colors",
                t.id === tab
                  ? "bg-pitch-600 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {TABS.filter((t) => t.id === tab).map((t) => (
        <div key={t.id} className="grid gap-3 sm:grid-cols-2">
          {t.ties.map((tie) => (
            <BracketTieCard
              key={tie.id}
              tie={tie}
              round={t.round as RoundKey}
              {...cardProps}
            />
          ))}
        </div>
      ))}

      {tab === "final" && (
        <div className="space-y-3">
          <BracketTieCard
            tie={bracket.final}
            round={"final" as RoundKey}
            {...cardProps}
          />
          <BracketTieCard
            tie={bracket.third}
            round={"third" as RoundKey}
            {...cardProps}
          />
        </div>
      )}
    </div>
  );
}

function QuestionsResultsTab({
  draft,
  patch,
}: {
  draft: Results;
  patch: DraftPatch;
}) {
  const [category, setCategory] = useState(questionCategories[0]);
  const setAnswer = (questionId: string, value: string) =>
    patch((prev) => ({
      ...prev,
      questions: { ...prev.questions, [questionId]: value },
    }));

  return (
    <div>
      <div className="-mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {questionCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition-colors",
                c === category
                  ? "bg-pitch-600 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Card className="px-4">
        <div className="divide-y divide-ink-100">
          {questions
            .filter((q) => q.category === category)
            .map((q) => (
              <QuestionItem
                key={q.id}
                question={q}
                value={draft.questions[q.id] ?? ""}
                locked={false}
                onChange={(value) => setAnswer(q.id, value)}
              />
            ))}
        </div>
      </Card>
    </div>
  );
}

function ParticipantsTab({ draft }: { draft: Results }) {
  const participants = useParticipants();

  if (participants.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-ink-500">
        Todavía no se ha unido nadie a la porra.
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-ink-100">
      {participants.map((p) => {
        const score = computeScore(p.predictions, draft);
        return (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-ink-500">
                {score.total} puntos · actualizado{" "}
                {new Date(p.updatedAt).toLocaleDateString("es-ES")}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar a ${p.name} de la porra?`)) {
                  removeParticipant(p.id);
                }
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        );
      })}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Página                                                                     */
/* -------------------------------------------------------------------------- */

const ADMIN_TABS = [
  { id: "grupos", label: "Resultados grupos" },
  { id: "orden", label: "Orden grupos" },
  { id: "cuadro", label: "Cuadro final" },
  { id: "preguntas", label: "Preguntas" },
  { id: "participantes", label: "Participantes" },
] as const;

function AdminPanel() {
  const { draft, patch, dirty } = useResultsDraft();
  const [tab, setTab] =
    useState<(typeof ADMIN_TABS)[number]["id"]>("grupos");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          eyebrow="Panel de administración"
          title="Resultados de la porra"
          description="Introduce aquí los resultados reales. La clasificación se recalcula automáticamente."
        />
        <span
          className={cn(
            "mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            dirty
              ? "bg-gold-300/60 text-gold-600"
              : "bg-pitch-100 text-pitch-700",
          )}
        >
          {dirty ? "Guardando…" : "Guardado"}
        </span>
      </div>

      <ShareCard />

      <div className="-mx-4 my-5 overflow-x-auto px-4">
        <div className="flex gap-2">
          {ADMIN_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition-colors",
                t.id === tab
                  ? "bg-ink-900 text-white"
                  : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "grupos" && <GroupResultsTab draft={draft} patch={patch} />}
      {tab === "orden" && <OrderResultsTab draft={draft} patch={patch} />}
      {tab === "cuadro" && <BracketResultsTab draft={draft} patch={patch} />}
      {tab === "preguntas" && (
        <QuestionsResultsTab draft={draft} patch={patch} />
      )}
      {tab === "participantes" && <ParticipantsTab draft={draft} />}
    </div>
  );
}

function AdminGate() {
  const mounted = useMounted();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
  }, []);

  if (!mounted) {
    return (
      <div className="px-4 py-20 text-center text-ink-400">Cargando…</div>
    );
  }

  if (unlocked) return <AdminPanel />;

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <Card className="p-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-900 text-white">
          <ShieldIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Introduce el código de administrador para gestionar los resultados.
        </p>
        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (code === ADMIN_CODE) {
              sessionStorage.setItem(SESSION_KEY, "1");
              setUnlocked(true);
            } else {
              setError(true);
            }
          }}
        >
          <label
            htmlFor="admin-code"
            className="text-sm font-semibold text-ink-700"
          >
            Código
          </label>
          <input
            id="admin-code"
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            className="mt-1.5 h-12 w-full rounded-xl border border-ink-200 bg-white px-3 text-base outline-none focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100"
          />
          {error && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              Código incorrecto.
            </p>
          )}
          <Button type="submit" size="lg" className="mt-4 w-full">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return <AdminGate />;
}
