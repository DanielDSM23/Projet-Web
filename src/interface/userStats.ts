import { Badge } from "./badge";

export interface UserStats {
  totalPoints: number;
  level: number;
  completedGoals: number;
  completedSteps: number;
  totalHabitCompletions: number;
  badges: Badge[];
}