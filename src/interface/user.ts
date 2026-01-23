import { Goal } from "./goal";
import {Habit} from "./habit";
import {Badge} from "./badge";
// Define a User interface to describe the structure of user information
export interface User {
  id: string;
  email: string;
  password: string;
  name: string | undefined; // Optional as per Prisma schema
  level: number;
  xp_points: number;
  createdAt: Date; // Date object as per Prisma schema
  updatedAt: Date; // Date object as per Prisma schema

  goals: Goal[],
  habits: Habit[],
  badges: Badge[]
}