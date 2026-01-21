import Link from "next/link";
import { registerAction } from "./../../actions/register";

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

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const sp = await searchParams;
  const errorMsg = errorLabel(sp?.error);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Créer un compte
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Inscris-toi pour accéder à ton espace et suivre ta progression.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-sm font-medium text-zinc-900">Inscription</h2>
            <p className="text-xs text-zinc-500">
              Tous les champs sont obligatoires sauf le nom.
            </p>
          </div>

          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {errorMsg}
              </div>
            )}

            <form action={registerAction} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">
                  Nom (optionnel)
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ex: Alice"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="ex: alice@mail.com"
                  required
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">
                  Mot de passe
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Min 8 caractères"
                  required
                  minLength={8}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">
                  Confirmer le mot de passe
                </label>
                <input
                  name="confirm"
                  type="password"
                  placeholder="Répète le mot de passe"
                  required
                  minLength={8}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                Créer mon compte
              </button>

              <p className="text-xs text-zinc-500">
                En créant un compte, tu acceptes les conditions d’utilisation.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
