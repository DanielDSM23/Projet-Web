// Define a Goal interface to describe the structure of goal information
import {Step} from "./step";

enum Priority {
  low= "low",
  medium= "medium",
  high= "high"
}

enum GoalStatus {
  active= "active",
  completed= "completed",
  abandoned= "abandoned"
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null; 
  priority: Priority;
  status: GoalStatus;
  startDate?: Date;
  deadline?: Date;
  createdAt?: Date; 
  updatedAt: Date; 
  completedAt?: Date;

  userId: string;
  steps: Step[];
}
