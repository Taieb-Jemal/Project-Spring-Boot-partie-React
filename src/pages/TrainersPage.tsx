import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { trainersApi } from '@/lib/api';
import { Trainer, TrainerFormData } from '@/types';

export default function TrainersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<TrainerFormData>({
    idFormateur: '',
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
  });

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: trainersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: trainersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast({ title: 'Success', description: 'Trainer created successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create trainer' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TrainerFormData }) => 
      trainersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast({ title: 'Success', description: 'Trainer updated successfully' });
      closeForm();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update trainer' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: trainersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast({ title: 'Success', description: 'Trainer deleted successfully' });
      setIsDeleteOpen(false);
      setSelectedTrainer(null);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete trainer' });
    },
  });

  const filteredTrainers = trainers.filter(trainer =>
    trainer.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialite.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateForm = () => {
    setSelectedTrainer(null);
    setFormData({ idFormateur: '', nom: '', prenom: '', email: '', specialite: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      idFormateur: trainer.idFormateur || '',
      nom: trainer.nom,
      prenom: trainer.prenom,
      email: trainer.email,
      specialite: trainer.specialite,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedTrainer(null);
    setFormData({ idFormateur: '', nom: '', prenom: '', email: '', specialite: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrainer) {
      updateMutation.mutate({ id: selectedTrainer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    { key: 'idFormateur', header: 'ID' },
    { key: 'nom', header: 'Last Name' },
    { key: 'prenom', header: 'First Name' },
    { key: 'email', header: 'Email' },
    { 
      key: 'specialite', 
      header: 'Specialty',
      render: (trainer: Trainer) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
          {trainer.specialite}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (trainer: Trainer) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditForm(trainer)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              setSelectedTrainer(trainer);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Trainers"
        description="Manage all trainers and their specialties"
        action={
          <Button onClick={openCreateForm} className="btn-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Trainer
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTrainers}
        keyExtractor={(trainer) => trainer.id}
        isLoading={isLoading}
        emptyMessage="No trainers found"
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTrainer ? 'Edit Trainer' : 'Add New Trainer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idFormateur">Trainer ID</Label>
              <Input
                id="idFormateur"
                value={formData.idFormateur}
                onChange={(e) => setFormData({ ...formData, idFormateur: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Last Name</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">First Name</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialite">Specialty</Label>
              <Input
                id="specialite"
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                placeholder="e.g., Java, Python, Web Development"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient">
                {selectedTrainer ? 'Save Changes' : 'Create Trainer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trainer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTrainer?.prenom} {selectedTrainer?.nom}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTrainer && deleteMutation.mutate(selectedTrainer.id)}
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
