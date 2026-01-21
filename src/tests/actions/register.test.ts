import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { registerAction } from "@/actions/register";

vi.mock("bcrypt", () => ({
  default: { hash: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const mockedHash = bcrypt.hash as unknown as ReturnType<typeof vi.fn>;
const mockedFindUnique = prisma.user.findUnique as unknown as ReturnType<
  typeof vi.fn
>;
const mockedCreate = prisma.user.create as unknown as ReturnType<typeof vi.fn>;
const mockedRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

function makeFormData(values: Record<string, string | null | undefined>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (!v) continue;
    fd.set(k, v);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();

  mockedFindUnique.mockResolvedValue(null);
  mockedHash.mockResolvedValue("HASHED_PASSWORD");
  mockedCreate.mockResolvedValue({ id: "user_1" });

  mockedRedirect.mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
});

describe("registerAction", () => {
  it("redirige si champs manquants", async () => {
    const fd = makeFormData({
      email: "",
      password: "password123",
      confirm: "password123",
    });

    await expect(registerAction(fd)).rejects.toThrow(
      "REDIRECT:/register?error=missing_fields",
    );
  });

  it("crée un user et redirige vers /login", async () => {
    const fd = makeFormData({
      email: "Alice@Mail.com ",
      password: "password123",
      confirm: "password123",
      name: " Alice ",
    });

    await expect(registerAction(fd)).rejects.toThrow("REDIRECT:/login");

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: { email: "alice@mail.com" },
    });

    expect(mockedHash).toHaveBeenCalledWith("password123", 10);

    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        email: "alice@mail.com",
        password: "HASHED_PASSWORD",
        name: "Alice",
      },
      select: { id: true },
    });
  });
});
