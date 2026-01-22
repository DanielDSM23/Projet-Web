"use server";
import { addHabit } from "@/actions/manage-habit";
import { prisma } from "@/lib/prisma";


const errorLabel = (code?: string | null) => {
  switch (code) {
    case "missing_fields":
      return "Email et mot de passe requis.";
    case "password_too_short":
      return "Mot de passe trop court (min 8 caractères).";
    case "password_mismatch":
      return "Les mots de passe ne correspondent pas.";
    case "email_taken":
      return "Cet email est déjà utilisé.";
    default:
      return null;
  }
};

export default async function NewHabitsModal({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
 const errorLabel = (code?: string | null) => {
    switch (code) {
      case "missing_fields":
        return "Email et mot de passe requis.";
      default:
        return null;
    }
  };
  const sp = await searchParams;
  const errorMsg = errorLabel(sp?.error);

  return (
    <form action={addHabit}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Nouvelle Habitude</h2>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Titre</label>
            <input
              name="title"
              type="text"
              placeholder="Titre"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description (optionnel)</label>
            <textarea
              name="description"
              placeholder="Titre"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Catégorie</label>
            <select
              name="category"
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="Personnel">Personnel</option>
              <option value="Travail">Travail</option>
              <option value="Santé">Santé</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Fréquence</label>
            <select
              name="frequency"
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black py-3 text-white font-medium hover:bg-black/90"
          >
            Créer
          </button>
        </div>
      </div>
    </form>
  );
}
