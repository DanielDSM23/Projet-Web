'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleHabit(habitId: string) {
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

    if (existingLog) {
      await prisma.habitLog.delete({
        where: {
          id: existingLog.id
        }
      })

    }

  } catch (error) {
    console.error("Erreur lors du toggle de l'habitude:", error)
  }
}