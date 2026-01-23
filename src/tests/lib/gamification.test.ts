import { describe, it, expect } from "vitest";
import { calculateNewStats, getXpRequiredForNextLevel } from "@/lib/gamification";

describe("Logique de Gamification", () => {

  describe("getXpRequiredForNextLevel", () => {
    it("calcule correctement les paliers", () => {
      // Niveau 1 -> faut 100 XP
      expect(getXpRequiredForNextLevel(1)).toBe(100);
      // Niveau 2 -> faut 200 XP
      expect(getXpRequiredForNextLevel(2)).toBe(200);
      // Niveau 10 -> faut 1000 XP
      expect(getXpRequiredForNextLevel(10)).toBe(1000);
    });
  });

  describe("calculateNewStats", () => {
        
    it("ajoute de l'XP simple sans monter de niveau", () => {
      // Niv 1 (0 XP) + 50 XP = Niv 1 (50 XP)
      const res = calculateNewStats(1, 0, 50);
      expect(res).toEqual({ newLevel: 1, newXp: 50 });
    });

    it("monte de niveau (Level Up) pile poil sur le seuil", () => {
      // Niv 1 (90 XP) + 10 XP = 100 XP
      // Seuil Niv 1 = 100 XP. Donc on passe Niv 2 avec 0 XP restant.
      const res = calculateNewStats(1, 90, 10);
      expect(res).toEqual({ newLevel: 2, newXp: 0 });
    });

    it("monte de niveau avec surplus d'XP", () => {
      // Niv 1 (90 XP) + 20 XP = 110 XP
      // Seuil Niv 1 = 100 XP. 110 - 100 = 10 XP restants.
      const res = calculateNewStats(1, 90, 20);
      expect(res).toEqual({ newLevel: 2, newXp: 10 });
    });

    it("gère la montée de PLUSIEURS niveaux d'un coup", () => {
      // Niv 1 (0 XP). On gagne 500 XP d'un coup (Jackpot).
      // Niv 1 coût: 100 -> Reste 400. (Niv devient 2)
      // Niv 2 coût: 200 -> Reste 200. (Niv devient 3)
      // Niv 3 coût: 300 -> Manque 100. On reste Niv 3 avec 200 XP.
      const res = calculateNewStats(1, 0, 500);
      expect(res).toEqual({ newLevel: 3, newXp: 200 });
    });

    it("retire de l'XP simple sans descendre de niveau", () => {
      // Niv 2 (50 XP) - 20 XP = Niv 2 (30 XP)
      const res = calculateNewStats(2, 50, -20);
      expect(res).toEqual({ newLevel: 2, newXp: 30 });
    });

    it("descend de niveau (Level Down) quand l'XP passe sous 0", () => {
      // Niv 2 (10 XP) - 20 XP = -10 XP.
      // On doit descendre au Niv 1.
      // Le Niv 1 demande 100 XP.
      // Nouveau solde = 100 - 10 = 90 XP.
      const res = calculateNewStats(2, 10, -20);
      expect(res).toEqual({ newLevel: 1, newXp: 90 });
    });

    it("gère la descente de PLUSIEURS niveaux", () => {
      // Niv 3 (10 XP). Grosse pénalité de -350 XP.
      // Net: -340 XP.
      // 1. Descend Niv 2. (Plafond Niv 2 = 200). Solde = -340 + 200 = -140 XP.
      // 2. Descend Niv 1. (Plafond Niv 1 = 100). Solde = -140 + 100 = -40 XP.
      // 3. On est Niv 1, on ne peut plus descendre. Solde capé à 0.
      const res = calculateNewStats(3, 10, -350);
      expect(res).toEqual({ newLevel: 1, newXp: 0 }); // Selon ta logique "floor at 0"
    });

    it("ne descend jamais en dessous du niveau 1", () => {
      // Niv 1 (10 XP) - 50 XP = -40 XP.
      // On est déjà Niv 1, on ne peut pas descendre.
      // L'XP doit être remise à 0.
      const res = calculateNewStats(1, 10, -50);
      expect(res).toEqual({ newLevel: 1, newXp: 0 });
    });

    it("ne fait rien si le changement est 0", () => {
      const res = calculateNewStats(5, 120, 0);
      expect(res).toEqual({ newLevel: 5, newXp: 120 });
    });
  });
});