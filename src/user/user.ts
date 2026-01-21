import { prisma } from "../lib/prisma"
import { User } from '@/interface/user';

export async function getUserData(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Pas de user trouvé
    if (!user) {
      return null;
    }

    return user as User;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Failed to retrieve user data.');
  }
}
