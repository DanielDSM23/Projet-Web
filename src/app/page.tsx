import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Button } from '@/components/button';
import { Toaster } from '@/components/sonner';
import { LayoutDashboard, Target, Calendar} from 'lucide-react';
import { Dashboard } from '../components/dashboard';
import { prisma } from "../lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function Home() {
    const session = await getServerSession(authOptions);
     if (!session) {
        redirect("/login");
    }
    const usermail = session?.user?.email;
    let stats;
    let progressPercent;
    let unlockedBadges;
    if(usermail){
        stats = await prisma.user.findUnique({
            where: { email:  usermail},
            include: {
                goals: true,
                habits: true,
                badges: true
            }
        });
        if(stats){
            // const pointsForNextLevel = getPointsForNextLevel(stats.level);
            let pointsForNextLevel = 2;
            
            const currentLevelPoints = (stats.level - 1) * 100;
            // progressPercent = ((stats. - currentLevelPoints) / (pointsForNextLevel - currentLevelPoints)) * 100;
            progressPercent = 10;
            
            unlockedBadges = stats.badges;
            console.log(stats)
        }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Stride
              </h1>
              <p className="text-muted-foreground mt-2">
                Atteignez vos objectifs, construisez de bonnes habitudes
              </p>
            </div>
            <div className="flex gap-2">
                
              <LogoutButton></LogoutButton>
              <Button variant="outline">
                <Link href='/profil'>Profil</Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.level}
              </div>
              <div className="text-sm text-muted-foreground">Niveau</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.xp_points}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-green-600">
                {stats?.goals.filter((g) => g.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">
                Objectifs actifs
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">
                {stats?.habits.filter((h) => !h.isArchived).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Habitudes actives
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <Link href='/objectifs'>Objectifs</Link>
              <span className="sm:hidden">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Link href='/habits'>Habitudes</Link>
              <span className="sm:hidden">Habits</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard stats={stats} />
          </TabsContent>

          {/* <TabsContent value="goals">
            <GoalManager goals={stats?.goals} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="habits">
            <HabitTracker habits={habits} onUpdate={loadData} />
          </TabsContent> */}
        </Tabs>
      </div>

      <Toaster />
    </div>
  );
}
