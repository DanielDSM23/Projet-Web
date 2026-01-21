import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

type dbUser = {
  id: string;
  email: string;
  password: string;
};

export async function findUserByEmail(email: string): Promise<dbUser | null> {
  const cleanedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: cleanedEmail,
    },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  return user;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        try {
          const user = await findUserByEmail(email);
          if (!user) return null;

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) return null;
          return { id: user.id, email: user.email };
        } catch (err) {
          console.error("Auth error:", err);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
};
