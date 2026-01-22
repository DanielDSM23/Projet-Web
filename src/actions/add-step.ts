'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addStep(goalId: string, formData: FormData) {
  const title = formData.get("title") as string
  const deadlineStr = formData.get("deadline") as string

  if (!title || !title.trim()) {
    return
  }

  const lastStep = await prisma.step.findFirst({
    where: { goalId },
    orderBy: { order: 'desc' },
    select: { order: true }
  })
  const nextOrder = (lastStep?.order ?? 0) + 1

  // 2. Créer l'étape
  await prisma.step.create({
    data: {
      title,
      goalId,
      order: nextOrder,
      deadline: deadlineStr ? new Date(deadlineStr) : null,
      isCompleted: false
    }
  })

  revalidatePath(`/objectifs/${goalId}`)
}