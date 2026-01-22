export interface HabitLog {
  id: string;
  date: Date;
  isCompleted: boolean;
  notes?: string | null;
  createdAt: Date;
  habitId: string;
}