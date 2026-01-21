import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, ClipboardList, Award, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { studentsApi, trainersApi, coursesApi, registrationsApi, gradesApi } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
    enabled: user?.role === 'ADMIN' || user?.role === 'FORMATEUR',
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: trainersApi.getAll,
    enabled: user?.role === 'ADMIN',
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getAll,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations'],
    queryFn: registrationsApi.getAll,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: gradesApi.getAll,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title={`${getGreeting()}, ${user?.firstName}!`}
        description="Here's what's happening in your training center today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(user?.role === 'ADMIN' || user?.role === 'FORMATEUR') && (
          <StatCard
            title="Total Students"
            value={students.length}
            icon={GraduationCap}
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
        )}
        {user?.role === 'ADMIN' && (
          <StatCard
            title="Total Trainers"
            value={trainers.length}
            icon={Users}
            color="accent"
          />
        )}
        <StatCard
          title="Active Courses"
          value={courses.length}
          icon={BookOpen}
          color="success"
        />
        <StatCard
          title="Registrations"
          value={registrations.length}
          icon={ClipboardList}
          color="warning"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <motion.div 
          className="bg-card rounded-xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">Recent Courses</h3>
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{course.titre}</p>
                  <p className="text-sm text-muted-foreground">{course.code}</p>
                </div>
                {course.formateur && (
                  <span className="text-sm text-muted-foreground">
                    {course.formateur.nom}
                  </span>
                )}
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No courses available</p>
            )}
          </div>
        </motion.div>

        {/* Performance Overview */}
        <motion.div 
          className="bg-card rounded-xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">Quick Stats</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-accent" />
                <span>Total Grades Recorded</span>
              </div>
              <span className="font-bold text-lg">{grades.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-success" />
                <span>Active Registrations</span>
              </div>
              <span className="font-bold text-lg">
                {registrations.filter(r => r.statut === 'ACTIVE').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>Average Grade</span>
              </div>
              <span className="font-bold text-lg">
                {grades.length > 0 
                  ? (grades.reduce((sum, g) => sum + g.valeur, 0) / grades.length).toFixed(1)
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
