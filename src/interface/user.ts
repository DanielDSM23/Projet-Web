// Define a User interface to describe the structure of user information
export interface User {
  id: string;
  email: string;
  password: string;
  name?: string; // Optional as per Prisma schema
  level: number;
  xp_points: number;
  createdAt: Date; // Date object as per Prisma schema
  updatedAt: Date; // Date object as per Prisma schema
}