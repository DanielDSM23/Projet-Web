import { Habit } from "@/interface/habit";
import { HabitLog } from "@/interface/habitLog";

type HabitWithLogs = Habit & { logs: HabitLog[] }

 // Calcule la Streak
export function calculateStreak(habit: HabitWithLogs): number {
  if (!habit.logs || habit.logs.length === 0) return 0;

  const loggedDates = new Set(
    habit.logs.map(log => {
      return new Date(log.date).toISOString().split('T')[0];
    })
  );

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Daily
  if (habit.frequency === 'daily') {
    let streak = 0;
    let checkDate = new Date();

    // CAS 1 : C'est fait aujourd'hui ?
    if (loggedDates.has(todayStr)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } 
    // CAS 2 : Pas fait aujourd'hui, mais fait hier ?
    else if (loggedDates.has(yesterdayStr)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 2); 
    } 
    // CAS 3 : Ni fait aujourd'hui, ni hier
    else {
      return 0;
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (loggedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  //Weekly
  if (habit.frequency === 'weekly') {
    return 0; 
  }

  return 0;
}