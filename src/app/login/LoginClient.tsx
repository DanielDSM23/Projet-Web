"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const errorLabel = (code?: string | null) => {
  switch (code) {
    case "CredentialsSignin":
      return "Email ou mot de passe incorrect.";
    case "OAuthSignin":
    case "OAuthCallback":
      return "Erreur de connexion. Réessaie.";
    default:
      return null;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(errorLabel(urlError));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (!res) {
      setError("Une erreur est survenue. Réessaie.");
      return;
    }

    if (res.error) {
      setError(errorLabel(res.error) ?? "Email ou mot de passe incorrect.");
      return;
    }

    router.push(res.url ?? "/");
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Se connecter
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Accède à ton espace pour suivre ta progression.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              Pas de compte ? S’inscrire
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-sm font-medium text-zinc-900">Connexion</h2>
            <p className="text-xs text-zinc-500">
              Entre ton email et ton mot de passe.
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-zinc-900">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="ex: alice@mail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Ton mot de passe"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                Se connecter
              </button>

              <p className="text-xs text-zinc-500">
                En te connectant, tu acceptes les conditions d’utilisation.
              </p>
            </form>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/register"
                className="text-xs font-medium text-zinc-700 hover:underline"
              >
                Créer un compte
              </Link>

              <span className="text-xs text-zinc-400">
                Mot de passe oublié ?
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
