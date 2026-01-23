export const XP_PER_HABIT = 10;
export const XP_PER_STEP = 50;
export const XP_PER_GOAL = 200;

export function getXpRequiredForNextLevel(level: number) {
  return level * 100;
}

// Calcule les nouvelles stats (Fonctionne pour le Gain et la Perte)

export function calculateNewStats(currentLevel: number, currentXp: number, xpDelta: number) {
  let newLevel = currentLevel;
  let newXp = currentXp + xpDelta; 

  // CAS 1 : MONTÉE DE NIVEAU (Level Up)
  while (newXp >= getXpRequiredForNextLevel(newLevel)) {
    const xpRequired = getXpRequiredForNextLevel(newLevel);
    newXp -= xpRequired;
    newLevel++;
  }

  // CAS 2 : DESCENTE DE NIVEAU (Level Down)
  while (newXp < 0 && newLevel > 1) {
    newLevel--;
    const xpCapPrevious = getXpRequiredForNextLevel(newLevel);
    newXp += xpCapPrevious;
  }

  // Si on retombe niveau 1 et qu'on est toujours en négatif
  if (newXp < 0) {
    newXp = 0;
  }

  return { 
    newLevel, 
    newXp,
  };
}