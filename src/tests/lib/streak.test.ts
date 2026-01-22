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

});