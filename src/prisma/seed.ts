import { prisma } from "../lib/prisma";

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export async function main() {
  // Optionnel : reset (utile en dev)
  await prisma.userBadge.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.step.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();

  // 1) USERS
  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      password: "Azerty123",
      email: "alice@prisma.io",
      level: 3,
      xp_points: 120,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@prisma.io",
      password: "Azerty123",
      level: 1,
      xp_points: 10,
    },
  });

  // 2) GOALS + STEPS
  await prisma.goal.create({
    data: {
      title: "Perdre 5kg",
      description: "Objectif remise en forme",
      category: "Santé",
      priority: "high",
      status: "active",
      startDate: daysAgo(14),
      deadline: daysFromNow(30),
      userId: alice.id,
      steps: {
        create: [
          { title: "Aller à la salle 3x/semaine", order: 1, deadline: daysFromNow(7) },
          { title: "12-5-30 2x/semaine", order: 2, deadline: daysFromNow(14) },
          { title: "Suivre les macros 5j/7", order: 3, deadline: daysFromNow(21) },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Améliorer mon alimentation",
      description: "Préparer des repas simples et réguliers pour la semaine.",
      category: "Santé",
      priority: "high",
      status: "active",
      startDate: daysAgo(14),
      deadline: daysFromNow(30),
      userId: alice.id,
      steps: {
        create: [
          { title: "Aller à la salle 3x/semaine", order: 1, deadline: daysFromNow(7) },
          { title: "12-5-30 2x/semaine", order: 2, deadline: daysFromNow(14) },
          { title: "Suivre les macros 5j/7", order: 3, deadline: daysFromNow(21) },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Passer le projet NestJS en auth complète (JWT + roles)",
      description: "Sécuriser l’API, gérer les rôles et protéger les endpoints.",
      category: "Dev",
      priority: "high",
      status: "active",
      startDate: daysAgo(14),
      deadline: daysFromNow(30),
      userId: alice.id,
      steps: {
        create: [
          { title: "Créer module Auth + stratégie JWT", deadline: daysFromNow(2), order: 1 },
          { title: "Créer guard JWT + décorateur user", deadline: daysFromNow(4), order: 2 },
          { title: "Ajouter roles (admin/partenaire/user)", deadline: daysFromNow(6), order: 3 },
          { title: "Protéger 5 endpoints sensibles", deadline: daysFromNow(10), order: 4 },
          { title: "Tester avec Postman + cas d’erreur", deadline: daysFromNow(12), order: 5 },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Améliorer le sommeil (routine du soir)",
      description: "Stabiliser l’heure de coucher et réduire les écrans.",
      category: "Santé",
      priority: "low",
      status: "active",
      startDate: daysAgo(14),
      deadline: daysFromNow(30),
      userId: alice.id,
      steps: {
        create: [
          { title: "Définir une heure de coucher cible", deadline: daysFromNow(1), order: 1 },
          { title: "Couper les écrans 30 min avant", deadline: daysFromNow(4), order: 2 },
          { title: "Tenir 5 jours consécutifs", deadline: daysFromNow(7), order: 3 },
          { title: "Ajuster routine (lecture / douche / étirements)", deadline: daysFromNow(10), order: 4 },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Finir un projet Next.js",
      description: "Mettre en prod une app",
      category: "Dev",
      priority: "medium",
      status: "active",
      startDate: daysAgo(7),
      deadline: daysFromNow(21),
      userId: alice.id,
      steps: {
        create: [
          { title: "Auth + Prisma", order: 1, deadline: daysFromNow(5) },
          { title: "Page objectifs", order: 2, deadline: daysFromNow(10) },
          { title: "Déploiement", order: 3, deadline: daysFromNow(21) },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Lire 12 livres",
      description: "Lecture régulière",
      category: "Perso",
      priority: "low",
      status: "active",
      startDate: daysAgo(3),
      deadline: daysFromNow(120),
      userId: bob.id,
      steps: {
        create: [
          { title: "Choisir une liste de livres", order: 1, deadline: daysFromNow(7) },
          { title: "Lire 20 pages/jour", order: 2, deadline: daysFromNow(14) },
        ],
      },
    },
  });

  // 3) HABITS + HABITLOGS
  await prisma.habit.create({
    data: {
      name: "12-5-30",
      description: "Tapis 12% / 5 km/h / 30 min",
      category: "Sport",
      frequency: "weekly",
      weeklyTarget: 3,
      startDate: daysAgo(10),
      userId: alice.id,
      logs: {
        create: [
          { date: daysAgo(1), isCompleted: true, notes: "Bonne séance" },
          { date: daysAgo(3), isCompleted: true, notes: "Rythme OK" },
          { date: daysAgo(6), isCompleted: false, notes: "Repos" },
        ],
      },
    },
  });

  await prisma.habit.create({
    data: {
      name: "Boire 2L d'eau",
      category: "Santé",
      frequency: "daily",
      startDate: daysAgo(5),
      userId: alice.id,
      logs: {
        create: [
          { date: daysAgo(0), isCompleted: true },
          { date: daysAgo(1), isCompleted: true },
          { date: daysAgo(2), isCompleted: false, notes: "Oublié" },
        ],
      },
    },
  });

  await prisma.habit.create({
    data: {
      name: "Lecture 20 min",
      category: "Perso",
      frequency: "daily",
      startDate: daysAgo(7),
      userId: bob.id,
      logs: {
        create: [
          { date: daysAgo(0), isCompleted: true, notes: "Chapitre 3" },
          { date: daysAgo(1), isCompleted: false, notes: "Pas eu le temps" },
          { date: daysAgo(2), isCompleted: true, notes: "Chapitre 2" },
        ],
      },
    },
  });

  // 4) BADGES
  const firstGoalBadge = await prisma.badge.create({
    data: {
      name: "First Goal",
      description: "Créer son premier objectif",
      icon: "🎯",
      criteria: "Create 1 goal",
    },
  });

  const streak3Badge = await prisma.badge.create({
    data: {
      name: "Streak 3",
      description: "Compléter un habit 3 jours d'affilée",
      icon: "🔥",
      criteria: "3-day streak",
    },
  });

  // 5) USERBADGE (liaison)
  await prisma.userBadge.createMany({
    data: [
      { userId: alice.id, badgeId: firstGoalBadge.id, earnedAt: daysAgo(2) },
      { userId: bob.id, badgeId: firstGoalBadge.id, earnedAt: daysAgo(1) },
      { userId: alice.id, badgeId: streak3Badge.id, earnedAt: daysAgo(0) },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
