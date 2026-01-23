"use client";

import { useMemo, useState } from "react";
import { updateProfil } from "@/actions/update-profil";
import { signOut } from "next-auth/react";

export default function ProfilForm({
  user,
}: {
  user: { id: string; name: string; email: string };
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const sensitiveChange = useMemo(() => {
    const emailChanged =
      email.trim().toLowerCase() !== user.email.toLowerCase();
    const wantsNewPass = newPassword.length > 0 || confirmPassword.length > 0;
    return emailChanged || wantsNewPass;
  }, [email, newPassword, confirmPassword, user.email]);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        setMsg(null);

        formData.set("id", user.id);

        formData.set("name", name);
        formData.set("email", email);

        formData.set("currentPassword", currentPassword);
        formData.set("newPassword", newPassword);
        formData.set("confirmPassword", confirmPassword);

        const res = await updateProfil(formData);

        if (res?.ok && res.mustRelog) {
          await signOut({ callbackUrl: "/login" });
          return;
        }

        setPending(false);

        if (res?.ok) {
          setMsg({ type: "ok", text: res.message ?? "Profil mis à jour ✅" });

          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          setMsg({ type: "err", text: res?.message ?? "Erreur." });
        }
      }}
      className="space-y-4"
    >
      {/* EMAIL */}
      <div>
        <label className="text-xs font-medium text-zinc-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="ton@email.com"
          autoComplete="email"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Changer l’email peut demander une reconnexion.
        </p>
      </div>

      {/* NOM */}
      <div>
        <label className="text-xs font-medium text-zinc-700">Nom</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="Ton nom"
          autoComplete="name"
        />
        <p className="mt-1 text-xs text-zinc-500">Entre 2 et 40 caractères.</p>
      </div>

      {/* SÉCURITÉ */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-medium text-zinc-900">Sécurité</p>
        <p className="mt-1 text-xs text-zinc-600">
          Pour changer l’email ou le mot de passe, on te demandera ton mot de
          passe actuel.
        </p>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-700">
              Nouveau mot de passe
            </label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700">
              Confirmer le nouveau mot de passe
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {/* Mot de passe actuel (affiché seulement si nécessaire) */}
          {sensitiveChange && (
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Mot de passe actuel
              </label>
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                placeholder="Ton mot de passe actuel"
                autoComplete="current-password"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Requis si tu modifies l’email ou le mot de passe.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE */}
      {msg && (
        <div
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            msg.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
        >
          {msg.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
