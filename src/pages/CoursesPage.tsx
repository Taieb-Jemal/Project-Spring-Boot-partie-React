import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { coursesApi, trainersApi } from '@/lib/api';
import { Course, CourseFormData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
    titre: '',
    description: '',
    credits: 3,
    heures: 40,
    formateurId: undefined,
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: trainersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Success', description: 'Course created successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create course' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseFormData }) => 
      coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Success', description: 'Course updated successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update course' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Success', description: 'Course deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedCourse(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete course' });
    },
  });

  const filteredCourses = courses.filter(course =>
    course.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedCourse(null);
    setFormData({ code: '', titre: '', description: '', credits: 3, heures: 40, formateurId: undefined });
    setIsFormOpen(true);
  };

  const openEditForm = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      code: course.code,
      titre: course.titre,
      description: course.description,
      credits: course.credits,
      heures: course.heures,
      formateurId: course.formateur?.id,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCourse(null);
    setFormData({ code: '', titre: '', description: '', credits: 3, heures: 40, formateurId: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    { 
      key: 'code', 
      header: 'Code',
      render: (course: Course) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {course.code}
        </span>
      ),
    },
    { key: 'titre', header: 'Title' },
    { 
      key: 'description', 
      header: 'Description',
      render: (course: Course) => (
        <span className="text-muted-foreground line-clamp-2 max-w-xs">
          {course.description}
        </span>
      ),
    },
    { 
      key: 'formateur', 
      header: 'Trainer',
      render: (course: Course) => (
        course.formateur ? (
          <span>{course.formateur.prenom} {course.formateur.nom}</span>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        )
      ),
    },
    { 
      key: 'credits', 
      header: 'Credits',
      render: (course: Course) => (
        <span className="font-medium">{course.credits || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditForm(course)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setSelectedCourse(course);
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
        title="Courses"
        description="Manage all available courses"
        action={
          user?.role === 'ADMIN' && (
            <Button onClick={openCreateForm} className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredCourses}
        keyExtractor={(course) => course.id}
        isLoading={isLoading}
        emptyMessage="No courses found"
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., JAVA101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formateurId">Trainer</Label>
                <Select
                  value={formData.formateurId?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, formateurId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id.toString()}>
                        {trainer.prenom} {trainer.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="titre">Title</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Course title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  value={formData.credits || ''}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heures">Hours</Label>
                <Input
                  id="heures"
                  type="number"
                  min={1}
                  value={formData.heures || ''}
                  onChange={(e) => setFormData({ ...formData, heures: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient">
                {selectedCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCourse?.titre}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCourse && deleteMutation.mutate(selectedCourse.id)}
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
