import { UserBadge } from "./userBadge";


export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;

  users: UserBadge[]
}