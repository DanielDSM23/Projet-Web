import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Objectif({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  const UserData = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // ✅ Filtres/tri via URL (ex: /objectifs?status=active&priority=high&sort=createdAt_desc)
  const status = typeof params.status === "string" ? params.status : "all"; // all | active | completed | abandoned
  const priority = typeof params.priority === "string" ? params.priority : "all"; // all | low | medium | high
  const sort = typeof params.sort === "string" ? params.sort : "createdAt_desc"; // createdAt_desc | createdAt_asc | title_asc

  // ✅ where dynamique
  const where = {
    userId: UserData.id,
    ...(status !== "all" ? { status } : {}),
    ...(priority !== "all" ? { priority } : {}),
  };

  // ✅ orderBy dynamique
  const orderBy =
    sort === "createdAt_asc"
      ? { createdAt: "asc" as const }
      : sort === "title_asc"
        ? { title: "asc" as const }
        : { createdAt: "desc" as const };

  const objectifs = await prisma.goal.findMany({
    where,
    orderBy,
  });

  const list = objectifs ?? [];

  const statusLabel = (status: string) => {
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
  };

  const statusClasses = (status: string) => {
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
  };

  const priorityLabel = (priority: string) => {
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
  };

  const priorityClasses = (priority: string) => {
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
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Objectifs
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Suis tes objectifs et avance étape par étape.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-zinc-500">Total</p>
              <p className="text-lg font-semibold text-zinc-900">
                {list.length}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-zinc-500">Actifs</p>
              <p className="text-lg font-semibold text-zinc-900">
                {list.filter((g) => g.status === "active").length}
              </p>
            </div>
          </div>
        </header>

        {/* ✅ AJOUT: barre de filtres/tri (n'altère pas ton design existant) */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 mr-1">Filtrer :</span>
          <FilterPill label="Tous" href={buildHref(params, { status: "all" })} active={status === "all"} />
          <FilterPill label="Actifs" href={buildHref(params, { status: "active" })} active={status === "active"} />
          <FilterPill label="Terminés" href={buildHref(params, { status: "completed" })} active={status === "completed"} />
          <FilterPill label="Abandonnés" href={buildHref(params, { status: "abandoned" })} active={status === "abandoned"} />

          <span className="mx-2 hidden h-6 w-px bg-zinc-200 sm:block" />

          <span className="text-xs text-zinc-500 mr-1">Priorité :</span>
          <FilterPill label="Toutes" href={buildHref(params, { priority: "all" })} active={priority === "all"} />
          <FilterPill label="Haute" href={buildHref(params, { priority: "high" })} active={priority === "high"} />
          <FilterPill label="Moyenne" href={buildHref(params, { priority: "medium" })} active={priority === "medium"} />
          <FilterPill label="Faible" href={buildHref(params, { priority: "low" })} active={priority === "low"} />

          <span className="mx-2 hidden h-6 w-px bg-zinc-200 sm:block" />

          <span className="text-xs text-zinc-500 mr-1">Trier :</span>
          <FilterPill label="Récents" href={buildHref(params, { sort: "createdAt_desc" })} active={sort === "createdAt_desc"} />
          <FilterPill label="Anciens" href={buildHref(params, { sort: "createdAt_asc" })} active={sort === "createdAt_asc"} />
          <FilterPill label="Titre A→Z" href={buildHref(params, { sort: "title_asc" })} active={sort === "title_asc"} />

          {/* Reset */}
          <span className="mx-2 hidden h-6 w-px bg-zinc-200 sm:block" />
          <Link
            href="/objectifs"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            Réinitialiser
          </Link>
        </div>

        {/* Content */}
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-zinc-900">Liste</h2>
              <p className="text-xs text-zinc-500">Les plus récents en premier</p>
            </div>
            <div>
              <Link href="/objectifs/create" className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300">
                + Ajouter un objectif
              </Link>
            </div>
          </div>


          <div className="p-6">
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-sm font-medium text-zinc-900">
                  Pas d&apos;objectifs pour le moment
                </p>
                <p className="mt-1 max-w-sm text-sm text-zinc-600">
                  Crée ton premier objectif pour commencer à suivre ta
                  progression.
                </p>

                <div className="mt-5">
                  <Link href="/objectifs/create" className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300">
                    + Ajouter un objectif
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {list.map((obj) => (
                  <li
                    key={obj.id}
                    className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-zinc-900">
                          {obj.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                          {obj.description || "Aucune description."}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                            statusClasses(obj.status),
                          ].join(" ")}
                        >
                          {statusLabel(obj.status)}
                        </span>

                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                            priorityClasses(obj.priority),
                          ].join(" ")}
                        >
                          Priorité {priorityLabel(obj.priority)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                      {obj.category && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                          #{obj.category}
                        </span>
                      )}

                      {obj.deadline && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                          📅 Deadline :{" "}
                          {new Date(obj.deadline).toLocaleDateString("fr-FR")}
                        </span>
                      )}

                      {obj.startDate && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                          ▶️ Début :{" "}
                          {new Date(obj.startDate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        Créé le{" "}
                        {new Date(obj.createdAt).toLocaleDateString("fr-FR")}
                      </span>

                      <div className="flex gap-2">
                        <Link
                          href={`/objectifs/${obj.id}`}
                          className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/objectifs/${obj.id}/edit`}
                          className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Modifier
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterPill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

/** buildHref safe (supporte string / string[] et évite l’erreur Symbol) */
function buildHref(
  currentParams: SearchParams,
  overrides: Record<string, string | null | undefined>
) {
  const sp = new URLSearchParams();

  for (const [k, v] of Object.entries(currentParams || {})) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((vv) => sp.append(k, vv));
    else sp.set(k, v);
  }

  for (const [k, v] of Object.entries(overrides)) {
    if (v == null || v === "") sp.delete(k);
    else sp.set(k, v);
  }

  const qs = sp.toString();
  return qs ? `/objectifs?${qs}` : "/objectifs";
}
