export default function UserLevel({ level, currentXp }: { level: number, currentXp: number }) {
  const xpRequired = level * 100; // Doit correspondre à la formule de l'étape 1
  const progress = Math.min(100, Math.round((currentXp / xpRequired) * 100));

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <div className="flex justify-between text-xs font-bold text-zinc-600">
        <span>{currentXp} / {xpRequired} XP</span>
      </div>
      
      {/* Barre de progression */}
      <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}