import { Reminder } from '@/types/reminder';
import { ReminderCard } from './ReminderCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2 } from 'lucide-react';

interface ReminderListProps {
  activeReminders: Reminder[];
  completedReminders: Reminder[];
  onComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onDelete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  defaultSnoozeMinutes: number;
}

export function ReminderList({
  activeReminders,
  completedReminders,
  onComplete,
  onSnooze,
  onDelete,
  onEdit,
  defaultSnoozeMinutes,
}: ReminderListProps) {
  const hasAny = activeReminders.length > 0 || completedReminders.length > 0;

  if (!hasAny) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 px-6 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">No reminders yet</h2>
        <p className="text-sm text-muted-foreground max-w-[240px]">
          Tap the + Add button above to create your first reminder.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {activeReminders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Upcoming ({activeReminders.length})
          </h2>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {activeReminders.map((r, i) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  index={i}
                  onComplete={onComplete}
                  onSnooze={onSnooze}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  defaultSnoozeMinutes={defaultSnoozeMinutes}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {completedReminders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed ({completedReminders.length})
          </h2>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {completedReminders.map((r, i) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  index={i}
                  onComplete={onComplete}
                  onSnooze={onSnooze}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  defaultSnoozeMinutes={defaultSnoozeMinutes}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
