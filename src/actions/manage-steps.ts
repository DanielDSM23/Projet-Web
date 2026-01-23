'use server'

import { authOptions } from "@/lib/authOptions"
import { calculateNewStats, XP_PER_STEP } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

// Modifier une étape (Titre, Date, ou Case à cocher)
export async function updateStep(stepId: string, goalId: string, formData: FormData) {
  const title = formData.get("title") as string
  const deadlineStr = formData.get("deadline") as string
  
  await prisma.step.update({
    where: { id: stepId },
    data: {
      title,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
    }
  })

  revalidatePath(`/objectifs/${goalId}`)
}

// Spécial pour la checkbox (Toggle)
export async function toggleStepStatus(stepId: string, goalId: string, currentStatus: boolean) {
  
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, level: true, xp_points: true }
  })

  if (!user) return

  const newStatus = !currentStatus

  await prisma.step.update({
    where: { id: stepId },
    data: { isCompleted: newStatus, completedAt: newStatus ? new Date() : null }
  })

  if (newStatus === true) {
    // CAS A : L'utilisateur vient de cocher la case -> On DONNE de l'XP
    const { newLevel, newXp } = calculateNewStats(user.level, user.xp_points, XP_PER_STEP)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { level: newLevel, xp_points: newXp }
    })

  } else {
    // CAS B : L'utilisateur décoche la case (Oups, erreur) -> On RETIRE l'XP
    // C'est important pour éviter la triche (cocher/décocher en boucle pour gagner des niveaux)
    
    // Note : Il faut s'assurer que l'XP ne tombe pas en dessous de 0 ou gérer la descente de niveau.
    // Pour faire simple au début, on retire juste les points sans faire baisser le niveau :
    const {newLevel, newXp} = calculateNewStats(user.level, user.xp_points, -XP_PER_STEP)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { level: newLevel, xp_points: newXp }
    })
  }
  revalidatePath(`/objectifs/${goalId}`)
}

// Supprimer une étape
export async function deleteStep(stepId: string, goalId: string) {
  await prisma.step.delete({
    where: { id: stepId }
  })
  revalidatePath(`/objectifs/${goalId}`)
}