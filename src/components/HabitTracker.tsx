import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Badge } from '@/components/badge';
import { Plus, Flame, CheckCircle2, Circle, Calendar, Trash2, Edit } from 'lucide-react';
import { Habit, GoalCategory, HabitFrequency } from '@/app/types';
import { addHabit, updateHabit, deleteHabit, toggleHabitCompletion } from '@/app/utils/utils';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HabitTrackerProps {
  habits: Habit[];
  onUpdate: () => void;
}

export function HabitTracker({ habits, onUpdate }: HabitTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as GoalCategory,
    frequency: 'daily' as HabitFrequency,
    targetDays: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingHabit) {
      updateHabit(editingHabit.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        frequency: formData.frequency,
        targetDays: formData.frequency === 'weekly' ? formData.targetDays : undefined,
      });
    } else {
      addHabit({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        frequency: formData.frequency,
        targetDays: formData.frequency === 'weekly' ? formData.targetDays : undefined,
        isActive: true,
      });
    }
    
    setIsDialogOpen(false);
    setEditingHabit(null);
    setFormData({ title: '', description: '', category: 'personal', frequency: 'daily', targetDays: [] });
    onUpdate();
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      targetDays: habit.targetDays || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette habitude ?')) {
      deleteHabit(id);
      onUpdate();
    }
  };

  const handleToggle = (habitId: string, date: Date) => {
    toggleHabitCompletion(habitId, date);
    onUpdate();
  };

  const isCompletedOnDate = (habit: Habit, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completions.some((c) => c.date === dateStr);
  };

  const getWeekDays = (): Date[] => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();
  const today = format(new Date(), 'yyyy-MM-dd');

  const getCategoryColor = (category: GoalCategory): string => {
    const colors = {
      personal: 'bg-blue-500',
      professional: 'bg-purple-500',
      health: 'bg-green-500',
      education: 'bg-yellow-500',
      finance: 'bg-red-500',
      other: 'bg-gray-500',
    };
    return colors[category];
  };

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mes Habitudes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingHabit(null);
              setFormData({ title: '', description: '', category: 'personal', frequency: 'daily', targetDays: [] });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Habitude
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHabit ? 'Modifier l\'Habitude' : 'Nouvelle Habitude'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-title">Titre</Label>
                <Input
                  id="habit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habit-description">Description (optionnel)</Label>
                <Input
                  id="habit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habit-category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value: GoalCategory) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personnel</SelectItem>
                    <SelectItem value="professional">Professionnel</SelectItem>
                    <SelectItem value="health">Santé</SelectItem>
                    <SelectItem value="education">Éducation</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="habit-frequency">Fréquence</Label>
                <Select value={formData.frequency} onValueChange={(value: HabitFrequency) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingHabit ? 'Mettre à jour' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week View */}
      <Card>
        <CardHeader>
          <CardTitle>Cette Semaine</CardTitle>
          <CardDescription>Suivez vos habitudes jour par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium">Habitude</th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="text-center p-2 font-medium min-w-[60px]">
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{dayNames[index]}</span>
                        <span className={`text-xs ${format(day, 'yyyy-MM-dd') === today ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {format(day, 'd')}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {habits.filter(h => h.isActive).map((habit) => (
                  <tr key={habit.id} className="border-t">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(habit.category)}`} />
                        <div>
                          <div className="font-medium">{habit.title}</div>
                          {habit.streak > 0 && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <Flame className="h-3 w-3" />
                              {habit.streak} jours
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day, index) => {
                      const isCompleted = isCompletedOnDate(habit, day);
                      const isToday = format(day, 'yyyy-MM-dd') === today;
                      return (
                        <td key={index} className="text-center p-2">
                          <button
                            onClick={() => handleToggle(habit.id, day)}
                            className={`p-2 rounded-full hover:bg-accent transition-colors ${
                              isToday ? 'ring-2 ring-primary ring-offset-2' : ''
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(habit)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(habit.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Habit Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {habits.filter(h => h.isActive).map((habit) => (
          <Card key={habit.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getCategoryColor(habit.category)}`} />
                <CardTitle className="text-base">{habit.title}</CardTitle>
              </div>
              {habit.description && (
                <CardDescription className="text-sm">{habit.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Série actuelle</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {habit.streak} jours
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meilleure série</span>
                <Badge variant="outline">{habit.bestStreak} jours</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total complétions</span>
                <Badge variant="outline">{habit.completions.length}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {habits.filter(h => h.isActive).length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune habitude créée. Commencez à construire de bonnes habitudes !</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
