// src/app/objectifs/objectifs.ssr.ts
import type { PrismaClient } from "@prisma/client";

export type SearchParams = Record<string, string | string[] | undefined>;

export type SessionLike = {
  user?: { email?: string | null } | null;
} | null;

export function computeQuery(params: SearchParams, userId: string) {
  const status = typeof params.status === "string" ? params.status : "all";
  const priority = typeof params.priority === "string" ? params.priority : "all";
  const sort = typeof params.sort === "string" ? params.sort : "createdAt_desc";

  const where = {
    userId,
    ...(status !== "all" ? { status } : {}),
    ...(priority !== "all" ? { priority } : {}),
  };

  const orderBy =
    sort === "createdAt_asc"
      ? { createdAt: "asc" as const }
      : sort === "title_asc"
        ? { title: "asc" as const }
        : { createdAt: "desc" as const };

  return { status, priority, sort, where, orderBy };
}

export async function getObjectifsSSR(opts: {
  prisma: Pick<PrismaClient, "user" | "goal">;
  session: SessionLike;
  params: SearchParams;
}) {
  const { prisma, session, params } = opts;

  const email = session?.user?.email ?? null;
  if (!email) {
    return { user: null, objectifs: [], query: null as any };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.id) {
    return { user: null, objectifs: [], query: null as any };
  }

  const query = computeQuery(params, user.id);

  const objectifs = await prisma.goal.findMany({
    where: query.where,
    orderBy: query.orderBy,
  });

  return { user, objectifs, query };
}
