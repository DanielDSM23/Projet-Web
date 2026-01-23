import { prisma } from "@/lib/prisma";
import ProfilForm from "@/components/ProfilForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      level: true,
      xp_points: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { goals: true, habits: true, badges: true } },
    },
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-900">
              Utilisateur introuvable
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Profil
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Récap de ton compte
          </p>
        </header>

        {/* Recap */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-semibold text-zinc-900 truncate">
                {user.name || "Sans nom"}
              </p>
              <p className="mt-1 text-sm text-zinc-600 truncate">
                {user.email}
              </p>
            </div>

            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                Niveau {user.level}
              </span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                XP {user.xp_points}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">Objectifs</p>
              <p className="text-lg font-semibold text-zinc-900">
                {user._count.goals}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">Habitudes</p>
              <p className="text-lg font-semibold text-zinc-900">
                {user._count.habits}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-zinc-500">Badges</p>
              <p className="text-lg font-semibold text-zinc-900">
                {user._count.badges}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Dernière mise à jour :{" "}
            {new Date(user.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </section>

        {/* Form modif */}
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900">Modifier</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Modification du profil.
          </p>

          <div className="mt-5">
            <ProfilForm
              user={{ id: user.id, name: user.name ?? "", email: user.email }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
