'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { XP_PER_HABIT, XP_PER_GOAL, XP_PER_STEP, calculateNewStats } from "@/lib/gamification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function toggleHabit(habitId: string) {

  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, level: true, xp_points: true } // On a besoin du niveau et de l'xp
  });

  if (!user) return;

  // 1. Définir "Aujourd'hui" (Fenêtre de 00:00 à 23:59)
  const now = new Date()
  
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    // 2. Vérifier si un log existe déjà pour cette plage horaire
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: habitId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    let xpModifier = 0;

    if (existingLog) {
      await prisma.habitLog.delete({
        where: {
          id: existingLog.id
        }
      })

      xpModifier = -XP_PER_HABIT;

    } else {
      await prisma.habitLog.create({
        data: {
          habitId: habitId,
          date: now,
          isCompleted: true
        }
      })
      xpModifier = XP_PER_HABIT;
    }

    const { newLevel, newXp } = calculateNewStats(
        user.level, 
        user.xp_points, 
        xpModifier
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        level: newLevel,
        xp_points: newXp
      }
    });

    // 3. Rafraîchir l'interface
    revalidatePath("/habits")

  } catch (error) {
    console.error("Erreur lors du toggle de l'habitude:", error)
  }
}