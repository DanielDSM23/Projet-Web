import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Progress } from '@/components/progress';
import { Badge } from '@/components/badge';
import { Plus, Target, Trash2, Edit, Check, X, Calendar } from 'lucide-react';
import { Goal, GoalCategory, GoalStatus, GoalStep } from '@/app/types';
import { addGoal, updateGoal, deleteGoal, calculateGoalProgress, updateUserStats } from '@/app/utils/utils';

interface GoalManagerProps {
  goals: Goal[];
  onUpdate: () => void;
}

export function GoalManager({ goals, onUpdate }: GoalManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as GoalCategory,
    deadline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        deadline: formData.deadline || undefined,
      });
    } else {
      addGoal({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: 'not_started',
        deadline: formData.deadline || undefined,
        steps: [],
      });
    }
    
    updateUserStats();
    setIsDialogOpen(false);
    setEditingGoal(null);
    setFormData({ title: '', description: '', category: 'personal', deadline: '' });
    onUpdate();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      deadline: goal.deadline || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      deleteGoal(id);
      updateUserStats();
      onUpdate();
    }
  };

  const handleStatusChange = (goal: Goal, status: GoalStatus) => {
    updateGoal(goal.id, { status });
    updateUserStats();
    onUpdate();
  };

  const handleAddStep = (goalId: string) => {
    const stepTitle = prompt('Titre de l\'étape :');
    if (!stepTitle) return;

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newStep: GoalStep = {
      id: crypto.randomUUID(),
      title: stepTitle,
      completed: false,
      order: goal.steps.length,
    };

    updateGoal(goalId, {
      steps: [...goal.steps, newStep],
      progress: calculateGoalProgress({ ...goal, steps: [...goal.steps, newStep] }),
    });
    updateUserStats();
    onUpdate();
  };

  const handleToggleStep = (goal: Goal, stepId: string) => {
    const updatedSteps = goal.steps.map((step) =>
      step.id === stepId
        ? { ...step, completed: !step.completed, completedAt: !step.completed ? new Date().toISOString() : undefined }
        : step
    );

    updateGoal(goal.id, {
      steps: updatedSteps,
      progress: calculateGoalProgress({ ...goal, steps: updatedSteps }),
    });
    updateUserStats();
    onUpdate();
  };

  const handleDeleteStep = (goal: Goal, stepId: string) => {
    const updatedSteps = goal.steps.filter((step) => step.id !== stepId);
    updateGoal(goal.id, {
      steps: updatedSteps,
      progress: calculateGoalProgress({ ...goal, steps: updatedSteps }),
    });
    updateUserStats();
    onUpdate();
  };

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

  const getStatusBadge = (status: GoalStatus) => {
    const variants: Record<GoalStatus, string> = {
      not_started: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      abandoned: 'bg-red-500',
    };

    const labels: Record<GoalStatus, string> = {
      not_started: 'Non commencé',
      in_progress: 'En cours',
      completed: 'Terminé',
      abandoned: 'Abandonné',
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mes Objectifs</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingGoal(null);
              setFormData({ title: '', description: '', category: 'personal', deadline: '' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Objectif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Modifier l\'Objectif' : 'Nouvel Objectif'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
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
                <Label htmlFor="deadline">Date limite (optionnel)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingGoal ? 'Mettre à jour' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(goal.category)}`} />
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(goal.status)}
                {goal.deadline && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progression</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Étapes ({goal.steps.filter(s => s.completed).length}/{goal.steps.length})</span>
                  <Button variant="ghost" size="sm" onClick={() => handleAddStep(goal.id)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {goal.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                      <button
                        onClick={() => handleToggleStep(goal, step.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          step.completed ? 'bg-primary border-primary' : 'border-gray-300'
                        }`}
                      >
                        {step.completed && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteStep(goal, step.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={goal.status} onValueChange={(value: GoalStatus) => handleStatusChange(goal, value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Non commencé</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="abandoned">Abandonné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun objectif créé. Commencez par en créer un !</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
