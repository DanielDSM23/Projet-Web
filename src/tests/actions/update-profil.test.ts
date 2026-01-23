import { describe, it, expect, vi, beforeEach } from "vitest";

/** Mock next-auth */
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

/** Mock next/cache */
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

/** Mock prisma */
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { updateProfil } from "@/actions/update-profil";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockSession = (email = "a@a.com") => {
  (getServerSession as any).mockResolvedValue({ user: { email } });
};

describe("updateProfil", () => {
  it("refuse si pas connecté", async () => {
    (getServerSession as any).mockResolvedValue(null);

    const fd = new FormData();
    fd.set("name", "Edz");
    fd.set("email", "a@a.com");

    const res = await updateProfil(fd);

    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/autorisé|connect/i);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("met à jour uniquement le nom (pas de currentPassword requis)", async () => {
    mockSession("a@a.com");

    // user actuel
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1",
      email: "a@a.com",
      password: "hashed_pw",
      name: "Old",
    });

    (prisma.user.update as any).mockResolvedValue({});

    const fd = new FormData();
    fd.set("name", "New Name");
    fd.set("email", "a@a.com");
    fd.set("newPassword", "");
    fd.set("confirmPassword", "");

    const res = await updateProfil(fd);

    expect(res.ok).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({ name: "New Name" }),
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("si email change -> exige currentPassword", async () => {
    mockSession("a@a.com");

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1",
      email: "a@a.com",
      password: "hashed_pw",
      name: "Old",
    });

    const fd = new FormData();
    fd.set("name", "Old");
    fd.set("email", "b@b.com");
    fd.set("currentPassword", "");
    fd.set("newPassword", "");
    fd.set("confirmPassword", "");

    const res = await updateProfil(fd);

    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/mot de passe actuel/i);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("si email change + currentPassword ok -> update email + mustRelog", async () => {
    mockSession("a@a.com");

    (prisma.user.findUnique as any)
      .mockResolvedValueOnce({
        id: "u1",
        email: "a@a.com",
        password: "hashed_pw",
        name: "Old",
      })
      .mockResolvedValueOnce(null);

    (bcrypt.compare as any).mockResolvedValue(true);
    (prisma.user.update as any).mockResolvedValue({});

    const fd = new FormData();
    fd.set("name", "Old");
    fd.set("email", "b@b.com");
    fd.set("currentPassword", "goodpass");
    fd.set("newPassword", "");
    fd.set("confirmPassword", "");

    const res = await updateProfil(fd);

    expect(bcrypt.compare).toHaveBeenCalledWith("goodpass", "hashed_pw");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({ email: "b@b.com", name: "Old" }),
    });

    expect(res.ok).toBe(true);
    expect(res.mustRelog).toBe(true);
  });

  it("si mdp change -> exige currentPassword + hash + update password", async () => {
    mockSession("a@a.com");

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1",
      email: "a@a.com",
      password: "hashed_pw",
      name: "Old",
    });

    (bcrypt.compare as any).mockResolvedValue(true);
    (bcrypt.hash as any).mockResolvedValue("new_hashed_pw");
    (prisma.user.update as any).mockResolvedValue({});

    const fd = new FormData();
    fd.set("name", "Old");
    fd.set("email", "a@a.com");
    fd.set("currentPassword", "goodpass");
    fd.set("newPassword", "12345678");
    fd.set("confirmPassword", "12345678");

    const res = await updateProfil(fd);

    expect(res.ok).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("goodpass", "hashed_pw");
    expect(bcrypt.hash).toHaveBeenCalledWith("12345678", 10);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({ password: "new_hashed_pw" }),
    });
  });

  it("refuse si confirmPassword != newPassword", async () => {
    mockSession("a@a.com");

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1",
      email: "a@a.com",
      password: "hashed_pw",
      name: "Old",
    });

    const fd = new FormData();
    fd.set("name", "Old");
    fd.set("email", "a@a.com");
    fd.set("currentPassword", "goodpass");
    fd.set("newPassword", "12345678");
    fd.set("confirmPassword", "wrong");

    const res = await updateProfil(fd);

    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/correspond|match/i);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
});
