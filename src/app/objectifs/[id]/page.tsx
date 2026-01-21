import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddStepForm from "@/components/AddStepForm";

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Actif";
    case "completed":
      return "Terminé";
    case "abandoned":
      return "Abandonné";
    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "active":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "abandoned":
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  }
}

function priorityLabel(priority: string) {
  switch (priority) {
    case "low":
      return "Faible";
    case "medium":
      return "Moyenne";
    case "high":
      return "Haute";
    default:
      return priority;
  }
}

function priorityClasses(priority: string) {
  switch (priority) {
    case "low":
      return "bg-slate-50 text-slate-700 ring-slate-200";
    case "medium":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "high":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200";
  }
}

export default async function ObjectifDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = "ad87741c-028e-4bf6-b480-fed5d3c1933b"; // TODO: user connecté
  const { id } = params;

  const objectif = await prisma.goal.findFirst({
    where: { id, userId },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!objectif) notFound();

  const totalSteps = objectif.steps.length;
  const doneSteps = objectif.steps.filter((s) => s.isCompleted).length;
  const progress = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-zinc-500">Objectifs</p>
            <h1 className="truncate text-3xl font-semibold tracking-tight text-zinc-900">
              {objectif.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Détails et progression de l’objectif.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/objectifs"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              ← Retour
            </Link>
            <Link
              href={`/objectifs/${objectif.id}/edit`}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              Modifier
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: main card */}
          <section className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-medium text-zinc-900">Résumé</h2>
              <p className="text-xs text-zinc-500">Informations principales</p>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                    statusClasses(objectif.status),
                  ].join(" ")}
                >
                  {statusLabel(objectif.status)}
                </span>

                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                    priorityClasses(objectif.priority),
                  ].join(" ")}
                >
                  Priorité {priorityLabel(objectif.priority)}
                </span>

                {objectif.category && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                    #{objectif.category}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-zinc-900">Description</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {objectif.description || "Aucune description."}
                </p>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900">Progression</p>
                  <p className="text-sm text-zinc-600">
                    {doneSteps}/{totalSteps} • {progress}%
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-900"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900">Étapes</p>
                  <p className="text-xs text-zinc-500">
                    {totalSteps === 0 ? "Aucune étape" : "Triées par ordre"}
                  </p>
                </div>

                {totalSteps === 0 ? (
                  <div className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-zinc-900">Aucune étape</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Ajoute des étapes pour suivre ta progression.
                    </p>
                  </div>
                ) : (
                  <ol className="mt-3 space-y-2">
                    {objectif.steps.map((step) => (
                      <li
                        key={step.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900">
                            <span className="mr-2 text-zinc-400">#{step.order}</span>
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Deadline : {formatDate(step.deadline)}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                            step.isCompleted
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-zinc-100 text-zinc-700 ring-zinc-200",
                          ].join(" ")}
                        >
                          {step.isCompleted ? "Terminé" : "À faire"}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                <AddStepForm goalId={objectif.id} />
              </div>
            </div>
          </section>

          {/* Right: meta */}
          <aside className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-medium text-zinc-900">Détails</h2>
              <p className="text-xs text-zinc-500">Dates & suivi</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <p className="text-xs text-zinc-500">Date de début</p>
                <p className="text-sm font-medium text-zinc-900">
                  {formatDate(objectif.startDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <p className="text-xs text-zinc-500">Deadline</p>
                <p className="text-sm font-medium text-zinc-900">
                  {formatDate(objectif.deadline)}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <p className="text-xs text-zinc-500">Créé le</p>
                <p className="text-sm font-medium text-zinc-900">
                  {formatDate(objectif.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <p className="text-xs text-zinc-500">Dernière mise à jour</p>
                <p className="text-sm font-medium text-zinc-900">
                  {formatDate(objectif.updatedAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <p className="text-xs text-zinc-500">Complété le</p>
                <p className="text-sm font-medium text-zinc-900">
                  {formatDate(objectif.completedAt)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
