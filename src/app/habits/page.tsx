import { prisma } from "@/lib/prisma"
import HabitCard from "@/components/HabitCard"
import Link from "next/link"
import { calculateStreak } from "@/lib/streak"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function HabitsPage() {

  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    redirect("/api/auth/signin")
  }

  const userData = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  // 1. Récupération des habitudes et de leurs logs
  const habits = await prisma.habit.findMany({
    where: { userId: userData.id },
    include: {
      logs: true // On récupère l'historique pour savoir si c'est fait
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Préparation des données pour l'affichage
  const habitsWithStats = habits.map(habit => {
    // Calcul basique pour l'affichage : est-ce qu'il y a un log aujourd'hui ?
    const today = new Date().toISOString().split('T')[0]
    const hasLogToday = habit.logs.some(log => 
      log.date.toISOString().split('T')[0] === today
    )

    const currentStreak = calculateStreak(habit);

    return {
      ...habit,
      currentStreak: currentStreak,
      isCompletedToday: hasLogToday
    }
  })

  // Calculs pour le Header (Statistiques globales)
  const totalHabits = habitsWithStats.length
  const completedCount = habitsWithStats.filter(h => h.isCompletedToday).length
  const completionRate = totalHabits === 0 ? 0 : Math.round((completedCount / totalHabits) * 100)

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        
        {/* Header de la page */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                Mes Habitudes
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Construis ta routine jour après jour.
              </p>
            </div>
            
            {/* Bouton d'ajout (Déco pour l'instant) */}
            <Link 
              href="/habits/new" // À créer plus tard
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            >
              + Nouvelle habitude
            </Link>
          </div>

          {/* Barre de progression journalière globale */}
          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-zinc-700">Progression du jour</span>
              <span className="text-zinc-500">{completedCount}/{totalHabits} habitudes</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </header>

        {/* Grille des cartes */}
        {habitsWithStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 py-20 text-center">
            <div className="mb-4 text-4xl">🌱</div>
            <h3 className="text-lg font-medium text-zinc-900">Aucune habitude</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mt-1">
              Commence petit. Ajoute ta première habitude pour lancer ta série !
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habitsWithStats.map((habit) => (
              <HabitCard 
                key={habit.id}
                id={habit.id}
                name={habit.name}
                category={habit.category}
                streak={habit.currentStreak}
                isCompletedToday={habit.isCompletedToday}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}