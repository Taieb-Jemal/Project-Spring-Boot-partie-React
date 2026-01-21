import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import { registrationsApi, studentsApi, coursesApi } from '@/lib/api';
import { Registration, RegistrationFormData, RegistrationStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const statusConfig: Record<RegistrationStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  ACTIVE: { label: 'Active', icon: Clock, className: 'bg-accent/10 text-accent' },
  COMPLETEE: { label: 'Completed', icon: CheckCircle, className: 'bg-success/10 text-success' },
  ANNULEE: { label: 'Cancelled', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function RegistrationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    etudiantId: 0,
    coursId: 0,
    statut: 'ACTIVE',
  });

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['registrations'],
    queryFn: registrationsApi.getAll,
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
    mutationFn: registrationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast({ title: 'Success', description: 'Registration created successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create registration' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: registrationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast({ title: 'Success', description: 'Registration cancelled successfully' });
      setIsDeleteOpen(false);
      setSelectedRegistration(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to cancel registration' });
    },
  });

  const filteredRegistrations = registrations.filter(reg =>
    reg.etudiant?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.etudiant?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.cours?.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.cours?.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setFormData({ etudiantId: 0, coursId: 0, statut: 'ACTIVE' });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ etudiantId: 0, coursId: 0, statut: 'ACTIVE' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns = [
    { 
      key: 'etudiant', 
      header: 'Student',
      render: (reg: Registration) => (
        <div>
          <p className="font-medium">{reg.etudiant?.prenom} {reg.etudiant?.nom}</p>
          <p className="text-sm text-muted-foreground">{reg.etudiant?.matricule}</p>
        </div>
      ),
    },
    { 
      key: 'cours', 
      header: 'Course',
      render: (reg: Registration) => (
        <div>
          <p className="font-medium">{reg.cours?.titre}</p>
          <p className="text-sm text-muted-foreground font-mono">{reg.cours?.code}</p>
        </div>
      ),
    },
    { 
      key: 'dateInscription', 
      header: 'Date',
      render: (reg: Registration) => (
        <span className="text-muted-foreground">
          {reg.dateInscription ? new Date(reg.dateInscription).toLocaleDateString() : '-'}
        </span>
      ),
    },
    { 
      key: 'statut', 
      header: 'Status',
      render: (reg: Registration) => {
        const config = statusConfig[reg.statut] || statusConfig.ACTIVE;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (reg: Registration) => (
        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' && reg.statut === 'ACTIVE' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setSelectedRegistration(reg);
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Registrations"
        description="Manage student course registrations"
        action={
          user?.role === 'ADMIN' && (
            <Button onClick={openCreateForm} className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Registration
            </Button>
          )
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search registrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredRegistrations}
        keyExtractor={(reg) => reg.id}
        isLoading={isLoading}
        emptyMessage="No registrations found"
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Registration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="etudiantId">Student</Label>
              <Select
                value={formData.etudiantId.toString()}
                onValueChange={(value) => setFormData({ ...formData, etudiantId: parseInt(value) })}
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-gradient"
                disabled={!formData.etudiantId || !formData.coursId}
              >
                Create Registration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this registration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Registration</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRegistration && deleteMutation.mutate(selectedRegistration.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
