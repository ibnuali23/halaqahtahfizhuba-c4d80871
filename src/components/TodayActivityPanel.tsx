import { motion } from 'framer-motion';
import { useTodayStats } from '@/hooks/useSetoranFeed';
import { BookOpen, UserCheck, Activity, Loader2 } from 'lucide-react';

export default function TodayActivityPanel() {
  const { data: stats, isLoading } = useTodayStats();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Aktivitas Hari Ini</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats?.setoranCount || 0}</p>
            <p className="text-xs text-muted-foreground">Setoran</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/5">
          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">{stats?.checkinCount || 0}</p>
            <p className="text-xs text-muted-foreground">Check-in Guru</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
