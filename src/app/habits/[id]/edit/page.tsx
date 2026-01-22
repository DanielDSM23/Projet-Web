"use server";

import { prisma } from "@/lib/prisma";
import { updateHabit } from "@/actions/manage-habit";
import { notFound } from "next/navigation";
type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditHabitModal({ params }: PageProps) {
    const { id } = await params;
    
    const habit = await prisma.habit.findUnique({
        where: {
        id
        },
    });

    if (!habit) {
        notFound();
    }

    return (
        <form action={updateHabit}>
        {/* hidden id for update */}
        <input type="hidden" name="id" value={habit.id} />

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Modifier l’habitude</h2>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Titre</label>
                <input
                name="title"
                defaultValue={habit.name}
                className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Description (optionnel)
                </label>
                <textarea
                name="description"
                defaultValue={habit.description ?? ""}
                className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Catégorie</label>
                <select
                name="category"
                defaultValue={habit.category}
                className="w-full rounded-lg border px-3 py-2"
                >
                <option value="Personnel">Personnel</option>
                <option value="Travail">Travail</option>
                <option value="Santé">Santé</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Fréquence</label>
                <select
                name="frequency"
                defaultValue={habit.frequency}
                className="w-full rounded-lg border px-3 py-2"
                >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                </select>
            </div>

            <button
                type="submit"
                className="w-full rounded-xl bg-black py-3 text-white font-medium hover:bg-black/90"
            >
                Enregistrer
            </button>
            </div>
        </div>
        </form>
    );
}
