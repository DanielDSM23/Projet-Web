import { GoalStatus, Priority } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";


function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default async function EditObjectifPage({ params }: { params: { id: string } }) {
  const userId = "ad87741c-028e-4bf6-b480-fed5d3c1933b"; // TODO: remplacer par l'user connecté
  const { id } = await params;

  const objectif = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!objectif) notFound();

  async function updateGoal(formData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const descriptionRaw = String(formData.get("description") || "").trim();
    const categoryRaw = String(formData.get("category") || "").trim();

    const priority = (formData.get("priority") ?? "medium") as Priority;
    const status = (formData.get("status") ?? "active") as GoalStatus;


    const startDateRaw = String(formData.get("startDate") || "").trim();
    const deadlineRaw = String(formData.get("deadline") || "").trim();

    if (!title) {
      // minimal : on pourrait gérer un message d'erreur UI, mais on reste simple
      return;
    }

    const startDate = startDateRaw ? new Date(startDateRaw) : null;
    const deadline = deadlineRaw ? new Date(deadlineRaw) : null;
    
    await prisma.goal.update({
      where: { id: objectif.id },
      data: {
        title,
        description: descriptionRaw || null,
        category: categoryRaw || null,
        priority,
        status,
        startDate,
        deadline,
        completedAt: status === "completed" ? new Date() : null,
      },
    });

    redirect("/objectifs"); // adapte si ta page liste est ailleurs
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">Objectifs</p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Modifier l’objectif
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Mets à jour les informations de ton objectif.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/objectifs"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              ← Retour
            </a>
          </div>
        </header>

        {/* Card */}
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-sm font-medium text-zinc-900">Informations</h2>
            <p className="text-xs text-zinc-500">
              Les champs * sont obligatoires
            </p>
          </div>

          <form action={updateGoal} className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-900">
                  Titre *
                </label>
                <input
                  name="title"
                  defaultValue={objectif.title}
                  placeholder="Ex: Perdre 5kg"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-900">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={objectif.description ?? ""}
                  placeholder="Décris ton objectif..."
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-900">
                  Catégorie
                </label>
                <input
                  name="category"
                  defaultValue={objectif.category ?? ""}
                  placeholder="Ex: Santé, Dev..."
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-zinc-900">
                  Priorité
                </label>
                <select
                  name="priority"
                  defaultValue={objectif.priority}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-200"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-zinc-900">
                  Statut
                </label>
                <select
                  name="status"
                  defaultValue={objectif.status}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-200"
                >
                  <option value="active">Actif</option>
                  <option value="completed">Terminé</option>
                  <option value="abandoned">Abandonné</option>
                </select>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-zinc-900">
                  Date de début
                </label>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={toInputDate(objectif.startDate)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  defaultValue={toInputDate(objectif.deadline)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-zinc-500">
                Dernière mise à jour :{" "}
                {new Date(objectif.updatedAt).toLocaleDateString("fr-FR")}
              </div>

              <div className="flex gap-2">
                <a
                  href="/objectifs"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                >
                  Annuler
                </a>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
