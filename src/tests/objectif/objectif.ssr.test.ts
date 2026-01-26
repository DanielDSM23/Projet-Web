import { describe, it, expect, vi } from "vitest";
import { computeQuery, getObjectifsSSR } from "../../app/objectifs/objectif.ssr";

describe("Objectifs SSR (Vitest)", () => {
  it("computeQuery: defaults", () => {
    const q = computeQuery({}, "u1");
    expect(q.where).toEqual({ userId: "u1" });
    expect(q.orderBy).toEqual({ createdAt: "desc" });
  });

  it("computeQuery: status/priority + sort title_asc", () => {
    const q = computeQuery(
      { status: "active", priority: "high", sort: "title_asc" },
      "u1",
    );
    expect(q.where).toEqual({ userId: "u1", status: "active", priority: "high" });
    expect(q.orderBy).toEqual({ title: "asc" });
  });

  it("getObjectifsSSR: pas de session -> aucun appel DB", async () => {
    const prismaMock = {
      user: { findUnique: vi.fn() },
      goal: { findMany: vi.fn() },
    };

    const res = await getObjectifsSSR({
      prisma: prismaMock as any,
      session: null,
      params: {},
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.goal.findMany).not.toHaveBeenCalled();
    expect(res.objectifs).toEqual([]);
  });

  it("getObjectifsSSR: user trouvé -> appelle findMany avec where/orderBy", async () => {
    const prismaMock = {
      user: { findUnique: vi.fn().mockResolvedValue({ id: "u1", email: "a@a.com" }) },
      goal: { findMany: vi.fn().mockResolvedValue([{ id: "g1" }, { id: "g2" }]) },
    };

    const res = await getObjectifsSSR({
      prisma: prismaMock as any,
      session: { user: { email: "a@a.com" } },
      params: { status: "active", priority: "high", sort: "createdAt_asc" },
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "a@a.com" },
    });

    expect(prismaMock.goal.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", status: "active", priority: "high" },
      orderBy: { createdAt: "asc" },
    });

    expect(res.objectifs).toHaveLength(2);
  });

  it("getObjectifsSSR: user introuvable -> objectifs vides", async () => {
    const prismaMock = {
      user: { findUnique: vi.fn().mockResolvedValue(null) },
      goal: { findMany: vi.fn() },
    };

    const res = await getObjectifsSSR({
      prisma: prismaMock as any,
      session: { user: { email: "missing@a.com" } },
      params: {},
    });

    expect(prismaMock.goal.findMany).not.toHaveBeenCalled();
    expect(res.objectifs).toEqual([]);
  });
});
