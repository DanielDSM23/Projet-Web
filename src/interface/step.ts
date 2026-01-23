export interface Step {
  id: string;
  title: string;
  deadline?: Date;
  isCompleted: boolean;
  order: number;
  createdAt?: Date;
  completedAt?: Date;

  goalId: string;
}