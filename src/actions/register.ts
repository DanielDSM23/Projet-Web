"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function err(code: string) {
  return redirect(`/register?error=${encodeURIComponent(code)}`);
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;

  if (!email || !password) err("missing_fields");
  if (password.length < 8) err("password_too_short");
  if (password !== confirm) err("password_mismatch");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) err("email_taken");

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true },
  });

  redirect("/login");
}
