'use client'

import { useState, useRef } from "react"
import { addStep } from "@/actions/add-step"

export default function AddStepForm({ goalId }: { goalId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // On crée une version de l'action qui inclut déjà l'ID de l'objectif
  const addStepWithId = addStep.bind(null, goalId)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 flex w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
      >
        + Ajouter une étape
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addStepWithId(formData)
        formRef.current?.reset() // Vide les champs
        setIsOpen(false) // Referme le formulaire
      }}
      className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    >
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="title" className="sr-only">Titre de l'étape</label>
          <input
            type="text"
            name="title"
            placeholder="Ex: Lire le chapitre 1..."
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            name="deadline"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          
          <div className="flex-1"></div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </form>
  )
}