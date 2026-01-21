import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Award } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { gradesApi, studentsApi, coursesApi } from '@/lib/api';
import { Grade, GradeFormData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const getGradeColor = (value: number): string => {
  if (value >= 16) return 'bg-success/10 text-success';
  if (value >= 12) return 'bg-accent/10 text-accent';
  if (value >= 10) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
};

export default function GradesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<GradeFormData>({
    etudiantId: 0,
    coursId: 0,
    valeur: 0,
  });

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: gradesApi.getAll,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: gradesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Success', description: 'Grade assigned successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to assign grade' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GradeFormData }) => 
      gradesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Success', description: 'Grade updated successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update grade' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: gradesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Success', description: 'Grade deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedGrade(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete grade' });
    },
  });

  const filteredGrades = grades.filter(grade =>
    grade.etudiant?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.etudiant?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.cours?.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.cours?.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedGrade(null);
    setFormData({ etudiantId: 0, coursId: 0, valeur: 0 });
    setIsFormOpen(true);
  };

  const openEditForm = (grade: Grade) => {
    setSelectedGrade(grade);
    setFormData({
      etudiantId: grade.etudiant?.id || 0,
      coursId: grade.cours?.id || 0,
      valeur: grade.valeur,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedGrade(null);
    setFormData({ etudiantId: 0, coursId: 0, valeur: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const canManageGrades = user?.role === 'ADMIN' || user?.role === 'FORMATEUR';

  const columns = [
    { 
      key: 'etudiant', 
      header: 'Student',
      render: (grade: Grade) => (
        <div>
          <p className="font-medium">{grade.etudiant?.prenom} {grade.etudiant?.nom}</p>
          <p className="text-sm text-muted-foreground">{grade.etudiant?.matricule}</p>
        </div>
      ),
    },
    { 
      key: 'cours', 
      header: 'Course',
      render: (grade: Grade) => (
        <div>
          <p className="font-medium">{grade.cours?.titre}</p>
          <p className="text-sm text-muted-foreground font-mono">{grade.cours?.code}</p>
        </div>
      ),
    },
    { 
      key: 'valeur', 
      header: 'Grade',
      render: (grade: Grade) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${getGradeColor(grade.valeur)}`}>
          <Award className="w-4 h-4" />
          {grade.valeur.toFixed(2)} / 20
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (grade: Grade) => (
        <div className="flex items-center gap-2">
          {canManageGrades && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditForm(grade)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setSelectedGrade(grade);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Grades"
        description="Manage student grades and academic performance"
        action={
          canManageGrades && (
            <Button onClick={openCreateForm} className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Assign Grade
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search grades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredGrades}
        keyExtractor={(grade) => grade.id}
        isLoading={isLoading}
        emptyMessage="No grades found"
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedGrade ? 'Edit Grade' : 'Assign New Grade'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="etudiantId">Student</Label>
              <Select
                value={formData.etudiantId.toString()}
                onValueChange={(value) => setFormData({ ...formData, etudiantId: parseInt(value) })}
                disabled={!!selectedGrade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.prenom} {student.nom} ({student.matricule})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coursId">Course</Label>
              <Select
                value={formData.coursId.toString()}
                onValueChange={(value) => setFormData({ ...formData, coursId: parseInt(value) })}
                disabled={!!selectedGrade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.titre} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valeur">Grade (0-20)</Label>
              <Input
                id="valeur"
                type="number"
                min={0}
                max={20}
                step={0.01}
                value={formData.valeur}
                onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-gradient"
                disabled={!formData.etudiantId || !formData.coursId}
              >
                {selectedGrade ? 'Update Grade' : 'Assign Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedGrade && deleteMutation.mutate(selectedGrade.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
