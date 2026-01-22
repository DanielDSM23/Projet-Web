import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { authorizeCredentials, findUserByEmail } from "@/lib/authOptions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

const findUniqueMock = prisma.user.findUnique as unknown as ReturnType<
  typeof vi.fn
>;
const compareMock = bcrypt.compare as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findUserByEmail", () => {
  it("normalise l'email (trim + lowercase) et appelle prisma.user.findUnique", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "test@test.com",
      password: "hash",
    });

    const user = await findUserByEmail("  TEST@TEST.COM  ");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
      select: { id: true, email: true, password: true },
    });

    expect(user).toEqual({
      id: "u1",
      email: "test@test.com",
      password: "hash",
    });
  });

  it("retourne null si aucun user", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    await expect(findUserByEmail("test@test.com")).resolves.toBeNull();
  });
});
describe("authorizeCredentials", () => {
  it("retourne null si email manquant", async () => {
    const res = await authorizeCredentials({ password: "x" });
    expect(res).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("retourne null si password manquant", async () => {
    const res = await authorizeCredentials({ email: "test@test.com" });
    expect(res).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("retourne null si user introuvable", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const res = await authorizeCredentials({
      email: "test@test.com",
      password: "password123",
    });

    expect(res).toBeNull();
    expect(compareMock).not.toHaveBeenCalled();
  });

  it("retourne null si password invalide", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "test@test.com",
      password: "hashed_pw",
    });
    compareMock.mockResolvedValueOnce(false);

    const res = await authorizeCredentials({
      email: "test@test.com",
      password: "wrong",
    });

    expect(compareMock).toHaveBeenCalledWith("wrong", "hashed_pw");
    expect(res).toBeNull();
  });

  it("retourne {id, email} si password valide", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "test@test.com",
      password: "hashed_pw",
    });
    compareMock.mockResolvedValueOnce(true);

    const res = await authorizeCredentials({
      email: " TEST@TEST.COM ",
      password: "password123",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@test.com" },
      }),
    );
    expect(compareMock).toHaveBeenCalledWith("password123", "hashed_pw");
    expect(res).toEqual({ id: "u1", email: "test@test.com" });
  });

  it("throw 'Authentication failed' si erreur Prisma", async () => {
    findUniqueMock.mockRejectedValueOnce(new Error("DB down"));

    await expect(
      authorizeCredentials({ email: "test@test.com", password: "x" }),
    ).rejects.toThrow("Authentication failed");
  });
});
