
// import { getWeeklyProgress } from '@/app/utils/storage';
import { Goal} from '@/interface/goal';
import { Habit } from '@/interface/habit';
import { UserStats } from '@/interface/userStats';
import { Progress } from '@/components/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Trophy, Star, Award, Zap, Target, TrendingUp } from 'lucide-react';
// import * as Icons from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { User } from '@/interface/user';
import { prisma } from '@/lib/prisma';
import { Step } from '@/generated/prisma/client';
import { calculateStreak } from '@/lib/streak';



export async function Dashboard({stats} :any) {
  // const weeklyData = getWeeklyProgress();
  
  // const goalsByCategory = stats.goals.reduce((acc : number, goal : any ) => {
  //   if(goal.category){
  //     acc[goal.category] = (acc[goal.category] || 0) + 1;
  //   }
  //   return acc;
  // }, {} as Record<string, number>);

  // const categoryData = Object.entries(goalsByCategory).map(([category, count]) => ({
  //   name: category,
  //   value: count,
  // }));

  if (!stats) {
    return <div>Loading...</div>;
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  const categoryLabels: Record<string, string> = {
    personal: 'Personnel',
    professional: 'Professionnel',
    health: 'Santé',
    education: 'Éducation',
    finance: 'Finance',
    other: 'Autre',
  };

  const activeGoals = stats?.goals?.filter((g :any) => g.status === "active").length;
  const completedGoalsCount = stats?.goals?.filter((g :any) => g.status === 'completed').length;
  const totalGoals = stats?.goals?.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0;
  const goals = stats?.goals;
  let completedSteps : Step[] = [];
  for( let i =0; i<goals?.length; i++){
      const totalStepCompleted : Step[] = await prisma.step.findMany({
      where: {
        goalId: goals[i].id,
        isCompleted: true
      }
    })
    completedSteps.push(...totalStepCompleted);
  };

  const activeHabits = stats?.habits?.filter((h :any) => !h.isArchived).length;
  const totalHabitCompletions = stats?.habits?.filter((h :any)  => h.isArchived).length;

  const habits = stats?.habits;
  let streakList = [];
  for(let j = 0; j<habits?.length; j++){
    const habitsLog = await prisma.habitLog.findMany({
      where: {
        habitId: habits[j].id
      }
    })
    let HabitWithLogs = habits[j];
    HabitWithLogs["logs"]= habitsLog;
    const streak = calculateStreak(HabitWithLogs);
    streakList.push(streak);
  }
  const sortedStreak = streakList.sort(function(a, b){return b-a});
  const bestStreak = sortedStreak[0];

  const pointsToNextLevel = ((stats?.level) * 500) - stats?.xp_points;
  // const pointsToNextLevel =  500;

  // const renderBadgeIcon = (iconName: string) => {
  //   const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType;
  //   if (IconComponent) {
  //     return <IconComponent className="h-8 w-8" />;
  //   }
  //   return <Star className="h-8 w-8" />;
  // };

  return (
    
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Niveau {stats?.level}</div>
            <p className="text-xs text-muted-foreground">
              {pointsToNextLevel} points pour le niveau suivant
            </p>
            <Progress value={(stats?.xp_points % 500) / 5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Totaux</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSteps.length * 50}</div>
            <p className="text-xs text-muted-foreground">
              {completedSteps.length} étapes complétées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectifs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoalsCount} complétés sur {totalGoals}
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habitudes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHabits}</div>
            <p className="text-xs text-muted-foreground">
              Meilleure série: {bestStreak} jours
            </p>
          </CardContent>
        </Card>
      </div>
     

      {/* Charts */}
      
      {/* <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progression Hebdomadaire</CardTitle>
            <CardDescription>Complétions d'habitudes des 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectifs par Catégorie</CardTitle>
            <CardDescription>Répartition de vos objectifs</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${categoryLabels[name] || name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div> */}
       
      {/* Badges */}
       
      {/* <Card>
        <CardHeader>
          <CardTitle>Badges Débloqués</CardTitle>
          <CardDescription>Vos accomplissements ({stats.badges.length} badges)</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.badges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50"
                >
                  <div className="text-yellow-600 mb-2">
                    {renderBadgeIcon(badge.icon)}
                  </div>
                  <h4 className="font-semibold text-center mb-1">{badge.title}</h4>
                  <p className="text-xs text-center text-muted-foreground">{badge.description}</p>
                  {badge.unlockedAt && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mb-4" />
              <p>Commencez à créer des objectifs et habitudes pour débloquer des badges !</p>
            </div>
          )}
        </CardContent>
      </Card> */}
       
      {/* Recent Activity */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals
              .filter(g => g.status === 'completed')
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Objectif complété • {new Date(goal.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge className="bg-green-500">+100 pts</Badge>
                </div>
              ))}
            
            {stats.badges
              .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
              .slice(0, 3)
              .map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{badge.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Badge débloqué • {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString('fr-FR') : ''}
                    </p>
                  </div>
                </div>
              ))}

            {goals.filter(g => g.status === 'completed').length === 0 && stats.badges.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}
   
    </div>
  );
}
