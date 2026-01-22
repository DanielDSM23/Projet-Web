'use client'

import Link from "next/link"

type HabitCardProps = {
  id: string
  name: string
  category?: string | null
  streak: number
  isCompletedToday: boolean
}

export default function HabitCard({
  id,
  name,
  category,
  streak,
  isCompletedToday,
}: HabitCardProps) {

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all hover:shadow-md ${
        isCompletedToday
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-zinc-200 bg-white"
      }`}
    >
      {/* ✏️ Edit button */}
      <Link
        href={`/habits/${id}/edit`}
        className="absolute right-3 top-3 z-10 rounded-lg border bg-white p-2 text-zinc-400 opacity-0 shadow-sm transition-all hover:text-zinc-700 hover:shadow group-hover:opacity-100"
        aria-label="Modifier l’habitude"
      >
        ✏️
      </Link>

      <div className="p-5 flex items-start justify-between gap-4">
        {/* Partie Gauche */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                {category}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 text-xs font-bold ${
                streak > 0 ? "text-orange-500" : "text-zinc-400"
              }`}
            >
              🔥 {streak}
            </span>
          </div>

          <h3
            className={`text-lg font-semibold truncate ${
              isCompletedToday ? "text-emerald-900" : "text-zinc-900"
            }`}
          >
            {name}
          </h3>

          <p className="text-sm text-zinc-500 mt-1">
            {isCompletedToday
              ? "Validé pour aujourd'hui ! 🎉"
              : "Pas encore fait aujourd'hui"}
          </p>
        </div>

        {/* Bouton validation */}
        <button
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
            isCompletedToday
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-300 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          {isCompletedToday ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <span className="h-4 w-4 rounded-full bg-zinc-100"></span>
          )}
        </button>
      </div>

      {/* Barre décorative */}
      {isCompletedToday && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-200">
          <div className="h-full w-full bg-emerald-500 opacity-50" />
        </div>
      )}
    </div>
  )
}
