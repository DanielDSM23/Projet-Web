// scripts/seed-goals.ts
import { prisma } from "../lib/prisma";


async function main() {
    const userId = "addf07a8-c946-46c9-8fa4-10ed812f9e03";

    // Optionnel : vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User not found: ${userId}`);

    const now = new Date();
    const plusDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const goalsData = [
        {
            title: "Reprendre une routine sport (3 séances / semaine)",
            description: "Objectif progressif sur 4 semaines pour reprendre un rythme.",
            category: "Santé",
            priority: Priority.high,
            status: GoalStatus.active,
            startDate: now,
            deadline: plusDays(28),
            steps: [
                { title: "Planifier 3 créneaux dans le calendrier", deadline: plusDays(2), order: 1 },
                { title: "Faire une séance full body (débutant)", deadline: plusDays(4), order: 2 },
                { title: "Faire 3 séances sur une semaine", deadline: plusDays(7), order: 3 },
                { title: "Ajuster le programme (charges / exos)", deadline: plusDays(10), order: 4 },
            ],
        },
        {
            title: "Améliorer l’alimentation (batch cooking)",
            description: "Préparer des repas simples et réguliers pour la semaine.",
            category: "Nutrition",
            priority: Priority.medium,
            status: GoalStatus.active,
            startDate: now,
            deadline: plusDays(21),
            steps: [
                { title: "Choisir 3 recettes simples", deadline: plusDays(2), order: 1 },
                { title: "Faire une liste de courses", deadline: plusDays(3), order: 2 },
                { title: "Préparer 6 portions (2 recettes)", deadline: plusDays(5), order: 3 },
                { title: "Suivre 7 jours sans skip petit-déj", deadline: plusDays(8), order: 4 },
            ],
        },
        {
            title: "Passer le projet NestJS en auth complète (JWT + roles)",
            description: "Sécuriser l’API, gérer les rôles et protéger les endpoints.",
            category: "Dev",
            priority: Priority.high,
            status: GoalStatus.active,
            startDate: now,
            deadline: plusDays(14),
            steps: [
                { title: "Créer module Auth + stratégie JWT", deadline: plusDays(2), order: 1 },
                { title: "Créer guard JWT + décorateur user", deadline: plusDays(4), order: 2 },
                { title: "Ajouter roles (admin/partenaire/user)", deadline: plusDays(6), order: 3 },
                { title: "Protéger 5 endpoints sensibles", deadline: plusDays(10), order: 4 },
                { title: "Tester avec Postman + cas d’erreur", deadline: plusDays(12), order: 5 },
            ],
        },
        {
            title: "Mettre en place une base de tests (Jest) + CI",
            description: "Démarrer l’automatisation qualité avec une pipeline simple.",
            category: "Qualité",
            priority: Priority.medium,
            status: GoalStatus.active,
            startDate: now,
            deadline: plusDays(18),
            steps: [
                { title: "Configurer Jest (unit tests)", deadline: plusDays(3), order: 1 },
                { title: "Ajouter 5 tests unitaires ciblés", deadline: plusDays(7), order: 2 },
                { title: "Ajouter 2 tests d’intégration", deadline: plusDays(11), order: 3 },
                { title: "Créer workflow GitHub Actions (test on push)", deadline: plusDays(14), order: 4 },
            ],
        },
        {
            title: "Améliorer le sommeil (routine du soir)",
            description: "Stabiliser l’heure de coucher et réduire les écrans.",
            category: "Bien-être",
            priority: Priority.low,
            status: GoalStatus.active,
            startDate: now,
            deadline: plusDays(20),
            steps: [
                { title: "Définir une heure de coucher cible", deadline: plusDays(1), order: 1 },
                { title: "Couper les écrans 30 min avant", deadline: plusDays(4), order: 2 },
                { title: "Tenir 5 jours consécutifs", deadline: plusDays(7), order: 3 },
                { title: "Ajuster routine (lecture / douche / étirements)", deadline: plusDays(10), order: 4 },
            ],
        },
        {
            title: "Organiser le dashboard alertes (Wazuh/ESET)",
            description: "Structurer le back pour mutualiser la logique et améliorer la perf.",
            category: "Sécurité",
            priority: Priority.high,
            status: GoalStatus.active,
            startDate: now,
            deadline: plusDays(16),
            steps: [
                { title: "Lister les endpoints à mutualiser", deadline: plusDays(2), order: 1 },
                { title: "Uniformiser les DTO/format de réponse", deadline: plusDays(5), order: 2 },
                { title: "Brancher Redis cache sur 2 routes clés", deadline: plusDays(8), order: 3 },
                { title: "Ajouter pagination + filtres côté front", deadline: plusDays(12), order: 4 },
            ],
        },
    ];

    // Création en base
    const created = [];
    for (const g of goalsData) {
        const goal = await prisma.goal.create({
            data: {
                title: g.title,
                description: g.description,
                category: g.category,
                priority: g.priority,
                status: g.status,
                startDate: g.startDate,
                deadline: g.deadline,
                user: { connect: { id: userId } },
                steps: {
                    create: g.steps.map((s) => ({
                        title: s.title,
                        deadline: s.deadline,
                        order: s.order,
                    })),
                },
            },
            include: { steps: true },
        });
        created.push(goal);
    }

    console.log(`✅ ${created.length} goals créés pour user ${userId}`);
    for (const g of created) {
        console.log(`- ${g.title} (${g.steps.length} steps)`);
    }
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
