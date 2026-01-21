'use client'

import { useState } from "react"
import { updateStep, deleteStep, toggleStepStatus } from "@/actions/manage-steps"

// On définit le type des props (les données qu'on reçoit de la page)
type StepProps = {
  step: {
    id: string
    title: string
    deadline: Date | null
    isCompleted: boolean
    order: number
  }
  goalId: string
}

export default function StepItem({ step, goalId }: StepProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Formatage de la date pour l'input HTML (yyyy-MM-dd)
  const dateValue = step.deadline 
    ? new Date(step.deadline).toISOString().split('T')[0] 
    : ""

  // --- MODE ÉDITION (Formulaire) ---
  if (isEditing) {
    return (
      <form 
        action={async (formData) => {
          await updateStep(step.id, goalId, formData)
          setIsEditing(false)
        }}
        className="flex flex-col gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-4"
      >
        <div className="flex gap-2">
          <input
            name="title"
            defaultValue={step.title}
            className="w-full rounded-lg border border-blue-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between">
          <input
            type="date"
            name="deadline"
            defaultValue={dateValue}
            className="rounded-lg border border-blue-300 px-2 py-1 text-xs text-zinc-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </form>
    )
  }

  // --- MODE AFFICHAGE (Lecture seule) ---
  return (
    <div className="group flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition-colors">
      
      {/* Partie Gauche : Checkbox + Titre */}
      <div className="flex min-w-0 gap-3 items-center">
        {/* Checkbox Interactive */}
        <button
          onClick={() => toggleStepStatus(step.id, goalId, step.isCompleted)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            step.isCompleted 
              ? "border-emerald-500 bg-emerald-500 text-white" 
              : "border-zinc-300 hover:border-zinc-400"
          }`}
        >
          {step.isCompleted && (
             <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
          )}
        </button>

        <div className="min-w-0">
          <p className={`text-sm font-medium ${step.isCompleted ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
            <span className="mr-2 text-zinc-300 text-xs">#{step.order}</span>
            {step.title}
          </p>
          {step.deadline && (
            <p className="mt-0.5 text-xs text-zinc-500">
              📅 {new Date(step.deadline).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>

      {/* Partie Droite : Boutons Modifier / Supprimer (Visibles au survol) */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          title="Modifier"
        >
          ✏️
        </button>
        
        <button
          onClick={() => {
            if (confirm("Supprimer cette étape ?")) {
              deleteStep(step.id, goalId)
            }
          }}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
          title="Supprimer"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}