import { prisma } from "../../lib/prisma";
import { Goal} from '@/interface/goal';
import { Habit } from '@/interface/habit';
import { User } from '@/interface/user';
import { Badge } from '@/interface/badge';
import { format, startOfDay, differenceInDays } from 'date-fns';
import { HabitLog } from '@/interface/habitLog';

// const STORAGE_KEYS = {
//   GOALS: 'goals_tracker_goals',
//   HABITS: 'goals_tracker_habits',
//   USER_STATS: 'goals_tracker_stats',
// };

// Goals
export const getUserStats = (userId : string) => {

  const stats = await prisma.user.findMany({
    where: {
      id: userId
    },
     include: {
      goals: true,
      habits: true,
      badges: true
    }
  });
  return stats;
};

// export const saveGoals = (goals: Goal[]): void => {
//   localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
// };

// export const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>): Goal => {
//   const goals = getGoals();
//   const newGoal: Goal = {
//     ...goal,
//     id: crypto.randomUUID(),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     progress: 0,
//   };
//   goals.push(newGoal);
//   saveGoals(goals);
//   return newGoal;
// };

// export const updateGoal = (id: string, updates: Partial<Goal>): void => {
//   const goals = getGoals();
//   const index = goals.findIndex((g) => g.id === id);
//   if (index !== -1) {
//     goals[index] = {
//       ...goals[index],
//       ...updates,
//       updatedAt: new Date().toISOString(),
//     };
//     saveGoals(goals);
//   }
// };

// export const deleteGoal = (id: string): void => {
//   const goals = getGoals().filter((g) => g.id !== id);
//   saveGoals(goals);
// };


export const calculateGoalProgress = (goal: Goal): number => {
    const totalSteps = goal.steps.length;
    if (totalSteps === 0) return 0;
    const completedSteps = goal.steps.filter(step => step.isCompleted).length;
    return Math.round((completedSteps / totalSteps) * 100);
};

// export const calculateCompletionRate = (habit : Habit, startDate : Date, endDate : Date) : number => {
//   const logs = getLogsBetween(habit.id, startDate, endDate);
//   const daysBetween = getDaysBetween(startDate, endDate);

//   if (habit.frequency === 'daily') {
//     return (logs.length / daysBetween) * 100;
//   } 
//   else if (habit.frequency === 'weekly') {
//     const weeks = Math.ceil(daysBetween / 7);
//     const expectedTotal = weeks * habit.weekly_target;
//     return (logs.length / expectedTotal) * 100;
//   }
// }

// function getLogsBetween(habit.id, startDate, endDate) : HabitLog[] {
//   return 
// }

// Habits
// export const getHabits = (): Habit[] => {
//   const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
//   return stored ? JSON.parse(stored) : [];
// };

// export const saveHabits = (habits: Habit[]): void => {
//   localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
// };

// export const addHabit = (
//   habit: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'streak' | 'bestStreak'>
// ): Habit => {
//   const habits = getHabits();
//   const newHabit: Habit = {
//     ...habit,
//     id: crypto.randomUUID(),
//     createdAt: new Date().toISOString(),
//     completions: [],
//     streak: 0,
//     bestStreak: 0,
//   };
//   habits.push(newHabit);
//   saveHabits(habits);
//   return newHabit;
// };

// export const updateHabit = (id: string, updates: Partial<Habit>): void => {
//   const habits = getHabits();
//   const index = habits.findIndex((h) => h.id === id);
//   if (index !== -1) {
//     habits[index] = { ...habits[index], ...updates };
//     saveHabits(habits);
//   }
// };

// export const deleteHabit = (id: string): void => {
//   const habits = getHabits().filter((h) => h.id !== id);
//   saveHabits(habits);
// };

// export const toggleHabitCompletion = (habitId: string, date: Date): void => {
//   const habits = getHabits();
//   const habit = habits.find((h) => h.id === habitId);
//   if (!habit) return;

//   const dateStr = format(date, 'yyyy-MM-dd');
//   const existingIndex = habit.completions.findIndex((c) => c.date === dateStr);

//   if (existingIndex !== -1) {
//     // Toggle off
//     habit.completions.splice(existingIndex, 1);
//   } else {
//     // Toggle on
//     habit.completions.push({ date: dateStr, completed: true });
//   }

//   // Recalculate streak
//   const { currentStreak, bestStreak } = calculateStreak(habit);
//   habit.streak = currentStreak;
//   habit.bestStreak = Math.max(habit.bestStreak, bestStreak);

//   saveHabits(habits);
  
