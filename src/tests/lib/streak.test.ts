import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateStreak } from "@/lib/streak";
import { Habit } from "@/interface/habit";
import { HabitLog } from "@/interface/habitLog";

// Type utilitaire pour matcher ce que la fonction attend
type HabitWithLogs = Habit & { logs: HabitLog[] };

function createMockHabit(logDates: string[]): HabitWithLogs {
  return {
    id: "habit_test",
    name: "Test Streak",
    frequency: "daily",
    userId: "user_1",
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    isArchived: false,
    // On transforme les strings "2025-01-15" en objets Date
    logs: logDates.map((dateStr, index) => ({
      id: `log_${index}`,
      date: new Date(dateStr),
      isCompleted: true,
      habitId: "habit_test",
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: null,
    })),
  } as HabitWithLogs;
}

describe("calculateStreak (Logique de Série)", () => {
  // On décide que "Aujourd'hui" est le Mercredi 15 Janvier 2025 à midi
  const MOCK_TODAY = new Date("2025-01-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  it("retourne 0 si aucun log n'existe", () => {
    const habit = createMockHabit([]);
    expect(calculateStreak(habit)).toBe(0);
  });

  it("retourne 1 si fait aujourd'hui (15 Janvier)", () => {
    const habit = createMockHabit(["2025-01-15T10:00:00Z"]);
    expect(calculateStreak(habit)).toBe(1);
  });

  it("retourne 1 si fait hier (14 Janvier) mais pas aujourd'hui", () => {
    // La série est toujours active car on a le droit de sauter la journée en cours
    const habit = createMockHabit(["2025-01-14T10:00:00Z"]);
    expect(calculateStreak(habit)).toBe(1);
  });

  it("retourne 0 si fait avant-hier (13 Janvier) mais pas hier ni aujourd'hui", () => {
    // La chaîne est brisée
    const habit = createMockHabit(["2025-01-13T10:00:00Z"]);
    expect(calculateStreak(habit)).toBe(0);
  });

  it("calcule une série continue (Aujourd'hui + Hier + Avant-Hier)", () => {
    const habit = createMockHabit([
      "2025-01-15T08:00:00Z", // Aujourd'hui
      "2025-01-14T08:00:00Z", // Hier
      "2025-01-13T08:00:00Z", // Avant-hier
    ]);
    expect(calculateStreak(habit)).toBe(3);
  });

  it("calcule une série continue s'arrêtant hier (Hier + Avant-Hier)", () => {
    const habit = createMockHabit([
      "2025-01-14T08:00:00Z", // Hier (Série active)
      "2025-01-13T08:00:00Z", // Avant-hier
    ]);
    expect(calculateStreak(habit)).toBe(2);
  });

  it("gère les trous dans la série (Log récent mais trou avant)", () => {
    const habit = createMockHabit([
      "2025-01-15T08:00:00Z", // Aujourd'hui
      "2025-01-14T08:00:00Z", // Hier
      // PAS de log le 13
      "2025-01-12T08:00:00Z", // Le 12 (trop vieux, ne compte pas dans la série actuelle)
    ]);
    // La série devrait être de 2 (15 et 14)
    expect(calculateStreak(habit)).toBe(2);
  });

  it("ne compte pas les doublons le même jour", () => {
    const habit = createMockHabit([
      "2025-01-15T08:00:00Z", // Fait à 8h
      "2025-01-15T20:00:00Z", // Fait à 20h (Doublon)
    ]);
    expect(calculateStreak(habit)).toBe(1);
  });
});