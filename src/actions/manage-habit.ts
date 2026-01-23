"use server";

import { Frequency } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"


async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    return user;
}

function err(code: string) {
  return redirect(`/register?error=${encodeURIComponent(code)}`);
}

function toFrequency(value: string): Frequency {
  switch (value.toLowerCase()) {
    case 'daily':
      return Frequency.daily
    case 'weekly':
      return Frequency.weekly
    default:
      throw new Error(`Invalid frequency: ${value}`)
  }
}

export async function addHabit(formData: FormData) {

  const user = await getAuthenticatedUser();

  const name = String(formData.get("title") ?? "")
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "");
  const frequency = String(formData.get("frequency") ?? "");
  const userId = user.id;

  if (!name || !category || !frequency) err("missing_fields");

  await prisma.habit.create({
    data: {
      name,
      description,
      category,
      createdAt: new Date(),
      frequency: toFrequency(frequency),
      userId,
      ...(frequency === "weekly" && { weeklyTarget: 3 }),
    },
    select: { id: true },
  });

  redirect("/habits");
}


export async function updateHabit(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const frequency = formData.get("frequency") as string;

  if (!id || !title) {
    throw new Error("missing_fields");
  }

  await prisma.habit.update({
    where: { id },
    data: {
      name: title,
      description,
      category,
      frequency: toFrequency(frequency),
    },
  });
  redirect("/habits");
}