//   // Update user stats
//   updateUserStats();
// };


//dans le doc du projet 4
export const calculateStreak = (habitLogs: HabitLog[]): number => {
    // Trier les logs par date décroissante
    const sortedLogs = habitLogs
    .filter(log => log.isCompleted)
    .sort((a : any , b : any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
}




// User Stats
// export const getUserStats = (): UserStats => {
//   const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
//   if (stored) return JSON.parse(stored);

//   // Initialize default stats
//   const defaultStats: UserStats = {
//     totalPoints: 0,
//     level: 1,
//     completedGoals: 0,
//     completedSteps: 0,
//     totalHabitCompletions: 0,
//     badges: [],
//   };
//   localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(defaultStats));
//   return defaultStats;
// };

// export const saveUserStats = (stats: UserStats): void => {
//   localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
// };

// export const updateUserStats = (): void => {
//   const goals = getGoals();
//   const habits = getHabits();
//   const currentStats = getUserStats();

//   const completedGoals = goals.filter((g) => g.status === 'completed').length;
//   const completedSteps = goals.reduce((acc, g) => acc + g.steps.filter((s) => s.completed).length, 0);
//   const totalHabitCompletions = habits.reduce((acc, h) => acc + h.completions.length, 0);

//   // Calculate points
//   const points = completedGoals * 100 + completedSteps * 10 + totalHabitCompletions * 5;
  
//   // Calculate level (every 500 points = 1 level)
//   const level = Math.floor(points / 500) + 1;

//   // Check for new badges
//   const badges = checkBadges(goals, habits, currentStats.badges);

//   const newStats: UserStats = {
//     totalPoints: points,
//     level,
//     completedGoals,
//     completedSteps,
//     totalHabitCompletions,
//     badges,
//   };

//   saveUserStats(newStats);
// };

// const checkBadges = (goals: Goal[], habits: Habit[], currentBadges: Badge[]): Badge[] => {
//   const badges = [...currentBadges];
//   const now = new Date().toISOString();

//   const badgeDefinitions = [
//     {
//       id: 'first_goal',
//       title: 'Premier Objectif',
//       description: 'Créer votre premier objectif',
//       icon: 'Target',
//       condition: () => goals.length >= 1,
//     },
//     {
//       id: 'goal_master',
//       title: 'Maître des Objectifs',
//       description: 'Compléter 5 objectifs',
//       icon: 'Award',
//       condition: () => goals.filter((g) => g.status === 'completed').length >= 5,
//     },
//     {
//       id: 'habit_builder',
//       title: 'Bâtisseur d\'Habitudes',
//       description: 'Créer 3 habitudes',
//       icon: 'Calendar',
//       condition: () => habits.length >= 3,
//     },
//     {
//       id: 'streak_7',
//       title: 'Série de 7',
//       description: 'Maintenir une habitude pendant 7 jours consécutifs',
//       icon: 'Flame',
//       condition: () => habits.some((h) => h.streak >= 7),
//     },
//     {
//       id: 'streak_30',
//       title: 'Champion 30 Jours',
//       description: 'Maintenir une habitude pendant 30 jours consécutifs',
//       icon: 'Trophy',
//       condition: () => habits.some((h) => h.streak >= 30),
//     },
//     {
//       id: 'hundred_completions',
//       title: 'Centenaire',
//       description: 'Compléter 100 habitudes',
//       icon: 'Star',
//       condition: () => habits.reduce((acc, h) => acc + h.completions.length, 0) >= 100,
//     },
//   ];

//   for (const def of badgeDefinitions) {
//     const alreadyHas = badges.some((b) => b.id === def.id);
//     if (!alreadyHas && def.condition()) {
//       badges.push({
//         id: def.id,
//         title: def.title,
//         description: def.description,
//         icon: def.icon,
//         unlockedAt: now,
//       });
//     }
//   }

//   return badges;
// };

// export const getWeeklyProgress = (): { date: string; completions: number }[] => {
//   const habits = getHabits();
//   const result: { date: string; completions: number }[] = [];
  
//   for (let i = 6; i >= 0; i--) {
//     const date = new Date();
//     date.setDate(date.getDate() - i);
//     const dateStr = format(date, 'yyyy-MM-dd');
    
//     const completions = habits.reduce((acc, habit) => {
//       return acc + (habit.completions.some((c) => c.date === dateStr) ? 1 : 0);
//     }, 0);
    
//     result.push({
//       date: format(date, 'EEE'),
//       completions,
//     });
//   }
  
//   return result;
// };
