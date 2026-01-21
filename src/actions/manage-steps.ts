'use server'

import { prisma } from "@/lib/prisma"
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
  await prisma.step.update({
    where: { id: stepId },
    data: { isCompleted: !currentStatus, completedAt: !currentStatus ? new Date() : null }
  })
  revalidatePath(`/objectifs/${goalId}`)
}

// Supprimer une étape
export async function deleteStep(stepId: string, goalId: string) {
  await prisma.step.delete({
    where: { id: stepId }
  })
  revalidatePath(`/objectifs/${goalId}`)
}