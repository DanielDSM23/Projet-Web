'use server'

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { GoalStatus, Priority } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { XP_PER_GOAL, calculateNewStats } from "@/lib/gamification";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, level: true, xp_points: true },
  });

  if (!user) {
    redirect("/login");
  }
  return user;
}

//Créer un Objectif
export async function createGoalAction(formData: FormData) {
  const user = await getAuthenticatedUser();

  const title = String(formData.get("title") || "").trim();
  const descriptionRaw = String(formData.get("description") || "").trim();
  const categoryRaw = String(formData.get("category") || "").trim();

  const priority = (formData.get("priority") ?? "medium") as Priority;
  const status = (formData.get("status") ?? "active") as GoalStatus;

  const startDateRaw = String(formData.get("startDate") || "").trim();
  const deadlineRaw = String(formData.get("deadline") || "").trim();

  if (!title) {
    return;
  }

  const startDate = startDateRaw ? new Date(startDateRaw) : null;
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  await prisma.goal.create({
    data: {
      title,
      description: descriptionRaw || null,
      category: categoryRaw || null,
      priority,
      status,
      startDate,
      deadline,
      completedAt: status === "completed" ? new Date() : null,
      userId: user.id,
    },
  });

  revalidatePath("/objectifs");
  redirect("/objectifs");
}

// Modifier un Objectif
export async function updateGoalAction(goalId: string, formData: FormData) {
  const user = await getAuthenticatedUser();

  const title = String(formData.get("title") || "").trim();
  const descriptionRaw = String(formData.get("description") || "").trim();
  const categoryRaw = String(formData.get("category") || "").trim();

  const priority = (formData.get("priority") ?? "medium") as Priority;
  const status = (formData.get("status") ?? "active") as GoalStatus;

  const startDateRaw = String(formData.get("startDate") || "").trim();
  const deadlineRaw = String(formData.get("deadline") || "").trim();

  if (!title) return;

  const startDate = startDateRaw ? new Date(startDateRaw) : null;
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  // Récupérer l'état actuel

  const oldGoal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { status: true }
  });

  if (!oldGoal) return;


  const isCompleting = status === "completed" && oldGoal.status !== "completed";
  const isUnCompleting = status !== "completed" && oldGoal.status === "completed";

  if (isCompleting) {
    // CAS A : On donne l'XP
    const { newLevel, newXp } = calculateNewStats(user.level, user.xp_points, XP_PER_GOAL);

    await prisma.user.update({
      where: { id: user.id },
      data: { level: newLevel, xp_points: newXp }
    });
  } 
  else if (isUnCompleting) {
    // CAS B : Retour en arrière, On retire l'XP
    const stats = calculateNewStats(user.level, user.xp_points, -XP_PER_GOAL);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { level: stats.newLevel, xp_points: stats.newXp }
      // Note: On ne baisse pas le niveau pour ne pas frustrer, juste l'XP
    });
  }

  await prisma.goal.update({
    where: { 
      id: goalId,
      userId: user.id 
    },
    data: {
      title,
      description: descriptionRaw || null,
      category: categoryRaw || null,
      priority,
      status,
      startDate,
      deadline,
      // Si on passe à completed, on met la date. Sinon on l'enlève.
      completedAt: status === "completed" ? new Date() : null,
    },
  });

  revalidatePath("/objectifs");
  revalidatePath(`/objectifs/${goalId}`);

  if (status === "completed") {
    redirect(`/objectifs?status=all&celebrate=${goalId}`);
  }

  redirect(`/objectifs`);
}