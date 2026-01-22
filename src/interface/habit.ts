
export type Frequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  frequency: Frequency;
  weeklyTarget?: number | null;
  startDate: Date;
  isArchived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}