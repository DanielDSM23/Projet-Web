"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function updateProfil(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, message: "Non autorisé." };


  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, password: true, name: true },
  });
  if (!user) return { ok: false, message: "Utilisateur introuvable." };

  const wantsEmailChange = email && email !== user.email;
  const wantsPasswordChange =
    newPassword.length > 0 || confirmPassword.length > 0;

  if (name.length < 2) return { ok: false, message: "Nom trop court (min 2)." };
  if (name.length > 40)
    return { ok: false, message: "Nom trop long (max 40)." };

  if ((wantsEmailChange || wantsPasswordChange) && !currentPassword) {
    return {
      ok: false,
      message:
        "Entre ton mot de passe actuel pour modifier email / mot de passe.",
    };
  }

  if (wantsEmailChange || wantsPasswordChange) {
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return { ok: false, message: "Mot de passe actuel incorrect." };
  }

  if (wantsEmailChange) {
    if (!email.includes("@") || email.length < 6) {
      return { ok: false, message: "Email invalide." };
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { ok: false, message: "Cet email est déjà utilisé." };
  }

  if (wantsPasswordChange) {
    if (newPassword.length < 8) {
      return { ok: false, message: "Nouveau mot de passe trop court (min 8)." };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, message: "Les mots de passe ne correspondent pas." };
    }
  }

  const data: any = { name };

  if (wantsEmailChange) data.email = email;

  if (wantsPasswordChange) {
    const hashed = await bcrypt.hash(newPassword, 10);
    data.password = hashed;
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  revalidatePath("/profil");

  if (wantsEmailChange) {
    return {
      ok: true as const,
      message:
        "Profil mis à jour. Reconnecte-toi pour finaliser le changement d’email.",
      mustRelog: true as const,
    };
  }

  return { ok: true as const, message: "Profil mis à jour ✅" };
}
